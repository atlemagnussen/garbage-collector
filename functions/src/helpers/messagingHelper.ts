import { SubscriptionMessage } from "@common/types/firebasetypes"
import admin from "./admin"
import calendarHelper from "./calendarHelper"
import firestore from "./firestore"
const db = firestore.getDb()
const MSGCOLNAME = "messages"

class MessagingHelper {
    getTokenChange(old: string, now: string): TokenChange | boolean {
        if (old !== now) {
            return { old, now }
        }
        return false
    }
    getAdressChanges(old: CalendarSpec[], now: CalendarSpec[]) {
        if (JSON.stringify(old) === JSON.stringify(now)) {
            return false
        }
        return { old, now }
    }
    getAddedAndOrDeleted(old: CalendarSpec[], now: CalendarSpec[]) {
        const ret: CalendarSpecChanged = {
            "removed": [],
            "added": []
        }
        if (this.isArrayWithContent(old) && !this.isArrayWithContent(now)) {
            ret.removed = old
            return ret
        }
        if (!this.isArrayWithContent(old) && this.isArrayWithContent(now)) {
            ret.added = now
            return ret
        }
        for (let i = 0; i < old.length; i++) {
            const add = old[i]
            if (!now.some((a) => a.municipality === add.municipality && a.address === add.address)) {
                ret.removed.push(add)
            }
        }
        for (let i = 0; i < now.length; i++) {
            const add = now[i]
            if (!old.some((a) => a.municipality === add.municipality && a.address === add.address)) {
                ret.added.push(add)
            }
        }
        return ret
    }
    isArrayWithContent(arr: any[]) {
        return arr && Array.isArray(arr) && arr.length > 0
    }
    getSubChanges(old: SubscriptionData, now: SubscriptionData) {
        let change: SubscriptionChanges = {
            "token": false,
            "calendars": false
        }
        change.token = this.getTokenChange(old.token!, now.token!)
        if (this.getAdressChanges(old.calendars, now.calendars)) {
            change.calendars = this.getAddedAndOrDeleted(old.calendars, now.calendars)
        }
        return change
    }
    async addMessage(subId: string, token: string, calSpec: CalendarSpec, lastDate?: FirebaseFirestore.Timestamp) {
        console.log(`Add message for subId '${subId}', token '${token}'`)
        if (lastDate) {
            const date = lastDate.toDate()
            console.log(`Lastdate ${date.toISOString()}`)
        } else 
            lastDate = admin.firestore.Timestamp.fromDate(new Date())

        const calendar = await calendarHelper.getCalendar(calSpec.municipality, calSpec.address)
        if (!calendar) {
            console.error(`Calendar ${calSpec.municipality}, ${calSpec.address} not found`)
            return null
        }
        const nextMsg = this.getNextMessage(calendar, lastDate)
        if (nextMsg) {
            nextMsg.subId = subId
            nextMsg.token = token
            nextMsg.municipality = calSpec.municipality
            nextMsg.address = calSpec.address
            return firestore.createOrUpdate(MSGCOLNAME, nextMsg)
        }
        console.error(`Not no message for ${calSpec.municipality}, ${calSpec.address}`)
        return false
    }
    getNextMessage(calendar: CalendarData, lastDate: FirebaseFirestore.Timestamp) {
        const next = calendarHelper.getNextEvent(calendar, lastDate)
        if (!next || next.length === 0) {
            console.error(`No next dates found for ${calendar.municipality}, ${calendar.address}`)
            return false
        }
        const date = admin.firestore.Timestamp.fromDate(next[0].date)
        const msgDate = this.getMessageDate(date)
        const types = next.map((n) => n.type)
        const msg: SubscriptionMessage = {
            date,
            msgDate,
            types
        }
        return msg
    }
    async removeMessages(subId: string, token: string, add: CalendarSpec) {
        console.log(`Remove messages for subId '${subId}', token '${token}'`)
        const msgs = await this.findMessages(subId, add.municipality, add.address)
        for (let i = 0; i < msgs.length; i++) {
            const idToDel = msgs[i]._id
            await firestore.delete(MSGCOLNAME, idToDel!)
        }
        return "remove here"
    }

    async findMessages(subId: string, municipality: string, address: string) {
        console.log(`findMessages: subId='${subId}', municipality='${municipality}', address='${address}'`)
        const colRef = db.collection(MSGCOLNAME)
        const allDocRefs = await colRef.where('subId', '==', subId).
            where("municipality", "==", municipality).
            where("address", "==", address).
            get()
        const all: SubscriptionMessage[] = []
        console.log(`allDocRefs.docs.length=${allDocRefs.docs.length}`)
        allDocRefs.forEach((d) => {
            const doc = d.data() as SubscriptionMessage
            doc._id = d.id
            all.push(doc)
        })
        return all
    }

    getMessageDate(d: FirebaseFirestore.Timestamp) {
        const date = d.toDate()
        const dateMsg = new Date(date)
        dateMsg.setDate(dateMsg.getDate() - 1)
        this.setTimeToZero(dateMsg)
        dateMsg.setHours(17)
        return admin.firestore.Timestamp.fromDate(dateMsg)
    }
    setTimeToZero(d: Date) {
        d.setHours(0)
        d.setMinutes(0)
        d.setSeconds(0)
        d.setMilliseconds(0)
    }

    async sendMsg(msg: SubscriptionMessage) {
        let sent: string[] = []
        for (let i = 0; i < msg.types.length; i++) {
            const type = msg.types[i]
            const date = msg.date as FirebaseFirestore.Timestamp
            const data: FirebaseCloudMessageData = {
                type,
                date: date.toDate().toISOString(),
                municipality: msg.municipality!,
                address: msg.address!,
                id: ""
            }

            let fcm: admin.messaging.Message = {
                data,
                token: msg.token!
            }

            const response = await admin.messaging().send(fcm)
            sent.push(response)
            console.log('Successfully sent message:', response)
        }
        return sent
    }
    async deleteAndCreateNextMsg(msg: SubscriptionMessage) {
        await firestore.delete(MSGCOLNAME, msg._id!)
        console.log(`Deleted msg id '${msg._id!}'`)
        const calSpec: CalendarSpec = { "municipality": msg.municipality!, "address": msg.address! }
        await this.addMessage(msg.subId!, msg.token!, calSpec, msg.date)
        return true
    }
    async deleteMsg(id: string) {
        await firestore.delete(MSGCOLNAME, id)
        console.log(`Deleted msg id '${id}'`)
    }
    async getMsgsDue(d?: Date) {
        let date = d
        if (!d) {
            date = new Date()
        }
        console.log("Check and send")
        const messages = db.collection(MSGCOLNAME)
        const msgsDue = messages.where("msgDate", "<=", date)
        const snaps = await msgsDue.get()
        const arr: SubscriptionMessage[] = []
        snaps.forEach((s) => {
            const data = s.data() as SubscriptionMessage
            data._id = s.id
            arr.push(data)
        })
        return arr
    }
    async updateTokensOnMsgs(subId: string, token: string) {
        const msgs = await this.getCurrentMsgForSub(subId)
        if (!msgs || msgs.length === 0) {
            console.log(`No messages for ${subId}`)
            return false
        }
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i]
            if (msg.token !== token) {
                console.log(`Correcting for msg id '${msg._id}'`)
                msg.token = token
                await firestore.createOrUpdate(MSGCOLNAME, msg, msg._id)
            }
        }
        return true
    }
    async getCurrentMsgForSub(subId: string) {
        console.log(`subId=${subId}`)
        const msgs = db.collection(MSGCOLNAME)
        const msgsSub = msgs.where("subId", "==", subId)
        const snaps = await msgsSub.get()
        const arr: SubscriptionMessage[] = []
        snaps.forEach((s) => {
            const data = s.data() as SubscriptionMessage
            // const dateISO = data.date.toDate().toISOString()
            // const msgDateISO = data.msgDate.toDate().toISOString()
            // Reflect.deleteProperty(data, "date")
            // data.date = dateISO
            // Reflect.deleteProperty(data, "msgDate")
            // data.msgDate = msgDateISO
            data._id = s.id
            arr.push(data)
        })
        return arr
    }
    async updateMsg(msg: SubscriptionMessage, id: string) {
        console.log(`update msg with id=${id}`)
        firestore.createOrUpdate(MSGCOLNAME, msg, id)
    }
}

export default new MessagingHelper()

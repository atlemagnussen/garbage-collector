import admin from "./helpers/admin"
import helper from "./helpers/messagingHelper"
import subHelper from "./helpers/subscriptionHelper"
import * as functions from "firebase-functions"
import { SubscriptionMessage } from "@common/types/firebasetypes"
import { CalendarSpecChanged, FirebaseCloudMessage, FirebaseSentMessages, SubscriptionData } from "@common/types/interfaces"
 
/*
    Check for due messages and Send
    then delete and create next message for same subscription and calendar
*/
const checkAndSend = async () => {
    let ret: FirebaseSentMessages = {
        count: 0,
        success: true,
        fcms: []
    }
    const msgsDue = await helper.getMsgsDue()
    ret.count = msgsDue.length
    for (let i = 0; i < msgsDue.length; i++) {
        let msg: SubscriptionMessage | null = null
        try {
            msg = msgsDue[i]
            console.log(`Handle msg id ${msg._id}`)
            const sub = await subHelper.getSubById(msg.subId!)
            if (sub && msg.token !== sub.token) {
                console.log(`Token mismatch for msg on subId ${msg.subId}, change`)
                console.log(`Old='${msg.token}', new='${sub.token}'`)
                if (sub.token && sub.token.length > 10) {
                    msg.token = sub.token
                } else {
                    console.warn(`New token was strangely not present or too short, leaving the old`)
                }
            }
            const sent = await helper.sendMsg(msg)
            const next = await helper.deleteAndCreateNextMsg(msg)
            console.log(`Deleted and created next, success='${next}'`)
            ret.fcms.push(...sent)
        } catch (err) {
            console.log(`Error occured when looping through msgs, i=${i} of total length ${msgsDue.length}`)
            console.error(err)
            if (msg) {
                if (msg.failedAttempts) {
                    msg.failedAttempts += 1
                } else {
                    msg.failedAttempts = 1
                }
                if (msg.failedAttempts > 5) {
                    helper.deleteMsg(msg._id!)
                } else {
                    helper.updateMsg(msg, msg._id!)
                    ret.success = false
                }
            }
        }
    }
    return ret
}

export const checkAndSendSub = async (message: functions.pubsub.Message, context: functions.EventContext) => {
    console.log(message.json)
    try {
        const response = await checkAndSend()
        console.log('Successfully checked for messages:', response)
    } catch (error) {
        console.log('Error checked message:', error)
    }
}

// export const ensureNextMsg = async() => {
//     const subs = await subHelper.getAllSubscriptions()
//     for (let i=0; i<subs.length; i++) {
//         const sub = subs[i]
//         if (sub.calendars && sub.calendars.length > 0) {
//             sub.calendars.map(cal => {
//                 const msgExisting = helper.getMsgExistingforCalendar()
//                 cal
//             })
//         }
//     }
// }

/*
    test send message
*/
export const testMessage = async (req: functions.https.Request, res: functions.Response<any>) => {
    let message: FirebaseCloudMessage = {
        data: {
            type: "rest",
            date: new Date().toISOString(),
            municipality: "test1",
            address: "test2",
            id: ""
        },
        token: ""
    }
    if (req.body.token) {
        message.token = req.body.token

        if (req.body.type) {
            message.data.type = req.body.type
        }
        if (req.body.municipality) {
            message.data.municipality = req.body.municipality
        }
        if (req.body.address) {
            message.data.address = req.body.address
        }
        try {
            const response = await admin.messaging().send(message)
            console.log('Successfully sent message:', response)
            res.json(message)
        } catch (error) {
            console.log('Error sending message:', error)
            res.json({"msg": JSON.stringify(error)})
        }
    } else {
        res.json({"msg": "need tok"})
        res.end()
    }
}

/*
    on created subscription pub sub
    create messages
*/
export const createdSub = async (snapshot: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const newSubscription = snapshot.data() as SubscriptionData
    console.log(`sub created, subId='${context.params.subId}`)
    const subId = context.params.subId
    const token = newSubscription.token
    const calendars = newSubscription.calendars
    console.log(JSON.stringify(calendars))
    console.log("START adding messages for subscription")
    for (let i = 0; i < calendars.length; i++) {
        const calendar = calendars[i]
        await helper.addMessage(subId, token!, calendar)
    }
    console.log("END adding messages for subscription")
    return true
}

/*
    on updated subscription pub sub
    create messages
*/
export const updatedSub = async (change: functions.Change<functions.firestore.QueryDocumentSnapshot>, context: functions.EventContext) => {
    const old = change.before.data() as SubscriptionData
    const now = change.after.data() as SubscriptionData
    const subId = context.params.subId
    const tokenNow = now.token
    console.log(`sub updated, subId='${subId}', tokenNow='${tokenNow}'`)

    const changed = helper.getSubChanges(old, now)

    if (changed.token) {
        console.log("Token changed, update on existing messages")
        const res = await helper.updateTokensOnMsgs(subId, tokenNow!)
        if (res) {
            console.log("token was updated on one or more msgs")
        }
    }
    if (changed.calendars) {
        console.log("calendars added or removed on subscription, add messages")
        if ((changed.calendars as CalendarSpecChanged).added) {
            const added = (changed.calendars as CalendarSpecChanged).added
            console.log(`calendars added length:${added.length}`)
            for (let i = 0; i < added.length; i++) {
                const cal = added[i]
                await helper.addMessage(subId, tokenNow!, cal)
            }
        }
        if ((changed.calendars as CalendarSpecChanged).removed) {
            const removed = (changed.calendars as CalendarSpecChanged).removed
            console.log(`calendars removed length:${removed.length}`)
            for (let i = 0; i < removed.length; i++) {
                const cal = removed[i]
                await helper.removeMessages(subId, tokenNow!, cal)
            }
        }
    }
    return true
}

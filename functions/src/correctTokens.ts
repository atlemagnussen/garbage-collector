import firestore from "./helpers/firestore"
import  msgHelper from "./helpers/messagingHelper"
const SUBCOLNAME = "subscription"
class Tokens {
    async checkIfHasWrongTokenOnMsgs(subId: string) {
        const msgs = await msgHelper.getCurrentMsgForSub(subId)
        if (!msgs || msgs.length === 0) {
            console.log(`No messages for ${subId}`)
            return false
        }
        const sub = await firestore.get(SUBCOLNAME, subId) as Subscription
        if (!sub) {
            console.log(`No sub for ${subId}`)
            return false
        }
        const wrongs = []
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i]
            if (msg.token !== sub.token) {
                wrongs.push(msg._id)
            }
        }
        return wrongs.length > 0 ? wrongs : false
    }

    async correctDateBug(subId: string) {
        const msgs = await msgHelper.getCurrentMsgForSub(subId)
        if (!msgs || msgs.length === 0) {
            console.log(`No messages for ${subId}`)
            return false
        }
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i]
            console.log(`Correcting for msg id '${msg._id}'`)
            const date = new Date(msg.date)
            msg.date = date
            const msgDate = new Date(msg.msgDate)
            msg.msgDate = msgDate
            // await firestore.createOrUpdate(MSGCOLNAME, msg, msg._id)
        }
        return true
    }
}

(async () => {
    const tokens = new Tokens()
    const subId = "Ikmq6DIwBg2xxIVadv3U"
    const res = await tokens.checkIfHasWrongTokenOnMsgs(subId)
    if (res) {
        console.log("errors found:")
    } else {
        console.log("no errors")
    }
})()

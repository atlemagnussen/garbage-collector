// import helper from "./helpers/calendarHelper"
// import firestore from "./helpers/firestore"
import  msgHelper from "./helpers/messagingHelper"
// const calSpec: CalendarSpec = {
//     "municipality": "stavanger",
//     "address": "otto olsens gate 44"
// }

(async () => {
    // const d = await helper.getNextEvent(cal)
    // console.log(JSON.stringify(d, null, 4))
    // const m = await msgHelper.getNextMessage(cal)
    // console.log(JSON.stringify(m, null, 4))
    // const date = new Date(2019, 3, 1, 19, 0)
    // console.log(date.toISOString())
    // const d = await msgHelper.getMsgsDue(date)
    // console.log(JSON.stringify(d, null, 4))
    // const lastDate = new Date(Date.UTC(2019, 3, 2))
    // const calendar = await helper.getCalendar(calSpec.municipality, calSpec.address)
    // const nextMsg = msgHelper.getNextMessage(calendar, lastDate)
    // console.log(JSON.stringify(nextMsg, null, 4))
    const subId = "Ikmq6DIwBg2xxIVadv3U"
    const d = await msgHelper.getCurrentMsgForSub(subId)
    console.log(JSON.stringify(d, null, 4))
    // const sub = await firestore.get('subscription', subId)
    // console.log(JSON.stringify(sub, null, 4))
})()

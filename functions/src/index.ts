
import * as functions from "firebase-functions"
import cal from "./calendar"
import lang from "./language"
import mun from "./municipality"
import sub from "./subscription"
import * as msg from "./messaging"

const extraMemory: functions.RuntimeOptions = {
    timeoutSeconds: 300,
    memory: "1GB"
}
const region = "europe-west1"
const functionsRegion = functions.region(region)
const httpOnRequest = functionsRegion.https.onRequest

export const getCalendar = functions
    .runWith(extraMemory)
    .region(region)
    .https.onRequest(cal.get)

export const getLanguage = httpOnRequest(lang.get)
export const getMunicipality = httpOnRequest(mun.get)
export const subscribe = httpOnRequest(sub.subscribe)
export const unsubscribe = httpOnRequest(sub.unsubscribe)
export const subscriptions = httpOnRequest(sub.getSubscriptions)
export const updatesubtoken = httpOnRequest(sub.updateSubToken)
// checking and sending due messages, triggered by Google cloud scheduler
export const checkAndSendSub = functionsRegion.pubsub.topic("fcm-garbage").onPublish(msg.checkAndSendSub)
// triggered on updates of subscriptions
export const createdSub = functionsRegion.firestore.document("subscription/{subId}").onCreate(msg.createdSub)
export const updateSub = functionsRegion.firestore.document("subscription/{subId}").onUpdate(msg.updatedSub)

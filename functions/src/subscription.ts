import admin from "./helpers/admin"
import * as functions from "firebase-functions"
import helper from "./helpers/subscriptionHelper"
import { FirebaseCloudMessage } from "@common/types/interfaces"

const cors = (res: functions.Response<any>) => {
    res.set('Access-Control-Allow-Origin', 'https://www.avfallsrute.no')
    res.set("Access-Control-Allow-Credentials", "true")
    res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
}

export const subscribe = async (req: functions.https.Request, res: functions.Response<any>) => {
    cors(res)
    if (!req.body.token) {
        res.json({"error": "token is missing"})
        res.end()
        return
    }
    if (!req.body.municipality) {
        res.json({"error": "municipality is missing"})
        res.end()
        return
    }
    if (!req.body.municipality) {
        res.json({"address": "address is missing"})
        res.end()
        return
    }
    let id = null
    if (req.body.id) {
        id = req.body.id
    }
    const token = req.body.token
    const municipality = req.body.municipality
    const address = req.body.address
    console.log(`subscribe ${municipality}, ${address}`)

    const idOut = await helper.addToOrCreateSub(token, municipality, address, id)

    const message: FirebaseCloudMessage = {
        "data": {
            type: "subscribed",
            municipality,
            address,
            id: idOut!
        },
        token
    }
    try {
        const response = await admin.messaging().send(message)
        console.log('Successfully sent message:', response)
    } catch (error) {
        console.log('Error sending message:', error)
    }
    res.json(message.data)
}

export const unsubscribe = async (req: functions.https.Request, res: functions.Response<any>) => {
    cors(res)
    if (!req.body.token) {
        res.json({"error": "token is missing"})
        res.end()
        return
    }
    if (!req.body.municipality) {
        res.json({"error": "municipality is missing"})
        res.end()
        return
    }
    if (!req.body.municipality) {
        res.json({"address": "address is missing"})
        res.end()
        return
    }
    let id = null
    if (req.body.id) {
        id = req.body.id
    }
    const token = req.body.token
    const municipality = req.body.municipality
    const address = req.body.address
    console.log(`unsubscribe ${municipality}, ${address}. Id='${id}'`)

    const idOut = await helper.removeSub(token, municipality, address, id)

    const message: FirebaseCloudMessage = {
        "data": {
            type: "unsubscribed",
            municipality,
            address,
            "id": idOut!
        },
        token
    }

    try {
        const response = await admin.messaging().send(message)
        console.log('Successfully sent message:', response)
    } catch (error) {
        console.log('Error sending message:', error)
    }
    res.json(message.data)
}

export const getSubscriptions = async (req: functions.https.Request, res: functions.Response<any>) => {
    cors(res)
    if (!req.body.token) {
        res.json({"error": "token is missing"})
        res.end()
        return
    }
    let id = null
    if (req.body.id) {
        id = req.body.id
    }
    const token = req.body.token
    const exists = await helper.getSub(token, id)
    res.json(exists)
}
export const updateSubToken = async(req: functions.https.Request, res: functions.Response<any>) => {
    cors(res)
    if (!req.body.token || !req.body.id) {
        res.json({"error": "tokenorid is missing"})
        res.end()
        return
    }
    const token = req.body.token
    const id = req.body.id
    const result = await helper.updateToken(id, token)
    res.json(result)
}


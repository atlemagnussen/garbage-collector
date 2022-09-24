import admin from "./helpers/admin"
import * as functions from "firebase-functions"
import helper from "./helpers/subscriptionHelper"
import { FirebaseCloudMessage } from "@common/types/interfaces"
import cors from "cors"

const corsFunc = cors({
    origin: "https://www.avfallsrute.no"
})

// const cors = (res: functions.Response<any>) => {
//     res.set('Access-Control-Allow-Origin', 'https://www.avfallsrute.no')
//     res.set("Access-Control-Allow-Credentials", "true")
//     res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
//     res.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
// }

export const subscribe = async (req: functions.https.Request, res: functions.Response<any>) => {
    functions.logger.info("subscribe method")
    corsFunc(req, res, async () => {
        const token = req.body.token
        const municipality = req.body.municipality
        const address = req.body.address
        const data = {token, municipality, address}
    
        if (!validate(data, res))
            return
        
        let id = null
        if (req.body.id) {
            id = req.body.id
        }
        
        functions.logger.info(`subscribe ${municipality}, ${address}`)
    
        const idOut = await helper.addToOrCreateSub(token, municipality, address, id)
        functions.logger.info("added subscription, idOut=", idOut)
        const message: FirebaseCloudMessage = {
            "data": {
                type: "subscribed",
                municipality,
                address,
                "id": idOut ?? "no-id"
            },
            token
        }
        try {
            const response = await admin.messaging().send(message)
            functions.logger.info('Successfully sent message:', response)
        } catch (error) {
            functions.logger.error('Error sending message:', error)
        }
        res.status(200).json(message.data)
    })
}

export const unsubscribe = async (req: functions.https.Request, res: functions.Response<any>) => {
    functions.logger.info("unsubscribe")

    corsFunc(req, res, async () => {
        const token = req.body.token
        const municipality = req.body.municipality
        const address = req.body.address
    
        const data = {token, municipality, address}
        functions.logger.info("data", data)

        if (!validate(data, res))
            return
    
        let id = null
        if (req.body.id) {
            id = req.body.id
        }
        
        functions.logger.info(`unsubscribe ${municipality}, ${address}. Id='${id}'`)

        const idOut = await helper.removeSub(token, municipality, address, id)
        functions.logger.info("unsubscribed")

        const message: FirebaseCloudMessage = {
            "data": {
                type: "unsubscribed",
                municipality,
                address,
                "id": idOut ?? "no-id"
            },
            token
        }

        try {
            const response = await admin.messaging().send(message)
            functions.logger.info('Successfully sent message:', response)
        } catch (error) {
            functions.logger.error('Error sending message:', error)
        }
        res.status(200).json(message.data)
    })
}

const validate = (body: any, res: functions.Response<any>) => {
    
    let error = ""
    if (!body.token)
        error = `${error} token is missing`
    
    if (!body.municipality)
        error = `${error} municipality is missing`
    
    if (!body.address)
        error = `${error} address is missing`
    
    if (error) {
        functions.logger.warn("error validation", error)
        res.status(400).json({error})
        res.end()
        return false
    }
    return true
}

export const getSubscriptions = async (req: functions.https.Request, res: functions.Response<any>) => {
    
    corsFunc(req, res, async () => {
        if (!req.body.token) {
            res.status(400).json({"error": "token is missing"})
            res.end()
            return
        }
        let id = null
        if (req.body.id) {
            id = req.body.id
        }
        const token = req.body.token
        const exists = await helper.getSub(token, id)
        res.status(200).json(exists)
    })
    
}
export const updateSubToken = async(req: functions.https.Request, res: functions.Response<any>) => {
    
    corsFunc(req, res, async () => {
        if (!req.body.token || !req.body.id) {
            res.status(400).json({"error": "tokenorid is missing"})
            res.end()
            return
        }
        const token = req.body.token
        const id = req.body.id
        const result = await helper.updateToken(id, token)
        res.status(200).json(result)
    })
    
}
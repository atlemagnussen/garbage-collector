import  firestore from "./helpers/firestore"
const db = firestore.getDb()
import escapeHtml from "escape-html"
import * as functions from "firebase-functions"

export const getLang = async (req: functions.https.Request, res: functions.Response<any>) => {
    res.set('Access-Control-Allow-Origin', 'https://www.avfallsrute.no')
    let response: MunicipalityRespons | any = {
        "result": "0"
    }
    if (req.query.langcode) {
        const langcode = `${escapeHtml(req.query.langcode as string)}`
        const colRef = db.collection("language")
        const docRef = colRef.doc(langcode)
        const doc = await docRef.get()
        if (doc.exists) {
            response = doc.data()
        } else {
            response.result = `no lang for ${langcode}`
        }
        res.json(response)
    } else {
        res.json({"msg": "specify langcode"})
    }
}

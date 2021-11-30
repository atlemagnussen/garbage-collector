import firestore from "./helpers/firestore"
import * as functions from "firebase-functions"
const db = firestore.getDb()
import escapeHtml from "escape-html"

export const getMuns = async (req: functions.https.Request, res: functions.Response<any>) => {
    res.set('Access-Control-Allow-Origin', 'https://www.avfallsrute.no')
    let name = null
    if (req.query.name) {
        name = `${escapeHtml(req.query.name as string)}`.toLowerCase()
        console.log(`name=${name}`)
    }
    let response:MunicipalityRespons | Municipality[] = {
        "result": "0"
    }
    let colRef = null
    if (name) {
        colRef = db.collection("municipalities").where("name", "==", name)
        const docs = await colRef.get()
        if (docs.docs.length === 0) {
            res.json(response)
        } else if (docs.docs.length > 1) {
            res.json({"error": `multiple ${name} municipalities found`})
        } else {
            docs.forEach((doc) => {
                const data = doc.data()
                res.json(data)
            })
        }
    } else {
        colRef = db.collection("municipalities")
        const docs = await colRef.get()

        if (docs.docs.length === 0) {
            response.result = "nothing found"
        } else {
            const arr: Municipality[] = []
            docs.forEach((doc) => {
                const data = doc.data() as Municipality
                arr.push(data)
            });
            response = arr
        }
        res.json(response)
    }
}

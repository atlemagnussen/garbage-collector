import escapeHtml from "escape-html"
import helper from "./helpers/calendarHelper"
import ripper from "./helpers/calendarRipper"
import * as functions from "firebase-functions"

export const getCalendar = async (req: functions.https.Request, res: functions.Response<any>) => {
    res.set("Access-Control-Allow-Origin", "https://www.avfallsrute.no")
    let response: MunicipalityRespons | CalendarData = { 
        result: "0"
    }

    if (!req.query.municipality || !req.query.address) {
        response.result = "missing params"
        res.json(response)
        res.end()
        return
    }
    try {
        if (req.query.municipality && req.query.address) {
            const municipality = `${escapeHtml(req.query.municipality as string)}`.toLowerCase()
            const address = `${escapeHtml(req.query.address as string)}`.toLowerCase()
            console.log(`municipality=${municipality}`)
            console.log(`address=${address}`)
            const doc = await helper.getCalendar(municipality, address)
            if (doc) {
                response = doc
            } else {
                // try get it from remote
                console.log("Could not find in firebase, try to rip it")
                const remote = await ripper.getAndStore(municipality, address)
                if (remote) {
                    response = remote
                } else {
                    response.result = "nothing found"
                }
            }
        }
        

        
    } catch (err) {
        //@ts-ignore
        response.result = err
    }

    res.json(response)
}

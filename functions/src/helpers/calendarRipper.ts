import converterSvg from "../converters/converter-svg"
import converterSandnes from "../converters/converter-sandnes"
import firestore from "./firestore"
const db = firestore.getDb()
import comparer from "./comparer"
import { CalendarData, IConverter } from "@common/types/interfaces"

class Data {
    async getAndStore(municipality: string, address: string, y?: string) {
        console.log("Try to rip it")
        let year = y
        if (!year) {
            year = `${new Date().getFullYear()}`
        }
        const calendarRemote = await this.getRemote(municipality, address)
        if (calendarRemote) {
            console.log("Remote found")
            const existing = await this.exists(municipality, calendarRemote, year)
            if (existing) {
                console.log("Existing found")
                await this.appendAddress(municipality, existing, address)
                return existing
            }
            console.log("Existing not found, create")
            const result = await this.create(municipality, address, year, calendarRemote)
            console.log(result)
            return calendarRemote
        }
        return null
    }

    async create(municipality: string, address: string, year: string, calendar: CalendarData) {
        if (year !== calendar.year) {
            throw new Error(`Year now ${year} and year on calendar ${calendar.year} is different`)
        }
        Reflect.deleteProperty(calendar, "_id")
        Reflect.deleteProperty(calendar, "address")
        Reflect.deleteProperty(calendar, "municipality")
        calendar.hash = comparer.hashCalendar(calendar)
        calendar.address = [address]
        const orderedCal = comparer.orderObject(calendar)
        const res = firestore.createOrUpdate(municipality, orderedCal)
        return res
    }

    appendAddress(municipality: string, existing: CalendarData, address: string) {
        existing.address.push(address)
        const ordered = comparer.orderObject(existing)
        const id = ordered._id
        console.log(`Updating id:${id}`)
        Reflect.deleteProperty(ordered, "_id")
        const res = firestore.createOrUpdate(municipality, ordered, id)
        return res
    }

    async exists(municipality: string, calendar: CalendarData, year: string) {
        const all = await this.getAll(municipality, year)
        console.log(`Calendars found for ${year}: ${all.length}`)
        if (all && Array.isArray(all) && all.length > 0) {
            for (let i = 0; i < all.length; i++) {
                const existing = all[i]
                if (comparer.isSame(calendar, existing)) {
                    return existing
                }
            }
        }

        return null
    }

    async getAll(municipality: string, year: string) {
        const colRef = db.collection(municipality)
        const docRef = colRef.where("year", "==", year)
        const docs = await docRef.get()
        const arr: CalendarData[] = []
        if (docs.docs.length > 0) {
            for (let i = 0; i < docs.docs.length; i++) {
                const doc = docs.docs[i]
                const data = doc.data() as CalendarData
                data._id = doc.id
                arr.push(data)
            }
        }
        return arr
    }

    async getRemote(municipality: string, address: string): Promise<CalendarData | null> {
        // const year = y ? y : `${new Date().getFullYear()}`
        // const municipalityLowerCase = municipality.toLowerCase()
        const addressLowerCase = address.toLowerCase()

        try {
            const converter = this.getConverter(municipality, address)
            const convertData = await converter?.get(addressLowerCase)
            if (convertData && !convertData.isEmpty) {
                return convertData
            }
            console.log("Could not get any data")
        } catch (err) {
            console.error(err)
        }
        return null
    }
    getConverter(municipality: string, address: string): IConverter | null {
        switch (municipality) {
            case "stavanger":
                return new converterSvg(address)
            case "sandnes":
                return converterSandnes
            default:
                return null
        }
    }
}

export default new Data()

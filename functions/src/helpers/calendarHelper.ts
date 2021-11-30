import firestoreCrud from "./firestore"

const db = firestoreCrud.getDb()

class CalendarHelper {
    async getCalendar(municipality: string, address: string, y?: string): Promise<CalendarData | null> {
        let year = y
        if (!y) {
            year = `${new Date().getFullYear()}`
        }
        address = address.split("-").join(" ") // if they are dashed
        console.log(`getCalendar: municipality='${municipality}', address='${address}', year=${year}`)
        const colRef = db.collection(municipality)
        const docRef = colRef.where("address", "array-contains", address).where("year", "==", year)
        const docs = await docRef.get()
        console.log(`docs.docs.length=${docs.docs.length}`)
        if (docs.docs.length === 0) {
            return null
        }
        if (docs.docs.length === 1) {
            const doc = docs.docs[0]
            const data = doc.data() as CalendarData
            data._id = doc.id
            return data
        }
        throw new Error(`Multiple calendars found by address '${address}', year '${year}'`)
    }

    getNextEvent(calendar: CalendarData, lastDate: FirebaseFirestore.Timestamp) {
        let filterDate = new Date()
        if (lastDate) {
            filterDate = lastDate.toDate()
        }
        const sorted = this.getEventsSortedByDate(calendar)
        const filtered = sorted.filter(s => s.date > filterDate)
        const next = filtered[0] // might be many on same date
        const nextArr = filtered.filter(f => f.date.getTime() === next.date.getTime())
        return nextArr
    }
    getEventsSortedByDate(calendar: CalendarData) {
        const types: GarbageType[] = ["rest", "paper", "food", "xmasTree"]
        const typeDates: TypeDate[] = []
        types.forEach(type => {
            if (calendar[type] && Array.isArray(calendar[type])) {
                const tdates = calendar[type]
                tdates.forEach(td => {
                    const md = td.split("-")
                    if (md.length === 2) {
                        const yy = parseInt(calendar.year)
                        const mm = parseInt(md[0])
                        const dd = parseInt(md[1])
                        const date = new Date(Date.UTC(yy, mm, dd))
                        typeDates.push({ type, date })
                    } else {
                        console.error(`Has not day and month: ${md}`)
                    }
                })
            }
        })
        typeDates.sort((a, b) => {
            if (a.date < b.date) {
                return -1
            }
            if (a.date > b.date) {
                return 1
            }
            return 0
        })
        return typeDates
    }
}

export default new CalendarHelper()

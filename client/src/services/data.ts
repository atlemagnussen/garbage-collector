import { collection, query, where, getDocs, getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import type { DocumentData } from "firebase/firestore/lite"
import calendar from "@app/services/calendar"
import { firebaseApp } from "@app/services/firebaseInit"
import { api } from "@app/config"
import { CalendarData, CalendarEvent, CalendarEventsData, GarbageType } from "@common/types/interfaces"

const firebaseDb = getFirestore(firebaseApp)
enableIndexedDbPersistence(firebaseDb)
  .catch((err) => {
    //   if (err.code == 'failed-precondition') {
    //   } else if (err.code == 'unimplemented') {
    //   }
    console.error(err)
})
class Data {
    private cachable: Array<string> = []
    private cacheName = "data-cache-v1"
    private cacheEnabled = false
    
    constructor() {
        this.init()
    }
    async init() {
        try {
            const cache = await caches.open(this.cacheName)
            if (typeof cache.add === "function") {
                this.cacheEnabled = true
            }
            this.setSubscribingCalendarsCachable()
        } catch (err) {
            console.log(`Cache probably not available:\n${err}`)
        }
    }
    async setSubscribingCalendarsCachable() {
        console.log("disabled")
    }
    isCachable(url: string) {
        return this.cachable.includes(url)
    }

    async getCalendarRawData(m: string, a: string, y?: string) {
        let year:string = y as string
        if (!y) {
            year = `${new Date().getFullYear()}`
        }
        const dataFirestore = await this.getCalendarFirestore(m, a, year)
        if (dataFirestore)
            return dataFirestore

        const dataRemote = this.getCalendarRemote(m, a)
        if (dataRemote)
            return dataRemote

        return null
    }
    async getCalendarFirestore(m:string, a:string, y: string) {
        const colRef = collection(firebaseDb, m)
        //const citySnapshot = await getDocs(colRef)

        const q = query(colRef, where("address", "array-contains", a), where("year", "==", y))

        const snapshot = await getDocs(q)
        if (snapshot.docs.length === 0) {
            return null
        }
        
        // querySnapshot.forEach((doc) => {
        //     console.log(doc.id, " => ", doc.data())
        // })
        //const docRef = colRef.where("address", "array-contains", a).where("year", "==", y);
        //const docs = await docRef.get();
        
        if (snapshot.docs.length === 1) {
            const doc = snapshot.docs[0]
            const data = doc.data()
            data._id = doc.id
            return data
        }
        throw new Error(`Multiple calendars found by address '${a}', year '${y}'`)
    }

    async getCalendarRemote(municipality: string, address: string) {
        const url = `${api.calendar}?municipality=${municipality}&address=${address}`
        const data = await this.getJsonData(url)
        return data
    }

    async getCalendar(municipality: string, address: string) {
        const data = await this.getCalendarRawData(municipality, address)
        if (data) {
            const transformed = this.transformDataForCalendar(data, municipality, address)
            return transformed
        }
        return data
    }

    transformDataForCalendar(d: CalendarData, municipality: string, address: string): CalendarEventsData {
        if (!d) {
            throw new Error("no garbage collection data")
        }
        if (!d.food) {
            throw new Error("no food garbage collection data")
        }
        if (!d.rest) {
            throw new Error("no rest garbage collection data")
        }
        if (!d.paper) {
            throw new Error("no paper garbage collection data")
        }
        if (!d.xmasTree) {
            throw new Error("no xmastree collection data")
        }

        const year = parseInt(d.year)
        const restEvents = this.createEvents(d.year, d.rest, "rest", "black")
        const foodEvents = this.createEvents(d.year, d.food, "food", "brown")
        const paperEvents = this.createEvents(d.year, d.paper, "paper", "green")
        const xmasTreeEvents = this.createEvents(d.year, d.xmasTree, "xmasTree", "red")
        const garbageEvents = restEvents
            .concat(foodEvents)
            .concat(paperEvents)
            .concat(xmasTreeEvents)
        
        return {year, garbageEvents, municipality, address}
    }

    createEvents(year:string, arr:Array<string>, type: GarbageType, color:string) {
        const events = []
        for (let i = 0; i < arr.length; i++) {
            const event: CalendarEvent = { type, color, date: new Date() }
            const date = calendar.getDateFromMdString(arr[i], parseInt(year))
            if (date) {
                event.date = date;
                events.push(event);
            }
        }
        return events;
    }

    async getMunicipalities() {
        const arr: Array<DocumentData> = []
        try {
            const colRef = collection(firebaseDb, "municipalities")
            const snapshot  = await getDocs(colRef)

            if (snapshot.docs.length > 0) {
                snapshot.forEach(doc => {
                    const data = doc.data()
                    arr.push(data)
                })
                return arr
            }
        } catch (e) {
            console.log(e)
        }
        return arr
    }

    async getMunicipality(name: string) {
        const colRef = collection(firebaseDb, "municipalities")
        const q = query(colRef, where("name", "==", name))
        const snapshot = await getDocs(q)
        
        if (snapshot.docs.length > 0) {
            const doc = snapshot.docs[0].data()
            return doc
        }
        return null
    }

    /*
        cache
    */

    async getJsonData(url: string) {
        const res = await this.getCachedOrFetch(url);
        if (res) {
            return res.json();
        }
        return null;
    }
    async getCachedOrFetch(url: string) {
        const cachedRes = await this.getFromCache(url);
        if (cachedRes && cachedRes.ok) {
            return cachedRes;
        }
        const res = await fetch(url);
        if (res && res.ok) {
            if (this.isCachable(url)) {
                await this.putToCache(url, res);
            }
            return res;
        }
        return null;
    }
    async getFromCache(url: string) {
        if (this.cacheEnabled) {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(url);
            if (response && response.ok) {
                return response;
            }
        }
        return null;
    }
    async putToCache(url: string, res: any) {
        const cache = await caches.open(this.cacheName);
        cache.put(url, res.clone());
    }
}

export default new Data();

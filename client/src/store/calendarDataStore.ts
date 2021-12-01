import { SvelteSubject } from "./reactive"
import { addressStore } from "./addressStore"
import { selectedMun } from "./munStore"
import { subs } from "@app/services/user"
import data from "@app/services/data"
import user from "@app/services/user"
import { CalendarEventsData, Municipality } from "@common/types/interfaces"

const calendarSubject = new SvelteSubject<CalendarEventsData>({
    year: 0,
    municipality: "",
    address: "",
    garbageEvents: []
})
export const calendarData = calendarSubject.asObservable()

let mun: Municipality
let address = ""

const isBothSet = async () => {
    if (address && mun && mun.name) {
        await getData()
        const issub = await user.doesSubscribeToCalendar(mun.name, address)
        isSubscribingToCurrentCalendar.next(issub)
    }
}

const getData = async () => {
    const a = address.split("-").join(" ")
    const d = await data.getCalendar(mun.name as string, a)
    calendarSubject.next(d)
    console.log(d)
}

selectedMun.subscribe(value => {
    mun = value
    isBothSet()
})
addressStore.subscribe(value => {
    address = value
    isBothSet()
})
subs.subscribe(value => {
    isBothSet()
})
export const getEventsForDate = (date: Date) => {
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDate()
    const dutc = new Date(Date.UTC(y, m, d))
    const data = calendarSubject.get()
    const events = data.garbageEvents.filter(e => e.date.getTime() == dutc.getTime())
    return events
}

const isSubscribingToCurrentCalendar = new SvelteSubject<boolean>(false)
export const isSubscribing = isSubscribingToCurrentCalendar.asObservable()
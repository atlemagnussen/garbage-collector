import { SvelteSubject } from "./reactive"
import { addressStore } from "./addressStore"
import { selectedMun } from "./munStore"
import { subs } from "@app/services/user"
import data from "@app/services/data"
import user from "@app/services/user"
import { CalendarEventsData, GarbageType, Municipality } from "@common/types/interfaces"
import { BehaviorSubject } from "rxjs"
import { cloneDeep } from "lodash-es"
import { hash256 } from "@app/funcs/helpers"

const calendarSubject = new SvelteSubject<CalendarEventsData>({
    year: 0,
    municipality: "",
    address: "",
    garbageEvents: [],
    hash: ""
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
    if (d) {
        const data = d!
        const str = JSON.stringify(data)
        const hash = await hash256(str)
        data.hash = hash
        calendarSubject.next(data)
    }
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
    const data = calendarDataFiltered.getValue()
    const events = data.garbageEvents.filter(e => e.date.getTime() == dutc.getTime())
    return events
}

const isSubscribingToCurrentCalendar = new SvelteSubject<boolean>(false)
export const isSubscribing = isSubscribingToCurrentCalendar.asObservable()

export const allGarbageTypes: GarbageType[] = ["rest", "food", "paper", "xmasTree"]
const GarbageTypeFilterSubject = new BehaviorSubject<GarbageType[]>(allGarbageTypes)
export const garbageTypeFilter = GarbageTypeFilterSubject.asObservable()
export const toggleGarbageTypeFilter = (type: GarbageType) => {
    const current = GarbageTypeFilterSubject.getValue()
    const isTypeFiltered = current.find(t => t == type)
    if (isTypeFiltered) {
        const filter = current.filter(t => t !== type)
        GarbageTypeFilterSubject.next(filter)
    } else {
        current.push(type)
        GarbageTypeFilterSubject.next(current)
    }
}

export const calendarDataFiltered = new BehaviorSubject<CalendarEventsData>({
    year: 0,
    municipality: "",
    address: "",
    garbageEvents: [],
    hash: ""
})

const createFiltered = async () => {
    const data = calendarSubject.getValue()
    const dataClone = cloneDeep(data)
    const filter = GarbageTypeFilterSubject.getValue()
    if (!filter || filter.length === 0)
        calendarDataFiltered.next(dataClone)

    const filtered = dataClone.garbageEvents.filter(e => filter.includes(e.type))
    dataClone.garbageEvents = filtered
    const str = JSON.stringify(dataClone)
    const hash = await hash256(str)
    dataClone.hash = hash
    calendarDataFiltered.next(dataClone)
}

calendarData.subscribe(d => createFiltered())
garbageTypeFilter.subscribe(f => createFiltered())

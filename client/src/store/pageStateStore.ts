import { SvelteSubject } from "./reactive"
import { fromEvent } from 'rxjs';

const monthDisplayingSubject = new SvelteSubject<number>(0)
export const monthDisplay = monthDisplayingSubject.asObservable()

export const setMonthNum = (mon: number) => {
    monthDisplayingSubject.next(mon)
}

const displaySearchSubject = new SvelteSubject<boolean>(true)
export const hideDisplaySearch = () => displaySearchSubject.next(false)
export const toggleDisplaySearch = () => {
    let curr = displaySearchSubject.getValue()
    displaySearchSubject.next(!curr)
}
export const displaySearch = displaySearchSubject.asObservable()

//import { map } from 'rxjs/operators'
const isOnlineSubject = new SvelteSubject<boolean>(navigator.onLine)
export const isOnline = isOnlineSubject.asObservable()
export const getIsOnline = () => {
    return isOnlineSubject.getValue()
}

const onlineEvent = fromEvent(window, "online")
const offlineEvent = fromEvent(window, "offline")
onlineEvent.subscribe(val => isOnlineSubject.next(true))
offlineEvent.subscribe(val => isOnlineSubject.next(false))

const isVisibleSubject = new SvelteSubject<boolean>(!document.hidden)
export const isPageVisible = isVisibleSubject.asObservable()
const visibilitychangeEvent = fromEvent(document, "visibilitychange")
visibilitychangeEvent.subscribe(val => {
    isVisibleSubject.next(!document.hidden)
})
import { SvelteSubject } from "./reactive"
const addSubject = new SvelteSubject<string>("")
export const setAddress = (addr: string) => {
    addSubject.next(addr)
}
export const addressStore = addSubject.asObservable()

import { StoredSubject, SvelteSubject } from "./reactive"
import data from "@app/services/data"
import { Municipality } from "@common/types/interfaces"

const munSubject = new StoredSubject<Array<Municipality>>("municipalities", [])
export const munStore = munSubject.asObservable()
export const getMuns = () => {
    return munSubject.get()
}
const selectedMunSub = new SvelteSubject<Municipality>({})
export const selectedMun = selectedMunSub.asObservable()
export const setSelectedMun = (mun: Municipality) => {
    selectedMunSub.next(mun)
}
const getMundb = async () => {
    const muns = await data.getMunicipalities()
    munSubject.next(muns)
}
getMundb()
import * as  crypto from "crypto"
import { cloneDeep } from "lodash-es"

class Comparer {
    isSame(cal1: CalendarData, cal2: CalendarData) {
        const hash1 = this.hashCalendar(cal1)
        const hash2 = this.hashCalendar(cal2)
        console.log(`hash1=${hash1}`)
        console.log(`hash2=${hash2}`)
        return hash1 === hash2
    }
    getCleanClone(cal: CalendarData) {
        const calClone = cloneDeep(cal)
        if (calClone._id) {
            Reflect.deleteProperty(calClone, "_id")
        }
        if (calClone.address) {
            Reflect.deleteProperty(calClone, "address")
        }
        if (calClone.municipality) {
            Reflect.deleteProperty(calClone, "municipality")
        }
        if (calClone.hash) {
            Reflect.deleteProperty(calClone, "hash")
        }
        if (calClone.title) {
            Reflect.deleteProperty(calClone, "title")
        }
        return calClone
    }
    // isDateListSame(list1, list2) {
    //     for (let i = 0; i < list1.length; i++) {
    //         const d1 = list1[i]
    //         const d2 = list2[i]
    //         if (d1.toString() !== d2.toString()) {
    //             return false
    //         }
    //     }
    //     return true
    // }
    orderObject(unordered: CalendarData) {
        let ordered: CalendarData = {_id:"", hash:"", year:"", address: [], food:[], paper: [], rest: [], xmasTree: []}
        Object.keys(unordered).sort().
            forEach((key) => {
                //@ts-ignore
                ordered[key] = unordered[key]
            })
        return ordered
    }
    hash(input: string) {
        return crypto.createHash('sha256').update(input, 'utf8').
            digest("hex")
    }
    hashCalendar(cal: CalendarData) {
        const calClone = this.getCleanClone(cal)
        const orderedCal = this.orderObject(calClone)
        const stringified = JSON.stringify(orderedCal)
        return this.hash(stringified)
    }
}

export default new Comparer()

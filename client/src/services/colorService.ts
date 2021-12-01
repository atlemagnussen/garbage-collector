import {selectedMun} from "@app/store/munStore"
import { Colors, GarbageType, Municipality } from "@common/types/interfaces"
selectedMun.subscribe(value => mun = value)
let mun: Municipality

const defaultColors: Colors = {
    food: "#9c4e16",
    paper: "#99C66D",
    rest: "black",
    xmasTree: "red"
}

export const getColor = (type: GarbageType) => {
    if (mun && mun.colors && mun.colors[type]) {
        const colors = mun.colors
        return colors[type]
    }

    return defaultColors[type]
}
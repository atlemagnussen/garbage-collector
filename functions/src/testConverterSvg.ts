import ConverterSvg from "./converters/converter-svg"

const run = async () => {
    const conv = new ConverterSvg("morgedalsveien 66")
    const res = await conv.get()
    console.log(res)
}

run().catch(ex => console.error(ex))
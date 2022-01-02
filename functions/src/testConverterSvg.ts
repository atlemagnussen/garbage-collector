import ConverterSvg from "./converters/converter-svg"

const run = async () => {
    const res = await ConverterSvg.get("morgedalsveien 66")
    console.log(res)
}

run().catch(ex => console.error(ex))
import ConverterSandnes from "./converters/converter-sandnes"

const run = async () => {
    const conv = new ConverterSandnes("roald amundsens gate 83")
    const res = await conv.get()
    console.log(res)
}

run().catch(ex => console.error(ex))
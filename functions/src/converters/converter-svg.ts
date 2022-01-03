import { CalendarData, IConverter } from "@common/types/interfaces"
import puppeteer from "puppeteer"

const baseUrl = "https://www.stavanger.kommune.no/renovasjon-og-miljo/tommekalender/finn-kalender/"

//const containerSelector = ".row.waste-calendar-search-block"
const inputSelector = "input.js-address-search"
const searcBtnSelector = "input.js-address-search-submit" //[type='submit'] 
const resultSelector = ".js-address-result"
const resultListSelector = `${resultSelector} ul li`

const calendarListSelector = "table.waste-calendar.js-waste-calendar"
const calendarTablesRowsSelector = `${calendarListSelector} tbody tr.waste-calendar__item`
class ConverterSvg implements IConverter {
    address = ""
    constructor(addressInput: string) {
        this.address = addressInput.toLowerCase()
    }
    async get(): Promise<CalendarData> {
        console.log(`Get address ${this.address}`)
        const browser = await this.startBrowser()
        if (!browser)
            throw new Error("error opening browser")
        
        console.log("got browser")
        let page = await browser.newPage()
        console.log("got page")
        await page.goto(baseUrl)
        console.log(`went to ${baseUrl}`)
        
        // await page.waitForSelector(containerSelector)
        // console.log(`waited for ${containerSelector}`)
        
        await page.waitForSelector(searcBtnSelector)
        
        await page.$eval(inputSelector, (el, val) => (el as HTMLInputElement).value = val as string, this.address)
        console.log(`value ${this.address} set, now click`)

        //await page.waitForSelector(searcBtnSelector)
        await page.click(searcBtnSelector)
        console.log("search btn clicked")
        
        await page.waitForSelector(resultListSelector)
        console.log("got search result")

        let urls = await page.$$eval(resultListSelector, links => {
            const ahrefs = links.map(el => el.querySelector("a")!.href)
            return ahrefs
        })

        if (!urls || urls.length === 0)
            throw new Error("got no urls")
        
        const url = urls[0]
        console.log(`go to url ${url}`)
        await page.goto(url)
        await page.waitForSelector(calendarListSelector)

        let datesRows = await page.$$eval(calendarTablesRowsSelector, rows => {
            return rows
        })

        if (!datesRows)
            throw new Error("got no dates tables")
        
        console.log(`dates tables count = ${datesRows.length}`)
        let data: CalendarData = {
            hash: "",
            year: "",
            address: [this.address],
            food: [],
            paper: [],
            rest: [],
            xmasTree: []
        }
        return data
    }
    async startBrowser() {
        let browser: puppeteer.Browser
        try {
            console.log("Opening the browser......")
            browser  = await puppeteer.launch({
                headless: false,
                args: ["--disable-setuid-sandbox"],
                'ignoreHTTPSErrors': true
            })
        } catch (err) {
            console.log("Could not create a browser instance => : ", err)
            return null
        }
        return browser
    }
}

export default ConverterSvg

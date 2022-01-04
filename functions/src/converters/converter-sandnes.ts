import { CalendarData, GarbageType, IConverter } from "@common/types/interfaces"
import puppeteer from "puppeteer"
import conf from "./converter"
const config = conf.sandnes

const searchUrl = "https://portal.isy.no/sandnes/FinnEiendom/tabid/2331/ctl/PropertySearch/mid/3548/mid/3548/Default.aspx"

const searchInputSelector = "#dnn_ctr3548_ViewEiendomsok_SearchText"
const searcBtnSelector = "#dnn_ctr3548_ViewEiendomsok_Search" //[type='submit'] 
const resultSelector = "#dnn_ctr3548_ViewEiendomsok_SearchResults"
const resultListSelector = `${resultSelector} table`

const calendarListSelector = "#dnn_ctr3548_ContentPane"
const calendarTablesSelector = `${calendarListSelector} .pa-calendar-month`

class ConverterSandnes implements IConverter {
    address = ""
    constructor(addressInput: string) {
        this.address = addressInput.toLowerCase()
    }
    async get(): Promise<CalendarData> {
        console.log(`Get address ${this.address}`)
        const browser = await this.startBrowser()
        if (!browser)
            throw new Error("error opening browser")
        
        let page = await browser.newPage()
        await page.goto(searchUrl)
        console.log(`went to search page ${searchUrl}`)
        
        await page.waitForSelector(searcBtnSelector)
        console.log("got searcBtnSelector")
        // set address as search value
        await page.$eval(searchInputSelector, (el, val) => (el as HTMLInputElement).value = val as string, this.address)
        console.log("set search value")
        await page.click(searcBtnSelector)
        
        await page.waitForSelector(resultListSelector)
        console.log("got search result")

        let urls = await page.$$eval(resultListSelector, links => {
            const ahrefs = links.map(el => {
                const anchors = Array.from(el.querySelectorAll("a"))
                return anchors.map(a => a.href)
            })
            return ahrefs.flat(1)
        })

        if (!urls || urls.length === 0)
            throw new Error("got no urls")
        
        console.log(`Number of URLS:: ${urls.length}`)
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i]
            try {
                const data = await this.fetchDataFromUrl(page, url)
                return data
            }
            catch(err) {
                console.log(`URL did not produce ${url}`)
                console.log(err)
                console.log("continue")
                continue
            }
        }
        throw new Error("no search result urls produced data")
    }

    async fetchDataFromUrl(page: puppeteer.Page, url: string) {
        console.log(`go to url ${url}`)
        await page.goto(url)
        //await page.waitForResponse(url)
        // await page.waitForResponse(response => response.url() == url && response.status() === 200);

        // await page.waitForSelector(calendarListSelector)
        await page.waitForSelector(`${calendarTablesSelector} table`)
        let calendarMonthTables = await page.$$eval(calendarTablesSelector, divs => {
            return divs.map(div => div.querySelector("table"))
        })

        if (!calendarMonthTables || calendarMonthTables.length == 0)
            throw new Error("got no dates tables")
        
        console.log(`calendarMonthDivs found: ${calendarMonthTables.length}`)
        const data = this.convert(calendarMonthTables as HTMLTableElement[])
        return data
    }
    convert(monthDivs: HTMLTableElement[]) {
        const nowMonth = new Date().getMonth()
        let data: CalendarData = {
            hash: "",
            year: new Date().getFullYear().toString(),
            address: [this.address],
            food: [],
            paper: [],
            rest: [],
            xmasTree: [],
            isEmpty: false
        }
        for (let i = 0; i < monthDivs.length; i++) {
            const monthDiv = monthDivs[i]

            const dayDivs = Array.from(monthDiv.querySelectorAll("div"))
            for (let y = 0; y < dayDivs.length; y++) {
                const dayDiv = dayDivs[y]
                if (dayDiv.classList.length === 0) {
                    continue
                }
                let dayOfMonth = "0"
                const parentDay = dayDiv.closest(".pa-calendar-day") as HTMLTableCellElement
                const dayElement = parentDay?.querySelector(".dayNumberClass") as HTMLSpanElement
                if (dayElement)
                    dayOfMonth = dayElement.innerText
                
                let type: GarbageType = "xmasTree"
                if (dayDiv.classList.contains(config.foodClass))
                    type = "food"
                else if (dayDiv.classList.contains(config.restClass))
                    type = "rest"
                else if (dayDiv.classList.contains(config.paperClass))
                    type = "paper"
                else
                    console.warn("Unknown type", dayDiv)
                
                const monthNo = i + nowMonth
                if (dayOfMonth) {
                    const d = `${monthNo}-${dayOfMonth}`
                    data[type].push(d)
                } else {
                    console.warn(`Month='${monthNo}', Type='${type}', but no dayOfMonth='${dayOfMonth}'`)
                }
            }
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

export default ConverterSandnes
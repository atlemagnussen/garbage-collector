import { CalendarData, IConverter } from "@common/types/interfaces"
import puppeteer from "puppeteer"

const searchUrl = "https://www.stavanger.kommune.no/renovasjon-og-miljo/tommekalender/finn-kalender/"

const searchInputSelector = "input.js-address-search"
const searcBtnSelector = "input.js-address-search-submit" //[type='submit'] 
const resultSelector = ".js-address-result"
const resultListSelector = `${resultSelector} ul li`

const calendarListSelector = "table.waste-calendar.js-waste-calendar"
const calendarTablesRowsSelector = `${calendarListSelector} tbody tr.waste-calendar__item`

interface SvgCalRow {
    date: string
    icons: string[]
}

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
        await page.goto(searchUrl)
        
        await page.waitForSelector(searcBtnSelector)
        
        // set address as search value
        await page.$eval(searchInputSelector, (el, val) => (el as HTMLInputElement).value = val as string, this.address)

        await page.click(searcBtnSelector)
        
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
            return rows.map(r => {
                const tds = r.querySelectorAll("td")
                const dateTd = tds[0]
                const iconTd = tds[1]
                const iconImgs = iconTd.querySelectorAll("img")

                const ret: SvgCalRow = {
                    date: dateTd.innerText.trim(),
                    icons: Array.from(iconImgs).map(ic => ic!.src)
                }
                return ret
            })
        })

        if (!datesRows)
            throw new Error("got no dates tables")
        
        console.log(datesRows)
        console.log(`dates tables count = ${datesRows.length}`)
        const data = this.convert(datesRows)
        return data
    }

    convert(rows: SvgCalRow[]) {
        
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
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const date = row.date.substring(0, 5)
            
            const dateSplit = date.split(".")
            const day = parseInt(dateSplit[0])
            const month = parseInt(dateSplit[1]) -1
            const newDate = `${month}-${day}}`
            if (row.icons.some(ic => ic.includes("rest")))
                data.rest.push(newDate)
            if (row.icons.some(ic => ic.includes("bio")))
                data.food.push(newDate)
            if (row.icons.some(ic => ic.includes("papir")))
                data.paper.push(newDate)
            if (row.icons.some(ic => ic.includes("juletre")))
                data.xmasTree.push(newDate)
        }
        return data
    }
    async startBrowser() {
        let browser: puppeteer.Browser
        try {
            console.log("Opening the browser......")
            browser  = await puppeteer.launch({
                headless: true,
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

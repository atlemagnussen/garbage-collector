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

interface SvgCalRow {
    date: string
    icon: string
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
            return rows.map(r => {
                const tds = r.querySelectorAll("td")
                const dateTd = tds[0]
                const iconTd = tds[1]
                const iconImg = iconTd.querySelector("img")

                const ret: SvgCalRow = {
                    date: dateTd.innerText.trim(),
                    icon: iconImg!.src
                }
                return ret
            })
        })

        if (!datesRows)
            throw new Error("got no dates tables")
        
        console.log(`dates tables count = ${datesRows.length}`)
        const data = this.convert(datesRows)
        return data
    }

    convert(rows: SvgCalRow[]) {
        
        let data: CalendarData = {
            hash: "",
            year: "",
            address: [this.address],
            food: [],
            paper: [],
            rest: [],
            xmasTree: []
        }
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const date = row.date.substring(0, 5)
            console.log(`date=${date}`)
            const dateSplit = date.split(".")
            const day = parseInt(dateSplit[0])
            const month = parseInt(dateSplit[1]) -1
            const newDate = `${month}-${day}}`
            if (row.icon.includes("rest"))
                data.rest.push(newDate)
            else if (row.icon.includes("bio"))
                data.food.push(newDate)
            else if (row.icon.includes("papir"))
                data.paper.push(newDate)
            else
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

import cheerio from "cheerio"
import httpHandler from "./httpHandler"
import conf from "./converter"
const config = conf.sandnes
import puppeteer from "puppeteer"
import { spacingForHouseLetter } from "./converter-common"
import { CalendarData, GarbageType, IConverter } from "@common/types/interfaces"
const baseurl = "https://portal.isy.no/sandnes/FinnEiendom/tabid/2331/ctl/PropertySearch/mid/3548/mid/3548/Default.aspx"


class ConverterSandnes implements IConverter {
    private emptyMonths = 0
    async get(addressInput: string) {
        console.log(`Start converting input:  ${addressInput}`)
        const address = spacingForHouseLetter(addressInput)
        console.log(`Start converting address ${address}`)
        // find url
        const foundUrls = await this.getUrlForCalendar(address)
        let foundUrl = null
        if (foundUrls && Array.isArray(foundUrls) && foundUrls.length > 0) {
            for (let i = 0; i < foundUrls.length; i++) {
                const url = foundUrls[i]
                if (url.text.toLowerCase() === address.toLowerCase()) {
                    foundUrl = url.href
                    console.log(`foundUrl=${foundUrl}`)
                    break
                }
            }
        }
        if (foundUrl) {
            console.log(`found url=${foundUrl}`)
            const data = this.fetchAndReadData(foundUrl)
            return data
        }
        throw Error("found no data")
    }
    async getUrlForCalendar(address: string) {
        const inputSelector = "#dnn_ctr3548_ViewEiendomsok_SearchText"
        const searchBtnSelector = "#dnn_ctr3548_ViewEiendomsok_Search"
        const searchResultTableSelector = "#dnn_ctr3548_ViewEiendomsok_SearchResults"
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
        const page = await browser.newPage()
        try {
            await page.goto(baseurl)
            page.waitForResponse(inputSelector)
            const searchField = await page.$(inputSelector)
            await searchField?.type(address)

            const searchBtn = await page.$(searchBtnSelector)
            await searchBtn?.click()
            await page.waitForResponse(searchResultTableSelector)
            const searchResult = await page.$(searchResultTableSelector)
            const hrefs = await searchResult?.$$eval("a[href]", this.convertAnchors)
            return hrefs
        } catch (err) {
            console.error(err)
        } finally {
            await browser.close()
        }
        return null
    }
    convertAnchors(aTags: Element[]) {
        return aTags.map(a => ({ href: a.getAttribute("href"), text: a.innerHTML.toLowerCase() }))
    }

    async fetchAndReadData(url: string) {
        let outputData: CalendarData = {
            food: [],
            rest: [],
            paper: [],
            xmasTree: [],
            year: new Date().getFullYear().toString(),
            hash: "",
            address: []
        }
        
        try {
            const html = await httpHandler.getHtmlFromUrl(url)
            const $ = cheerio.load(html)
            this.emptyMonths = 0
            const $monthsEls = $(".pa-calendar-month")
            if ($monthsEls.length === 0) {
                console.log(`$monthsEls.length=${$monthsEls.length}`)
                outputData.isEmpty = true
                return outputData
            } else if ($monthsEls.length !== 12) {
                console.log(`$monthsEls.length=${$monthsEls.length}`)
                const nowMonth = new Date().getMonth()
                if ($monthsEls.length < 12) {
                    this.emptyMonths = nowMonth
                    console.log(`$number of initial empty months=${this.emptyMonths}`)
                }
            }

            $monthsEls.each((i, month) => {
                const $month = cheerio.load(month)
                const $divs = $month("div")
                for (let y = 0; y < $divs.length; y++) {
                    const div = $divs[y]
                    if (!div.attribs.class) {
                        // eslint-disable-next-line no-continue
                        continue
                    }
                    let dayOfMonth = "0"
                    let type: GarbageType = "xmasTree"
                    const $parentEl = $(div).parents(".pa-calendar-day")
                    const $dayEl = $parentEl.children(".dayNumberClass")
                    if ($dayEl) {
                        dayOfMonth = $dayEl.text()
                    }
                    if (div.attribs.class.includes(config.foodClass)) {
                        type = "food"
                    } else if (div.attribs.class.includes(config.restClass)) {
                        type = "rest"
                    } else if (div.attribs.class.includes(config.paperClass)) {
                        type = "paper"
                    } else {
                        console.warn(`Unknown type src:${div.attribs.src}`)
                    }
                    const monthNo = i + this.emptyMonths
                    if (dayOfMonth) {
                        const d = `${monthNo}-${dayOfMonth}`
                        outputData[type].push(d)
                    } else {
                        console.warn(`Month='${monthNo}', Type='${type}', but no dayOfMonth='${dayOfMonth}'`)
                    }
                }
            })
        } catch (e) {
            console.error(e)
        }
        return outputData
    }
}

export default new ConverterSandnes()

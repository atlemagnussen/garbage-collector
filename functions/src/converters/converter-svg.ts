import cheerio from "cheerio"
import httpHandler from "./httpHandler"
import config from "./converter"
import * as puppeteer from "puppeteer"
import { spacingForHouseLetter } from "./converter-common"

const baseUrl =
    "https://portal.isy.no/stavanger/S%C3%B8keiendom/tabid/798/ctl/PropertySearch/mid/2773/mid/2773/Default.aspx";

class ConverterSvg implements IConverter {
    async get(addressInput: string) {
        console.log(`Start converting input:  ${addressInput}`)
        const address = spacingForHouseLetter(addressInput)
        console.log(`Start converting address ${address}`)
        // find url
        const foundUrls = await this.getUrlForCalendar(address)
        let foundUrl = null
        if (foundUrls && Array.isArray(foundUrls) && foundUrls.length > 0) {
            for (let i = 0; i < foundUrls.length; i++) {
                const urlFound = foundUrls[i]
                if (urlFound.text === address) {
                    foundUrl = urlFound.href
                    break
                }
            }
        }
        if (foundUrl) {
            console.log(`found url=${foundUrl}`)
            const data = this.fetchAndReadData(foundUrl)
            return data
        }
        throw Error("no data")
    }
    async getUrlForCalendar(address: string) {
        const inputSelector = "#dnn_ctr2773_ViewEiendomsok_SearchText"
        const searchBtnSelector = "#dnn_ctr2773_ViewEiendomsok_Search"
        const searchResultTableSelector = "#dnn_ctr2773_ViewEiendomsok_ResultsGrid"
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
        const page = await browser.newPage()
        try {
            await page.goto(baseUrl)
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
    convertAnchors(aTags) {
        return aTags.map((a: any) => ({ href: a.getAttribute("href"), text: a.innerHTML.toLowerCase() }));
    }

    async fetchAndReadData(url: string) {
        let outputData: CalendarImportData = {
            food: [],
            rest: [],
            paper: [],
            xmasTree: [],
            year: new Date().getFullYear().toString()
        };
        try {
            const html = await httpHandler.getHtmlFromUrl(url)
            const $ = cheerio.load(html)

            const $titleEl = $("#pa_fraksjon_header h2.art-postheader span.Head")
            if ($titleEl) {
                outputData.title = $titleEl.text()
            } else {
                console.log("No title found")
            }

            const yearEl = $("#dnn_ctr2773_ViewRenovasjon_DropDownListVisning")
            if (yearEl) {
                outputData.year = yearEl.val() as string
            } else {
                console.log(`Found no year, default to this year`)
            }

            const $monthsEls = $(".pa-calendar-month")
            if ($monthsEls.length !== 12) {
                console.log(`$monthsEls.length=${$monthsEls.length}`)
                console.error("Not 12 months found")
                outputData.isEmpty = true
                return outputData
            }

            $monthsEls.each((i, month) => {
                const $month = cheerio.load(month)
                const $imgs = $month("img")
                for (let y = 0; y < $imgs.length; y++) {
                    const img = $imgs[y]

                    let dayOfMonth = "0"
                    let type: GarbageType = "xmasTree"
                    const $parentEl = $(img).parents(".pa-calendar-day")
                    const $dayEl = $parentEl.children(".dayNumberClass")
                    if ($dayEl) {
                        dayOfMonth = $dayEl.text()
                    }
                    if (img.attribs.src === config.stavanger.matPic) {
                        type = "food"
                    } else if (img.attribs.src === config.stavanger.restPic) {
                        type = "rest"
                    } else if (img.attribs.src === config.stavanger.papirPic) {
                        type = "paper"
                    } else {
                        console.warn(`Unknown type src:${img.attribs.src}`)
                    }
                    if (dayOfMonth) {
                        const d = `${i}-${dayOfMonth}`
                        outputData[type].push(d)
                    } else {
                        console.warn(`Month='${i}', Type='${type}', but no dayOfMonth='${dayOfMonth}'`)
                    }
                }
            })
        } catch (e) {
            console.error(e)
        }
        return outputData
    }
}

export default new ConverterSvg()

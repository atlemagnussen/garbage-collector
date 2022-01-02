import * as pupp from "puppeteer"
//@ts-ignore
const puppeteer = pupp.default

const baseUrl = "https://www.stavanger.kommune.no/renovasjon-og-miljo/tommekalender/finn-kalender/"

class ConverterSvg implements IConverter {
    async get(addressInput: string) {
        const browser = await startBrowser()
        if (!browser)
            return
        
        let page = await browser.newPage()
        await page.goto(baseUrl)
        await page.waitForSelector(".row.waste-calendar-search-block")
        let urls = await page.$$eval('section ol > li', links => {
            links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
            links = links.map(el => el.querySelector('h3 > a').href)
            return links
        })
    }
    async function startBrowser() {
        let browser
        try {
            console.log("Opening the browser......")
            browser = await puppeteer.launch({
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

export default new ConverterSvg()

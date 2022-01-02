import pupp from "puppeteer"
const puppeteer = pupp

const baseUrl = "https://www.stavanger.kommune.no/renovasjon-og-miljo/tommekalender/finn-kalender/"

class ConverterSvg implements IConverter {
    async get(addressInput: string) {
        const browser = await startBrowser()
        if (!browser)
            return
        
        let page = await browser.newPage()
        await page.goto(baseUrl)
        const containerSelector = ".row.waste-calendar-search-block"
        await page.waitForSelector(containerSelector)
        await page.$$eval(containerSelector, (divs: Element[]) => {
            const container = divs[0]
            const searchField = container.querySelector(".js-address-search")
            if (!searchField) {
                console.error("could not find search field")
                return null
            }
            searchField.nodeValue = addressInput
            // links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
            // links = links.map(el => el.querySelector('h3 > a').href)
            // return links
        })
    }
    async startBrowser() {
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

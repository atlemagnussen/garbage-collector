import { request as httpRequest } from "http"
import { request as httpsRequest} from "https"

let reqFunc = httpsRequest

class HttpHandler {
    getHtmlFromUrl(url: string) {
        if (url.indexOf("https://") === 0) {
            reqFunc = httpsRequest
        } else if (url.indexOf("http://") === 0) {
            reqFunc = httpRequest
        }
        return this.getHtml(url)
    }

    getHtml(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = reqFunc(url, res => {
                let data = ""
                res.on("data", chunk => {
                    data += chunk
                })
                res.on("end", () => {
                    resolve(data)
                })
            })
            .on("error", e => {
                console.log(e.message)
                reject(e)
            })
            request.end()
        })
    }
}
export default new HttpHandler()

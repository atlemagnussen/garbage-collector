import { request as httpRequest } from "http"
import { request as httpsRequest} from "https"

let reqFunc = httpsRequest
class HtmlHandler {
    async getJson(url: string) {
        let data = await this.get(url)
        const json = JSON.parse(data)
        return json
    }
    get(url: string) {
        reqFunc = url.includes("https:") ? httpsRequest : httpRequest
        
        return this.getRaw(url)
    }

    getRaw(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const request = reqFunc(url, (res) => {
                let data = ''
                res.on('data', (chunk: string) => {
                    data += chunk
                })
                res.on('end', () => {
                    resolve(data)
                })
            }).
                on('error', (e) => {
                    console.log(e.message)
                    reject(e)
                })
            request.end()
        })
    }
}
export default new HtmlHandler()


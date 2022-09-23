
const jsonContentType: string = "application/json"

const get = async <T>(url: string) => {
    const req = createRequest(url, "get", jsonContentType)
    return await http<T>(req)
}
const post = async <T>(url: string, data: any) => {
    const req = createRequest(url, "post", jsonContentType, data)
    return await http<T>(req)
}

const put = async <T>(url: string, data: any) => {
    const req = createRequest(url, "put", jsonContentType, data)
    return await http<T>(req)
}

const remove = async <T>(url: string) => {
    const req = createRequest(url, "delete")
    return await http<T>(req)
}

const createRequest = (url: string, method: string, contentType?: string, data?: any) => {
    const args: RequestInit = {
        method,
        headers: {
            "Content-Type": jsonContentType
        }
    }
        
    if (data) {
        if (contentType === jsonContentType)
            args.body = JSON.stringify(data)
        else
            args.body = data
    }
    
    const fullUrl = `${url}`
    return new Request(fullUrl, args)
}

async function http<T>(request: RequestInfo): Promise<T> {
    let errorFetchMsg
    const res = await fetch(request)
    .catch((error) => {
        errorFetchMsg = "Error fetching"
        console.error(error.message)
        throw new Error(errorFetchMsg)
    })
    return resHandler(res)
}

const resHandler = async (res: Response) => {
    let errorFetchMsg
    if (res.ok) {
        const contentType = res.headers.get("content-type")
        if (res.status === 200 || res.status === 201) {
            
            if (contentType && contentType.includes(jsonContentType)) {
                const json = await res.json()
                return json
            }
            const text = await res.text()
            return text
        }
        else {
            return ""
        }
    } else {
        console.error(`${res.statusText} (${res.status})`)
        
        errorFetchMsg = "Error fetching"
        if (res.status >= 400 && res.status < 500) {
            try {
                const pd = await res.json()
                console.log(pd)
                if (pd.title)
                    errorFetchMsg = pd.title
                else
                    errorFetchMsg = `status${res.status}`
            }
            catch (ex) {
                console.debug(ex)
            }
        } else {
            const message = await res.text()
            console.log(message)
        }
        
        throw new Error(errorFetchMsg)
    }
}

export default { get, post, put, remove }
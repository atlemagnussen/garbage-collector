export const getLocalStorage = (key: string) => {
    const item = localStorage.getItem(key)
    if (!item)
        return null
    const json = JSON.parse(item)
    return json
}

export const setLocalStorage = (key: string, json: any) => {
    const item = JSON.stringify(json)
    localStorage.setItem(key, item)
}
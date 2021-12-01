import { Language } from "@common/types/interfaces"

let langCode = "no"; //navigator.languages;
let lang: Language

const getLang = async (code: string) => {
    const res = await fetch(`/${code}.json`);
    if (res.ok) {
        const json = await res.json();
        return json;
    }
    throw new Error(`Error fetching lang ${code}`);
};

export const langInit = async() => {
    lang = await getLang(langCode);
    return true;
};

const get = (key: string) => {
    if (key in lang)
        return lang[key];
    console.error(`key ${key} does not exist in lang file`);
    return null;
};

export const changeLang = async (lc: string) => {
    langCode = lc;
    lang = await getLang(langCode);
};

export default get;
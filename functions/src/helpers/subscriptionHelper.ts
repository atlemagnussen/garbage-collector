import firestore from "./firestore"
const db = firestore.getDb()
const SUBCOLNAME = "subscription"

class SubscriptionHelper {
    async getSubByToken(token: string) {
        console.log(`getSubByToken ${token}`)
        const docRef = db.collection(SUBCOLNAME).where('token', '==', token)
        const docs = await docRef.get()
        console.log(`Found ${docs.docs.length} subs`)
        if (docs.docs.length === 0) {
            return null
        }
        if (docs.docs.length === 1) {
            const doc = docs.docs[0]
            const data = doc.data() as SubscriptionData
            data._id = doc.id
            return data
        }
        throw new Error(`Found multiple (${docs.docs.length}) for token ${token}`)
    }
    async getSubById(id: string) {
        console.log(`Get sub by id ${id}`)
        try {
            const doc = await firestore.get(SUBCOLNAME, id)
            return doc as SubscriptionData
        } catch (err) {
            console.error(err)
        }
        return null
    }
    async getSub (token: string, id: string) {
        try {
            let doc = null
            if (id) {
                console.log(`Try get by id ${id}`)
                doc = await firestore.get(SUBCOLNAME, id) as SubscriptionData
                if (!doc) {
                    throw new Error(`Document with id ${id} does not exist`)
                }
                if (doc.token !== token) {
                    console.log(`Need to update token for '${id}'`)
                    this.updateToken(id, token)
                }
                return doc
            }
            doc = await this.getSubByToken(token)
            return doc
        } catch (err) {
            console.error(err)
        }
        return null
    }
    async addToOrCreateSub (token: string, municipality: string, address: string, idInput: string) {
        const exists = await this.getSub(token, idInput)
        if (exists) {
            if (exists.calendars && Array.isArray(exists.calendars)) {
                if (exists.calendars.some((a) => a.municipality === municipality && a.address === address)) {
                    return "already subscribing"
                }
            } else {
                exists.calendars = []
            }
            exists.calendars.push({municipality, address})
            exists.updated = new Date()
            const result = await firestore.createOrUpdate(SUBCOLNAME, exists, exists._id)
            console.log(result)
            return exists._id
        }
        const doc: SubscriptionData = {
            token,
            "calendars": [{municipality, address}],
            created: new Date(),
            updated: new Date()
        }
        const ret = await firestore.createOrUpdate(SUBCOLNAME, doc)
        console.log(ret)
        return ret.id
    }

    async removeSub(token: string, municipality: string, address: string, idInput: string) {
        const exists = await this.getSub(token, idInput)
        if (exists) {
            if (exists.calendars && Array.isArray(exists.calendars) &&
                exists.calendars.some((a) => a.municipality === municipality && a.address === address)) {
                const filtered = exists.calendars.filter((a) => a.municipality !== municipality || a.address !== address)
                exists.calendars = filtered
            } else {
                console.warn(`Id ${idInput} did not contain ${municipality}, ${address}, do nothing`)
            }
            const id = exists._id
            Reflect.deleteProperty(exists, "_id")
            const result = await firestore.createOrUpdate(SUBCOLNAME, exists, id)
            console.log(result)
            return id
        }
        console.warn(`Id ${idInput} or ${token} did not exist, nothing to unsubscribe`)
        return idInput
    }
    async updateToken(subId: string, token: string) {
        console.log(`Try update token on subscription id ${subId}`)
        const doc = await firestore.get(SUBCOLNAME, subId) as SubscriptionData
        if (!doc) {
            throw new Error(`Document with id ${subId} does not exist`)
        }
        if (doc.token !== token) {
            doc.token = token
            if (doc.oldtokens && Array.isArray(doc.oldtokens)) {
                doc.oldtokens.push(doc.token)
            } else {
                doc.oldtokens = [doc.token]
            }
            const res = await firestore.createOrUpdate(SUBCOLNAME, doc, subId)
            return res
        }
        return false
    }
}

export default new SubscriptionHelper()

import admin from "./admin"
const db = admin.firestore()

class FirestoreCrud {
    async getAll(colname: string) {
        try {
            const all: any[] = []
            const allDocRefs = await db.collection(colname).
                get()
            allDocRefs.forEach((d) => {
                const doc = d.data() as FirebaseDocument
                doc._id = d.id
                all.push(doc)
            })
            return all
        } catch (e) {
            console.error(e)
        }
        return null
    }
    async get(colname: string, id:string) {
        try {
            const docRef = await db.collection(colname).doc(id).
                get()
            let doc = docRef.data() as FirebaseDocument
            doc._id = id
            return doc
        } catch (err) {
            console.error(err)
        }
        return null
    }
    async createOrUpdate(colname: string, data: any, id?: string) {
        let ret: FirebaseOperation = {
            "operation": "createOrUpdate",
            "success": false
        }
        try {
            const colRef = db.collection(colname)
            let docRef = null
            if (id) {
                docRef = colRef.doc(id)
            } else {
                docRef = colRef.doc()
            }
            ret.id = docRef.id
            if (data._id) {
                Reflect.deleteProperty(data, "_id")
            }
            if (data.id) {
                Reflect.deleteProperty(data, "id")
            }
            await docRef.set(data)
            ret.success = true
        } catch (e) {
            console.error(e)
        }
        return ret
    }
    async delete(colname: string, id: string) {
        const ret: FirebaseOperation = {
            "operation": "delete",
            "success": false,
            id
        }
        try {
            await db.collection(colname).doc(id).
                delete()
            console.log(`Document id ${id} successfully deleted from collection ${colname}`)
            ret.success = true
        } catch (error) {
            console.error("Error removing document: ", error)
        }
        return ret
    }
    getDb() {
        return db
    }
}

export default new FirestoreCrud()


export const FirestoreTimeStamp = admin.firestore.Timestamp 
import "firebase-admin"
import { GarbageType } from "./interfaces"

export type FirebaseTimeStampOrDate = FirebaseFirestore.Timestamp | Date

export interface SubscriptionMessage {
    date: FirebaseFirestore.Timestamp
    msgDate: FirebaseFirestore.Timestamp
    types: GarbageType[]
    subId?: string
    token?: string
    municipality?: string
    address?: string
    _id?: string
    failedAttempts?: number
}
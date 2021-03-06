

export type GarbageType = "food" | "paper" | "rest" | "xmasTree"
type SubscribeOperation = "unsubscribed" | "subscribed"

type CalendarDataType = { 
    [k in GarbageType]: Array<string>
}

type FirebaseOps = "createOrUpdate" | "delete"
export interface FirebaseOperation {
    operation: FirebaseOps
    success: boolean
    id?: string
}

export interface FirebaseDocument {
    _id?: string
}

export interface CalendarData extends CalendarDataType, FirebaseDocument {
    hash: string
    year: string
    address: Array<string>
    municipality?: string
    title?: string
    isEmpty?: boolean
}
export interface CalendarEvent {
    type: GarbageType
    color: string
    date: Date
}

export interface CalendarEventsData {
    municipality: string,
    address: string,
    year: number
    garbageEvents: Array<CalendarEvent>
    hash: string
}

export interface BrowserRoute {
    path: string
    param: string
    action: string
}
export interface Route {
    path: string
    component: string
    title?: string
    description?: string
    param?: string
    action?: string
    mustBeLoggedIn?: boolean
    admin?: boolean
    init?: Function
}

export type Colors = { [k in GarbageType]: string }
export interface Municipality {
    name?: string
    colors?: Colors
}


export interface Day {
    date: Date
    day: number
    notThisMonth: boolean
}

export interface DayEvents extends Day {
    events?: CalendarEvent[]
}

export interface Week {
    days: Array<Day>
}

export type Language = { [k: string]: string}

export interface CalendarSpec {
    municipality: string
    address: string
}
export interface SubscriptionData extends FirebaseDocument{
    calendars: Array<CalendarSpec>
    token?: string
    oldtokens?: Array<string>
    created?: Date
    updated?: Date
}
export interface Subscription {
    token: string
    municipality: string
    address: string,
    type?: string
    id?: string
}

type FirebaseDataCompat = { [key: string]: string }

export interface FirebaseCloudMessageData extends FirebaseDataCompat{
    type: GarbageType | SubscribeOperation
    municipality: string
    address: string
    id: string
}
export interface FirebaseCloudMessage {
    data: FirebaseCloudMessageData
    token: string
}

export interface TokenChange {
    old: string
    now: string
}
export interface SubscriptionChanges {
    token: boolean | TokenChange
    calendars: boolean | CalendarSpecChanged
}

export interface CalendarSpecChanged {
    removed: CalendarSpec[]
    added: CalendarSpec[]
}

export interface Toast {
    type: string
    size: string
    position: string
    msg: string
    click?: Function
}


export interface TypeDate {
    type: GarbageType
    date: Date
}

export interface IConverter {
    get(addressInput: string): Promise<CalendarData>
}

export interface FirebaseSentMessages {
    count: number
    success: boolean
    fcms: string[]
}


export interface MunicipalityRespons extends FirebaseDocument {
    result: string
}
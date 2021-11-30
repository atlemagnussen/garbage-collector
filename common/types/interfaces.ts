

type GarbageType = "food" | "paper" | "rest" | "xmasTree"
type SubscribeOperation = "unsubscribed" | "subscribed"

type CalendarDataType = { 
    [k in GarbageType]: Array<string>
}

type FirebaseOps = "createOrUpdate" | "delete"
interface FirebaseOperation {
    operation: FirebaseOps
    success: boolean
    id?: string
}

interface FirebaseDocument {
    _id?: string
}

interface CalendarData extends CalendarDataType, FirebaseDocument {
    hash: string
    year: string
    address: Array<string>
    municipality?: string
    title?: string
    isEmpty?: boolean
}
interface CalendarEvent {
    type: GarbageType
    color: string
    date: Date
}

interface CalendarEventsData {
    municipality: string,
    address: string,
    year: number
    garbageEvents: Array<CalendarEvent>
}

interface BrowserRoute {
    path: string
    param: string
    action: string
}
interface Route {
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
type Colors = { [k in GarbageType]: string }
interface Municipality {
    name?: string
    colors?: Colors
}


interface Day {
    date: Date
    day: number
    notThisMonth: boolean
}

interface Week {
    days: Array<Day>
}

type PrevRatio = { [k: string]: number}

type Language = { [k: string]: string}

interface CalendarSpec {
    municipality: string
    address: string
}
interface SubscriptionData extends FirebaseDocument{
    calendars: Array<CalendarSpec>
    token?: string
    oldtokens?: Array<string>
}
interface Subscription {
    token: string
    municipality: string
    address: string,
    type?: string
    id?: string
}

type FirebaseDataCompat = { [key: string]: string }

interface FirebaseCloudMessageData extends FirebaseDataCompat{
    type: GarbageType | SubscribeOperation
    municipality: string
    address: string
    id: string
}
interface FirebaseCloudMessage {
    data: FirebaseCloudMessageData
    token: string
}

interface TokenChange {
    old: string
    now: string
}
interface SubscriptionChanges {
    token: boolean | TokenChange
    calendars: boolean | CalendarSpecChanged
}

interface CalendarSpecChanged {
    removed: CalendarSpec[]
    added: CalendarSpec[]
}

interface Toast {
    type: string
    size: string
    position: string
    msg: string
    click?: Function
}


interface TypeDate {
    type: GarbageType
    date: Date
}

interface IConverter {
    get(addressInput: string): Promise<CalendarData>
}

interface FirebaseSentMessages {
    count: number
    success: boolean
    fcms: string[]
}


interface MunicipalityRespons extends FirebaseDocument {
    result: string
}
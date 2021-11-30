class CalendarService {
    events: Array<CalendarEvent>
    redDaysConfig: any
    redDays: any
    thisYear: number
    constructor() {
        this.thisYear = new Date().getFullYear()
        this.events = []
        this.redDaysConfig = {
            "2019": [
                "0-1",
                "3-18",
                "3-19",
                "3-22",
                "4-1",
                "4-17",
                "4-30",
                "5-10",
                "11-25",
                "11-26"
            ]
        }
        this.redDays = {}
        this.init()
    }
    init() {
        for (const y in this.redDaysConfig) {
            const yr = parseInt(y)
            if (this.redDaysConfig.hasOwnProperty(y)) {
                const mds = this.redDaysConfig[y]
                this.redDays[y] = []
                if (mds && Array.isArray(mds)) {
                    for (let i = 0; i < mds.length; i++) {
                        const md = mds[i]
                        const date = this.getDateFromMdString(md, yr)
                        if (date) {
                            this.redDays[y].push(date)
                        }
                    }
                }
            }
        }
    }
    isRedDay(date: Date) {
        if (date.getDay() === 0) {
            return true
        }
        const y = date.getFullYear()
        if (this.redDays && this.redDays[y] && Array.isArray(this.redDays[y])) {
            const arr: Array<Date> = this.redDays[y]
            return arr.some((a) => a.toISOString() === date.toISOString())
        }
        return false
    }
    getDateFromMdString(md: string, y: number) {
        let year = y
        if (!y) {
            year = this.thisYear
        }
        const mmdd = md.split('-')
        if (mmdd[0] && mmdd[1]) {
            const month = parseInt(mmdd[0])
            const day = parseInt(mmdd[1])
            const date = new Date(Date.UTC(year, month, day))
            return date
        }
        return null
    }
    
    getEventsByDate(y: number, m: number, d: number) {
        const date = new Date(Date.UTC(y, m, d))
        let events = null
        if (this.events && this.events.length > 0) {
            events = this.events.filter((e) => e.date.getTime() === date.getTime())
            if (events.length === 0) {
                return null
            }
        }
        return events
    }
}

export default new CalendarService()

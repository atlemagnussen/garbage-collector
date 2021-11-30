import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import {ref, createRef, Ref} from "lit/directives/ref.js"
import { calendarData } from "@app/store/calendarDataStore"
import { Subscription } from "rxjs"
import { MonthDays } from "./monthDays"
import lang from "@app/services/lang"

@customElement('calendar-widget')
export class CalendarWidget extends LitElement {
    private observer: IntersectionObserver | null = null
    private months: Array<number> = [0,1,2,3,4,5,6,7,8,9,10,11]
    private sub = Subscription.EMPTY
    private data: CalendarEventsData = {year: 0, garbageEvents: [], municipality: "", address: ""}
    private daysView: Ref<HTMLInputElement> = createRef();
    private monthLabel = ""
    private doScroll = false
    static styles = css`
        :host {
            flex-grow: 1;
            flex-shrink: 0;
            margin-top: 0.2rem;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            --main-text-color: rgb(95, 95, 95);
            --week-head-color: rgb(230, 230, 230, 0.9);
            --week-odd-color: rgb(255, 255, 255, 0.9);
            --inactive-color: rgb(150, 150, 150);
            font-size: 1.3rem;
        }

        .head {
            flex-grow: 1;
            flex-shrink: 1;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin: 0;
            padding: 0.6rem;
            height: 3rem;
        }
        .vertical-center {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100%;
            height: 100%;
        }
        
        .head .month-year {
            margin: auto 2px;
            color: white;
            margin-left: 0.2rem;
        }
        .arrow-right {
            width: 0; 
            height: 0; 
            border-top: 0.7rem solid transparent;
            border-bottom: 0.7rem solid transparent;
            border-left: 0.7rem solid white;
            margin: 0 auto;
        }
        .arrow-left {
            width: 0; 
            height: 0; 
            border-top: 0.7rem solid transparent;
            border-bottom: 0.7rem solid transparent; 
            border-right:0.7rem solid white;
            margin: 0 auto;
        }
        .left, .right {
            width: 2rem;
            cursor: pointer;
        }
        .left:hover .arrow-left {
            border-right-color: var(--blue);
        }
        .right:hover .arrow-right {
            border-left-color: var(--blue);
        }
        .mid-left, .mid-right {
            display: none;
        }
        .mid-right {
            cursor: pointer;
        }
        .mid-right:hover .toggle-calendar {
            color: var(--blue);
        }
        .mid-right .toggle-calendar.on {
            color: var(--blue-trans);
        }
        h2 {
            margin: 0;
            padding: 0;
            font-size: 1.75rem;
        }
        .capitalize {
            text-transform: capitalize;
        }
        .days-view {
            flex-grow: 1;
            flex-shrink: 0;
            display: flex;
            flex-direction: row;
            overflow-x: hidden;
            scroll-snap-type: x mandatory;
        }
        .week-header .day-header {
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: 0;
            text-align: center;
        }
        
        .week-header{
            margin-left: 0.2rem;
            margin-right: 0.2rem;
        }
        .week-header {
            display: flex;
            flex-direction: row;
            background: var(--week-head-color);
            padding: 0.3rem 0;
            border-radius: 3px 3px 0 0;
        }

        /* whole-year */
        @media (min-width: 1281px) {
            .mid-left, .mid-right {
                display: inline-block;
                width: 2rem;
            }
            .left, .right {
                display: none;
            }
            .head .month-year.month {
                display: none;
            }
        }
        /* mobile */
        @media only screen and (max-width : 640px) {
            .mid-left, .mid-right {
                display: none;
            }
            .date {
                font-size: 1rem;
            }
            h2 {
                font-size: 1.2rem;
            }
            .days-view {
                overflow-x: scroll;
            }
        }

    `

    connectedCallback() {
        super.connectedCallback()
        this.sub = calendarData.subscribe(value => {
            this.data = value
            this.doScroll = true
            this.requestUpdate()
        })
        this.setupObserver()
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        this.sub.unsubscribe()
        this.observer?.disconnect()
    }
    nextMonth() {
        const scrollLength = this.daysView.value!.clientWidth;
        this.daysView.value!.scrollBy({"top": 0, "left": scrollLength, "behavior": "smooth"});
    }
    prevMonth() {
        const scrollLength = this.daysView.value!.clientWidth;
        this.daysView.value!.scrollBy({"top": 0, "left": -scrollLength, "behavior": "smooth"});
    }
    async scrollToCurrentMonth() {
        await this.updateComplete
        const daysView = this.daysView.value
        if (!daysView || !this.doScroll)
            return
        const scrollLength = daysView!.clientWidth;
        const month = new Date().getMonth()
        if (month > 0) {
            this.doScroll = false
            daysView!.scrollTo({"top": 0, "left": scrollLength * month, "behavior": "auto"});
        }
    }
    setupObserver() {
        const handleIntersect = (entries: Array<IntersectionObserverEntry>, observer: IntersectionObserverInit) => {
            for (const entry of entries) {
                const el = entry.target as MonthDays
                if (entry.isIntersecting) {
                    const month = el.month
                    this.monthLabel = lang(`${month}m`)!
                    this.requestUpdate()
                }
            }
        }

        const options:IntersectionObserverInit = {
            root: this.daysView.value,
            rootMargin: "2px",
            threshold: 0.8
        }

        this.observer = new IntersectionObserver(handleIntersect, options)
        
    }
    render() {
        const head = html`
            <div class="head">
                <div class="vertical-center left" @click=${this.prevMonth}>
                    <div class="arrow-left"></div>
                </div>
                <div class="vertical-center mid-left"></div>
                <div class="div-center">
                    <h2 class="month-year">${this.monthLabel}&nbsp;
                    ${this.data.year > 2000 ? this.data.year : ""}</h2>
                </div>
                <div class="vertical-center mid-right"></div>
                <div class="vertical-center right" @click=${this.nextMonth}>
                    <div class="arrow-right"></div>
                </div>
            </div>
            <div class="week-header"></div>`

            if (this.data && this.data.year && this.data.municipality && this.data.address) {
                const calendar = html`
                    <div class="days-view" ${ref(this.daysView)}>
                        ${this.months.map(m => {
                            return html`<month-days .year=${this.data.year} .month=${m}></month-days>`
                        })}
                        
                    }
                    </div>
                `
                return html`${head}${calendar}`
            }
        return head
    }
    
    updated() {
        if (this.daysView.value?.hasChildNodes) {
            const children =  this.daysView.value?.childNodes
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                if (child.nodeName == "MONTH-DAYS")
                    this.observer?.observe(child as HTMLElement)
            }
            this.scrollToCurrentMonth()
        }
        
    }
}
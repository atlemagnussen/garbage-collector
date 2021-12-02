import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import {getColor} from "@app/services/colorService"
import {formatterNoDateOnly} from "@app/services/dateTime"
import { DayEvents } from "@common/types/interfaces"
@customElement('calendar-day')
export class CalendarDay extends LitElement {
    private today = new Date
    static styles = css`
        :host {
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: 0;
            text-align: center;
        }
        
        .date.iftoday {
            color: var(--blue-trans);
            font-weight: 1000;
            text-decoration: underline;
        }
        .date.red {
            color: var(--red-trans);
        }
        .date.notthismonth {
            color: var(--inactive-color);
        }
        .events {

            height: 1rem;
        }
        .event {
            display: inline-block;
        }
        .event svg {
            display: inline-block;
            height: 0.9rem;
            width: 0.9rem;
            margin-left: 0.05rem;
        }
        .event.red {
            background: red;
        }
        .event.black {
            background: black;
        }
        .event.green {
            background: var(--green);
        }
        .event.brown {
            background: var(--brown);
        }
    `
    @property({attribute: false})
    day: DayEvents

    constructor() {
        super()
        this.day = { day: 0, date: new Date(), notThisMonth: false}
    }
    ifToday(d: Date) {
        return (this.today.getFullYear() == d.getFullYear() &&
            this.today.getMonth() == d.getMonth() &&
            this.today.getDate() == d.getDate())
    }
    render() {
        const iftoday = this.ifToday(this.day.date)
        const dayClasses = { date: true, notthismonth: this.day.notThisMonth, iftoday}
        const dateFormatted = formatterNoDateOnly.format(this.day.date)
    
        this.setAttribute("title", dateFormatted)
        return html`
            <div class=${classMap(dayClasses)}>
                ${this.day.day}
            </div>
            <div class="events">
                ${this.day.events?.map(e => {
                    const id = `${e.type}-icon`
                    const href = `icons.svg#${id}`
                    const color = getColor(e.type)
                    
                    return html`
                        <div class="event ${e.type}">
                            <svg xmlns="http://www.w3.org/2000/svg">
                                <use href="${href}" fill="${color}"/>
                            </svg>
                        </div>
                    `
                })}
            </div>
        `
    }
}
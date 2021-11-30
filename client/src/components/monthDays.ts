import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import { getMonthWeeks } from "@app/services/monthService"
@customElement('month-days')
export class MonthDays extends LitElement {
    
    static styles = css`
        :host {
            margin-bottom: 0.2rem;
            flex-basis: 100%;
            flex-grow: 1;
            flex-shrink: 0;
            scroll-snap-align: start;
        }
        .month-head {
            display: none;
        }
        .week {
            display: flex;
            flex-direction: row;
            padding: 0.5rem 0;
        }
        
        .week:nth-child(even) {
            background: var(--week-head-color);
        }
        .week:nth-child(odd) {
            background: var(--week-odd-color);
        }
        .week:last-child {
            border-radius: 0 0 3px 3px;
        }
        
        /* whole-year */
        @media (min-width: 1281px) {
            :host {
                font-size: 0.8rem;
                font-weight: 600;
                flex-basis: 32%;
                flex-grow: 1;
                flex-shrink: 0;
                margin-left: 0.1rem;
            }
            .month-head {
                display: flex;
                flex-direction: row;
                justify-content: center;
                color: white;
            }
            .month-head h3 {
                font-size: 1.3rem;
                margin: 0;
                padding-bottom: 0.5rem;
            }
            .days-view {
                flex-basis: auto;
                flex-grow: 1;
                flex-shrink: 1;
                flex-wrap: wrap;
                overflow: hidden;
            }
            .week-header {
                display: none;
            }
        }
    `
    @property({attribute: false})
    year: number

    @property({attribute: false})
    month: number

    constructor() {
        super()
        this.month = 0
        this.year = 0
    }
    
    render() {
        if ((!this.month && this.month > 0) || !this.year)
            return html`<p>N/A</p>`

        const weeks = getMonthWeeks(this.year, this.month)
        return html`
            <div class="month-head">
                <h3>${this.year}-${this.month}</h3>
            </div>
            ${weeks.map(w => {
                return html`
                    <div class="week">
                        ${w.days.map(d => {
                            return html`
                                <calendar-day .day=${d}></calendar-day>
                            `
                        })}
                    </div>
                `
            })}
        `
    }
}
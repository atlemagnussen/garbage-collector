import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import { GarbageType } from "@common/types/interfaces"
import { toggleGarbageTypeFilter, garbageTypeFilter, allGarbageTypes } from "@app/store/calendarDataStore"
import { observe } from "@app/directives/ObservableDirective"
import { classMap } from "lit/directives/class-map.js"

@customElement('garbage-type-info')
export class GarbageTypeInfo extends LitElement {
    
    static styles = css`
        :host {
            height: 4rem;
            display: flex;
            flex-direction: row;
            justify-content: center;
            background: var(--white-trans);
            box-sizing: border-box;
            margin: 0.2rem 0.2rem 0 0.2rem;
            border-radius:3px;
        }
        .filtered {
            background: var(--blue-trans);
        }
    `
    
    @property({attribute: true})
    municipality: string


    constructor() {
        super()
        this.municipality = ""
    }

    doRender(filter: GarbageType[]) {
        if (!allGarbageTypes)
            return html`<span>none</span>`
        return allGarbageTypes.map(type => {
            const filtered = filter.includes(type)
            const filterClass = { filtered }
            return html`
                <garbage-type-icon 
                    class=${classMap(filterClass)} 
                    .type=${type}
                    @click=${() => toggleGarbageTypeFilter(type)}></garbage-type-icon>
            `
        })
    }
    render() {
        return html`
            ${observe(garbageTypeFilter, this.doRender)}
        `
    }
}
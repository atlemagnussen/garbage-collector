import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"
import {subs} from "@app/services/user"
import { goto } from "@app/routing/router"
import { observe } from "@app/directives/ObservableDirective"
import { SubscriptionData } from "@common/types/interfaces"
@customElement('subscription-list')
export class SubscriptionList extends LitElement {
    
    static styles = css`
        :host {
            box-sizing: border-box;
            display: block;
        }
        a {
            display: block;
            color: white;
            margin-bottom: 0.3rem;
        }
    `

    list(subsCals: SubscriptionData) {
        if (!subsCals || !subsCals.calendars || subsCals.calendars.length == 0)
            return html`<span>Ingen aktive varsler</span>`
        return subsCals.calendars?.map(c => {
            return html`
                <a href="${c.municipality}/${c.address}" @click=${goto}>
                    ${c.address.split("-").join(" ")} - ${c.municipality}
            </a>`
        })
    }

    render() {
        return html`
            ${observe(subs, this.list)} 
        `
    }
}
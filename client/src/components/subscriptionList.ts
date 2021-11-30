import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"
import {subs} from "@app/services/user"
import { goto } from "@app/routing/router"
import { observe } from "@app/directives/ObservableDirective"
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

    list(subsCals: Subscriptions) {
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
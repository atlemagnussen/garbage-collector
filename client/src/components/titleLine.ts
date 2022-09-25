import {LitElement, html, css, unsafeCSS} from "lit"
import {customElement, property, state} from "lit/decorators.js"
import { materialIconsStyle } from "@app/style/stylesheets"
import {toggleDisplaySearch} from "@app/store/pageStateStore"
import {isSubscribing} from "@app/store/calendarDataStore"
import type { Subscription } from "rxjs"
import messaging from "@app/services/messaging"
import { selectedMun } from "@app/store/munStore"
import { observe } from "@app/directives/ObservableDirective"
import { Municipality } from "@common/types/interfaces"
import toast from "@app/services/toastService"

@customElement('title-line')
export class TitleLine extends LitElement {
    private isSub = false
    private subs: Subscription[] = []
    private mun: Municipality = {}

    @state()
    private loading = false

    private $component = this
    static styles = css`
        :host {
            display: block;
            box-sizing: border-box;
        }
        .titleline {
            background: var(--white-trans);
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin: 0.2rem 0.2rem 0 0.2rem;
            border-radius:3px;
        }
        h3 {
            margin: 0.3rem;
            padding: 0.3rem;
        }
        .empty {
            width: 40px;
        }
        .btn {
            display: inline-block;
            cursor: pointer;
            padding: 0.1rem;
        }
        div.button {
            margin: 0.3rem;
            cursor: pointer;
        }
        @media only screen and (max-width : 640px) {
            h2 {
                font-size: 1.2rem;
            }
        }
        ${unsafeCSS(materialIconsStyle)}
    `
    @property({attribute: true})
    address: string = ""

    constructor() {
        super()
    }
    connectedCallback() {
        super.connectedCallback()
        this.subs.push(selectedMun.subscribe(value => this.mun = value))
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        this.subs.map(s => s.unsubscribe())
    }

    async toggleSub() {
        if (this.loading)
            return
        
        this.loading = true
        try {
            if (this.isSub) {
                const res = await messaging.unsubscribe(this.mun.name!, this.address)
                console.log(`unsub=${res}`)
            } else {
                const res = await messaging.subscribe(this.mun.name!, this.address)
                console.log(`sub=${res}`)
            }
        }
        catch (e: any) {
            toast.error(e.message)
        }
        finally {
            this.loading = false
        }
    }
    
    render() {
        
        return html`
            <div class="titleline">
                <div class="button" @click=${toggleDisplaySearch}>
                    <span class="material-icons">search</span>
                </div>
                <h2 class="title">${this.address.split("-").join(" ")}</h2>
                ${this.loading ?
                    html`<div class="button">
                        <garbage-working></garbage-working>
                    </div>`
                : html`
                    <div class="button" @click=${this.toggleSub}>
                        ${observe(isSubscribing, (isSub: boolean) => {
                            let bellIcon = isSub ? "notifications_active" : "notifications"
                            this.isSub = isSub
                            
                            return html`<span class="material-icons">${bellIcon}</span>`
                        })}
                    </div>
                    `
                }
            </div>
        `
    }
}
import { gotoPath } from "@app/routing/router"
import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"
import {ifDefined} from "lit/directives/if-defined.js"
import {munStore} from "@app/store/munStore"
import { Subscription } from "rxjs"
import { Municipality } from "@common/types/interfaces"
@customElement('home-view')
export class HomeView extends LitElement {
    private muns: Array<Municipality> = []
    private sub = Subscription.EMPTY
    static styles = css`
        
    `
    connectedCallback() {
        super.connectedCallback()
        this.sub = munStore.subscribe(value => {
            this.muns = value
            this.requestUpdate()
        })
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        this.sub.unsubscribe()
    }
    onInput(e: Event) {
        const input = e.currentTarget as HTMLInputElement
        const val = input.value.toLowerCase();
        if (this.muns.some(m => m.name === val)) {
            gotoPath(`/${val}`)
        }
    }
    render() {
        return html`
            <label for="mun">Kommune</label>
            <input id="mun" type="text" list="dtMun" @input=${this.onInput}></input>
            <datalist id="dtMun">
                ${this.muns.map(m => {
                    return html`<option value=${ifDefined(m.name)}></option>`
                })}
            </datalist>
        `
    }
}

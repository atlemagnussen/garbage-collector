import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import data from "@app/services/data"
import { selectedMun } from "@app/store/munStore"
import { Subscription } from "rxjs"
import { gotoPath } from "@app/routing/router"
import { displaySearch, hideDisplaySearch } from "@app/store/pageStateStore"
import toast from "@app/services/toastService"
import { Municipality } from "@common/types/interfaces"

@customElement('search-form')
export class SearchForm extends LitElement {
    private mun: Municipality = {}
    private subs = [Subscription.EMPTY]
    private show = true
    static styles = css`
        :host {
            box-sizing: border-box;
            display: block;
        }
        input.search{
            width: 100%;
            padding: 0.5em 0.5em;
            font-size: 1.2em;
            border-radius: 3px;
            border: 1px solid #D9D9D9;
        }
        button {
            font-size: 1.2em;
            border-radius: 3px;
        }
        button:disabled, search-form input:disabled{
            color: var(--green);
            cursor: wait;
        }
        span{
            background: var(--light-grey-trans);
        }
        span.error{
            color: red;
        }
        .subpart {
            margin: 5px;
        }
    `
    connectedCallback() {
        super.connectedCallback()
        this.subs.push(selectedMun.subscribe(value => this.mun = value))
        this.subs.push(displaySearch.subscribe(show => {
            this.show = show
            this.requestUpdate()
        }))
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        this.subs.map(s => s.unsubscribe)
    }
    onKeyUp(e: KeyboardEvent) {
        if (e.key == "13") {
            e.preventDefault();
            this.search();
        }
    }
    async search() {
        const inputSearch: HTMLInputElement = this.shadowRoot?.getElementById("inputSearchAddress") as HTMLInputElement
        if (inputSearch && inputSearch.value) {
            
            const address = inputSearch.value.trim().toLocaleLowerCase()
            
            const muni = this.mun?.name as string
            const d = await data.getCalendar(muni, address);
            if (d) {
                toast.success("Fant avfallskalender")
                const pathAddr = address.split(" ").join("-")
                gotoPath(`/${muni}/${pathAddr}`)
                hideDisplaySearch()
            } else {
                toast.error(`Kunne ikke finne ${address}`)
            }
        }
    }
    
    onClick(e: Event) {
        e.preventDefault()
        this.search()
    }
    render() {
        if (!this.show)
            return html`<span class="no-show"></span>`
        return html`
            <div class="subpart">
                <input type="search" class="search" placeholder="søk" 
                    id="inputSearchAddress" name="searchaddress"
                    autofocus autocomplete="street-address"
                    @keyup=${this.onKeyUp}>
                </input>
                <button @click=${this.onClick}>Søk</button>
                <span id="msg"></span>
            </div>
        `
    }
}
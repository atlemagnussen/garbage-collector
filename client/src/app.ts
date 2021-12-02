import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"
import { langInit } from "@app/services/lang"
@customElement('main-app')
export class MainAppComponent extends LitElement {
    private initialized = false
    static styles = css`
        
    `

    constructor() {
        super()
        this.init()
    }

    async init() {
        await langInit()
        this.initialized = true
        this.requestUpdate()
    }
    
    protected createRenderRoot() {
       return this
    }

    connectedCallback() {
        super.connectedCallback()
        if (!history.state) {
            window.history.replaceState({ path: window.location.pathname }, "", window.location.href)
        }
    }

    render() {
        if (!this.initialized)
            return html`<span></span>`

        return html`
            <main role="main">
            <aside>
                
            </aside>

            <section class="middle">
                <article>
                    <header>
                        <header-view></header-view>
                    </header>
                    <container-view></container-view>
                    <subscription-list></subscription-list>
                    <footer>
                        <subscriptions-list></subscriptions-list>
                    </footer>
                </article>
            </section>

            <aside></aside>
            <toast-messages></toast-messages>
        </main>
        `
    }
}

import { curRoute } from "@app/routing/router"

const html = String.raw
class ContainerView extends HTMLElement {
    private component: string = "home-view"
    private param: string = ""
    constructor() {
        super()
        this.attachShadow({mode: 'open'}) //this.shadowRoot will be set
        curRoute.subscribe(route => {
            this.component = route.component
            if (route.param)
                this.param = route.param as string
            this.update()
        })
    }
    
    connectedCallback() {
        this.update()
    }
    update() {
        const view = document.createElement(this.component)
        if (this.param)
            view.setAttribute("param", this.param)
        this.removeAllChildren()
        this.shadowRoot?.appendChild(view)
    }
    removeAllChildren() {
        var child = this.shadowRoot?.lastElementChild
        while (child) {
            this.shadowRoot?.removeChild(child)
            child = this.shadowRoot?.lastElementChild
        }
    }
}
customElements.define('container-view', ContainerView);
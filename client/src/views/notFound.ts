import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"

@customElement('not-found')
export class NotFound extends LitElement {
    
    static styles = css`
        
    `
    render() {
        return html`<p>not found</p>`
    }
}

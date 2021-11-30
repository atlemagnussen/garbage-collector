import {LitElement, html, css} from "lit"
import {customElement} from "lit/decorators.js"

@customElement('about-view')
export class AboutView extends LitElement {
    
    static styles = css`
        
    `
    
    render() {
        return html`
            <p>About</p>
        `
    }
}

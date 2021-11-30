import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"

@customElement('municipality-view')
export class MunicipalityView extends LitElement {
    
    static styles = css`
        :host {
            box-sizing: border-box;
            display: block;
        }
    `
    
    @property({attribute: true})
    param: string

    constructor() {
        super()
        this.param = "" //address
    }

    render() {
        return html`
            <garbage-type-info></garbage-type-info>
            <search-form></search-form>
            <title-line address=${this.param}></title-line>
            <calendar-widget></calendar-widget>
        `
    }
}
import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import {getColor} from "@app/services/colorService"
import { GarbageType } from "@common/types/interfaces"

@customElement('garbage-type-icon')
export class GarbageTypeIcon extends LitElement {
    private types: Array<GarbageType> = ["rest", "food", "paper", "xmasTree"]
    static styles = css`
        :host {
            display: block;
        }
        figure {
            display: inline-block;
            text-align: center;
        }
        figure svg {
            margin: 0 auto;
            vertical-align: top;
            width: 2rem;
            height: 2rem;
        }
        figure figcaption{
            text-transform: capitalize;
            text-align: center;
        }
        figure.food {
            color: var(--brown);
        }
        figure.paper {
            color: var(--green);
        }
        figure.xmasTree {
            color: red;
        }
        @media only screen and (max-width : 640px) {
            figure {
                margin: 0.5rem 0.5rem;
            }
        }
    `
    
    @property({attribute: false})
    type: GarbageType | null = null

    render() {
        if (!this.type)
            return html`<figure><figcaption>notype</figcaption></figure>`

        const id = `${this.type}-icon`
        const href = `icons.svg#${id}`
        const color = getColor(this.type)

            
        return html`
            <figure>
                <svg xmlns="http://www.w3.org/2000/svg">
                    <use href="${href}" fill="${color}"/>
                </svg>
                <figcaption></figcaption>
            </figure>
        `
    }
}
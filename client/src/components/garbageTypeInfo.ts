import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import {getColor} from "@app/services/colorService"

@customElement('garbage-type-info')
export class GarbageTypeInfp extends LitElement {
    private types: Array<GarbageType> = ["rest", "food", "paper", "xmasTree"]
    static styles = css`
        :host {
        
            display: block;
        }
        
        .main {
            height: 4rem;
            display: flex;
            flex-direction: row;
            justify-content: center;
            background: var(--white-trans);
            box-sizing: border-box;
            margin: 0.2rem 0.2rem 0 0.2rem;
            border-radius:3px;
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
    
    @property({attribute: true})
    municipality: string


    constructor() {
        super()
        this.municipality = ""
    }

    render() {
        return html`
            <div class="main">
                ${this.types.map(type => {
                    const id = `${type}-icon`
                    const href = `icons.svg#${id}`
                    const color = getColor(type)
                    return html`
                        <figure>
                            <svg xmlns="http://www.w3.org/2000/svg">
                                <use href="${href}" fill="${color}"/>
                            </svg>
                            <figcaption>${type}</figcaption>
                        </figure>
                    `
                })}
            </div>
        `
    }
}
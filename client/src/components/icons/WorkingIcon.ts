import {LitElement, svg, css} from "lit"
import {customElement} from "lit/decorators.js"

@customElement('garbage-working')
export class GarbageWorking extends LitElement {
    static styles = css`
        :host {
            display: inline-flex;
            box-sizing: border-box;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            vertical-align: middle;
            height: var(--garbage-medium, 2rem);
            width: var(--garbage-medium, 2rem);
            user-select: none;
        }
        svg {
            height: var(--garbage-medium, 2rem);
            width: var(--garbage-medium, 2rem);
            fill: none;
        }
        #clock {
            fill: var(--blue);
            stroke: var(--default);
        }
        #minute {
            animation: rotate 1s infinite linear;
            transform-origin: 50px 50px;
        }
        #hour {
            animation: rotate 12s infinite linear;
            transform-origin: 50px 50px;
        }
        @keyframes rotate {
            from {
                transform: rotate(0)
            }
            to {
                transform: rotate(360deg);
            }
        }
    `
    render() {
        
        return svg`
            <svg version="1.1" id="L2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                <circle id="clock" stroke-width="4" stroke-miterlimit="10" cx="50" cy="50" r="48"/>
                <line id="minute" fill="none" stroke-linecap="round" stroke="#fff" stroke-width="4" stroke-miterlimit="10" x1="50" y1="50" x2="85" y2="50.5">
                </line>
                <line id="hour" fill="none" stroke-linecap="round" stroke="#fff" stroke-width="4" stroke-miterlimit="10" x1="50" y1="50" x2="49.5" y2="74">
                </line>
            </svg>
        `
    }
}

import {LitElement, html, css} from "lit"
import {customElement, property} from "lit/decorators.js"
import {unsafeHTML} from "lit/directives/unsafe-html.js"

import toastStore from "@app/store/toastStore"
import { Subscription } from "rxjs"

@customElement('toast-messages')
export class ToastMessages extends LitElement {
    private sub = Subscription.EMPTY
    private toasts: Toast[] = []
    static styles = css`
        :host {
            display: block;
            position: relative;
            z-index: 999;
        }
        .toast-container {
            position: fixed;
            z-index: 1000;
        }
        .top {
            top: 15px;
        }
        .bottom {
            bottom: 15px;
        }
        .left {
            left: -500px;
            animation: slide-left 0.5s forwards;
            animation-delay: 0.5s;
        }
        @keyframes slide-left {
            100% { left: 0; }
        }
        .right {
            right: -300px;
            animation: slide-right 0.5s forwards;
            animation-delay: 0s;
        }
        @keyframes slide-right {
            100% { right: 0; }
        }
        .center {
            left: 50%;
            transform: translateX(-50%);
        }
        .toast {
            height: 38px;
            line-height: 38px;
            padding: 0 20px;
            margin: 0 15px;
            box-shadow: 0 1px 3px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(255, 255, 255, 0.98);
            color: #fff;
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            animation: fadein 1s;
            border-radius: 0.2rem;
            opacity: 0.9;
            cursor: pointer;
        }
        .big {
            height: 114px;
            max-width: 500px;
            white-space: normal;
        }
        .info {
            font-weight: bold;
            background-color: var(--info);
        }
        .success {
            background-color: var(--success);
        }
        .error {
            background-color: var(--error);
        }
        .default {
            background-color: var(--default);
        }
        @keyframes pulse {
            0% { background-color: var(--background); }
            100% { background-color: var(--red-dark); }
        }
        @keyframes fadein {
            from { opacity: 0; }
            to   { opacity: 0.8; }
        }
    `

    connectedCallback() {
        super.connectedCallback()
        this.sub = toastStore.subscribe(value => {
            this.toasts = value
            this.requestUpdate()
        })
    }
    disconnectedCallback() {
        super.disconnectedCallback()
        this.sub.unsubscribe()
    }
    top (i: number) {
        const distance = 15 + (i*44)
        return `${distance}px`
    }
    onclickToast(t: Toast) {
        if (t.click)
            t.click()
        toastStore.remove(t)
    }
    render() {
        return this.toasts.map((t, i) => {
            return html`
                <div class="toast-container ${t.position}"
                style="top: ${this.top(i)}" 
                @click=${() => this.onclickToast(t)}>
                    <div class="toast ${t.type} ${t.size}">
                        ${unsafeHTML(t.msg)}
                    </div>
                </div>
            `
        })
    }
}




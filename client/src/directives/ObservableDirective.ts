import { AsyncDirective, directive } from "lit/async-directive.js"

import { noChange, TemplateResult } from "lit"
import { Observable, Subscription } from "rxjs"
//
// observable directive that takes a template render as callback
//
class ObserveDirective extends AsyncDirective {
    observable: Observable<any> | undefined
    subscription?: Subscription
    callback: ((value: any) => TemplateResult<1> | TemplateResult<1>[]) | undefined
    // When the observable changes, unsubscribe to the old one and
    // subscribe to the new one
    render(observable: Observable<any>, callback: (value: any) => TemplateResult<1> | TemplateResult<1>[]) {
        this.callback = callback
        if (this.observable !== observable) {
            this.subscription?.unsubscribe()
            this.observable = observable
            if (this.isConnected)  {
                this.subscribe()
            }
        }
        return noChange
    }
    
    // call setvalue with the template render and value as input
    subscribe() {
        this.subscription = this.observable?.subscribe((v: any) => {
            this.setValue(this.callback?.(v))
        })
    }
    
    disconnected() {
        this.subscription?.unsubscribe!()
    }
    
    reconnected() {
        this.subscribe()
    }
}
export const observe = directive(ObserveDirective)

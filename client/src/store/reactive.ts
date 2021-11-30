import { cloneDeep } from "lodash-es"
import { map } from "rxjs/operators"
import { BehaviorSubject, Observable } from "rxjs"
import { getLocalStorage, setLocalStorage} from "@app/services/localStorageService"

export class SvelteSubject<T> extends BehaviorSubject<T> {
    /**
     * 
     * @typeParam T Comment for type `T`
     */
    set(value: T) {
        super.next(value)
    }
    /**
    * @returns cloned `T` value
    */
    get(): T {
        const value = super.getValue();
        return cloneDeep(value)
    }
}

export class StoredSubject<T> extends SvelteSubject<T> {
    /**
     * subject backed by local storage
     * @param key: string for local storage item
     */
    private key: string
    constructor(key: string, initValue: any) {
        let value = getLocalStorage(key)
        if (!value)
            value = initValue
        super(value)
        this.key = key
    }
    set(value: T) {
        this.next(value)
    }
    next(value: T) {
        setLocalStorage(this.key, value)
        super.set(value)
    }
}

export class StringAppendableSubject extends SvelteSubject<string> {
    append(app:string) {
        const val = super.get()
        super.set(`${val}${app}`)
    }
}

export class TogglableSubject extends SvelteSubject<boolean> {
    toggle() {
        const val = super.get()
        super.set(!val)
    }
}

export const clonedObservable = <T>(subject: BehaviorSubject<T>): Observable<T> => {
    return subject.pipe(map(data => cloneDeep(data)));
}
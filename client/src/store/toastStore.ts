import { SvelteSubject } from "@app/store/reactive"
import { Toast } from "@common/types/interfaces"

class ToastSubject extends SvelteSubject<Toast[]> {

    add(toast:Toast, timeout?: number) {
        if (!timeout)
            timeout = 20
        const list = this.get()
        list.push(toast);
        this.next(list)
        setTimeout(() => {
            this.remove(toast);
        }, timeout * 1000);
    }

    remove(toast: Toast) {
        const list = this.getValue()
        const index = list.indexOf(toast);
        if (index > -1) {
            list.splice(index, 1);
            this.next(list)
        }
    }

    reset(){
        this.next([])
    }
}

export default new ToastSubject([])
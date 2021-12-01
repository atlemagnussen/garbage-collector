import toastStore from "@app/store/toastStore"
import { Toast } from "@common/types/interfaces"
import type { MessagePayload } from "@firebase/messaging"

class ToastService {
    info(msg: string) {
        const toast: Toast = {
            type: "info",
            size: "",
            position: "left",
            msg
        };
        toastStore.add(toast, 10);
    }
    biginfo(msg: string, click?: Function) {
        const toast: Toast = {
            type: "info",
            size: "big",
            position: "left",
            msg
        };
        if (click)
            toast.click = click;
        toastStore.add(toast, 20);
    }
    error(msg: string) {
        const toast: Toast = {
            type: "error",
            size: "normal",
            position: "right",
            msg
        };
        toastStore.add(toast);
    }
    success(msg: string) {
        const toast: Toast = {
            type: "success",
            size: "normal",
            position: "right",
            msg
        };
        toastStore.add(toast);
    }
    showNotification(payload: MessagePayload) {
        let text = "notifikasjon"
        if (payload.data) {
            const data = payload.data;
            if (data.type) {
                if (data.type.includes("subscr")) {
                    text = data.type
                } else {
                    text = `${data.date}, ${data.type}`
                }
            }
            text = `${text}:\n${data.address}, ${data.municipality}`;
        }
        
    }
}

export default new ToastService();

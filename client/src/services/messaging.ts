import {firebaseApp} from "@app/services/firebaseInit"
import { getMessaging, Messaging, getToken, onMessage } from "firebase/messaging"
import user from "@app/services/user"
import config from "@app/config"
import rest from "@app/services/restService"
import toast from "@app/services/toastService"

import {setupWb} from "@app/services/swloader"
import { Subscription } from "@common/types/interfaces"
class GMessages {
    private vapidPublicKey = ""
    private currentToken = ""
    private messaging: Messaging = getMessaging(firebaseApp)
    private monitoringAlready = false
    constructor() {
        if (config.val.vapidPublicKey) {
            this.vapidPublicKey = config.val.vapidPublicKey;
        } else {
            console.info("no vapid public key");
        }
        
        this.init();
    }
    async init() {
        const reg = await setupWb()
        console.log(`user.subscriptionId=${user.subscriptionId}`);
        if (config.val.firebase) {
            try {
                this.currentToken = await getToken(this.messaging, { 
                        vapidKey: this.vapidPublicKey,
                        serviceWorkerRegistration: reg
                    })
                user.token = this.currentToken
            }
            catch (err) {
                console.error(err)
            }
        }
        onMessage(this.messaging, (payload) => {
            toast.showNotification(payload)
        })
        user.syncSubscriptionsFromServer();
    }
    async subscribe(m: string, a: string) {
        if (!config.val.firebase) {
            return false;
        }
        const alreadySubscribing = await user.doesSubscribeToCalendar(m, a);
        if (alreadySubscribing) {
            return false;
        }
        try {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                //await this.getIidToken();
                if (this.currentToken) {
                    const sub: Subscription = {
                        "token": this.currentToken,
                        "municipality": m,
                        "address": a
                    };
                    if (user.subscriptionId) {
                        sub.id = user.subscriptionId;
                    }

                    const res = await rest.post<Subscription>(config.api.subscribe, sub)
                    
                    user.addCalendarSubscription(m, a);
                    this.checkIdMatch(res.id as string);
                    console.log(res);
                    return true;
                }
            }
        } catch (err) {
            console.log('Unable to get permission to notify.', err);
        }
        return false;
    }
    async unsubscribe(m: string, a: string) {
        if (!config.val.firebase) {
            return false;
        }
        const alreadySubscribing = await user.doesSubscribeToCalendar(m, a);
        if (!alreadySubscribing) {
            return false;
        }
        try {
            //await this.getIidToken();
            if (this.currentToken) {
                const sub: Subscription = {
                    "token": this.currentToken,
                    "municipality": m,
                    "address": a
                };
                if (user.subscriptionId) {
                    sub.id = user.subscriptionId;
                }

                const res = await rest.post<Subscription>(config.api.unsubscribe, sub)
                user.pullCalendarSubscription(m, a);
                this.checkIdMatch(res.id as string);
                console.log(res);
                return true;
            }
        } catch (err) {
            console.log('Unable to get permission to notify.', err);
        }
        return false;
    }
    checkIdMatch(resId: string) {
        if (!user.subscriptionId) {
            console.log(`Set subscription id 1st time: ${resId}`);
            user.subscriptionId = resId;
        } else if (user.subscriptionId !== resId) {
            console.warn(`Subscription id from user mismatched the one from server\n
            user='${user.subscriptionId}'\nserv='${resId}'. Set from server`);
            user.subscriptionId = resId;
        }
    }
    // async getIidToken() {
    //     try {
    //         this.currentToken = await this.messaging.getToken();
    //         if (this.currentToken) {
    //             console.log("got current token");
    //             this.setupMonitorRefreshToken();
    //             user.token = this.currentToken;
    //             return this.currentToken;
    //         }
    //         console.log('No Instance ID token available. Request permission to generate one.');
    //     } catch (err) {
    //         console.log('An error occurred while retrieving token. ', err);
    //     }
    //     return null;
    // }
    // async setupMonitorRefreshToken() {
    //     if (this.monitoringAlready) {
    //         return;
    //     }
    //     try {
    //         this.monitoringAlready = true;
    //         this.messaging.onTokenRefresh(async () => {
    //             const refreshedToken = await this.messaging.getToken();
    //             console.log('Token refreshed.');
    //             console.log(refreshedToken);
    //             this.currentToken = refreshedToken;
    //             user.token = this.currentToken;
    //             const data = {
    //                 "id": user.subscriptionId,
    //                 "token": this.currentToken
    //             };
    //             const res = await fetch(config.api.updatesubtoken, {
    //                 "method": "POST",
    //                 "body": JSON.stringify(data),
    //                 "headers": {
    //                     "content-type": "application/json"
    //                 }
    //             });
    //             console.log(res);
    //         });
    //     } catch (err) {
    //         console.log('Unable to retrieve refreshed token ', err);
    //     }
    // }

    // setupEvents() {
    //     if (config.val.firebase) {
    //         this.messaging.onMessage((payload) => {
    //             this.showDialog(payload);
    //         });
    //     }
    // }

    unsubscribeCalendar(m: string, a: string) {
        console.log(`Unsubscribe m=${m}, a=${a}`);
        if (config.val.firebase) {
            this.unsubscribe(m, a);
        }
    }
    subscribeCalendar(m: string, a: string) {
        console.log(`Subscribe m=${m}, a=${a}`);
        if (config.val.firebase) {
            this.subscribe(m, a);
        }
    }

    // dont use firebase default sw url
    // async registerServiceWorker() {
    //     console.info("registerServiceWorker:start");
    //     if ("serviceWorker" in navigator) {
    //         console.info("registerServiceWorker:supported");
    //         const serviceworker = await navigator.serviceWorker.register("/serviceworker-fb.js", {"scope": "/"});
    //         this.messaging.useServiceWorker(serviceworker);
    //     } else {
    //         console.info("registerServiceWorker:serviceworker not supported!");
    //     }
    // }
    // updateSubElement() {
    //     if (this.subEl) {
    //         this.subEl.setAttribute("updated", new Date());
    //     } else {
    //         logger.error("Could not trigger update on subscription element");
    //     }
    //     document.dispatchEvent(new CustomEvent('subscriptionChanged', {"detail": {"time": new Date()}}));
    // }
}
export default new GMessages();

declare const self: ServiceWorkerGlobalScope
import {firebaseApp} from "@app/services/firebaseInit"
import { onBackgroundMessage, getMessaging } from "firebase/messaging/sw"
import {clientsClaim} from "workbox-core"
import {precacheAndRoute,createHandlerBoundToURL} from "workbox-precaching"
import {registerRoute, NavigationRoute} from "workbox-routing"
import type { FirebaseCloudMessageData } from "@common/types/interfaces"
import {formatNoShortDate} from "@app/funcs/dateFormatting"


clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerBoundToURL('/index.html')

const navigationRoute = new NavigationRoute(handler)
registerRoute(navigationRoute);

if (firebaseApp) {
    const messaging = getMessaging()
    onBackgroundMessage(messaging, (payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload)
        
        let title = "push notify"
        const options: NotificationOptions = {
            body: "test probably",
            icon:
                "https://storage.googleapis.com/atle-static/icons/icon-128.png",
            actions: [
                { action: "open", title: "open" },
                { action: "close", title: "close" }
            ]
        }
    
        if (payload.data) {
            const data = payload.data as FirebaseCloudMessageData
            if (data.type) {
                if (data.type.includes("subscr"))
                    title = data.type
                else {
                    const dateFormatted = formatNoShortDate(data.date)
                    title = `${dateFormatted}, ${data.type}`
                }
            } else if (data.title) {
                title = data.title;
            }
    
            if (data.address) {
                options.body = data.address;
            }
    
            if (data.type != "subscribed") {
                options.icon = `https://storage.googleapis.com/atle-static/icons/${data.type}.png`;
            }
            const dataForAction = { m: data.municipality, a: data.address };
            options.data = dataForAction;
        }
        
      
        self.registration.showNotification(title, options)
    })
} else {
    console.log("Firebase could not be initialized in serviceworker")
}

self.addEventListener("notificationclick", event => {
        event.notification.close();
        if (event.action !== "close") {
            if (
                event.notification.data &&
                event.notification.data.a &&
                event.notification.data.m
            ) {
                const d = event.notification.data;
                let route = `/${d.m}/${d.a}`;
                route = route.split(" ").join("-");
                self.clients.openWindow(route); // eslint-disable-line no-undef
            } else {
                self.clients.openWindow("/"); // eslint-disable-line no-undef
            }
        }
    },
    false
)
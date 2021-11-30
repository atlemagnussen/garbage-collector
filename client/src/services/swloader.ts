import { Workbox } from "workbox-window"
import { curRoutePath } from "@app/routing/router"

let wb: Workbox
let swRegistration: ServiceWorkerRegistration

export const setupWb = () => {
    wb = new Workbox("/sw.js")
    curRoutePath.subscribe(route => {
        if (route != "/") 
            wb.update()
    })
	wb.addEventListener("waiting", (event) => {
        console.log(event)
        wb.messageSkipWaiting()
	})
    wb.addEventListener("controlling", (event) => {
        console.log(event)
        window.location.reload()
    })
    
	return wb.register().then(reg => {
        swRegistration = reg as ServiceWorkerRegistration
        return reg
    })
}

// if ('serviceWorker' in navigator) {
// 	setupWb()
// }
// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', function () {
// 		navigator.serviceWorker.register('/sw.js', {
// 			"scope": "/"
// 		}).then((registration) => {
// 			// Registration was successful
// 			console.log('ServiceWorker registration successful with scope: ', registration.scope);
// 		}, (err) => {
// 			// registration failed :(
// 			console.log('ServiceWorker registration failed: ', err);
// 		});
// 	});
// }
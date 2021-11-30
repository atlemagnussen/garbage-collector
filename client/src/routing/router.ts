import { SvelteSubject } from "@app/store/reactive"
const curRoutePathSubject = new SvelteSubject<string>("")
export const curRoutePath = curRoutePathSubject.asObservable()

const curRouteSubject = new SvelteSubject<Route>({ path: "/", component: "home-view"})
export const setCurRoute = (route: Route) => {
    curRouteSubject.next(route)
}
export const curRoute = curRouteSubject.asObservable()

export const getCurRoute = () => {
    const cur = curRoutePathSubject.getValue()
    return cur
}
export const goto = (e: Event) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLAnchorElement
    const path = target.pathname
    curRoutePathSubject.set(path)
}

export const gotoPath = (path: string) => {
    curRoutePathSubject.set(path)
}

window.addEventListener("popstate", (event: PopStateEvent) => {
    gotoPath(event.state.path)
})

const pushPathToHistory = (path: string) => {
    if (!path)
        return;
    if (window.location.pathname != path)
        window.history.pushState({ path }, "", window.location.origin + path)
}

curRoutePath.subscribe(pushPathToHistory)
import { BrowserRoute } from "@common/types/interfaces";

class PathBreaker {
    getRoute(p: string): BrowserRoute {
        let route: BrowserRoute = {
            path: "/",
            param: "",
            action: ""
        };
        if (!p || p === "/") {
            return route;
        }
        const slashes = p.match(/\//ig) || [];

        if (slashes.length === 0) {
            return route;
        } else if (slashes.length === 1) {
            route.path = p.replace("/", "");
            return route;
        }

        let pathSplit = p.split("/");

        pathSplit = this.clearEmptyElementsInArray(pathSplit);
        route.path = `${pathSplit.splice(0, 1)}`;
        route.param = `${pathSplit.splice(0, 1)}`;
        if (slashes.length === 3) {
            route.action = `${pathSplit.splice(0, 1)}`;
        }
        return route;
    }

    clearEmptyElementsInArray(arr: Array<any>) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (!arr[i]) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }
}

export default new PathBreaker();

import config from "@app/config"
import rest from "@app/services/restService"
import { StoredSubject } from "@app/store/reactive"
import { getIsOnline } from "@app/store/pageStateStore"
import { SubscriptionData } from "@common/types/interfaces"
const subscriptions = new StoredSubject<SubscriptionData>("subs", {})
export const subs = subscriptions.asObservable()
const subId = new StoredSubject<string>("subscriptionId", "")
const token = new StoredSubject<string>("token", "")

class User {
    
    async syncSubscriptionsFromServer() {
        const isOnline = getIsOnline()
        if (!isOnline) {
            return
        }
        const data = {
            "token": this.token,
            "id": this.subscriptionId
        }
        const sub = await rest.post<Subscriptions>(config.api.subscriptions, data)
        subscriptions.next(sub)
    }

    getCalendarSubscriptions(): Subscriptions {
        return subscriptions.get()
    }

    addCalendarSubscription(municipality: string, address: string) {
        let curr = subscriptions.get()
        if (curr && curr.calendars && Array.isArray(curr.calendars)) {
            curr.calendars.push({municipality, address});
        } else {
            curr = {
                "calendars": [{municipality, address}]
            };
        }
        subscriptions.next(curr)
    }
    pullCalendarSubscription(municipality: string, address: string) {
        const sub = subscriptions.get()
        if (sub && sub.calendars && Array.isArray(sub.calendars) && sub.calendars.length > 0) {
            const index = sub.calendars.findIndex((s) => s.municipality === municipality && s.address === address);
            if (index > -1) {
                sub.calendars.splice(index, 1);
            }
        }
        subscriptions.next(sub)
    }
    
    get subscriptionId(): string {
        return subId.getValue()
    }
    set subscriptionId(id: string) {
        subId.next(id)
    }
    get token() {
        return token.getValue()
    }
    set token(t) {
        token.next(t)
    }
    deleteSubscriptions() {
        subscriptions.next({})
    }

    async doesSubscribeToCalendar(municipality: string, address: string): Promise<boolean> {
        const sub = this.getCalendarSubscriptions()
        if (!sub)
            return false
        if (!sub.calendars || !Array.isArray(sub.calendars) || sub.calendars.length == 0)
            return false
        
        return sub.calendars.some((s) => s.municipality === municipality && s.address === address)
    }
}

export default new User();

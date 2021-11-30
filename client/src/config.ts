export const api = {
    "address": "https://test.avfallskalenderen.no/api/address",
    "calendar": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/getCalendar",
    "municipality": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/getMunicipality",
    "language": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/getLanguage",
    "subscribe": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/subscribe", // post
    "unsubscribe": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/unsubscribe", // post
    "subscriptions": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/subscriptions", // post
    "updatesubtoken": "https://europe-west1-avfallskalender-228213.cloudfunctions.net/updatesubtoken" // post
}
export const val = {
    "vapidPublicKey": "BF377t_wwBnw56fsuOcq0BVDSXxYZKDpW9oNcOAbE7TIvQ3DRYwXcKzCOtB7VjfHBwIQf3Cw72hFwY4_Wu8TKT4",
    "firebase": true
}
export default {api, val}
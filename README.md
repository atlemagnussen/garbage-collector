# Garbage collector

This is a POC of a PWA ... that pushes garbage collections notifications, currently supported on Android, Windows, Linux MacOS and so forth.
Still missing on **iOS** (but Apple have now announceth their support will come in 2023)

<img src="https://storage.googleapis.com/atle-static/backgrounds/avfallsrute.jpg"
    width="350"
    height="532"
    alt="avfallsrute.no">

Simple calendar able to display when different types of garbage is scheduled to be collected and then push you a notification the day before so that **you** remember to push your bin on to the road where the garbage truck can pick it up.
They won't come to your house and pick it up even if it's 10 metres

Really really important topic, since people don't remember anything in the smart phone era

Given the backend scraper providing the data is working for an address and municipality, this web app works. I have deployed this app as is on www.avfallsrute.no

The design supports limitless amounts of municipalities, unlike Norwegian garbage apps.

So far I only have a working scraper for Stavanger.

Background was that in Norway every single municipality is shipping their own garbage calendar app and then spend very little money on maintaining these apps. Often the design is poor, but often they won't do the one important thing, to remind you. Android phone manufacturers will also often kill your important notification app to save battery (I'm just guessing)
Usually, the app for my municipality would stop pushing notifications after the first one.

So when I figured out that web apps could do push notifications in 2018 I had a good use case. And it has been extremely reliable for Android and Windows, probably since Google and Microsoft is backing this technology very heavily.

## Stack

Backend

- [Firebase](https://firebase.google.com/)
- [NodeJs](https://nodejs.org/en/)

Web client

- [Lit](https://lit.dev)
- [Workbox](https://developer.chrome.com/docs/workbox/)

## design

There are couple of endpoints in the backend.

- fetching garbage data for a given address via the scraper (if it's not already cached in firestore)
- listing municipalities
- subscribing to push notifications
- unsubscribing to push notifications
- listing a device' current subscriptions

The web client is just about looking up and displaying garbage calendar and give option to subscribe to notifications.
The tricky part is the service worker and push notification stuff, so I used workbox for making it a little simpler.

## Run locally and debug

Client
Debugging locally also loads the serviceworker and will cache the app.

```sh
cd client
npm start
```

Backend must be deployed (I don't know how to run them locally)

## Setup cloud

Requires knowledge of setting up a Firebase project with Firestore database and Firebase Cloud Messaging
It also uses a pub/sub in Google Cloud for schedule of pushing the notifications (firebase project will also be a google cloud project)

## Deploy

Firebase needed for deployment:

```sh
npm install -g firebase-tools
```

### Client

```sh
cd client
firebase deploy

# only rules
firebase deploy --only firestore:rules
```

### Functions

```sh
cd functions
firebase deploy

```

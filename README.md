# Garbage collector

This is a POC of a PWA ... that pushes garbage collections notifications, currently supported on Android, Windows, Linux MacOS and so forth.
Still missing on **iOS** (but Apple have now announceth their support will come in 2023)

<img src="https://storage.googleapis.com/atle-static/backgrounds/avfallsrute.jpg"
    width="350"
    height="532"
    alt="avfallsrute.no">

Simple calendar able to display when different types of garbage is scheduled to be collected and optionally push you a notification the day before so that **you** remember to push your bin on to the road where the garbage truck can pick it up.

Really really important topic, since people (like me) don't remember anything anymore and the garbage truck workers won't walk to your house to pick it up.

Given the backend scraper providing the data is working for an address and municipality, this web app works. I have deployed this app as is on [www.avfallsrute.no](https://www.avfallsrute.no/stavanger/otto-olsens-gate-30)

The design supports limitless amounts of municipalities, unlike Norwegian garbage apps.

So far I only have a working scraper for Stavanger.

## Background

It's not that we dont have apps like this in Norway, we do have a lot actually - often one per municipality.
So that brings us to the three reasons I created my own:

- The official apps' push notifications have been unreliable on Android phones for different reasons.
- If you are responsible for the garbage being collected in two different municipalities, you probably need two apps.
- The apps would usually be limited to Android and iOS so you can't get push notifications on any other platform.

When I figured out that web apps could do push notifications in 2018 I had a good use case. And it has been extremely reliable for Android and Windows, probably since Google and Microsoft is backing this technology very heavily.

It would have been simpler if these garbage data were openly available, but I have never found them to be so, so therefore we need to do the grindy work of scraping, or try to influence politicians.

## Stack

Backend

- [Firebase](https://firebase.google.com/)
- [NodeJs](https://nodejs.org/en/)

Web client

- [Lit](https://lit.dev)
- [Workbox](https://developer.chrome.com/docs/workbox/)

## design

There are couple of endpoints in the backend:

- fetching garbage data for a given address via the scraper (if it's not already cached in firestore)
- listing municipalities
- subscribing to push notifications
- unsubscribing to push notifications
- listing a device' current subscriptions

The web client is just about looking up and displaying garbage calendar and give option to subscribe to notifications.
The notifications are done through a service worker and the app is installable.
It does not look great on desktop, but on mobile it's OK. You can swipe through the months.

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

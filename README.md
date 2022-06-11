# Garbage collector

This is a POC of a PWA ... (who doesn't like 3 letter abbreviations)

... of a simple calendar able to display when different types of garbage is scheduled to be collected and then push you a notification the day before this happens so that **you** remember to push your bin on to the road where the garbage truck can pick it up. They won't come to your house and pick it up even if it's 10 metres

Really really important topic, since people don't remember anything in the smart phone era, people would forget and then go throw their garbage somewhere random.

Given the backend scraper providing the data is working for a given address and municipality, this web app works. I have deployed it on www.avfallsrute.no

The design supports limitless amounts of municipalities, unlike Norwegian garbage apps.

So far I only have a working scraper for Stavanger, you might guess why.

Background was that we live in an age in Norway where every single municipality in Norway is shipping their own garbage calendar app and very little effort and maintenance is put into these apps. In addition we have Android phone manufacturers struggling with their bloatware destroying battery life so they try to quick fix it by killing off every process including the apps push notifications service (or something, I don't really know)
But usually, the app for my municipality would always stop pushing notifications after the first one.

So when I figured out that web apps could do push notifications in 2018 I had a good use case

## Stack

[Firebase](https://firebase.google.com/), [Lit](https://lit.dev), [Workbox](https://developer.chrome.com/docs/workbox/)

## Run locally and debug

```sh
npm start
```

Debugging locally can be some hazzle since the serviceworker is loaded also here and will cache the app.

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

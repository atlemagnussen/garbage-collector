# Garbage collector

This is a POC of a PWA ... (who does not like 3 letter abbreviations)

... of a simple calendar able to display when different types of garbage is scheduled to be collected (hence the name) and then push you a notification the day before this happens so that **you** remember to push your bin on to the road where the garbage truck can pick it up.

Really really important problem, I know.

Given the backend scraper providing the data is working for a given address and municipality.
The design supports limitless amounts of municipalities, unlike Norwegian garbage apps.

So far I only have a working scraper for Stavanger, you might guess why.

Background was that we live in an age in Norway where every single municipality in Norway is shipping their own garbage calendar app and very little effort and maintenance is put into these apps. In addition we have Android phone manufacturers struggling with their bloatware destroying battery life so they try to quick fix it by killing off every process including the apps push notifications service (or something, I don't really know)
But usually, the app for my municipality would always stop pushing notifications after the first one.

So when I figured out that web apps could do push notifications back in 2018 I had a really good use case

## Deploy

```sh
firebase deploy

# only rules
firebase deploy --only firestore:rules
```

Firebase needed for deployment:

```sh
npm install -g firebase-tools
```

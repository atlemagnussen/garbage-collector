# Garbage client

[database rules](https://firebase.google.com/docs/database/security)
[available libraries](https://firebase.google.com/docs/web/setup#available-libraries)

Agnostic of back end

## Deploy

```sh
./prod.sh
# then
firebase deploy

# only rules
firebase deploy --only firestore:rules
```

Firebase-SDK:

```sh
npm install -g firebase-tools
```

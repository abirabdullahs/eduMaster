# Firebase Hosting Deployment Guide

## Prerequisites

1. **Firebase CLI** (in devDependencies):
   ```bash
   npx firebase --version
   ```

2. **Login**: `npx firebase login`

3. **Enable Web Frameworks**: `npx firebase experiments:enable webframeworks`

## Deploy

```bash
npm run build
npx firebase deploy
```

## Project: edtech-115b4

Config: `.firebaserc` + `firebase.json`

## Add Firebase Analytics (optional)

To add Analytics, first install the SDK:

```bash
npm install firebase
```

Then create `lib/firebase.ts` and add FirebaseProvider to layout. See Firebase console for config.

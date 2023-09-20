---
title: "Calendar App Part2"
date: 2023-05-16
draft: true
---

## Step 1: Set up a new Next.js project

Make sure you have Node.js installed on your machine.
Open your terminal or command prompt and navigate to the directory where you want to create your project.
Run the following command to create a new Next.js project:

```bash
npx create-next-app my-app
```

Once the project is created, navigate to the project directory:

```bash
cd my-app
```

## Step 2: Install dependencies

In the project directory, install the required dependencies by running the following command:

```bash
npm install react react-dom next
```

Install TypeScript support for Next.js:

```bash
npm install --save-dev typescript @types/react @types/node
```

Install Zustand, a state management library:

```bash
npm install zustand
```

Install Firebase:

```bash
npm install firebase
```

## Step 3: Set up Firebase

Create a Firebase project by visiting the Firebase [console](https://console.firebase.google.com/) and clicking on "Add project."
Follow the instructions to set up your Firebase project.
Once your project is set up, click on the "Web" icon (</>) to add a web app to your project.
Enter a name for your app and click "Register app."
Firebase will provide you with a configuration object. Copy the object, as we will need it later.

## Step 4: Create a Firebase configuration file

In the project directory, create a new file called `utils/db.ts` in the src directory.
Paste the Firebase configuration object into `db.ts` and export it as follows:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  // Your Firebase configuration object goes here
};

// Initialize Firebase
const firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(firebase_app);
export default db;
```

## Step 5: Create a Zustand store

In the src directory, create a new file called `stores/EventsStore.ts`.
Import Zustand and create your store using Zustand's create function:

```typescript
import { create } from 'zustand';

interface Store {
  // Define your state properties and actions here
}

const useStore = create<Store>(()(
  devtools(
    (set) => ({
        // Initialize your state properties here
    }),
    {
      name: 'events-storage', // for debug purpose
    }
  )
}));

export default useStore;
```

## Step 6: Configure the _app.tsx file

Wrap the Component and pageProps with the SSRProvider component. Here's an example of how the _app.tsx file may look like:

```tsx
import SSRProvider from 'react-bootstrap/SSRProvider';
import { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.css';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
  );
}

export default MyApp;
```

By adding the `bootstrap/dist/css/bootstrap.css` import, you can now use Bootstrap styles in your application. The SSRProvider from bootstrap ensures that the auto-generated ids are consistent between the server and client.


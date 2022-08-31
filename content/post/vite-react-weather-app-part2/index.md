---
title: Let's build a weather app with vite and react - part 2
date: 2022-08-27
description: Mapbox integration
tags: 
 - weather-app
categories:
 - tutorials
draft: true
---

> If you haven't already, read [part 1](/p/lets-build-a-weather-app-with-vite-and-react-part-1/) before starting.

## Mapbox

We are now going to see how we could search for cities calling the mapbox API.
In order to use the API, you'll need to create an account (it's free, even if they might ask for a credit card in order to confirm your identity).

Now that you have your account created, get the Default public token from the [account page](https://account.mapbox.com/).

In order to call the API, we are going to use [axios](https://www.npmjs.com/package/axios).

```cmd
npm install --save axios
```

## Saving the user input

Now that we have all the libs we need, we are going to start "saving" what the user is typing in the component state.

```tsx
// src/pages/MainPage.tsx
const MainPage = () => {
  const [searchText, setSearchText] = useState('')
  // ...
  return (
    { /* ...*/ }
    <Form.Control
      placeholder='Search city'
      onChange={(evt) => setSearchText(evt.target.value)}
    />
    { /* ...*/ }
  )
}
```

## Calling the API

We are going to create a function called `callApi` this will only call the mapbox endpoint  with the value we just saved in the state.

> Here's the [documentation](https://docs.mapbox.com/api/search/geocoding/#forward-geocoding) for the endpoint we are going to use.

We simply need to call the `GET https://api.mapbox.com/geocoding/v5/{endpoint}/{search_text}.json?access_token={access_token}&types={types}` endpoint where:

- `endpoint` will be `mapbox.places` in our case
- `search_text` will be the value we saved in our local state
- `access_token` the token you got from your account page
- `types` will be `place` because we want to see the cities (see [here](https://docs.mapbox.com/api/search/geocoding/#data-types) for more info)

```typescript
const callApi = async () => {
  try {
    const access_token = '[your token]'
    const result = await axios.get(`
      https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${access_token}&types=place
    `)
  } catch (error) {
    // if you need to handle any error returned by mapbox
    console.log(error)
  }
}
```

Once we do get the results, we want to save the cities into a new variable in the component state.

Also we do not need to save everything, so for now we are going to save a name and the GPS location.

```typescript
const [cities, setCities] = useState([])
// ...
const callApi = async () => {
  // ...
  setCities(
    result.data.features.map((city: any) => ({
      name: city.place_name,
      lat: city.geometry.coordinates[1],
      lng: city.geometry.coordinates[0],
    }))
  )
  // ...
}
```

And obviously if we want to display the values from Mapbox rather than the hardcoded list, we need to delete the `cities` const we created in Part 1.

What we want now is, every time we get a new key stroke, we want to call mapbox and request the list of cities.

For that let's use `useEffect` and call our `callApi` function every time the `searchText` changes.

```typescript
useEffect(() => {
  callApi()
},[searchText])
```

So this is working as expected, every time we type a letter, it will call the mapbox api and returns the list of cities.

## Optimisation

This is not very optimised, most of the calls won't really be needed. When you type a city's name, you might want to type x letters before it actually does the search, and by doing that not use the entire quote of requests.

In order to fix that, we are going to create a debounce hook, that will call our function only after x milliseconds.

We are going to create a basic one, if you want to cover all scenarios, you might want to use a fancy one from a third party library.

```typescript
// src/hooks/useDebounce.ts
import { useRef } from 'react'
const useDebounce = () => {
  let timer = useRef(0)
  const debounce = (
    callback: () => void, // the method you want to call
    delay: number // the time in ms
  ) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      callback()
    }, delay)
  }
  return { debounce }
}
export default useDebounce
```

If you've never used [`useRef`](https://reactjs.org/docs/hooks-reference.html#useref):

> useRef returns a mutable ref object whose .current property is initialized to the passed argument (initialValue). The returned object will persist for the full lifetime of the component.

In our case we don't want the timer var to be recreated every re render, otherwise it will defeat the purpose of this timer.

So for every key stroke, the method will be called, and the timer will be reset until the timer ends. Once the delay is reached, the callback will be called.

Lets see how we use it in our main component:

```typescript
// src/pages/MainPage.tsx
const MainPage = () => {
  // ...
  const { debounce } = useDebounce()

  useEffect(() => {
    debounce(callApi, 500)
  }, [searchText])
}
```

So now when you type, the endpoint will only be called if you stop typing for 500ms.

> Next step [Part 3](/p/lets-build-a-weather-app-with-vite-and-react-part-3/)

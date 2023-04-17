---
title: RxJS Intro
description: 
image: 
date: 2023-03-29
tags:
  - typescript
draft: true
---

```typescript
const task$ = new BehaviorSubject([]);

const addTask = (text: string) => {
    tasls.push({})
  task$.next([...task$.value, { text, done: false }]); // new value dispatched to listeners
};
```

```typescript
useEffect(()=>{
    const subscription = task$.subscribe((tasks) => {
      setTasks(tasks);
    });
    return () => subscription.unsubscribe();
},[])
```

You also can use `pipe` in order to directly get what you want from the observable.

```typescript
tasks$.pipe(/* ... */).subscrive( /* */ )
//          ^^^^^^^^    
//       you can filter for instance
//       or directly get the length,...
```


### from chatgpt

## Intro 

RxJS, short for Reactive Extensions for JavaScript, is a library for reactive programming using observables that can be used in vanilla JavaScript. It allows you to easily create and manipulate streams of data, enabling you to write code that reacts to changes in real-time. RxJS is particularly useful when working with asynchronous data and complex user interfaces, as it helps to manage and simplify complex event-driven code. With RxJS, you can use a range of powerful operators to transform and manipulate data, making it a powerful tool for managing complex data flows in modern web applications.

## Getting started

To use RxJS in your JavaScript code, you need to import it. You can do this using the following code:

```javascript
import { Observable } from 'rxjs';
```

This will import the Observable class from RxJS.

## Create an Observable
The Observable class is the heart of RxJS. It represents a stream of data that you can subscribe to and react to changes in real-time. To create an Observable, you can use the Observable.create() method. Here's an example:

```javascript
const myObservable = Observable.create(observer => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
});
```

This creates an Observable that emits the values 'Hello' and 'World', and then completes. The next() method is used to emit a value, and the complete() method is used to indicate that the stream has ended.

## Subscribe to an Observable
To react to changes in an Observable, you need to subscribe to it. You can do this using the subscribe() method. Here's an example:

```javascript
myObservable.subscribe(value => {
  console.log(value);
});
```

This code subscribes to the myObservable Observable and logs each emitted value to the console.

## Use Operators

RxJS provides a range of powerful operators that you can use to transform and manipulate data. Here's an example of using the map() operator to transform the emitted values:

```javascript
const myObservable = Observable.create(observer => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
});

myObservable.pipe(
  map(value => value.toUpperCase())
).subscribe(value => {
  console.log(value);
});
```

This code creates the same Observable as before, but uses the map() operator to transform each emitted value to uppercase before logging it to the console.

And that's it! This is just a brief introduction to RxJS, but it should be enough to get you started with the basics. There's a lot more to learn, but with practice, you'll be able to create complex data flows and reactive UIs using RxJS.
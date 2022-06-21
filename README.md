# Documentation

This package provides an implementation of flux pattern using RxJS library.

## Functions

Added RxJS firstValueFrom and lastValueFrom from v7.x

## Usage

Import all basic features

```ts
import {
  BehaviorSubject,
  EMPTY,
  isObservable,
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  createObservable,
  createStateful,
  createSubject,
  observableFrom,
  observableOf,
  empty,
  rxtimeout,
  lastValueFrom,
} from '../src';
```

### Return an instance of RxJs observable

```ts
const observable = createObservable<string>(observer => {
observer.next('Hello!');
```

### Create an instance of RxJS Subject

```ts
const subject$ = createSubject(); // Create an instance of rxjs Subject
```

### Create an instance of RxJS ReplaySubject

```ts
const subject$ = createSubject(1); // Create an instance of rxjs ReplaySubject
```

### Create an instance of RxJS BehaviorSubject

```ts
const state$ = createStateful([]); // Create an instance of rxjs BehaviorSubject
```

### observableOf({})

> should internally call of({})

```ts
const observable$ = observableOf({});

const value = await lastValueFrom(observable);
```

### obserbableFrom({})

> should internally call from({})

```ts
const observable = observableFrom(
  new Promise<string>((resolve) => {
    resolve('Hello World!');
  })
);

const value = await lastValueFrom(observable);
```

### isObservable(ObserableLike)

> should returns true

```ts
isObservable(
  observableFrom(
    new Promise<void>((resolve) => {
      resolve();
    })
  )
);
```

### empty()

> should returns EMPTY observable

```ts
empty();
```

### rxtimeout()

> should return an observable that run after the given timeout

```ts
const timeout = rxtimeout(() => {
  expect(true).toBeTruthy();
  done();
}, 1500);
```

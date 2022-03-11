# Documentation

# RxJS implementation of FaceBook flux pattern

## Functions

Added RxJS firstValueFrom and lastValueFrom from v7.x

## Usage

### Return an instance of RxJs observable

```ts
const observable = createObservable<string>(observer => {
observer.next('Hello!');
```

### Create an instance of RxJS Subject

```ts
createSubject();
```

### Create an instance of RxJS ReplaySubject

```ts
createSubject(1);
```

### Create an instance of RxJS BehaviorSubject

```ts
createStateful([]);
```

### observableOf({})

> should internally call of({})

```ts
const observable = observableOf({});

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

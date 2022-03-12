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

describe('Observable creation function', () => {
  it('should return an instance of RxJs observable', () => {
    const observable = createObservable<string>((observer) => {
      observer.next('Hello!');
    });
    expect(observable).toBeInstanceOf(Observable);
  });

  it('should create an instance of RxJS Subject', () => {
    expect(createSubject()).toBeInstanceOf(Subject);
  });

  it('should create an instance of RxJS ReplaySubject', () => {
    expect(createSubject(1)).toBeInstanceOf(ReplaySubject);
  });

  it('should create an instance of RxJS BehaviorSubject', () => {
    expect(createStateful([])).toBeInstanceOf(BehaviorSubject);
  });

  it('observableOf({}) should internally call of({})', async () => {
    const observable = observableOf({});
    expect(observable).toBeInstanceOf(Observable);
    const value = await lastValueFrom(observable);
    expect(value).toEqual({});
  });

  it('obserbableFrom({}) should internally call from({})', async () => {
    const observable = observableFrom(
      new Promise<string>((resolve) => {
        resolve('Hello World!');
      })
    );
    expect(observable).toBeInstanceOf(Observable);
    const value = await lastValueFrom(observable);
    expect(value).toEqual('Hello World!');
  });

  it('isObservable(ObserableLike) should returns true', () => {
    expect(
      isObservable(
        observableFrom(
          new Promise<void>((resolve) => {
            resolve();
          })
        )
      )
    ).toEqual(true);
  });

  it('empty() should returns EMPTY observable', () => {
    expect(empty()).toEqual(EMPTY);
  });

  it('rxtimeout() should return an observable that run after the given timeout', async () => {
    await new Promise<void>((resolve) => {
      const timeout = rxtimeout(() => {
        expect(true).toBeTruthy();
      }, 1500);
      expect(timeout).toBeInstanceOf(Observable);
      timeout.subscribe();
      resolve();
    });
  });
});

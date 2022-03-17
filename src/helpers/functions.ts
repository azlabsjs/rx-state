import {
  Observable,
  Subject,
  BehaviorSubject,
  of,
  EMPTY,
  from,
  ObservableInput,
  ReplaySubject,
  interval,
  isObservable as isObservable_,
  EmptyError,
} from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { ObserverHandlerFunc } from '../types';

/**
 * Generic method for creating an rxjs {@see Subject<T>} or {@see ReplaySubject<T>} of a specified type
 */
export const createSubject = <T>(size?: number) =>
  size ? new ReplaySubject<T>(size) : new Subject<T>();

/**
 * Generic method for creating an rxjs {@see BehaviorSubject<T>} of a specified type
 */
export const createStateful = <T>(_value: T) => new BehaviorSubject(_value);

// Create an observable from a function
/**
 * @description Creator function utility for RxJS observable create function.
 */
export const createObservable = <T>(handler: ObserverHandlerFunc<T>) => {
  if (typeof handler !== 'function') {
    throw new Error('Undefined observable handler function param');
  }
  return new Observable(handler);
};

/**
 * Creates an observable from a non observable like input
 *
 * @param stream
 */
export const observableOf = <T>(stream: T) => of(stream);

/**
 * Creates an observable from an observable like input {@see ObservableInput}
 *
 * @param stream
 */
export const observableFrom = <T>(stream: ObservableInput<T>) => from(stream);

/**
 * Check if a given value is an observable
 * @param value Any type of data that can be checks for observable instance
 */
export const isObservable = (value: any) => isObservable_(value);

/**
 * Creates an empty observable
 * @deprecated Use {@see empty()} instead
 */
export const emptyObservable = () => empty();

/**
 * Creates an RxJS empty observable {@see EMPTY}
 */
export const empty = () => observableFrom(EMPTY);

/**
 * Exceute the user provided callback after a certain milliseconds
 *
 * @param callback
 * @param ms
 */
export const timeout = (callback: () => void, ms = 1000) =>
  interval(ms)
    .pipe(first())
    .subscribe(() => callback());

/**
 * Exceute the user provided callback after a certain milliseconds
 *
 * @param callback
 * @param milliseconds
 */
export const rxtimeout = (callback: () => void, milliseconds = 1000) =>
  interval(milliseconds).pipe(
    first(),
    tap(() => callback())
  );

/**
 * Ported function from {@see rxjs@7.x}
 *
 * Converts an observable to a promise by subscribing to the observable,
 * waiting for it to complete, and resolving the returned promise with the
 * last value from the observed stream.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will complete. If the source
 * observable does not complete, you will end up with a promise that is hung up, and
 * potentially all of the state of an async function hanging out in memory. To avoid
 * this situation, look into adding something like {@link timeout}, {@link take},
 * {@link takeWhile}, or {@link takeUntil} amongst others.
 *
 * ## Example
 *
 * Wait for the last value from a stream and emit it from a promise in
 * an async function
 *
 * ```ts
 * import { interval, take, lastValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000).pipe(take(10));
 *   const finalNumber = await lastValueFrom(source$);
 *   console.log(`The final number is ${ finalNumber }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The final number is 9'
 * ```
 *
 * @see {@link firstValueFrom}
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function lastValueFrom<T, D>(
  source: Observable<T>,
  config?: { default: D } | undefined
): Promise<T | D> {
  return new Promise<T | D>((resolve, reject) => {
    let _value: T;
    let _hasValue = false;
    source.subscribe({
      next: (value) => {
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          resolve(_value);
        } else if (typeof config === 'object') {
          resolve(config?.default);
        } else {
          reject(new EmptyError());
        }
      },
    });
  });
}

/**
 * Ported function from {@see rxjs@7.x}
 *
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable. The subscription will then be closed.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will emit at least one value,
 * *OR* complete. If the source observable does not emit one value or complete, you will
 * end up with a promise that is hung up, and potentially all of the state of an
 * async function hanging out in memory. To avoid this situation, look into adding
 * something like {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * ## Example
 *
 * Wait for the first value from a stream and emit it from a promise in
 * an async function
 *
 * ```ts
 * import { interval, firstValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000);
 *   const firstNumber = await firstValueFrom(source$);
 *   console.log(`The first number is ${ firstNumber }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The first number is 0'
 * ```
 *
 * @see {@link lastValueFrom}
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function firstValueFrom<T, D>(
  source: Observable<T>,
  config?: { default: D } | undefined
): Promise<T | D> {
  return new Promise<T | D>((resolve, reject) => {
    const _hasConfig = typeof config === 'object';
    source
      .pipe(first(undefined, _hasConfig ? config?.default : undefined))
      .subscribe({
        next: (value) => {
          resolve(value);
        },
        error: reject,
        complete: () => {
          if (_hasConfig) {
            resolve(config?.default);
          } else {
            reject(new EmptyError());
          }
        },
      });
  });
}

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
export const timeout = (callback: () => void, ms: number = 1000) =>
  interval(ms)
    .pipe(first())
    .subscribe(() => callback());

/**
 * Exceute the user provided callback after a certain milliseconds
 *
 * @param callback
 * @param milliseconds
 */
export const rxtimeout = (callback: () => void, milliseconds: number = 1000) =>
  interval(milliseconds).pipe(
    first(),
    tap(() => callback())
  );

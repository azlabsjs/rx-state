import {
  Observable,
  Subject,
  Subscriber,
  TeardownLogic,
  BehaviorSubject,
} from 'rxjs';

export {
  ActionCreatorHandlerFn,
  ActionCreatorFn,
  Action,
  ActionType,
} from './actions';

// Reducers type defintion import
export { StateReducerFn, PartialStateReducerFn } from './reducer';

// Store interface definition
export { Store } from './state';

// Creates a new observable subject
export type CreateSubjectFunc<T> = (
  param?: T
) => Subject<T> | BehaviorSubject<T>;

/**
 * @description Type definition for parameter passed to createObservable function
 */
export type ObserverHandlerFunc<T> = (
  subscriber: Subscriber<T>
) => TeardownLogic;

/**
 * @description Create observable type definition
 */
export type CreateObservableFunc<T> = (
  handler?: ObserverHandlerFunc<T>
) => Observable<T>;

/**
 * @description Type definition for result of a given handler function
 */
export type HandlerResult<T> = { data: T };

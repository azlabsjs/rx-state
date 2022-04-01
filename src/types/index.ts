import {
  Observable,
  Subject,
  Subscriber,
  TeardownLogic,
  BehaviorSubject,
} from 'rxjs';

export { ActionCreatorHandlerFn, Action, ActionType } from './actions';

// Reducers type defintion import
export {
  StateReducerFn,
  PartialStateReducerFn,
  ReducersConfig,
} from './reducer';

// Store interface definition
export { Store, SelecPropType, SelectAware, SelectorReturnType } from './state';

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
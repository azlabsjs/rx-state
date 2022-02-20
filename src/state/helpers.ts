import { isObservable } from 'rxjs';
import {
  Action,
  ActionCreatorHandlerFn,
  ActionType,
  StateReducerFn,
  Store,
} from '../types';
import { getStores, setStoreName } from './internals';
import { FluxStore } from './rx-state';

const dispatchAction = <T>(
  store: Store<T, ActionType>,
  action: ActionType | any
) => {
  // Return if the action is not defined performs nothing
  if (typeof action === 'undefined' || action === null) {
    return;
  }
  // Dipatch the action to the store
  store.dispatch(action);
  // If the action payload is set and payload is an observable, dispatch the payload as action as well
  // in order to handle async action
  if (isObservable(action?.payload)) {
    store.dispatch(action.payload);
  }
};

/**
 * Create a store action function that will be dispatch to the store when called on a given argumen
 *
 * @param store
 * @param handler
 */
export const createAction = <T, A>(
  store: Store<T, A>,
  handler: ActionCreatorHandlerFn
) => (...args: any[]) =>
  dispatchAction(store, handler.call(null, ...args) as ActionType);

/**
 * Creator function for creating a store object\
 *
 * @example
 * // Create a store with a name that is registered in the global context
 * const store = createStore((state, action) => {...}, { ... }, 'examples');
 *
 * // Creates a store without adding it to the global __DEV__STORE__ context
 * const store = createStore((state, action) => {...}, { ... });
 *
 * @param reducer
 * @param initial
 * @param name
 */
export const createStore = <T, A extends ActionType>(
  reducer: StateReducerFn<T, A>,
  initial: T,
  name?: string
) =>
  name
    ? (setStoreName(new FluxStore(reducer, initial), name) as Store<T, A>)
    : new FluxStore(reducer, initial);

/**
 * Create a store action dispatcher callable on a {@see Store} object
 *
 * @example
 * const store = createStore((state, action) => {...}, { ... }, 'examples');
 *
 * // Dispatch an action to the store
 * Dispatch(store)({type: '[EXAMPLES_LIST]', payload: [...]});
 *
 * @param store
 * @returns
 */
export const Dispatch = <T, A>(store: Store<T, A>) => (
  action: Action<T> | any
) => dispatchAction(store, action);

/**
 * Runs stores destructor method on each store object in the global context
 *
 * @examples
 * // Application global
 *
 * @returns
 */
export const Destroy = () =>
  Array.from(getStores().values()).forEach((store: any) => {
    if (typeof store?.destroy === 'function') {
      store.destroy();
    }
  });

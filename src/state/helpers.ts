import { isObservable, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Action,
  ActionCreatorHandlerFn,
  ActionType,
  StateReducerFn,
  Store,
} from '../types';
import { getObjectProperty, getStores, setStoreName } from './internals';
import { FluxStore } from './rx-state';

type SelecPropType<T, V> = string | ((state: T) => V);
type SelectorReturnType<S, T> = (source: Observable<S>) => Observable<T>;
type ReducersConfig<T, A> = {
  [index: string]: StateReducerFn<T, A>;
};

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

export function Select<T, V>(
  prop?: SelecPropType<T, V>
): SelectorReturnType<T, V> {
  return (source$: Observable<T>) => {
    return source$.pipe(
      map(state => {
        if (typeof prop === 'function') {
          return prop(state);
        }
        if (typeof prop === 'string' && typeof state === 'object') {
          return getObjectProperty(state, prop) as V;
        }
        return (state as any) as V;
      })
    );
  };
}

/**
 * Create a state reducer function that can use use in {@see Store<T,A>}
 * as reducer using configurations from a object
 *
 * @example
 *
 * const store = createStore(createReducer({
 *  '[INCREMENT]': (state, action)
 *                  => ({counter: state.counter + +action.payload}),
 *  // Other actions...
 * }),
 *
 * {
 *  // Initial state defintion ...
 *  counter: 0
 * })
 *
 * // Case the reducer does not require
 *
 * const store = createStore(createReducer({'[INCREMENT]': (state: T) => ({counter: ++state.counter}) }),
 * {
 *  // Initial state defintion ...
 *  counter: 0
 * })
 *
 * @param config
 */
export function createReducer<T, A extends ActionType>(
  config: ReducersConfig<T, A>
): StateReducerFn<T, A> {
  return (state: T, action: A) => {
    if (action.type in config) {
      return config[action.type](state, action);
    }
    return state;
  };
}

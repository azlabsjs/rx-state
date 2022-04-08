import { isObservable } from 'rxjs';
import { ActionType, Store } from '../types';

// @internal Provides an instance of javascript global context
const global_ = !(typeof global === 'undefined' || global === null)
  ? global
  : !(typeof window === 'undefined' || window === null)
  ? window
  : ({} as any);

// @internal
export const getStores = () => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (global_['__DEV__']['__STORES__'] as Map<symbol, any>) ?? new Map();
};

// @internal
export const setStores = (stores: Map<symbol, any>) => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (global_['__DEV__']['__STORES__'] = stores);
};

// @internal
export const getStoreChanges = () => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (
    (global_['__DEV__']['__STATES__'] as Map<symbol, Array<any[]>>) ??
    new Map<symbol, Array<any[]>>()
  );
};

// @internal
export const setStoreChanges = (states: Map<symbol, Array<any[]>>) => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  global_['__DEV__']['__STATES__'] = states;
};

export const addStateChanges = (name: symbol, state: any[]) => {
  const changes =
    (getStoreChanges() as Map<symbol, Array<any[]>>) ??
    new Map<symbol, Array<any[]>>();
  const states =
    (getStoreChanges().get(name) as Array<any[]>) ?? ([] as Array<any[]>);
  setStoreChanges(changes.set(name, [...states, state]));
};

export const setStoreName = <T>(instance: T, name: string) => {
  const symbol = Symbol(name);
  Object.defineProperty(instance, 'name', {
    value: symbol,
    configurable: true,
    writable: true,
    enumerable: true,
  });
  if (global_) {
    const stores = (getStores() as Map<symbol, T>) ?? new Map<symbol, T>();
    if (stores.has(symbol)) {
      stores.delete(symbol);
    }
    setStores(stores.set(symbol, instance));
  }
  return instance;
};

export const getObjectProperty = <T extends { [prop: string]: any }>(
  source: T,
  key: string,
  seperator = '.'
) => {
  if (
    key === '' ||
    typeof key === 'undefined' ||
    key === null ||
    typeof source === 'undefined' ||
    source === null
  ) {
    return source ?? undefined;
  }
  if (key.includes(seperator ?? '.')) {
    // Creates an array of inner properties
    const properties = key.split(seperator ?? '.');
    const current = source;
    // Reduce the source object to a single value
    return properties.reduce((carry, prop) => {
      if (carry) {
        const type = typeof current;
        carry =
          (type === 'object' || type === 'function') && carry[prop]
            ? carry[prop] ?? undefined
            : undefined;
      }
      return carry;
    }, source);
  } else {
    return source ? source[key] : undefined;
  }
};

// @internal
export const dispatchAction = <T>(
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
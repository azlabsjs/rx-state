import { isObservable } from 'rxjs';
import { ActionType, Store } from '../types';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownType = any;

// @internal Provides an instance of javascript global context
const runtime: Record<string, UnknownType> = !(
  typeof global === 'undefined' || global === null
)
  ? global
  : !(typeof window === 'undefined' || window === null)
    ? window
    : ({} as UnknownType);

// @internal
export const getStores = () => {
  runtime['__DEV__'] = runtime['__DEV__'] ?? {};
  return (
    (runtime['__DEV__']['__STORES__'] as Map<symbol, unknown>) ?? new Map()
  );
};

// @internal
export function setStores(stores: Map<symbol, UnknownType>) {
  runtime['__DEV__'] = runtime['__DEV__'] ?? {};
  return (runtime['__DEV__']['__STORES__'] = stores);
}

// @internal
export function getStoreChanges() {
  runtime['__DEV__'] = runtime['__DEV__'] ?? {};
  return (
    (runtime['__DEV__']['__STATES__'] as Map<symbol, Array<UnknownType[]>>) ??
    new Map<symbol, Array<UnknownType[]>>()
  );
}

// @internal
export function setStoreChanges(states: Map<symbol, Array<UnknownType[]>>) {
  runtime['__DEV__'] = runtime['__DEV__'] ?? {};
  runtime['__DEV__']['__STATES__'] = states;
}

export function addStateChanges(name: symbol, state: UnknownType[]) {
  const changes =
    (getStoreChanges() as Map<symbol, Array<UnknownType[]>>) ??
    new Map<symbol, Array<UnknownType[]>>();
  const states =
    (getStoreChanges().get(name) as Array<UnknownType[]>) ??
    ([] as Array<UnknownType[]>);
  setStoreChanges(changes.set(name, [...states, state]));
}

/** @internal */
export function registerStoreInGlobalRegistry<T>(instance: T, name: string) {
  const symbol = Symbol(name);

  Object.defineProperty(instance, 'name', {
    value: symbol,
    configurable: true,
    writable: true,
    enumerable: true,
  });

  if (runtime) {
    const stores = (getStores() as Map<symbol, T>) ?? new Map<symbol, T>();
    if (stores.has(symbol)) {
      stores.delete(symbol);
    }
    setStores(stores.set(symbol, instance));
  }
  return instance;
}

export function getObjectProperty<T extends { [prop: string]: UnknownType }>(
  source: T,
  key: string,
  seperator = '.'
) {
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
            ? (carry[prop] ?? undefined)
            : undefined;
      }
      return carry;
    }, source);
  } else {
    return source ? source[key] : undefined;
  }
}

// @internal
export function dispatchAction<T>(
  store: Store<T, ActionType>,
  action: ActionType | UnknownType
) {
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
}

// @internal Provides an instance of javascript global context
const global_ = !(typeof global === 'undefined' || global === null)
  ? global
  : !(typeof window === 'undefined' || window === null)
  ? window
  : ({} as any);

// @internal
export const getStores = () => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (global_['__DEV__']['__STORES__'] as Map<Symbol, any>) ?? new Map();
};

// @internal
export const setStores = (stores: Map<Symbol, any>) => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (global_['__DEV__']['__STORES__'] = stores);
};

// @internal
export const getStoreChanges = () => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  return (
    (global_['__DEV__']['__STATES__'] as Map<Symbol, Array<any[]>>) ??
    new Map<symbol, Array<any[]>>()
  );
};

// @internal
export const setStoreChanges = (states: Map<Symbol, Array<any[]>>) => {
  global_['__DEV__'] = global_['__DEV__'] ?? {};
  global_['__DEV__']['__STATES__'] = states;
};

export const addStateChanges = (name: symbol, state: any[]) => {
  const changes =
    (getStoreChanges() as Map<symbol, Array<any[]>>) ??
    new Map<symbol, Array<any[]>>();
  let states =
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

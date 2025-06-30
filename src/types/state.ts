import { Observable } from 'rxjs';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownType = any;

export type SelecPropType<T, V> = string | ((state: T) => V);
export type SelectorReturnType<S, T> = (source: Observable<S>) => Observable<T>;

export type SelectAware<T> = {
  /**
   * Select a slice of the store state user provided selector
   *
   * @param prop
   */
  select<RType>(prop: SelecPropType<T, RType>): Observable<RType>;
};

export type Store<T, A> = {
  /**
   * Dispatch a new action into the store
   *
   * @param action
   */
  dispatch(action: Partial<A> | UnknownType): void;

  /**
   * @description Connect to the store data stream
   */
  connect(): Observable<T>;

  select<R>(prop: SelecPropType<T, R>): Observable<R>;

  /**
   * Provides a destruction mechanism to the store
   *
   * @returns
   */
  destroy(): void;
};

import { Observable } from 'rxjs';

export type SelecPropType<T, V> = string | ((state: T) => V);
export type SelectorReturnType<S, T> = (source: Observable<S>) => Observable<T>;

export interface SelectAware<T> {
  /**
   * Select a slice of the store state user provided selector
   *
   * @param prop
   */
  select<RType>(prop: SelecPropType<T, RType>): Observable<RType>;
}

export interface Store<T, A> {
  /**
   * Dispatch a new action into the store
   *
   * @param action
   */
  dispatch(action: Partial<A> | any): void;

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
}

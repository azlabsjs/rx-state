import { Observable } from 'rxjs';

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

  /**
   * Provides a destruction mechanism to the store
   *
   * @returns
   */
  destroy(): void;
}

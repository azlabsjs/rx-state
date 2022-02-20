import { Store } from '../types';
import { createAction } from './helpers';

/**
 * Default actions type a.k.a async action, error action and store reset action
 */
export enum DefaultActions {
  ASYNC_UI_ACTION = '[ASYNC_REQUEST]',
  ERROR_ACTION = '[REQUEST_ERROR]',
  RESET_STATE_ACTION = '[RESET_STATE]',
}

export const errorAction = <T, A>(store: Store<T, Partial<A>>) =>
  createAction(
    store,
    (payload: any) => ({ type: DefaultActions.ERROR_ACTION, payload } as any)
  );

export const resetStateAction = <T, A>(store: Store<T, Partial<A>>) =>
  createAction(
    store,
    (payload: T = {} as T) =>
      ({ type: DefaultActions.RESET_STATE_ACTION, payload } as any)
  );

export const asyncAction = <T, A>(store: Store<T, Partial<A>>) =>
  createAction(
    store,
    (payload: T = {} as T) =>
      ({ type: DefaultActions.ASYNC_UI_ACTION, payload } as any)
  );

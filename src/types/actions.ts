import { Observable } from 'rxjs';

// @internal
export type ActionType = { type: string };

export interface Action<T> extends ActionType {
  type: string;
  payload?: T | Observable<ActionType>;
}

// @internal
export type ActionCreatorHandlerFn<Params extends unknown[] = any[]> = (
  ...params: Params
) => ActionType;

export type ActionCreatorFn<A extends Partial<Action<any>>, K> = (
  handlerFunc: (...params: K[]) => A
) => A;

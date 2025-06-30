import { Observable } from 'rxjs';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownType = any;

// @internal
export type ActionType = { type: string };

export interface Action<T> extends ActionType {
  type: string;
  payload?: T | Observable<ActionType>;
}

// @internal
export type ActionCreatorHandlerFn<Params extends unknown[] = UnknownType[]> = (
  ...params: Params
) => ActionType;

export type ActionCreatorFn<A extends Partial<Action<UnknownType>>, K> = (
  handlerFunc: (...params: K[]) => A
) => A;

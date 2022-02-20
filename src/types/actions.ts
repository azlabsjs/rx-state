import { Observable } from 'rxjs';

// @internal
export type ActionType = { type: string };

export interface Action<T> extends ActionType {
  type: string;
  payload?: T | Observable<ActionType>;
}

/**
 * Type definition of an action handler function
 */
export type ActionCreatorHandlerFn = (...params: any[]) => ActionType;

/**
 * Type definition of an action creator
 */
export type ActionCreatorFn<A extends Partial<Action<any>>, K> = (
  handlerFunc: (...params: K[]) => A
) => A;

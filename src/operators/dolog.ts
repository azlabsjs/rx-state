import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ___RX_STATE__DEV__ } from '../internals/dev';

// Helper rxjs operator for logging emitted stream while running in development mode
/**
 * @description Helper rxjs operator for logging emitted stream while running in development mode
 * ```js
 * const stream$ = sourceStream$.pipe(
 *    doLog(),
 *    map(...),
 *    publishReplay()
 * );
 * ```
 */
export const doLog = <T>(prefix?: string) => {
  return (source$: Observable<T>) =>
    source$.pipe(
      tap((source) => {
        // tslint:disable-next-line: no-unused-expression
        if (___RX_STATE__DEV__) {
          prefix ? console.log(prefix, source) : console.log(source);
        }
      })
    );
};

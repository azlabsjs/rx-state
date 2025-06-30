import { getStores } from './internals';

// @internal
type OnDestroy = { destroy: () => void };

/** @internal */
function implementsOnDestroy(value: unknown): value is OnDestroy {
  return (
    typeof value === 'object' &&
    typeof (value as OnDestroy).destroy === 'function'
  );
}

/**
 * Runs stores destructor method on each store object in the global context
 *
 * @examples
 * // Application global
 *
 */
export const Destroy = () =>
  Array.from(getStores().values()).forEach((store) => {
    if (implementsOnDestroy(store)) {
      store.destroy();
    }
  });

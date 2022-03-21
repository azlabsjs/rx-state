// createSelector functions

import { memoize, MemoizerOptions } from '@iazlabs/functional';
import { shallowEqual } from '@iazlabs/utilities';
import { CreateSelectorOptions, LeastType, SelectorType } from './types';

// Helpers
// @internal
const getSelectorFuncs = (funcs: unknown[]) => {
  funcs = Array.isArray(funcs[0]) ? funcs[0] : funcs;
  // TODO : Check for non function arguments
  const errors = funcs
    .filter((func) => typeof func !== 'function')
    .map((func) => typeof func)
    .join(', ');
  if (errors.length) {
    throw new Error(
      `createSelector contains some invalid function types ${errors}`
    );
  }
  return funcs as ReadonlyArray<SelectorType>;
};
// !Helpers

export function createSelectorFnCreator<
  SelectorFn extends (...arg: unknown[]) => unknown,
  MemoizeFn extends (func: SelectorFn, options?: MemoizerOptions) => SelectorFn,
  SelectorMemoizeOption extends LeastType<Parameters<MemoizeFn>>
>(memoizeFn: MemoizeFn, options?: LeastType<Parameters<MemoizeFn>>) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (...selectors: Function[]) => {
    let lastResult!: unknown;
    let options_: CreateSelectorOptions<SelectorMemoizeOption> = {
      memoize: undefined,
    };
    let lastArgument = selectors.pop();
    const lastArgumentType = typeof lastArgument;
    if (lastArgumentType === 'object') {
      options_ = lastArgument as any;
      lastArgument = selectors.pop();
    }
    if (lastArgumentType !== 'function') {
      throw new Error(
        `createSelector expect an output function following inputs but got ${lastArgumentType}`
      );
    }

    // Determine which set of options we're using. Prefer options passed directly,
    // but fall back to options given to createSelectorCreator.
    const { memoize: memoizeOptions = options } = options_;

    const funcs = getSelectorFuncs(selectors);

    const outputFunc = memoizeFn(
      function () {
        // eslint-disable-next-line prefer-spread
        return (lastArgument as any).apply(
          null,
          // eslint-disable-next-line prefer-rest-params
          arguments
        ) as unknown;
      } as SelectorFn,
      memoizeOptions
    );

    const selector = memoizeFn(
      function () {
        const params = [];
        for (const func of funcs) {
          params.push(
            // eslint-disable-next-line prefer-spread
            func?.apply(
              null,
              // Use arguments instead of spread for perfomance reason
              // eslint-disable-next-line prefer-rest-params
              arguments as any
            )
          );
        }
        // eslint-disable-next-line prefer-spread
        lastResult = outputFunc.apply(null, params);
        return lastResult;
      } as SelectorFn,
      memoizeOptions
    );
    return selector;
  };
}

/**
 * A function for creating memoized "selector" functions.
 * It's inspired by {@see https://github.com/reduxjs/reselect} library
 * for redux or vanilla Javascript.
 *
 * @example
 * const selectShopItems = state => state.shop.items
 * const selectTaxPercent = state => state.shop.taxPercent
 *
 * const selectSubtotal = createSelector(selectShopItems, items =>
 * items.reduce((subtotal, item) => subtotal + item.value, 0));
 *
 * const selectTax = createSelector(
 * selectSubtotal,
 * selectTaxPercent,
 * (subtotal, taxPercent) => subtotal * (taxPercent / 100));
 *
 * const selectTotal = createSelector(
 * selectSubtotal,
 * selectTax,
 * (subtotal, tax) => ({ total: subtotal + tax }));
 *
 * const exampleState = {
 *    shop: {
 *      taxPercent: 8,
 *      items: [
 *          { name: 'apple', value: 1.2 },
 *          { name: 'orange', value: 0.95 }
 *      ]
 *    }
 * }
 * console.log(selectSubtotal(exampleState)) // 2.15
 * console.log(selectTax(exampleState)) // 0.172
 * console.log(selectTotal(exampleState)) // { total: 2.322 }
 *
 * // Example passing memoization options
 * const customizedSelector = createSelector(
 *      state => state.a,
 *      state => state.b,
 *      (a, b) => a + b,
 *      {
 *          // Memoization options passed as last argument to
 *          // modify configurations for internal memoize function
 *          // implementation
 *          memoize: {
 *              equality: {
 *                  fn: (a, b) => a === b,
 *                  size: 10
 *              },
 *              // hash: true indicates to use hashing cache memoization
 *              hash: false
 *          }
 *      }
 *  )
 * @returns
 */
export const createSelector = createSelectorFnCreator(memoize, {
  equality: { func: shallowEqual },
});

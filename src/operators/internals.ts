/**
 * @internal
 * Applied to instances and stores `Subject` instance when
 * no custom destroy method is provided.
 */
export const DESTROY: unique symbol = Symbol('__destroy');

/**
 * @internal
 * Applied to definitions and informs that class is decorated
 */
export const DECORATOR_APPLIED: unique symbol = Symbol('__decoratorApplied');

// This will be provided through Terser global definitions by Angular CLI. This will
// help to tree-shake away the code unneeded for production bundles.
declare const ngDevMode: boolean;

let devMode: boolean;

if (typeof ngDevMode === 'undefined' || ngDevMode === null) {
    devMode = process.env.NODE_ENV !== 'production'
} else {
    devMode = ngDevMode;
}

// @internal
export const ___RX_STATE__DEV__ = devMode;
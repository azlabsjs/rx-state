// This will be provided through Terser global definitions by Angular CLI. This will
// help to tree-shake away the code unneeded for production bundles.
declare const ngDevMode: boolean;

let devMode: boolean;

if (typeof ngDevMode === 'undefined' || ngDevMode === null) {
    console.log('ngDevMode is not defined....');
    devMode = process.env.NODE_ENV !== 'production'
} else {
    console.log('ngDevMode is defined....');
    devMode = ngDevMode;
}

// @internal
export const ___RX_STATE__DEV__ = devMode;
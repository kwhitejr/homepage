---
title: React Hook - useAsyncFunc
date: "2021-03-09"
description: "React hook for robust functionality around any async function."
status: PUBLISHED
tags: ["frontend", "javascript", "react"]
---
[Source code](https://github.com/kwhitejr/use-async-func) and demo for generic async operation React hook. [Live example](https://codesandbox.io/s/silent-smoke-nrruh).

Want to suggest an improvement? I'm all ears! Please file an issue or open a PR!

## Usage
```jsx
import { useAsyncFunc } from "useAsyncFunc";

const myAsyncFunc = (arg1, arg2) => {
  // do work
};

const App = () => {
  const [{ isLoading, isError, data }, setArgs] = useAsyncFn(myAsyncFunc, ['firstArg', 'secondArg']);

  return (
    {data && <div>{data}</div>}
    {isLoading && <LoadingIcon/>}
    {isError && <ErrorMsg/>}
  );
};
```

## Overview
This `useAsyncFunc` React hook stands on the shoulders of giants. [Robin Wieruch](https://www.robinwieruch.de/)'s excellent [_How to fetch data with React Hooks_](https://www.robinwieruch.de/react-hooks-fetch-data) walks you step-by-step through the creation of a robust `useDataApi` hook, which provides an exhaustively capable data fetching hook.

The purpose of this post is to further build on that work by genericizing it to run any async function (and not just `fetch(myUrl)`).

## useAsyncFunc
```javascript
/**
 * @param {function} fn   - The asynchronous function to be called
 * @param {Array} fnArgs  - Optionally, the arguments to be passed to `fn`, expressed as an array
 * @param {*} initialData - Optionally, default value(s) to returned as `data`
 * @returns {[state, setArgs]}
 */
const useAsyncFunc = (fn, fnArgs = [], initialData) => {

  // useState manages the async func arguments.
  const [args, setArgs] = useState(fnArgs);

  // useReducer manages the local complex state of the async func hook's lifecycle.
  // See the source code for the full reducer!
  // NOTE: it'd be easy to modify the reducer to fit your needs.
  const [state, dispatch] = useReducer(asyncReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const callAsyncFn = async () => {
      // Begin each async func call with a clean slate.
      dispatch({ type: 'ASYNC_INIT' });

      try {
        // Because this is a generic hook for any async func,
        // simply call the function with the args!
        const result = await fn(...args);

        // Set success with result
        if (!didCancel) {
          dispatch({ type: 'ASYNC_SUCCESS', payload: result });
        }
      } catch (error) {
        // Otherwise, set failure
        if (!didCancel) {
          dispatch({ type: 'ASYNC_FAILURE' });
        }
      }
    };

    // Actual invocation
    callAsyncFn();

    // Cleanup function to optionally prevent setting state for unmounted component.
    // Ref: https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1
    // Ref: https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component
    return () => {
      didCancel = true;
    };

    // useEffect will consider `fn` and `args` when deciding whether to skip a re-render.
    // In short, skip re-render if `fn` or `args` do not change.
  }, [fn, args]);

  // `state` provides the status updates: { isLoading, isError, data }
  // `setArgs` allows you to update the arguments passed to the async func
  return [state, setArgs];
};
```

## Conclusion
Really, that is it! Again, this is a slight modification to genericize Robin Wieruch's already-thorough `useDataApi()` hook. My other small contribution is a basic test suite. Enjoy!

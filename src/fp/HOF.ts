type Fn = (...args: any[]) => any;

export const curryN = (n, fn) => (...args) => args.length >= n ? fn(...args) : curryN(n - args.length, fn.bind(null, ...args));
export const curry = (fn: Fn) => curryN(fn.length, fn);
export const demethodize = (fn: Fn) => (arg0, ...args) => fn.apply(arg0, args);
export const args = (fn: Fn) => (...args) => fn(args);
export const arg = arg => arg;
export const flip = (fn: Fn) => (...args) => fn(...args.reverse());
export const not = (fn: Fn) => (...args) => !fn(...args);
export const negate = (fn: Fn) => (...args) => -fn(...args);

export const timer = (fn: Fn, log = console.log) => (...args) => {
  const start = Date.now();
  const result = fn(...args);
  const end = Date.now();
  log(`Time: ${end - start}ms`);
  return result;
};

export const memoize = (fn: Fn, stringify = JSON.stringify) => {
  const cache = {};
  return (...args) => {
    const key = stringify(args);
    let result = cache[key];
    if (!result) {
      result = fn(...args);
      cache[key] = result;
    }

    return result;
  };
};

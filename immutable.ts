import { fromJS, Iterable, Map, OrderedMap } from "immutable";

/*
 * Access immutable objects through a functional interface with partial application
 */
import {curry} from "ramda";

const has = curry((imObj, key) => {
  return imObj.has(key);
});

const get = curry((imObj, key) => {
  return imObj.get(key);
});

const convertToMap = (items, key = "id") => {
  return Map().withMutations((mut) => {
    items.forEach((item) => mut.set(item[key], fromJS(item)));
  });
};

/**
 * maybeArray.constructor will only work on types with constructors obviously(strings, arrays, etc.); {} is excluded,
 * typeof {} === "object", but does not have a constructor. Feeding this an {} would be fatal. Don't.
 * No instanceof because it is very slow. Just don't feed it an object especially after midnight.
 */
export const isArray = (maybeArray: any) => !!(maybeArray && (typeof maybeArray === "object") && typeof maybeArray !== "string" && (maybeArray.constructor === Array));

/**
 * Iterable Type Checking usecase:
 * .get() of undefined (or .get() is not a function of 'other type') explodes with fatal error. All Immutables extend Iterable and have .get().
 * All data is eventually gotten. All data is eventually/accidentally undefined or mutated incorrectly(not immutable).
 */

/* base class Iterable check @returns boolean */
export const isIterable = (maybeIterable: any) => Iterable.isIterable(maybeIterable);

/* @getValid: Checks for valid ImmutableJS type Iterable, and returns a valid Iterable or child data of a valid Iterable.
   Iterable.isIterable(maybeIterable) && maybeIterable, becomes
   getValid(maybeIterable)                                                                                       */
/**
 * base class Iterable check and returns Iterable or false
 * @params maybeIterable
 * @returns maybeIterable || Default: Iterable || false
 * @example getValid(maybeIterable)
 * Obviously faster than getValidPath. Use when no keyPath.
 */
export const getValid = (maybeIterable: any, Default: any) => (isIterable(maybeIterable) && maybeIterable) || isIterable(Default) && Default;

/**
 * @getValidPath: Checks for valid base class ImmutableJS type of Iterable
 * @params getValidPath(maybeIterable: any, keyPath: (key || array of keys), Default: (if undefined return this default) )
 *
 * @returns: valid Iterable || child data of Iterable || Default: any
 *
 * Verbose: Iterable.isIterable(maybeIterable) && maybeIterable.getIn(['data', key], Map())
 * Terse  : getValidPath(maybeIterable, ['data', key], Map())
 *
 * @Examples(more in unit tests):
 * getValidPath(maybeIterable)             :    returns maybeIterable
 * getValidPath(maybeIterable, null, Map()):    returns maybeIterable or Default
 * Obviously slower than getValid. Use getValid when no keyPath.
 * Note(an immutablejs stipulation): keypath must be either an array of strings or a string even if the key is a number
 */
export const getValidPath = (maybeIterable: any, keyPath: any, Default: any) => {
    return isIterable(maybeIterable) && keyPath
        ? ((isArray(keyPath) && maybeIterable.getIn(keyPath, Default)) || maybeIterable.get(keyPath, Default))
        : getValid(maybeIterable, null) || Default || false;
};

export const mapItems = (items, key = "id", keepOrder = false, valueKey: string = "") => {
  const element = keepOrder ? OrderedMap() : Map();
  return items ? element.withMutations((mut) => items.forEach((item) => {
    const value = valueKey ? item[valueKey] : fromJS(item);
    return mut.set(item[key], value);
  })) : element;
};

export default { has, get, convertToMap, isArray, isIterable, getValid, getValidPath, mapItems };

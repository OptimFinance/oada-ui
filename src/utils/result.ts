/**
 * Result Type Implementation
 * 
 * This module provides a Result type for handling success/failure states in a type-safe way.
 * Features include:
 * - Type-safe success and failure handling
 * - Chaining operations with bindings
 * - Parallel and sequential combination of results
 * - Error transformation and handling
 * - Pattern matching
 */

import {ResultAsync} from "./result-async"

/**
 * Type-level equality check
 */
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false;

/**
 * Checks if a type is a union type
 */
type IsUnion<T, U extends T = T> =
    (T extends any ?
    (U extends T ? false : true)
        : never) extends false ? false : true

/**
 * Creates a single-entry object type
 */
type SingleEntryObject<K extends string, A> = IsUnion<K> extends true ? never : { [P in K]: A }

/**
 * Type for managing bindings in chained operations
 */
export type ToBinds<Binds, K extends string, A> =
  Equal<K, never> extends true
    ? Binds 
    : Equal<K, string> extends true 
      ? Binds
      : (Binds & SingleEntryObject<K, A>)

/**
 * Union type of Success and Failure
 */
export type Result<A, E, Binds={}> = Success<A, E, Binds> | Failure<A, E, Binds>

/**
 * Interface defining the common operations for Result types
 */
export interface ResultInterface<A, E, Binds> {
  /**
   * Type guard for Success
   */
  isSuccess(): this is Success<A, E, Binds>
  
  /**
   * Type guard for Failure
   */
  isFailure(): this is Failure<A, E, Binds>

  /**
   * Chains a transformation on success
   */
  chain<A1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => A1 
  ): Result<A1, E, ToBinds<Binds, K, A1>>
  chain<A1, K extends string = never>(
    f: (a: A, binds: Binds) => A1,
  ): Result<A1, E, ToBinds<Binds, K, A1>>

  /**
   * Chains a Result transformation on success
   */
  chainR<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Result<A1, E1> 
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Result<A1, E1>,
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>

  /**
   * Chains a ResultAsync transformation on success
   */
  chainRA<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => ResultAsync<A1, E1> 
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => ResultAsync<A1, E1>,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>

  /**
   * Chains a Promise transformation on success
   */
  chainP<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Promise<A1>,
    h: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Promise<A1>,
    g: (e: unknown) => E1,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>

  /**
   * Transforms the error type
   */
  chainError<E1>(f: (e: E) => E1): Result<A, E1, Binds>

  /**
   * Chains a Result transformation on error
   */
  chainErrorR<A1, E1>(f: (e: E) => Result<A1, E1>): Result<A1, E1, Binds>

  /**
   * Chains a ResultAsync transformation on error
   */
  chainErrorRA<A1, E1>(f: (e: E) => ResultAsync<A1, E1>): ResultAsync<A | A1, E1, Binds>

  /**
   * Fails if a condition is met
   */
  failIf<E1>(f: (a: A, binds: Binds) => boolean, e: E1): Result<A, E | E1, Binds>
  
  /**
   * Pattern matches on the Result
   */
  match<T>(cases: Result.ResultCaseMatch<T, A, E>): T
}

/**
 * Success variant of Result
 */
export class Success<A, E, Binds={}> implements ResultInterface<A, E, Binds> {
  constructor(public readonly value: A, public readonly binds: Binds, public readonly kind: 'Success' = 'Success') {}

  isSuccess(): this is Success<A, E, Binds> { return true }
  isFailure(): this is Failure<A, E, Binds> { return false }

  /**
   * Updates the bindings of the Success
   */
  setBinds<Binds>(binds: Binds): Success<A, E, Binds> {
    return new Success(this.value, binds)
  }

  chain<A1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => A1 
  ): Result<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: (a: A, binds: Binds) => A1,
  ): Result<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => A1),
    g?: (a: A, binds: Binds) => A1 
  ): Result<A1, E, ToBinds<Binds, K, A1>> {
    if (typeof f === 'function' && g === undefined) {
      const value = f(this.value, this.binds)
      const binds = {...this.binds} as ToBinds<Binds, K, A1>
      return new Success(value, binds)
    } else if (typeof f !== 'function' && g !== undefined) {
      const value = g(this.value, this.binds)
      const binds = {...this.binds, [f]: value} as ToBinds<Binds, K, A1>
      return new Success(value, binds)
    } else {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    }
  }

  chainError<E1>(_f: (e: E) => E1): Result<A, E1, Binds> {
    return this as unknown as Result<A, E1, Binds>
  }

  chainErrorR<A1, E1>(_f: (e: E) => Result<A1, E1>): Result<A1, E1, Binds> {
    return this as unknown as Result<A1, E1, Binds>
  }

  chainErrorRA<A1, E1>(_f: (e: E) => ResultAsync<A1, E1>): ResultAsync<A | A1, E1, Binds> {
    return ResultAsync.fromResult(this) as unknown as ResultAsync<A, E1, Binds>
  }

  failIf<E1>(f: (a: A, binds: Binds) => boolean, e: E1): Result<A, E | E1, Binds> {
    return f(this.value, this.binds) ? Result.failure(e) as Result<A, E1, Binds> : this
  }

  chainR<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Result<A1, E1> 
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Result<A1, E1>,
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string=never>(
    f: K | ((a: A, binds: Binds) => Result<A1, E1>),
    g?: (a: A, binds: Binds) => Result<A1, E1>
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === 'function' && g === undefined) {
      const result = f(this.value, this.binds)
      if (result.isSuccess()) {
        return result.setBinds({...this.binds} as ToBinds<Binds, K, A1>)
      } else {
        return result.setBinds({} as ToBinds<Binds, K, A1>)
      }
    } else if (typeof f !== 'function' && g !== undefined) {
      const result = g(this.value, this.binds)
      if (result.isSuccess()) {
        return result.setBinds({...this.binds, [f]: result.value} as ToBinds<Binds, K, A1>)
      } else {
        return result.setBinds({} as ToBinds<Binds, K, A1>)
      }
    } else {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    }
  }

  chainRA<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => ResultAsync<A1, E1> 
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => ResultAsync<A1, E1>,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => ResultAsync<A1, E1>),
    g?: (a: A, binds: Binds) => ResultAsync<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === 'function' && g === undefined) {
      return new ResultAsync(async () => {
        const result = await f(this.value, this.binds).run()
        if (result.isSuccess()) {
          return result.setBinds({...this.binds} as ToBinds<Binds, K, A1>)
        } else {
          return result.setBinds({} as ToBinds<Binds, K, A1>)
        }
      })
    } else if (typeof f !== 'function' && g !== undefined) {
      return new ResultAsync(async () => {
        const result = await g(this.value, this.binds).run()
        if (result.isSuccess()) {
          return result.setBinds({...this.binds, [f]: result.value} as ToBinds<Binds, K, A1>)
        } else {
          return result.setBinds({} as ToBinds<Binds, K, A1>)
        }
      })
    } else {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    }
  }

  chainP<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Promise<A1>,
    h: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Promise<A1>,
    g: (e: unknown) => E1,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => Promise<A1>),
    g: ((a: A, binds: Binds) => Promise<A1>) | ((e: unknown) => E1),
    h?: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === 'function' && h === undefined) {
      return new ResultAsync(async () => {
        try {
          const value = await f(this.value, this.binds)
          return Result.from(value)
            .setBinds({...this.binds} as ToBinds<Binds, K, A1>)
        } catch (e) {
          return Result.failure((g as (e: unknown, binds: Binds) => E1)(e, this.binds))
            .setBinds({} as ToBinds<Binds, K, A1>)
        }
      })
    } else if (typeof f !== 'function' && h !== undefined) {
      return new ResultAsync(async () => {
        try {
          const value = await (g as (a: A, binds: Binds) => Promise<A1>)(this.value, this.binds)
          return Result.from(value)
            .setBinds({...this.binds, [f]: value as A1} as ToBinds<Binds, K, A1>)
        } catch (e) {
          return Result.failure((h as (e: unknown, binds: Binds) => E1)(e, this.binds))
            .setBinds({} as ToBinds<Binds, K, A1>)
        }
      })
    } else {
      throw Error('If binding is defined then g must be defined and h must be defined, otherwise if binding is not defined then g must be defined, and h must not be defined')
    }
  }

  match<T>(cases: Result.ResultCaseMatch<T, A, E>): T {
    return cases.Success(this.value)
  }
}

/**
 * Failure variant of Result
 */
export class Failure<A, E, Binds = {}> implements ResultInterface<A, E, Binds> {
  constructor(public readonly error: E, public readonly binds: Binds, public readonly kind: 'Failure' = 'Failure') {}

  isSuccess(): this is Success<A, E, Binds> { return false }
  isFailure(): this is Failure<A, E, Binds> { return true }
  
  /**
   * Updates the bindings of the Failure
   */
  setBinds<Binds>(binds: Binds): Failure<A, E, Binds> {
    return new Failure(this.error, binds)
  }

  chain<A1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => A1 
  ): Result<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: (a: A, binds: Binds) => A1,
  ): Result<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => A1),
    g?: (a: A, binds: Binds) => A1
  ): Result<A1, E, ToBinds<Binds, K, A1>> {
    if ((typeof f === 'function' && g !== undefined) || (typeof f !== 'function' && g === undefined)) {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    } else { 
      return this as unknown as Failure<A1, E, ToBinds<Binds, K, A1>>
    }
  }

  chainError<E1>(f: (e: E) => E1): Result<A, E1, Binds> {
    const error = f(this.error)
    return new Failure(error, {}) as Result<A, E1, Binds>
  }

  chainErrorR<A1, E1>(f: (e: E) => Result<A1, E1>): Result<A1, E1, Binds> {
    const result = f(this.error)
    return result as unknown as Result<A1, E1, Binds>
  }

  chainErrorRA<A1, E1>(f: (e: E) => ResultAsync<A1, E1>): ResultAsync<A | A1, E1, Binds> {
    const resultAsync = f(this.error)
    return resultAsync as ResultAsync<A1, E1, Binds>
  }

  failIf<E1>(_f: (a: A, binds: Binds) => boolean, _e: E1): Result<A, E | E1, Binds> {
    return this
  }

  chainR<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Result<A1, E1> 
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Result<A1, E1>,
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string=never>(
    f: K | ((a: A, binds: Binds) => Result<A1, E1>),
    g?: (a: A, binds: Binds) => Result<A1, E1>
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>> {
    if ((typeof f === 'function' && g !== undefined) || (typeof f !== 'function' && g === undefined)) {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    } else { 
      return this as unknown as Failure<A1, E, ToBinds<Binds, K, A1>>
    }
  }

  chainRA<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => ResultAsync<A1, E1> 
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => ResultAsync<A1, E1>,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => ResultAsync<A1, E1>),
    g?: (a: A, binds: Binds) => ResultAsync<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if ((typeof f === 'function' && g !== undefined) || (typeof f !== 'function' && g === undefined)) {
      throw Error('If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined')
    } else { 
      return ResultAsync.fromResult(this) as unknown as ResultAsync<A1, E, ToBinds<Binds, K, A1>>
    }
  }

  chainP<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Promise<A1>,
    h: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Promise<A1>,
    g: (e: unknown) => E1,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => Promise<A1>),
    _g: ((a: A, binds: Binds) => Promise<A1>) | ((e: unknown) => E1),
    h?: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if ((typeof f === 'function' && h === undefined) || (typeof f !== 'function' && h !== undefined)) {
      return ResultAsync.fromResult(this) as unknown as ResultAsync<A1, E, ToBinds<Binds, K, A1>>
    } else {
      throw Error('If binding is defined then g must be defined and h must be defined, otherwise if binding is not defined then g must be defined, and h must not be defined')
    }
  }

  match<T>(cases: Result.ResultCaseMatch<T, A, E>): T {
    return cases.Failure(this.error)
  }
}

/**
 * Extracts the success type from a Result
 */
type ResultType<T> = T extends Result<infer ResultType, unknown> ? ResultType : never

/**
 * Extracts the error type from a Result
 */
type ErrorType<T> = T extends Result<unknown, infer ErrorType> ? ErrorType : never

/**
 * Extracts success types from a tuple of Results
 */
type ResultTypes<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: ResultType<Tuple[Index]>
} & { length: Tuple['length'] }

/**
 * Extracts error types from a tuple of Results
 */
type ErrorTypes<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: ErrorType<Tuple[Index]>
}[number]

/**
 * Namespace containing Result utility functions
 */
export namespace Result {
  /**
   * Creates a successful Result
   */
  export const from = <A1, E1 = never>(a: A1): Result<A1, E1, {}> => {
    return new Success(a, {})
  }

  /**
   * Creates a failed Result
   */
  export const failure = <A1 = never, E1 = unknown>(e: E1): Result<A1, E1> => {
    return new Failure(e, {})
  }

  /**
   * Creates a Result from a nullable value
   */
  export const fromNullable = <A1, E1>(nullable: A1 | null | undefined, e: E1): Result<A1, E1> => {
    if (nullable == null || nullable === undefined) {
      return failure(e)
    } else {
      return from(nullable)
    }
  }

  /**
   * Creates a Result from a function that might throw
   */
  export const fromExceptionable = <A1, E1>(thunk: () => A1, handle: (e: unknown) => E1): Result<A1, E1> => {
    try {
      const a = thunk()
      return from(a)
    } catch (e) {
      return failure(handle(e))
    }
  }

  /**
   * Interface for pattern matching on Results
   */
  export interface ResultCaseMatch<T, R, E> {
    Failure(e: E): T;
    Success(v: R): T;
  }

  /**
   * Combines multiple Results in parallel, collecting all errors
   */
  export const combinePar = <T extends readonly Result<unknown, unknown>[]>(
    ...results: T
  ): Result<ResultTypes<[...T]>, ErrorTypes<[...T]>[]> => {
    const as: unknown[] = []
    const es: unknown[] = []
    for (const result of results) {
      result.match({
        Success: value => { as.push(value) },
        Failure: error => { es.push(error) }
      })
    }
    if (es.length > 0) {
      return Result.failure(es as ErrorTypes<[...T]>[])
    } else {
      return Result.from(as as ResultTypes<[...T]>)
    }
  }

  /**
   * Combines an array of Results in parallel
   */
  export const combineArrayPar = <A1, E1>(results: Result<A1, E1>[]): Result<A1[], E1[]> => {
    return combinePar(...results)
  }

  /**
   * Combines multiple Results sequentially, stopping on first error
   */
  export const combineSeq = <T extends readonly Result<unknown, unknown>[]>(
    ...results: T
  ): Result<ResultTypes<[...T]>, ErrorTypes<[...T]>> => {
    const as: unknown[] = []
    for (const result of results) {   
      if (result.isSuccess()) {
        as.push(result.value)
      } else {
        return result as Failure<ResultTypes<[...T]>, ErrorTypes<[...T]>>
      }
    }
    return Result.from(as) as Success<ResultTypes<[...T]>, ErrorTypes<[...T]>>
  }

  /**
   * Combines an array of Results sequentially
   */
  export const combineArraySeq = <A1, E1>(results: Result<A1, E1>[]): Result<A1[], E1> => {
    return combineSeq(...results)
  }

  /**
   * Combines Results in parallel, ignoring failures
   */
  export const combineArrayParIgnoreFailures = <A, E>(results: Result<A, E>[]): Result<A[], never> => {
    const as: A[] = []
    for (const result of results) {
      if (result.isSuccess()) {
        as.push(result.value)
      } else {
        console.log(result.error)
      }
    }
    return Result.from(as)
  }
}

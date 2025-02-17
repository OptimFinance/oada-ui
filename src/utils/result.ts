import {ResultAsync} from "./result-async"

type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false;

type IsUnion<T, U extends T = T> =
    (T extends any ?
    (U extends T ? false : true)
        : never) extends false ? false : true

type SingleEntryObject<K extends string, A> = IsUnion<K> extends true ? never : { [P in K]: A }

export type ToBinds<Binds, K extends string, A> =
  Equal<K, never> extends true
    ? Binds 
    // something that extends string defaults to string
    // we ignore because we want singleton strings types only
    : Equal<K, string> extends true 
      ? Binds
      : (Binds & SingleEntryObject<K, A>)

export type Result<A, E, Binds={}> = Success<A, E, Binds> | Failure<A, E, Binds>

/**
 * Uses overloads for the sake of enforcing number of parameters in when
 * the first parameter is a certain type.
 */
export interface ResultInterface<A, E, Binds> {
  isSuccess(): this is Success<A, E, Binds>
  isFailure(): this is Failure<A, E, Binds>

  chain<A1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => A1 
  ): Result<A1, E, ToBinds<Binds, K, A1>>
  chain<A1, K extends string = never>(
    f: (a: A, binds: Binds) => A1,
  ): Result<A1, E, ToBinds<Binds, K, A1>>

  chainR<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Result<A1, E1> 
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>
  chainR<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Result<A1, E1>,
  ): Result<A1, E | E1, ToBinds<Binds, K, A1>>

  chainRA<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => ResultAsync<A1, E1> 
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainRA<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => ResultAsync<A1, E1>,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>

  chainP<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Promise<A1>,
    h: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>
  chainP<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Promise<A1>,
    g: (e: unknown) => E1,
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>

  chainError<E1>(f: (e: E) => E1): Result<A, E1, Binds>

  chainErrorR<A1, E1>(f: (e: E) => Result<A1, E1>): Result<A1, E1, Binds>

  chainErrorRA<A1, E1>(f: (e: E) => ResultAsync<A1, E1>): ResultAsync<A | A1, E1, Binds>

  failIf<E1>(f: (a: A, binds: Binds) => boolean, e: E1): Result<A, E | E1, Binds>
  
  match<T>(cases: Result.ResultCaseMatch<T, A, E>): T
}

export class Success<A, E, Binds={}> implements ResultInterface<A, E, Binds> {
  constructor(public readonly value: A, public readonly binds: Binds, public readonly kind: 'Success' = 'Success') {}

  isSuccess(): this is Success<A, E, Binds> { return true }
  isFailure(): this is Failure<A, E, Binds> { return false }

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
					// TODO: why doesn't type checker say value is A1
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

export class Failure<A, E, Binds = {}> implements ResultInterface<A, E, Binds> {
  constructor(public readonly error: E, public readonly binds: Binds, public readonly kind: 'Failure' = 'Failure') {}

  isSuccess(): this is Success<A, E, Binds> { return false }
  isFailure(): this is Failure<A, E, Binds> { return true }
  
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

// for combine
type ResultType<T> = T extends Result<infer ResultType, unknown> ? ResultType : never

type ErrorType<T> = T extends Result<unknown, infer ErrorType> ? ErrorType : never

type ResultTypes<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: ResultType<Tuple[Index]>
} & { length: Tuple['length'] }

type ErrorTypes<Tuple extends readonly [...any[]]> = {
  [Index in keyof Tuple]: ErrorType<Tuple[Index]>
}[number]

export namespace Result {
  export const from = <A1, E1 = never>(a: A1): Result<A1, E1, {}> => {
    return new Success(a, {})
  }

  export const failure = <A1 = never, E1 = unknown>(e: E1): Result<A1, E1> => {
    return new Failure(e, {})
  }

  export const fromNullable = <A1, E1>(nullable: A1 | null | undefined, e: E1): Result<A1, E1> => {
    if (nullable == null || nullable === undefined) {
      return failure(e)
    } else {
      return from(nullable)
    }
  }

  export const fromExceptionable = <A1, E1>(thunk: () => A1, handle: (e: unknown) => E1): Result<A1, E1> => {
    try {
      const a = thunk()
      return from(a)
    } catch (e) {
      return failure(handle(e))
    }
  }

  export interface ResultCaseMatch<T, R, E> {
    Failure(e: E): T;
    Success(v: R): T;
  }

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

  export const combineArrayPar = <A1, E1>(results: Result<A1, E1>[]): Result<A1[], E1[]> => {
    return combinePar(...results)
  }

  export const combineSeq = <T extends readonly Result<unknown, unknown>[]>(
    ...results: T
  ): Result<ResultTypes<[...T]>, ErrorTypes<[...T]>> => {
    // we cheat
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

  export const combineArraySeq = <A1, E1>(results: Result<A1, E1>[]): Result<A1[], E1> => {
    return combineSeq(...results)
  }

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

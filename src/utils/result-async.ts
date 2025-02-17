import { Result, ToBinds } from "./result";

type ResultAsyncType<T> = T extends ResultAsync<infer A, unknown> ? A : never;

type ResultAsyncErrorType<T> = T extends ResultAsync<unknown, infer E>
  ? E
  : never;

export type ResultAsyncTypes<Tuple extends readonly [...unknown[]]> = {
  [Index in keyof Tuple]: ResultAsyncType<Tuple[Index]>;
} & { length: Tuple["length"] };

export type ResultAsyncErrorTypes<Tuple extends readonly [...unknown[]]> = {
  [Index in keyof Tuple]: ResultAsyncErrorType<Tuple[Index]>;
}[number];

type ResultAsyncToResult<T> = T extends ResultAsync<infer A, infer E>
  ? Result<A, E>
  : never;

type ResultAsyncsToResults<Tuple extends readonly [...unknown[]]> = {
  [Index in keyof Tuple]: ResultAsyncToResult<Tuple[Index]>;
};

// type A = ResultAsyncsToResults<[ResultAsync<number, string>, ResultAsync<string, number>]>

export class ResultAsync<A, E, Binds = {}> {
  static from<A1, E1 = never>(a: A1): ResultAsync<A1, E1> {
    return new ResultAsync(() => Promise.resolve().then((_) => Result.from(a)));
  }

  static failure<A1 = never, E1 = unknown>(e: E1): ResultAsync<A1, E1> {
    return new ResultAsync(() =>
      Promise.resolve().then((_) => Result.failure(e))
    );
  }

  static fromResult<A1, E1, Binds>(
    result: Result<A1, E1, Binds>
  ): ResultAsync<A1, E1, Binds> {
    return new ResultAsync(() => Promise.resolve().then((_) => result));
  }

  static fromNullable<A1, E1>(
    nullable: A1 | null | undefined,
    e: E1
  ): ResultAsync<A1, E1> {
    return ResultAsync.fromResult(Result.fromNullable(nullable, e));
  }

  static fromExceptionable<A1, E1>(
    thunk: () => A1,
    handle: (e: unknown) => E1
  ): ResultAsync<A1, E1> {
    return ResultAsync.fromResult(Result.fromExceptionable(thunk, handle));
  }

  static fromPromise<A1, E1>(
    promiseThunk: () => Promise<A1>,
    handle: (e: unknown) => E1
  ): ResultAsync<A1, E1> {
    return new ResultAsync(async () => {
      try {
        const a = await promiseThunk();
        return Result.from(a);
      } catch (e) {
        return Result.failure(handle(e));
      }
    });
  }

  /**
   * for the sake of type inference
   * can't do if (boolean) Result<A, E1> else Result<A, E2> without an error
   * because E1 can't be assigned to E2
   */
  static ifThenElse<A1, E1, A2, E2>(
    condition: boolean,
    f: () => ResultAsync<A1, E1>,
    g: () => ResultAsync<A2, E2>
  ): ResultAsync<A1 | A2, E1 | E2> {
    if (condition) {
      return f();
    } else {
      return g();
    }
  }

  // sequence tuple of result asyncs stopping on first error
  static combineSeq<T extends readonly [...ResultAsync<unknown, unknown>[]]>(
    ...resultAsyncs: T
  ): ResultAsync<ResultAsyncTypes<T>, ResultAsyncErrorTypes<T>> {
    // cheat
    return new ResultAsync(async () => {
      const successes: unknown[] = [];
      for (const resultAsync of resultAsyncs) {
        const result = await resultAsync.run();
        if (result.isFailure()) {
          return result as Result<
            ResultAsyncTypes<T>,
            ResultAsyncErrorTypes<T>
          >;
        } else {
          successes.push(result.value);
        }
      }
      return Result.from(successes) as unknown as Result<
        ResultAsyncTypes<T>,
        ResultAsyncErrorTypes<T>
      >;
    });
  }

  // sequence result asyncs stopping on first error
  static combineArraySeq<A1, E1>(
    resultAsyncs: ResultAsync<A1, E1>[]
  ): ResultAsync<A1[], E1> {
    return ResultAsync.combineSeq(...resultAsyncs);
  }

  //   // NOTE: you have to use `combineTuplePar([a, b, c] as const)` to interpret array literal as tuple
  static combinePar<T extends readonly [...ResultAsync<unknown, unknown>[]]>(
    ...resultAsyncs: T
  ): ResultAsync<ResultAsyncTypes<T>, ResultAsyncErrorTypes<T>[]> {
    return new ResultAsync(async () => {
      const resultPromises = resultAsyncs.map((resultAsync) =>
        resultAsync.run()
      );
      const promiseSettledResults = await Promise.allSettled(resultPromises);
      const results = promiseSettledResults.map((promiseSettledResult) => {
        if (promiseSettledResult.status === "fulfilled") {
          return promiseSettledResult.value;
        } else {
          // all handleable exceptions from Promises should be converted
          // into error values earlier so if promise rejects, we throw
          throw promiseSettledResult.reason;
        }
      });
      return Result.combinePar(...results) as unknown as Result<
        ResultAsyncTypes<T>,
        ResultAsyncErrorTypes<T>[]
      >;
    });
  }

  // sequence ResultAsyncs in parallel gathering all errors
  static combineArrayPar<A1, E1>(
    resultAsyncs: ResultAsync<A1, E1>[]
  ): ResultAsync<A1[], E1[]> {
    return ResultAsync.combinePar(...resultAsyncs);
  }

  static combineArrayParIgnoreFailures<A, E>(
    resultAsyncs: ResultAsync<A, E>[]
  ): ResultAsync<A[], never> {
    return new ResultAsync(async () => {
      const resultPromises = resultAsyncs.map((resultAsync) =>
        resultAsync.run()
      );
      const settledPromises = await Promise.allSettled(resultPromises);
      const results = settledPromises.map((settledPromise) => {
        if (settledPromise.status === "fulfilled") {
          return settledPromise.value;
        } else {
          // all handleable exceptions from Promises should be converted
          // into error values earlier so if promise rejects, we throw
          throw settledPromise.reason;
        }
      });
      return Result.combineArrayParIgnoreFailures(results);
    });
  }

  static combineParReify<
    T extends readonly [...ResultAsync<unknown, unknown>[]]
  >(...resultAsyncs: T): ResultAsync<ResultAsyncsToResults<T>, never> {
    return new ResultAsync(async () => {
      const resultPromises = resultAsyncs.map((resultAsync) =>
        resultAsync.run()
      );
      const settledPromises = await Promise.allSettled(resultPromises);
      const results = settledPromises.map((settledPromise) => {
        if (settledPromise.status === "fulfilled") {
          return settledPromise.value;
        } else {
          // all handleable exceptions from Promises should be converted
          // into error values earlier so if promise rejects, we throw
          throw settledPromise.reason;
        }
      });
      return Result.from(results as unknown as ResultAsyncsToResults<T>);
    });
  }

  // l : s -> (s -> IO s e) -> (Either s e -> IO (Either s a) e1) -> IO (Either a e1)
  static iterateUntil<S, E, A>(
    initialState: S,
    makeComputation: (state: S) => ResultAsync<Result<S, A>, E>
  ): ResultAsync<A, E> {
    return new ResultAsync(async () => {
      let state = initialState;
      let result = await makeComputation(state).run();
      while (true) {
        if (result.isSuccess()) {
          const decision = result.value;
          if (decision.isSuccess()) {
            state = decision.value;
            result = await makeComputation(state).run();
          } else {
            return Result.from(decision.error);
          }
        } else {
          return result as unknown as Result<A, E>;
        }
      }
    });
  }

  static loopUntilSimpler<E1, S = never, A1 = never, A = never, E = never>(
    initialState: S,
    computation: (state: S) => ResultAsync<A, E>,
    decider: (state: S, r: Result<A, E>) => ResultAsync<Result<S, A1>, E1>
  ): ResultAsync<A1, E1> {
    return new ResultAsync(async () => {
      let state = initialState;
      let result = await computation(state).run();
      let decision = await decider(state, result).run();
      while (decision.isSuccess()) {
        const subDecision = decision.value;
        if (subDecision.isSuccess()) {
          state = subDecision.value;
          result = await computation(state).run();
          decision = await decider(state, result).run();
        } else {
          return Result.from(subDecision.error);
        }
      }
      return Result.failure(decision.error);
    });
  }
  /**
   * Executes h until f or g returns a stop result or a failure.
   * Accumulates each A1 produced from f or g into an array.
   *
   * Success(Success([A, P])) - continue accumulating A, producing params P
   * Success(Failure(A)) - end successfully accumulating A
   * Failure(E) - end unsuccessfully failing with E
   */
  static loopUntil<E1, A1 = never, P = never, A = never, E = never>(
    initialParams: P,
    h: (params: P) => ResultAsync<A, E>,
    f: (params: P) => (a: A) => ResultAsync<Result<[A1, P], A1>, E1>,
    g: (params: P) => (e: E) => ResultAsync<Result<[A1, P], A1>, E1>
  ): ResultAsync<A1[], E1> {
    return new ResultAsync(async () => {
      const total: A1[] = [];
      let params = initialParams;
      let result = await h(params).run();
      let until = await result
        .match({ Success: f(params), Failure: g(params) })
        .run();
      while (until.isSuccess()) {
        const untilResult = until.value;
        if (untilResult.isSuccess()) {
          total.push(untilResult.value[0]);
          params = untilResult.value[1];
          result = await h(params).run();
          until = await result
            .match({ Success: f(params), Failure: g(params) })
            .run();
        } else {
          total.push(untilResult.error);
          break;
        }
      }
      return until.chain((_) => total);
    });
  }

  constructor(
    public readonly promiseThunk: () => Promise<Result<A, E, Binds>>
  ) {}

  run(): Promise<Result<A, E, Binds>> {
    return this.promiseThunk();
  }

  async match<T>(cases: Result.ResultCaseMatch<T, A, E>): Promise<T> {
    const result = await this.promiseThunk();
    return result.match(cases);
  }

  chain<A1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => A1
  ): ResultAsync<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: (a: A, binds: Binds) => A1
  ): ResultAsync<A1, E, ToBinds<Binds, K, A1>>;
  chain<A1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => A1),
    g?: (a: A, binds: Binds) => A1
  ): ResultAsync<A1, E, ToBinds<Binds, K, A1>> {
    // duplication of logic for overloads
    // cause I don't know how to get typescript
    // to call the implementation function of the
    // Result.chain overloads
    if (typeof f === "function" && g === undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        return result.chain(f);
      });
    } else if (typeof f !== "function" && g !== undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        return result.chain(f, g);
      });
    } else {
      throw Error(
        "If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined"
      );
    }
  }

  chainR<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Result<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainR<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Result<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainR<A1, E1, Binds1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => Result<A1, E1, Binds1>),
    g?: (a: A, binds: Binds) => Result<A1, E1, Binds1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === "function" && g === undefined) {
      //@ts-ignore
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        //@ts-ignore
        return result.chainR(f);
      });
    } else if (typeof f !== "function" && g !== undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        //@ts-ignore
        return result.chainR(f, g);
      });
    } else {
      throw Error(
        "If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined"
      );
    }
  }

  chainRA<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => ResultAsync<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainRA<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => ResultAsync<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainRA<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => ResultAsync<A1, E1>),
    g?: (a: A, binds: Binds) => ResultAsync<A1, E1>
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === "function" && g === undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        return result.chainRA<A1, E1, K>(f).run();
      });
    } else if (typeof f !== "function" && g !== undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        return result.chainRA(f, g).run();
      });
    } else {
      throw Error(
        "If binding is defined then g must be defined, otherwise if binding is not defined then g must not be defined"
      );
    }
  }

  chainP<A1, E1, K extends string = never>(
    f: K,
    g: (a: A, binds: Binds) => Promise<A1>,
    h: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainP<A1, E1, K extends string = never>(
    f: (a: A, binds: Binds) => Promise<A1>,
    g: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>>;
  chainP<A1, E1, K extends string = never>(
    f: K | ((a: A, binds: Binds) => Promise<A1>),
    g:
      | ((a: A, binds: Binds) => Promise<A1>)
      | ((e: unknown, binds: Binds) => E1),
    h?: (e: unknown) => E1
  ): ResultAsync<A1, E | E1, ToBinds<Binds, K, A1>> {
    if (typeof f === "function" && h === undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        // not certain why I have to annotate the types on chainP
        return result.chainP<A1, E1, K>(f, g as (e: unknown) => E1).run();
      });
    } else if (typeof f !== "function" && h !== undefined) {
      return new ResultAsync(async () => {
        const result = await this.promiseThunk();
        return result
          .chainP(f, g as (a: A, binds: Binds) => Promise<A1>, h)
          .run();
      });
    } else {
      throw Error(
        "If binding is defined then g must be defined and h must be defined, otherwise if binding is not defined then g must be defined, and h must not be defined"
      );
    }
  }

  chainError<E1>(f: (e: E) => E1): ResultAsync<A, E1, Binds> {
    return new ResultAsync(async () => {
      const result = await this.promiseThunk();
      return result.chainError(f);
    });
  }

  chainErrorR<A1, E1>(
    f: (e: E) => Result<A1, E1>
  ): ResultAsync<A | A1, E1, Binds> {
    return new ResultAsync(async () => {
      const result = await this.promiseThunk();
      return result.chainErrorR(f);
    });
  }

  chainErrorRA<A1, E1>(
    f: (e: E) => ResultAsync<A1, E1>
  ): ResultAsync<A | A1, E1, Binds> {
    return new ResultAsync(async () => {
      const result = await this.promiseThunk();
      return result.chainErrorRA(f).run();
    });
  }

  failIf<E1>(
    f: (a: A, binds: Binds) => boolean,
    e: E1
  ): ResultAsync<A, E | E1, Binds> {
    return new ResultAsync(async () => {
      const result = await this.promiseThunk();
      return result.failIf(f, e);
    });
  }
}

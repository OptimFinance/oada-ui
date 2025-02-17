
# Error Values

We use 2 types pervasively through the code: `ResultAsync<A, E>`, and `Result<A, E>`.

`Result<A, E>` is basically `Either e a` but encoded using classes `Success<A, E>`, `Failure<A, E>`, and union `Result<A, E> = Success<A, E> | Failure<A, E>`.

`ResultAsync<A, E>` is basically `IO (Either e a)` or in typescript `() => Promise<Result<A, E>>`.

Both of these types have methods with the same names which allows us to "seamlessly" change the type of a `Result<A, E>` to `ResultAsync<A, E>` because of the fluent API.

The code for these types/classes are in `src/bond/result.ts` and `src/bond/result-async.ts`.

The methods are
```
// Result

chain : {Result a e} -> (a -> b) -> Result b e
chainR : {Result a e} -> (a -> Result b e1) -> Result b (e | e1)
chainRA : {Result a e} -> (a -> ResultAsync b e1) -> ResultAsync b (e | e1)
chainP: {Result a e} -> (a -> Promise b) -> (o -> e1) -> ResultAsync b (e | e1)

handle : {Result a e} -> (e -> e1) -> ResultAsync a e1
handleR : {Result a e} -> (e -> Result a1 e1) -> Result (a | a1) e1
handleRA : {Result a e} -> (e -> ResultAsync a1 e1) -> ResultAsync (a | a1) e1

failIf : {Result a e} -> (a -> boolean) -> e1 -> Result a e1

match : {Result a e} -> {Success: a -> r, Failure: e -> r} -> r

isSuccess : {Result a e} -> {Result a e} is (Success a e)
isFailure : {Result a e} -> {Result a e} is (Failure a e)

// ResultAsync

chain : {ResultAsync a e} -> (a -> b) -> ResultAsync b e
chainR : {ResultAsync a e} -> (a -> Result b e1) -> ResultAsync b (e | e1)
chainRA : {ResultAsync a e} -> (a -> ResultAsync b e1) -> ResultAsync b (e | e1)
chainP: {ResultAsync a e} -> (a -> Promise b) -> (unknown -> e1) -> ResultAsyncAsync b (e | e1)

handle : {ResultAsync a e} -> (e -> e1) -> ResultAsync a e1
handleR : {ResultAsync a e} -> (e -> Result a1 e1) -> ResultAsync (a | a1) e1
handleRA : {ResultAsync a e} -> (e -> ResultAsync a1 e1) -> ResultAsync (a | a1) e1

failIf : {ResultAsync a e} -> (a -> boolean) -> e1 -> ResultAsync a e1

match : {ResultAsync a e} -> {Success: a -> r, Failure: e -> r} -> Promise r

run : {ResultAsync a e} -> Promise (Result r e)
```

Notice that `chain` is not `flatMap`/`>>=` as you might be used to. It's infact equivalent to `map`. There is a pattern to it though. The suffix of `chainX` is just the outer return type of the callback given to `chainX`.

The naming of the `handleX` methods aren't good. Not sure what to name them. `handle` is `mapError` or `mapLeft`, the rest, not sure.

## Constructors

```
// Result

from : a -> Result a void 

failure : e -> Result void e

fromNullable : a -> e -> Result a e

fromExceptionable : (() -> a) -> (unknown -> e) -> Result a e

// ResultAsync

from : a -> Result a void 

failure : e -> Result void e

fromNullable : a -> e -> Result a e

fromExceptionable : (() -> a) -> (unknown -> e) -> Result a e

fromPromise : (() -> Promise a) -> (unknown -> e) -> ResultAsync a e
```

The idea is to catch all handleable exceptions when entering the "Result ecosystem" so that any exceptions encountered are of the unrecoverable kind.

We might want to rename `from` to `success` for symmetry's sake.

## Do notation

The above type signatures don't show the integrated do notation. Here's an example:

```
getStoreWallet(thunkAPI)
  .chain('storeWallet', sw => sw)
  .chainRA('walletUtxos', storeWallet => { 
    return getUtxosFromWallet(storeWallet)
      .failIf(utxos => utxos.length === 0, new WalletHasNoUtxosError())
    })
  .chain((_walletUtxos, {walletUtxos, storeWallet}) => ...)
```

In the above, the return value of the first chain is stored as `storeWallet`, the return value of the second `chainRA` stored as `walletUtxos`. These bindings are then destructured by the second parameter of the callback in the last `chain` call. 

Notice also that the labels for the return values are optional. Every `chainX` method can do this.

## Combining tuples/arrays, Iteration 

```
// Result namespace

combineSeq : (Result a1 e1, ..., Result an en) -> Result (a1, ..., an) (e1 | ... | en)
combineArraySeq : [Result a e] -> Result [a] e

combinePar : (Result a1 e1, ..., Result an en) -> Result (a1, ..., an) [e1 | ... | en]
combineArrayPar : [Result a e] -> Result [a] [e]

// ResultAsync namespace

combineSeq : (ResultAsync a1 e1, ..., ResultAsync an en) -> ResultAsync (a1, ..., an) (e1 | ... | en)
combineArraySeq : [ResultAsync a e] -> ResultAsync [a] e

combinePar : (ResultAsync a1 e1, ..., ResultAsync an en) -> ResultAsync (a1, ..., an) [e1 | ... | en]
combineArrayPar : [ResultAsync a e] -> ResultAsync [a] [e]

combineArrayParIgnoreFailures : [ResultAsync a e] -> ResultAsync [a] void

combineParReify : (ResultAsync a1 e1, ..., ResultAsync an en) -> ResultAsync (Result a1 e1, ..., Result an en) void

iterateUntil : s -> (s -> ResultAsync (Result s a) e) -> ResultAsync a e

ifThenElse : Boolean -> (() -> ResultAsync a1 e1) -> (() -> ResultAsync a2 e2) -> ResultAsync (a1 | a2) (e1 | e2)
```

The tuple combining just uses arguments to the functions as tuples. For example:
```
combineSeq(result1, result2, result3) // Result<[r1, r2, r3], e1 | e2 | e3>
```

The difference between `Seq` and `Par` suffixes are that promises in the `Par` are run asynchronously, while `Seq` waits for the previous to finish before doing the next.

The combine functions in general are similar to `sequence`.

### `iterateUntil`

`iterateUntil` will take the initial state `s` given to it, pass it to the computation creating function (its next parameter), and then if the computation results in `s` then we loop again doing the same thing, otherwise we quit with the result, and if the computation itself returns an error then we quit with the error.

### `ifThenElse`

Why does `ifThenElse` exist? Type inference sucks. Consider
```
if (boolean) {
  return resultAsync1 // ResultAsync<A, E1>
} else {
  return resultAsync2 // ResultAsync<A, E2>
}
```
The compiler currently will complain about `E1` not being assignable to `E2`. That's true, but we'd like it to widen the type to `E1 | E2` instead of assign. So for a bit of an easier time this function exists. Otherwise you'd have to think about how to chain functions together to get the branching and inference you want, or annotate the types. There might be another more ergonomic solution out there...

## Issues

- The ergonomics of monadic looping and branching together are pretty terrible. It might be worth figuring out an API better than `iterateWhile` + `ifThenElse` to do it.
- Do not bind the same name more than once when using the "do notation" feature. It will use the last bound value. However, it becomes much worse if you bind the same name to values of different types. Often the type inferred will be `never`, yet you can still destructure the object to get a value of `never` which more or less means the type system is (mostly) broken at that point.
- When you've accumulated a lot of unioned type errors in the type of something it becomes unwieldy to write the whole error union in a type parameter. The simplest thing I've found is to create a type alias for the type union, and type out all of the errors there. This can be helped in some cases by using an IDE to write out the inferred types for you, but usually I just manually type it out, then use the type alias. Then you can reuse this type alias in other functions that call that function, and so on, so it's not that bad.
- `match` type inference isn't that good similar to the if-then-else inference. Often you want to annotate the return type by doing `match<ReturnType>`, or simply use the type guards `result.isSuccess()`, `result.isFailure()`. In this case there may be a way to get better inference in `match`, but keep it simple for now.
- What is the performance? If too slow it may be that we shouldn't delay promises.
- Probably more but I forgot.

## Style
- If asynchronicity is not needed I find using the do notation better than `combineSeq`. Of course if you have arrays of results then use `combineSeq`.
- When creating error values I just use a class extending `Error`. It's important though to give your class a name that is narrower than string so that the compiler thinks 2 different error classes are actually different types.
- When finding yourself checking the types of things, if possible push that check into the types of the parameters received by the function so that you don't have to do the check at all. That is, make it the caller's problem. Then as the caller, repeat this process until you've reached the edge of the program where you are forced to do checks. This process will likely mean you need to invent a lot of types to encode the fact that you've already validated the data, but it gives the downstream code a much easier time. TBH, our code hasn't done too much of this.

---
title: '@urql/core'
order: 0
---

# @urql/core

The `@urql/core` package is the basis of all framework bindings. Each bindings-package,
like [`urql` for React](./urql.md) or [`@urql/preact`](./preact.md), will reuse the core logic and
reexport all exports from `@urql/core`.
Therefore if you're not accessing utilities directly, aren't in a Node.js environment, and are using
framework bindings, you'll likely want to import from your framework bindings package directly.

[Read more about `urql`'s core on the "Core Package" page.](../basics/core.md)

## Client

The `Client` manages all operations and ongoing requests to the exchange pipeline.
It accepts several options on creation.

`@urql/core` also exposes `createClient()` that is just a convenient alternative to calling `new Client()`.

| Input             | Type                               | Description                                                                                                                                                                            |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exchanges`       | `Exchange[]`                       | An array of `Exchange`s that the client should use instead of the list of `defaultExchanges`                                                                                           |
| `url`             | `string`                           | The GraphQL API URL as used by `fetchExchange`                                                                                                                                         |
| `fetchOptions`    | `RequestInit \| () => RequestInit` | Additional `fetchOptions` that `fetch` in `fetchExchange` should use to make a request                                                                                                 |
| `fetch`           | `typeof fetch`                     | An alternative implementation of `fetch` that will be used by the `fetchExchange` instead of `window.fetch`                                                                            |
| `suspense`        | `?boolean`                         | Activates the experimental React suspense mode, which can be used during server-side rendering to prefetch data                                                                        |
| `requestPolicy`   | `?RequestPolicy`                   | Changes the default request policy that will be used. By default, this will be `cache-first`.                                                                                          |
| `preferGetMethod` | `?boolean`                         | This is picked up by the `fetchExchange` and will force all queries (not mutations) to be sent using the HTTP GET method instead of POST.                                              |
| `maskTypename`    | `?boolean`                         | Enables the `Client` to automatically apply the `maskTypename` utility to all `data` on [`OperationResult`s](#operationresult). This makes the `__typename` properties non-enumerable. |

### client.executeQuery

Accepts a [`GraphQLRequest`](#graphqlrequest) and optionally `Partial<OperationContext>`, and returns a
[`Source<OperationResult>`](#operationresult) — a stream of query results that can be subscribed to.

Internally, subscribing to the returned source will create an [`Operation`](#operation), with
`kind` set to `'query'`, and dispatch it on the
exchanges pipeline. If no subscribers are listening to this operation anymore and unsubscribe from
the query sources, the `Client` will dispatch a "teardown" operation.

- [Instead of using this method directly, you may want to use the `client.query` shortcut
  instead.](#clientquery)
- [See `createRequest` for a utility that creates `GraphQLRequest` objects.](#createrequest)

### client.executeSubscription

This is functionally the same as `client.executeQuery`, but creates operations for subscriptions
instead, with `kind` set to `'subscription'`.

### client.executeMutation

This is functionally the same as `client.executeQuery`, but creates operations for mutations
instead, with `kind` set to `'mutation'`.

A mutation source is always guaranteed to only respond with a single [`OperationResult`](#operationresult) and then complete.

### client.query

This is a shorthand method for [`client.executeQuery`](#clientexecutequery), which accepts a query
(`DocumentNode | string`) and variables separately and creates a [`GraphQLRequest`](#graphqlrequest) [`createRequest`](#createrequest) automatically.

The returned `Source<OperationResult>` will also have an added `toPromise` method, so the stream can
be conveniently converted to a promise.

```js
import { pipe, subscribe } from 'wonka';

const { unsubscribe } = pipe(
  client.query('{ test }', {
    /* vars */
  }),
  subscribe(result => {
    console.log(result); // OperationResult
  })
);

// or with toPromise, which also limits this to one result
client
  .query('{ test }', {
    /* vars */
  })
  .toPromise()
  .then(result => {
    console.log(result); // OperationResult
  });
```

[Read more about how to use this API on the "Core Package"
page.](../basics/core.md#one-off-queries-and-mutations)

### client.mutation

This is similar to [`client.query`](#clientquery), but dispatches mutations instead.

[Read more about how to use this API on the "Core Package"
page.](../basics/core.md#one-off-queries-and-mutations)

### client.subscription

This is similar to [`client.query`](#clientquery), but does not provide a `toPromise()` helper method on the streams it returns.

[Read more about how to use this API on the "Subscriptions" page.](../advanced/subscriptions.md)

### client.reexecuteOperation

This method is commonly used in _Exchanges_ to reexecute an [`Operation`](#operation) on the
`Client`. It will only reexecute when there are still subscribers for the given
[`Operation`](#operation).

For an example, this method is used by the `cacheExchange` when an
[`OperationResult`](#operationresult) is invalidated in the cache and needs to be refetched.

### client.readQuery

This method is typically used to read data synchronously from a cache. It returns an [`OperationResult`](#operationresult) if a value is returned immediately or `null` if no value is returned while cancelling all side effects.

## CombinedError

The `CombinedError` is used in `urql` to normalize network errors and `GraphQLError`s if anything
goes wrong during a GraphQL request.

| Input           | Type                             | Description                                                                        |
| --------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `networkError`  | `?Error`                         | An unexpected error that might've occurred when trying to send the GraphQL request |
| `graphQLErrors` | `?Array<string \| GraphQLError>` | GraphQL Errors (if any) that were returned by the GraphQL API                      |
| `response`      | `?any`                           | The raw response object (if any) from the `fetch` call                             |

[Read more about errors in `urql` on the "Error" page.](../basics/errors.md)

## Types

### GraphQLRequest

This often comes up as the **input** for every GraphQL request.
It consists of `query` and optionally `variables`.

| Prop        | Type           | Description                                                                                                           |
| ----------- | -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `key`       | `number`       | A unique key that identifies this exact combination of `query` and `variables`, which is derived using a stable hash. |
| `query`     | `DocumentNode` | The query to be executed. Accepts as a plain string query or GraphQL DocumentNode.                                    |
| `variables` | `?object`      | The variables to be used with the GraphQL request.                                                                    |

The `key` property is a hash of both the `query` and the `variables`, to uniquely
identify the request. When `variables` are passed it is ensured that they're stably stringified so
that the same variables in a different order will result in the same `key`, since variables are
order-independent in GraphQL.

[A `GraphQLRequest` may be manually created using the `createRequest` helper.](#createrequest)

### OperationType

This determines what _kind of operation_ the exchanges need to perform.
This is one of:

- `'subscription'`
- `'query'`
- `'mutation'`
- `'teardown'`

The `'teardown'` operation is special in that it instructs exchanges to cancel
any ongoing operations with the same key as the `'teardown'` operation that is
received.

### Operation

The input for every exchange that informs GraphQL requests.
It extends the [`GraphQLRequest` type](#graphqlrequest) and contains these additional properties:

| Prop      | Type               | Description                                   |
| --------- | ------------------ | --------------------------------------------- |
| `kind`    | `OperationType`    | The type of GraphQL operation being executed. |
| `context` | `OperationContext` | Additional metadata passed to exchange.       |

An `Operation` also contains the `operationName` property, which is a deprecated alias of the `kind`
property and outputs a deprecation warning if it's used.

### RequestPolicy

This determines the strategy that a cache exchange should use to fulfill an operation.
When you implement a custom cache exchange it's recommended that these policies are
handled.

- `'cache-first'` (default)
- `'cache-only'`
- `'network-only'`
- `'cache-and-network'`

[Read more about request policies on the "Document Caching" page.](../basics/document-caching.md#request-policies)

### OperationContext

The context often carries options or metadata for individual exchanges, but may also contain custom
data that can be passed from almost all API methods in `urql` that deal with
[`Operation`s](#operation).

Some of these options are set when the `Client` is initialised, so in the following list of
properties you'll likely see some options that exist on the `Client` as well.

| Prop                  | Type                                  | Description                                                                                                                     |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `fetchOptions`        | `?RequestInit \| (() => RequestInit)` | Additional `fetchOptions` that `fetch` in `fetchExchange` should use to make a request.                                         |
| `fetch`               | `typeof fetch`                        | An alternative implementation of `fetch` that will be used by the `fetchExchange` instead of `window.fetch`                     |
| `requestPolicy`       | `RequestPolicy`                       | An optional [request policy](../basics/document-caching.md#request-policies) that should be used specifying the cache strategy. |
| `url`                 | `string`                              | The GraphQL endpoint                                                                                                            |
| `meta`                | `?OperationDebugMeta`                 | Metadata that is only available in development for devtools.                                                                    |
| `suspense`            | `?boolean`                            | Whether suspense is enabled.                                                                                                    |
| `preferGetMethod`     | `?boolean`                            | Instructs the `fetchExchange` to use HTTP GET for queries.                                                                      |
| `additionalTypenames` | `?string[]`                           | Allows you to tell the operation that it depends on certain typenames (used in document-cache.)                                 |

It also accepts additional, untyped parameters that can be used to send more
information to custom exchanges.

### OperationResult

The result of every GraphQL request, i.e. an `Operation`. It's very similar to what comes back from
a typical GraphQL API, but slightly enriched and normalized.

| Prop         | Type                   | Description                                                                                                                                       |
| ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operation`  | `Operation`            | The operation that this is a result for                                                                                                           |
| `data`       | `?any`                 | Data returned by the specified query                                                                                                              |
| `error`      | `?CombinedError`       | A [`CombinedError`](#combinederror) instances that wraps network or `GraphQLError`s (if any)                                                      |
| `extensions` | `?Record<string, any>` | Extensions that the GraphQL server may have returned.                                                                                             |
| `stale`      | `?boolean`             | A flag that may be set to `true` by exchanges to indicate that the `data` is incomplete or out-of-date, and that the result will be updated soon. |

### ExchangeInput

This is the input that an [`Exchange`](#exchange) receives when it's initialized by the
[`Client`](#client)

| Input     | Type         | Description                                                                                                             |
| --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `forward` | `ExchangeIO` | The unction responsible for receiving an observable operation and returning a result                                    |
| `client`  | `Client`     | The urql application-wide client library. Each execute method starts a GraphQL request and returns a stream of results. |

### Exchange

An exchange represents abstractions of small chunks of logic in `urql`.
They're small building blocks and similar to "middleware".

[Read more about _Exchanges_ on the "Authoring Exchanges" page.](../advanced/authoring-exchanges.md)

An exchange is defined to be a function that receives [`ExchangeInput`](#exchangeinput) and returns
an `ExchangeIO` function. The `ExchangeIO` function in turn will receive a stream of operations, and
must return a stream of results. If the exchange is purely transforming data, like the
`dedupExchange` for instance, it'll call `forward`, which is the next Exchange's `ExchangeIO`
function to get a stream of results.

```js
type ExchangeIO = (Source<Operation>) => Source<OperationResult>;
type Exchange = ExchangeInput => ExchangeIO;
```

[If you haven't yet seen streams you can read more about "Stream Patterns" on the "Architecture"
page.](../architecture.md)

## Exchanges

### cacheExchange

The `cacheExchange` as [described on the "Document Caching" page.](../basics/document-caching.md). It's of type `Exchange`.

### subscriptionExchange

The `subscriptionExchange` as [described on the "Subscriptions" page.](../advanced/subscriptions.md). It's of type `Options => Exchange`.

It accepts a single input: `{ forwardSubscription }`. This is a function that
receives an enriched operation and must return an Observable-like object that
streams `GraphQLResult`s with `data` and `errors`.

The `forwardSubscription` function is commonly connected to the [`subscriptions-transport-ws`
package](https://github.com/apollographql/subscriptions-transport-ws).

### ssrExchange

The `ssrExchange` as [described on the "Server-side Rendering"
page.](../advanced/server-side-rendering.md).
It's of type `Options => Exchange`.

It accepts two inputs, `initialState` which is completely
optional and populates the server-side rendered data with
a rehydrated cache, and `isClient` which can be set to
`true` or `false` to tell the `ssrExchange` whether to
write to (server-side) or read from (client-side) the cache.

By default, `isClient` defaults to `true` when the `Client.suspense`
mode is disabled and to `false` when the `Client.suspense` mode
is enabled.

This can be used to extract data that has been queried on
the server-side, which is also described in the Basics section,
and is also used on the client-side to restore server-side
rendered data.

When called, this function creates an `Exchange`, which also has
two methods on it:

- `.restoreData(data)` which can be used to inject data, typically
  on the client-side.
- `.extractData()` which is typically used on the server-side to
  extract the server-side rendered data.

Basically, the `ssrExchange` is a small cache that collects data
during the server-side rendering pass, and allows you to populate
the cache on the client-side with the same data.

During React rehydration this cache will be emptied, and it will
become inactive and won't change the results of queries after
rehydration.

It needs to be used _after_ other caching Exchanges like the
`cacheExchange`, but before any _asynchronous_ Exchange like
the `fetchExchange`.

### debugExchange

An exchange that writes incoming `Operation`s to `console.log` and
writes completed `OperationResult`s to `console.log`.

It accepts two optional input functions `onIncoming` and `onCompleted` which can
be supplied to override the default log behavior

```ts
debugExchange({
  onIncoming: op => console.warn('Incoming Operation: ', op.key, op.kind),
  onCompleted: result => console.warn('Result data: ', result.operation.key, result.data),
});
```

### dedupExchange

An exchange that keeps track of ongoing `Operation`s that haven't returned had
a corresponding `OperationResult` yet. Any duplicate `Operation` that it
receives is filtered out if the same `Operation` has already been received
and is still waiting for a result.

### fetchExchange

The `fetchExchange` of type `Exchange` is responsible for sending operations of type `'query'` and
`'mutation'` to a GraphQL API using `fetch`.

### errorExchange

An exchange that lets you inspect errors. This can be useful for logging, or reacting to
different types of errors (e.g. logging the user out in case of a permission error).

```ts
errorExchange({
  onError: (error: CombinedError, operation: Operation) => {
    console.log('An error!', error);
  },
});
```

## Utilities

### gql

This is a `gql` tagged template literal function, similar to the one that's also commonly known from
`graphql-tag`. It can be used to write GraphQL documents in a tagged template literal and returns a
parsed `DocumentNode` that's primed against the `createRequest`'s cache for `key`s.

```js
import { gql } from '@urql/core';

const SharedFragment = gql`
  fragment UserFrag on User {
    id
    name
  }
`;

gql`
  query {
    user
    ...UserFrag
  }

  ${SharedFragment}
`;
```

Unlike `graphql-tag`, this function outputs a warning in development when names of fragments in the
document are duplicated. It does not output warnings when fragment names were duplicated globally
however.

### stringifyVariables

This function is a variation of `JSON.stringify` that sorts any object's keys that is being
stringified to ensure that two objects with a different order of keys will be stably stringified to
the same string.

```js
stringifyVariables({ a: 1, b: 2 }); // {"a":1,"b":2}
stringifyVariables({ b: 2, a: 1 }); // {"a":1,"b":2}
```

### createRequest

This utility accepts a GraphQL query of type `string | DocumentNode` and optionally an object of
variables, and returns a [`GraphQLRequest` object](#graphqlrequest).

Since the [`client.executeQuery`](#clientexecutequery) and other execute methods only accept
[`GraphQLRequest`s](#graphqlrequest), this helper is commonly used to create that request first. The
[`client.query`](#clientquery) and [`client.mutation`](#clientmutation) methods use this helper as
well to create requests.

The helper takes are of creating a unique `key` for the `GraphQLRequest`. This is a hash of the
`query` and `variables` if they're passed. The `variables` will be stringified using
[`stringifyVariables`](#stringifyvariables), which outputs a stable JSON string.

Additionally, this utility will ensure that the `query` reference will remain stable. This means
that if the same `query` will be passed in as a string or as a fresh `DocumentNode`, then the output
will always have the same `DocumentNode` reference.

### makeOperation

This utility is used to either turn a [`GraphQLRequest` object](#graphqlrequest) into a new
[`Operation` object](#operation) or to copy an `Operation`. It adds the `kind` property, and the
`operationName` alias that outputs a deprecation warning.

It accepts three arguments:

- An `Operation`'s `kind` (See [`OperationType`](#operationtype)
- A [`GraphQLRequest` object](#graphqlrequest) or another [`Operation`](#operation) that should be
  copied.
- and; optionally a [partial `OperationContext` object.](#operationcontext). This argument may be
  left out if the context is to be copied from the operation that may be passed as a second argument.

Hence some valid uses of the utility are:

```js
// Create a new operation from scratch
makeOperation('query', createRequest(query, variables), client.createOperationContext(opts));

// Turn an operation into a 'teardown' operation
makeOperation('teardown', operation);

// Copy an existing operation while modifying its context
makeOperation(operation.kind, operation, {
  ...operation.context,
  preferGetMethod: true,
});
```

### makeResult

This is a helper function that converts a GraphQL API result to an
[`OperationResult`](#operationresult).

It accepts an [`Operation`](#operation), the API result, and optionally the original `FetchResponse`
for debugging as arguments, in that order.

### makeErrorResult

This is a helper function that creates an [`OperationResult`](#operationresult) for GraphQL API
requests that failed with a generic or network error.

It accepts an [`Operation`](#operation), the error, and optionally the original `FetchResponse`
for debugging as arguments, in that order.

### formatDocument

This utility is used by the [`cacheExchange`](#cacheexchange) and by
[Graphcache](../graphcache/README.md) to add `__typename` fields to GraphQL `DocumentNode`s.

### maskTypename

This utility accepts a GraphQL `data` object, like `data` on [`OperationResult`s](#operationresult)
and marks every `__typename` property as non-enumerable.

The [`formatDocument`](#formatdocument) is often used by `urql` automatically and adds `__typename`
fields to all results. However, this means that data often cannot be passed back into variables or
inputs on mutations, which is a common use-case. This utility hides these fields, which can solve
this problem.

It's used by the [`Client`](#client) when the `maskTypename` option is enabled.

### defaultExchanges

This is an array of the default `Exchange`s that the `Client` uses when the `exchanges` option isn't
passed.

```js
const defaultExchanges = [dedupExchange, cacheExchange, fetchExchange];
```

### composeExchanges

This utility accepts an array of `Exchange`s and composes them into a single one.
It chains them in the order that they're given, left to right.

```js
function composeExchanges(Exchange[]): Exchange;
```

This can be used to combine some exchanges and is also used by [`Client`](#client)
to handle the `exchanges` input.

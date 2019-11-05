<div align="center">
  <img width="540" alt="urql" src="https://raw.githubusercontent.com/FormidableLabs/urql/master/docs/urql-banner.gif" />

  <br />
  <br />

  <strong>
    A highly customisable and versatile GraphQL client for React
  </strong>

  <br />
  <br />
  <a href="https://npmjs.com/package/urql">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/urql.svg" />
  </a>
  <a href="https://github.com/FormidableLabs/urql/actions">
    <img alt="Test Status" src="https://github.com/FormidableLabs/urql/workflows/CI/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/FormidableLabs/urql">
    <img alt="Test Coverage" src="https://codecov.io/gh/FormidableLabs/urql/branch/master/graph/badge.svg" />
  </a>
  <a href="https://bundlephobia.com/result?p=urql">
    <img alt="Minified gzip size" src="https://img.shields.io/bundlephobia/minzip/urql.svg?label=gzip%20size" />
  </a>
  <a href="https://github.com/FormidableLabs/urql#maintenance-status">
    <img alt="Maintenance Status" src="https://img.shields.io/badge/maintenance-active-green.svg" />
  </a>
  <a href="https://spectrum.chat/urql">
    <img alt="Spectrum badge" src="https://withspectrum.github.io/badge/badge.svg" />
  </a>

  <br />
  <br />
</div>

## ✨ Features

- 📦 **One package** to get a working GraphQL client in React
- ⚙️ Fully **customisable** behaviour [via "exchanges"](#-add-on-exchanges)
- 🗂 Logical but simple default behaviour and document caching
- ⚛️ Minimal React components and hooks

`urql` is a GraphQL client that exposes a set of React components and hooks. It's built to be highly customisable and versatile so you can take it from getting started with your first GraphQL project all the way to building complex apps and experimenting with GraphQL clients.

While GraphQL is an elegant protocol and schema language, client libraries today typically come with large API footprints. We aim to create something more lightweight instead.

Some of the available exchanges that extend `urql` are listed below in the ["Add on Exchanges" list](https://github.com/FormidableLabs/urql#-add-on-exchanges) including a normalized cache and a Chrome devtools extension.

## 📃 [Documentation](https://formidable.com/open-source/urql/docs)

[The documentation contains everything you need to know about `urql`](https://formidable.com/open-source/urql/docs)

- [Getting Started guide](https://formidable.com/open-source/urql/docs/getting-started/)
- [Architecture](https://formidable.com/open-source/urql/docs/architecture/)
- [Basics](https://formidable.com/open-source/urql/docs/basics/)
- [Extending & Experimenting](https://formidable.com/open-source/urql/docs/extending-&-experimenting/)
- [API](https://formidable.com/open-source/urql/docs/api/)
- [Guides](./docs/guides.md)

_You can find the raw markdown files inside this repository's `docs` folder._

## 🏎️ Intro & Showcase

### Installation

```sh
yarn add urql graphql
# or
npm install --save urql graphql
```

### Queries

There are three hooks, one for each possible GraphQL operation.

The [`useQuery` hook](https://formidable.com/open-source/urql/docs/api/#usequery-hook) is
used to send GraphQL queries and will provide GraphQL results from your API.

When you're using `useQuery` it'll accept a configuration object that may contain a `query` and `variables`.
The `query` can either be your GraphQL query as a string or as a `DocumentNode`, which may be
parsed using [`graphql-tag`](https://github.com/apollographql/graphql-tag) for instance.

```js
import { useQuery } from 'urql';

const YourComponent = () => {
  const [result] = useQuery({
    query: `{ todos { id } }`,
  });

  if (result.error) return 'Oh no!';
  if (result.fetching) return 'Loading...';

  return <List data={result.data.todos} />;
};
```

Internally, `urql` will create a unique `key` for any operation it starts which is a hash of `query` and
`variables`. The internal "Exchange pipeline" is then responsible for fulfilling the operation.

<img width="606" src="docs/urql-operation-keys.png" />

The result's error is a [`CombinedError`](https://formidable.com/open-source/urql/docs/api/#combinederror-class), which
normalises GraphQL errors and Network errors by combining them into one wrapping class.

<img width="693" src="docs/urql-combined-error.png" />

[Learn more about `useQuery` in the Getting Started guide](https://formidable.com/open-source/urql/docs/getting-started/#writing-queries)

### Mutations

The [`useMutation` hook](https://formidable.com/open-source/urql/docs/api/#usemutation-hook) is very similar to the `useQuery` hook,
but instead of sending queries it sends mutations whenever the `executeMutation` method is called with the variables for the mutation.

```js
import { useMutation } from 'urql';

const YourComponent = () => {
  const [result, executeMutation] = useMutation(
    `mutation AddTodo($text: String!) { addTodo(text: $text) { id } }`
  );

  const add = () =>
    executeMutation({ text: 'New todo!' }).then(result => {
      /* ... */
    });

  return <button onClick={add}>Go!</button>;
};
```

The `useMutation` hook provides a result, just like `useQuery` does, but it doesn't execute the mutation automatically.
Instead it starts once the `executeMutation` function is called with some variables. This also returns a promise that
resolves to the result as well.

[Learn more about `useMutation` in the Getting Started guide](https://formidable.com/open-source/urql/docs/getting-started/#writing-mutations)

### Pausing and Request Policies

The `useQuery` hook and `useMutation` hook differ by when their operations execute by default.
Mutations will only execute once the `executeMutation` method is called with some variables.
The `useQuery` hook can actually be used similarly. The hook also provides an `executeQuery`
function that can be called imperatively to change what query the hook is running.

Unlike the `useMutation` hook, the `useQuery`'s `executeQuery` function actually accepts more than just variables.
Instead it accepts a full object of all of `useQuery`'s normal options, so it can be used to change the entire query, variables, or
other options that the hook uses to run the query.

Instead of running the `useQuery` operation eagerly you may also pass `pause: true`, which causes the
hook not to run your query automatically until `pause` becomes `false` or until `executeQuery` is called
manually.

Apart from `pause` you may also pass a `requestPolicy` option that changes how the cache treats your data.
By default this option will be set to `"cache-first"` which will give you cached data when it's available,
but it can also be set to `"network-only"` which skips the cache entirely and refetches. Another option is
`"cache-and-network"` which may give you cached data but then refetches in the background.

```js
const [result, executeQuery] = useQuery({
  query: '{ todos { text } }',
  variables: {},
  pause: false, // pass true to pause
  requestPolicy: 'cache-and-network',
});

// this will tell you whether something is fetching in the background
result.stale; // true
```

Therefore to [refetch data for your `useQuery` hook](https://formidable.com/open-source/urql/docs/getting-started/#refetching-data),
you can call `executeQuery` with the `network-only` request policy.

```js
const [result, executeQuery] = useQuery({
  query: '{ todos { text } }',
});

const refetch = () => executeQuery({ requestPolicy: 'network-only' });
```

### Client and Exchanges

In `urql` all operations are controlled by a central [`Client`](https://formidable.com/open-source/urql/docs/api/#client-class).
This client is responsible for managing GraphQL operations and sending requests.

<img width="787" src="docs/urql-client-architecture.png" />

Any hook in `urql` will send an operation to the client and the client will eventually respond with a result.

<img width="709" src="docs/urql-event-hub.png" />

Hence the client can be seen as an event hub. Operations are sent to the client, which executes them and
sends back a result. A special teardown-event is issued when a hook unmounts or updates to a different
operation.

<img width="700" src="docs/urql-signals.png" />

The exchanges are separate middleware extensions that determine how operations flow through the client
and how they're fulfilled. All functionality in `urql` can be customised by changing the client's exchanges
or by writing a custom one.

By default there are three exchanges. The `dedupExchange` deduplicates operations with the same key, the
cache exchange handles caching and has a "document" strategy by default, and the `fetchExchange` is typically
the last exchange and sends operations to a GraphQL API.

There are also other exchanges, both built into `urql` and as separate packages, that can be used to add
more functionality, like the `subscriptionExchange` for instance.

<img width="634" src="docs/urql-exchanges.png" />

### Document Caching

The default cache in `urql` works like a document or page cache, for example like a browser would cache pages.
With this default `cacheExchange` results are cached by the operation key that requested them. This means that
each unique operation can have exactly one cached result.

These results are aggressively invalidated. Whenever you send a mutation, each result that contains `__typename`s
that also occur in the mutation result is invalidated.

<img width="736" src="docs/urql-document-caching.png" />

### Normalized Caching

You can opt into having a fully normalized cache by using the [`@urql/exchange-graphcache`](https://github.com/FormidableLabs/urql-exchange-graphcache)
package. The normalized cache is a cache that stores every separate entity in a big graph. Therefore multiple separate queries, subscriptions, and mutations
can update each other, if they contain overlapping data with the same type and ID.

<img width="466" src="docs/urql-normalized-cache.png" />

Getting started with Graphcache is easy and is as simple as installing it and adding it to your client.
Afterwards it comes with a lot of ways to configure it so that less requests need to be sent to your API.
For instance, you can set up mutations to update unrelated queries in your cache or have optimistic updates.

```js
import { createClient, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

const client = createClient({
  url: 'http://localhost:1234/graphql',
  exchanges: [
    dedupExchange,
    // Replace the default cacheExchange with the new one
    cacheExchange({
      /* config */
    }),
    fetchExchange,
  ],
});
```

`urql`'s normalized cache is a little different than ones that you may find in other GraphQL client libraries.
It focuses on doing the right thing and being intuitive whenever possible, hence it has a lot of warnings that
may be logged during development that tell you what may be going wrong at any given point in time.

It also supports "schema awareness". By adding introspected schema data it becomes able to deliver safe, partial
GraphQL results entirely from cache and to match fragments to interfaces deterministically.

[Read more about _Graphcache_ on its repository!](https://github.com/FormidableLabs/urql-exchange-graphcache)

## 📦 Add on Exchanges

`urql` can be extended by adding "Exchanges" to it, [which you can read
more about in our docs](https://formidable.com/open-source/urql/docs/architecture/#exchanges)! Here's just a couple of them.

- [`@urql/devtools`](https://github.com/FormidableLabs/urql-devtools): A Chrome extension for monitoring and debugging
- [`@urql/exchange-graphcache`](https://github.com/FormidableLabs/urql-exchange-graphcache): A full normalized cache implementation (beta)
- [`@urql/exchange-suspense`](https://github.com/FormidableLabs/urql-exchange-suspense): An experimental exchange for using `<React.Suspense>`
- [`urql-persisted-queries`](https://github.com/Daniel15/urql-persisted-queries): An exchange for adding persisted query support

[You can find the full list of exchanges in the docs.](./docs/exchanges.md)

## 💡 Examples

There are currently three examples included in this repository:

- [Getting Started: A basic app with queries and mutations](examples/1-getting-started/)
- [Using Subscriptions: An app that demos subscriptions](examples/2-using-subscriptions/)
- [SSR with Next: A Next.js app showing server-side-rendering support](examples/3-ssr-with-nextjs/)

## Maintenance Status

**Active:** Formidable is actively working on this project, and we expect to continue for work for the foreseeable future. Bug reports, feature requests and pull requests are welcome.

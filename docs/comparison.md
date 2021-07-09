---
title: Comparison
order: 8
---

# Comparison

> This comparison page aims to be detailed, unbiased, and up-to-date. If you see any information that
> may be inaccurate or could be improved otherwise, please feel free to suggest changes.

The most common question that you may encounter with GraphQL is what client to choose when you are
getting started. We aim to provide an unbiased and detailed comparison of several options on this
page, so that you can make an **informed decision**.

All options come with several drawbacks and advantages, and all of these clients have been around
for a while now. A little known fact is that `urql` in its current form and architecture has already
existed since February 2019, and its normalized cache has been around since September 2019.

Overall, we would recommend to make your decision based on whether your required features are
supported, which patterns you'll use (or restrictions thereof), and you may want to look into
whether all the parts and features you're interested in are well maintained.

## Comparison by Features

This section is a list of commonly used features of a GraphQL client and how it's either supported
or not by our listed alternatives. We're using Relay and Apollo to compare against as the other most
common choices of GraphQL clients.

All features are marked to indicate the following:

- ✅ Supported 1st-class and documented.
- 🔶 Supported and documented, but requires custom user-code to implement.
- 🟡 Supported, but as an unofficial 3rd-party library. (Provided it's commonly used)
- 🛑 Not officially supported or documented.

### Core Features

|                                            | urql                                | Apollo                                        | Relay                          |
| ------------------------------------------ | ----------------------------------- | --------------------------------------------- | ------------------------------ |
| Extensible on a network level              | ✅ Exchanges                        | ✅ Links                                      | ✅ Network Layers              |
| Extensible on a cache / control flow level | ✅ Exchanges                        | 🛑                                            | 🛑                             |
| Base Bundle Size                           | **5.9kB** (7.1kB with bindings)     | 32.9kB                                        | 27.7kB (34.1kB with bindings)  |
| Devtools                                   | ✅                                  | ✅                                            | ✅                             |
| Subscriptions                              | ✅                                  | ✅                                            | ✅                             |
| Client-side Rehydration                    | ✅                                  | ✅                                            | ✅                             |
| Polled Queries                             | 🛑                                  | ✅                                            | ✅                             |
| Lazy Queries                               | ✅                                  | ✅                                            | ✅                             |
| Stale while Revalidate / Cache and Network | ✅                                  | ✅                                            | ✅                             |
| Focus Refetching                           | ✅ `@urql/exchange-refocus`         | 🛑                                            | 🛑                             |
| Stale Time Configuration                   | ✅ `@urql/exchange-request-policy`  | ✅                                            | 🛑                             |
| Persisted Queries                          | ✅ `@urql/exchange-persisted-fetch` | ✅ `apollo-link-persisted-queries`            | ✅                             |
| Batched Queries                            | 🛑                                  | ✅ `apollo-link-batch-http`                   | 🟡 `react-relay-network-layer` |
| Live Queries                               | 🛑                                  | 🛑                                            | ✅                             |
| Defer & Stream Directives                  | 🛑                                  | 🛑                                            | ✅                             |
| Switching to `GET` method                  | ✅                                  | ✅                                            | 🟡 `react-relay-network-layer` |
| File Uploads                               | ✅ `@urql/exchange-multipart-fetch` | 🟡 `apollo-upload-client`                     | 🛑                             |
| Retrying Failed Queries                    | ✅ `@urql/exchange-retry`           | ✅ `apollo-link-retry`                        | ✅ `DefaultNetworkLayer`       |
| Easy Authentication Flows                  | ✅ `@urql/exchange-auth`            | 🛑 (no docs for refresh-based authentication) | 🟡 `react-relay-network-layer` |
| Automatic Refetch after Mutation           | ✅ (with document cache)            | 🛑                                            | ✅                             |

Typically these are all additional addon features that you may expect from a GraphQL client, no
matter which framework you use it with. It's worth mentioning that all three clients support some
kind of extensibility API, which allows you to change when and how queries are sent to an API. These
are easy to use primitives particularly in Apollo, with links, and in `urql` with exchanges. The
major difference in `urql` is that all caching logic is abstracted in exchanges too, which makes
it easy to swap the caching logic or other behavior out (and hence makes `urql` slightly more
customizable.)

A lot of the added exchanges for persisted queries, file uploads, retrying, and other features are
implemented by the urql-team, while there are some cases where first-party support isn't provided
in Relay or Apollo. This doesn't mean that these features can't be used with these clients, but that
you'd have to lean on community libraries or maintaining/implementing them yourself.

One thing of note is our lack of support for batched queries in `urql`. We explicitly decided not to
support this in our [first-party
packages](https://github.com/FormidableLabs/urql/issues/800#issuecomment-626342821) as the benefits
are not present anymore in most cases with HTTP/2 and established patterns by Relay that recommend
hoisting all necessary data requirements to a page-wide query.

### Framework Bindings

|                                | urql           | Apollo              | Relay              |
| ------------------------------ | -------------- | ------------------- | ------------------ |
| React Bindings                 | ✅             | ✅                  | ✅                 |
| React Concurrent Hooks Support | ✅             | 🛑                  | ✅ (experimental)  |
| React Legacy Hooks Support     | ✅             | ✅                  | 🟡 `relay-hooks`   |
| React Suspense (Experimental)  | ✅             | 🛑                  | ✅                 |
| Next.js Integration            | ✅ `next-urql` | 🟡                  | 🔶                 |
| Preact Support                 | ✅             | 🔶                  | 🔶                 |
| Svelte Bindings                | ✅             | 🟡 `svelte-apollo`  | 🟡 `svelte-relay`  |
| Vue Bindings                   | ✅             | 🟡 `vue-apollo`     | 🟡 `vue-relay`     |
| Angular Bindings               | 🛑             | 🟡 `apollo-angular` | 🟡 `relay-angular` |
| Initial Data on mount          | ✅             | ✅                  | ✅                 |

Interestingly all three libraries heavily support React as they were all started from the React
community outwards, but Apollo and Vue benefit from community bindings for different frameworks a
lot. `urql`'s community is still growing and while that means it won't see large projects as
Apollo's `vue-apollo` in the short term, we're aiming for first-party support for these bindings.

This is a common criticism that we hear about `urql`, and it's true that our community isn't as
extensive, but we attempt to lean on good and well funded maintenance at Formidable, active
investment, and good documentation. So you may have to evaluate whether you can get any questions
answered quickly enough on [GitHub Discussions](https://github.com/FormidableLabs/urql/discussions)
for instance.

### Caching and State

|                                                         | urql                                                                  | Apollo                    | Relay                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------- | ---------------------------------------------- |
| Caching Strategy                                        | Document Caching, Normalized Caching with `@urql/exchange-graphcache` | Normalized Caching        | Normalized Caching (schema restrictions apply) |
| Added Bundle Size                                       | +6.5kB (with Graphcache)                                              | +0 (default)              | +0 (default)                                   |
| Automatic Garbage Collection                            | ✅                                                                    | 🔶                        | ✅                                             |
| Local State Management                                  | 🛑                                                                    | ✅                        | ✅                                             |
| Pagination Support                                      | 🔶                                                                    | 🔶                        | ✅                                             |
| Optimistic Updates                                      | ✅                                                                    | ✅                        | ✅                                             |
| Local Updates                                           | ✅                                                                    | ✅                        | ✅                                             |
| Out-of-band Cache Updates                               | 🛑 (stays true to server data)                                        | ✅                        | ✅                                             |
| Local Resolvers and Redirects                           | ✅                                                                    | ✅                        | 🛑 (not needed)                                |
| Complex Resolvers (nested non-normalized return values) | ✅                                                                    | 🛑                        | 🛑 (not needed)                                |
| Commutativity Guarantees                                | ✅                                                                    | 🛑                        | ✅                                             |
| Partial Results                                         | ✅                                                                    | ✅                        | 🛑                                             |
| Safe Partial Results (schema-based)                     | ✅                                                                    | 🛑                        | 🛑                                             |
| Persistence Support                                     | ✅                                                                    | ✅ `apollo-cache-persist` | 🟡 `@wora/relay-store`                         |
| Offline Support                                         | ✅                                                                    | 🛑                        | 🟡 `@wora/relay-offline`                       |

`urql` is the only of the three clients that doesn't pick [normalized
caching](./graphcache/normalized-caching.md) as its default caching strategy. Typically this is seen
by users as easier and quicker to get started with. All entries in this table for `urql` typically
refer to the optional `@urql/exchange-graphcache` package.

Once you need the same features that you'll find in Relay and Apollo, it's possible to migrate to
Graphcache. Graphcache is also slightly different from Apollo's cache and more opinionated as it
doesn't allow arbitrary cache updates to be made.

`urql` is also the only library that provides [Offline Support](./graphcache/offline.md) out of the
box as part of Graphcache's feature set. There are a number of options for Apollo and Relay including
writing your own logic for offline caching, which can be particularly successful in Relay, but for
`@urql/exchange-graphcache` we chose to include it as a feature since it also strengthened other
guarantees that the cache makes.

Relay does in fact have similar guarantees as [`urql`'s Commutativity
Guarantees](./graphcache/under-the-hood.md),
which are more evident when applying list updates out of order under more complex network
conditions.

## About Bundle Size

`urql` is known and often cited as a "lightweight GraphQL client," which is one of its advantages
but not its main goal. It manages to be this small by careful size management, just like other
libraries like Preact.

You may find that adding features like `@urql/exchange-persisted-fetch` and
`@urql/exchange-graphcache` only slightly increases your bundle size as we're aiming to reduce bloat,
but often this comparison is hard to make. When you start comparing bundle sizes of these three
GraphQL clients you should keep in mind that:

- Parts of the `graphql` package tree-shake away and may also be replaced (e.g. `parse`)
- All packages in `urql` reuse parts of `@urql/core` and `wonka`, which means adding all their total
  sizes up doesn't give you a correct result of their total expected bundle size.
- These sizes may change drastically given the code you write and add yourself, but can be managed
  via precompilation (e.g. with `babel-plugin-graphql-tag` or GraphQL Code Generator for Apollo and
  `urql`)

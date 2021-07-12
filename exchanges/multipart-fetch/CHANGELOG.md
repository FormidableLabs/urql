# @urql/exchange-multipart-fetch

## 0.1.13

### Patch Changes

- Bump extract-files package to 11.0.0, by [@haswalt](https://github.com/haswalt) (See [#1795](https://github.com/FormidableLabs/urql/pull/1795))

## 0.1.12

### Patch Changes

- Remove closure-compiler from the build step (See [#1570](https://github.com/FormidableLabs/urql/pull/1570))
- Updated dependencies (See [#1570](https://github.com/FormidableLabs/urql/pull/1570), [#1509](https://github.com/FormidableLabs/urql/pull/1509), [#1600](https://github.com/FormidableLabs/urql/pull/1600), and [#1515](https://github.com/FormidableLabs/urql/pull/1515))
  - @urql/core@2.1.0

## 0.1.11

### Patch Changes

- ⚠️ Fix the production build overwriting the development build. Specifically in the previous release we mistakenly replaced all development bundles with production bundles. This doesn't have any direct influence on how these packages work, but prevented development warnings from being logged or full errors from being thrown, by [@kitten](https://github.com/kitten) (See [#1097](https://github.com/FormidableLabs/urql/pull/1097))
- Updated dependencies (See [#1097](https://github.com/FormidableLabs/urql/pull/1097))
  - @urql/core@1.14.1

## 0.1.10

### Patch Changes

- Deprecate the `Operation.operationName` property in favor of `Operation.kind`. This name was
  previously confusing as `operationName` was effectively referring to two different things. You can
  safely upgrade to this new version, however to mute all deprecation warnings you will have to
  **upgrade** all `urql` packages you use. If you have custom exchanges that spread operations, please
  use [the new `makeOperation` helper
  function](https://formidable.com/open-source/urql/docs/api/core/#makeoperation) instead, by [@bkonkle](https://github.com/bkonkle) (See [#1045](https://github.com/FormidableLabs/urql/pull/1045))
- Updated dependencies (See [#1094](https://github.com/FormidableLabs/urql/pull/1094) and [#1045](https://github.com/FormidableLabs/urql/pull/1045))
  - @urql/core@1.14.0

## 0.1.9

### Patch Changes

- Omit the `Content-Type: application/json` HTTP header when using GET in the `fetchExchange`, `persistedFetchExchange`, or `multipartFetchExchange`, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#957](https://github.com/FormidableLabs/urql/pull/957))
- Updated dependencies (See [#947](https://github.com/FormidableLabs/urql/pull/947), [#962](https://github.com/FormidableLabs/urql/pull/962), and [#957](https://github.com/FormidableLabs/urql/pull/957))
  - @urql/core@1.13.0

## 0.1.8

### Patch Changes

- Upgrade to a minimum version of wonka@^4.0.14 to work around issues with React Native's minification builds, which use uglify-es and could lead to broken bundles, by [@kitten](https://github.com/kitten) (See [#842](https://github.com/FormidableLabs/urql/pull/842))
- Updated dependencies (See [#838](https://github.com/FormidableLabs/urql/pull/838) and [#842](https://github.com/FormidableLabs/urql/pull/842))
  - @urql/core@1.12.0

## 0.1.7

### Patch Changes

- Add `source` debug name to all `dispatchDebug` calls during build time to identify events by which exchange dispatched them, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#780](https://github.com/FormidableLabs/urql/pull/780))
- Updated dependencies (See [#780](https://github.com/FormidableLabs/urql/pull/780))
  - @urql/core@1.11.7

## 0.1.6

### Patch Changes

- Add a `"./package.json"` entry to the `package.json`'s `"exports"` field for Node 14. This seems to be required by packages like `rollup-plugin-svelte` to function properly, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#771](https://github.com/FormidableLabs/urql/pull/771))
- Updated dependencies (See [#771](https://github.com/FormidableLabs/urql/pull/771))
  - @urql/core@1.11.6

## 0.1.5

### Patch Changes

- Add debugging events to exchanges that add more detailed information on what is happening
  internally, which will be displayed by devtools like the urql [Chrome / Firefox extension](https://github.com/FormidableLabs/urql-devtools), by [@andyrichardson](https://github.com/andyrichardson) (See [#608](https://github.com/FormidableLabs/urql/pull/608))
- Add @urql/core/internal entrypoint for internally shared utilities and start sharing fetchExchange-related code, by [@kitten](https://github.com/kitten) (See [#722](https://github.com/FormidableLabs/urql/pull/722))
- Updated dependencies (See [#608](https://github.com/FormidableLabs/urql/pull/608), [#718](https://github.com/FormidableLabs/urql/pull/718), and [#722](https://github.com/FormidableLabs/urql/pull/722))
  - @urql/core@1.11.0

## 0.1.4

### Patch Changes

- Add graphql@^15.0.0 to peer dependency range, by [@kitten](https://github.com/kitten) (See [#688](https://github.com/FormidableLabs/urql/pull/688))
- Bump extract-files to ^8.1.0, by [@kitten](https://github.com/kitten) (See [#688](https://github.com/FormidableLabs/urql/pull/688))
- ⚠️ Fix non-2xx results never being parsed as GraphQL results. This can result in valid GraphQLErrors being hidden, which should take precedence over generic HTTP NetworkErrors, by [@kitten](https://github.com/kitten) (See [#678](https://github.com/FormidableLabs/urql/pull/678))
- Updated dependencies (See [#688](https://github.com/FormidableLabs/urql/pull/688) and [#678](https://github.com/FormidableLabs/urql/pull/678))
  - @urql/core@1.10.8

## 0.1.3

### Patch Changes

- ⚠️ Fix node resolution when using Webpack, which experiences a bug where it only resolves
  `package.json:main` instead of `module` when an `.mjs` file imports a package, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#642](https://github.com/FormidableLabs/urql/pull/642))
- Updated dependencies (See [#642](https://github.com/FormidableLabs/urql/pull/642))
  - @urql/core@1.10.4

## 0.1.2

### Patch Changes

- ⚠️ Fix multipart conversion, in the `extract-files` dependency (used by multipart-fetch) there is an explicit check for the constructor property of an object. This made the files unretrievable, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#639](https://github.com/FormidableLabs/urql/pull/639))
- ⚠️ Fix Node.js Module support for v13 (experimental-modules) and v14. If your bundler doesn't support
  `.mjs` files and fails to resolve the new version, please double check your configuration for
  Webpack, or similar tools, by [@JoviDeCroock](https://github.com/JoviDeCroock) (See [#637](https://github.com/FormidableLabs/urql/pull/637))
- Updated dependencies (See [#637](https://github.com/FormidableLabs/urql/pull/637))
  - @urql/core@1.10.3

## 0.1.1

### Patch Changes

- ⚠️ Fix Rollup bundle output being written to .es.js instead of .esm.js, by [@kitten](https://github.com/kitten) (See [#609](https://github.com/FormidableLabs/urql/pull/609))
- Updated dependencies (See [#609](https://github.com/FormidableLabs/urql/pull/609))
  - @urql/core@1.10.1

## 0.1.0

### Initial release

- Release the `multipartFetchExchange`

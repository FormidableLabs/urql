# Changelog

## 0.1.4

### Patch Changes

- Allow `mutate` to infer the result's type when a `TypedDocumentNode` is passed via the usual generics, like `client.mutation` for instance, by [@younesmln](https://github.com/younesmln) (See [#1796](https://github.com/FormidableLabs/urql/pull/1796))

## 0.1.3

### Patch Changes

- Remove closure-compiler from the build step (See [#1570](https://github.com/FormidableLabs/urql/pull/1570))
- Updated dependencies (See [#1570](https://github.com/FormidableLabs/urql/pull/1570), [#1509](https://github.com/FormidableLabs/urql/pull/1509), [#1600](https://github.com/FormidableLabs/urql/pull/1600), and [#1515](https://github.com/FormidableLabs/urql/pull/1515))
  - @urql/core@2.1.0

## 0.1.2

### Patch Changes

- Deprecate the `Operation.operationName` property in favor of `Operation.kind`. This name was
  previously confusing as `operationName` was effectively referring to two different things. You can
  safely upgrade to this new version, however to mute all deprecation warnings you will have to
  **upgrade** all `urql` packages you use. If you have custom exchanges that spread operations, please
  use [the new `makeOperation` helper
  function](https://formidable.com/open-source/urql/docs/api/core/#makeoperation) instead, by [@bkonkle](https://github.com/bkonkle) (See [#1045](https://github.com/FormidableLabs/urql/pull/1045))
- Updated dependencies (See [#1094](https://github.com/FormidableLabs/urql/pull/1094) and [#1045](https://github.com/FormidableLabs/urql/pull/1045))
  - @urql/core@1.14.0

## 0.1.1

### Patch Changes

- ⚠️ Fix an operation that triggers `willAuthError` with a truthy return value being sent off twice, by [@kitten](https://github.com/kitten) (See [#1075](https://github.com/FormidableLabs/urql/pull/1075))

## v0.1.0

**Initial Release**

import { makeSubject, map, pipe, publish, Source, Subject } from 'wonka';
import { Client } from '../client';
import { queryOperation, queryResponse } from '../test-utils';
import { Operation } from '../types';
import { debugExchange } from './debug';

let exchangeArgs;
let forwardedOperations: Operation[];
let input: Subject<Operation>;

beforeEach(() => {
  forwardedOperations = [];
  input = makeSubject<Operation>();

  // Collect all forwarded operations
  const forward = (s: Source<Operation>) => {
    return pipe(
      s,
      map(op => {
        forwardedOperations.push(op);
        return queryResponse;
      })
    );
  };

  exchangeArgs = { forward, subject: {} as Client };
});

it('forwards query operations correctly', async () => {
  jest.spyOn(global.console, 'log').mockImplementation();
  const { source: ops$, next, complete } = input;
  const exchange = debugExchange({})(exchangeArgs)(ops$);

  publish(exchange);
  next(queryOperation);
  complete();
  // eslint-disable-next-line no-console
  expect(console.log).toBeCalled();
  // eslint-disable-next-line no-console
  expect(console.log).toBeCalledTimes(2);
});

it('calls custom functions when supplied', async () => {
  jest.spyOn(global.console, 'log').mockImplementation();
  const onIncoming = jest.fn();
  const onCompleted = jest.fn();
  const { source: ops$, next, complete } = input;
  const exchange = debugExchange({ onIncoming, onCompleted })(exchangeArgs)(
    ops$
  );

  publish(exchange);
  next(queryOperation);
  complete();
  // eslint-disable-next-line no-console
  expect(console.log).not.toBeCalled();
  expect(onIncoming).toHaveBeenCalledTimes(1);
  expect(onCompleted).toHaveBeenCalledTimes(1);
});

describe('production', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  it('is a noop in production', () => {
    const { source: ops$ } = input;

    debugExchange({})({
      forward: ops => {
        expect(ops).toBe(ops$);
      },
    } as any)(ops$);
  });
});

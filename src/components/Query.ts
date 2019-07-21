import { ReactElement } from 'react';
import { OperationContext } from '../types';
import { useQuery, UseQueryArgs, UseQueryState } from '../hooks';

export interface QueryProps<T, V> extends UseQueryArgs<V> {
  children: (arg: QueryState<T>) => ReactElement<any>;
}

export interface QueryState<T> extends UseQueryState<T> {
  executeQuery: (opts?: Partial<OperationContext>) => void;
}

export function Query<T = any, V = any>({
  children,
  ...args
}: QueryProps<T, V>): ReactElement<any> {
  const [state, executeQuery] = useQuery<T, V>(args);
  return children({ ...state, executeQuery });
}

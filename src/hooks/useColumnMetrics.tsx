import type { Context } from 'react';
import { createContext, useContext } from 'react';
import type { CalculatedColumn } from '../types';

interface ColumnMetric {
  width: number;
  left: number;
}

const ColumnMetricsContext = createContext<ReadonlyMap<unknown, ColumnMetric> | undefined>(
  undefined
);

export function ColumnMetricsProvider<R, SR>({
  children,
  value
}: {
  children: React.ReactChild;
  value: ReadonlyMap<CalculatedColumn<R, SR>, ColumnMetric>;
}) {
  return <ColumnMetricsContext.Provider value={value}>{children}</ColumnMetricsContext.Provider>;
}

export function useColumnMetrics<R, SR>() {
  const columnMetricsContext = useContext(
    ColumnMetricsContext as unknown as Context<
      ReadonlyMap<CalculatedColumn<R, SR>, ColumnMetric> | undefined
    >
  );

  if (columnMetricsContext === undefined) {
    throw new Error('useColumnMetrics must be used within DataGrid header');
  }

  return columnMetricsContext;
}

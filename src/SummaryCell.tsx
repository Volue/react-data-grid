import { memo } from 'react';

import { getCellStyle, getCellClassname } from './utils';
import type { Position, CellRendererProps } from './types';
import { useRovingCellRef } from './hooks';

interface SharedCellRendererProps<R, SR>
  extends Pick<CellRendererProps<R, SR>, 'column' | 'colSpan' | 'isCellSelected' | 'rowIdx'> {
  selectCell: (position: Position) => void;
}

interface SummaryCellProps<R, SR> extends SharedCellRendererProps<R, SR> {
  row: SR;
}

function SummaryCell<R, SR>({
  column,
  colSpan,
  row,
  rowIdx,
  isCellSelected,
  selectCell
}: SummaryCellProps<R, SR>) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected);
  const { summaryFormatter: SummaryFormatter, summaryCellClass } = column;
  const className = getCellClassname(
    column,
    typeof summaryCellClass === 'function' ? summaryCellClass(row) : summaryCellClass
  );

  function onClick() {
    selectCell({ rowIdx, idx: column.idx });
  }

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1}
      aria-colspan={colSpan}
      aria-selected={isCellSelected}
      ref={ref}
      tabIndex={tabIndex}
      className={className}
      style={getCellStyle(column, colSpan)}
      onClick={onClick}
      onFocus={onFocus}
    >
      {SummaryFormatter && (
        <SummaryFormatter column={column} row={row} isCellSelected={isCellSelected} />
      )}
    </div>
  );
}

export default memo(SummaryCell) as <R, SR>(props: SummaryCellProps<R, SR>) => JSX.Element;

import { memo, forwardRef } from 'react';
import type { RefAttributes, CSSProperties } from 'react';
import clsx from 'clsx';

import Cell from './Cell';
import { RowSelectionProvider, useLatestFunc, useCombinedRefs, useRovingRowRef } from './hooks';
import { getColSpan } from './utils';
import { rowClassname } from './style';
import type { RowRendererProps } from './types';

function Row<R, SR>(
  {
    className,
    rowIdx,
    selectedCellIdx,
    isRowSelected,
    copiedCellIdx,
    draggedOverCellIdx,
    lastFrozenColumnIndex,
    row,
    viewportColumns,
    selectedCellEditor,
    selectedCellDragHandle,
    onRowClick,
    onRowDoubleClick,
    rowClass,
    setDraggedOverCellIdx,
    top,
    height,
    onRowChange,
    selectCell,
    ...props
  }: RowRendererProps<R, SR>,
  ref: React.Ref<HTMLDivElement>
) {
  const { ref: rowRef, tabIndex, className: rovingClassName } = useRovingRowRef(selectedCellIdx);

  const handleRowChange = useLatestFunc((newRow: R) => {
    onRowChange(rowIdx, newRow);
  });


  className = clsx(
    rowClassname,
    `rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`,
    rovingClassName,
    rowClass?.(row),
    className
  );

  const cells = [];

  for (let index = 0; index < viewportColumns.length; index++) {
    const column = viewportColumns[index];
    const { idx, areCellsDraggable } = column;
    const colSpan = getColSpan(column, lastFrozenColumnIndex, { type: 'ROW', row });
    if (colSpan !== undefined) {
      index += colSpan - 1;
    }

    const isCellSelected = selectedCellIdx === idx;

    let isDraggedOver;
    if (draggedOverCellIdx != null && selectedCellIdx != null) {
      const isDraggedOverRight = selectedCellIdx < draggedOverCellIdx;

      isDraggedOver = isDraggedOverRight ? selectedCellIdx < idx && idx <= draggedOverCellIdx
        : selectedCellIdx > idx && idx >= draggedOverCellIdx;
    } else {
      isDraggedOver = false;
    }

    if (isCellSelected && selectedCellEditor) {
      cells.push(selectedCellEditor);
    } else {
      cells.push(
        <Cell
          key={column.key}
          column={column}
          colSpan={colSpan}
          row={row}
          isCopied={copiedCellIdx === idx}
          setDraggedOverCellIdx={areCellsDraggable ? setDraggedOverCellIdx : undefined}
          isDraggedOver={isDraggedOver}
          isCellSelected={isCellSelected}
          dragHandle={areCellsDraggable && isCellSelected ? selectedCellDragHandle : undefined}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          onRowChange={handleRowChange}
          selectCell={selectCell}
        />
      );
    }
  }

  return (
    <RowSelectionProvider value={isRowSelected}>
      <div
        role="row"
        ref={useCombinedRefs(ref, rowRef)}
        tabIndex={tabIndex}
        className={className}
        style={
          {
            top,
            '--row-height': `${height}px`
          } as unknown as CSSProperties
        }
        {...props}
      >
        {cells}
      </div>
    </RowSelectionProvider>
  );
}

export default memo(Row) as <R, SR>(props: RowRendererProps<R, SR>) => JSX.Element;

export const RowWithRef = memo(forwardRef(Row)) as <R, SR>(
  props: RowRendererProps<R, SR> & RefAttributes<HTMLDivElement>
) => JSX.Element;

import { css } from '@linaria/core';

import type { CalculatedColumn, FillEvent, Position } from './types';
import type { DataGridProps, SelectCellState } from './DataGrid';

const cellDragHandle = css`
  cursor: move;
  position: absolute;
  right: 0;
  bottom: 0;
  width: 8px;
  height: 8px;
  background-color: var(--selection-color);

  &:hover {
    width: 16px;
    height: 16px;
    border: 2px solid var(--selection-color);
    background-color: var(--background-color);
  }
`;

const cellDragHandleClassname = `rdg-cell-drag-handle ${cellDragHandle}`;

interface Props<R, SR> extends Pick<DataGridProps<R, SR>, 'rows' | 'onRowsChange'> {
  columns: readonly CalculatedColumn<R, SR>[];
  selectedPosition: SelectCellState;
  latestDraggedOverCellIdx: React.MutableRefObject<number | undefined>;
  isCellEditable: (position: Position) => boolean;
  onFill: (event: FillEvent<R>) => R;
  setDragging: (isDragging: boolean) => void;
  setDraggedOverCellIdx: (overCellIdx: number | undefined) => void;
}

export default function DragHandle<R, SR>({
  rows,
  columns,
  selectedPosition,
  latestDraggedOverCellIdx,
  isCellEditable,
  onRowsChange,
  onFill,
  setDragging,
  setDraggedOverCellIdx
}: Props<R, SR>) {
  function handleMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.buttons !== 1) return;
    setDragging(true);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseup', onMouseUp);

    function onMouseOver(event: MouseEvent) {
      // Trigger onMouseup in edge cases where we release the mouse button but `mouseup` isn't triggered,
      // for example when releasing the mouse button outside the iframe the grid is rendered in.
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
      if (event.buttons !== 1) onMouseUp();
    }

    function onMouseUp() {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
      handleDragEnd();
    }
  }

  function handleDragEnd() {
    const overCellIdx = latestDraggedOverCellIdx.current;
    if (overCellIdx === undefined) return;

    const { idx } = selectedPosition;
    const startCellIndex = idx < overCellIdx ? idx + 1 : overCellIdx;
    const endCellIndex = idx < overCellIdx ? overCellIdx + 1 : idx;
    updateRows(startCellIndex, endCellIndex);
    setDraggedOverCellIdx(undefined);
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    updateRows(selectedPosition.idx + 1, columns.length);
  }

  function updateRows(startCellIdx: number, endCellIdx: number) {
    const { idx, rowIdx } = selectedPosition;
    const row = rows[rowIdx];
    const sourceColumn = columns[idx];
    const columnKeys: string[] = [];
    for (let i = startCellIdx; i < endCellIdx; i++) {
      if (isCellEditable({ rowIdx, idx: i })) {
        columnKeys.push(columns[i].key);
      }
    }

    const updatedRow = onFill({
      row,
      sourceColumnKey: sourceColumn.key,
      targetColumnKeys: columnKeys
    });

    if (updatedRow !== row) {
      onRowsChange?.(updatedRow, { index: rowIdx, columnKeys });
    }
  }

  return (
    <div
      className={cellDragHandleClassname}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    />
  );
}

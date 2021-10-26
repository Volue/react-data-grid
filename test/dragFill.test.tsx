import { StrictMode, useState } from 'react';
import userEvent from '@testing-library/user-event';

import DataGrid from '../src';
import type { Column, FillEvent } from '../src';
import { fireEvent, render } from '@testing-library/react';
import { getCellsAtRowIndex } from './utils';

interface Row {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

const columns: readonly Column<Row>[] = [
  {
    key: 'col1',
    name: 'Col 1',
    areCellsDraggable: true,
    editor() {
      return null;
    }
  },
  {
    key: 'col2',
    name: 'Col 2',
    areCellsDraggable: true,
    editor() {
      return null;
    }
  },
  {
    key: 'col3',
    name: 'Col 3',
    areCellsDraggable: true,
    editor() {
      return null;
    }
  },
  {
    key: 'col4',
    name: 'Col 4',
    areCellsDraggable: true,
    editable: false,
    editor() {
      return null;
    }
  }
];

const initialRows: readonly Row[] = [
  {
    col1: 'a1',
    col2: 'a2',
    col3: 'a3',
    col4: 'a4'
  }
];

function setup(allowDragFill = true) {
  render(
    <StrictMode>
      <DragFillTest allowDragFill={allowDragFill} />
    </StrictMode>
  );
}

function DragFillTest({ allowDragFill = true }: { allowDragFill?: boolean }) {
  const [rows, setRows] = useState(initialRows);

  function onFill({ row, sourceColumnKey, targetColumnKeys }: FillEvent<Row>): Row {
    return targetColumnKeys.reduce(
      (updatedRow, targetColumnKey) => {
        updatedRow[targetColumnKey] = row[sourceColumnKey];
        return updatedRow;
      },
      { ...row }
    );
  }

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={(updatedRow, { index }) => {
        const rowsCopy = [...rows];
        rowsCopy[index] = updatedRow;

        setRows(rowsCopy);
      }}
      onFill={allowDragFill ? onFill : undefined}
    />
  );
}

function getDragHandle() {
  return document.querySelector('.rdg-cell-drag-handle');
}

test('should not allow dragFill if onFill is undefined', () => {
  setup(false);
  userEvent.click(getCellsAtRowIndex(0)[0]);
  expect(getDragHandle()).not.toBeInTheDocument();
});

test('should allow dragFill if onFill is specified', () => {
  setup();
  userEvent.click(getCellsAtRowIndex(0)[0]);
  userEvent.dblClick(getDragHandle()!);
  expect(getCellsAtRowIndex(0)[1]).toHaveTextContent('a1');
  expect(getCellsAtRowIndex(0)[2]).toHaveTextContent('a1');
  expect(getCellsAtRowIndex(0)[3]).toHaveTextContent('a4'); // readonly cell
});

test('should update single cell using mouse', () => {
  setup();
  userEvent.click(getCellsAtRowIndex(0)[0]);
  fireEvent.mouseDown(getDragHandle()!, { buttons: 1 });
  fireEvent.mouseEnter(getCellsAtRowIndex(0)[1]);
  fireEvent.mouseUp(window);
  expect(getCellsAtRowIndex(0)[1]).toHaveTextContent('a1');
  expect(getCellsAtRowIndex(0)[2]).toHaveTextContent('a3');
});

test('should update multiple cells using mouse', () => {
  setup();
  userEvent.click(getCellsAtRowIndex(0)[0]);
  fireEvent.mouseDown(getDragHandle()!, { buttons: 1 });
  fireEvent.mouseEnter(getCellsAtRowIndex(0)[3]);
  fireEvent.mouseUp(window);
  expect(getCellsAtRowIndex(0)[1]).toHaveTextContent('a1');
  expect(getCellsAtRowIndex(0)[2]).toHaveTextContent('a1');
  expect(getCellsAtRowIndex(0)[3]).toHaveTextContent('a4'); // readonly cell
});

test('should allow drag up using mouse', () => {
  setup();
  userEvent.click(getCellsAtRowIndex(0)[3]);
  fireEvent.mouseDown(getDragHandle()!, { buttons: 1 });
  fireEvent.mouseEnter(getCellsAtRowIndex(0)[0]);
  fireEvent.mouseUp(window);
  expect(getCellsAtRowIndex(0)[0]).toHaveTextContent('a4');
  expect(getCellsAtRowIndex(0)[1]).toHaveTextContent('a4');
  expect(getCellsAtRowIndex(0)[2]).toHaveTextContent('a4');
});

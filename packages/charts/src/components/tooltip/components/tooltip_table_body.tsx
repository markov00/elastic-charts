/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ReactNode, useRef } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import { TooltipCellStyle, TooltipTableColumn } from './types';

const getRowId = (i: number) => `table-scroll-to-row-${i}`;

type TooltipTableBodyProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
    pinned?: boolean;
    onSelect?: typeof onTooltipItemSelected | ((...args: Parameters<typeof onTooltipItemSelected>) => void);
    selected: TooltipValue<D, SI>[];
  },
  {},
  {
    className?: string;
  }
>;

/** @public */
export const TooltipTableBody = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TooltipTableBodyProps<D, SI>) => {
  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  if ('children' in props) {
    const classes = classNames('echTooltip__tableBody', className);
    return <tbody className={classes}>{props.children}</tbody>;
  }

  const { items, pinned, selected, onSelect, columns } = props;
  const classes = classNames('echTooltip__tableBody');
  // TODO: find a better way determine this from the data
  const allHighlighted = items.every((i) => i.isHighlighted);

  return (
    <tbody className={classes} ref={tableBodyRef}>
      {items.map((item, i) => {
        const { isHighlighted, isVisible, displayOnly } = item;
        if (!isVisible) return null;
        return (
          <TooltipTableRow
            key={`${item.seriesIdentifier.key}-${item.value}`}
            id={getRowId(i)}
            isHighlighted={!pinned && !allHighlighted && isHighlighted}
            isSelected={pinned && selected.includes(item)}
            onSelect={displayOnly || !onSelect ? undefined : () => onSelect(item)}
          >
            {columns.map((column, j) => {
              return renderCellContent(item, column, column.id ?? `${column.type}-${j}`);
            })}
          </TooltipTableRow>
        );
      })}
    </tbody>
  );
};

function getCellStyles<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  style,
  type,
}: TooltipTableColumn<D, SI>): TooltipCellStyle {
  const textAlign: TooltipCellStyle['textAlign'] = type === 'number' ? 'left' : type === 'text' ? 'right' : undefined;

  return {
    textAlign,
    ...style,
  };
}

function renderCellContent<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  item: TooltipValue<D, SI>,
  column: TooltipTableColumn<D, SI>,
  key: string,
): ReactNode {
  if (column.type === 'color') {
    return <TooltipTableColorCell displayOnly={item.displayOnly} color={item.color} key={key} />;
  }

  return (
    <TooltipTableCell style={getCellStyles(column)} key={key}>
      {column.cell(item)}
    </TooltipTableCell>
  );
}

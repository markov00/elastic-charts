/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { PointerEvent, PointerOverEvent, PointerUpdateTrigger } from '../../../../specs';
import { PointerEventType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getProjectedScaledValues } from './get_projected_scaled_values';

function isSameEventValue(a: PointerOverEvent, b: PointerOverEvent, changeTrigger: PointerUpdateTrigger) {
  const checkX = changeTrigger === PointerUpdateTrigger.X || changeTrigger === PointerUpdateTrigger.Both;
  const checkY = changeTrigger === PointerUpdateTrigger.Y || changeTrigger === PointerUpdateTrigger.Both;
  return (
    (!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
    (!checkY || a.y.every((y, i) => y.value === b.y[i]?.value))
  );
}

const hasPointerEventChanged = (prev: PointerEvent, next: PointerEvent | null, changeTrigger: PointerUpdateTrigger) =>
  next?.type !== prev.type ||
  (prev.type === PointerEventType.Over &&
    next?.type === PointerEventType.Over &&
    !isSameEventValue(prev, next, changeTrigger));

/** @internal */
export function createOnPointerMoveCaller(): (state: GlobalChartState) => void {
  let prevPointerEvent: PointerEvent | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      selector = createCustomCachedSelector(
        [getSettingsSpecSelector, getChartIdSelector, getProjectedScaledValues],
        ({ onPointerUpdate, pointerUpdateTrigger }, chartId, projectedValues): void => {
          if (prevPointerEvent === null) {
            prevPointerEvent = { chartId, type: PointerEventType.Out };
          }
          const tempPrev = { ...prevPointerEvent };
          const nextPointerEvent = projectedValues
            ? { ...projectedValues, chartId, type: PointerEventType.Over }
            : { chartId, type: PointerEventType.Out };
          // we have to update the prevPointerEvents before possibly calling the onPointerUpdate
          // to avoid a recursive loop of calls caused by the impossibility to update the prevPointerEvent
          prevPointerEvent = nextPointerEvent;

          if (onPointerUpdate && hasPointerEventChanged(tempPrev, nextPointerEvent, pointerUpdateTrigger))
            onPointerUpdate(nextPointerEvent);
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}

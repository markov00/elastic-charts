/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isContinuousScale } from '../../../../scales/types';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isPointGeometry } from '../../../../utils/geometry';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { isPointOnGeometry } from '../../rendering/utils';
import { getOrientedXPosition, getOrientedYPosition } from '../../utils/interactions';
import { getPanelSize } from '../../utils/panel';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { getComputedScalesSelector } from './get_computed_scales';
import { getGeometriesIndexSelector } from './get_geometries_index';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;
/** @internal */
export type Layer = [string, PrimitiveValue[], [number, number, number, number]];
/** @internal */
export const getPointerLayers = createCustomCachedSelector(
  [
    getChartContainerDimensionsSelector,
    computeChartDimensionsSelector,
    getCurrentPointerPosition,
    computeSmallMultipleScalesSelector,
    getSettingsSpecSelector,
    getComputedScalesSelector,
    getGeometriesIndexKeysSelector,
    getGeometriesIndexSelector,
  ],
  (
    container,
    { chartDimensions: dims },
    { x, y },
    layout,
    { rotation, pointBuffer },
    { xScale, yScales },
    geometriesIndexKeys,
    geometriesIndex,
  ): Layer[] => {
    const containerX = container.left;
    const containerY = container.top;
    const layers: Layer[] = [['background', [], [containerX, containerY, container.width, container.height]]];
    const chartAreaX = containerX + dims.left;
    const chartAreaY = containerY + dims.top;
    if (y >= dims.top && y <= dims.top + dims.height && x >= dims.left && x <= dims.left + dims.width) {
      layers.push(['frame', [], [chartAreaX, chartAreaY, dims.width, dims.height]]);
    } else {
      return layers;
    }
    // layout relative pointer
    const layoutRelX = x - chartAreaX;
    const layoutRelY = y - chartAreaY;
    const relativeLayoutXPos = layout.horizontal.invert(layoutRelX);
    const relativeLayoutYPos = layout.vertical.invert(layoutRelY);
    const panel = getPanelSize(layout);
    const panelX = chartAreaX + layout.horizontal.scale(relativeLayoutXPos);
    const panelY = chartAreaY + layout.vertical.scale(relativeLayoutYPos);

    if (layout.horizontal.domain.length > 1 || layout.vertical.domain.length > 1) {
      layers.push([
        'facet',
        // data values
        [relativeLayoutXPos, relativeLayoutYPos],
        // rect
        [panelX, panelY, panel.width, panel.height],
      ]);
    }

    // rotate coordinate for in chart scales

    const rotatedX = getOrientedXPosition(x - panelX, x - panelY, rotation, panel);
    const rotatedY = getOrientedYPosition(y - panelX, y - panelY, rotation, panel);

    //x bucket
    const xBin = xScale.invertWithStep(rotatedX, geometriesIndexKeys);
    const yRange = [...yScales.values()][0].range;
    const binX = panelX + xScale.scale(xBin.value) - (xScale.step * xScale.barsPadding) / 2;
    const binY = panelY + yRange[1];
    layers.push(['bin', [xBin.value], [binX, binY, xScale.step, yRange[0]]]);

    const overGeometries = geometriesIndex
      .find(xBin.value, { x: rotatedX, y: rotatedY }, relativeLayoutXPos, relativeLayoutYPos)
      .filter((g) => isPointOnGeometry(rotatedX, rotatedY, g, pointBuffer));

    if (overGeometries.length > 0) {
      overGeometries.forEach((g) => {
        const bbox: [number, number, number, number] = isPointGeometry(g)
          ? [panelX + g.x - g.radius / 2, panelY + g.y - g.radius / 2, g.radius, g.radius]
          : [panelX + g.x, panelY + g.y, g.width, g.height];
        layers.push(['geometry', [g.value.y, g.value.datum], bbox]);
      });
    }
    return layers;
  },
);

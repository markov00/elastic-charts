/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecs } from '../../../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { Dimensions } from '../../../../utils/dimensions';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geoms, Mark } from '../../layout/viewmodel/geoms';
import { GoalSpec } from '../../specs';
import { render } from './scenegraph';

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCustomCachedSelector(
  [getSpecs, getParentDimensions, getChartThemeSelector],
  (specs, parentDimensions, theme): ShapeViewModel[] => {
    const goalSpecs = getSpecsFromStore<GoalSpec>(specs, ChartType.Goal, SpecType.Series);

    const panelDimsFn = getPanel(parentDimensions, goalSpecs);

    return goalSpecs.length > 0
      ? goalSpecs.map((spec, i) => render(spec, panelDimsFn(i), theme))
      : [nullShapeViewModel(theme)];
  },
);

/** @internal */
export const getPrimitiveGeoms = createCustomCachedSelector(
  [geometries, getParentDimensions, getSpecs],
  (shapeViewModel, parentDimensions, specs): Mark[] => {
    const goalSpecs = getSpecsFromStore<GoalSpec>(specs, ChartType.Goal, SpecType.Series);
    const panelDimsFn = getPanel(parentDimensions, goalSpecs);

    return shapeViewModel
      .map(({ chartCenter, bulletViewModel, theme }, i) => geoms(bulletViewModel, theme, panelDimsFn(i), chartCenter))
      .flat();
  },
);

function getPanel(parentDimensions: Dimensions, goalSpecs: GoalSpec[]) {
  if (goalSpecs[0].subtype === 'horizontalBullet') {
    const panelHeight = parentDimensions.height / goalSpecs.length;
    return (i: number) => ({ ...parentDimensions, height: panelHeight, top: parentDimensions.top + panelHeight * i });
  } //else if (goalSpecs[0].subtype === 'verticalBullet') {
  const panelWidth = parentDimensions.width / goalSpecs.length;
  return (i: number) => ({ ...parentDimensions, width: panelWidth, left: parentDimensions.left + panelWidth * i });
}

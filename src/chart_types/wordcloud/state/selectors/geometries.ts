/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import createCachedSelector from 're-reselect';

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { getSpecsFromStore } from '../../../../state/utils';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { WordcloudSpec } from '../../specs';
import { render } from './scenegraph';

const getSpecs = (state: GlobalChartState) => state.specs;

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCachedSelector(
  [getSpecs, getParentDimensions],
  (specs, parentDimensions): ShapeViewModel => {
    const wordcloudSpecs = getSpecsFromStore<WordcloudSpec>(specs, ChartType.Wordcloud, SpecType.Series);
    return wordcloudSpecs.length === 1 ? render(wordcloudSpecs[0], parentDimensions) : nullShapeViewModel();
  },
)((state) => state.chartId);

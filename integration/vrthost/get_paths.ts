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
import slugify from 'slugify';

import * as annotationLineStories from '../../stories/annotations/lines/line.stories';
import * as annotationRectsStories from '../../stories/annotations/rects/rects.stories';
import * as areaStories from '../../stories/area/area.stories';
import * as axesStories from '../../stories/axes/axes.stories';
import * as barStories from '../../stories/bar/bars.stories';
import * as bubbleStories from '../../stories/bubble/mixed.stories';
import * as debugStories from '../../stories/debug/debug.stories';
import * as goalStories from '../../stories/goal/goal.stories';
import * as gridsStories from '../../stories/grids/grids.stories';
import * as heatmapStories from '../../stories/heatmap/heatmap.stories';
import * as interactionsStories from '../../stories/interactions/interactions.stories';
import * as legendStories from '../../stories/legend/legend.stories';
import * as lineStories from '../../stories/line/line.stories';
import * as mixedStories from '../../stories/mixed/mixed.stories';
import * as rotationsStories from '../../stories/rotations/rotations.stories';
import * as scalesStories from '../../stories/scales/scales.stories';
import * as smallMultiplesStories from '../../stories/small_multiples/small_multiples.stories';
import * as streamgraphStories from '../../stories/streamgraph/streamgraph.stories';
import * as stylingsStories from '../../stories/stylings/stylings.stories';
import * as sunburstStories from '../../stories/sunburst/sunburst.stories';
import * as testCasesStories from '../../stories/test_cases/test_cases.stories';
import * as treemapStories from '../../stories/treemap/treemap.stories';

function getPathFromStoriesIndex(module: any) {
  const title = slugify(
    module.default.title
      .toLowerCase()
      .split('/')
      .join('-'),
    { lower: true, strict: true },
  );
  return Object.keys(module)
    .filter((d) => d !== 'default')
    .reduce<any>((acc, name) => {
      const namePath = name
        .replace(/([A-Z])/g, '-$1')
        .trim()
        .toLocaleLowerCase();
      const slugName = slugify(namePath, { lower: true, strict: true });
      const path = `/story/${title}--${slugName}`;
      acc[path] = module[name];
      return acc;
    }, {});
}


export const PathMap = [
  annotationLineStories,
  annotationRectsStories,
  areaStories,
  axesStories,
  barStories,
  bubbleStories,
  debugStories,
  goalStories,
  gridsStories,
  heatmapStories,
  interactionsStories,
  legendStories,
  lineStories,
  mixedStories,
  rotationsStories,
  scalesStories,
  smallMultiplesStories,
  streamgraphStories,
  stylingsStories,
  sunburstStories,
  testCasesStories,
  treemapStories,
].reduce((acc, curr) => {
  const map = getPathFromStoriesIndex(curr);
  return {
    ...acc,
    ...map,
  };
}, {});

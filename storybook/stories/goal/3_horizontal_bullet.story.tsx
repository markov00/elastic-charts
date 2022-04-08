/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Goal, Settings } from '@elastic/charts';
import { BandFillColorAccessorInput } from '@elastic/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '@elastic/charts/src/chart_types/goal_chart/specs/constants';

import { Color } from '../../../packages/charts/src/common/colors';
import { useBaseTheme } from '../../use_base_theme';

const q1 = 255 - 255 * 0.4;
const q2 = 255 - 255 * 0.25;
const q3 = 255 - 255 * 0.1;

const subtype = GoalSubtype.HorizontalBullet;

const colorMap: { [k: number]: Color } = {
  200: `rgb(${q1},${q1},${q1})`,
  250: `rgb(${q2},${q2},${q2})`,
  300: `rgb(${q3},${q3},${q3})`,
};

const bandFillColor = (x: number): Color => colorMap[x];

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Goal
      id="spec_1"
      subtype={subtype}
      base={0}
      target={250}
      actual={280}
      bands={[200, 250, 300]}
      ticks={[0, 50, 100, 150, 200, 250, 300]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => bandFillColor(value)}
      labelMajor="Revenue"
      labelMinor="USD $ (1000s)"
      centralMajor="250"
      centralMinor="target: 250"
    />
    <Goal
      id="spec_2"
      subtype={subtype}
      base={0}
      target={26}
      actual={23}
      bands={[20, 25, 30]}
      ticks={[0, 5, 10, 15, 20, 25, 30]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => `${value}%`}
      bandFillColor={({ value }: BandFillColorAccessorInput) => {
        const colors = {
          20: `rgb(${q1},${q1},${q1})`,
          25: `rgb(${q2},${q2},${q2})`,
          30: `rgb(${q3},${q3},${q3})`,
        };
        return colors[value];
      }}
      labelMajor="Profit"
      labelMinor="%"
    />
    <Goal
      id="spec_3"
      subtype={subtype}
      base={0}
      target={550}
      actual={320}
      bands={[350, 500, 600]}
      ticks={[0, 100, 200, 300, 400, 500, 600]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => {
        const colors = {
          350: `rgb(${q1},${q1},${q1})`,
          500: `rgb(${q2},${q2},${q2})`,
          600: `rgb(${q3},${q3},${q3})`,
        };
        return colors[value];
      }}
      labelMajor="Avg Order"
      labelMinor="US $"
    />
    <Goal
      id="spec_4"
      subtype={subtype}
      base={0}
      target={2100}
      actual={1600}
      bands={[1400, 2000, 2500]}
      ticks={[0, 500, 1000, 1500, 2000, 2500]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) =>
        new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(value)
      }
      bandFillColor={({ value }: BandFillColorAccessorInput) => {
        const colors = {
          1400: `rgb(${q1},${q1},${q1})`,
          2000: `rgb(${q2},${q2},${q2})`,
          2500: `rgb(${q3},${q3},${q3})`,
        };
        return colors[value];
      }}
      labelMajor="New cust"
      labelMinor="Count"
    />
    <Goal
      id="spec_5"
      subtype={subtype}
      base={0}
      target={4.7}
      actual={4.8}
      bands={[3.5, 4.5, 5]}
      ticks={[0, 1, 2, 3, 4, 5]}
      tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
      bandFillColor={({ value }: BandFillColorAccessorInput) => {
        const colors = {
          '3.5': `rgb(${q1},${q1},${q1})`,
          '4.5': `rgb(${q2},${q2},${q2})`,
          '5': `rgb(${q3},${q3},${q3})`,
        };
        return colors[value];
      }}
      labelMajor="Cust Sat"
      labelMinor="Top Rating of 5"
    />
  </Chart>
);

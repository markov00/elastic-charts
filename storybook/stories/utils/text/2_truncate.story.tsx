/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState } from 'react';

import { Font } from '@elastic/charts/src/common/text_utils';
import { withTextMeasure } from '@elastic/charts/src/utils/bbox/canvas_text_bbox_calculator';
import {
  truncateEnd,
  truncateMiddle,
  truncateStart,
  truncateStartEndAtMiddle,
} from '@elastic/charts/src/utils/text/truncate';

const fontSize = 24;
const font: Font = {
  fontStyle: 'normal',
  fontFamily: 'sans-serif',
  fontVariant: 'normal',
  fontWeight: 500,
  textColor: 'red',
};
const defaultText = 'Bacon ipsum dolor amet flank kielbasa. jowl chuck filet mignon, burgdoggen kevin tail.';

export const Example = () => {
  const [maxLineWidth, setMaxLineWidth] = useState(250);

  const [middleTruncated, startTruncated, endTruncated, startEndTruncated] = withTextMeasure((tm) => {
    return [
      truncateMiddle(defaultText, '…', maxLineWidth, (text) => tm(text, font, fontSize, 1).width),
      truncateStart(defaultText, '…', maxLineWidth, (text) => tm(text, font, fontSize, 1).width),
      truncateEnd(defaultText, '…', maxLineWidth, (text) => tm(text, font, fontSize, 1).width),
      truncateStartEndAtMiddle(defaultText, '…', maxLineWidth, (text) => tm(text, font, fontSize, 1).width),
    ];
  });

  return (
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div>
        <label style={{ display: 'inline-block', width: 200 }}> Max Line Width [{maxLineWidth}px]</label>
        <br />
        <input
          type="range"
          min={0}
          max={1000}
          value={maxLineWidth}
          style={{ width: 1000 }}
          onInput={(e) => setMaxLineWidth(Number(e.currentTarget.value))}
        />

        <p
          style={{
            padding: 0,
            margin: 0,
            width: maxLineWidth,
            height: fontSize,
            fontSize,
            overflow: 'visible',
            whiteSpace: 'nowrap',
            fontFamily: font.fontFamily,
            fontStyle: font.fontStyle,
            fontVariant: font.fontVariant,
            lineHeight: `${fontSize}px`,
            resize: 'none',
            textOverflow: 'ellipsis',
            border: '1px solid black',
          }}
        >
          {middleTruncated}
        </p>
        <p
          style={{
            padding: 0,
            margin: 0,
            width: maxLineWidth,
            height: fontSize,
            fontSize,
            overflow: 'visible',
            whiteSpace: 'nowrap',
            fontFamily: font.fontFamily,
            fontStyle: font.fontStyle,
            fontVariant: font.fontVariant,
            lineHeight: `${fontSize}px`,
            resize: 'none',
            textOverflow: 'ellipsis',
            border: '1px solid black',
          }}
        >
          {startTruncated}
        </p>
        <p
          style={{
            padding: 0,
            margin: 0,
            width: maxLineWidth,
            height: fontSize,
            fontSize,
            overflow: 'visible',
            whiteSpace: 'nowrap',
            fontFamily: font.fontFamily,
            fontStyle: font.fontStyle,
            fontVariant: font.fontVariant,
            lineHeight: `${fontSize}px`,
            resize: 'none',
            textOverflow: 'ellipsis',
            border: '1px solid black',
          }}
        >
          {endTruncated}
        </p>
        <p
          style={{
            padding: 0,
            margin: 0,
            width: maxLineWidth,
            height: fontSize,
            fontSize,
            overflow: 'visible',
            whiteSpace: 'nowrap',
            fontFamily: font.fontFamily,
            fontStyle: font.fontStyle,
            fontVariant: font.fontVariant,
            lineHeight: `${fontSize}px`,
            resize: 'none',
            textOverflow: 'ellipsis',
            border: '1px solid black',
          }}
        >
          {startEndTruncated}
        </p>
      </div>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};

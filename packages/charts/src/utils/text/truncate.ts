/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { monotonicHillClimb, integerSnap } from '../../solvers/monotonic_hill_climb';

const removeLastCharacter = (text: string) => text.substring(0, text.length - 1);

const removeFirstCharacter = (text: string) => text.substring(1);

const removeFirstAndLastCharacters = (text: string) => (text.length === 1 ? '' : text.substring(1, text.length - 1));

const splitText = (text: string) => ({
  at: (index: number): [string, string] => [text.substring(0, index), text.substring(index)],
});

/** @internal */
export function truncateEnd(
  fullText: string,
  ellipsis: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
  truncationOffset?: number,
): string {
  if (!checkIfTruncationIsNeeded(fullText, availableWidth, measureTextWidth)) {
    return fullText;
  }
  if (checkSufficientEllipsisWidth(fullText, ellipsis, availableWidth, measureTextWidth) === false) {
    return '';
  }
  let truncatedText = fullText;
  let trailingText = '';

  if (truncationOffset) {
    const index = fullText.length - truncationOffset;
    [truncatedText, trailingText] = splitText(fullText).at(index);

    const widthCheck = `${ellipsis}${trailingText}`;
    if (checkTruncationOffsetWidth(widthCheck, availableWidth, measureTextWidth) === false) {
      truncatedText = trailingText;
      trailingText = '';
    }
  }

  trailingText = ellipsis + trailingText;

  truncatedText = `${truncatedText}${trailingText}`;
  let truncatedTextWidth = measureTextWidth(truncatedText);

  while (truncatedTextWidth > availableWidth) {
    truncatedText = removeLastCharacter(truncatedText);
    truncatedTextWidth = measureTextWidth(`${truncatedText}${trailingText}`);
  }

  return `${truncatedText}${trailingText}`;
}

/** @internal */
export function truncateMiddle(
  fullText: string,
  ellipsis: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
): string {
  if (!checkIfTruncationIsNeeded(fullText, availableWidth, measureTextWidth)) {
    return fullText;
  }
  if (checkSufficientEllipsisWidth(fullText, ellipsis, availableWidth, measureTextWidth) === false) {
    return '';
  }

  const middlePosition = Math.floor(fullText.length / 2);
  let [firstHalf, secondHalf] = splitText(fullText).at(middlePosition);
  let trimfirstHalf;

  let textWidth = measureTextWidth(`${firstHalf}${ellipsis}${secondHalf}`);

  while (textWidth > availableWidth) {
    trimfirstHalf = !trimfirstHalf;
    if (trimfirstHalf) {
      firstHalf = removeLastCharacter(firstHalf);
    } else {
      secondHalf = removeFirstCharacter(secondHalf);
    }
    textWidth = measureTextWidth(`${firstHalf}${ellipsis}${secondHalf}`);
  }
  return `${firstHalf}${ellipsis}${secondHalf}`;
}

/** @internal */
export function truncateStart(
  fullText: string,
  ellipsis: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
  truncationOffset?: number,
): string {
  if (!checkIfTruncationIsNeeded(fullText, availableWidth, measureTextWidth)) {
    return fullText;
  }
  if (checkSufficientEllipsisWidth(fullText, ellipsis, availableWidth, measureTextWidth) === false) {
    return '';
  }
  let truncatedText = fullText;
  let leadingText = '';

  if (truncationOffset) {
    [leadingText, truncatedText] = splitText(fullText).at(truncationOffset);

    const widthCheck = `${leadingText}${ellipsis}`;
    if (checkTruncationOffsetWidth(widthCheck, availableWidth, measureTextWidth) === false) {
      truncatedText = leadingText;
      leadingText = '';
    }
  }

  leadingText += ellipsis;
  const truncateAt = monotonicHillClimb(
    (n) => availableWidth - measureTextWidth(`${leadingText}${truncatedText.substring(n - 1)}`),
    fullText.length,
    0,
    integerSnap,
  );
  return `${leadingText}${fullText.substring(truncateAt)}`;
}

/** @internal */
export function truncateStartEndAtMiddle(
  fullText: string,
  ellipsis: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
): string {
  if (!checkIfTruncationIsNeeded(fullText, availableWidth, measureTextWidth)) {
    return fullText;
  }
  if (checkSufficientEllipsisWidth(fullText, ellipsis, availableWidth, measureTextWidth) === false) {
    return '';
  }

  let truncatedText = fullText;
  let textWidth = measureTextWidth(truncatedText);
  while (truncatedText.length > 0 && textWidth > availableWidth) {
    truncatedText = removeFirstAndLastCharacters(truncatedText);
    textWidth = measureTextWidth(`${ellipsis}${truncatedText}${ellipsis}`);
  }

  return truncatedText.length > 0 ? `${ellipsis}${truncatedText}${ellipsis}` : '';
}

/** @internal */
export function checkTruncationOffsetWidth(
  text: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): boolean {
  const textWidth = measureTextWidth(text);

  return textWidth <= availableWidth;
}

/** @internal */
export function checkIfTruncationIsNeeded(
  fullText: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
): boolean {
  return measureTextWidth(fullText) > availableWidth;
}

/** @internal */
export function checkSufficientEllipsisWidth(
  truncation: string,
  ellipsis: string,
  availableWidth: number,
  measureTextWidth: (text: string) => number,
): boolean {
  const textToCheck =
    truncation === 'startEnd'
      ? `${ellipsis} ${ellipsis}` // startEnd needs a little more space
      : ellipsis;
  const textWidth = measureTextWidth(textToCheck);

  // false if The truncation ellipsis is larger than the available width. No text can be rendered.'
  return textWidth < availableWidth * 0.9;
}

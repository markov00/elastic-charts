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

const splitText = (text: string, at: number): [string, string] => [text.substring(0, at), text.substring(at)];

/** @internal */
export function truncateEnd(
  text: string,
  truncationMark: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
  truncationOffset?: number,
): string {
  if (!isTruncationNeeded(text, availableWidth, measureTextWidth)) {
    return text;
  }
  if (hasSufficientWidthForTruncationMark('end', truncationMark, availableWidth, measureTextWidth) === false) {
    return '';
  }
  let truncatedText = text;
  let trailingText = '';

  if (truncationOffset) {
    const index = text.length - truncationOffset;
    [truncatedText, trailingText] = splitText(text, index);

    const widthCheck = `${truncationMark}${trailingText}`;
    if (checkTruncationOffsetWidth(widthCheck, availableWidth, measureTextWidth) === false) {
      truncatedText = trailingText;
      trailingText = '';
    }
  }

  trailingText = `${truncationMark}${trailingText}`;

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
  text: string,
  truncationMark: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): string {
  if (!isTruncationNeeded(text, availableWidth, measureTextWidth)) {
    return text;
  }
  if (hasSufficientWidthForTruncationMark('middle', truncationMark, availableWidth, measureTextWidth) === false) {
    return '';
  }

  const middlePosition = Math.floor(text.length / 2);
  let [firstHalf, secondHalf] = splitText(text, middlePosition);
  let trimfirstHalf;

  let textWidth = measureTextWidth(`${firstHalf}${truncationMark}${secondHalf}`);

  while (textWidth > availableWidth) {
    trimfirstHalf = !trimfirstHalf;
    if (trimfirstHalf) {
      firstHalf = removeLastCharacter(firstHalf);
    } else {
      secondHalf = removeFirstCharacter(secondHalf);
    }
    textWidth = measureTextWidth(`${firstHalf}${truncationMark}${secondHalf}`);
  }
  return `${firstHalf}${truncationMark}${secondHalf}`;
}

/** @internal */
export function truncateStart(
  text: string,
  truncationMark: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
  truncationOffset?: number,
): string {
  if (!isTruncationNeeded(text, availableWidth, measureTextWidth)) {
    return text;
  }
  if (hasSufficientWidthForTruncationMark('start', truncationMark, availableWidth, measureTextWidth) === false) {
    return '';
  }
  let truncatedText = text;
  let leadingText = '';

  if (truncationOffset) {
    [leadingText, truncatedText] = splitText(text, truncationOffset);

    const widthCheck = `${leadingText}${truncationMark}`;
    if (checkTruncationOffsetWidth(widthCheck, availableWidth, measureTextWidth) === false) {
      truncatedText = leadingText;
      leadingText = '';
    }
  }

  leadingText += truncationMark;
  const truncateAt = monotonicHillClimb(
    (n) => availableWidth - measureTextWidth(`${leadingText}${truncatedText.substring(n - 1)}`),
    text.length,
    0,
    integerSnap,
  );
  return `${leadingText}${text.substring(truncateAt)}`;
}

/** @internal */
export function truncateStartEndAtMiddle(
  text: string,
  truncationMark: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): string {
  if (!isTruncationNeeded(text, availableWidth, measureTextWidth)) {
    return text;
  }
  if (hasSufficientWidthForTruncationMark('startEnd', truncationMark, availableWidth, measureTextWidth) === false) {
    return '';
  }

  let truncatedText = text;
  let textWidth = measureTextWidth(truncatedText);
  while (truncatedText.length > 0 && textWidth > availableWidth) {
    truncatedText = removeFirstAndLastCharacters(truncatedText);
    textWidth = measureTextWidth(`${truncationMark}${truncatedText}${truncationMark}`);
  }

  return truncatedText.length > 0 ? `${truncationMark}${truncatedText}${truncationMark}` : '';
}

/** @internal */
export function canTruncateAtOffset(
  text: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): boolean {
  return measureTextWidth(text) <= availableWidth;
}

/** @internal */
export function isTruncationNeeded(
  text: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): boolean {
  return measureTextWidth(text) > availableWidth;
}

/** @internal */
export function hasSufficientWidthForTruncationMark(
  truncationMode: 'start' | 'end' | 'startEnd' | 'middle',
  truncationMark: string,
  availableWidth: number,
  measureTextWidth: (t: string) => number,
): boolean {
  const truncationMarkWidth = measureTextWidth(
    truncationMode === 'startEnd' ? `${truncationMark}${truncationMark}` : truncationMark,
  );
  return truncationMarkWidth < availableWidth * 0.9;
}

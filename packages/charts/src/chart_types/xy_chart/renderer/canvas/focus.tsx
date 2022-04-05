/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { Dimensions } from '../../../../utils/dimensions';
import { deepEqual } from '../../../../utils/fast_deep_equal';
import { getPointerLayers, Layer } from '../../state/selectors/get_pointer_layers';
import { isChartEmptySelector } from '../../state/selectors/is_chart_empty';

/** @internal */
export interface ReactiveChartStateProps {
  initialized: boolean;
  isChartEmpty: boolean;
  chartContainerDimensions: Dimensions;
  layers: Layer[];
}

type FocusProps = ReactiveChartStateProps;

class FocusComponent extends React.Component<FocusProps> {
  static displayName = 'Focus';

  private ctx: CanvasRenderingContext2D | null;
  private readonly canvasRef: React.RefObject<HTMLCanvasElement>;
  private readonly devicePixelRatio: number;

  constructor(props: Readonly<FocusProps>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
    }
  }

  shouldComponentUpdate(nextProps: ReactiveChartStateProps) {
    return !deepEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
    }
  }

  private drawCanvas() {
    if (!this.ctx) {
      return;
    }
    this.ctx.fillStyle = 'transparent';
    this.ctx.clearRect(
      0,
      0,
      this.props.chartContainerDimensions.width * this.devicePixelRatio,
      this.props.chartContainerDimensions.height * this.devicePixelRatio,
    );
    this.ctx.save();
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    this.ctx?.beginPath();

    this.props.layers.forEach(([, , sizes]) => {
      if (sizes && sizes.length === 4 && this.ctx) {
        this.ctx.rect(...sizes);
      }
    });
    this.ctx.stroke();
    this.ctx.restore();
  }

  private tryCanvasContext() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(
      0,
      0,
      this.props.chartContainerDimensions.width * this.devicePixelRatio,
      this.props.chartContainerDimensions.height * this.devicePixelRatio,
    );
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const {
      initialized,
      isChartEmpty,
      chartContainerDimensions: { width, height },
    } = this.props;

    if (!initialized || isChartEmpty) {
      this.ctx = null;
      return null;
    }

    return (
      <>
        <canvas
          ref={this.canvasRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        />
        <div style={{ position: 'absolute', top: 0, fontSize: 8, background: 'white' }}>
          {this.props.layers.map(([name, data, size]) => {
            return (
              <div>
                {name} | {JSON.stringify(data)} | {JSON.stringify(size)}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  isChartEmpty: true,

  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  layers: [],
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  return {
    initialized: true,
    isChartEmpty: isChartEmptySelector(state),
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
    layers: getPointerLayers(state),
  };
};

/** @internal */
export const Focus = connect(mapStateToProps)(FocusComponent);

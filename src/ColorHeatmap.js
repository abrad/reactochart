import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

import RangeRect from './RangeRect';

import {methodIfFuncProp} from './util.js';
import {makeAccessor} from './utils/Data';

export default class ColorHeatmap extends React.Component {
  static propTypes = {
    data: React.PropTypes.array,

    endColor: React.PropTypes.array,
    startColor: React.PropTypes.array,

    rectWidth: React.PropTypes.number,
    rectHeight: React.PropTypes.number
  };

  static defaultProps = {
    data: [],
    endColor: [255, 255, 255],
    startColor: [0, 0, 0]
  };

  static getDomain(props) {
    const {data, getX, getY, getValue} = props;
    return {
      x: d3.extent(data.map(makeAccessor(getX))),
      y: d3.extent(data.map(makeAccessor(getY))),
      value: d3.extent(data.map(makeAccessor(getValue)))
    };
  };

  onMouseEnter = (e) => {
    this.props.onMouseEnter(e);
  };
  onMouseLeave = (e) => {
    this.props.onMouseLeave(e);
  };
  onMouseMove = (e) => {
    const {scale, data, getValue, getX, getY, onMouseMove} = this.props;
    if(!_.isFunction(onMouseMove)) return;

    //const boundBox = this.refs.background.getBoundingClientRect();
    //if(!boundBox) return;
    //const [x, y] = [e.clientX - (boundBox.left || 0), e.clientY - (boundBox.top || 0)];
    //const [xVal, yVal] = [scale.x.invert(x), scale.y.invert(y)];
    onMouseMove(e, {xVal, yVal});
  };

  scaleColor = (e, range) => {
    var $this = this;
    const domain = d3.extent($this.props.data.map(makeAccessor($this.props.getValue)))
    var startIdx = 0;
    var endIdx = 1
    var rangeSize = range[endIdx] - range[startIdx];
    var domainSize = domain[endIdx] - domain[startIdx];
    var x = Math.round(e * rangeSize/domainSize) + range[startIdx];

    return x;
  };

  getColor = (e) => {
    var $this = this;
    var r = 0;
    var g = 1;
    var b = 2;
    var rgb = [e, e, e].map(function(d, i) {
      return $this.scaleColor(d, [$this.props.startColor[i], $this.props.endColor[i]]);
    }).join(',');

    return ['rgb(', rgb, ')'].join('');
  };

  render() {
    var $this = this;
    const {data, getValue, getX, getY, scale, scaleWidth, scaleHeight} = $this.props;
    const [valueAccessor, xAccessor, yAccessor] =
      [getValue, getX, getY].map(makeAccessor);

    const handlers = {
      onMouseMove: methodIfFuncProp('onMouseMove', $this.props, this),
      onMouseEnter: methodIfFuncProp('onMouseEnter', $this.props, this),
      onMouseLeave: methodIfFuncProp('onMouseLeave', $this.props, this)
    };

    return <g className="area-heatmap-chart" {...handlers}>
      <rect x="0" y="0" width={scaleWidth} height={scaleHeight} ref="background" fill="transparent" />
      {data.map((d, i) => {
        var color = $this.getColor(valueAccessor(d));
        return <RangeRect
          datum={d}
          scale={scale}
          getX={d => d.x}
          getXEnd={d => d.x + 1}
          getY={d => d.y}
          getYEnd={d => d.y + 1}
          style={{fill: color}}
          key={i}
          />;
      })}
    </g>;
  }
}


import * as d3Ease from 'd3-ease'
import 'd3-transition'
import _ from 'lodash'

import ModelBase from './ModelBase'

export default class Intersection extends ModelBase {
  constructor (options = {}) {
    super(options)
    this._roads = []
  }

  get defaults () {
    return {
      type: 'Intersection'
    }
  }

  render () {
    this._parent.trigger('render', this)
  }

  remove () {
    this.point = null
    this._point = null
    this.render()
  }

  setPoint (point) {
    this._point = point
  }

  getPoint () {
    return this._point
  }

  addRoad (road, origin) {
    this._roads.push({ road, origin })
  }

  getRoads () {
    return _.map(this._roads, 'road')
  }

  _transform (matrix) {
    if (this._point) {
      const transformedPoint = this._point.clone()
      this.point = transformedPoint.transform(matrix)
    }
  }

  _render (svg, matrix) {
    this._transform(matrix)
    const r = 6
    const pointData = this.point ? [this.point] : []
    const pointsSvg = svg.selectAll('.nearest-point').data(pointData)
    const pointsSvgEnter = pointsSvg.enter().append('circle')
    pointsSvgEnter.attr('class', d => `nearest-point`)
    pointsSvgEnter.attr('cx', d => d.x)
    pointsSvgEnter.attr('cy', d => d.y)
    pointsSvgEnter.attr('r', 0)
    const pointsSvgEdit = pointsSvgEnter.merge(pointsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    pointsSvgEdit.attr('cx', d => d.x)
    pointsSvgEdit.attr('cy', d => d.y)
    pointsSvgEdit.attr('r', r)
    pointsSvg.exit().remove()
  }
}

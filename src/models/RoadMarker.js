import ModelBase from './ModelBase'
import * as d3Ease from 'd3-ease'
import 'd3-transition'

export default class RoadMarker extends ModelBase {
  constructor (options = {}) {
    super(options)
  }

  get defaults () {
    return {
      type: 'RoadMarker'
    }
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

  setLocation (location) {
    this._location = location
  }

  getLocation () {
    return this._location
  }

  _transform (matrix) {
    if (this._point) {
      const transformedPoint = this._point.clone()
      this.point = transformedPoint.transform(matrix)
    }
  }

  renderOnSVG (svg, matrix) {
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

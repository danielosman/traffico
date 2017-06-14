import ModelBase from './ModelBase'
import * as d3Ease from 'd3-ease'
import 'd3-transition'

export default class RoadMarker extends ModelBase {
  constructor (options = {}) {
    super(options)
  }

  render () {
    this._parent.trigger('render', this)
  }

  remove () {
    this.point = null
    this.render()
  }

  _render (svg) {
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

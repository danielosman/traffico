import * as d3Ease from 'd3-ease'
import * as d3Drag from 'd3-drag'
import * as d3Selection from 'd3-selection'
import 'd3-transition'
import paper from 'paper/dist/paper-core'

import ModelBase from './ModelBase'

export default class ResidentialBuilding extends ModelBase {
  constructor (options = {}) {
    super(options)
    this._selected = false
  }

  get defaults () {
    return {
      type: 'ResidentialBuilding',
      a: 30,
      b: 10,
      h: 4
    }
  }

  finalizeAdd () {
  }

  remove () {
    this._toBeRemoved = true
    this.render()
  }

  renderOnSVG (svg, matrix) {
    this._transform(matrix)
    this._renderRoad(svg, matrix)
    this._renderRoadPoints(svg)
    this._renderRoadHandles(svg)
  }

  _transform (matrix) {
    const transformedPath = this._path.clone()
    this.path = transformedPath.transform(matrix)
  }

  _renderRoad (svg, matrix) {
    const roadData = this._toBeRemoved ? [] : [this]
    const roadsSvg = svg.selectAll(`.${this.id}`).data(roadData, d => d.id)
    const roadsSvgEnter = roadsSvg.enter().append('path')
    roadsSvgEnter.attr('class', d => `road ${d.id}`)
    roadsSvgEnter.attr('d', d => d.path.pathData)
    const roadsSvgEdit = roadsSvgEnter.merge(roadsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    roadsSvgEdit.attr('d', d => d.path.pathData)
    roadsSvgEdit.style('stroke-width', 6 * matrix.scaling.x)
    roadsSvg.exit().remove()
  }

  _renderRoadPoints (svg) {
    const r = 5
    const roadPoints = []
    if (this._selected) {
      _.each(this.path.segments, (segment, i) => {
        roadPoints.push({ id: `point-${this.id}-${i}`, segment })
      })
    }
    const pointsSvg = svg.selectAll('.point').data(roadPoints, d => d.id)
    const pointsSvgEnter = pointsSvg.enter().append('circle')
    pointsSvgEnter.attr('class', d => `point ${d.id}`)
    pointsSvgEnter.attr('cx', d => d.segment.point.x)
    pointsSvgEnter.attr('cy', d => d.segment.point.y)
    pointsSvgEnter.attr('r', 0)
    pointsSvgEnter.call(this.dragRoadPoint)
    const pointsSvgEdit = pointsSvgEnter.merge(pointsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    pointsSvgEdit.attr('cx', d => d.segment.point.x)
    pointsSvgEdit.attr('cy', d => d.segment.point.y)
    pointsSvgEdit.attr('r', r)
    pointsSvg.exit().remove()
  }

  _renderRoadHandles (svg) {
    const w = 6
    const handlePoints = []
    if (this._selected) {
      _.each(this.path.segments, (segment, i) => {
        const handleIn = segment.getHandleIn()
        const handleOut = segment.getHandleOut()
        if (handleIn.x != 0 && handleIn.y != 0) {
          handlePoints.push({ id: `handle-${this.id}-${i}-in`, point: segment.point, handle: handleIn })
        }
        if (handleOut.x != 0 && handleOut.y != 0) {
          handlePoints.push({ id: `handle-${this.id}-${i}-out`, point: segment.point, handle: handleOut })
        }
      })
    }
    const drag = d3Drag.drag().on('drag', d => {
      d.handle.x = d3Selection.event.x - d.point.x
      d.handle.y = d3Selection.event.y - d.point.y
      this.render()
    })
    const handlesSvg = svg.selectAll('.handle').data(handlePoints, d => d.id)
    const handlesSvgEnter = handlesSvg.enter().append('rect')
    handlesSvgEnter.attr('class', d => `handle ${d.id}`)
    handlesSvgEnter.attr('x', d => d.point.x + d.handle.x - w / 2)
    handlesSvgEnter.attr('y', d => d.point.y + d.handle.y - w / 2)
    handlesSvgEnter.attr('width', w)
    handlesSvgEnter.attr('height', w)
    handlesSvgEnter.call(drag)
    const handlesSvgEdit = handlesSvgEnter.merge(handlesSvg).transition().ease(d3Ease.easeLinear).duration(100)
    handlesSvgEdit.attr('x', d => d.point.x + d.handle.x - w / 2)
    handlesSvgEdit.attr('y', d => d.point.y + d.handle.y - w / 2)
    handlesSvgEdit.attr('width', w)
    handlesSvgEdit.attr('height', w)
    handlesSvg.exit().remove()
  }
}

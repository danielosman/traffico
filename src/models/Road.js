import * as d3Ease from 'd3-ease'
import * as d3Drag from 'd3-drag'
import * as d3Selection from 'd3-selection'
import 'd3-transition'
import paper from 'paper/dist/paper-core'

import ModelBase from './ModelBase'
import Intersection from '../models/Intersection'

export default class Road extends ModelBase {
  constructor (options = {}) {
    super(options)
    this._selected = false
    this._path = new paper.Path()
    this._intersections = []
    const throttledDragRoadPointFunc = _.throttle((d, ev) => {
      d.segment.point.x = ev.x
      d.segment.point.y = ev.y
      this.render()
    }, 50).bind(this)
    this.dragRoadPoint = d3Drag.drag().on('drag', d => {
      const ev = { x: d3Selection.event.x, y: d3Selection.event.y }
      throttledDragRoadPointFunc(d, ev)
    })
  }

  get defaults () {
    return {
      type: 'Road',
      maxSpeed: 50,
    }
  }

  get num () {
    return this.get('num')
  }

  addSegment (x, y) {
    this._path.add(new paper.Point(x, y))
    if (this._intersections.length === 0) {
      const intersection = new Intersection({})
      this.addIntersection(intersection)
    }
  }

  finalizeAdd () {
    //this._path.smooth('continuous')
    this._path.smooth({ type: 'catmull-rom', factor: 0.0})
    if (this._intersections.length < 2) {
      const intersection = new Intersection({})
      this.addIntersection(intersection)
    }
  }

  getNearestPoint (x, y) {
    return this._path.getNearestPoint(new paper.Point(x, y))
  }

  getLocationOf (x, y) {
    return this._path.getLocationOf(new paper.Point(x, y))
  }

  splitAt (location) {
    return this._path.splitAt(location)
  }

  setPath (path) {
    this._path = path
  }

  setSelected (bool) {
    this._selected = bool
  }

  addIntersection (intersection) {
    this._intersections.push(intersection)
    if (!_.find(intersection.getRoads(), { id: this.id })) {
      if (this._intersections.length === 1) {
        intersection.addRoad(this, 'in')
      } else {
        intersection.addRoad(this, 'out')
      }
    }
  }

  setIntersectionAt (intersection, index) {
    this._intersections[index] = intersection
    if (!_.find(intersection.getRoads(), { id: this.id })) {
      if (index === 0) {
        intersection.addRoad(this, 'in')
      } else {
        intersection.addRoad(this, 'out')
      }
    }
  }

  getIntersections () {
    return this._intersections
  }

  render () {
    this._parent.trigger('render', this)
  }

  _render (svg, matrix) {
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
    const roadData = this.id ? [this] : []
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

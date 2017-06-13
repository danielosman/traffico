import * as d3Selection from 'd3-selection'
import 'd3-transition'
import * as d3Scale from 'd3-scale'
import * as d3Ease from 'd3-ease'
import * as d3Drag from 'd3-drag'
import _ from 'lodash'
import paper from 'paper/dist/paper-core'

export default class BeziersView {
  constructor ({el}) {
    this._el = el
    this._state = {}
  }

  get el () {
    return d3Selection.select(this._el)
  }

  get width () {
    return this._el.getBoundingClientRect().width
  }

  get height () {
    return this.width / 2
  }

  get svg () {
    return this.el.select('svg')
  }

  _initSvg () {
    if (this.svg.empty()) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      this._el.appendChild(svg)
      svg.classList.add('svg')
      paper.setup()
      this.svg.on('mousemove', this._onMouseMoved.bind(this))
      this.svg.on('click', this._onMouseClicked.bind(this))
    }
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
  }

  _onMouseMoved () {
    //console.log('mouse moved: ', d3Selection.event)
    if (this._state.divide) {
      const mousePoint = new paper.Point(d3Selection.event.x, d3Selection.event.y)
      const nearestPoint = this._state.divide.road.path.getNearestPoint(mousePoint)
      const nearestLocation = this._state.divide.road.path.getLocationOf(nearestPoint)
      this._state.divide.point = nearestPoint
      this._state.divide.location = nearestLocation
      this._renderNearestPoint(nearestPoint)
    }
  }

  _onMouseClicked () {
    console.log('target: ', d3Selection.event.target)
    if (this._state.divide) {
      this._state.divide.road.path.divideAt(this._state.divide.location)
      _.unset(this._state, 'divide')
      this.render()
    }
  }

  _renderNearestPoint (point) {
    const r = 6
    const pointData = point ? [point] : []
    const pointsSvg = this.svg.selectAll('.nearest-point').data(pointData)
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

  _prepareScales () {
    const viewportWidth = 500
    const currentX = 0
    const currentY = 0
    const aspectRatio = this.height / this.width
    const viewport = [[currentX, currentX + viewportWidth], [currentY, currentY + viewportWidth * aspectRatio]]
    this._xScale = d3Scale.scaleLinear().domain(viewport[0]).range([0, this.width])
    this._yScale = d3Scale.scaleLinear().domain(viewport[1]).range([0, this.height])
  }

  _prepareRoads () {
    if (!this._roads) {
      const path = new paper.Path()
      path.add(new paper.Point(this._xScale(30), this._yScale(50)))
      path.add(new paper.Point(this._xScale(60), this._yScale(150)))
      path.add(new paper.Point(this._xScale(90), this._yScale(40)))
      //path.smooth({ type: 'catmull-rom', factor: 1.0 })
      path.smooth({ type: 'continuous' })
      const road = { id: 1, path }
      this._roads = [road]
      this._state.divide = { road }
    }
  }

  _renderRoads () {
    const roadsSvg = this.svg.selectAll('.road').data(this._roads, d => d.id)
    const roadsSvgEnter = roadsSvg.enter().append('path')
    roadsSvgEnter.attr('class', d => `road road-${d.id}`)
    roadsSvgEnter.attr('d', d => d.path.pathData)
    const roadsSvgEdit = roadsSvgEnter.merge(roadsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    roadsSvgEdit.attr('d', d => d.path.pathData)
    roadsSvg.exit().remove()
  }

  _renderRoadPoints () {
    const r = 5
    const roadPoints = []
    _.each(this._roads, road => {
      _.each(road.path.segments, (segment, i) => {
        roadPoints.push({ id: `point-${road.id}-${i}`, segment })
      })
    })
    const drag = d3Drag.drag().on('drag', d => {
      d.segment.point.x = d3Selection.event.x
      d.segment.point.y = d3Selection.event.y
      this.render()
    })
    const pointsSvg = this.svg.selectAll('.point').data(roadPoints, d => d.id)
    const pointsSvgEnter = pointsSvg.enter().append('circle')
    pointsSvgEnter.attr('class', d => `point ${d.id}`)
    pointsSvgEnter.attr('cx', d => d.segment.point.x)
    pointsSvgEnter.attr('cy', d => d.segment.point.y)
    pointsSvgEnter.attr('r', 0)
    pointsSvgEnter.call(drag)
    const pointsSvgEdit = pointsSvgEnter.merge(pointsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    pointsSvgEdit.attr('cx', d => d.segment.point.x)
    pointsSvgEdit.attr('cy', d => d.segment.point.y)
    pointsSvgEdit.attr('r', r)
    pointsSvg.exit().remove()
  }

  _renderRoadHandles () {
    const w = 6
    const handlePoints = []
    _.each(this._roads, road => {
      _.each(road.path.segments, (segment, i) => {
        const handleIn = segment.getHandleIn()
        const handleOut = segment.getHandleOut()
        if (handleIn.x != 0 && handleIn.y != 0) {
          handlePoints.push({ id: `handle-${road.id}-${i}-in`, point: segment.point, handle: handleIn })
        }
        if (handleOut.x != 0 && handleOut.y != 0) {
          handlePoints.push({ id: `handle-${road.id}-${i}-out`, point: segment.point, handle: handleOut })
        }
      })
    })
    const drag = d3Drag.drag().on('drag', d => {
      d.handle.x = d3Selection.event.x - d.point.x
      d.handle.y = d3Selection.event.y - d.point.y
      this.render()
    })
    const handlesSvg = this.svg.selectAll('.handle').data(handlePoints, d => d.id)
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

  render () {
    this._initSvg()
    this._prepareScales()
    this._prepareRoads()
    this._renderRoads()
    this._renderRoadPoints()
    this._renderRoadHandles()
  }
}

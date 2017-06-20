import paper from 'paper/dist/paper-core'
import _ from 'lodash'

import ActionBase from './ActionBase'

export default class ResidentialAdd extends ActionBase {
  constructor (options = {}) {
    const roadMarker = options.roadMarker
    _.unset(options, 'roadMarker')
    super(options)
    this._isActive = false
    this._roadMarker = roadMarker
    this._hoveredRoad = null
  }

  get active () {
    return this._isActive
  }

  activate (params) {
    if (!this.active) {
      console.log('ResidentialAdd activated')
      this._parent.trigger('cancelAllActions')
      this.listenTo(this._parent, 'cancelAllActions', this.cancel)
      this.listenTo(this._parent, 'mouseMoved', this._onMouseMoved)
      this.listenTo(this._parent, 'click', this._onClick)
      this._isActive = true
      this._hoveredRoad = null
    }
  }

  cancel () {
    if (this.active) {
      console.log('ResidentialAdd canceled')
      this.stopListening(this._parent, 'cancelAllActions')
      this.stopListening(this._parent, 'mouseMoved')
      this.stopListening(this._parent, 'click')
      this.road.render()
      this._parent.trigger('addObject', this.road)
      this._roadMarker.remove()
      this._isActive = false
    }
  }

  _onClick (event) {
    console.log('RoadAdd click: ', event)
    let point = new paper.Point(event.x, event.y)
    if (this._hoveredRoad) {
      point = this._roadMarker.getPoint()
      const splitLocation = this._roadMarker.getLocation()
      const path = this._hoveredRoad.splitAt(splitLocation)
      const newNum = this.getNewRoadNum()
      const newRoad = new Road({ num: newNum, id: `road-${newNum}`, parent: this._parent })
      newRoad.setPath(path)
      this._parent.trigger('addObject', newRoad)
      this._roads.push(newRoad)
      const intersection = new Intersection({ parent: this._parent })
      newRoad.addIntersection(intersection)
      newRoad.addIntersection(this._hoveredRoad.getIntersections()[1])
      newRoad.render()
      this._hoveredRoad.setIntersectionAt(intersection, 1)
      this._hoveredRoad.render()
      this.road.addIntersection(intersection)
    }
    this.road.addSegment(point.x, point.y)
    if (this.road._path.segments.length === 1) {
      this.road.addSegment(point.x, point.y)
    }
    if (this.road.getIntersections().length === 2) {
      this.cancel()
    }
    this.road.render()
  }

  _onMouseMoved (event) {
    if (event.d && event.d.cid && event.d.get('type') === 'Road') {
      if (this.road.id !== event.d.id) {
        this._hoveredRoad = event.d
      }
    }
    if (this._hoveredRoad) {
      this._roadMarker.road = this._hoveredRoad
      this._roadMarker.setPoint(this._hoveredRoad.getNearestPoint(event.x, event.y))
      const point = this._roadMarker.getPoint()
      this._roadMarker.setLocation(this._hoveredRoad.getLocationOf(point.x, point.y))
      const distance = (point.x - event.x) * (point.x - event.x) + (point.y - event.y) * (point.y - event.y)
      console.log('_hoveredRoad: ', event, distance)
      if (distance < 10000) {
        this._roadMarker.render()
      } else {
        this._roadMarker.remove()
        this._hoveredRoad = null
      }
    }
    if (this.road._path.segments.length) {
      this.road._path.lastSegment.point.set(event.x, event.y)
      this.road.render()
    }
  }
}

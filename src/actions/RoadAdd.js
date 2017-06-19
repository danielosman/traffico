import paper from 'paper/dist/paper-core'
import _ from 'lodash'

import ActionBase from './ActionBase'
import Road from '../models/Road'

export default class RoadAdd extends ActionBase {
  constructor (options = {}) {
    const roadMarker = options.roadMarker
    _.unset(options, 'roadMarker')
    super(options)
    this._isActive = false
    this._roadMarker = roadMarker
    this._hoveredRoad = null
    this.listenTo(this._parent, 'activate:RoadAdd', this.activate)
  }

  get active () {
    return this._isActive
  }

  activate (params) {
    if (!this.active) {
      console.log('RoadAdd activated')
      this.listenTo(this._parent, 'cancelAllActions', this.cancel)
      this.listenTo(this._parent, 'mouseMoved', this._onMouseMoved)
      this.listenTo(this._parent, 'click', this._onClick)
      this._isActive = true
      this._hoveredRoad = null
      const newNum = (!params.roads || !params.roads.length) ? 1 : (_.maxBy(params.roads, 'num').num + 1)
      this.road = new Road({ num: newNum, id: `road-${newNum}`, parent: this._parent })
      console.log('Road: ', params, this.road)
    }
  }

  cancel () {
    if (this.active) {
      console.log('RoadAdd canceled')
      this.road.finalizeAdd()
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
    }
    this.road.addSegment(point.x, point.y)
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
  }
}

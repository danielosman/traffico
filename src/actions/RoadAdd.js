import paper from 'paper/dist/paper-core'
import _ from 'lodash'

import ActionBase from './ActionBase'
import Road from '../models/Road'

export default class RoadAdd extends ActionBase {
  constructor (options = {}) {
    super(options)
    this.isActive = false
    this.listenTo(this._parent, 'activate:RoadAdd', this.activate)
  }

  activate (params) {
    if (!this.isActive) {
      console.log('RoadAdd activated')
      this.listenTo(this._parent, 'cancelAllActions', this.cancel)
      this.listenTo(this._parent, 'click', this._onClick)
      this.isActive = true
      const newNum = (!params.roads || !params.roads.length) ? 1 : (_.maxBy(params.roads, 'num').num + 1)
      this.road = new Road({ num: newNum, id: `road-${newNum}` })
      this.road._parent = this._parent
      this.road.path = new paper.Path()
      console.log('Road: ', params, this.road)
    }
  }

  cancel () {
    if (this.isActive) {
      console.log('RoadAdd canceled')
      this.road.path.smooth('continuous')
      this.stopListening(this._parent, 'cancelAllActions')
      this.stopListening(this._parent, 'click')
      this.road.render()
      this._parent.trigger('addObject', this.road)
      this.isActive = false
    }
  }

  _onClick (event) {
    console.log('RoadAdd click: ', event)
    this.road.path.add(new paper.Point(event.x, event.y))
    this.road.render()
  }
}

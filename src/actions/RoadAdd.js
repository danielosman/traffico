import paper from 'paper/dist/paper-core'

import ActionBase from './ActionBase'
import Road from '../models/Road'

export default class RoadAdd extends ActionBase {
  constructor (options = {}) {
    super(options)
    this.isActive = false
    this.listenTo(this._parent, 'activate:RoadAdd', this.activate)
  }

  activate () {
    if (!this.isActive) {
      console.log('RoadAdd activated')
      this.listenTo(this._parent, 'cancelAllActions', this.cancel)
      this.listenTo(this._parent, 'click', this._onClick)
      this.isActive = true
      this.road = new Road({ parent: this._parent })
      this.road.id = 1
      this.road.path = new paper.Path()
    }
  }

  cancel () {
    if (this.isActive) {
      console.log('RoadAdd canceled')
      this.stopListening(this._parent, 'cancelAllActions')
      this.stopListening(this._parent, 'click')
      this.isActive = false
    }
  }

  _onClick (event) {
    console.log('RoadAdd click: ', event)
    this.road.path.add(new paper.Point(event.x, event.y))
    this.road.render()
  }
}

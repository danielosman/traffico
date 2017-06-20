import paper from 'paper/dist/paper-core'
import _ from 'lodash'

import ActionBase from './ActionBase'
import ResidentialBuilding from '../models/ResidentialBuilding'

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
      this._building = new ResidentialBuilding({ parent: this._parent })
    }
  }

  cancel () {
    if (this.active) {
      console.log('ResidentialAdd canceled')
      this.stopListening(this._parent, 'cancelAllActions')
      this.stopListening(this._parent, 'mouseMoved')
      this.stopListening(this._parent, 'click')
      this._building.render()
      this._roadMarker.remove()
      this._isActive = false
    }
  }

  _onClick (event) {
    console.log('ResidentialAdd click: ', event)
    this._parent.trigger('addObject', this._building)
    this.cancel()
  }

  _onMouseMoved (event) {
    if (event.d && event.d.cid && event.d.get('type') === 'Road') {
      console.log('Hovered Road: ', event.d)
    }
    this._building._path.position.x = event.x
    this._building._path.position.y = event.y
    this._building.render()
  }
}

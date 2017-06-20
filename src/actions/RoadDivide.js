import paper from 'paper/dist/paper-core'

import ActionBase from './ActionBase'

export default class RoadDivide extends ActionBase {
  constructor (options = {}) {
    super(options)
    this.isActive = false
    this.roadMarker = options.roadMarker
  }

  activate (params) {
    if (!this.isActive && params.road) {
      console.log('RoadDivide activated: ', params)
      this._parent.trigger('cancelAllActions')
      this.listenTo(this._parent, 'cancelAllActions', this.cancel)
      this.listenTo(this._parent, 'mouseMoved', this._onMouseMoved)
      this.listenTo(this._parent, 'click', this._onClick)
      this.road = params.road
      this.isActive = true
    }
  }

  cancel () {
    if (this.isActive) {
      console.log('RoadDivide canceled')
      this.stopListening(this._parent, 'cancelAllActions')
      this.stopListening(this._parent, 'mouseMoved')
      this.stopListening(this._parent, 'click')
      this.roadMarker.remove()
      this.isActive = false
    }
  }

  _onMouseMoved (event) {
    const mousePoint = new paper.Point(event.x, event.y)
    this.roadMarker.point = this.road.path.getNearestPoint(mousePoint)
    this.roadMarker.location = this.road.path.getLocationOf(this.roadMarker.point)
    this.roadMarker.render()
  }

  _onClick (event) {
    this.road.path.divideAt(this.roadMarker.location)
    this.cancel()
  }
}

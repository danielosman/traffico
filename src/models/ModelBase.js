import Backbone from 'backbone'
import _ from 'lodash'

export default class RoadMarker extends Backbone.Model {
  constructor (options = {}) {
    const parent = options.parent
    _.unset(options, 'parent')
    super(options)
    this._parent = parent
    this._selected = false
  }

  get selected () {
    return this._selected
  }

  set selected (value) {
    this._selected = value
  }

  render () {
    this._parent.trigger('renderObject', this)
  }
}

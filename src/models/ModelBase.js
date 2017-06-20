import Backbone from 'backbone'
import _ from 'lodash'

export default class RoadMarker extends Backbone.Model {
  constructor (options = {}) {
    const parent = options.parent
    _.unset(options, 'parent')
    super(options)
    this._parent = parent
  }

  render () {
    this._parent.trigger('renderObject', this)
  }
}

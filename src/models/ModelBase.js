import Backbone from 'backbone'

export default class RoadMarker extends Backbone.Model {
  constructor (options = {}) {
    super(options)
    this._parent = options.parent
  }
}

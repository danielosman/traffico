import Backbone from 'backbone'

export default class ActionBase extends Backbone.Model {
  constructor (options) {
    super(options)
    this._parent = options.parent
  }
}

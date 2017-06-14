import ActionBase from './ActionBase'

export default class SelectAction extends ActionBase {
  constructor (options = {}) {
    super(options)
    this.listenTo(this._parent, 'click', this._onClick)
    this.listenTo(this._parent, 'cancelAllActions', this.cancel)
  }

  cancel () {
    this.unselectCurrentObject()
  }

  unselectCurrentObject () {
    if (this.object) {
      this.object.selected = false
      this.object.render()
    }
  }

  _onClick (event) {
    if (event.d) {
      this.object = event.d
      this.object.selected = true
      this.object.render()
    } else {
      this.unselectCurrentObject()
    }
  }
}

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
      this.object.setSelected(false)
      this.object.render()
    }
  }

  _onClick (event) {
    if (event.d && event.d.cid) {
      if (event.d.get('type') === 'RoadMarker') {
        return
      }
      this.object = event.d
      this.object.setSelected(true)
      this.object.render()
      console.log('clicked: ', this.object)
    } else {
      this.unselectCurrentObject()
    }
  }
}

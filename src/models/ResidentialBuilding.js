import * as d3Ease from 'd3-ease'
import * as d3Drag from 'd3-drag'
import * as d3Selection from 'd3-selection'
import 'd3-transition'
import paper from 'paper/dist/paper-core'

import ModelBase from './ModelBase'

export default class ResidentialBuilding extends ModelBase {
  constructor (options = {}) {
    super(options)
    this._path = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(this.get('a'), this.get('b')))
  }

  get defaults () {
    return {
      type: 'ResidentialBuilding',
      a: 32,
      b: 12,
      h: 4
    }
  }

  finalizeAdd () {
  }

  remove () {
    this._toBeRemoved = true
    this.render()
  }

  renderOnSVG (svg, matrix) {
    this._transform(matrix)
    this._renderBuilding(svg)
  }

  _transform (matrix) {
    const transformedPath = this._path.clone()
    this.path = transformedPath.transform(matrix)
  }

  _renderBuilding (svg) {
    const buildingData = this._toBeRemoved ? [] : [this]
    const buildingsSvg = svg.selectAll(`.residential-building-${this.cid}`).data(buildingData, d => d.cid)
    const buildingsSvgEnter = buildingsSvg.enter().append('path')
    buildingsSvgEnter.attr('class', d => `residential-building residential-building-${d.cid}`)
    buildingsSvgEnter.attr('d', d => d.path.pathData)
    const buildingsSvgEdit = buildingsSvgEnter.merge(buildingsSvg).transition().ease(d3Ease.easeLinear).duration(100)
    buildingsSvgEdit.attr('d', d => d.path.pathData)
    buildingsSvg.exit().remove()
  }
}

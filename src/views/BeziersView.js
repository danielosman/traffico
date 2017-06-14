import * as d3Selection from 'd3-selection'
import 'd3-transition'
import * as d3Scale from 'd3-scale'
import _ from 'lodash'
import paper from 'paper/dist/paper-core'
import Backbone from 'backbone'

import SelectAction from '../actions/SelectAction'
import RoadDivide from '../actions/RoadDivide'
import RoadAdd from '../actions/RoadAdd'

import Road from '../models/Road'
import RoadMarker from '../models/RoadMarker'

import buttonPanelHTML from '../html/buttonPanel.html'

export default class BeziersView extends Backbone.View {
  constructor (...args) {
    super(...args)
    this.listenTo(this, 'render', this.renderObject)
  }

  get events () {
    return {
      'click .road-add': '_onRoadAdd',
      'click .road-divide': '_onRoadDivide'
    }
  }

  get width () {
    return this.el.getBoundingClientRect().width
  }

  get height () {
    return this.width / 2
  }

  get container () {
    return d3Selection.select(this.el)
  }

  get svg () {
    return this.container.select('svg')
  }

  get buttonPanel () {
    return this.container.select('#buttonPanel')
  }

  // Initialization

  _initSvg () {
    if (this.svg.empty()) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      this.el.appendChild(svg)
      svg.classList.add('svg')
      paper.setup()
      this.svg.on('mousemove', this._onMouseMoved.bind(this))
      this.svg.on('click', this._onMouseClicked.bind(this))
      d3Selection.select('body').on('keydown', this._onKeyDown.bind(this))
      // Init required objects
      const roadMarker = new RoadMarker({ parent: this })
      // Init action handlers.
      this._actions = {}
      this._actions.select = new SelectAction({ parent: this })
      this._actions.roadDivide = new RoadDivide({ parent: this, roadMarker })
      this._actions.roadAdd = new RoadAdd({ parent: this })
    }
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
  }

  _initButtonPanel () {
    if (this.buttonPanel.empty()) {
      const buttonPanel = document.createElement('div')
      buttonPanel.setAttribute('id', 'buttonPanel')
      buttonPanel.innerHTML = buttonPanelHTML({})
      this.el.appendChild(buttonPanel)
    }
  }

  // Button handlers

  _onRoadAdd () {
    this.trigger('cancelAllActions')
    this.trigger('activate:RoadAdd')
  }

  _onRoadDivide () {
    const road = this._actions.select.object
    this.trigger('cancelAllActions')
    this.trigger('activate:RoadDivide', { road })
  }

  // Event handlers

  _onMouseMoved () {
    this.trigger('mouseMoved', { x: d3Selection.event.x, y: d3Selection.event.y })
  }

  _onMouseClicked () {
    this.trigger('click', { x: d3Selection.event.x, y: d3Selection.event.y, d: d3Selection.select(d3Selection.event.target).datum() })
  }

  _onKeyDown () {
    if (d3Selection.event.keyCode === 27) {
      this.trigger('cancelAllActions')
    }
  }

  _prepareScales () {
    const viewportWidth = 500
    const currentX = 0
    const currentY = 0
    const aspectRatio = this.height / this.width
    const viewport = [[currentX, currentX + viewportWidth], [currentY, currentY + viewportWidth * aspectRatio]]
    this._xScale = d3Scale.scaleLinear().domain(viewport[0]).range([0, this.width])
    this._yScale = d3Scale.scaleLinear().domain(viewport[1]).range([0, this.height])
  }

  _prepareRoads () {
    if (!this._roads) {
      const path = new paper.Path()
      path.add(new paper.Point(this._xScale(30), this._yScale(50)))
      path.add(new paper.Point(this._xScale(60), this._yScale(150)))
      path.add(new paper.Point(this._xScale(90), this._yScale(40)))
      //path.smooth({ type: 'catmull-rom', factor: 1.0 })
      path.smooth({ type: 'continuous' })
      const road = { id: 1, path }
      this._roads = [road]
    }
  }

  renderObject (obj) {
    obj._render(this.svg)
  }

  render () {
    this._initSvg()
    this._initButtonPanel()
    this._prepareScales()
    this._prepareRoads()
  }
}

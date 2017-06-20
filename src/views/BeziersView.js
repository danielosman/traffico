import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Zoom from 'd3-zoom'
import _ from 'lodash'
import paper from 'paper/dist/paper-core'
import Backbone from 'backbone'

import SelectAction from '../actions/SelectAction'
import RoadDivide from '../actions/RoadDivide'
import RoadAdd from '../actions/RoadAdd'
import ResidentialAdd from '../actions/ResidentialAdd'

import Road from '../models/Road'
import RoadMarker from '../models/RoadMarker'

import buttonPanelHTML from '../html/buttonPanel.html'


export default class BeziersView extends Backbone.View {
  constructor (...args) {
    super(...args)
    this.listenTo(this, 'renderObject', this.renderObject)
    this.listenTo(this, 'addObject', this.addObject)
  }

  get events () {
    return {
      'click .road-add': '_onRoadAdd',
      'click .road-divide': '_onRoadDivide',
      'click .residential-add': '_onResidentialAdd'
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
      const zoom = d3Zoom.zoom().on('zoom', this._onZoom.bind(this))
      this.svg.on('mousemove', this._onMouseMoved.bind(this))
      this.svg.on('click', this._onMouseClicked.bind(this))
      this.svg.call(zoom)
      d3Selection.select('body').on('keydown', this._onKeyDown.bind(this))
      // Init required objects
      const roadMarker = new RoadMarker({ parent: this })
      // Init action handlers.
      this._actions = {}
      this._actions.select = new SelectAction({ parent: this })
      this._actions.roadDivide = new RoadDivide({ parent: this, roadMarker })
      this._actions.roadAdd = new RoadAdd({ parent: this, roadMarker })
      this._actions.residentialAdd = new ResidentialAdd({ parent: this, roadMarker })
      //
      this.objects = []
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
    const roads = _.filter(this.objects, obj => obj.get('type') === 'Road')
    this._actions.roadAdd.activate({ roads })
  }

  _onRoadDivide () {
    const road = this._actions.select.object
    this._actions.roadDivide.activate({ road })
  }

  _onResidentialAdd () {
    this._actions.residentialAdd.activate()
  }

  // Event handlers

  _onMouseMoved () {
    const mouse = d3Selection.mouse(this.svg.node())
    const cx = mouse[0]
    const cy = mouse[1]
    const point = new paper.Point(cx, cy)
    const transformedPoint = this._matrix.inverseTransform(point)
    this.trigger('mouseMoved', { x: transformedPoint.x, y: transformedPoint.y, cx, cy, d: d3Selection.select(d3Selection.event.target).datum() })
  }

  _onMouseClicked () {
    const mouse = d3Selection.mouse(this.svg.node())
    const cx = mouse[0]
    const cy = mouse[1]
    const point = new paper.Point(cx, cy)
    const transformedPoint = this._matrix.inverseTransform(point)
    this.trigger('click', { x: transformedPoint.x, y: transformedPoint.y, cx, cy, d: d3Selection.select(d3Selection.event.target).datum() })
  }

  _onKeyDown () {
    if (d3Selection.event.keyCode === 27) {
      this.trigger('cancelAllActions')
    } else if (d3Selection.event.key === '=') {
      this._scale *= 1.1
      this.applyMatrixTransform()
    } else if (d3Selection.event.key === '-') {
      this._scale *= 0.9
      this.applyMatrixTransform()
    } else if (d3Selection.event.key === 'w') {
      //this._ty += 10 * this._scale
      d3Zoom.zoomTransform(this.svg.node()).y += 10 * this._scale
      this.applyMatrixTransform()
    } else if (d3Selection.event.key === 's') {
      //this._ty -= 10 * this._scale
      d3Zoom.zoomTransform(this.svg.node()).y -= 10 * this._scale
      this.applyMatrixTransform()
    } else if (d3Selection.event.key === 'd') {
      //this._tx -= 10 * this._scale
      //d3Zoom.zoomIdentity.x = this._tx
      d3Zoom.zoomTransform(this.svg.node()).x -= 10 * this._scale
      this.applyMatrixTransform()
    } else if (d3Selection.event.key === 'a') {
      //this._tx += 10 * this._scale
      d3Zoom.zoomTransform(this.svg.node()).x += 10 * this._scale
      this.applyMatrixTransform()
    }
  }

  _onZoom () {
    console.log('zoom: ', d3Zoom.zoomTransform(this.svg.node()))
    const transform = d3Zoom.zoomTransform(this.svg.node())
    this._scale = transform.k
    this._tx = transform.x
    this._ty = transform.y
    this.applyMatrixTransform()
  }

  _initScales () {
    this._worldWidth = 2000
    this._worldHeight = 2000
    const scaleX = this.width / this._worldWidth
    const scaleY = this.height / this._worldHeight
    this._scale = Math.min(scaleX, scaleY)
    this._tx = 0
    this._ty = 0
    this._matrix = new paper.Matrix()
    this._matrix.translate(this._tx, this._ty)
    this._matrix.scale(this._scale)
    d3Zoom.zoomIdentity.k = this._scale
    console.log('d3Zoom.zoomIdentity: ', d3Zoom.zoomIdentity)
  }

  applyMatrixTransform () {
    this._matrix = new paper.Matrix()
    const transform = d3Zoom.zoomTransform(this.svg.node())
    //this._matrix.translate(this._tx, this._ty)
    //this._matrix.scale(this._scale)
    this._matrix.translate(transform.x, transform.y)
    this._matrix.scale(transform.k)
    this.renderAllObjects()
  }

  renderObject (obj) {
    obj.renderOnSVG(this.svg, this._matrix)
  }

  renderAllObjects () {
    _.each(this.objects, obj => this.renderObject(obj))
  }

  addObject (obj) {
    this.objects.push(obj)
    console.log('objects: ', this.objects)
  }

  render () {
    this._initSvg()
    this._initButtonPanel()
    this._initScales()
  }
}

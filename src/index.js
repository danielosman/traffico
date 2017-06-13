import './styles/index.scss'
import BeziersView from './views/BeziersView'

const canvasContainer = document.createElement('div')
canvasContainer.setAttribute('class', 'canvas-container')
document.body.insertBefore(canvasContainer, document.body.firstChild)

const beziersView = new BeziersView({ el: canvasContainer})
beziersView.render()

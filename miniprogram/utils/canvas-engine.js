class CanvasEngine {
  constructor() {
    this.elements = []
    this.guideLineType = ''
    this.width = 0
    this.height = 0
    this.selectedElementId = null
    this.onUpdate = null
  }

  init(width, height, onUpdate) {
    this.width = width
    this.height = height
    this.onUpdate = onUpdate
    this.elements = []
  }

  generateId() {
    return 'element-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  addElement(element) {
    const newElement = {
      id: this.generateId(),
      type: element.type || 'color_block',
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || 100,
      height: element.height || 100,
      color: element.color || '#2196F3',
      opacity: element.opacity !== undefined ? element.opacity : 1,
      filters: element.filters || [],
      rotation: element.rotation || 0
    }
    this.elements.push(newElement)
    this.notifyUpdate()
    return newElement.id
  }

  removeElement(elementId) {
    const index = this.elements.findIndex(el => el.id === elementId)
    if (index >= 0) {
      this.elements.splice(index, 1)
      if (this.selectedElementId === elementId) {
        this.selectedElementId = null
      }
      this.notifyUpdate()
      return true
    }
    return false
  }

  updateElement(elementId, props) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      Object.assign(element, props)
      this.notifyUpdate()
      return true
    }
    return false
  }

  getElement(elementId) {
    return this.elements.find(el => el.id === elementId) || null
  }

  getAllElements() {
    return [...this.elements]
  }

  selectElement(elementId) {
    this.selectedElementId = elementId
    this.notifyUpdate()
  }

  getSelectedElement() {
    return this.elements.find(el => el.id === this.selectedElementId) || null
  }

  setGuideLine(type) {
    this.guideLineType = type
    this.notifyUpdate()
  }

  clearGuideLine() {
    this.guideLineType = ''
    this.notifyUpdate()
  }

  applyFilter(elementId, filter) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      if (!element.filters.includes(filter)) {
        element.filters.push(filter)
        this.notifyUpdate()
      }
      return true
    }
    return false
  }

  removeFilter(elementId, filter) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      const index = element.filters.indexOf(filter)
      if (index >= 0) {
        element.filters.splice(index, 1)
        this.notifyUpdate()
      }
      return true
    }
    return false
  }

  clearCanvas() {
    this.elements = []
    this.selectedElementId = null
    this.notifyUpdate()
  }

  exportData() {
    return {
      elements: this.getAllElements(),
      width: this.width,
      height: this.height,
      guideLineType: this.guideLineType
    }
  }

  importData(data) {
    this.elements = data.elements || []
    this.width = data.width || this.width
    this.height = data.height || this.height
    this.guideLineType = data.guideLineType || ''
    this.notifyUpdate()
  }

  snapToGrid(x, y, gridSize = 20) {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    }
  }

  snapToGuideLines(x, y) {
    if (!this.guideLineType || this.guideLineType !== 'ruleOfThirds') {
      return { x, y }
    }

    const thirdWidth = this.width / 3
    const thirdHeight = this.height / 3
    const threshold = 15

    let snappedX = x
    let snappedY = y

    for (let i = 1; i <= 2; i++) {
      const lineX = thirdWidth * i
      const lineY = thirdHeight * i

      if (Math.abs(x - lineX) < threshold) {
        snappedX = lineX
      }
      if (Math.abs(y - lineY) < threshold) {
        snappedY = lineY
      }
    }

    return { x: snappedX, y: snappedY }
  }

  notifyUpdate() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this.exportData())
    }
  }

  getCanvasStateSummary() {
    return {
      elementCount: this.elements.length,
      colors: [...new Set(this.elements.map(el => el.color))],
      hasGuideLines: !!this.guideLineType,
      selectedElement: this.selectedElementId
    }
  }
}

module.exports = new CanvasEngine()
const canvasEngine = {
  canvas: null,
  ctx: null,
  elements: [],
  guideLineType: 'none',
  backgroundColor: '#FFFFFF',

  init(canvasId, width, height) {
    this.canvas = wx.createCanvasContext(canvasId)
    this.width = width
    this.height = height
    this.elements = []
    this.guideLineType = 'none'
    this.backgroundColor = '#FFFFFF'
  },

  setBackgroundColor(color) {
    this.backgroundColor = color
    this.render()
  },

  addElement(element) {
    const id = this.generateUUID()
    const newElement = {
      ...element,
      id: id,
      filters: element.filters || []
    }
    this.elements.push(newElement)
    this.render()
    return id
  },

  removeElement(elementId) {
    this.elements = this.elements.filter(el => el.id !== elementId)
    this.render()
    return true
  },

  updateElement(elementId, props) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      Object.assign(element, props)
      this.render()
      return true
    }
    return false
  },

  getElement(elementId) {
    return this.elements.find(el => el.id === elementId) || null
  },

  getAllElements() {
    return this.elements
  },

  setGuideLine(type) {
    this.guideLineType = type
    this.render()
  },

  clearGuideLine() {
    this.guideLineType = 'none'
    this.render()
  },

  applyFilter(elementId, filter) {
    const element = this.elements.find(el => el.id === elementId)
    if (element) {
      if (!element.filters.includes(filter)) {
        element.filters.push(filter)
      } else {
        element.filters = element.filters.filter(f => f !== filter)
      }
      this.render()
      return true
    }
    return false
  },

  render() {
    this.clearCanvas()
    
    this.elements.forEach(element => {
      this.drawElement(element)
    })
    
    if (this.guideLineType !== 'none') {
      this.drawGuideLines()
    }
    
    this.canvas.draw()
  },

  clearCanvas() {
    this.canvas.clearRect(0, 0, this.width, this.height)
    this.canvas.setFillStyle(this.backgroundColor)
    this.canvas.fillRect(0, 0, this.width, this.height)
  },

  drawElement(element) {
    this.canvas.save()
    
    this.canvas.translate(element.x + element.width / 2, element.y + element.height / 2)
    this.canvas.rotate(element.rotation * Math.PI / 180)
    this.canvas.translate(-element.width / 2, -element.height / 2)
    
    this.canvas.setGlobalAlpha(element.opacity)
    this.canvas.setFillStyle(element.color)
    
    if (element.type === 'rectangle') {
      this.canvas.fillRect(0, 0, element.width, element.height)
    } else if (element.type === 'circle') {
      this.canvas.beginPath()
      this.canvas.arc(element.width / 2, element.height / 2, Math.min(element.width, element.height) / 2, 0, 2 * Math.PI)
      this.canvas.fill()
    } else if (element.type === 'triangle') {
      this.canvas.beginPath()
      this.canvas.moveTo(0, element.height)
      this.canvas.lineTo(element.width / 2, 0)
      this.canvas.lineTo(element.width, element.height)
      this.canvas.closePath()
      this.canvas.fill()
    }
    
    if (element.filters && element.filters.length > 0) {
      this.applyFiltersToContext(element.filters)
    }
    
    this.canvas.restore()
  },

  applyFiltersToContext(filters) {
    filters.forEach(filter => {
      if (filter === 'blur') {
        this.canvas.setShadow(0, 0, 10, 'rgba(0, 0, 0, 0.3)')
      } else if (filter === 'grayscale') {
        this.canvas.setFillStyle('#808080')
      }
    })
  },

  drawGuideLines() {
    this.canvas.save()
    this.canvas.setStrokeStyle('rgba(33, 150, 243, 0.5)')
    this.canvas.setLineWidth(2)
    
    if (this.guideLineType === 'thirds') {
      const thirdWidth = this.width / 3
      const thirdHeight = this.height / 3
      
      this.canvas.beginPath()
      this.canvas.moveTo(thirdWidth, 0)
      this.canvas.lineTo(thirdWidth, this.height)
      this.canvas.moveTo(thirdWidth * 2, 0)
      this.canvas.lineTo(thirdWidth * 2, this.height)
      this.canvas.moveTo(0, thirdHeight)
      this.canvas.lineTo(this.width, thirdHeight)
      this.canvas.moveTo(0, thirdHeight * 2)
      this.canvas.lineTo(this.width, thirdHeight * 2)
      this.canvas.stroke()
    } else if (this.guideLineType === 'diagonal') {
      this.canvas.beginPath()
      this.canvas.moveTo(0, 0)
      this.canvas.lineTo(this.width, this.height)
      this.canvas.moveTo(this.width, 0)
      this.canvas.lineTo(0, this.height)
      this.canvas.stroke()
    } else if (this.guideLineType === 'symmetry') {
      this.canvas.beginPath()
      this.canvas.moveTo(this.width / 2, 0)
      this.canvas.lineTo(this.width / 2, this.height)
      this.canvas.stroke()
    }
    
    this.canvas.restore()
  },

  exportImage(format = 'png') {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvasId: this.canvas.canvasId,
        format: format,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  clearAll() {
    this.elements = []
    this.guideLineType = 'none'
    this.render()
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  checkCollision(x, y) {
    return this.elements.find(el => 
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    )
  },

  snapToGrid(x, y, gridSize = 20) {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    }
  }
}

module.exports = canvasEngine
const storage = require('../../utils/storage.js')
const aiService = require('../../utils/ai-service.js')
const CanvasEngine = require('../../utils/canvas-engine.js')

Page({
  data: {
    canvasWidth: 300,
    canvasHeight: 400,
    selectedColor: '#2196F3',
    selectedOpacity: 1,
    showColorPanel: false,
    showAnalysis: false,
    showChatPanel: false,
    showGuideLines: false,
    aiMessage: '',
    chatInput: '',
    chatMessages: [],
    analysisData: {
      elementCount: 0,
      colorCount: 0,
      analysis: '',
      suggestions: []
    },
    colorPalette: [
      { color: '#FF5252' }, { color: '#FF7043' }, { color: '#FFA726' }, { color: '#FFCA28' },
      { color: '#FFEB3B' }, { color: '#CDDC39' }, { color: '#8BC34A' }, { color: '#4CAF50' },
      { color: '#00E676' }, { color: '#1DE9B6' }, { color: '#64FFDA' }, { color: '#4DD0E1' },
      { color: '#4FC3F7' }, { color: '#42A5F5' }, { color: '#2196F3' }, { color: '#1E88E5' },
      { color: '#5C6BC0' }, { color: '#7E57C2' }, { color: '#9575CD' }, { color: '#AB47BC' },
      { color: '#CE93D8' }, { color: '#E1BEE7' }, { color: '#F3E5F5' }, { color: '#FFFFFF' },
      { color: '#757575' }, { color: '#616161' }, { color: '#424242' }, { color: '#212121' }
    ]
  },

  onLoad(options) {
    this.canvasEngine = new CanvasEngine()
    this.initCanvas()
    
    if (options && options.workId) {
      this.loadWork(options.workId)
    }
  },

  initCanvas() {
    const systemInfo = wx.getSystemInfoSync()
    const toolbarHeight = 120
    const bottomPadding = 20
    
    const width = systemInfo.windowWidth
    const height = systemInfo.windowHeight - toolbarHeight - bottomPadding - 44
    
    this.setData({
      canvasWidth: width,
      canvasHeight: height
    })
    
    this.canvasEngine.init(width, height, (data) => {
      this.drawCanvas(data)
    })
  },

  drawCanvas(canvasData) {
    const ctx = wx.createCanvasContext('mainCanvas')
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    
    canvasData.elements.forEach(element => {
      ctx.setFillStyle(element.color)
      ctx.globalAlpha = element.opacity || 1
      ctx.fillRect(element.x, element.y, element.width, element.height)
      
      if (element.filters && element.filters.includes('shadow')) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 5
        ctx.shadowOffsetY = 5
      }
    })
    
    ctx.draw()
  },

  onTouchStart(e) {
    const touch = e.touches[0]
    const elements = this.canvasEngine.getAllElements()
    
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (touch.x >= element.x && touch.x <= element.x + element.width &&
          touch.y >= element.y && touch.y <= element.y + element.height) {
        this.canvasEngine.selectElement(element.id)
        this.draggingElement = element.id
        this.dragOffset = {
          x: touch.x - element.x,
          y: touch.y - element.y
        }
        return
      }
    }
    
    this.canvasEngine.selectElement(null)
    this.draggingElement = null
  },

  onTouchMove(e) {
    if (!this.draggingElement) return
    
    const touch = e.touches[0]
    let newX = touch.x - this.dragOffset.x
    let newY = touch.y - this.dragOffset.y
    
    newX = Math.max(0, Math.min(newX, this.data.canvasWidth - 80))
    newY = Math.max(0, Math.min(newY, this.data.canvasHeight - 80))
    
    if (this.data.showGuideLines) {
      const snapped = this.canvasEngine.snapToGuideLines(newX, newY)
      newX = snapped.x
      newY = snapped.y
    }
    
    this.canvasEngine.updateElement(this.draggingElement, { x: newX, y: newY })
  },

  onTouchEnd() {
    if (this.draggingElement) {
      this.showAIExplanation('drag')
    }
    this.draggingElement = null
  },

  showAIExplanation(operationType) {
    const context = {
      operationType: operationType,
      elementInfo: this.canvasEngine.getSelectedElement(),
      canvasState: this.canvasEngine.getCanvasStateSummary()
    }
    
    aiService.generateExplanation(context).then((result) => {
      if (result.success) {
        this.setData({ aiMessage: result.text })
        setTimeout(() => {
          this.setData({ aiMessage: '' })
        }, 4000)
      }
    })
  },

  showColorPicker() {
    this.setData({ showColorPanel: true })
    this.hideOtherPanels()
  },

  hideColorPicker() {
    this.setData({ showColorPanel: false })
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ selectedColor: color })
  },

  onOpacityChange(e) {
    this.setData({ selectedOpacity: e.detail.value / 100 })
  },

  addElement() {
    const width = 80 + Math.random() * 40
    const height = 80 + Math.random() * 40
    const x = Math.random() * (this.data.canvasWidth - width)
    const y = Math.random() * (this.data.canvasHeight - height)
    
    this.canvasEngine.addElement({
      x,
      y,
      width,
      height,
      color: this.data.selectedColor,
      opacity: this.data.selectedOpacity
    })
    
    this.showAIExplanation('addElement')
  },

  toggleGuideLines() {
    const show = !this.data.showGuideLines
    this.setData({ showGuideLines: show })
    this.canvasEngine.setGuideLine(show ? 'ruleOfThirds' : '')
    this.showAIExplanation('guideLine')
  },

  clearCanvas() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空画布吗？',
      success: (res) => {
        if (res.confirm) {
          this.canvasEngine.clearCanvas()
        }
      }
    })
  },

  analyzeWork() {
    this.setData({ showAnalysis: true })
    this.hideOtherPanels()
    
    const canvasData = this.canvasEngine.exportData()
    aiService.analyzeWork(canvasData).then((result) => {
      if (result.success) {
        this.setData({ analysisData: result.data })
      }
    })
  },

  hideAnalysis() {
    this.setData({ showAnalysis: false })
  },

  showChat() {
    this.setData({ showChatPanel: true })
    this.hideOtherPanels()
  },

  hideChat() {
    this.setData({ showChatPanel: false })
  },

  onChatInput(e) {
    this.setData({ chatInput: e.detail.value })
  },

  sendMessage() {
    const message = this.data.chatInput.trim()
    if (!message) return
    
    const newMessages = [...this.data.chatMessages, {
      id: Date.now(),
      role: 'user',
      content: message
    }]
    
    this.setData({ 
      chatMessages: newMessages,
      chatInput: '' 
    })
    
    aiService.answerQuestion(message, {}).then((result) => {
      if (result.success) {
        this.setData({
          chatMessages: [...this.data.chatMessages, {
            id: Date.now() + 1,
            role: 'assistant',
            content: result.text
          }]
        })
      }
    })
  },

  hideOtherPanels() {
    this.setData({
      showColorPanel: false,
      showAnalysis: false,
      showChatPanel: false
    })
  },

  saveWork() {
    const user = storage.getUser()
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '保存作品',
      editable: true,
      placeholderText: '输入作品名称',
      success: (res) => {
        if (res.confirm) {
          const workName = res.content || '未命名作品'
          const canvasData = this.canvasEngine.exportData()
          
          const work = {
            userId: user.userId,
            workName,
            canvasData: JSON.stringify(canvasData),
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          
          storage.saveWork(work)
          wx.showToast({ title: '保存成功', icon: 'success' })
        }
      }
    })
  },

  loadWork(workId) {
    const user = storage.getUser()
    if (user) {
      const work = storage.getWork(user.userId, workId)
      if (work) {
        const canvasData = typeof work.canvasData === 'string' ? JSON.parse(work.canvasData) : work.canvasData
        this.canvasEngine.importData(canvasData)
      }
    }
  }
})
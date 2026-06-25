Page({
  data: {
    canvasWidth: 300,
    canvasHeight: 400,
    elements: [],
    guideLineType: 'none',
    selectedElement: null,
    showColorPicker: false,
    showBackgroundColorPicker: false,
    showChat: false,
    aiLoading: false,
    chatMessages: [],
    chatInputValue: '',
    currentColor: '#2196F3',
    canvasBackgroundColor: '#FFFFFF',
    colors: [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7',
      '#3F51B5', '#2196F3', '#00BCD4', '#009688',
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
      '#FFC107', '#FF9800', '#FF5722', '#795548',
      '#9E9E9E', '#607D8B', '#000000', '#FFFFFF'
    ],
    backgroundColors: [
      '#FFFFFF', '#F5F5F5', '#EFEFEF', '#F0F4C3',
      '#DCEDC8', '#B2EBF2', '#BBDEFB', '#E1BEE7',
      '#FFECB3', '#FFCCBC', '#CFD8DC', '#212121',
      '#424242', '#616161', '#757575', '#9E9E9E'
    ],
    shapes: ['rectangle', 'circle', 'triangle'],
    filters: ['blur', 'grayscale', 'invert', 'sepia'],
    guideLines: ['none', 'thirds', 'golden', 'diagonal', 'symmetry'],
    draggingElement: null,
    draggingHandle: null,
    dragStartX: 0,
    dragStartY: 0,
    elementStartX: 0,
    elementStartY: 0,
    elementStartWidth: 0,
    elementStartHeight: 0
  },

  onLoad(options) {
    // 优先从URL参数读取，其次从globalData读取
    const workId = options.workId || getApp().globalData.openWorkId
    if (workId) {
      this.loadWork(workId)
      // 清除globalData中的workId，避免重复加载
      getApp().globalData.openWorkId = null
    }
    this.initCanvas()
  },

  onShow() {
    // 每次显示时检查是否有新的workId传入
    const app = getApp()
    if (app.globalData.openWorkId) {
      this.loadWork(app.globalData.openWorkId)
      app.globalData.openWorkId = null
    }
  },

  initCanvas() {
    const windowInfo = wx.getWindowInfo?.() || {}
    const canvasWidth = (windowInfo.windowWidth || 300) - 40
    const canvasHeight = (windowInfo.windowHeight || 400) - 300
    this.setData({
      canvasWidth,
      canvasHeight
    })
  },

  loadWork(workId) {
    const storage = require('../../utils/storage')
    const work = storage.getWork(workId)
    if (work && work.canvasData) {
      const canvasData = typeof work.canvasData === 'string' ? JSON.parse(work.canvasData) : work.canvasData
      this.setData({
        elements: canvasData.elements || [],
        guideLineType: canvasData.guideLineType || 'none',
        canvasBackgroundColor: canvasData.canvasBackgroundColor || '#FFFFFF',
        currentWork: work
      })
    }
  },

  addElement(e) {
    const type = e.currentTarget.dataset.type
    const newElement = {
      id: this.generateUUID(),
      type: type,
      x: this.data.canvasWidth / 2 - 50,
      y: this.data.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      color: this.data.currentColor,
      opacity: 1,
      rotation: 0,
      filters: []
    }
    
    const elements = [...this.data.elements, newElement]
    this.setData({ elements })
    this.triggerAIExplanation('add', newElement)
  },

  selectElement(e) {
    const elementId = e.currentTarget.dataset.id
    const element = this.data.elements.find(el => el.id === elementId)
    this.setData({
      selectedElement: element
    })
  },

  updateElementPosition(e) {
    const { x, y } = e.detail
    const elementId = this.data.selectedElement.id
    const elements = this.data.elements.map(el => {
      if (el.id === elementId) {
        return { ...el, x, y }
      }
      return el
    })
    this.setData({ elements })
  },

  deleteElement(e) {
    const elementId = e.currentTarget.dataset.id
    const elements = this.data.elements.filter(el => el.id !== elementId)
    this.setData({
      elements,
      selectedElement: null
    })
  },

  applyFilter(e) {
    const filter = e.currentTarget.dataset.filter
    if (!this.data.selectedElement) return
    
    const elements = this.data.elements.map(el => {
      if (el.id === this.data.selectedElement.id) {
        const filters = el.filters.includes(filter)
          ? el.filters.filter(f => f !== filter)
          : [...el.filters, filter]
        return { ...el, filters }
      }
      return el
    })
    this.setData({ elements })
    this.triggerAIExplanation('filter', this.data.selectedElement)
  },

  setGuideLine(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ guideLineType: type })
    if (type !== 'none') {
      this.triggerAIExplanation('guideLine', { type })
    }
  },

  toggleColorPicker() {
    this.setData({
      showColorPicker: !this.data.showColorPicker,
      showBackgroundColorPicker: false
    })
  },

  toggleBackgroundColorPicker() {
    this.setData({
      showBackgroundColorPicker: !this.data.showBackgroundColorPicker,
      showColorPicker: false
    })
  },

  selectBackgroundColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      canvasBackgroundColor: color,
      showBackgroundColorPicker: false
    })
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      currentColor: color,
      showColorPicker: false
    })
    if (this.data.selectedElement) {
      this.updateElementColor(color)
    }
  },

  updateElementColor(color) {
    const elements = this.data.elements.map(el => {
      if (el.id === this.data.selectedElement.id) {
        return { ...el, color }
      }
      return el
    })
    this.setData({ elements })
    this.triggerAIExplanation('color', { color })
  },

  toggleChat() {
    this.setData({
      showChat: !this.data.showChat
    })
  },

  sendMessage(e) {
    const message = e.detail?.value || ''
    if (!message || !message.trim()) return
    
    this.sendChatMessageInternal(message)
  },

  onChatInput(e) {
    this.setData({
      chatInputValue: e.detail.value
    })
  },

  sendChatMessage() {
    const message = this.data.chatInputValue
    if (!message || !message.trim()) return
    
    this.sendChatMessageInternal(message)
    this.setData({ chatInputValue: '' })
  },

  sendChatMessageInternal(message) {
    const chatMessages = [...this.data.chatMessages, {
      role: 'user',
      content: message,
      timestamp: Date.now()
    }]
    
    this.setData({
      chatMessages,
      aiLoading: true
    })
    
    this.askAI(message)
  },

  analyzeWork() {
    this.setData({ aiLoading: true })
    const canvasData = {
      elements: this.data.elements,
      guideLineType: this.data.guideLineType
    }
    
    const aiService = require('../../utils/ai-service')
    aiService.analyzeWork(canvasData).then(response => {
      console.log('analyzeWork response:', response)
      wx.showModal({
        title: '作品分析',
        content: response.text,
        showCancel: false
      })
      this.setData({ aiLoading: false })
    }).catch(error => {
      console.error('analyzeWork error:', error)
      wx.showToast({
        title: '分析失败: ' + (error.message || '未知错误'),
        icon: 'error'
      })
      this.setData({ aiLoading: false })
    })
  },

  triggerAIExplanation(operationType, elementInfo) {
    const context = {
      operationType,
      elementInfo,
      canvasState: {
        elementsCount: this.data.elements.length,
        guideLineType: this.data.guideLineType
      }
    }
    
    const aiService = require('../../utils/ai-service')
    aiService.generateExplanation(context).then(response => {
      const ttsService = require('../../utils/tts-service')
      ttsService.speak(response.text)
    }).catch(error => {
      console.error('AI explanation failed:', error)
    })
  },

  askAI(question) {
    const context = {
      canvasState: {
        elements: this.data.elements,
        guideLineType: this.data.guideLineType
      },
      userQuestion: question
    }
    
    const aiService = require('../../utils/ai-service')
    aiService.answerQuestion(question, context).then(response => {
      console.log('askAI response:', response)
      const chatMessages = [...this.data.chatMessages, {
        role: 'assistant',
        content: response.text,
        timestamp: Date.now()
      }]
      this.setData({
        chatMessages,
        aiLoading: false
      })
    }).catch(error => {
      console.error('askAI error:', error)
      // 即使失败也添加一个回复，显示错误信息
      const chatMessages = [...this.data.chatMessages, {
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用。请稍后再试。',
        timestamp: Date.now()
      }]
      this.setData({
        chatMessages,
        aiLoading: false
      })
    })
  },

  saveWork() {
    const app = getApp()
    const storage = require('../../utils/storage')
    const work = {
      workId: this.data.currentWork?.workId || this.generateUUID(),
      userId: app.globalData.userId,
      workName: `作品_${new Date().toLocaleDateString()}`,
      canvasData: {
        elements: this.data.elements,
        guideLineType: this.data.guideLineType,
        canvasWidth: this.data.canvasWidth,
        canvasHeight: this.data.canvasHeight,
        canvasBackgroundColor: this.data.canvasBackgroundColor
      },
      thumbnail: '',
      createTime: this.data.currentWork?.createTime || Date.now(),
      updateTime: Date.now()
    }
    
    storage.saveWork(work)
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  clearCanvas() {
    wx.showModal({
      title: '清空画布',
      content: '确定要清空画布吗?',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            elements: [],
            selectedElement: null,
            guideLineType: 'none'
          })
        }
      }
    })
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  onElementTouchStart(e) {
    const elementId = e.currentTarget.dataset.id
    const element = this.data.elements.find(el => el.id === elementId)
    if (!element) return

    const touch = e.touches[0]
    this.setData({
      draggingElement: elementId,
      dragStartX: touch.clientX,
      dragStartY: touch.clientY,
      elementStartX: element.x,
      elementStartY: element.y,
      selectedElement: element
    })
  },

  onElementTouchMove(e) {
    if (!this.data.draggingElement && !this.data.draggingHandle) return

    if (e.preventDefault) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    
    if (this.data.draggingHandle) {
      this.handleResize(touch)
    } else {
      const deltaX = touch.clientX - this.data.dragStartX
      const deltaY = touch.clientY - this.data.dragStartY

      let newX = this.data.elementStartX + deltaX
      let newY = this.data.elementStartY + deltaY

      newX = Math.max(0, Math.min(newX, this.data.canvasWidth - this.data.selectedElement.width))
      newY = Math.max(0, Math.min(newY, this.data.canvasHeight - this.data.selectedElement.height))

      const elements = this.data.elements.map(el => {
        if (el.id === this.data.draggingElement) {
          return { ...el, x: newX, y: newY }
        }
        return el
      })

      this.setData({ 
        elements,
        selectedElement: { ...this.data.selectedElement, x: newX, y: newY }
      })
    }
  },

  onElementTouchEnd() {
    this.setData({
      draggingElement: null,
      draggingHandle: null
    })
  },

  onHandleTouchStart(e) {
    const handleType = e.currentTarget.dataset.handle
    const elementId = e.currentTarget.dataset.elementId
    
    if (!this.data.selectedElement || this.data.selectedElement.id !== elementId) {
      const element = this.data.elements.find(el => el.id === elementId)
      this.setData({ selectedElement: element })
    }

    const touch = e.touches[0]
    this.setData({
      draggingHandle: handleType,
      dragStartX: touch.clientX,
      dragStartY: touch.clientY,
      elementStartX: this.data.selectedElement.x,
      elementStartY: this.data.selectedElement.y,
      elementStartWidth: this.data.selectedElement.width,
      elementStartHeight: this.data.selectedElement.height
    })
  },

  onHandleTouchMove(e) {
    if (!this.data.draggingHandle) return
    
    if (e.preventDefault) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    this.handleResize(touch)
  },

  onHandleTouchEnd() {
    this.setData({
      draggingHandle: null
    })
  },

  handleResize(touch) {
    if (!this.data.selectedElement || !this.data.draggingHandle) return

    const handle = this.data.draggingHandle
    const rotation = this.data.selectedElement.rotation * Math.PI / 180
    
    const deltaX = touch.clientX - this.data.dragStartX
    const deltaY = touch.clientY - this.data.dragStartY

    const cos = Math.cos(-rotation)
    const sin = Math.sin(-rotation)
    
    const localDeltaX = deltaX * cos - deltaY * sin
    const localDeltaY = deltaX * sin + deltaY * cos

    let newX = this.data.elementStartX
    let newY = this.data.elementStartY
    let newWidth = this.data.elementStartWidth
    let newHeight = this.data.elementStartHeight

    const centerX = this.data.elementStartX + this.data.elementStartWidth / 2
    const centerY = this.data.elementStartY + this.data.elementStartHeight / 2

    switch (handle) {
      case 'center':
        const avgDelta = (localDeltaX + localDeltaY) / 2
        const scaleFactor = 1 + avgDelta / Math.min(this.data.elementStartWidth, this.data.elementStartHeight)
        newWidth = Math.max(20, this.data.elementStartWidth * scaleFactor)
        newHeight = Math.max(20, this.data.elementStartHeight * scaleFactor)
        const scaleDx = (newWidth - this.data.elementStartWidth) / 2
        const scaleDy = (newHeight - this.data.elementStartHeight) / 2
        newX = this.data.elementStartX - scaleDx
        newY = this.data.elementStartY - scaleDy
        break
      case 'n':
        newHeight = Math.max(20, this.data.elementStartHeight - localDeltaY)
        newY = this.data.elementStartY + (this.data.elementStartHeight - newHeight) / 2
        break
      case 's':
        newHeight = Math.max(20, this.data.elementStartHeight + localDeltaY)
        break
      case 'e':
        newWidth = Math.max(20, this.data.elementStartWidth + localDeltaX)
        break
      case 'w':
        newWidth = Math.max(20, this.data.elementStartWidth - localDeltaX)
        newX = this.data.elementStartX + (this.data.elementStartWidth - newWidth) / 2
        break
      case 'rotate':
        const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI
        let newRotation = (angle + 90 + 360) % 360
        const elements = this.data.elements.map(el => {
          if (el.id === this.data.selectedElement.id) {
            return { ...el, rotation: newRotation }
          }
          return el
        })
        this.setData({ elements })
        return
    }

    const elements = this.data.elements.map(el => {
      if (el.id === this.data.selectedElement.id) {
        return { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
      }
      return el
    })

    this.setData({ 
      elements,
      selectedElement: { ...this.data.selectedElement, x: newX, y: newY, width: newWidth, height: newHeight }
    })
  },

  onCanvasTouchStart() {
  },

  onCanvasTouchMove() {
  },

  onCanvasTouchEnd() {
  },

  onTouchMove(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }
    return false
  },

  onUnload() {
    const ttsService = require('../../utils/tts-service')
    ttsService.stop()
  }
})
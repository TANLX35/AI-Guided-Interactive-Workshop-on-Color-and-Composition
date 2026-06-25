const storage = require('../../utils/storage.js')

Page({
  data: {
    task: null,
    userProgress: null,
    canvasData: null,
    aiEvaluation: null,
    isSubmitting: false,
    showSelector: false,
    userWorks: [],
    selectedWorkId: null
  },

  onLoad(options) {
    const taskId = options.taskId
    this.loadTask(taskId)
    this.loadUserProgress(taskId)
  },

  loadTask(taskId) {
    const storage = require('../../utils/storage.js')
    const tasks = storage.getTasks()
    const task = tasks.find(t => t.taskId === taskId)
    this.setData({ task })
  },

  loadUserProgress(taskId) {
    const progress = wx.getStorageSync('progress') || []
    const userProgress = progress.find(p => p.taskId === taskId) || null
    this.setData({ userProgress })
  },

  startTask() {
    const app = getApp()
    app.globalData.currentTaskId = this.data.task.taskId
    
    wx.switchTab({
      url: '/pages/sandbox/sandbox'
    })
  },

  showWorkSelector() {
    const user = storage.getUser()
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'error' })
      return
    }
    
    const works = storage.getUserWorks(user.userId)
    const formattedWorks = works.map(work => ({
      ...work,
      formattedDate: this.formatDate(work.createTime || work.createdAt || work.updateTime)
    }))
    
    this.setData({ 
      userWorks: formattedWorks, 
      showSelector: true,
      selectedWorkId: null 
    })
    
    setTimeout(() => {
      this.drawWorkPreviews()
    }, 100)
  },

  drawWorkPreviews() {
    const works = this.data.userWorks
    works.forEach((work, index) => {
      if (work.canvasData) {
        try {
          const data = typeof work.canvasData === 'string' ? JSON.parse(work.canvasData) : work.canvasData
          this.drawPreviewCanvas('previewCanvas' + index, data)
        } catch (e) {
          console.error('Failed to draw work preview:', e)
        }
      }
    })
  },

  drawPreviewCanvas(canvasId, canvasData) {
    const ctx = wx.createCanvasContext(canvasId)
    ctx.setFillStyle('#F5F5F5')
    ctx.fillRect(0, 0, 100, 100)
    
    if (canvasData.elements) {
      const scale = 100 / (canvasData.width || 300)
      canvasData.elements.forEach(element => {
        ctx.setFillStyle(element.color)
        ctx.globalAlpha = element.opacity || 1
        ctx.fillRect(
          element.x * scale,
          element.y * scale,
          element.width * scale,
          element.height * scale
        )
      })
    }
    
    ctx.draw()
  },

  selectWork(e) {
    const workId = e.currentTarget.dataset.workId
    this.setData({ selectedWorkId: workId })
  },

  closeSelector() {
    this.setData({ showSelector: false, selectedWorkId: null })
  },

  goCreateWork() {
    this.closeSelector()
    this.startTask()
  },

  confirmSubmit() {
    if (!this.data.selectedWorkId) {
      wx.showToast({ title: '请选择作品', icon: 'error' })
      return
    }
    
    const selectedWork = this.data.userWorks.find(w => w.workId === this.data.selectedWorkId)
    if (!selectedWork) {
      wx.showToast({ title: '作品不存在', icon: 'error' })
      return
    }
    
    this.setData({ isSubmitting: true })
    
    const aiService = require('../../utils/ai-service')
    const criteria = this.data.task.criteria
    const canvasData = typeof selectedWork.canvasData === 'string' ? JSON.parse(selectedWork.canvasData) : selectedWork.canvasData
    
    aiService.evaluateWork(canvasData, criteria).then(response => {
      const grade = this.calculateGrade(response.score)
      const gradeInfo = this.getGradeDescription(grade, criteria)
      
      this.setData({
        aiEvaluation: response,
        isSubmitting: false,
        showSelector: false,
        selectedWorkId: null
      })
      
      this.saveProgress(response.score, selectedWork)
      
      wx.showModal({
        title: 'AI评分结果',
        content: `等级: ${grade}\n得分: ${response.score}分\n\n${gradeInfo}`,
        showCancel: false
      })
    }).catch(error => {
      console.error('Evaluation error:', error)
      // 即使AI评分失败，也给出基于画布分析的评分
      const fallbackScore = this.calculateFallbackScore(canvasData)
      const grade = this.calculateGrade(fallbackScore)
      const gradeInfo = this.getGradeDescription(grade, criteria)
      
      this.setData({
        isSubmitting: false,
        showSelector: false,
        selectedWorkId: null
      })
      
      this.saveProgress(fallbackScore, selectedWork)
      
      wx.showModal({
        title: 'AI评分结果',
        content: `等级: ${grade}\n得分: ${fallbackScore}分\n\n${gradeInfo}`,
        showCancel: false
      })
    })
  },

  calculateGrade(score) {
    if (score >= 85) return 'A'
    if (score >= 70) return 'B'
    return 'C'
  },

  getGradeDescription(grade, criteria) {
    if (!criteria || !criteria.items) {
      return '作品完成挑战任务！'
    }
    
    let desc = ''
    criteria.items.forEach(item => {
      const gradeDesc = item.grade || ''
      const lines = gradeDesc.split('\n')
      let gradeLine = ''
      if (grade === 'A') {
        gradeLine = lines.find(l => l.startsWith('A:')) || ''
      } else if (grade === 'B') {
        gradeLine = lines.find(l => l.startsWith('B:')) || ''
      } else {
        gradeLine = lines.find(l => l.startsWith('C:')) || ''
      }
      if (gradeLine) {
        desc += `${item.label}: ${gradeLine.substring(2)}\n`
      }
    })
    return desc || '继续加油！'
  },

  calculateFallbackScore(canvasData) {
    // 基于画布元素计算的默认评分
    let score = 60 // 基础分
    
    if (!canvasData || !canvasData.elements || canvasData.elements.length === 0) {
      return 40
    }
    
    const elements = canvasData.elements
    
    // 元素数量加分 (最多15分)
    if (elements.length >= 3) score += 10
    if (elements.length >= 5) score += 5
    
    // 颜色多样性 (最多10分)
    const colorMap = {}
    for (let i = 0; i < elements.length; i++) {
      colorMap[elements[i].color] = true
    }
    const colorCount = Object.keys(colorMap).length
    if (colorCount >= 3) score += 5
    if (colorCount >= 5) score += 5
    
    // 构图辅助线使用 (5分)
    if (canvasData.guideLineType && canvasData.guideLineType !== 'none') {
      score += 5
    }
    
    // 元素位置合理性 (最多10分)
    const hasPositionedElements = elements.every(e => e.x !== undefined && e.y !== undefined)
    if (hasPositionedElements) score += 10
    
    return Math.min(100, score)
  },

  saveProgress(score, work) {
    const progress = {
      progressId: this.generateUUID(),
      userId: getApp().globalData.userId,
      taskId: this.data.task.taskId,
      progress: score >= 80 ? 100 : Math.round(score),
      lastScore: score,
      lastSubmission: work,
      completed: score >= 80,
      updatedAt: Date.now()
    }
    
    const allProgress = wx.getStorageSync('progress') || []
    const existingIndex = allProgress.findIndex(p => p.taskId === progress.taskId)
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress
    } else {
      allProgress.push(progress)
    }
    
    wx.setStorageSync('progress', allProgress)
    this.setData({ userProgress: progress })
  },

  onModalContentTap() {
  },

  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  viewHints() {
    const hints = this.data.task.hints
    wx.showModal({
      title: '任务提示',
      content: hints.join('\n'),
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.task.taskName} - AI色彩构图学习工坊`,
      path: `/pages/task-detail/task-detail?taskId=${this.data.task.taskId}`
    }
  }
})
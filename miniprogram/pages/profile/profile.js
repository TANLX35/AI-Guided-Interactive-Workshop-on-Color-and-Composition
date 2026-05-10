const storage = require('../../utils/storage.js')

Page({
  data: {
    user: null,
    works: [],
    progressList: [],
    stats: {
      works: 0,
      completedTasks: 0,
      totalScore: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadWorks()
    this.loadProgress()
  },

  onShow() {
    this.loadWorks()
    this.loadProgress()
  },

  loadUserInfo() {
    const user = storage.getUser()
    this.setData({ user })
  },

  loadWorks() {
    const user = storage.getUser()
    if (user) {
      const works = storage.getUserWorks(user.userId)
      this.setData({ 
        works,
        stats: {
          ...this.data.stats,
          works: works.length
        }
      })
      this.drawWorkThumbnails()
    }
  },

  loadProgress() {
    const user = storage.getUser()
    if (user) {
      const progresses = storage.getUserProgress(user.userId)
      const tasks = storage.getTasks()
      
      const progressList = progresses.map(p => {
        const task = tasks.find(t => t.taskId === p.taskId)
        return {
          ...p,
          taskName: task && task.taskName ? task.taskName : '未知任务'
        }
      })
      
      const completedTasks = progressList.filter(p => p.progress >= 100).length
      const totalScore = progressList.reduce((sum, p) => sum + (p.lastScore || 0), 0)
      
      this.setData({ 
        progressList,
        stats: {
          ...this.data.stats,
          completedTasks,
          totalScore
        }
      })
    }
  },

  drawWorkThumbnails() {
    const works = this.data.works
    works.forEach((work, index) => {
      if (work.canvasData) {
        try {
          const data = typeof work.canvasData === 'string' ? JSON.parse(work.canvasData) : work.canvasData
          this.drawCanvas('workCanvas' + index, data)
        } catch (e) {
          console.error('Failed to draw work:', e)
        }
      }
    })
  },

  drawCanvas(canvasId, canvasData) {
    const ctx = wx.createCanvasContext(canvasId)
    ctx.setFillStyle('#F5F5F5')
    ctx.fillRect(0, 0, 150, 150)
    
    if (canvasData.elements) {
      canvasData.elements.forEach(element => {
        const scale = 150 / (canvasData.width || 300)
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

  openWork(e) {
    const workId = e.currentTarget.dataset.workId
    wx.navigateTo({
      url: `/pages/sandbox/sandbox?workId=${workId}`
    })
  },

  goToSandbox() {
    wx.switchTab({
      url: '/pages/sandbox/sandbox'
    })
  },

  goToTasks() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    })
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'AI全陪式色彩与构图交互学习工坊\n\n版本: 1.0.0\n\n一款帮助用户学习色彩理论与构图法则的互动学习平台。',
      showCancel: false
    })
  },

  clearData() {
    const user = storage.getUser()
    if (!user) return
    
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData(user.userId)
          this.setData({
            works: [],
            progressList: [],
            stats: { works: 0, completedTasks: 0, totalScore: 0 }
          })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
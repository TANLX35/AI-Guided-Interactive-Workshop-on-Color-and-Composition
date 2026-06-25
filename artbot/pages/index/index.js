const app = getApp()
const storage = require('../../utils/storage.js')

Page({
  data: {
    user: null,
    recentWorks: [],
    userName: '学习达人',
    welcomeText: '开始你的色彩与构图学习之旅吧！'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadRecentWorks()
  },

  onShow() {
    this.loadRecentWorks()
  },

  loadUserInfo() {
    const user = storage.getUser()
    if (user) {
      this.setData({
        user: user,
        userName: user.nickname || '学习达人'
      })
    }
  },

  loadRecentWorks() {
    const user = storage.getUser()
    if (user) {
      const works = storage.getUserWorks(user.userId) || []
      const sortedWorks = works.sort((a, b) => {
        const timeA = a.updateTime || a.createTime || 0
        const timeB = b.updateTime || b.createTime || 0
        return timeB - timeA
      })
      this.setData({
        recentWorks: sortedWorks.slice(0, 4)
      }, () => {
        // 延迟绘制缩略图，确保DOM已渲染
        setTimeout(() => this.drawWorkThumbnails(), 100)
      })
    }
  },

  drawWorkThumbnails() {
    const works = this.data.recentWorks
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
    // 绘制背景
    ctx.setFillStyle(canvasData.canvasBackgroundColor || '#F5F5F5')
    ctx.fillRect(0, 0, 200, 200)
    
    if (canvasData.elements && canvasData.elements.length > 0) {
      const scale = 200 / (canvasData.canvasWidth || 300)
      canvasData.elements.forEach(element => {
        ctx.setFillStyle(element.color)
        ctx.globalAlpha = element.opacity || 1
        const ex = element.x * scale
        const ey = element.y * scale
        const ew = element.width * scale
        const eh = element.height * scale
        
        if (element.type === 'circle') {
          // 绘制圆形
          ctx.beginPath()
          ctx.arc(ex + ew/2, ey + eh/2, Math.min(ew, eh)/2, 0, 2 * Math.PI)
          ctx.fill()
        } else if (element.type === 'triangle') {
          // 绘制三角形
          ctx.beginPath()
          ctx.moveTo(ex + ew/2, ey)
          ctx.lineTo(ex + ew, ey + eh)
          ctx.lineTo(ex, ey + eh)
          ctx.closePath()
          ctx.fill()
        } else {
          // 绘制矩形
          ctx.fillRect(ex, ey, ew, eh)
        }
      })
    }
    ctx.globalAlpha = 1
    ctx.draw()
  },

  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  goToSandbox() {
    wx.switchTab({ url: '/pages/sandbox/sandbox' })
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/tasks/tasks' })
  },

  goToKnowledge() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  openWork(e) {
    const workId = e.currentTarget.dataset.workId
    // Tab页不支持navigateTo，通过globalData传递workId
    const app = getApp()
    app.globalData.openWorkId = workId
    wx.switchTab({ url: '/pages/sandbox/sandbox' })
  }
})
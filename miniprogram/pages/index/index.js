const app = getApp()

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
    if (app.globalData.user) {
      this.setData({
        user: app.globalData.user,
        userName: app.globalData.user.nickname
      })
    }
  },

  loadRecentWorks() {
    if (app.globalData.user && app.storage) {
      const works = app.storage.getUserWorks(app.globalData.user.userId)
      this.setData({
        recentWorks: works.slice(0, 4)
      })
    }
  },

  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
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

  goToKnowledge() {
    wx.switchTab({
      url: '/pages/knowledge/knowledge'
    })
  },

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  openWork(e) {
    const workId = e.currentTarget.dataset.workId
    wx.navigateTo({
      url: `/pages/sandbox/sandbox?workId=${workId}`
    })
  }
})
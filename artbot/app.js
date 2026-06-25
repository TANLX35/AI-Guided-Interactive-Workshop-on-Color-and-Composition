App({
  globalData: {
    userInfo: null,
    userId: '',
    currentWork: null,
    openWorkId: null,
    currentTaskId: null,
    aiStatus: {
      isLoading: false,
      currentProvider: 'free',
      usage: 0
    },
    systemInfo: null
  },

  onLaunch() {
    this.initUserId()
    this.getSystemInfo()
    this.checkNetworkStatus()
    // 初始化AI服务
    try {
      const aiService = require('./utils/ai-service')
      aiService.init()
    } catch (e) {
      console.error('AI service init failed:', e)
    }
  },

  initUserId() {
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      userId = this.generateUUID()
      wx.setStorageSync('userId', userId)
    }
    this.globalData.userId = userId
  },

  getSystemInfo() {
    const deviceInfo = wx.getDeviceInfo?.() || {}
    const windowInfo = wx.getWindowInfo?.() || {}
    const appBaseInfo = wx.getAppBaseInfo?.() || {}
    this.globalData.systemInfo = {
      ...deviceInfo,
      ...windowInfo,
      ...appBaseInfo
    }
  },

  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType
      }
    })
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
})
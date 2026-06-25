const storage = require('../../utils/storage.js')

Page({
  data: {
    user: null,
    aiConfig: {
      provider: 'free',
      apiKey: '',
      endpoint: ''
    },
    providers: [
      { value: 'free', label: '免费模式', desc: '无需API Key，内置知识库' },
      { value: 'mock', label: '模拟模式', desc: '返回预设响应，开发测试' },
      { value: 'baidu', label: '百度千帆', desc: '需配置API Key' },
      { value: 'aliyun', label: '阿里通义千问', desc: '需配置API Key' },
      { value: 'tencent', label: '腾讯混元', desc: '需配置API Key' },
      { value: 'openai', label: 'OpenAI', desc: '需配置API Key和Endpoint' },
      { value: 'custom', label: '自定义API', desc: '自定义API服务' }
    ],
    showLoginModal: false,
    loginMode: 'login',
    inputFocus: '',
    loginForm: {
      nickname: '',
      password: ''
    },
    isLoggedIn: false,
    settings: {}
  },

  onLoad() {
    this.loadUserInfo()
    this.loadAIConfig()
    this.loadSettings()
  },

  loadUserInfo() {
    const user = storage.getUser()
    this.setData({ user })
  },

  loadAIConfig() {
    const aiConfig = wx.getStorageSync('aiConfig') || this.data.aiConfig
    this.setData({ aiConfig })
  },

  loadSettings() {
    const settings = storage.getSettings()
    this.setData({ settings })
  },

  switchAIProvider(e) {
    const provider = e.currentTarget.dataset.provider
    const aiConfig = { ...this.data.aiConfig, provider }
    this.setData({ aiConfig })
    wx.setStorageSync('aiConfig', aiConfig)
    wx.showToast({ title: '已切换', icon: 'success' })
  },

  updateAIConfig(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    const aiConfig = { ...this.data.aiConfig, [field]: value }
    this.setData({ aiConfig })
    wx.setStorageSync('aiConfig', aiConfig)
  },

  saveAIConfig() {
    wx.setStorageSync('aiConfig', this.data.aiConfig)
    wx.showToast({ title: '配置已保存', icon: 'success' })
  },

  toggleLoginModal() {
    const show = !this.data.showLoginModal
    this.setData({ 
      showLoginModal: show,
      loginMode: 'login',
      inputFocus: '',
      loginForm: { nickname: '', password: '' }
    })
  },

  switchToRegister() {
    this.setData({ loginMode: 'register' })
  },

  noop() {},

  onLoginInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      ['loginForm.' + field]: value
    })
  },

  register() {
    if (!this.data.loginForm.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!this.data.loginForm.password.trim()) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    const userId = wx.getStorageSync('userId') || this.generateUUID()
    const user = {
      userId: userId,
      nickname: this.data.loginForm.nickname.trim(),
      password: this.data.loginForm.password.trim(),
      registeredAt: Date.now()
    }

    storage.saveUser(user)
    wx.setStorageSync('userId', user.userId)
    
    // 同步更新全局状态
    const app = getApp()
    app.globalData.userId = user.userId
    app.globalData.userInfo = user
    
    this.setData({ 
      user, 
      isLoggedIn: true,
      showLoginModal: false 
    })
    wx.showToast({ title: '注册成功，已自动登录', icon: 'success' })
  },

  login() {
    if (!this.data.loginForm.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!this.data.loginForm.password.trim()) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    const savedUser = storage.getUser()
    if (savedUser && 
        savedUser.nickname === this.data.loginForm.nickname.trim() &&
        savedUser.password === this.data.loginForm.password.trim()) {
      
      // 同步更新全局状态
      const app = getApp()
      app.globalData.userId = savedUser.userId
      app.globalData.userInfo = savedUser
      
      this.setData({ 
        user: savedUser, 
        isLoggedIn: true,
        showLoginModal: false 
      })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } else {
      wx.showToast({ title: '昵称或密码错误，请重试', icon: 'none' })
    }
  },

  logout() {
    wx.removeStorageSync('userInfo')
    // 同步清理全局状态
    const app = getApp()
    app.globalData.userInfo = null
    this.setData({ 
      user: null, 
      isLoggedIn: false 
    })
    wx.showToast({ title: '已退出登录', icon: 'success' })
  },

  toggleTTS() {
    const settings = { ...this.data.settings, ttsEnabled: !this.data.settings.ttsEnabled }
    this.setData({ settings })
    storage.saveSettings(settings)
    wx.showToast({ 
      title: settings.ttsEnabled ? '语音讲解已开启' : '语音讲解已关闭', 
      icon: 'success' 
    })
  },

  exportData() {
    const data = storage.exportAllData()
    wx.setClipboardData({
      data: data,
      success: () => {
        wx.showToast({ title: '数据已复制', icon: 'success' })
      }
    })
  },

  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          storage.clear()
          this.setData({ 
            user: null, 
            isLoggedIn: false
          })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  goToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  goBack() {
    wx.navigateBack()
  }
})

const ttsService = {
  isPlaying: false,
  currentText: '',
  speed: 1.0,
  audioCtx: null,

  init() {
    const settings = wx.getStorageSync('settings') || {}
    this.speed = settings.ttsSpeed || 1.0
  },

  speak(text) {
    if (!text || text.trim() === '') {
      return
    }

    this.init()
    this.currentText = text
    this.isPlaying = true

    // 优先尝试使用微信内置TTS插件
    if (wx.createInnerAudioContext) {
      this.speakWithModal(text)
    } else {
      this.speakWithModal(text)
    }
  },

  speakWithModal(text) {
    // 显示讲解弹窗
    const truncatedText = text.length > 200 ? text.substring(0, 200) + '...' : text
    wx.showModal({
      title: 'AI讲解',
      content: truncatedText,
      showCancel: true,
      cancelText: '停止',
      confirmText: '关闭',
      success: (res) => {
        if (res.cancel) {
          this.stop()
        }
        this.isPlaying = false
      }
    })

    // 尝试使用 wx.getBackgroundAudioManager 或直接显示更多内容
    if (text.length > 200) {
      wx.showModal({
        title: 'AI讲解(续)',
        content: text.substring(200),
        showCancel: false,
        confirmText: '关闭'
      })
    }
  },

  stop() {
    this.isPlaying = false
    this.currentText = ''
    if (this.audioCtx) {
      try {
        this.audioCtx.stop()
        this.audioCtx.destroy()
      } catch (e) {}
      this.audioCtx = null
    }
  },

  pause() {
    this.isPlaying = false
  },

  resume() {
    if (this.currentText) {
      this.speak(this.currentText)
    }
  },

  setSpeed(speed) {
    this.speed = speed
    const settings = wx.getStorageSync('settings') || {}
    settings.ttsSpeed = speed
    wx.setStorageSync('settings', settings)
  },

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentText: this.currentText,
      speed: this.speed
    }
  },

  isEnabled() {
    const settings = wx.getStorageSync('settings') || {}
    return settings.ttsEnabled !== false
  },

  enable() {
    const settings = wx.getStorageSync('settings') || {}
    settings.ttsEnabled = true
    wx.setStorageSync('settings', settings)
  },

  disable() {
    const settings = wx.getStorageSync('settings') || {}
    settings.ttsEnabled = false
    wx.setStorageSync('settings', settings)
  }
}

module.exports = ttsService

class TTSService {
  constructor() {
    this.isPlaying = false
    this.innerAudioContext = null
  }

  speak(text) {
    if (this.isPlaying) {
      this.stop()
    }

    this.isPlaying = true
    
    wx.showToast({
      title: 'AI讲解中...',
      icon: 'none',
      duration: 3000
    })

    try {
      this.innerAudioContext = wx.createInnerAudioContext()
      this.innerAudioContext.onEnded(() => {
        this.isPlaying = false
        wx.hideToast()
      })
      this.innerAudioContext.onError(() => {
        this.isPlaying = false
        wx.hideToast()
      })
    } catch (e) {
      console.log('TTS not supported, showing text instead')
    }
  }

  stop() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop()
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
    }
    this.isPlaying = false
    wx.hideToast()
  }

  pause() {
    if (this.innerAudioContext && this.isPlaying) {
      this.innerAudioContext.pause()
    }
  }

  resume() {
    if (this.innerAudioContext) {
      this.innerAudioContext.play()
    }
  }

  isPlaying() {
    return this.isPlaying
  }
}

module.exports = new TTSService()
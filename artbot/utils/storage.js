const storage = {
  keys: {
    works: 'works',
    progress: 'progress',
    chatHistory: 'chat_history',
    settings: 'settings',
    userId: 'userId',
    startTime: 'startTime',
    aiConfig: 'aiConfig',
    userInfo: 'userInfo'
  },

  getUser() {
    const userId = this.get(this.keys.userId)
    if (!userId) return null
    
    const userInfo = this.get(this.keys.userInfo) || {}
    return {
      userId,
      ...userInfo
    }
  },

  saveUser(userInfo) {
    if (userInfo.userId) {
      this.save(this.keys.userId, userInfo.userId)
    }
    return this.save(this.keys.userInfo, userInfo)
  },

  getTasks() {
    return require('../data/tasks.json')
  },

  clearAllData(userId) {
    const works = this.get(this.keys.works) || []
    const progress = this.get(this.keys.progress) || []
    
    const filteredWorks = works.filter(w => w.userId !== userId)
    const filteredProgress = progress.filter(p => p.userId !== userId)
    
    this.save(this.keys.works, filteredWorks)
    this.save(this.keys.progress, filteredProgress)
    
    return true
  },

  save(key, data) {
    try {
      wx.setStorageSync(key, data)
      return true
    } catch (error) {
      console.error('Storage save error:', error)
      return false
    }
  },

  get(key) {
    try {
      return wx.getStorageSync(key)
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  },

  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  },

  saveWork(work) {
    const works = this.get(this.keys.works) || []
    const existingIndex = works.findIndex(w => w.workId === work.workId)
    
    if (existingIndex >= 0) {
      works[existingIndex] = work
    } else {
      works.push(work)
    }
    
    return this.save(this.keys.works, works)
  },

  getWork(workId) {
    const works = this.get(this.keys.works) || []
    return works.find(w => w.workId === workId) || null
  },

  getUserWorks(userId) {
    const works = this.get(this.keys.works) || []
    return works.filter(w => w.userId === userId)
  },

  deleteWork(workId) {
    const works = this.get(this.keys.works) || []
    const filtered = works.filter(w => w.workId !== workId)
    return this.save(this.keys.works, filtered)
  },

  saveProgress(progress) {
    const allProgress = this.get(this.keys.progress) || []
    const existingIndex = allProgress.findIndex(p => 
      p.userId === progress.userId && p.taskId === progress.taskId
    )
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress
    } else {
      allProgress.push(progress)
    }
    
    return this.save(this.keys.progress, allProgress)
  },

  getProgress(userId, taskId) {
    const allProgress = this.get(this.keys.progress) || []
    return allProgress.find(p => p.userId === userId && p.taskId === taskId) || null
  },

  getUserProgress(userId) {
    const allProgress = this.get(this.keys.progress) || []
    return allProgress.filter(p => p.userId === userId)
  },

  saveChatMessage(message) {
    const chatHistory = this.get(this.keys.chatHistory) || []
    chatHistory.push(message)
    
    if (chatHistory.length > 100) {
      chatHistory.splice(0, chatHistory.length - 100)
    }
    
    return this.save(this.keys.chatHistory, chatHistory)
  },

  getChatHistory(sessionId) {
    const chatHistory = this.get(this.keys.chatHistory) || []
    return chatHistory.filter(m => m.sessionId === sessionId)
  },

  clearChatHistory(sessionId) {
    const chatHistory = this.get(this.keys.chatHistory) || []
    const filtered = chatHistory.filter(m => m.sessionId !== sessionId)
    return this.save(this.keys.chatHistory, filtered)
  },

  saveSettings(settings) {
    return this.save(this.keys.settings, settings)
  },

  getSettings() {
    return this.get(this.keys.settings) || {
      ttsEnabled: true,
      ttsSpeed: 1.0,
      theme: 'light'
    }
  },

  exportAllData() {
    const data = {
      works: this.get(this.keys.works) || [],
      progress: this.get(this.keys.progress) || [],
      settings: this.get(this.keys.settings) || {},
      exportTime: Date.now()
    }
    return JSON.stringify(data)
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      
      if (data.works) {
        this.save(this.keys.works, data.works)
      }
      if (data.progress) {
        this.save(this.keys.progress, data.progress)
      }
      if (data.settings) {
        this.save(this.keys.settings, data.settings)
      }
      
      return true
    } catch (error) {
      console.error('Import data error:', error)
      return false
    }
  }
}

module.exports = storage
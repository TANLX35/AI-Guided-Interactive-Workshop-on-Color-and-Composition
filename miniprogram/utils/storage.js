class StorageService {
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  saveWork(work) {
    try {
      const works = this.getUserWorks(work.userId)
      const existingIndex = works.findIndex(w => w.workId === work.workId)
      
      if (existingIndex >= 0) {
        works[existingIndex] = { ...work, updatedAt: Date.now() }
      } else {
        works.push({ ...work, workId: work.workId || this.generateUUID(), createdAt: Date.now(), updatedAt: Date.now() })
      }
      
      wx.setStorageSync('works_' + work.userId, JSON.stringify(works))
      return true
    } catch (error) {
      console.error('保存作品失败:', error)
      return false
    }
  }

  getWork(userId, workId) {
    try {
      const works = this.getUserWorks(userId)
      return works.find(w => w.workId === workId) || null
    } catch (error) {
      console.error('获取作品失败:', error)
      return null
    }
  }

  getUserWorks(userId) {
    try {
      const worksStr = wx.getStorageSync('works_' + userId)
      return worksStr ? JSON.parse(worksStr) : []
    } catch (error) {
      console.error('获取用户作品列表失败:', error)
      return []
    }
  }

  deleteWork(userId, workId) {
    try {
      let works = this.getUserWorks(userId)
      works = works.filter(w => w.workId !== workId)
      wx.setStorageSync('works_' + userId, JSON.stringify(works))
      return true
    } catch (error) {
      console.error('删除作品失败:', error)
      return false
    }
  }

  saveProgress(progress) {
    try {
      const progresses = this.getUserProgress(progress.userId)
      const existingIndex = progresses.findIndex(
        p => p.userId === progress.userId && p.taskId === progress.taskId
      )
      
      if (existingIndex >= 0) {
        progresses[existingIndex] = { ...progress, updatedAt: Date.now() }
      } else {
        progresses.push({ ...progress, progressId: this.generateUUID(), updatedAt: Date.now() })
      }
      
      wx.setStorageSync('progress_' + progress.userId, JSON.stringify(progresses))
      return true
    } catch (error) {
      console.error('保存进度失败:', error)
      return false
    }
  }

  getProgress(userId, taskId) {
    try {
      const progresses = this.getUserProgress(userId)
      return progresses.find(p => p.taskId === taskId) || null
    } catch (error) {
      console.error('获取进度失败:', error)
      return null
    }
  }

  getUserProgress(userId) {
    try {
      const progressesStr = wx.getStorageSync('progress_' + userId)
      return progressesStr ? JSON.parse(progressesStr) : []
    } catch (error) {
      console.error('获取用户进度失败:', error)
      return []
    }
  }

  saveChat(message) {
    try {
      const history = this.getChatHistory(message.sessionId)
      history.push({ ...message, messageId: this.generateUUID(), timestamp: Date.now() })
      wx.setStorageSync('chat_' + message.sessionId, JSON.stringify(history))
      return true
    } catch (error) {
      console.error('保存聊天记录失败:', error)
      return false
    }
  }

  getChatHistory(sessionId) {
    try {
      const historyStr = wx.getStorageSync('chat_' + sessionId)
      return historyStr ? JSON.parse(historyStr) : []
    } catch (error) {
      console.error('获取聊天记录失败:', error)
      return []
    }
  }

  clearAllData(userId) {
    try {
      wx.removeStorageSync('works_' + userId)
      wx.removeStorageSync('progress_' + userId)
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  getTasks() {
    try {
      const tasksStr = wx.getStorageSync('tasks')
      return tasksStr ? JSON.parse(tasksStr) : []
    } catch (error) {
      console.error('获取任务失败:', error)
      return []
    }
  }

  getKnowledge() {
    try {
      const knowledgeStr = wx.getStorageSync('knowledge')
      return knowledgeStr ? JSON.parse(knowledgeStr) : { categories: [], cards: [] }
    } catch (error) {
      console.error('获取知识卡片失败:', error)
      return { categories: [], cards: [] }
    }
  }

  getUser() {
    try {
      const userStr = wx.getStorageSync('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  saveUser(user) {
    try {
      wx.setStorageSync('user', JSON.stringify(user))
      return true
    } catch (error) {
      console.error('保存用户信息失败:', error)
      return false
    }
  }
}

module.exports = new StorageService()
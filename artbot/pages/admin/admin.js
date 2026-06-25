Page({
  data: {
    isAdmin: false,
    currentSection: 'tasks',
    tasks: [],
    knowledgeCards: [],
    aiConfig: {
      provider: 'free',
      apiKey: '',
      endpoint: ''
    },
    stats: {
      totalWorks: 0,
      totalTasks: 0,
      avgScore: 0
    }
  },

  onLoad(options) {
    // 通过URL参数 ?key=admin123 进入，或开发模式下直接进入
    if (options.key === 'admin123') {
      this.setData({ isAdmin: true })
      this.loadAll()
    } else {
      wx.showModal({
        title: '管理员验证',
        content: '请输入管理员密码',
        editable: true,
        placeholderText: '密码',
        success: (res) => {
          if (res.confirm && res.content === 'admin123') {
            this.setData({ isAdmin: true })
            this.loadAll()
          } else {
            wx.showToast({ title: '密码错误', icon: 'error' })
            wx.navigateBack({ delta: 1 })
          }
        }
      })
    }
  },

  loadAll() {
    this.loadTasks()
    this.loadKnowledgeCards()
    this.loadAIConfig()
    this.loadStats()
  },

  switchSection(e) {
    const section = e.currentTarget.dataset.section
    this.setData({ currentSection: section })
  },

  loadTasks() {
    const storage = require('../../utils/storage.js')
    const tasks = storage.getTasks()
    this.setData({ tasks })
  },

  loadKnowledgeCards() {
    const knowledge = require('../../data/knowledge.json')
    this.setData({ knowledgeCards: knowledge.cards })
  },

  loadAIConfig() {
    const aiConfig = wx.getStorageSync('aiConfig') || this.data.aiConfig
    this.setData({ aiConfig })
  },

  loadStats() {
    const works = wx.getStorageSync('works') || []
    const progress = wx.getStorageSync('progress') || []
    const avgScore = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + (p.lastScore || 0), 0) / progress.length)
      : 0
    
    this.setData({
      stats: {
        totalWorks: works.length,
        totalTasks: progress.length,
        avgScore
      }
    })
  },

  addTask() {
    wx.showModal({
      title: '添加任务',
      content: '请输入任务名称',
      editable: true,
      placeholderText: '任务名称',
      success: (res) => {
        if (res.confirm && res.content) {
          const newTask = {
            taskId: this.generateUUID(),
            taskName: res.content,
            description: '新任务描述',
            difficulty: 'medium',
            criteria: {
              items: [
                { label: '色彩搭配', weight: 40 },
                { label: '构图平衡', weight: 30 },
                { label: '创意表达', weight: 30 }
              ]
            },
            hints: ['提示1', '提示2'],
            progress: 0
          }
          
          const tasks = [...this.data.tasks, newTask]
          this.setData({ tasks })
          wx.showToast({
            title: '已添加',
            icon: 'success'
          })
        }
      }
    })
  },

  editTask(e) {
    const taskId = e.currentTarget.dataset.taskId
    const task = this.data.tasks.find(t => t.taskId === taskId)
    if (!task) return
    
    wx.showModal({
      title: '编辑任务名称',
      content: `当前任务: ${task.taskName}`,
      editable: true,
      placeholderText: '输入新名称',
      success: (res) => {
        if (res.confirm && res.content) {
          const tasks = this.data.tasks.map(t => {
            if (t.taskId === taskId) {
              return { ...t, taskName: res.content }
            }
            return t
          })
          this.setData({ tasks })
          wx.showToast({ title: '已更新', icon: 'success' })
        }
      }
    })
  },

  deleteTask(e) {
    const taskId = e.currentTarget.dataset.taskId
    wx.showModal({
      title: '删除任务',
      content: '确定要删除此任务吗?',
      success: (res) => {
        if (res.confirm) {
          const tasks = this.data.tasks.filter(t => t.taskId !== taskId)
          this.setData({ tasks })
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  addKnowledgeCard() {
    wx.showModal({
      title: '添加知识卡片',
      content: '请输入卡片标题',
      editable: true,
      placeholderText: '卡片标题',
      success: (res) => {
        if (res.confirm && res.content) {
          const newCard = {
            cardId: this.generateUUID(),
            categoryId: 'color',
            categoryName: '色彩基础',
            title: res.content,
            content: '新卡片内容',
            example: null
          }
          
          const knowledgeCards = [...this.data.knowledgeCards, newCard]
          this.setData({ knowledgeCards })
          wx.showToast({
            title: '已添加',
            icon: 'success'
          })
        }
      }
    })
  },

  editKnowledgeCard(e) {
    const cardId = e.currentTarget.dataset.cardId
    const card = this.data.knowledgeCards.find(c => c.cardId === cardId)
    if (!card) return
    
    wx.showModal({
      title: '编辑卡片标题',
      content: `当前卡片: ${card.title}`,
      editable: true,
      placeholderText: '输入新标题',
      success: (res) => {
        if (res.confirm && res.content) {
          const knowledgeCards = this.data.knowledgeCards.map(c => {
            if (c.cardId === cardId) {
              return { ...c, title: res.content }
            }
            return c
          })
          this.setData({ knowledgeCards })
          wx.showToast({ title: '已更新', icon: 'success' })
        }
      }
    })
  },

  deleteKnowledgeCard(e) {
    const cardId = e.currentTarget.dataset.cardId
    wx.showModal({
      title: '删除知识卡片',
      content: '确定要删除此卡片吗?',
      success: (res) => {
        if (res.confirm) {
          const knowledgeCards = this.data.knowledgeCards.filter(c => c.cardId !== cardId)
          this.setData({ knowledgeCards })
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  updateAIConfig(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    const aiConfig = { ...this.data.aiConfig, [field]: value }
    this.setData({ aiConfig })
    wx.setStorageSync('aiConfig', aiConfig)
    
    wx.showToast({
      title: '已保存',
      icon: 'success'
    })
  },

  switchAIProvider(e) {
    const provider = e.currentTarget.dataset.provider
    const aiConfig = { ...this.data.aiConfig, provider }
    this.setData({ aiConfig })
    wx.setStorageSync('aiConfig', aiConfig)
    
    wx.showToast({
      title: '已切换',
      icon: 'success'
    })
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  logout() {
    wx.navigateBack({ delta: 1 })
  }
})
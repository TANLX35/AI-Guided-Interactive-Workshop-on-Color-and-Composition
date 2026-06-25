Page({
  data: {
    tasks: [],
    userProgress: [],
    categories: ['all', 'easy', 'medium', 'hard'],
    currentCategory: 'all'
  },

  onLoad() {
    this.loadTasks()
    this.loadUserProgress()
  },

  loadTasks() {
    const storage = require('../../utils/storage.js')
    const tasks = storage.getTasks()
    this.setData({ tasks })
  },

  loadUserProgress() {
    const progress = wx.getStorageSync('progress') || []
    this.setData({ userProgress: progress })
  },

  filterTasks(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
  },

  getFilteredTasks() {
    const { tasks, currentCategory } = this.data
    if (currentCategory === 'all') {
      return tasks
    }
    return tasks.filter(task => task.difficulty === currentCategory)
  },

  getTaskProgress(taskId) {
    const { userProgress } = this.data
    const progress = userProgress.find(p => p.taskId === taskId)
    return progress ? progress.progress : 0
  },

  openTask(e) {
    const taskId = e.currentTarget.dataset.taskId
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?taskId=${taskId}`
    })
  },

  onShareAppMessage() {
    return {
      title: '挑战任务 - AI色彩构图学习工坊',
      path: '/pages/tasks/tasks'
    }
  }
})
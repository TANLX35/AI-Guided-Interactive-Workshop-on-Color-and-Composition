const storage = require('../../utils/storage.js')

Page({
  data: {
    tasks: [],
    currentFilter: 'all',
    filterOptions: [
      { label: '全部', value: 'all' },
      { label: '简单', value: 'easy' },
      { label: '中等', value: 'medium' },
      { label: '困难', value: 'hard' }
    ],
    progressMap: {}
  },

  onLoad() {
    this.loadTasks()
    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  loadTasks() {
    const allTasks = storage.getTasks()
    this.setData({ tasks: allTasks })
  },

  loadProgress() {
    const user = storage.getUser()
    if (user) {
      const progresses = storage.getUserProgress(user.userId)
      const progressMap = {}
      progresses.forEach(p => {
        progressMap[p.taskId] = p.progress
      })
      this.setData({ progressMap })
    }
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
  },

  getDifficultyLabel(difficulty) {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return labels[difficulty] || difficulty
  },

  getTaskProgress(taskId) {
    return this.data.progressMap[taskId] || 0
  },

  goToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.taskId
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?taskId=${taskId}`
    })
  }
})
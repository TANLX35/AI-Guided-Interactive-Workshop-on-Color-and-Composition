const storage = require('../../utils/storage.js')
const aiService = require('../../utils/ai-service.js')

Page({
  data: {
    task: null,
    currentProgress: 0,
    lastScore: null
  },

  onLoad(options) {
    if (options && options.taskId) {
      this.loadTask(options.taskId)
    }
  },

  loadTask(taskId) {
    const tasks = storage.getTasks()
    const task = tasks.find(t => t.taskId === taskId)
    
    if (task) {
      this.setData({ task })
      this.loadProgress(taskId)
    }
  },

  loadProgress(taskId) {
    const user = storage.getUser()
    if (user) {
      const progress = storage.getProgress(user.userId, taskId)
      if (progress) {
        this.setData({ 
          currentProgress: progress.progress,
          lastScore: progress.lastScore 
        })
      }
    }
  },

  getDifficultyLabel(difficulty) {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return labels[difficulty] || difficulty
  },

  getRequirements() {
    const task = this.data.task
    if (!task || !task.criteria) return []
    
    const criteria = task.criteria
    const requirements = []
    
    if (criteria.colors) {
      requirements.push(`使用至少 ${criteria.colors} 种颜色`)
    }
    if (criteria.harmony) {
      requirements.push('色彩搭配和谐')
    }
    if (criteria.balance) {
      requirements.push('画面构图平衡')
    }
    if (criteria.ruleOfThirds) {
      requirements.push('运用三分构图法')
    }
    if (criteria.focalPoint) {
      requirements.push('有明确的视觉焦点')
    }
    if (criteria.complementary) {
      requirements.push('使用互补色搭配')
    }
    if (criteria.contrast) {
      requirements.push('营造适当的视觉对比')
    }
    if (criteria.composition) {
      requirements.push('综合运用多种构图法则')
    }
    if (criteria.creativity) {
      requirements.push('展现创意和个性')
    }
    if (criteria.variety) {
      requirements.push('丰富的视觉层次')
    }
    if (criteria.color) {
      requirements.push('色彩运用得当')
    }
    
    return requirements.length > 0 ? requirements : ['完成创作任务']
  },

  getScoreFeedback(score) {
    if (score >= 90) return '太棒了！完美完成！🎉'
    if (score >= 80) return '非常出色！继续加油！👍'
    if (score >= 70) return '做得不错！还有提升空间！💪'
    if (score >= 60) return '及格了！再接再厉！📈'
    return '需要继续努力哦！💡'
  },

  goToSandbox() {
    const taskId = this.data.task && this.data.task.taskId ? this.data.task.taskId : null
    wx.switchTab({
      url: '/pages/sandbox/sandbox'
    })
  },

  submitTask() {
    const user = storage.getUser()
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    wx.showModal({
      title: '提交任务',
      content: '确定要提交当前作品作为任务完成吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: 'AI评分中...' })
          
          const mockCanvasData = {
            elements: [
              { color: '#2196F3', opacity: 1 },
              { color: '#4CAF50', opacity: 1 }
            ]
          }
          
          aiService.analyzeWork(mockCanvasData).then((result) => {
            wx.hideLoading()
            
            if (result.success) {
              const score = Math.floor(Math.random() * 30) + 70
              
              storage.saveProgress({
                userId: user.userId,
                taskId: this.data.task.taskId,
                progress: score >= 60 ? 100 : 50,
                lastScore: score,
                lastSubmission: JSON.stringify(mockCanvasData)
              })
              
              wx.showModal({
                title: '评分结果',
                content: `您的作品获得了 ${score} 分！\n\n${result.data.analysis}`,
                showCancel: false,
                success: () => {
                  this.loadProgress(this.data.task.taskId)
                }
              })
            }
          })
        }
      }
    })
  }
})
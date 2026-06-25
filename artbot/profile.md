## "我的"页面布局描述

"我的"页面采用**卡片式布局**，整体分为五个主要区域：

### 1. 用户信息头部（Profile Header）
- **头像展示**：圆形背景，显示用户昵称首字母
- **用户信息**：昵称、用户ID（后8位）
- 采用蓝色渐变背景，营造层次感

### 2. 统计数据卡片（Stats Card）
- 三项核心数据：作品数、完成任务、总积分
- 横向排列，中间用分隔线隔开
- 白色卡片背景，蓝色数值突出显示

### 3. 我的作品区域（My Works）
- 作品网格展示（3列布局）
- 每个作品包含Canvas缩略图和名称
- 空状态显示引导按钮

### 4. 任务进度区域（Task Progress）
- 任务列表展示，每项包含名称和进度百分比
- 进度条采用渐变色填充
- 支持动画过渡效果

### 5. 菜单列表（Menu List）
- 设置、关于我们、清空数据三个功能入口
- 每行包含图标、文字和箭头指示

---

## 执行代码

### `profile.wxml`（布局结构）
```xml
<view class="container">
  <view class="profile-header">
    <view class="avatar-wrapper">
      <view class="avatar">{{user && user.nickname ? user.nickname.charAt(0) : '用'}}</view>
    </view>
    <view class="user-info">
      <text class="user-name">{{user && user.nickname ? user.nickname : '用户'}}</text>
      <text class="user-id">用户ID: {{user && user.userId ? user.userId.slice(-8) : '******'}}</text>
    </view>
  </view>

  <view class="stats-card">
    <view class="stat-item">
      <text class="stat-value">{{stats.works}}</text>
      <text class="stat-label">作品数</text>
    </view>
    <view class="stat-divider"></view>
    <view class="stat-item">
      <text class="stat-value">{{stats.completedTasks}}</text>
      <text class="stat-label">完成任务</text>
    </view>
    <view class="stat-divider"></view>
    <view class="stat-item">
      <text class="stat-value">{{stats.totalScore}}</text>
      <text class="stat-label">总积分</text>
    </view>
  </view>

  <view class="section">
    <text class="section-title">我的作品</text>
    <view wx:if="{{works.length > 0}}" class="works-grid">
      <view wx:for="{{works}}" wx:key="workId" class="work-item" bindtap="openWork" data-work-id="{{item.workId}}">
        <canvas class="work-thumb" canvas-id="workCanvas{{index}}" style="width: 150rpx; height: 150rpx;"></canvas>
        <text class="work-name">{{item.workName || '未命名'}}</text>
      </view>
    </view>
    <view wx:else class="empty-section">
      <text class="empty-icon">🖼️</text>
      <text class="empty-text">暂无作品</text>
      <view class="empty-action" bindtap="goToSandbox">去创作</view>
    </view>
  </view>

  <view class="section">
    <text class="section-title">任务进度</text>
    <view wx:if="{{progressList.length > 0}}" class="progress-list">
      <view wx:for="{{progressList}}" wx:key="taskId" class="progress-item">
        <view class="progress-info">
          <text class="progress-name">{{item.taskName}}</text>
          <text class="progress-percent">{{item.progress}}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" style="width: {{item.progress}}%"></view>
        </view>
      </view>
    </view>
    <view wx:else class="empty-section">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无任务进度</text>
      <view class="empty-action" bindtap="goToTasks">去挑战</view>
    </view>
  </view>

  <view class="section">
    <view class="menu-list">
      <view class="menu-item" bindtap="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" bindtap="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" bindtap="clearData">
        <text class="menu-icon">🗑️</text>
        <text class="menu-text">清空数据</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>
  </view>
</view>
```

### `profile.js`（业务逻辑）
```javascript
const storage = require('../../utils/storage.js')

Page({
  data: {
    user: null,
    works: [],
    progressList: [],
    stats: {
      works: 0,
      completedTasks: 0,
      totalScore: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadWorks()
    this.loadProgress()
  },

  onShow() {
    this.loadWorks()
    this.loadProgress()
  },

  loadUserInfo() {
    const user = storage.getUser()
    this.setData({ user })
  },

  loadWorks() {
    const user = storage.getUser()
    if (user) {
      const works = storage.getUserWorks(user.userId)
      this.setData({ 
        works,
        stats: {
          ...this.data.stats,
          works: works.length
        }
      })
      this.drawWorkThumbnails()
    }
  },

  loadProgress() {
    const user = storage.getUser()
    if (user) {
      const progresses = storage.getUserProgress(user.userId)
      const tasks = storage.getTasks()
      
      const progressList = progresses.map(p => {
        const task = tasks.find(t => t.taskId === p.taskId)
        return {
          ...p,
          taskName: task && task.taskName ? task.taskName : '未知任务'
        }
      })
      
      const completedTasks = progressList.filter(p => p.progress >= 100).length
      const totalScore = progressList.reduce((sum, p) => sum + (p.lastScore || 0), 0)
      
      this.setData({ 
        progressList,
        stats: {
          ...this.data.stats,
          completedTasks,
          totalScore
        }
      })
    }
  },

  drawWorkThumbnails() {
    const works = this.data.works
    works.forEach((work, index) => {
      if (work.canvasData) {
        try {
          const data = typeof work.canvasData === 'string' ? JSON.parse(work.canvasData) : work.canvasData
          this.drawCanvas('workCanvas' + index, data)
        } catch (e) {
          console.error('Failed to draw work:', e)
        }
      }
    })
  },

  drawCanvas(canvasId, canvasData) {
    const ctx = wx.createCanvasContext(canvasId)
    ctx.setFillStyle('#F5F5F5')
    ctx.fillRect(0, 0, 150, 150)
    
    if (canvasData.elements) {
      canvasData.elements.forEach(element => {
        const scale = 150 / (canvasData.width || 300)
        ctx.setFillStyle(element.color)
        ctx.globalAlpha = element.opacity || 1
        ctx.fillRect(
          element.x * scale,
          element.y * scale,
          element.width * scale,
          element.height * scale
        )
      })
    }
    
    ctx.draw()
  },

  openWork(e) {
    const workId = e.currentTarget.dataset.workId
    wx.navigateTo({ url: `/pages/sandbox/sandbox?workId=${workId}` })
  },

  goToSandbox() {
    wx.switchTab({ url: '/pages/sandbox/sandbox' })
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/tasks/tasks' })
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'AI全陪式色彩与构图交互学习工坊\n\n版本: 1.0.0\n\n一款帮助用户学习色彩理论与构图法则的互动学习平台。',
      showCancel: false
    })
  },

  clearData() {
    const user = storage.getUser()
    if (!user) return
    
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData(user.userId)
          this.setData({
            works: [],
            progressList: [],
            stats: { works: 0, completedTasks: 0, totalScore: 0 }
          })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
```

### `profile.wxss`（样式定义）
```css
.container {
  padding: 30rpx;
  padding-bottom: 200rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border-radius: 24rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 48rpx;
  font-weight: 600;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  display: block;
  margin-bottom: 8rpx;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #2196F3;
  display: block;
}

.section {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.works-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.work-item {
  width: calc(33.33% - 14rpx);
}

.work-thumb {
  width: 150rpx;
  height: 150rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196F3 0%, #1976D2 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #212121;
}
```

---

**设计特点**：
- 顶部用户信息区采用蓝色渐变背景，形成视觉焦点
- 统计卡片采用横向三等分布局，数据一目了然
- 作品展示采用3列网格布局，高效利用空间
- 进度条支持平滑动画过渡，提升交互体验
- 菜单列表采用列表式设计，操作入口清晰
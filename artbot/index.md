## 首页布局描述

首页采用**模块化卡片式布局**，整体分为四个主要区域：

### 1. 欢迎区域（Welcome Section）
- **Logo展示**：圆形渐变背景的Logo图标
- **标题层级**：主标题"AI全陪式色彩与构图" + 副标题"交互学习工坊" + 描述文本

### 2. 快捷操作区域（Quick Actions）
- 三个并排的操作卡片：**开始创作**、**挑战任务**、**理论快查**
- 每个卡片包含图标、标题、描述，点击跳转对应页面

### 3. 最近作品区域（Recent Works）
- 展示用户最近创作的作品（最多4个）
- 采用两列网格布局，每个作品显示缩略图、名称和日期
- 空状态显示提示信息引导用户创作

### 4. 学习指南区域（Learning Guide）
- 三步学习流程：探索沙盒画布 → 开启AI讲解 → 完成挑战任务
- 每步包含步骤序号（圆形渐变图标）、标题和描述

---

## 执行代码

### `index.wxml`（布局结构）
```xml
<view class="container">
  <view class="welcome-section">
    <view class="logo-wrapper">
      <view class="logo">
        <text class="logo-text">🎨</text>
      </view>
    </view>
    <view class="welcome-title">AI全陪式色彩与构图</view>
    <view class="welcome-subtitle">交互学习工坊</view>
    <view class="welcome-desc">通过互动实验，掌握色彩理论与构图法则</view>
  </view>

  <view class="quick-actions">
    <view class="action-card" bindtap="goToSandbox">
      <view class="action-icon">🎯</view>
      <view class="action-title">开始创作</view>
      <view class="action-desc">进入沙盒画布</view>
    </view>
    <view class="action-card" bindtap="goToTasks">
      <view class="action-icon">📋</view>
      <view class="action-title">挑战任务</view>
      <view class="action-desc">完成学习任务</view>
    </view>
    <view class="action-card" bindtap="goToKnowledge">
      <view class="action-icon">📚</view>
      <view class="action-title">理论快查</view>
      <view class="action-desc">学习专业知识</view>
    </view>
  </view>

  <view class="section">
    <view class="section-header">
      <text class="section-title">最近作品</text>
      <text class="section-more" bindtap="goToProfile">查看全部</text>
    </view>
    
    <view wx:if="{{recentWorks.length > 0}}" class="works-list">
      <view wx:for="{{recentWorks}}" wx:key="workId" class="work-item" bindtap="openWork" data-work-id="{{item.workId}}">
        <view class="work-thumb">
          <canvas class="work-canvas" canvas-id="workCanvas{{index}}" style="width: 200rpx; height: 200rpx;"></canvas>
        </view>
        <view class="work-info">
          <text class="work-name">{{item.workName || '未命名作品'}}</text>
          <text class="work-date">{{formatDate(item.createdAt)}}</text>
        </view>
      </view>
    </view>
    
    <view wx:else class="empty-state">
      <text class="empty-icon">🖼️</text>
      <text class="empty-text">暂无作品</text>
      <text class="empty-hint">快去创作你的第一幅作品吧！</text>
    </view>
  </view>

  <view class="section">
    <view class="section-header">
      <text class="section-title">学习指南</text>
    </view>
    <view class="guide-list">
      <view class="guide-item">
        <view class="guide-step">1</view>
        <view class="guide-content">
          <text class="guide-title">探索沙盒画布</text>
          <text class="guide-desc">拖拽色块，尝试不同的色彩搭配</text>
        </view>
      </view>
      <view class="guide-item">
        <view class="guide-step">2</view>
        <view class="guide-content">
          <text class="guide-title">开启AI讲解</text>
          <text class="guide-desc">操作时AI会自动讲解相关知识</text>
        </view>
      </view>
      <view class="guide-item">
        <view class="guide-step">3</view>
        <view class="guide-content">
          <text class="guide-title">完成挑战任务</text>
          <text class="guide-desc">通过任务巩固所学知识</text>
        </view>
      </view>
    </view>
  </view>
</view>
```

### `index.js`（业务逻辑）
```javascript
const app = getApp()

Page({
  data: {
    user: null,
    recentWorks: [],
    userName: '学习达人',
    welcomeText: '开始你的色彩与构图学习之旅吧！'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadRecentWorks()
  },

  onShow() {
    this.loadRecentWorks()
  },

  loadUserInfo() {
    if (app.globalData.user) {
      this.setData({
        user: app.globalData.user,
        userName: app.globalData.user.nickname
      })
    }
  },

  loadRecentWorks() {
    if (app.globalData.user && app.storage) {
      const works = app.storage.getUserWorks(app.globalData.user.userId)
      this.setData({
        recentWorks: works.slice(0, 4)
      })
    }
  },

  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  goToSandbox() {
    wx.switchTab({ url: '/pages/sandbox/sandbox' })
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/tasks/tasks' })
  },

  goToKnowledge() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  openWork(e) {
    const workId = e.currentTarget.dataset.workId
    wx.navigateTo({ url: `/pages/sandbox/sandbox?workId=${workId}` })
  }
})
```

### `index.wxss`（样式定义）
```css
.container {
  padding: 30rpx;
  padding-bottom: 180rpx;
}

.welcome-section {
  text-align: center;
  padding: 60rpx 0;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(33, 150, 243, 0.3);
}

.welcome-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #212121;
  margin-bottom: 8rpx;
}

.welcome-subtitle {
  font-size: 36rpx;
  font-weight: 600;
  color: #2196F3;
  margin-bottom: 20rpx;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin: 40rpx 0;
}

.action-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-card:active {
  transform: scale(0.96);
}

.works-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.work-item {
  width: calc(50% - 10rpx);
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.guide-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.guide-step {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 20rpx;
  flex-shrink: 0;
}
```

---

**设计特点**：
- 采用蓝色系（`#2196F3`）作为主色调，体现科技感与专业性
- 圆角卡片设计，配合阴影营造层次感
- 响应式布局，适配不同屏幕尺寸
- 操作区域支持点击反馈（`scale(0.96)`）提升交互体验
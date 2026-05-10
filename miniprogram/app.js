const StorageService = require('./utils/storage.js')
const AIService = require('./utils/ai-service.js')
const CanvasEngine = require('./utils/canvas-engine.js')
const TTSService = require('./utils/tts-service.js')

App({
  onLaunch() {
    this.initServices()
    this.initUser()
    this.loadStaticData()
  },

  initServices() {
    this.storage = StorageService
    this.aiService = AIService
    this.canvasEngine = CanvasEngine
    this.ttsService = TTSService
  },

  initUser() {
    let user = this.storage.getUser()
    if (!user) {
      const defaultUser = {
        userId: this.generateUUID(),
        nickname: '学习达人',
        preferences: {
          theme: 'light',
          ttsEnabled: true,
          ttsSpeed: 1.0
        }
      }
      this.storage.saveUser(defaultUser)
      this.globalData.user = defaultUser
    } else {
      this.globalData.user = user
    }
  },

  loadStaticData() {
    let tasks = this.storage.getTasks()
    if (!tasks || tasks.length === 0) {
      tasks = this.getDefaultTasks()
      wx.setStorageSync('tasks', JSON.stringify(tasks))
    }
    
    let knowledge = this.storage.getKnowledge()
    if (!knowledge || !knowledge.cards || knowledge.cards.length === 0) {
      knowledge = this.getDefaultKnowledge()
      wx.setStorageSync('knowledge', JSON.stringify(knowledge))
    }

    // 初始化演示作品
    if (this.globalData.user) {
      let works = this.storage.getUserWorks(this.globalData.user.userId)
      if (!works || works.length === 0) {
        const defaultWorks = this.getDefaultWorks()
        defaultWorks.forEach(work => {
          work.userId = this.globalData.user.userId
          this.storage.saveWork(work)
        })
      }
    }
  },

  getDefaultTasks() {
    return [
      {
        taskId: 'task-001',
        taskName: '色彩搭配入门',
        description: '尝试使用类似色搭配创建一个和谐的画面',
        difficulty: 'easy',
        criteria: { colors: 3, harmony: true, balance: true },
        hints: ['类似色是色相环上相邻的颜色', '尝试使用同一色系的不同深浅']
      },
      {
        taskId: 'task-002',
        taskName: '三分构图法',
        description: '利用三分线辅助线创建一个平衡的构图',
        difficulty: 'easy',
        criteria: { ruleOfThirds: true, focalPoint: true },
        hints: ['将主体放在交叉点上', '注意画面的平衡感']
      },
      {
        taskId: 'task-003',
        taskName: '互补色对比',
        description: '使用互补色创建强烈的视觉对比',
        difficulty: 'medium',
        criteria: { complementary: true, contrast: true },
        hints: ['互补色在色相环上相差180度', '红色的互补色是绿色']
      },
      {
        taskId: 'task-004',
        taskName: '色彩调和',
        description: '创建一个和谐的色彩方案',
        difficulty: 'medium',
        criteria: { harmony: true, variety: true, balance: true },
        hints: ['使用色轮来选择颜色', '注意色彩的明度和饱和度']
      },
      {
        taskId: 'task-005',
        taskName: '高级构图挑战',
        description: '综合运用多种构图法则创作作品',
        difficulty: 'hard',
        criteria: { composition: true, creativity: true, color: true },
        hints: ['尝试组合多种构图法则', '加入自己的创意元素']
      }
    ]
  },

  getDefaultKnowledge() {
    return {
      categories: [
        { categoryId: 'cat-001', name: '色彩理论', icon: 'palette' },
        { categoryId: 'cat-002', name: '构图法则', icon: 'grid' },
        { categoryId: 'cat-003', name: '设计原则', icon: 'lightbulb' }
      ],
      cards: [
        {
          cardId: 'card-001',
          categoryId: 'cat-001',
          title: '色彩三要素',
          content: '色彩具有三个基本属性：色相(Hue)、明度(Value)和饱和度(Chroma)。色相是颜色的名称，明度是颜色的明暗程度，饱和度是颜色的鲜艳程度。',
          example: '红色是一种色相，粉红色是红色降低饱和度后的效果',
          sortOrder: 1
        },
        {
          cardId: 'card-002',
          categoryId: 'cat-001',
          title: '类似色',
          content: '类似色是指在色相环上位置相邻的颜色（通常在30度范围内）。类似色搭配和谐、柔和，适合营造统一的视觉效果。',
          example: '红色、橙色、黄色是一组类似色',
          sortOrder: 2
        },
        {
          cardId: 'card-003',
          categoryId: 'cat-001',
          title: '互补色',
          content: '互补色是指在色相环上位置相对的颜色（相差180度）。互补色搭配形成强烈对比，能够产生视觉冲击力。',
          example: '红色与绿色、蓝色与橙色、黄色与紫色',
          sortOrder: 3
        },
        {
          cardId: 'card-004',
          categoryId: 'cat-002',
          title: '三分构图法',
          content: '将画面用两条水平线和两条垂直线分成九个相等的部分，将主体放在线条的交叉点上，可以使画面更加平衡和美观。',
          example: '将人物眼睛放在右上交叉点',
          sortOrder: 1
        },
        {
          cardId: 'card-005',
          categoryId: 'cat-002',
          title: '对称构图',
          content: '对称构图是指画面两侧的元素在视觉上保持平衡。这种构图方式稳定、庄重，常用于表现正式、严肃的主题。',
          example: '建筑摄影中常用对称构图',
          sortOrder: 2
        },
        {
          cardId: 'card-006',
          categoryId: 'cat-002',
          title: '引导线',
          content: '利用画面中的线条（如道路、河流、栏杆等）引导观众的视线，将注意力引向主体。引导线可以是直线也可以是曲线。',
          example: '弯曲的道路引导视线向远方',
          sortOrder: 3
        },
        {
          cardId: 'card-007',
          categoryId: 'cat-003',
          title: '对比原则',
          content: '对比是指将性质相反的元素并置，如大小、明暗、色彩、形状等，以产生视觉张力和层次感。',
          example: '深色背景上的浅色文字',
          sortOrder: 1
        },
        {
          cardId: 'card-008',
          categoryId: 'cat-003',
          title: '统一原则',
          content: '统一是指画面中的元素保持协调一致，通过重复、相似性等方式建立视觉秩序，使整体更加和谐。',
          example: '使用相同风格的图标',
          sortOrder: 2
        },
        {
          cardId: 'card-009',
          categoryId: 'cat-003',
          title: '留白原则',
          content: '留白是指画面中未被元素占据的空间。适当的留白可以让画面呼吸，突出主体，营造意境。',
          example: '极简主义设计中的大面积空白',
          sortOrder: 3
        }
      ]
    }
  },

  getDefaultWorks() {
    return [
      {
        workId: 'work-001',
        title: '夕阳美景',
        description: '使用暖色和冷色对比的示例作品',
        canvasData: JSON.stringify({
          width: 300,
          height: 400,
          elements: [
            { id: '1', type: 'rect', x: 150, y: 100, width: 280, height: 200, color: '#87CEEB', rotation: 0 },
            { id: '2', type: 'circle', x: 200, y: 100, width: 60, height: 60, color: '#FFD700', rotation: 0 },
            { id: '3', type: 'rect', x: 150, y: 300, width: 280, height: 150, color: '#90EE90', rotation: 0 },
            { id: '4', type: 'triangle', x: 100, y: 280, width: 80, height: 100, color: '#228B22', rotation: 0 },
            { id: '5', type: 'triangle', x: 200, y: 290, width: 60, height: 80, color: '#2E8B57', rotation: 0 }
          ]
        }),
        thumbnail: '',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:35:00Z',
        status: 'completed',
        tags: ['色彩对比', '风景'],
        feedback: '色彩搭配很好，暖色和冷色形成鲜明对比'
      },
      {
        workId: 'work-002',
        title: '几何构图',
        description: '展示三分构图法的示例作品',
        canvasData: JSON.stringify({
          width: 300,
          height: 400,
          elements: [
            { id: '1', type: 'circle', x: 100, y: 133, width: 50, height: 50, color: '#FF6B6B', rotation: 0 },
            { id: '2', type: 'circle', x: 200, y: 133, width: 50, height: 50, color: '#4ECDC4', rotation: 0 },
            { id: '3', type: 'circle', x: 100, y: 266, width: 50, height: 50, color: '#45B7D1', rotation: 0 },
            { id: '4', type: 'circle', x: 200, y: 266, width: 50, height: 50, color: '#96CEB4', rotation: 0 },
            { id: '5', type: 'rect', x: 150, y: 200, width: 100, height: 80, color: '#FFEAA7', rotation: 45 }
          ]
        }),
        thumbnail: '',
        createdAt: '2024-01-20T14:20:00Z',
        updatedAt: '2024-01-20T14:25:00Z',
        status: 'completed',
        tags: ['构图', '几何'],
        feedback: '很好地利用了三分法，构图平衡美观'
      },
      {
        workId: 'work-003',
        title: '我的练习作品',
        description: '创作练习作品',
        canvasData: JSON.stringify({
          width: 300,
          height: 400,
          elements: [
            { id: '1', type: 'rect', x: 150, y: 200, width: 200, height: 300, color: '#E8F5E9', rotation: 0 },
            { id: '2', type: 'circle', x: 150, y: 150, width: 80, height: 80, color: '#F48FB1', rotation: 0 },
            { id: '3', type: 'triangle', x: 150, y: 250, width: 100, height: 120, color: '#CE93D8', rotation: 0 }
          ]
        }),
        thumbnail: '',
        createdAt: '2024-01-25T09:15:00Z',
        updatedAt: '2024-01-25T09:20:00Z',
        status: 'draft',
        tags: ['练习'],
        feedback: ''
      }
    ]
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  globalData: {
    user: null,
    currentWork: null,
    aiStatus: {
      isLoading: false,
      currentProvider: 'demo',
      usage: 0
    },
    navigation: {
      currentPage: '',
      history: []
    }
  }
})
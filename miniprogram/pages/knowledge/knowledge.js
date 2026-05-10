const storage = require('../../utils/storage.js')

Page({
  data: {
    categories: [],
    cards: [],
    selectedCategoryId: '',
    currentCards: [],
    showDetail: false,
    selectedCard: null
  },

  onLoad() {
    this.loadKnowledge()
  },

  loadKnowledge() {
    const knowledge = storage.getKnowledge()
    this.setData({
      categories: knowledge.categories || [],
      cards: knowledge.cards || []
    })
    
    if (knowledge.categories.length > 0) {
      this.selectCategory({ currentTarget: { dataset: { categoryId: knowledge.categories[0].categoryId } } })
    }
  },

  getCategoryIcon(iconName) {
    const icons = {
      palette: '🎨',
      grid: '📐',
      lightbulb: '💡',
      default: '📚'
    }
    return icons[iconName] || icons.default
  },

  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.categoryId
    this.setData({ 
      selectedCategoryId: categoryId,
      currentCards: this.data.cards.filter(card => card.categoryId === categoryId)
    })
  },

  showCardDetail(e) {
    const card = e.currentTarget.dataset.card
    this.setData({ 
      selectedCard: card,
      showDetail: true 
    })
  },

  hideDetail() {
    this.setData({ showDetail: false })
  },

  stopPropagation() {
  },

  goToSandbox() {
    this.hideDetail()
    wx.switchTab({
      url: '/pages/sandbox/sandbox'
    })
  }
})
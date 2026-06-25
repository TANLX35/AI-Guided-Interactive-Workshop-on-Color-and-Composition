const app = getApp()

Page({
  data: {
    categories: [],
    knowledgeCards: [],
    filteredCards: [],
    currentCategory: null,
    searchKeyword: ''
  },

  onLoad() {
    this.loadCategories()
    this.loadKnowledgeCards()
  },

  onShow() {
    // 每次显示时刷新
    this.loadKnowledgeCards()
  },

  loadCategories() {
    const knowledge = require('../../data/knowledge.json')
    const categories = knowledge.categories
    this.setData({ categories })
  },

  loadKnowledgeCards() {
    const knowledge = require('../../data/knowledge.json')
    this.setData({ knowledgeCards: knowledge.cards, filteredCards: knowledge.cards })
  },

  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.categoryId
    this.setData({ currentCategory: categoryId }, () => this.applyFilters())
  },

  searchCards(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword }, () => this.applyFilters())
  },

  applyFilters() {
    const { knowledgeCards, currentCategory, searchKeyword } = this.data
    let filtered = knowledgeCards
    
    if (currentCategory) {
      filtered = filtered.filter(card => card.categoryId === currentCategory)
    }
    
    if (searchKeyword) {
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(searchKeyword) ||
        card.content.toLowerCase().includes(searchKeyword)
      )
    }
    
    this.setData({ filteredCards: filtered })
  },

  openCard(e) {
    const cardId = e.currentTarget.dataset.cardId
    const card = this.data.knowledgeCards.find(c => c.cardId === cardId)
    if (!card) return
    
    wx.showModal({
      title: card.title,
      content: card.content,
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: '理论快查 - AI色彩构图学习工坊',
      path: '/pages/knowledge/knowledge'
    }
  }
})
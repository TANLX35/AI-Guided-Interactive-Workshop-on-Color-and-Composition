Component({
  properties: {
    tools: {
      type: Array,
      value: [
        { id: 'color', icon: '🎨', label: '调色板' },
        { id: 'shape', icon: '▢', label: '形状' },
        { id: 'filter', icon: '✨', label: '滤镜' },
        { id: 'analyze', icon: '📊', label: '分析' },
        { id: 'chat', icon: '💬', label: '问答' }
      ]
    },
    activeTool: {
      type: String,
      value: ''
    }
  },

  methods: {
    selectTool(e) {
      const toolId = e.currentTarget.dataset.toolId
      this.triggerEvent('toolSelected', { toolId })
    }
  }
})
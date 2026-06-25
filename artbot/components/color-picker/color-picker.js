Component({
  properties: {
    currentColor: {
      type: String,
      value: '#2196F3'
    },
    colors: {
      type: Array,
      value: [
        '#F44336', '#E91E63', '#9C27B0', '#673AB7',
        '#3F51B5', '#2196F3', '#00BCD4', '#009688',
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
        '#FFC107', '#FF9800', '#FF5722', '#795548',
        '#9E9E9E', '#607D8B', '#000000', '#FFFFFF'
      ]
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    selectedColor: '#2196F3'
  },

  methods: {
    selectColor(e) {
      const color = e.currentTarget.dataset.color
      this.setData({ selectedColor: color })
      this.triggerEvent('colorSelected', { color })
    },

    closePicker() {
      this.triggerEvent('close')
    },

    onColorChange(e) {
      const color = e.detail.value
      this.setData({ selectedColor: color })
      this.triggerEvent('colorSelected', { color })
    }
  }
})
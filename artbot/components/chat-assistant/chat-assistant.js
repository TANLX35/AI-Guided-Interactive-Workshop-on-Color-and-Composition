Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    messages: {
      type: Array,
      value: []
    },
    isLoading: {
      type: Boolean,
      value: false
    }
  },

  data: {
    inputValue: ''
  },

  methods: {
    closeChat() {
      this.triggerEvent('close')
    },

    onInput(e) {
      this.setData({
        inputValue: e.detail.value
      })
    },

    sendMessage() {
      const message = this.data.inputValue.trim()
      if (!message) return
      
      this.triggerEvent('send', { message })
      this.setData({
        inputValue: ''
      })
    },

    clearMessages() {
      this.triggerEvent('clear')
    }
  }
})
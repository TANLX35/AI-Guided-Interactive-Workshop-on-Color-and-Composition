Component({
  properties: {
    type: {
      type: String,
      value: 'none'
    },
    width: {
      type: Number,
      value: 300
    },
    height: {
      type: Number,
      value: 400
    }
  },

  data: {
    guideLineTypes: ['none', 'thirds', 'golden', 'diagonal', 'symmetry']
  },

  methods: {
    selectGuideLine(e) {
      const type = e.currentTarget.dataset.type
      this.triggerEvent('guideLineSelected', { type })
    }
  }
})
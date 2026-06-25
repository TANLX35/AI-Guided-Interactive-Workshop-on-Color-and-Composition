const aiService = {
  providers: {
    baidu: {
      name: '百度千帆',
      endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
      apiKey: ''
    },
    aliyun: {
      name: '阿里通义千问',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      apiKey: ''
    },
    tencent: {
      name: '腾讯混元',
      endpoint: 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions',
      apiKey: ''
    },
    openai: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: ''
    },
    custom: {
      name: '自定义API',
      endpoint: '',
      apiKey: ''
    },
    free: {
      name: '免费模式',
      endpoint: '',
      apiKey: 'free_key'
    },
    mock: {
      name: '模拟模式',
      endpoint: '',
      apiKey: 'mock_key'
    }
  },

  currentProvider: 'free',

  init() {
    const aiConfig = wx.getStorageSync('aiConfig') || {}
    console.log('ai-service init, aiConfig:', aiConfig)
    if (aiConfig.provider) {
      this.currentProvider = aiConfig.provider
    } else {
      // 确保默认使用免费模式
      this.currentProvider = 'free'
    }
    console.log('currentProvider:', this.currentProvider)
    if (aiConfig.apiKey) {
      this.providers[this.currentProvider].apiKey = aiConfig.apiKey
    }
    if (aiConfig.endpoint) {
      this.providers[this.currentProvider].endpoint = aiConfig.endpoint
    }
  },

  switchProvider(provider) {
    this.currentProvider = provider
    wx.setStorageSync('aiConfig', {
      provider: provider,
      apiKey: this.providers[provider].apiKey,
      endpoint: this.providers[provider].endpoint
    })
  },

  generatePrompt(operationType, context) {
    if (operationType === 'add') {
      return `用户在画布上添加了一个${context.elementInfo.type}元素,颜色为${context.elementInfo.color}。请简要讲解这个操作的设计原理和色彩搭配建议。`
    }
    if (operationType === 'color') {
      return `用户将元素颜色改为${context.color}。请讲解这个颜色的特点和适用场景。`
    }
    if (operationType === 'filter') {
      return '用户对元素应用了滤镜效果。请讲解滤镜的作用和视觉效果。'
    }
    if (operationType === 'guideLine') {
      return `用户选择了${context.type}构图辅助线。请讲解这种构图法则的原理和应用方法。`
    }
    if (operationType === 'analyze') {
      return '请分析当前作品的色彩搭配、构图平衡和整体视觉效果,给出专业的评价和改进建议。'
    }
    if (operationType === 'question') {
      return `用户问题: ${context.userQuestion}\n当前画布状态: ${JSON.stringify(context.canvasState)}\n请结合画布内容给出专业建议。`
    }
    if (operationType === 'evaluate') {
      return `请根据评分标准评价用户作品:\n评分标准: ${JSON.stringify(context.criteria)}\n作品数据: ${JSON.stringify(context.canvasData)}\n给出具体分数和评价。`
    }
    return '请提供专业的设计建议。'
  },

  async callAPI(prompt) {
    const provider = this.providers[this.currentProvider]
    console.log('callAPI, currentProvider:', this.currentProvider, 'prompt:', prompt.substring(0, 50))
    
    if (this.currentProvider === 'mock') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockResponses = [
            '这是一个很好的设计选择！该颜色属于冷色调，具有平静、专业的视觉效果，适合用于科技类产品界面。搭配建议：可以与白色或浅灰色背景配合使用，形成清晰的视觉层次。',
            '三分构图法是最经典的构图法则之一。将画面分成三等分，把主体放置在分割线或交叉点上，可以使画面更加平衡和吸引人。这是摄影和设计中最常用的技巧之一。',
            '您的作品整体构图均衡，色彩搭配和谐。建议可以尝试增加一些对比色来提升视觉冲击力，同时注意元素之间的间距保持一致，这样可以使整体更加精致。',
            '滤镜效果可以为作品增添艺术感和氛围。模糊滤镜可以营造梦幻感，灰度滤镜则能突出构图和光影。建议根据作品主题选择合适的滤镜效果。',
            '圆形元素代表完整、和谐与统一，常用于传达友好、包容的品牌形象。在设计中，圆形可以与方形元素形成对比，增加视觉层次。'
          ]
          const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
          resolve({
            text: randomResponse,
            success: true
          })
        }, 1000)
      })
    }

    if (this.currentProvider === 'free') {
      console.log('calling callFreeAPI')
      return this.callFreeAPI(prompt)
    }

    if (!provider.apiKey) {
      throw new Error('请先配置AI API Key')
    }

    if (!provider.endpoint) {
      throw new Error('请先配置API端点')
    }

    const requestData = {
      messages: [
        {
          role: 'system',
          content: '你是一位专业的色彩与构图导师,擅长讲解色彩理论、构图法则和设计原理。你的回答应该简洁、专业、易于理解。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: provider.endpoint,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        data: requestData,
        success: (res) => {
          if (res.statusCode === 200) {
            const response = this.parseResponse(res.data)
            resolve(response)
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(new Error('网络请求失败'))
        }
      })
    })
  },

  async callFreeAPI(prompt) {
    const self = this
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const responseText = self.generateFreeResponse(prompt)
          resolve({
            text: responseText,
            success: true
          })
        } catch (error) {
          console.error('callFreeAPI error:', error)
          reject(error)
        }
      }, 600 + Math.random() * 600)
    })
  },

  generateFreeResponse(prompt) {
    console.log('generateFreeResponse, prompt:', prompt.substring(0, 100))
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('分析') || lowerPrompt.includes('evaluate') || lowerPrompt.includes('analyze')) {
      console.log('matched: analyze')
      return this.generateAnalysisResponse()
    }

    if (lowerPrompt.includes('用户问题') || lowerPrompt.includes('question')) {
      console.log('matched: question')
      return this.generateQuestionResponse(prompt)
    }

    if (lowerPrompt.includes('添加了一个') || lowerPrompt.includes('添加')) {
      console.log('matched: add element')
      return this.generateAddElementResponse(prompt)
    }

    if (lowerPrompt.includes('颜色') || lowerPrompt.includes('color')) {
      console.log('matched: color')
      return this.generateColorResponse(prompt)
    }

    if (lowerPrompt.includes('滤镜')) {
      console.log('matched: filter')
      return this.generateFilterResponse()
    }

    if (lowerPrompt.includes('构图辅助线') || lowerPrompt.includes('guide')) {
      console.log('matched: guideLine')
      return this.generateGuideLineResponse(prompt)
    }

    if (lowerPrompt.includes('评分') || lowerPrompt.includes('评价') || lowerPrompt.includes('score')) {
      console.log('matched: evaluation')
      return this.generateEvaluationResponse()
    }

    console.log('matched: default')
    const defaultResponses = [
      '这是一个很好的设计尝试！色彩理论告诉我们，合理的色彩搭配可以有效传达情感和信息。建议您尝试使用60-30-10配色法则：主色占60%，辅助色占30%，强调色占10%。',
      '您的创作正在逐步成型。构图方面，注意运用留白和层次感，让画面有呼吸空间。可以参考三分法构图，将重要元素放置在视觉焦点位置。',
      '设计是一个不断探索的过程。建议您多尝试不同的色彩组合和构图方式，通过对比找到最适合的表达效果。记得保存作品以便对比不同方案。',
      '色彩与构图相辅相成。好的色彩搭配可以强化构图的视觉引导，而合理的构图则能让色彩更有表现力。继续探索吧！'
    ]
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  },

  generateAnalysisResponse() {
    return '【作品分析报告】\n\n一、色彩分析\n• 色彩运用：作品中的色块组合展现了一定的色彩搭配思路\n• 建议：可以尝试增加色彩的层次感，通过明度和饱和度的变化创造视觉深度\n• 技巧：参考60-30-10配色法则，主色60%、辅助色30%、强调色10%\n\n二、构图分析\n• 构图布局：元素分布具有一定的设计意图\n• 建议：注意画面的视觉平衡，可以运用三分法或黄金分割来优化布局\n• 技巧：将最重要的元素放在视觉焦点位置，引导观者视线\n\n三、整体评价\n• 整体效果：作品展现了基本的设计思维\n• 优点：敢于尝试不同的色彩和造型\n• 改进空间：可以进一步细化元素之间的关系，增强整体的统一性\n\n四、改进建议\n1. 调整元素大小比例，形成明确的视觉层次\n2. 增加留白，让画面更加透气\n3. 尝试使用辅助线检查构图平衡\n4. 考虑色彩的情感表达是否符合作品主题\n\n继续练习，您的设计能力会不断提升！'
  },

  generateQuestionResponse(prompt) {
    let question = ''
    // 多种方式提取用户问题
    const questionMatch = prompt.match(/用户问题[:：]\s*(.+?)(?:\n|$)/)
    if (questionMatch) {
      question = questionMatch[1].trim()
    } else {
      // 尝试从 prompt 中直接提取
      const lines = prompt.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes('用户问题') || line.startsWith('问题')) {
          question = line.replace(/用户问题[:：]?|问题[:：]?/, '').trim()
          break
        }
      }
    }

    // 如果无法提取问题，使用 prompt 本身
    if (!question) {
      question = prompt.substring(0, 100)
    }

    const q = question.toLowerCase()

    if (q.includes('平衡') || q.includes('均衡')) {
      return '关于画面平衡的问题，这是一个很好的思考点！\n\n画面平衡是构图的基本原则之一。以下是几个实用技巧：\n\n1. 对称平衡：将元素沿中轴线对称分布，给人稳定、庄重的感觉\n2. 不对称平衡：通过元素的视觉重量（大小、颜色、位置）来达到平衡\n3. 视觉重量：深色、大尺寸、高饱和度的元素视觉重量更重\n4. 留白平衡：空白区域也有视觉重量，合理运用留白\n\n建议您尝试调整当前画布中元素的位置，看看哪种布局让您感觉最舒适。可以开启三分线辅助线来帮助判断。'
    }

    if (q.includes('配色') || q.includes('搭配') || q.includes('颜色')) {
      return '关于色彩搭配的问题，非常好的提问！\n\n以下是几种经典的配色方案供您参考：\n\n1. 类似色搭配：色相环上相邻的颜色（如蓝-蓝绿-绿），效果和谐宁静\n2. 互补色搭配：色相环上相对的颜色（如红-绿、蓝-橙），对比强烈\n3. 三色组搭配：色相环上等距的三种颜色，丰富而平衡\n4. 单色搭配：同一色相的不同明度和饱和度，简洁统一\n\n建议您从类似色开始练习，这是最容易掌握的配色方法。然后再尝试互补色来增强视觉冲击力。'
    }

    if (q.includes('三分') || q.includes('构图')) {
      return '关于三分法构图的问题，这是最经典也最实用的构图法则！\n\n三分法构图的原理：\n1. 将画面横向和纵向各分为三等份\n2. 形成九个格子和四条分割线\n3. 四个交叉点是视觉焦点位置\n4. 将重要元素放在分割线或交叉点上\n\n为什么三分法有效？\n• 符合人类视觉习惯\n• 避免对称的呆板感\n• 创造动态的视觉张力\n• 留出更多呼吸空间\n\n您可以在画布中开启"三分线"辅助线，尝试将重要色块放在交叉点位置，感受一下不同的视觉效果！'
    }

    if (q.includes('黄金') || q.includes('螺旋')) {
      return '关于黄金螺旋构图的问题，这是一种非常优美的构图方式！\n\n黄金螺旋基于斐波那契数列（1, 1, 2, 3, 5, 8, 13...），具有自然的美感。\n\n黄金螺旋的特点：\n1. 从中心向外螺旋扩展\n2. 每一圈的比例约为1:1.618（黄金比例）\n3. 引导视线从外向内或从内向外流动\n4. 常见于自然（海螺、向日葵、星系等）\n\n在设计中的应用：\n• 将最重要的元素放在螺旋中心或转折点\n• 沿螺旋线排列元素，创造流动感\n• 用黄金比例分割画面空间\n\n您可以尝试开启"黄金螺旋"辅助线，将色块沿着螺旋线放置，感受自然的韵律之美！'
    }

    if (q.includes('什么是') || q.includes('类似色')) {
      return '类似色是指在色相环上相邻的颜色，它们之间的色相差在30度以内。\n\n常见的类似色组合：\n• 红-橙红-橙（暖色系类似色）\n• 黄-黄绿-绿（清新自然的类似色）\n• 蓝-蓝紫-紫（神秘优雅的类似色）\n• 绿-蓝绿-蓝（宁静冷冽的类似色）\n\n类似色的特点：\n优点：和谐、统一、柔和、易于搭配\n缺点：对比弱，可能显得单调\n\n使用技巧：\n1. 通过明度和饱和度的变化增加层次\n2. 加入少量互补色作为点缀\n3. 注意控制色彩数量，一般3-5种为宜\n\n类似色非常适合营造宁静、和谐的氛围，是初学者的好选择！'
    }

    if (q.includes('互补色') || q.includes('对比')) {
      return '互补色是指在色相环上位置相对的两种颜色，它们的色相差约为180度。\n\n经典互补色组合：\n• 红色 ↔ 绿色（经典的自然对比）\n• 蓝色 ↔ 橙色（冷暖强烈对比）\n• 黄色 ↔ 紫色（明度和色相对比）\n\n互补色的特点：\n优点：对比强烈、视觉冲击力强、醒目\n缺点：搭配不当容易刺眼、冲突\n\n使用技巧：\n1. 面积法则：一种颜色占大面积（70-80%），另一种作为点缀（20-30%）\n2. 降低饱和度：让其中一种或两种颜色都变得柔和一些\n3. 用中性色分隔：加入黑、白、灰来缓冲对比\n\n互补色是创造视觉焦点和强烈印象的利器，但需要谨慎使用！'
    }

    return '这是一个很好的问题！关于您提到的"' + (question || '设计') + '"，我来为您解答。\n\n在色彩与构图的学习中，建议遵循以下原则：\n\n1. 从基础开始：先理解色相、明度、饱和度三要素\n2. 多观察分析：看看优秀的设计作品是如何运用色彩和构图的\n3. 动手实践：在沙盒中多尝试，实践是最好的老师\n4. 对比总结：保存不同方案的作品，对比分析优缺点\n\n如果您有具体的问题，欢迎继续提问！或者您可以告诉我当前画布的情况，我来给您更有针对性的建议。'
  },

  generateAddElementResponse(prompt) {
    let elementType = '元素'
    let color = ''

    const typeMatch = prompt.match(/添加了一个(\S+?)元素/)
    if (typeMatch) elementType = typeMatch[1]

    const colorMatch = prompt.match(/颜色为(\S+?)。/)
    if (colorMatch) color = colorMatch[1]

    const typeName = {
      'rectangle': '矩形',
      'circle': '圆形',
      'triangle': '三角形'
    }[elementType] || elementType

    const colorMeanings = {
      '#F44336': '红色代表热情、活力和力量，是最醒目的颜色。常用于吸引注意力或表达强烈情感。',
      '#E91E63': '粉色代表温柔、甜美和浪漫，给人温暖舒适的感觉。常用于女性化或柔和的设计。',
      '#9C27B0': '紫色代表神秘、高贵和创意，兼具红色的热情和蓝色的冷静。常用于艺术或奢华主题。',
      '#3F51B5': '靛蓝色代表深邃、稳重和智慧，给人可靠的感觉。常用于科技或专业领域。',
      '#2196F3': '蓝色代表信任、平静和专业，是最受欢迎的商务色。常用于企业和科技产品。',
      '#00BCD4': '青色代表清新、冷静和现代感，是蓝色和绿色的完美结合。给人清爽的感觉。',
      '#009688': '墨绿色代表自然、稳重和高级感，是非常有品质感的颜色。常用于高端设计。',
      '#4CAF50': '绿色代表自然、生命和希望，给人平静放松的感觉。常用于环保或健康主题。',
      '#FF9800': '橙色代表活力、温暖和创意，是红色和黄色的混合色。给人热情友好的印象。',
      '#FFC107': '黄色代表阳光、快乐和希望，是最明亮的颜色。常用于吸引注意或表达愉悦。',
      '#795548': '棕色代表自然、质朴和可靠，给人温暖踏实的感觉。常用于自然或传统主题。',
      '#9E9E9E': '灰色代表中性、稳重和现代，是最百搭的颜色。常用于背景或文字。',
      '#000000': '黑色代表力量、优雅和神秘，是永恒的经典色。常用于高端或简约设计。',
      '#FFFFFF': '白色代表纯净、简洁和空间感，给人呼吸的余地。是设计中不可或缺的留白。'
    }

    const colorInfo = colorMeanings[color] || color + ' 是一种很有特色的颜色，可以根据主题灵活运用。'

    return '您添加了一个' + typeName + '元素，' + colorInfo + '\n\n设计小贴士：\n• ' + typeName + '在构图中有不同的视觉效果\n• 可以尝试调整大小和位置来改变视觉重量\n• 与其他颜色搭配时，注意色彩的和谐与对比\n\n继续探索吧！'
  },

  generateColorResponse(prompt) {
    const colorMatch = prompt.match(/颜色改为(\S+?)。/)
    const color = colorMatch ? colorMatch[1] : ''

    const colorKnowledge = {
      '#F44336': '红色（#F44336）：属于暖色系，色轮上最醒目的颜色之一。视觉心理学研究表明，红色能加速心跳、提升注意力。适合用于需要强调的重要元素，但大面积使用可能让人疲劳。',
      '#2196F3': '蓝色（#2196F3）：属于冷色系，是最受欢迎的颜色之一。蓝色传达信任、专业和平静的感觉。科技公司和金融机构常用蓝色作为品牌色。',
      '#4CAF50': '绿色（#4CAF50）：是自然和生命的象征。绿色给人放松、舒适的感觉，对眼睛非常友好。常用于环保、健康、自然相关的设计。',
      '#FFC107': '黄色（#FFC107）：是所有颜色中最明亮的，代表阳光和快乐。黄色能快速吸引注意力，但大面积使用可能引起视觉疲劳。',
      '#FF9800': '橙色（#FF9800）：介于红色和黄色之间，既有红色的热情又有黄色的明亮。橙色代表活力、友好和创造力，非常有亲和力。',
      '#9C27B0': '紫色（#9C27B0）：历史上是最昂贵的颜色之一，象征高贵和神秘。紫色兼具红色的热情和蓝色的冷静，给人独特的艺术感。',
      '#00BCD4': '青色（#00BCD4）：是蓝色和绿色的混合色，既有蓝色的冷静又有绿色的清新。青色代表现代、科技和清爽，给人干净利落的感觉。',
      '#795548': '棕色（#795548）：是大地的颜色，代表自然、质朴和可靠。棕色给人温暖、踏实的感觉，常用于自然风格或传统设计。',
      '#9E9E9E': '灰色（#9E9E9E）：是中性色的代表，非常百搭。灰色不抢戏，能很好地衬托其他颜色。在现代简约设计中大量使用。',
      '#000000': '黑色（#000000）：是所有颜色的集合，代表力量、优雅和神秘。黑色与任何颜色搭配都很和谐，是高端设计的常用色。',
      '#FFFFFF': '白色（#FFFFFF）：代表纯净、简洁和空间感。留白是设计中非常重要的技巧，白色给画面呼吸的空间，让重要元素更加突出。'
    }

    if (colorKnowledge[color]) {
      return colorKnowledge[color]
    }
    
    return '您选择了' + color + '这个颜色，很好的选择！\n\n每个颜色都有其独特的性格和情感含义。尝试将不同颜色组合在一起，看看会产生什么样的化学反应吧！'
  },

  generateFilterResponse() {
    return '滤镜效果可以为您的作品增添独特的艺术氛围！\n\n常用滤镜效果介绍：\n\n1. 模糊（Blur）\n• 效果：让图像变得柔和朦胧\n• 用途：营造梦幻感、突出焦点、背景虚化\n• 设计应用：可以用来模拟景深效果\n\n2. 灰度（Grayscale）\n• 效果：去除色彩，只保留明暗层次\n• 用途：突出构图和光影、复古效果\n• 设计应用：当你想专注于构图时可以使用\n\n3. 反色（Invert）\n• 效果：颜色翻转，如白变黑、红变青\n• 用途：创意效果、特殊视觉冲击\n• 设计应用：可以产生强烈的视觉对比\n\n4. 复古（Sepia）\n• 效果：暖褐色调，像老照片\n• 用途：怀旧感、历史感、文艺气息\n• 设计应用：营造复古、经典的氛围\n\n建议您尝试不同的滤镜组合，看看哪种效果最符合作品的主题和情感！'
  },

  generateGuideLineResponse(prompt) {
    let type = ''
    const typeMatch = prompt.match(/选择了(\S+?)构图辅助线/)
    if (typeMatch) type = typeMatch[1]

    const guideLineInfo = {
      'thirds': '三分法构图是最经典也最实用的构图法则！\n\n原理：\n• 将画面横向和纵向各分为三等份\n• 形成九个格子和四条分割线\n• 四个交叉点是视觉焦点\n\n为什么有效：\n• 符合人类视觉习惯\n• 避免对称的呆板感\n• 创造动态的视觉张力\n\n练习建议：\n将重要元素放在交叉点位置，\n或者沿分割线排列，\n感受画面平衡的变化。',

      'golden': '黄金螺旋是一种非常优美的构图方式！\n\n原理：\n• 基于斐波那契数列（1, 1, 2, 3, 5, 8...）\n• 每一圈比例约为1:1.618（黄金比例）\n• 从中心向外螺旋扩展\n\n自然中的黄金螺旋：\n• 海螺壳的纹理\n• 向日葵的种子排列\n• 星系的旋臂\n\n设计应用：\n• 将重要元素放在螺旋中心\n• 沿螺旋线排列元素创造流动感',

      'diagonal': '对角线构图可以增加画面的动态感！\n\n特点：\n• 从画面一角延伸到对角\n• 引导视线沿线条移动\n• 比水平线/垂直线更有活力\n\n使用技巧：\n• 主对角线：从左上到右下或右上到左下\n• 可以是显性的线条，也可以是隐性的视觉引导\n• 对角线交叉点也是视觉焦点\n\n适合表现：\n• 运动、速度感\n• 不稳定感（有意为之）\n• 强烈的视觉冲击',

      'symmetry': '对称构图传达稳定、庄重的感觉！\n\n对称的类型：\n• 左右对称：沿垂直轴对称\n• 上下对称：沿水平轴对称\n• 中心对称：围绕中心点旋转对称\n\n特点：\n优点：稳定、平衡、庄重、秩序感\n缺点：可能显得呆板、缺少变化\n\n使用建议：\n• 完全对称适合表达正式、庄重\n• 轻微打破对称可以增加趣味\n• 对称 + 一个不对称元素 = 焦点'
    }

    return guideLineInfo[type] || '构图辅助线是设计的好帮手，可以帮助您更好地安排画面元素。选择适合的辅助线，开始您的创作吧！'
  },

  generateEvaluationResponse() {
    return '根据您的作品，以下是详细评价：\n\n【色彩运用】评分：82分\n• 色彩选择有一定的设计思路\n• 建议增加色彩的层次变化\n• 可以尝试运用60-30-10配色法则\n\n【构图布局】评分：78分\n• 元素分布基本合理\n• 建议注意视觉平衡\n• 可以参考三分法优化布局\n\n【创意表现】评分：85分\n• 有自己的想法和风格\n• 敢于尝试不同的组合\n• 继续保持探索精神\n\n【综合评价】等级：B\n总分：82分\n\n作品展现了良好的设计基础和创意思维。色彩搭配和谐，构图基本合理。\n\n改进建议：\n1. 加强元素之间的视觉联系\n2. 注意留白的运用\n3. 可以尝试更多样的色彩组合\n\n继续努力，您的设计水平会不断提升！'
  },

  parseResponse(data) {
    if (this.currentProvider === 'baidu') {
      return {
        text: data.result || '',
        success: true
      }
    } else if (this.currentProvider === 'aliyun') {
      return {
        text: data.output?.text || '',
        success: true
      }
    } else if (this.currentProvider === 'tencent') {
      return {
        text: data.choices?.[0]?.message?.content || '',
        success: true
      }
    } else if (this.currentProvider === 'openai') {
      return {
        text: data.choices?.[0]?.message?.content || '',
        success: true
      }
    } else if (this.currentProvider === 'custom') {
      return {
        text: data.choices?.[0]?.message?.content || data.result || data.output?.text || '',
        success: true
      }
    } else if (this.currentProvider === 'free') {
      return {
        text: data.text || '',
        success: true
      }
    } else if (this.currentProvider === 'mock') {
      return {
        text: data.text || '',
        success: true
      }
    }
    
    return {
      text: '',
      success: false,
      error: '无法解析响应'
    }
  },

  async generateExplanation(context) {
    this.init()
    const prompt = this.generatePrompt(context.operationType, context)
    return await this.callAPI(prompt)
  },

  async analyzeWork(canvasData) {
    this.init()
    const prompt = this.generatePrompt('analyze', { canvasData })
    return await this.callAPI(prompt)
  },

  async answerQuestion(question, context) {
    this.init()
    const prompt = this.generatePrompt('question', context)
    return await this.callAPI(prompt)
  },

  async evaluateWork(canvasData, criteria) {
    this.init()
    const prompt = this.generatePrompt('evaluate', { canvasData, criteria })
    const response = await this.callAPI(prompt)
    
    const scoreMatch = response.text.match(/(\d+)/)
    let score = 70
    
    if (scoreMatch) {
      score = parseInt(scoreMatch[1])
    } else if (this.currentProvider === 'free' || this.currentProvider === 'mock') {
      score = this.calculateLocalScore(canvasData)
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      comment: response.text,
      details: criteria.items ? criteria.items.map(item => ({
        label: item.label,
        score: Math.round(score * (item.weight || 25) / 100)
      })) : []
    }
  },

  calculateLocalScore(canvasData) {
    let score = 60
    
    if (!canvasData || !canvasData.elements || canvasData.elements.length === 0) {
      return 40
    }
    
    const elements = canvasData.elements
    
    if (elements.length >= 3) score += 10
    if (elements.length >= 5) score += 5
    
    const colorMap = {}
    for (let i = 0; i < elements.length; i++) {
      colorMap[elements[i].color] = true
    }
    const colorCount = Object.keys(colorMap).length
    if (colorCount >= 3) score += 5
    if (colorCount >= 5) score += 5
    
    if (canvasData.guideLineType && canvasData.guideLineType !== 'none') {
      score += 5
    }
    
    const hasPositionedElements = elements.every(e => e.x !== undefined && e.y !== undefined)
    if (hasPositionedElements) score += 10
    
    return Math.min(100, score)
  }
}

module.exports = aiService

module.exports = {
  "categories": [
    {
      "categoryId": "color",
      "name": "色彩基础",
      "icon": "🎨",
      "description": "色彩理论基础知识"
    },
    {
      "categoryId": "relation",
      "name": "色彩关系",
      "icon": "🌈",
      "description": "色彩搭配与关系"
    },
    {
      "categoryId": "emotion",
      "name": "色彩情感",
      "icon": "❤️",
      "description": "色彩心理学与情感表达"
    },
    {
      "categoryId": "composition",
      "name": "构图法则",
      "icon": "📐",
      "description": "构图原理与技巧"
    },
    {
      "categoryId": "hierarchy",
      "name": "视觉层次",
      "icon": "👁️",
      "description": "视觉层次与对比"
    }
  ],
  "cards": [
    {
      "cardId": "card-001",
      "categoryId": "color",
      "categoryName": "色彩基础",
      "title": "三原色",
      "content": "三原色是指不能通过其他颜色混合得到的基本颜色。在传统色彩理论中,三原色包括红、黄、蓝。三原色可以混合出其他所有颜色。",
      "example": {
        "colors": ["#F44336", "#FFEB3B", "#2196F3"],
        "description": "红、黄、蓝三原色示例"
      }
    },
    {
      "cardId": "card-002",
      "categoryId": "color",
      "categoryName": "色彩基础",
      "title": "色相、饱和度、明度",
      "content": "色彩有三个基本属性:\n1. 相(Hue):颜色的基本类型,如红、蓝、绿等\n2. 饱和度(Saturation):颜色的纯度,饱和度越高颜色越鲜艳\n3. 明度(Value/Brightness):颜色的明暗程度",
      "example": null
    },
    {
      "cardId": "card-003",
      "categoryId": "relation",
      "categoryName": "色彩关系",
      "title": "互补色",
      "content": "互补色是指在色相环上相对位置的两种颜色,如红-绿、蓝-橙、黄-紫。互补色搭配可以产生强烈的对比效果,增强视觉冲击力。",
      "example": {
        "colors": ["#F44336", "#4CAF50"],
        "description": "红-绿互补色示例"
      }
    },
    {
      "cardId": "card-004",
      "categoryId": "relation",
      "categoryName": "色彩关系",
      "title": "类似色",
      "content": "类似色是指在色相环上相邻的颜色,如红-橙-黄、蓝-蓝绿-绿。类似色搭配可以营造和谐、统一的视觉效果,适合表现宁静、柔和的氛围。",
      "example": {
        "colors": ["#F44336", "#FF9800", "#FFEB3B"],
        "description": "红-橙-黄类似色示例"
      }
    },
    {
      "cardId": "card-005",
      "categoryId": "relation",
      "categoryName": "色彩关系",
      "title": "三色组",
      "content": "三色组是指在色相环上等距离分布的三种颜色,如红-黄-蓝、橙-绿-紫。三色组搭配可以产生丰富的色彩变化,同时保持平衡。",
      "example": {
        "colors": ["#F44336", "#FFEB3B", "#2196F3"],
        "description": "红-黄-蓝三色组示例"
      }
    },
    {
      "cardId": "card-006",
      "categoryId": "emotion",
      "categoryName": "色彩情感",
      "title": "暖色与冷色",
      "content": "暖色调包括红、橙、黄及其变体,给人温暖、热情、活力的感觉。冷色调包括蓝、绿、紫及其变体,给人冷静、宁静、沉稳的感觉。",
      "example": {
        "warmColors": ["#F44336", "#FF9800", "#FFEB3B"],
        "coolColors": ["#2196F3", "#4CAF50", "#9C27B0"],
        "description": "暖色与冷色对比示例"
      }
    },
    {
      "cardId": "card-007",
      "categoryId": "emotion",
      "categoryName": "色彩情感",
      "title": "色彩心理学",
      "content": "不同颜色可以引发不同的心理反应:\n红色:热情、活力、危险\n蓝色:冷静、信任、专业\n绿色:自然、健康、和平\n黄色:快乐、希望、警示\n紫色:神秘、高贵、创意",
      "example": null
    },
    {
      "cardId": "card-008",
      "categoryId": "composition",
      "categoryName": "构图法则",
      "title": "三分法",
      "content": "三分法是最常用的构图法则之一。将画面分为3×3的网格,将重要元素放置在网格线的交叉点上,可以让画面更加平衡和有吸引力。",
      "example": {
        "guideLine": "thirds",
        "description": "三分法构图示例"
      }
    },
    {
      "cardId": "card-009",
      "categoryId": "composition",
      "categoryName": "构图法则",
      "title": "黄金螺旋",
      "content": "黄金螺旋基于斐波那契数列和黄金比例(约1:1.618)。螺旋线从中心向外扩展,引导视觉流动。将重要元素沿着螺旋线放置,可以创造自然的视觉引导。",
      "example": {
        "guideLine": "golden",
        "description": "黄金螺旋构图示例"
      }
    },
    {
      "cardId": "card-010",
      "categoryId": "composition",
      "categoryName": "构图法则",
      "title": "对称与平衡",
      "content": "对称构图可以创造稳定、庄重的感觉。平衡构图通过元素的分布来达到视觉平衡,可以是完全对称或近似对称。平衡是构图的基本要求。",
      "example": {
        "guideLine": "symmetry",
        "description": "对称构图示例"
      }
    },
    {
      "cardId": "card-011",
      "categoryId": "hierarchy",
      "categoryName": "视觉层次",
      "title": "前景与背景",
      "content": "通过前景和背景的区分可以创造视觉层次。前景元素通常更清晰、更大,背景元素通常更模糊、更小。层次感可以让画面更有深度。",
      "example": null
    },
    {
      "cardId": "card-012",
      "categoryId": "hierarchy",
      "categoryName": "视觉层次",
      "title": "大小对比",
      "content": "通过元素大小的对比可以突出重点。大的元素更容易吸引注意力,小的元素可以作为辅助。合理的大小对比可以引导视觉焦点。",
      "example": null
    }
  ]
}

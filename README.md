[README.md](https://github.com/user-attachments/files/29348757/README.md)
# AI全陪式色彩与构图交互学习工坊

## 项目概述

这是一个基于微信小程序的互动学习平台,旨在通过高互动性的视觉实验沙盒,帮助用户直观学习色彩理论与构图法则。系统集成云端AI智能体,提供"操作-讲解-反馈-问答"的全流程伴随式学习体验。

## 项目结构

```
artbot/
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 全局样式文件
├── project.config.json    # 项目配置文件
├── sitemap.json           # 小程序索引配置
├── pages/                 # 页面目录
│   ├── index/             # 首页
│   ├── sandbox/           # 沙盒画布页(核心功能)
│   ├── tasks/             # 任务列表页
│   ├── task-detail/       # 任务详情页
│   ├── knowledge/         # 理论快查页
│   ├── profile/           # 个人中心页
│   └── admin/             # 管理员后台
├── components/            # 组件目录
│   ├── color-picker/      # 调色板组件
│   ├── chat-assistant/    # 聊天助手组件
│   ├── tool-bar/          # 工具栏组件
│   └── guide-lines/       # 辅助线组件
├── utils/                 # 工具模块
│   ├── ai-service.js      # AI服务封装
│   ├── storage.js         # 本地存储工具
│   ├── canvas-engine.js   # 画布引擎
│   └── tts-service.js     # TTS服务
├── data/                  # 静态数据
│   ├── tasks.json         # 初始任务数据
│   └── knowledge.json     # 初始知识卡片
└── images/                # 图片资源(需要添加)
    ├── home.png           # 首页图标
    ├── home-active.png    # 首页激活图标
    ├── sandbox.png        # 沙盒图标
    ├── sandbox-active.png # 沙盒激活图标
    ├── tasks.png          # 任务图标
    ├── tasks-active.png   # 任务激活图标
    ├── knowledge.png      # 理论图标
    ├── knowledge-active.png # 理论激活图标
    ├── profile.png        # 个人中心图标
    └── profile-active.png # 个人中心激活图标
```

## 核心功能模块

### 1. 互动实验沙盒
- 提供画布区域,用户可自由拖拽色块、调整形状
- 支持多种构图辅助线(三分法、黄金螺旋、对角线、对称轴)
- 支持滤镜效果应用
- 支持撤销/重做操作

### 2. AI智能讲解
- 用户操作时自动触发语音讲解
- 点击"分析"按钮可对当前作品进行结构化点评
- 使用微信内置TTS接口

### 3. 智能问答助手
- 侧边栏聊天界面
- 用户可随时输入自然语言问题
- AI结合当前画布内容给出建议

### 4. 挑战任务
- 系统发布具有明确目标的创作任务
- 用户完成创作后由AI进行评分与评价
- 任务难度分级(入门、初级、中级、高级)

### 5. 理论快查
- 结构化展示色彩关系、构图法则等知识卡片
- 与沙盒操作联动
- 支持搜索和分类浏览

## 技术栈

- **前端框架**: 微信小程序原生开发
- **图形引擎**: Canvas API
- **AI服务**: 百度千帆/阿里通义千问/腾讯混元(云端API)
- **TTS引擎**: 微信小程序内置TTS接口
- **数据存储**: 微信小程序本地Storage

## 开发环境搭建

### 1. 安装微信开发者工具
下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2. 导入项目
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 输入AppID(可使用测试号)

### 3. 配置AI服务
1. 注册百度千帆/阿里通义千问/腾讯混元账号
2. 创建应用并获取API Key
3. 在管理员后台配置API Key

### 4. 添加图标资源
在images目录中添加以下图标文件(建议尺寸:81×81像素):
- home.png / home-active.png
- sandbox.png / sandbox-active.png
- tasks.png / tasks-active.png
- knowledge.png / knowledge-active.png
- profile.png / profile-active.png

## 使用说明

### 用户端
1. 首页:查看欢迎信息和功能导航
2. 沙盒页:进行创作实验,体验AI讲解
3. 任务页:查看和完成挑战任务
4. 理论页:查阅知识卡片
5. 个人中心:查看统计和设置

### 管理员端
1. 访问管理员后台(密码:admin123)
2. 管理任务库:添加、编辑、删除任务
3. 管理知识卡片:添加、编辑、删除卡片
4. 配置AI服务:切换服务商、设置API参数
5. 查看统计数据

## 数据存储

所有数据存储在微信小程序本地Storage中:
- 作品数据:works
- 任务进度:progress
- 聊天记录:chat_history
- 用户设置:settings
- AI配置:aiConfig

## 后续开发建议

1. **完善AI集成**:实现真实的AI API调用
2. **优化画布引擎**:实现更流畅的拖拽和渲染
3. **增加滤镜效果**:实现更多滤镜类型
4. **完善评分系统**:优化AI评分算法
5. **增加分享功能**:支持作品分享到微信
6. **性能优化**:减少内存占用,提高响应速度

## 测试要点

1. **功能测试**:测试所有页面和功能模块
2. **性能测试**:测试画布响应时间、AI响应时间
3. **兼容性测试**:在不同设备和微信版本上测试
4. **用户体验测试**:邀请用户试用并收集反馈

## 注意事项

1. AI功能需要网络连接
2. 需要配置真实的AI API Key才能使用AI功能
3. 图标文件需要手动添加到images目录
4. 建议在真机上测试以获得最佳体验

## 版本信息

- 版本: V1.0
- 创建日期: 2026-06-24
- 项目编号: PRJ-2026-001
- 学号: 2408090601018
- 班级: 数字媒体技术2401

## 许可证

本项目仅供学习和研究使用。

# DreamCatcher LLM前后端集成指南

## 🚀 概述

本文档介绍如何将DreamCatcher的LLM后端与React前端进行集成，实现完整的AI助手功能。

## 📋 前端功能

### 1. 全局AI助手浮动按钮
- 位置：所有页面右下角
- 功能：快速打开AI对话框
- 快捷键：`Alt + A`
- 状态指示：绿色圆点表示服务正常，红色表示异常

### 2. 专门的LLM页面 (`/ai`)
提供完整的AI功能界面：
- **智能对话**：多轮对话功能
- **文本生成**：基于提示词生成内容
- **文本嵌入**：生成文本向量
- **模型信息**：查看可用模型和服务状态

### 3. 上下文感知聊天
- 在计划详情页面，AI助手会自动获取当前计划信息
- 提供针对性的摄影建议和分析

## 🛠️ 技术架构

### 前端组件结构
```
src/
├── components/
│   ├── LLMChat/          # 聊天对话组件
│   │   └── LLMChat.jsx
│   └── AIAssistant/      # 浮动助手按钮
│       └── AIAssistant.jsx
├── pages/
│   └── LLMPage/          # 专门的LLM页面
│       └── LLMPage.jsx
├── services/
│   └── api.js            # API服务层
└── config/
    └── api.js            # API配置
```

### 后端API接口
- `GET /api/v1/llm/models` - 获取模型列表
- `POST /api/v1/llm/chat` - 聊天对话
- `POST /api/v1/llm/generate` - 文本生成
- `POST /api/v1/llm/embeddings` - 文本嵌入
- `GET /api/v1/llm/health` - 健康检查

## 🔧 配置步骤

### 1. 启动后端服务

```bash
# 切换到服务端目录
cd DreamCatcher-Server-Headless

# 配置环境变量
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"

# 启动服务
python script/run_llm.py
```

### 2. 启动前端应用

```bash
# 切换到客户端目录
cd DreamCatcher-Client

# 安装依赖（如果尚未安装）
npm install

# 启动开发服务器
npm run dev
```

### 3. 验证连接

访问 `http://localhost:5173/ai` 查看LLM页面，或点击右下角的AI助手按钮。

## 🎯 使用方法

### 1. 基础聊天
1. 点击右下角的🤖按钮或访问`/ai`页面
2. 在输入框中输入问题
3. 按Enter发送或点击发送按钮
4. AI会实时回复，支持流式输出

### 2. 摄影助手功能
```javascript
// 示例对话
用户: "我想拍摄日出，有什么建议吗？"
AI: "拍摄日出的建议：
1. 时间安排：提前30分钟到达拍摄地点
2. 器材准备：三脚架、渐变滤镜、广角镜头
3. 参数设置：ISO100-400，小光圈F8-F11
4. 构图技巧：利用前景增加层次感
..."
```

### 3. 计划分析
在计划详情页面使用AI助手时，AI会自动了解当前计划并提供针对性建议。

### 4. 文本生成
在LLM页面的"文本生成"标签页：
1. 输入提示词，如"写一篇关于夜景摄影的教程"
2. 点击"生成文本"
3. AI会生成相关内容

## 🔧 高级配置

### 1. 自定义API地址
编辑 `src/config/api.js`：
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://your-backend:8000/api/v1',
    timeout: 10000,
  }
};
```

### 2. 错误处理
所有API调用都包含完善的错误处理：
- 网络错误自动重试
- 超时控制（默认10秒）
- 友好的错误信息提示

### 3. 模型切换
用户可以在聊天界面或LLM页面选择不同的AI模型：
- GPT-3.5 Turbo（默认）
- GPT-4
- GPT-4 Turbo

## 🎨 UI/UX特性

### 1. 响应式设计
- 聊天界面适配桌面和移动设备
- 自动滚动到最新消息
- 流式输出实时显示

### 2. 用户体验优化
- 输入框支持Shift+Enter换行
- 加载状态指示
- 一键清空对话
- 快捷键支持

### 3. 视觉效果
- 渐变色主题
- 动画过渡效果
- 状态指示器
- 响应式布局

## 🐛 故障排除

### 1. AI助手无响应
- 检查后端服务是否运行：`curl http://localhost:8000/api/v1/llm/health`
- 确认OpenAI API密钥配置正确
- 查看浏览器控制台错误信息

### 2. 跨域问题
后端已配置CORS允许所有来源：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 流式输出问题
确保前端正确处理SSE流：
- 检查网络连接
- 确认Content-Type设置正确
- 验证数据格式

## 📝 扩展开发

### 1. 添加新的AI功能
1. 在后端添加新的API接口
2. 在前端服务层添加对应方法
3. 创建UI组件调用新功能

### 2. 自定义聊天组件
继承或修改`LLMChat`组件：
```jsx
import LLMChat from './components/LLMChat/LLMChat';

const CustomChat = () => {
  return (
    <LLMChat 
      planContext={planData}
      customPrompts={['分析这个计划', '推荐器材']}
    />
  );
};
```

### 3. 集成其他AI服务
修改后端的`LLMService`类以支持其他AI提供商：
- Anthropic Claude
- Google Gemini
- 本地Ollama模型

## 🚀 部署建议

### 1. 生产环境配置
- 使用HTTPS协议
- 配置API域名
- 启用API限流
- 设置日志监控

### 2. 性能优化
- 启用API响应缓存
- 使用CDN加速静态资源
- 优化聊天记录存储

### 3. 安全考虑
- 实施用户认证
- 限制API调用频率
- 过滤敏感内容

## 📞 技术支持

如遇到问题，请查看：
1. 后端API文档：`http://localhost:8000/docs`
2. 项目Issue页面
3. 开发者社区

---

通过以上步骤，你就可以在DreamCatcher前端中完整使用LLM AI助手功能了！🎉 
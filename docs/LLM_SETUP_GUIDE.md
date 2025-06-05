# LLM服务配置指南

## 🚨 重要提示

目前LLM功能无法正常使用是因为**缺少API密钥配置**。需要按照以下步骤进行配置。

## 配置步骤

### 1. 创建环境配置文件

在 `DreamCatcher-Server-Headless` 目录下创建 `.env` 文件：

```bash
cd ../DreamCatcher-Server-Headless
touch .env
```

### 2. 配置API密钥

编辑 `.env` 文件，添加以下配置（选择其中一种方案）：

#### 方案1: OpenAI API（推荐）

```bash
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dreamcatcher

# 渲染器配置  
RENDERER_WS_URL=ws://localhost:9000/ws

# OpenAI API配置
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# 其他配置
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
LOG_LEVEL=INFO
```

**获取OpenAI API Key：**
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 注册并登录账户
3. 创建新的API密钥
4. 复制密钥替换上面的 `sk-your-openai-api-key-here`

#### 方案2: DeepSeek API（更便宜）

```bash
# 其他配置同上...

# DeepSeek API配置
OPENAI_API_KEY=sk-your-deepseek-api-key-here
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

**获取DeepSeek API Key：**
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册账户并充值
3. 创建API密钥
4. 替换配置中的API key

#### 方案3: 月之暗面 Kimi（国内服务）

```bash
# 其他配置同上...

# Kimi API配置
OPENAI_API_KEY=sk-your-moonshot-api-key-here
OPENAI_BASE_URL=https://api.moonshot.cn/v1
```

**获取Kimi API Key：**
1. 访问 [月之暗面平台](https://platform.moonshot.cn/)
2. 注册并实名认证
3. 创建API密钥
4. 替换配置中的API key

#### 方案4: Ollama 本地部署（完全免费）

```bash
# 其他配置同上...

# Ollama配置
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
```

**安装Ollama：**
1. 访问 [Ollama官网](https://ollama.ai/) 下载安装
2. 安装完成后运行：
   ```bash
   ollama pull llama2
   # 或者
   ollama pull qwen:7b
   ```
3. 启动Ollama服务：
   ```bash
   ollama serve
   ```

### 3. 启动后端服务

```bash
cd ../DreamCatcher-Server-Headless

# 安装依赖
pip install -r requirements.txt

# 启动服务
./script/run.sh
```

### 4. 验证配置

服务启动后，可以测试LLM功能：

```bash
# 测试健康检查
curl -X GET "http://localhost:8000/api/v1/llm/health"

# 测试模型列表
curl -X GET "http://localhost:8000/api/v1/llm/models"

# 测试聊天功能
curl -X POST "http://localhost:8000/api/v1/llm/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "你好"}], "model": "gpt-3.5-turbo"}'
```

## 成本对比

| 服务 | 价格 | 优点 | 缺点 |
|------|------|------|------|
| **OpenAI** | $0.002/1K tokens | 质量最高，生态完善 | 价格较高，需要国外账户 |
| **DeepSeek** | $0.0001/1K tokens | 便宜20倍，中文友好 | 相对较新 |
| **Kimi** | ¥0.012/1K tokens | 国内服务，支付方便 | 价格中等 |
| **Ollama** | 免费 | 完全免费，数据私有 | 需要本地GPU，速度较慢 |

## 推荐配置

### 开发测试阶段
- 使用 **Ollama** 本地部署，完全免费
- 或使用 **DeepSeek**，成本极低

### 生产环境
- 对质量要求高：**OpenAI**
- 成本控制优先：**DeepSeek**
- 国内部署：**Kimi**

## 故障排除

### 常见问题

1. **API key 无效**
   - 检查API key是否正确复制
   - 确认账户余额充足
   - 验证API key权限

2. **网络连接问题**
   - 国内用户访问OpenAI可能需要代理
   - 尝试使用国内服务如DeepSeek或Kimi

3. **服务启动失败**
   - 检查.env文件格式是否正确
   - 确认数据库连接正常
   - 查看服务日志排查错误

### 调试命令

```bash
# 查看环境变量
cat .env

# 检查服务状态
curl http://localhost:8000/health

# 查看服务日志
tail -f logs/app.log
```

## 安全提醒

1. **保护API密钥**
   - 不要将API key提交到代码仓库
   - 定期更换API密钥
   - 设置API调用限制

2. **成本控制**
   - 设置API调用预算上限
   - 监控API使用量
   - 合理设置token限制

---

配置完成后，DreamCatcher的AI助手功能就可以正常使用了！🎉 
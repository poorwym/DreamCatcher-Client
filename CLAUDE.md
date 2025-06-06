---
description: 
globs: 
alwaysApply: true
---
use tailwindcss for all style
use material ui when possible
always include src/asset/style.css in all file that need css or style

design style

这个网页整体展现出一种极具科技感与宇宙氛围的视觉设计风格，以下是对其各方面风格的详细描述：

⸻

🎨 配色风格（Color Style）
•	主色调：深邃的黑色背景营造出宇宙太空感，增强沉浸式阅读体验。
•	强调色：使用高对比度的白色与金属蓝色字体与元素进行信息突出，形成鲜明对比。
•	辅助色：出现少量星球橙棕色作为星体纹理点缀，增加视觉层次。

色彩总体低饱和、冷峻克制，辅以星球纹理的自然色彩，形成科技与自然的融合。

⸻

🖋️ 排版风格（Typography）
•	字体风格：使用现代感强的无衬线字体，字形简洁干练。
•	字号层次：标题（如“JUPITER”）极大，强调视觉冲击；正文字体对比较小，增强层级感。
•	排版特征：
•	大标题对齐居中或左对齐，体现结构感；
•	章节序号（如“01”“02”）采用特大号，作为视觉锚点；
•	小号文字排列规整，常搭配细线分隔。

排版注重信息节奏控制与视觉导流，兼顾科技感与内容的可读性。

⸻

📐 布局风格（Layout）
•	模块化：页面清晰划分为 Overview、Features、Moons 等若干段落，结构清晰。
•	响应式倾向：排版呈纵向滚动信息流，利于响应式适配。
•	对称与非对称结合：内容区多使用大图搭配文字说明，左图右文或上下结构灵活切换。

整体结构规整不呆板，排布错落有致，强化视觉引导。

⸻

🧩 图像与图标风格（Graphics）
•	图像使用：
•	使用高分辨率的NASA 宇宙图像，如木星表面旋涡、卫星、太空站等；
•	图像风格写实逼真，增强科学性与视觉震撼力。
•	图标元素：小图标风格简洁线性，配合图文说明信息展示。

图像与排版结合紧密，成为信息传递的主角而非装饰。

⸻

🌀 动效与交互风格（Animation / Interaction）

（由于为静态截图，具体动效无法确认，但从设计风格推测如下）：
•	应会有平滑的滚动动画与元素淡入淡出过渡；
•	章节切换可能有parallax 滚动特效或星球旋转等交互动画；
•	按钮等互动元素应为极简透明按钮或悬浮发光效果。

整体动效应服务于强化宇宙科普的沉浸感，简洁不炫技。

⸻

🌌 整体氛围与风格定位（Tone & Mood）
•	关键词：太空感、科技感、沉浸感、理性美
•	风格定位：融合科普与艺术气质的高端视觉表达，既有科学严谨性，也有视觉冲击力。

整体风格如同 NASA 的太空任务展示页，兼顾科普性与设计美感，适合用于展示天文、科技、教育类内容。

⸻

📄 推荐描述语（可直接用于文档）

本页面采用深色太空背景，结合高质量天文图像和极简排版，营造出沉浸式的科技探索氛围。通过层次分明的排版、金属质感的色彩组合以及模块化结构，展现出一种既理性又富有视觉冲击的设计风格，完美适配一个摄影网站

---
description:
globs:
alwaysApply: false
---
# DreamCatcher API 文档

## 概述

DreamCatcher是一个拍照辅助工具的后端API，提供用户认证、拍摄计划管理和LLM聊天功能。

**基础URL**: `http://localhost:8000/api/v1`

## 认证方式

API使用Bearer Token认证。在请求头中包含：
```
Authorization: Bearer <your_token>
```

## API端点

### 认证相关 (`/auth`)

#### 1. 用户注册
```http
POST /auth/register
```

**请求体**:
```json
{
  "user_name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "用户名",
  "email": "user@example.com",
  "message": "注册成功",
  "success": true
}
```

**说明**:
- user_name: 1-50个字符
- password: 6-100个字符

#### 2. 用户登录
```http
POST /auth/login
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "user": {
    "user_id": "uuid",
    "user_name": "用户名",
    "email": "user@example.com"
  },
  "access_token": "jwt_token",
  "token_type": "bearer",
  "message": "登录成功",
  "success": true
}
```

#### 3. 获取当前用户信息
```http
GET /auth/me
```

**需要认证**: ✅

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "用户名",
  "email": "user@example.com"
}
```

#### 4. 获取当前用户详细信息
```http
GET /auth/me/detail
```

**需要认证**: ✅

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "用户名",
  "email": "user@example.com",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### 5. 更新当前用户信息
```http
PUT /auth/me
```

**需要认证**: ✅

**请求体**:
```json
{
  "user_name": "新用户名",
  "email": "new@example.com",
  "password": "newpassword123"
}
```

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "新用户名",
  "email": "new@example.com"
}
```

#### 6. 修改密码
```http
POST /auth/change-password
```

**需要认证**: ✅

**请求体**:
```json
{
  "old_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**响应**:
```json
{
  "message": "密码修改成功",
  "success": true
}
```

#### 7. 根据ID获取用户信息
```http
GET /auth/user/{user_id}
```

**需要认证**: ✅

**路径参数**:
- `user_id`: 用户UUID

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "用户名",
  "email": "user@example.com"
}
```

#### 8. 验证令牌
```http
POST /auth/verify-token
```

**需要认证**: ✅

**响应**:
```json
{
  "user_id": "uuid",
  "user_name": "用户名",
  "email": "user@example.com"
}
```

### LLM聊天 (`/llm`)

#### 1. LLM聊天
```http
POST /llm/chat
```

**需要认证**: ✅

**请求体**:
```json
{
  "query": "用户的问题或请求"
}
```

**响应**:
```json
{
  "response": "LLM的回复内容",
  "success": true,
  "message": "请求处理成功"
}
```

**支持的功能**:
- 查询拍摄计划
- 创建新的拍摄计划
- 获取地点经纬度
- 查询天气信息
- 获取当前时间

#### 2. 检查LLM服务状态
```http
GET /llm/health
```

**响应**:
```json
{
  "status": "healthy",
  "service": "LLM Chat Service",
  "message": "LLM服务运行正常"
}
```

### 拍摄计划管理 (`/plans`)

#### 1. 获取指定拍摄计划
```http
GET /plans/{plan_id}
```

**需要认证**: ✅

**路径参数**:
- `plan_id`: 计划UUID

**响应**:
```json
{
  "plan_id": "uuid",
  "user_id": "uuid",
  "title": "计划标题",
  "description": "计划描述",
  "location": "拍摄地点",
  "scheduled_time": "2023-12-25T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### 2. 获取拍摄计划列表
```http
GET /plans/
```

**需要认证**: ✅

**查询参数**:
- `skip`: 跳过的记录数（默认0）
- `limit`: 限制返回数量（默认100）

**响应**:
```json
[
  {
    "plan_id": "uuid",
    "user_id": "uuid",
    "title": "计划标题",
    "description": "计划描述",
    "location": "拍摄地点",
    "scheduled_time": "2023-12-25T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

#### 3. 创建拍摄计划
```http
POST /plans/
```

**需要认证**: ✅

**请求体**:
```json
{
  "title": "计划标题",
  "description": "计划描述",
  "location": "拍摄地点",
  "scheduled_time": "2023-12-25T10:00:00Z"
}
```

**响应**:
```json
{
  "plan_id": "uuid",
  "user_id": "uuid",
  "title": "计划标题",
  "description": "计划描述",
  "location": "拍摄地点",
  "scheduled_time": "2023-12-25T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### 4. 更新拍摄计划
```http
PATCH /plans/{plan_id}
```

**需要认证**: ✅

**路径参数**:
- `plan_id`: 计划UUID

**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "location": "新地点",
  "scheduled_time": "2023-12-26T10:00:00Z"
}
```

**响应**:
```json
{
  "plan_id": "uuid",
  "user_id": "uuid",
  "title": "新标题",
  "description": "新描述",
  "location": "新地点",
  "scheduled_time": "2023-12-26T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

#### 5. 删除拍摄计划
```http
DELETE /plans/{plan_id}
```

**需要认证**: ✅

**路径参数**:
- `plan_id`: 计划UUID

**响应**: HTTP 204 No Content

#### 6. 管理员获取所有计划
```http
GET /plans/admin/all
```

**需要认证**: ✅
**权限要求**: 管理员（暂未实现权限检查）

**查询参数**:
- `user_id`: 筛选特定用户的计划（可选）
- `skip`: 跳过的记录数（默认0）
- `limit`: 限制返回数量（默认100）

**响应**:
```json
[
  {
    "plan_id": "uuid",
    "user_id": "uuid",
    "title": "计划标题",
    "description": "计划描述",
    "location": "拍摄地点",
    "scheduled_time": "2023-12-25T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

## 错误响应

所有API端点在出错时会返回以下格式的错误响应：

```json
{
  "detail": "错误详细信息",
  "status_code": 400
}
```

### 常见错误代码

- `400 Bad Request`: 请求参数无效
- `401 Unauthorized`: 未提供有效的认证令牌
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `422 Unprocessable Entity`: 请求格式正确但内容无效
- `500 Internal Server Error`: 服务器内部错误
- `503 Service Unavailable`: 服务不可用

## 注意事项

1. 所有时间字段使用ISO 8601格式（UTC时间）
2. UUID字段使用标准UUID格式
3. 用户只能访问自己创建的拍摄计划
4. 密码要求6-100个字符
5. 用户名要求1-50个字符
6. 邮箱地址必须是有效格式

## 示例代码

### Python 示例

```python
import requests

# 用户注册
register_data = {
    "user_name": "测试用户",
    "email": "test@example.com",
    "password": "password123"
}
response = requests.post("http://localhost:8000/auth/register", json=register_data)

# 用户登录
login_data = {
    "email": "test@example.com",
    "password": "password123"
}
response = requests.post("http://localhost:8000/auth/login", json=login_data)
token = response.json()["access_token"]

# 使用token访问受保护的端点
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/auth/me", headers=headers)

# 创建拍摄计划
plan_data = {
    "title": "日出拍摄",
    "description": "在海边拍摄日出",
    "location": "青岛海滩",
    "scheduled_time": "2023-12-25T06:00:00Z"
}
response = requests.post("http://localhost:8000/plans/", json=plan_data, headers=headers)
```

### JavaScript 示例

```javascript
// 用户登录
const loginResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.access_token;

// 获取拍摄计划列表
const plansResponse = await fetch('http://localhost:8000/plans/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const plans = await plansResponse.json();
console.log(plans);
```

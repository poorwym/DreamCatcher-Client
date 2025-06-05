# PlanMap2DPage 模块化重构

这个目录已经从单一的大文件重构为模块化的结构，提高了代码的可维护性和可读性。

## 📁 文件结构

```
src/pages/PlanMap2DPage/
├── PlanMap2DPage.jsx              # 原始文件（备份保留）
├── PlanMap2DPage_new.jsx          # 新的主组件（使用模块化结构）
├── PlanMap2DPage_backup.jsx       # 备份文件
├── PlanMap2DPage.module.css       # 样式文件
├── README.md                      # 本文档
├── components/                    # 组件模块
│   └── MapIcons.js               # 地图图标创建函数
└── utils/                        # 工具模块
    ├── astronomicalUtils.js      # 天文计算相关函数
    ├── mapUtils.js              # 地图通用工具函数
    ├── mapVisualization.js      # 地图可视化功能
    └── mapExport.js             # 地图导出功能
```

## 🔧 模块说明

### 主组件
- **PlanMap2DPage_new.jsx**: 重构后的主组件，从原来的1800+行代码精简到约600行
  - 使用模块化导入
  - 保持原有的所有功能
  - 更清晰的代码结构

### 工具模块

#### `utils/astronomicalUtils.js`
- **功能**: 天文计算相关
- **主要函数**:
  - `calculateSunPosition()` - 计算太阳位置
  - `calculateMoonPosition()` - 计算月亮位置
  - `getAstronomicalData()` - 获取完整天文数据

#### `utils/mapUtils.js`
- **功能**: 地图通用工具函数
- **主要函数**:
  - `getDistanceMultiplier()` - 根据缩放级别计算距离系数
  - `calculateMarkerPosition()` - 计算标记位置
  - `latLngToPixel()` - 坐标转换
  - `debounce()` - 防抖函数

#### `utils/mapVisualization.js`
- **功能**: 地图可视化功能
- **主要函数**:
  - `createSunVisualization()` - 创建太阳可视化
  - `createMoonVisualization()` - 创建月亮可视化
  - `updateSunVisualization()` - 更新太阳可视化
  - `updateMoonVisualization()` - 更新月亮可视化

#### `utils/mapExport.js`
- **功能**: 地图导出功能
- **主要函数**:
  - `handleExport()` - 主导出函数
  - `drawMissingElements()` - 绘制可能丢失的元素

### 组件模块

#### `components/MapIcons.js`
- **功能**: 地图图标创建
- **主要函数**:
  - `createCameraIcon()` - 创建相机图标
  - `createSunIcon()` - 创建太阳图标
  - `createBeautifulMoonIcon()` - 创建月亮图标
  - `createSunriseIcon()` - 创建日出图标
  - `createSunsetIcon()` - 创建日落图标
  - `createMoonriseIcon()` - 创建月出图标
  - `createMoonsetIcon()` - 创建月落图标

## 🚀 使用新版本

要使用新的模块化版本，需要将 `PlanMap2DPage_new.jsx` 重命名为 `PlanMap2DPage.jsx`：

```bash
# 备份当前文件
mv PlanMap2DPage.jsx PlanMap2DPage_old.jsx

# 使用新版本
mv PlanMap2DPage_new.jsx PlanMap2DPage.jsx
```

## ✅ 重构优势

1. **代码可维护性**: 功能模块化，易于定位和修改
2. **代码可读性**: 每个模块职责单一，逻辑清晰
3. **代码复用性**: 模块可以在其他地方复用
4. **测试友好**: 可以单独测试每个模块
5. **团队协作**: 不同开发者可以并行开发不同模块

## 🔄 功能对比

新版本保持了与原版本100%的功能兼容：

- ✅ 地图初始化和交互
- ✅ 太阳和月亮轨迹可视化
- ✅ 天文数据计算和显示
- ✅ 时间控制和实时更新
- ✅ 相机位置拖拽
- ✅ 地图导出功能
- ✅ 图层控制
- ✅ 所有UI交互

## 📝 注意事项

1. 确保所有模块文件都在正确的路径下
2. 检查导入路径是否正确
3. 新版本依赖的所有库与原版本相同
4. CSS样式文件保持不变 
#!/bin/bash

# PlanMap2DPage 模块化版本切换脚本
# 使用方法: ./switch-to-new-version.sh

echo "🔄 PlanMap2DPage 模块化版本切换"
echo "================================"

# 检查当前目录
if [ ! -f "PlanMap2DPage.jsx" ]; then
    echo "❌ 错误: 找不到 PlanMap2DPage.jsx 文件"
    echo "请确保在正确的目录下运行此脚本"
    exit 1
fi

if [ ! -f "PlanMap2DPage_new.jsx" ]; then
    echo "❌ 错误: 找不到 PlanMap2DPage_new.jsx 文件"
    echo "请确保新版本文件存在"
    exit 1
fi

# 检查必要的模块文件
echo "🔍 检查模块文件..."

missing_files=()

if [ ! -f "utils/astronomicalUtils.js" ]; then
    missing_files+=("utils/astronomicalUtils.js")
fi

if [ ! -f "utils/mapUtils.js" ]; then
    missing_files+=("utils/mapUtils.js")
fi

if [ ! -f "utils/mapVisualization.js" ]; then
    missing_files+=("utils/mapVisualization.js")
fi

if [ ! -f "utils/mapExport.js" ]; then
    missing_files+=("utils/mapExport.js")
fi

if [ ! -f "components/MapIcons.js" ]; then
    missing_files+=("components/MapIcons.js")
fi

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ 错误: 缺少以下模块文件:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo "请确保所有模块文件都已创建"
    exit 1
fi

echo "✅ 所有模块文件检查通过"

# 询问用户确认
echo ""
echo "⚠️  即将执行以下操作:"
echo "1. 备份当前 PlanMap2DPage.jsx 为 PlanMap2DPage_original.jsx"
echo "2. 将 PlanMap2DPage_new.jsx 重命名为 PlanMap2DPage.jsx"
echo ""
read -p "是否继续? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 执行切换
echo "🔄 正在切换版本..."

# 备份原文件
if [ -f "PlanMap2DPage_original.jsx" ]; then
    echo "⚠️  PlanMap2DPage_original.jsx 已存在，创建带时间戳的备份"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    cp PlanMap2DPage.jsx "PlanMap2DPage_original_$timestamp.jsx"
else
    cp PlanMap2DPage.jsx PlanMap2DPage_original.jsx
fi

# 使用新版本
mv PlanMap2DPage_new.jsx PlanMap2DPage.jsx

echo "✅ 版本切换成功!"
echo ""
echo "📂 文件状态:"
echo "  - PlanMap2DPage.jsx (现在是模块化版本)"
echo "  - PlanMap2DPage_original.jsx (原始版本备份)"
echo ""
echo "🚀 现在可以启动应用并测试新的模块化版本"
echo "如果遇到问题，可以运行 './rollback.sh' 回滚到原版本"

# 创建回滚脚本
cat > rollback.sh << 'EOF'
#!/bin/bash

echo "🔄 回滚到原始版本..."

if [ ! -f "PlanMap2DPage_original.jsx" ]; then
    echo "❌ 错误: 找不到原始版本备份文件"
    exit 1
fi

# 备份当前的模块化版本
mv PlanMap2DPage.jsx PlanMap2DPage_modular.jsx

# 恢复原始版本
mv PlanMap2DPage_original.jsx PlanMap2DPage.jsx

echo "✅ 已回滚到原始版本"
echo "模块化版本已保存为 PlanMap2DPage_modular.jsx"
EOF

chmod +x rollback.sh

echo "📝 已创建回滚脚本: rollback.sh" 
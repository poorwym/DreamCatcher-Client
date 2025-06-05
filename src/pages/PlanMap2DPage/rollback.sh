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

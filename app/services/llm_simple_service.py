import os
import json
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel, Field
from fastapi import HTTPException

# 正确的导入路径 - 直接从 SimpleLLMFunc 顶级包导入
from SimpleLLMFunc import llm_function, llm_chat, tool, OpenAICompatible

# Pydantic 模型定义
class ChatMessage(BaseModel):
    role: str = Field(..., description="消息角色: user, assistant, system")
    content: str = Field(..., description="消息内容")
    timestamp: Optional[str] = Field(default=None, description="时间戳")

class PlanAnalysis(BaseModel):
    plan_id: int = Field(..., description="计划ID")
    analysis_summary: str = Field(..., description="分析总结")
    key_insights: List[str] = Field(..., description="关键洞察")
    improvement_suggestions: List[str] = Field(..., description="改进建议")
    risk_assessment: str = Field(..., description="风险评估 (低/中/高)")
    feasibility_score: int = Field(..., ge=1, le=10, description="可行性评分 1-10")

class TaskGeneration(BaseModel):
    plan_id: int = Field(..., description="计划ID")
    generated_tasks: List[Dict[str, Any]] = Field(..., description="生成的任务列表")
    task_dependencies: List[Dict[str, Any]] = Field(..., description="任务依赖关系")
    estimated_timeline: str = Field(..., description="预估时间线")
    priority_recommendations: List[str] = Field(..., description="优先级建议")

class DreamAnalysis(BaseModel):
    dream_theme: str = Field(..., description="梦境主题")
    emotional_tone: str = Field(..., description="情感基调")
    symbolic_elements: List[str] = Field(..., description="象征性元素")
    psychological_insights: List[str] = Field(..., description="心理学洞察")
    life_guidance: str = Field(..., description="生活指导建议")

# 工具函数定义
@tool(name="get_plan_data", description="获取指定计划的详细数据")
def get_plan_data(plan_id: int) -> Dict[str, Any]:
    """获取计划数据的模拟函数"""
    # 这里应该连接到实际的数据库
    return {
        "id": plan_id,
        "title": f"计划 {plan_id}",
        "description": f"这是计划 {plan_id} 的详细描述",
        "status": "active",
        "created_at": "2024-01-01",
        "tasks": ["任务1", "任务2", "任务3"]
    }

@tool(name="get_user_context", description="获取用户的上下文信息")
def get_user_context(user_id: str) -> Dict[str, Any]:
    """获取用户上下文信息"""
    return {
        "user_id": user_id,
        "preferences": ["高效", "创新", "协作"],
        "recent_activities": ["查看计划", "创建任务", "团队讨论"],
        "skill_level": "中级"
    }

@tool(name="search_knowledge_base", description="搜索知识库获取相关信息")
def search_knowledge_base(query: str) -> str:
    """搜索知识库"""
    # 模拟知识库搜索
    knowledge_items = {
        "项目管理": "项目管理最佳实践包括明确目标、合理分配资源、定期检查进度...",
        "梦境分析": "梦境分析是理解潜意识心理状态的重要方法，常见符号包括...",
        "任务规划": "有效的任务规划需要考虑优先级、依赖关系、资源约束..."
    }
    
    for key, value in knowledge_items.items():
        if key in query:
            return value
    
    return f"关于 '{query}' 的相关信息：这是一个需要深入研究的领域..."

# 全局 LLM 接口变量
llm_interface = None

# 初始化 LLM 接口
def initialize_llm_interface():
    """初始化 LLM 接口"""
    global llm_interface
    try:
        provider_config_path = Path("provider.json")
        if provider_config_path.exists():
            config = OpenAICompatible.load_from_json_file("provider.json")
            providers = list(config.keys())
            if providers:
                provider_name = providers[0]
                models = list(config[provider_name].keys())
                if models:
                    model_name = models[0]
                    llm_interface = config[provider_name][model_name]
                    print(f"成功初始化 LLM 接口: {provider_name}/{model_name}")
                    return llm_interface
                else:
                    raise ValueError("配置文件中未找到可用模型")
            else:
                raise ValueError("配置文件中未找到可用提供商")
        else:
            raise FileNotFoundError("未找到 provider.json 配置文件")
    except Exception as e:
        print(f"LLM 接口初始化失败: {e}")
        return None

# 在模块加载时初始化
initialize_llm_interface()

# LLM 函数定义（使用全局接口）
@llm_function(llm_interface=llm_interface)
def analyze_plan_func(plan_id: int, user_context: Optional[str] = None) -> PlanAnalysis:
    """
    分析用户计划，提供深入的洞察和改进建议
    
    你是一个专业的计划分析师，擅长项目管理和战略规划。
    请分析给定的计划数据，提供全面的分析报告。
    
    Args:
        plan_id: 计划ID
        user_context: 用户上下文信息
        
    Returns:
        包含分析总结、关键洞察、改进建议等的分析报告
    """
    pass

@llm_function(llm_interface=llm_interface, toolkit=[get_plan_data, get_user_context])
def generate_tasks_func(plan_id: int, user_id: str, requirements: str) -> TaskGeneration:
    """
    基于计划生成具体的任务列表和执行建议
    
    你是一个任务规划专家，能够将高层次的计划分解为可执行的具体任务。
    请使用工具获取计划数据和用户信息，然后生成详细的任务规划。
    
    Args:
        plan_id: 计划ID
        user_id: 用户ID  
        requirements: 特殊要求
        
    Returns:
        包含生成任务、依赖关系、时间线等的任务规划
    """
    pass

@llm_function(llm_interface=llm_interface, toolkit=[search_knowledge_base])  
def analyze_dream_func(dream_description: str, user_background: Optional[str] = None) -> DreamAnalysis:
    """
    分析用户的梦境内容，提供心理学洞察和生活指导
    
    你是一个经验丰富的梦境分析师和心理咨询师，擅长解读梦境的象征意义。
    请分析梦境内容，识别关键象征元素，并提供心理学洞察。
    
    Args:
        dream_description: 梦境描述
        user_background: 用户背景信息
        
    Returns:
        包含梦境主题、情感基调、象征元素、心理洞察等的分析报告
    """
    pass

@llm_chat(llm_interface=llm_interface, toolkit=[get_plan_data, search_knowledge_base])
def chat_assistant_func(message: str, history: List[Dict[str, str]] = None):
    """
    你是 DreamCatcher 的智能助手，专门帮助用户进行计划管理、任务规划和梦境分析。
    
    你的能力包括：
    1. 协助用户制定和优化计划
    2. 生成具体的任务建议
    3. 分析梦境内容并提供心理学洞察
    4. 回答关于项目管理、个人发展的问题
    
    请保持友好、专业的态度，提供准确、有用的建议。
    如果用户询问超出你能力范围的问题，诚实地告知并建议适当的替代方案。
    """
    pass

class SimpleLLMService:
    def __init__(self):
        self.chat_history: Dict[str, List[Dict[str, str]]] = {}
    
    def analyze_plan(self, plan_id: int, user_context: Optional[str] = None) -> PlanAnalysis:
        """分析计划"""
        if llm_interface is None:
            raise HTTPException(status_code=500, detail="LLM 接口未初始化")
        return analyze_plan_func(plan_id, user_context)
    
    def generate_tasks(self, plan_id: int, user_id: str, requirements: str) -> TaskGeneration:
        """生成任务"""
        if llm_interface is None:
            raise HTTPException(status_code=500, detail="LLM 接口未初始化")
        return generate_tasks_func(plan_id, user_id, requirements)
    
    def analyze_dream(self, dream_description: str, user_background: Optional[str] = None) -> DreamAnalysis:
        """分析梦境"""
        if llm_interface is None:
            raise HTTPException(status_code=500, detail="LLM 接口未初始化")
        return analyze_dream_func(dream_description, user_background)
    
    def chat_assistant(self, message: str, history: List[Dict[str, str]] = None):
        """聊天助手"""
        if llm_interface is None:
            raise HTTPException(status_code=500, detail="LLM 接口未初始化")
        return chat_assistant_func(message, history)
    
    async def health_check(self) -> Dict[str, str]:
        """健康检查"""
        try:
            if llm_interface is None:
                return {"status": "error", "message": "LLM 接口未初始化"}
            
            # 简单测试
            try:
                test_result = self.chat_assistant("你好", [])
                response, _ = next(test_result)
                
                return {
                    "status": "healthy", 
                    "message": "SimpleLLM 服务运行正常",
                    "test_response": response[:100] + "..." if len(response) > 100 else response
                }
            except Exception as test_error:
                return {"status": "error", "message": f"功能测试失败: {str(test_error)}"}
                
        except Exception as e:
            return {"status": "error", "message": f"健康检查失败: {str(e)}"}
    
    async def get_available_models(self) -> List[str]:
        """获取可用模型列表"""
        try:
            config = OpenAICompatible.load_from_json_file("provider.json")
            models = []
            for provider, provider_config in config.items():
                for model in provider_config.keys():
                    models.append(f"{provider}/{model}")
            return models
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"获取模型列表失败: {str(e)}")
    
    def save_chat_history(self, session_id: str, history: List[Dict[str, str]]) -> str:
        """保存聊天历史"""
        try:
            history_dir = Path("chat_history")
            history_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{session_id}_{timestamp}.json"
            filepath = history_dir / filename
            
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump({
                    "session_id": session_id,
                    "timestamp": timestamp,
                    "history": history
                }, f, ensure_ascii=False, indent=2)
            
            return str(filepath)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"保存历史记录失败: {str(e)}")
    
    def load_chat_history(self, session_id: str) -> List[Dict[str, str]]:
        """加载聊天历史"""
        try:
            history_dir = Path("chat_history")
            if not history_dir.exists():
                return []
            
            # 查找最新的历史文件
            pattern = f"{session_id}_*.json"
            files = list(history_dir.glob(pattern))
            if not files:
                return []
            
            latest_file = max(files, key=lambda f: f.stat().st_mtime)
            
            with open(latest_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("history", [])
        except Exception as e:
            print(f"加载历史记录失败: {e}")
            return []

# 全局服务实例
simple_llm_service = SimpleLLMService()

# 导出所有需要的类和实例
__all__ = [
    'ChatMessage',
    'PlanAnalysis', 
    'TaskGeneration',
    'DreamAnalysis',
    'SimpleLLMService',
    'simple_llm_service'
] 
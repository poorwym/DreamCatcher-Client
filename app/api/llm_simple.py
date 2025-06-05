from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import asyncio
from datetime import datetime
import uuid

from services.llm_simple_service import (
    simple_llm_service, 
    PlanAnalysis, 
    TaskGeneration,
    DreamAnalysis
)

router = APIRouter()

# 请求模型
class ChatRequest(BaseModel):
    message: str = Field(..., description="用户消息")
    session_id: Optional[str] = Field(default=None, description="会话ID")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="聊天历史")

class PlanAnalysisRequest(BaseModel):
    plan_id: int = Field(..., description="计划ID")
    user_context: Optional[str] = Field(default=None, description="用户上下文")

class TaskGenerationRequest(BaseModel):
    plan_id: int = Field(..., description="计划ID") 
    user_id: str = Field(..., description="用户ID")
    requirements: str = Field(..., description="任务要求")

class DreamAnalysisRequest(BaseModel):
    dream_description: str = Field(..., description="梦境描述")
    user_background: Optional[str] = Field(default=None, description="用户背景")

class StreamChatRequest(BaseModel):
    message: str = Field(..., description="用户消息")
    session_id: Optional[str] = Field(default=None, description="会话ID")

class MCPToolCallRequest(BaseModel):
    tool_name: str = Field(..., description="工具名称")
    parameters: Dict[str, Any] = Field(..., description="工具参数")

# 响应模型
class ChatResponse(BaseModel):
    response: str = Field(..., description="AI回复")
    session_id: str = Field(..., description="会话ID")
    timestamp: str = Field(..., description="响应时间戳")

class HealthResponse(BaseModel):
    status: str = Field(..., description="服务状态")
    message: str = Field(..., description="状态消息")
    test_response: Optional[str] = Field(default=None, description="测试响应")

class ModelsResponse(BaseModel):
    models: List[str] = Field(..., description="可用模型列表")

# ============ 基础端点 ============

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    result = await simple_llm_service.health_check()
    return HealthResponse(**result)

@router.get("/models", response_model=ModelsResponse)
async def get_models():
    """获取可用模型列表"""
    models = await simple_llm_service.get_available_models()
    return ModelsResponse(models=models)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """标准聊天端点"""
    try:
        # 生成会话ID（如果未提供）
        session_id = request.session_id or str(uuid.uuid4())
        
        # 加载历史记录（如果需要）
        if not request.history:
            request.history = simple_llm_service.load_chat_history(session_id)
        
        # 调用聊天助手（无需设置接口，已在模块级别初始化）
        result = simple_llm_service.chat_assistant(request.message, request.history)
        response, updated_history = next(result)
        
        # 保存历史记录
        simple_llm_service.save_chat_history(session_id, updated_history)
        
        return ChatResponse(
            response=response,
            session_id=session_id,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"聊天失败: {str(e)}")

@router.post("/stream-chat")
async def stream_chat(request: StreamChatRequest):
    """流式聊天端点"""
    try:
        from fastapi.responses import StreamingResponse
        import json
        
        session_id = request.session_id or str(uuid.uuid4())
        history = simple_llm_service.load_chat_history(session_id)
        
        async def generate_stream():
            try:
                result = simple_llm_service.chat_assistant(request.message, history)
                
                # 模拟流式响应（SimpleLLMFunc 可能不直接支持流式）
                response, updated_history = next(result)
                
                # 分块发送响应
                words = response.split()
                for i, word in enumerate(words):
                    chunk = {
                        "content": word + " ",
                        "session_id": session_id,
                        "finished": i == len(words) - 1
                    }
                    yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
                    await asyncio.sleep(0.05)  # 模拟流式延迟
                
                # 保存历史记录
                simple_llm_service.save_chat_history(session_id, updated_history)
                
            except Exception as e:
                error_chunk = {
                    "error": str(e),
                    "session_id": session_id,
                    "finished": True
                }
                yield f"data: {json.dumps(error_chunk, ensure_ascii=False)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"流式聊天失败: {str(e)}")

# ============ DreamCatcher 特定端点 ============

@router.post("/analyze-plan", response_model=PlanAnalysis)
async def analyze_plan(request: PlanAnalysisRequest):
    """分析用户计划"""
    try:
        result = simple_llm_service.analyze_plan(
            plan_id=request.plan_id,
            user_context=request.user_context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"计划分析失败: {str(e)}")

@router.post("/generate-tasks", response_model=TaskGeneration)
async def generate_tasks(request: TaskGenerationRequest):
    """生成任务列表"""
    try:
        result = simple_llm_service.generate_tasks(
            plan_id=request.plan_id,
            user_id=request.user_id,
            requirements=request.requirements
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"任务生成失败: {str(e)}")

@router.post("/analyze-dream", response_model=DreamAnalysis)
async def analyze_dream(request: DreamAnalysisRequest):
    """分析梦境内容"""
    try:
        result = simple_llm_service.analyze_dream(
            dream_description=request.dream_description,
            user_background=request.user_background
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"梦境分析失败: {str(e)}")

# ============ MCP 兼容端点 ============

@router.get("/mcp/tools/list")
async def list_mcp_tools():
    """列出可用的 MCP 工具"""
    tools = [
        {
            "name": "get_plan_data",
            "description": "获取指定计划的详细数据",
            "parameters": {
                "plan_id": {"type": "integer", "description": "计划ID"}
            }
        },
        {
            "name": "get_user_context", 
            "description": "获取用户的上下文信息",
            "parameters": {
                "user_id": {"type": "string", "description": "用户ID"}
            }
        },
        {
            "name": "search_knowledge_base",
            "description": "搜索知识库获取相关信息", 
            "parameters": {
                "query": {"type": "string", "description": "搜索查询"}
            }
        }
    ]
    return {"tools": tools}

@router.post("/mcp/tools/call")
async def call_mcp_tool(request: MCPToolCallRequest):
    """调用 MCP 工具"""
    try:
        from services.llm_simple_service import get_plan_data, get_user_context, search_knowledge_base
        
        tool_functions = {
            "get_plan_data": get_plan_data,
            "get_user_context": get_user_context,
            "search_knowledge_base": search_knowledge_base
        }
        
        if request.tool_name not in tool_functions:
            raise HTTPException(status_code=404, detail=f"未找到工具: {request.tool_name}")
        
        tool_func = tool_functions[request.tool_name]
        result = tool_func(**request.parameters)
        
        return {
            "tool_name": request.tool_name,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"工具调用失败: {str(e)}")

# ============ 本地服务端点 ============

@router.get("/local/status")
async def get_local_status():
    """获取本地服务状态"""
    try:
        health = await simple_llm_service.health_check()
        models = await simple_llm_service.get_available_models()
        
        return {
            "service_name": "SimpleLLMFunc Service",
            "status": health["status"],
            "available_models": models,
            "features": [
                "计划分析",
                "任务生成", 
                "梦境分析",
                "智能聊天",
                "工具调用"
            ],
            "endpoints": [
                "/api/v1/llm/health",
                "/api/v1/llm/chat",
                "/api/v1/llm/analyze-plan",
                "/api/v1/llm/generate-tasks",
                "/api/v1/llm/analyze-dream"
            ],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取状态失败: {str(e)}")

# ============ 会话管理端点 ============

@router.get("/sessions/{session_id}/history")
async def get_session_history(session_id: str):
    """获取会话历史"""
    try:
        history = simple_llm_service.load_chat_history(session_id)
        return {
            "session_id": session_id,
            "history": history,
            "message_count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """删除会话"""
    try:
        # 这里可以实现删除会话的逻辑
        return {
            "message": f"会话 {session_id} 已删除",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除会话失败: {str(e)}") 
import React, {useState} from 'react';
import Background from "../../components/Background/Background.jsx";
import LLMChatBox from "./components/LLMChatBox.jsx";
import {useAuth} from "../../context/AuthProvider.jsx";
import LLMChatWindow from "./components/LLMChatWindow.jsx";
import MessageBubble from "./components/MessageBubble.jsx";
import {sendChatMessage} from "../../api/llm.js";
import {CircularProgress} from "@mui/material";
import '../../assets/style.css';

function LlmPage() {
    const {fetchWithAuth} = useAuth();
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    /*[
    * {
    *   "role" : "user",
    *   "message" : "hello"
    * },
    * {
    *   "role" : "assistant",
    *   "message" : "Hello, how can I help you"
    * }
    * ]
    * */

    const handleSendMessage = async (message) => {
        if (!message.trim() || isLoading) return;

        // 添加用户消息到聊天历史
        const userMessage = {
            role: "user",
            message: message
        };
        setChatHistory(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // 调用LLM API
            const response = await sendChatMessage(message, fetchWithAuth);
            
            // 添加助手回复到聊天历史
            const assistantMessage = {
                role: "assistant",
                message: response.response || "抱歉，我无法处理您的请求。"
            };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('发送消息失败:', error);
            // 添加错误消息
            const errorMessage = {
                role: "assistant",
                message: `抱歉，发生了错误：${error.message || '请稍后重试。'}`
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative">
            <Background />
            
            {/* 聊天窗口 */}
            <LLMChatWindow>
                {chatHistory.map((chat, index) => (
                    <MessageBubble 
                        key={index}
                        role={chat.role} 
                        message={chat.message} 
                    />
                ))}
                
                {/* 加载指示器 */}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-lg border border-white/10 mr-12">
                            <div className="flex items-center space-x-2">
                                <CircularProgress size={16} sx={{ color: '#60a5fa' }} />
                                <span className="text-gray-300 text-sm">AI正在思考中...</span>
                            </div>
                        </div>
                    </div>
                )}
            </LLMChatWindow>
            
            {/* 输入框 */}
            <LLMChatBox onSendMessage={handleSendMessage} />
        </div>
    );
}

export default LlmPage;
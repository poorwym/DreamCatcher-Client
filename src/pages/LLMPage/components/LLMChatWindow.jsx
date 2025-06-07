import React, {useEffect, useRef} from 'react';
import '../../../assets/style.css';

// 用于显示llm的对话历史,每个child是MessageBubble
function LlmChatWindow({children}) {
    const hasMessages = React.Children.count(children) > 0;
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [children]);
    
    return (
            <div id="ChatWindow" className="w-3/4 bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 h-full flex flex-col">
                {/* 窗口标题栏 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                    </div>
                    {/*<h2 className="text-white/80 text-sm font-medium">*/}
                    {/*    Chat Session*/}
                    {/*</h2>*/}
                    <div className="w-16"></div>
                </div>
                
                {/* 聊天内容区域 */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {hasMessages ? (
                        <>
                            {children}
                            <div ref={messagesEndRef} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 backdrop-blur-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-white/60 text-sm">开始与AI助手对话吧</p>
                                <p className="text-white/40 text-xs mt-2">向我提问任何你想了解的内容</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}

export default LlmChatWindow;
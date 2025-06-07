import React from 'react';
import '../../../assets/style.css';

// role: "user" | "assistant",  user的bubble尾巴是向右的，assistant的bubble尾巴是向左的
// message: string
function MessageBubble({role, message}) {
    const isUser = role === 'user';
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                isUser 
                    ? 'bg-blue-600/20 backdrop-blur-lg text-white ml-12' 
                    : 'bg-gray-800/90 backdrop-blur-lg text-gray-100 mr-12'
            } shadow-lg border border-white/10`}>
                {/* 消息内容 */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message}
                </p>
                
                {/* 气泡尾巴 */}
                <div className={`absolute top-3 w-0 h-0 ${
                    isUser 
                        ? 'right-[-8px] border-l-[8px] border-l-blue-600/20 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                        : 'left-[-8px] border-r-[8px] border-r-gray-800/90 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                }`} />
            </div>
        </div>
    );
}

export default MessageBubble;
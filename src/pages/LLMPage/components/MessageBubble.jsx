import React from 'react';
import '../../../assets/style.css';

// role: "user" | "assistant",  user的bubble尾巴是向右的，assistant的bubble尾巴是向左的
// message: string
function MessageBubble({role, message}) {
    const isUser = role === 'user';
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} m-4 message-bubble-container`}>
            <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                isUser 
                    ? 'bg-info/20 backdrop-blur-lg text-contrast ml-12' 
                    : 'bg-secondary/80 backdrop-blur-lg text-main mr-12'
            } shadow-lg border border-subtle`}>
                {/* 消息内容 */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message}
                </p>
                
                {/* 气泡尾巴 */}
                <div className={`absolute top-3 w-0 h-0 ${
                    isUser 
                        ? 'right-[-8px] border-l-[8px] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                        : 'left-[-8px] border-r-[8px] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                }`} 
                style={{
                    borderLeftColor: isUser ? 'rgba(var(--accent-blue-rgb, 14, 165, 233), 0.2)' : 'transparent',
                    borderRightColor: !isUser ? 'rgba(var(--bg-secondary-rgb), 0.8)' : 'transparent'
                }} />
            </div>
        </div>
    );
}

export default MessageBubble;
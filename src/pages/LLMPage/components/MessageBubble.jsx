import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import '../../../assets/style.css';
import 'highlight.js/styles/github-dark.css';

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
                <div className="text-sm leading-relaxed markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            // 自定义 markdown 组件样式
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-accent-blue">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-accent-blue">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium mb-2 text-accent-blue">{children}</h3>,
                            ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-sm">{children}</li>,
                            blockquote: ({children}) => (
                                <blockquote className="border-l-4 border-accent-blue/30 pl-4 my-2 italic text-secondary">
                                    {children}
                                </blockquote>
                            ),
                            code: ({inline, className, children}) => {
                                if (inline) {
                                    return (
                                        <code className="bg-subtle/50 text-accent-blue px-1 py-0.5 rounded text-xs font-mono">
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <code className={`${className} block bg-subtle/30 p-3 rounded-lg text-xs font-mono overflow-x-auto`}>
                                        {children}
                                    </code>
                                );
                            },
                            pre: ({children}) => (
                                <pre className="bg-subtle/30 p-3 rounded-lg my-2 overflow-x-auto">
                                    {children}
                                </pre>
                            ),
                            a: ({href, children}) => (
                                <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-accent-blue hover:text-accent-blue/80 underline"
                                >
                                    {children}
                                </a>
                            )
                        }}
                    >
                        {message}
                    </ReactMarkdown>
                </div>
                
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
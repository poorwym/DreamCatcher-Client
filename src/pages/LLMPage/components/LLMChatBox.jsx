import React, {useState} from 'react';
import {TextField, IconButton} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import '../../../assets/style.css';

// onSendMessage: function(message: string) => void
// isInitial: boolean - 是否为初始状态（无对话时）
function LlmChatBox({onSendMessage, isInitial = false}) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`${isInitial ? 'relative' : 'fixed bottom-8 left-1/2 transform -translate-x-1/2'} w-3/4 z-20`}>
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-4">
                <div className="flex items-end space-x-3">
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入您的问题..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgba(59, 130, 246, 0.5)',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: 'white',
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!message.trim()}
                        sx={{
                            backgroundColor: message.trim() ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: message.trim() ? '#60a5fa' : 'rgba(255, 255, 255, 0.5)',
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: message.trim() ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            },
                            '&:disabled': {
                                color: 'rgba(255, 255, 255, 0.3)',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}

export default LlmChatBox;
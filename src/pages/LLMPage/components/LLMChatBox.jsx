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
            <div className="bg-primary/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-subtle p-4">
                <div className="flex items-center space-x-3">
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tell me your dream ..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                '& fieldset': {
                                    borderColor: 'var(--border-subtle)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'var(--border-secondary)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--border-primary)',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: 'var(--text-main)',
                                '&::placeholder': {
                                    color: 'var(--text-muted)',
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className=""
                        sx={{
                            backgroundColor: message.trim() ? 'rgba(var(--accent-blue-rgb, 14, 165, 233), 0.2)' : 'rgba(var(--bg-secondary-rgb), 0.1)',
                            backdropFilter: 'blur(10px)',
                            marginLeft: "10px",
                            border: `1px solid var(--border-subtle)`,
                            color: message.trim() ? 'var(--accent-blue)' : 'var(--text-muted)',
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: message.trim() ? 'rgba(var(--accent-blue-rgb, 14, 165, 233), 0.3)' : 'rgba(var(--bg-secondary-rgb), 0.2)',
                            },
                            '&:disabled': {
                                color: 'var(--text-muted)',
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
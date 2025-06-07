import React from 'react';
import "../../assets/style.css"
import Background from "../../components/Background/Background.jsx";
import UserProfile from "./components/UserProfile.jsx";
import PasswordEditor from "./components/PasswordEditor.jsx";
import { Typography, Container, Box } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

function SettingsPage() {
    return (
        <div className="w-full h-full">
          <Background />
          <div className="relative z-10 flex flex-col items-center justify-start pt-32 px-4">
            {/* 科技风格标题区域 */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div>
                  <Typography 
                    variant="h2" 
                    className="text-contrast font-bold mb-4 uppercase tracking-wider"
                    sx={{ 
                      color: 'var(--text-contrast)',
                      fontSize: '3rem',
                      fontWeight: 600,
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                      fontFamily: 'monospace'
                    }}
                  >
                    SETTINGS
                  </Typography>
                  <Typography 
                    variant="h6" 
                    className="text-primary uppercase tracking-widest"
                    sx={{ 
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))'
                    }}
                  >
                    SYSTEM CONFIGURATION
                  </Typography>
                </div>
              </div>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4 opacity-60"></div>
              <Typography 
                variant="body1" 
                className="text-secondary uppercase tracking-wider"
                sx={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: 300
                }}
              >
                MANAGE YOUR ACCOUNT PREFERENCES
              </Typography>
            </div>

            {/* 设置内容容器 */}
            <Container maxWidth="lg" sx={{ width: '100%' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* 用户资料卡片 */}
                <div 
                  className="backdrop-blur-lg bg-secondary/90 rounded-2xl border border-primary/30 shadow-2xl"
                  style={{
                    background: 'transparent',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 40px rgba(14, 165, 233, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <UserProfile />
                </div>

                {/* 密码设置卡片 */}
                <div 
                  className="backdrop-blur-lg bg-secondary/90 rounded-2xl border border-primary/30 shadow-2xl"
                  style={{
                    background: 'transparent',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <PasswordEditor/>
                </div>
              </div>

              {/* 系统信息面板 */}
              <div 
                className="backdrop-blur-lg bg-secondary/90 rounded-2xl border border-primary/30 shadow-2xl p-8 mb-16"
                style={{
                  background: 'transparent',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 40px rgba(16, 185, 129, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <Typography 
                  variant="h5" 
                  className="text-contrast font-bold uppercase tracking-wider mb-6"
                  sx={{ 
                    color: 'var(--text-contrast)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green)',
                      marginRight: 2,
                      filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  />
                  SYSTEM STATUS
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-tertiary/30 rounded-lg border border-subtle">
                    <Typography 
                      variant="h6" 
                      className="text-contrast mb-2 font-bold uppercase tracking-wider"
                      sx={{ 
                        color: 'var(--text-contrast)',
                        fontSize: '1rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      STATUS
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="text-success uppercase tracking-widest"
                      sx={{ 
                        color: 'var(--accent-green)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ONLINE
                    </Typography>
                  </div>
                  <div className="text-center p-4 bg-tertiary/30 rounded-lg border border-subtle">
                    <Typography 
                      variant="h6" 
                      className="text-contrast mb-2 font-bold uppercase tracking-wider"
                      sx={{ 
                        color: 'var(--text-contrast)',
                        fontSize: '1rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      VERSION
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="text-primary uppercase tracking-widest"
                      sx={{ 
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 400
                      }}
                    >
                      V2.1.0
                    </Typography>
                  </div>
                  <div className="text-center p-4 bg-tertiary/30 rounded-lg border border-subtle">
                    <Typography 
                      variant="h6" 
                      className="text-contrast mb-2 font-bold uppercase tracking-wider"
                      sx={{ 
                        color: 'var(--text-contrast)',
                        fontSize: '1rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      UPTIME
                    </Typography>
                    <Typography 
                      variant="body2" 
                      className="text-accent uppercase tracking-widest"
                      sx={{ 
                        color: 'var(--accent-orange)',
                        fontSize: '0.8rem',
                        fontWeight: 400
                      }}
                    >
                      99.9%
                    </Typography>
                  </div>
                </div>
              </div>
            </Container>

            {/* 底部间距 */}
            <div className="h-16"></div>
          </div>
        </div>
    );
}

export default SettingsPage;
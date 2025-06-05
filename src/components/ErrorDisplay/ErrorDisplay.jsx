import React from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

function ErrorDisplay({ 
  error, 
  title = '加载失败', 
  showReload = true, 
  onReload,
  extra 
}) {
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return '发生了未知错误';
  };

  const getStatusFromError = () => {
    if (typeof error === 'string') {
      return 'error';
    }
    
    if (error?.message?.includes('404') || error?.message?.includes('未找到')) {
      return '404';
    }
    
    if (error?.message?.includes('403') || error?.message?.includes('权限')) {
      return '403';
    }
    
    if (error?.message?.includes('500') || error?.message?.includes('服务器')) {
      return '500';
    }
    
    return 'error';
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      padding: '24px'
    }}>
      <Result
        status={getStatusFromError()}
        title={title}
        subTitle={getErrorMessage()}
        extra={[
          showReload && onReload && (
            <Button 
              key="reload"
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={onReload}
            >
              重新加载
            </Button>
          ),
          extra
        ].filter(Boolean)}
      />
    </div>
  );
}

export default ErrorDisplay; 
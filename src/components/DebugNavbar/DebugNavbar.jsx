import React from 'react';
import { Link } from 'react-router-dom';
import './DebugNavbar.css';

const DebugNavbar = () => {
  // 示例计划ID，用于测试带参数的路由
  const samplePlanId = '123';

  return (
    <div className="debug-navbar">
      <h3>调试导航栏</h3>
      <nav>
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/register">注册</Link></li>
          <li><Link to="/dashboard">仪表盘</Link></li>
          <li><Link to="/plans">计划列表</Link></li>
          <li><Link to="/plans/new">新建计划</Link></li>
          <li><Link to={`/plans/${samplePlanId}`}>计划详情</Link></li>
          <li><Link to={`/plans/${samplePlanId}/map2D`}>2D地图</Link></li>
          <li><Link to={`/plans/${samplePlanId}/map3D`}>3D地图</Link></li>
          <li><Link to="/settings">设置</Link></li>
          <li><Link to="/about">关于</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default DebugNavbar; 
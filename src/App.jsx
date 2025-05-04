import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DebugNavbar from './components/DebugNavbar/DebugNavbar';

// 导入你的页面组件
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import PlansListPage from './pages/PlansListPage/PlansListPage';
import NewPlanPage from './pages/NewPlanPage/NewPlanPage';
import PlanDetailsPage from './pages/PlanDetailsPage/PlanDetailsPage';
import PlanMap2DPage from './pages/PlanMap2DPage/PlanMap2DPage';
import PlanMap3DPage from './pages/PlanMap3DPage/PlanMap3DPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <DebugNavbar />
      <div style={{ marginLeft: '200px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plans" element={<PlansListPage />} />
          <Route path="/plans/new" element={<NewPlanPage />} />
          
          {/* 注意这些路由使用 :id 参数 */}
          <Route path="/plans/:id" element={<PlanDetailsPage />} />
          <Route path="/plans/:id/map2D" element={<PlanMap2DPage />} />
          <Route path="/plans/:id/map3D" element={<PlanMap3DPage />} />
          
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* 可选：添加一个捕获所有未匹配路由的路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import imageService from './services/imageService';
import './App.css'; // 导入App样式
import './assets/style.css'; // 导入全局主题样式

// 导入页面组件
import HomePage from './pages/HomePage/HomePage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import PlansListPage from './pages/PlansListPage/PlansListPage';
import NewPlanPage from './pages/NewPlanPage/NewPlanPage';
import PlanDetailsPage from './pages/PlanDetailsPage/PlanDetailsPage';
import PlanMap2DPage from './pages/PlanMap2DPage/PlanMap2DPage';
import PlanMap3DPage from './pages/PlanMap3DPage/PlanMap3DPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import AboutPage from "./pages/AboutPage/AboutPage"
import CloudRenderingPage from "./pages/CloudRenderingPage/CloudRenderingPage.jsx";
import LoginPage from './pages/LoginPage/LoginPage';
import RequireAuth from "./components/RequireAuth/RequireAuth.jsx";

function App() {
  // 应用启动时预加载常用地点图片
  return (
    <BrowserRouter>
      <NavBar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          } />
          <Route path="/plans" element={
            <RequireAuth>
              <PlansListPage />
            </RequireAuth>
          } />
          <Route path="/plans/new" element={
            <RequireAuth>
              <NewPlanPage />
            </RequireAuth>
          } />
          
          {/* 注意这些路由使用 :id 参数 */}
          <Route path="/plans/:id" element={
            <RequireAuth>
              <PlanDetailsPage />
            </RequireAuth>
          } />
          <Route path="/plans/:id/map2D" element={
            <RequireAuth>
              <PlanMap2DPage />
            </RequireAuth>
          } />
          <Route path="/plans/:id/map3D" element={
            <RequireAuth>
              <PlanMap3DPage />
            </RequireAuth>
          } />
          <Route path="/cloudrendering" element={
            <RequireAuth>
              <CloudRenderingPage />
            </RequireAuth>
          } />
          
          <Route path="/settings" element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          } />
          <Route path="/about" element={<AboutPage/>}/>
          
          
          {/* 可选：添加一个捕获所有未匹配路由的路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

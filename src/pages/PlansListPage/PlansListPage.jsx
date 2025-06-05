import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout';
import imageService from '../../services/imageService';
import HybridPlanStorage, { DATA_SOURCE } from '../../services/hybridPlanStorage';
import './PlansListPage.css';
import { FiRefreshCw } from 'react-icons/fi';
import { MdImage } from 'react-icons/md';

const PlansListPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('dateDesc');
  const [dataSource, setDataSource] = useState(DATA_SOURCE.UNKNOWN);

  // 动态获取所有可用标签
  const allTags = [...new Set(plans.flatMap(plan => (plan.tags && Array.isArray(plan.tags)) ? plan.tags : []))];

  // 检查API连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await HybridPlanStorage.getConnectionStatus();
        setDataSource(status.source);
        console.log('🌐 服务状态:', status);
      } catch (error) {
        setDataSource(DATA_SOURCE.UNKNOWN);
        console.warn('状态检查失败:', error);
      }
    };

    checkConnection();
  }, []);

  // 加载所有计划数据
  const loadPlans = async () => {
    setLoading(true);
    try {
      console.log('🔄 开始加载计划列表...');
      
      const result = await HybridPlanStorage.getAllPlans();
      
      console.log('📊 计划数据加载结果:', {
        recent: result.data.recentPlans.length,
        upcoming: result.data.upcomingPlans.length,
        source: result.source
      });

      // 更新数据源状态
      setDataSource(result.source);

      // 合并所有计划
      const allPlans = [...result.data.recentPlans, ...result.data.upcomingPlans];

      // 为计划获取图片
      const plansWithImages = await Promise.all(
        allPlans.map(async (plan) => {
          try {
            const imageData = await imageService.getImageByTags(plan.location, plan.tags);
            return {
              ...plan,
              thumbnail: imageData.thumbnail || imageData.url,
              imageUrl: imageData.url,
              imageAlt: imageData.alt || `${plan.location} 摄影`,
              photographer: imageData.photographer,
              photographerUrl: imageData.photographerUrl
            };
          } catch (error) {
            console.warn(`获取计划 ${plan.id} 的图片失败:`, error);
            return {
              ...plan,
              thumbnail: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60`,
              imageUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60`,
              imageAlt: `${plan.location} 摄影`,
              photographer: '默认图片',
              photographerUrl: '#'
            };
          }
        })
      );

      setPlans(plansWithImages);
      console.log('✅ 计划数据加载完成，总数:', plansWithImages.length);
    } catch (error) {
      console.error('❌ 加载计划失败:', error);
      // 即使发生错误，也不阻塞用户界面
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载计划数据
  useEffect(() => {
    loadPlans();
  }, []);

  // 筛选和排序逻辑
  const filteredPlans = plans
    .filter(plan => {
      if (!plan) return false;
      
      const planName = plan.name || '';
      const planLocation = plan.location || '';
      const searchLower = (searchTerm || '').toLowerCase();
      
      const matchesSearch = 
        planName.toLowerCase().includes(searchLower) ||
        planLocation.toLowerCase().includes(searchLower);
      
      const planTags = Array.isArray(plan.tags) ? plan.tags : [];
      const matchesTags = 
        selectedTags.length === 0 ||
        selectedTags.every(tag => planTags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      const nameA = a.name || '';
      const nameB = b.name || '';
      
      if (sortOption === 'dateAsc') {
        return dateA - dateB;
      } else if (sortOption === 'dateDesc') {
        return dateB - dateA;
      } else if (sortOption === 'nameAsc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  // 处理标签选择变化
  const handleTagChange = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 删除计划
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('确定要删除这个计划吗？')) {
      return;
    }

    try {
      const result = await HybridPlanStorage.deletePlan(planId);
      if (result.success) {
        // 删除成功，重新加载计划列表
        await loadPlans();
        
        let message = '计划删除成功！';
        if (result.source === DATA_SOURCE.LOCAL) {
          message += ' (仅从本地存储删除)';
        }
        alert(message);
      } else {
        alert('删除计划失败：' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('删除计划失败:', error);
      alert('删除计划失败：' + error.message);
    }
  };

  // 刷新图片
  const handleRefreshImages = async () => {
    if (plans.length === 0) {
      alert('没有计划需要刷新图片');
      return;
    }

    imageService.clearCache();
    setLoading(true);
    
    try {
      console.log('🔄 开始刷新图片...');
      
      const refreshedPlans = await Promise.all(
        plans.map(async (plan) => {
          try {
            const imageData = await imageService.getImageByTags(plan.location, plan.tags || []);
            return {
              ...plan,
              thumbnail: imageData.thumbnail || imageData.url,
              imageUrl: imageData.url,
              imageAlt: imageData.alt || `${plan.location} 摄影`,
              photographer: imageData.photographer,
              photographerUrl: imageData.photographerUrl
            };
          } catch (error) {
            console.error(`刷新 ${plan.name} 的图片失败:`, error);
            return plan;
          }
        })
      );
      setPlans(refreshedPlans);
      alert('图片刷新成功！');
      console.log('✅ 图片刷新完成');
    } catch (error) {
      console.error('❌ 刷新图片失败:', error);
      alert('刷新图片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新加载计划数据
  const handleRefreshPlans = async () => {
    if (!dataSource) {
      alert('服务状态未知，无法刷新计划');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 开始刷新计划数据...');
      
      await loadPlans();

      alert(`计划列表已更新！从${dataSource === DATA_SOURCE.API ? 'API' : '本地存储'}获取到 ${plans.length} 个计划`);
      console.log('✅ 计划数据刷新完成');
    } catch (error) {
      console.error('❌ 刷新计划失败:', error);
      alert(`刷新失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未设定';
    try {
      return new Date(dateString).toLocaleDateString('zh-CN');
    } catch (error) {
      return '日期格式错误';
    }
  };

  return (
    <PageLayout title="我的拍摄计划">
      <div className="plans-list-container">
        {/* 数据源状态指示器 */}
        <div className={`data-source-status ${dataSource === DATA_SOURCE.API ? 'success' : dataSource === DATA_SOURCE.LOCAL ? 'warning' : 'error'}`}>
          {dataSource === DATA_SOURCE.API && '✅ API已连接'}
          {dataSource === DATA_SOURCE.LOCAL && '⚠️ 使用本地存储'}
          {dataSource === DATA_SOURCE.UNKNOWN && '❌ 服务状态未知'}
        </div>

        <div className="plans-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="搜索计划名称或地点..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <div className="filter-group">
              <label className="filter-label">标签筛选:</label>
              <div className="tags-filter">
                {allTags.length > 0 ? allTags.map(tag => (
                  <div 
                    key={tag} 
                    className={`filter-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagChange(tag)}
                  >
                    {tag}
                  </div>
                )) : (
                  <div className="no-tags">暂无标签</div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">排序:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="dateDesc">日期 (最新优先)</option>
                <option value="dateAsc">日期 (最旧优先)</option>
                <option value="nameAsc">名称 (A-Z)</option>
                <option value="nameDesc">名称 (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleRefreshPlans}
              className="refresh-button"
              disabled={loading || !dataSource}
              title="从API刷新计划列表"
            >
              {loading ? '刷新中...' : <><FiRefreshCw style={{ marginRight: 6, verticalAlign: 'middle' }} />刷新计划</>}
            </button>
            <button 
              onClick={handleRefreshImages}
              className="refresh-button"
              disabled={loading}
              title="重新加载图片"
            >
              {loading ? '刷新中...' : <><MdImage style={{ marginRight: 6, verticalAlign: 'middle' }} />刷新图片</>}
            </button>
            <Link to="/plans/new" className="new-plan-button">
              + 创建新计划
            </Link>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-message">
              <p>正在从API加载数据...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
        )}

        <div className="plans-stats">
          {loading ? (
            <span>正在加载计划数据...</span>
          ) : (
            <span>
              共找到 {filteredPlans.length} 个计划
              {dataSource === DATA_SOURCE.LOCAL && ' (本地缓存)'}
              {dataSource === DATA_SOURCE.API && ' (服务器数据)'}
            </span>
          )}
        </div>

        <div className="plans-grid">
          {loading ? (
            <div className="loading-placeholder">
              <p>正在加载计划数据...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            searchTerm || selectedTags.length > 0 ? (
              <div className="no-plans-message">
                <h3>没有找到匹配的计划</h3>
                <p>请尝试调整搜索条件或筛选标签</p>
                {dataSource === DATA_SOURCE.LOCAL && <p><small>💾 当前显示本地缓存数据</small></p>}
              </div>
            ) : (
              <div className="no-plans-message">
                <h3>还没有任何拍摄计划</h3>
                <p>开始创建您的第一个拍摄计划吧！</p>
                {dataSource === DATA_SOURCE.LOCAL && <p><small>💾 当前显示本地缓存数据</small></p>}
                <Link to="/plans/new" className="new-plan-button">
                  + 创建新计划
                </Link>
              </div>
            )
          ) : (
            filteredPlans.map(plan => (
              <div className="plan-item" key={plan.id}>
                <div className="plan-thumbnail" style={{ backgroundImage: `url(${plan.thumbnail || ''})` }}>
                  <div className="plan-actions">
                    <Link to={`/plans/${plan.id}`} className="action-button view">查看</Link>
                    <Link to={`/plans/${plan.id}/map2D`} className="action-button edit">2D地图</Link>
                    <Link to={`/plans/${plan.id}/map3D`} className="action-button view-3d">3D视图</Link>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={!dataSource}
                      title={!dataSource ? '服务状态未知，无法删除' : '删除计划'}
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="plan-details">
                  <h3 className="plan-name">{plan.name || '未命名计划'}</h3>
                  <div className="plan-location">📍 {plan.location || '未知地点'}</div>
                  <div className="plan-date">📅 {formatDate(plan.date)}</div>
                  {plan.shootingTime && (
                    <div className="plan-time">⏰ {plan.shootingTime}</div>
                  )}
                  {plan.description && (
                    <div className="plan-description">{plan.description}</div>
                  )}
                  <div className="plan-tags">
                    {(plan.tags || []).map(tag => (
                      <span key={tag} className="plan-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="plan-meta-info">
                    {plan.createdAt && (
                      <div className="plan-created">
                        创建: {formatDate(plan.createdAt)}
                      </div>
                    )}
                    {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
                      <div className="plan-updated">
                        更新: {formatDate(plan.updatedAt)}
                      </div>
                    )}
                    <div className="plan-id">ID: {plan.id}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PlansListPage;
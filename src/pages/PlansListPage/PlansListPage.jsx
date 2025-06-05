import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout';
import HybridPlanStorage, { DATA_SOURCE } from '../../services/hybridPlanStorage';
import { PlanAPIService, checkAPIConnection } from '../../services/apiService';
import imageService from '../../services/imageService';
import './PlansListPage.css';
import { FiRefreshCw } from 'react-icons/fi';
import { MdImage } from 'react-icons/md';

const PlansListPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [apiStatus, setApiStatus] = useState({ connected: false, message: '检查中...' });
  const [dataSource, setDataSource] = useState({ source: DATA_SOURCE.UNKNOWN, error: null });
  const navigate = useNavigate();

  // 获取所有唯一标签
  const allTags = [...new Set(plans.flatMap(plan => plan.tags || []))];

  // 检查API连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkAPIConnection();
        setApiStatus(status);
        console.log('🌐 API状态:', status);
      } catch (error) {
        setApiStatus({ connected: false, message: '连接检查失败' });
      }
    };

    checkConnection();
  }, []);

  // 加载计划数据 - 使用混合存储服务
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      
      try {
        console.log('🔄 开始从混合存储加载计划数据...');
        
        const result = await HybridPlanStorage.getAllPlans();
        
        // 更新数据源状态
        setDataSource({ 
          source: result.source, 
          error: result.error 
        });

        console.log('📊 混合存储返回数据:', {
          recent: result.data.recentPlans.length,
          upcoming: result.data.upcomingPlans.length,
          source: result.source,
          error: result.error
        });

        const allPlansData = [...result.data.recentPlans, ...result.data.upcomingPlans];

        if (allPlansData.length === 0) {
          setPlans([]);
          console.log('📋 暂无计划数据');
          return;
        }

        // 为计划获取图片
        const plansWithImages = await Promise.all(
          allPlansData.map(async (plan) => {
            const safePlan = {
              id: plan.id || `plan-${Date.now()}`,
              name: plan.name || plan.planName || '未命名计划',
              location: plan.location || '未知地点',
              tags: Array.isArray(plan.tags) ? plan.tags : [],
              date: plan.shootingDate || plan.date || new Date().toISOString(),
              shootingTime: plan.shootingTime || '',
              description: plan.description || '',
              createdAt: plan.createdAt || new Date().toISOString(),
              updatedAt: plan.updatedAt || new Date().toISOString(),
              ...plan
            };

            try {
              const imageData = await imageService.getImageByTags(safePlan.location, safePlan.tags);
              return {
                ...safePlan,
                thumbnail: imageData.thumbnail,
                imageUrl: imageData.url,
                imageAlt: imageData.alt,
                photographer: imageData.photographer,
                photographerUrl: imageData.photographerUrl
              };
            } catch (error) {
              console.error(`加载 ${safePlan.name} 的图片失败:`, error);
              return {
                ...safePlan,
                thumbnail: `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(safePlan.location)}`,
                imageUrl: `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(safePlan.location)}`,
                imageAlt: `${safePlan.location}的占位图片`,
                photographer: '占位图片',
                photographerUrl: '#'
              };
            }
          })
        );

        setPlans(plansWithImages);
        console.log('✅ 计划数据加载完成');
      } catch (error) {
        console.error('❌ 加载计划数据失败:', error);
        setPlans([]);
        setDataSource({ source: DATA_SOURCE.UNKNOWN, error: error.message });
      } finally {
        setLoading(false);
      }
    };

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
      
      if (sortBy === 'dateAsc') {
        return dateA - dateB;
      } else if (sortBy === 'dateDesc') {
        return dateB - dateA;
      } else if (sortBy === 'nameAsc') {
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

  // 删除计划功能
  const handleDeletePlan = async (id) => {
    if (!apiStatus.connected) {
      alert('API连接失败，无法删除计划');
      return;
    }

    if (window.confirm('确定要删除此计划吗？此操作不可撤销。')) {
      try {
        console.log(`🗑️ 删除计划: ${id}`);
        
        const success = await PlanAPIService.deletePlan(id);
        if (success) {
          setPlans(plans.filter(plan => plan.id !== id));
          alert('计划删除成功！');
          console.log(`✅ 计划 ${id} 删除成功`);
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('❌ 删除计划失败:', error);
        alert(`删除失败: ${error.message}`);
      }
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
              thumbnail: imageData.thumbnail,
              imageUrl: imageData.url,
              imageAlt: imageData.alt,
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
    if (!apiStatus.connected) {
      alert('API连接失败，无法刷新计划');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 开始刷新计划数据...');
      
      const allPlansData = await PlanAPIService.getAllPlans();

      console.log('📊 刷新获取的计划数据:', allPlansData.length, '个计划');

      if (allPlansData.length === 0) {
        setPlans([]);
        alert('API中暂无计划数据');
        return;
      }

      const refreshedPlans = await Promise.all(
        allPlansData.map(async (plan) => {
          const safePlan = {
            id: plan.id || `plan-${Date.now()}`,
            name: plan.name || plan.planName || '未命名计划',
            location: plan.location || '未知地点',
            tags: Array.isArray(plan.tags) ? plan.tags : [],
            date: plan.shootingDate || plan.date || new Date().toISOString(),
            shootingTime: plan.shootingTime || '',
            description: plan.description || '',
            createdAt: plan.createdAt || new Date().toISOString(),
            updatedAt: plan.updatedAt || new Date().toISOString(),
            ...plan
          };

          const existingPlan = plans.find(p => p.id === safePlan.id);
          if (existingPlan && existingPlan.thumbnail) {
            return {
              ...safePlan,
              thumbnail: existingPlan.thumbnail,
              imageUrl: existingPlan.imageUrl,
              imageAlt: existingPlan.imageAlt,
              photographer: existingPlan.photographer,
              photographerUrl: existingPlan.photographerUrl
            };
          }

          try {
            const imageData = await imageService.getImageByTags(safePlan.location, safePlan.tags);
            return {
              ...safePlan,
              thumbnail: imageData.thumbnail,
              imageUrl: imageData.url,
              imageAlt: imageData.alt,
              photographer: imageData.photographer,
              photographerUrl: imageData.photographerUrl
            };
          } catch (error) {
            console.error(`加载 ${safePlan.name} 的图片失败:`, error);
            return {
              ...safePlan,
              thumbnail: `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(safePlan.location)}`,
              imageUrl: `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(safePlan.location)}`,
              imageAlt: `${safePlan.location}的占位图片`,
              photographer: '占位图片',
              photographerUrl: '#'
            };
          }
        })
      );

      setPlans(refreshedPlans);
      alert(`计划列表已更新！从API获取到 ${refreshedPlans.length} 个计划`);
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
        {/* API连接状态指示器 */}
        <div className={`api-status ${apiStatus.connected ? 'connected' : 'disconnected'}`}>
          {apiStatus.connected ? '✅ API已连接' : '❌ ' + apiStatus.message}
        </div>

        {/* 数据源状态指示器 */}
        {dataSource.source !== DATA_SOURCE.UNKNOWN && (
          <div className={`data-source-status ${dataSource.source === DATA_SOURCE.API ? 'success' : 'warning'}`}>
            {dataSource.source === DATA_SOURCE.API 
              ? '📡 数据来自API服务器' 
              : `⚠️ API连接失败，显示本地缓存数据${dataSource.error ? ` (${dataSource.error})` : ''}`
            }
          </div>
        )}

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
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="dateAsc">日期 (最旧优先)</option>
                <option value="dateDesc">日期 (最新优先)</option>
                <option value="nameAsc">名称 (A-Z)</option>
                <option value="nameDesc">名称 (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleRefreshPlans}
              className="refresh-button"
              disabled={loading || !apiStatus.connected}
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
              {loading ? '刷新中...' : '🖼️ 刷新图片'}
            </button>
            <Link to="/plans/new" className="new-plan-button">
              + 创建新计划
            </Link>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-message">
              <p>正在加载数据...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
        )}

        <div className="plans-stats">
          <p>
            共找到 {filteredPlans.length} 个计划 
            {plans.length > filteredPlans.length ? `(共 ${plans.length} 个)` : ''}
            {dataSource.source === DATA_SOURCE.LOCAL && <span className="api-warning"> ⚠️ 本地缓存数据</span>}
          </p>
        </div>

        <div className="plans-grid">
          {filteredPlans.length > 0 ? (
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
                      disabled={!apiStatus.connected}
                      title={!apiStatus.connected ? 'API未连接，无法删除' : '删除计划'}
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
                    {dataSource.source === DATA_SOURCE.LOCAL && (
                      <div className="data-source-indicator" style={{ fontSize: '10px', color: '#888' }}>
                        📦 本地缓存
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans-message">
              {plans.length === 0 ? (
                <>
                  <p>🎯 {dataSource.source === DATA_SOURCE.LOCAL ? '本地缓存中' : 'API中'}还没有任何拍摄计划</p>
                  <p>开始创建您的第一个摄影计划吧！</p>
                  <Link to="/plans/new" className="clear-filters-button">
                    创建第一个计划
                  </Link>
                </>
              ) : (
                <>
                  <p>😔 没有符合筛选条件的计划</p>
                  <button 
                    className="clear-filters-button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTags([]);
                    }}
                  >
                    清除筛选条件
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PlansListPage;
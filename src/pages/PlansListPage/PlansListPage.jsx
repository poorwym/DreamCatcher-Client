import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout';
import imageService from '../../services/imageService';
import PlanStorage, { PlanAPIService, checkAPIConnection } from '../../services/apiService';
import './PlansListPage.css';
import { FiRefreshCw } from 'react-icons/fi';
import { MdImage } from 'react-icons/md';

const PlansListPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('dateDesc');
  const [apiStatus, setApiStatus] = useState({ connected: false, message: '检查中...' });

  // 动态获取所有可用标签
  const allTags = [...new Set(plans.flatMap(plan => (plan.tags && Array.isArray(plan.tags)) ? plan.tags : []))];

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

  // 加载所有计划数据
  useEffect(() => {
    const loadAllPlans = async () => {
      setLoading(true);
      
      try {
        console.log('🔄 开始从API加载计划数据...');
        
        const allPlansData = await PlanAPIService.getAllPlans();

        console.log('📊 API返回计划数据:', allPlansData.length, '个计划');

        if (!allPlansData || allPlansData.length === 0) {
          console.log('📭 API返回空数据，设置空数组');
          setPlans([]);
          return;
        }

        // 为每个计划加载图片
        const plansWithImages = await Promise.all(
          allPlansData.map(async (plan) => {
            try {
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
                latitude: plan.latitude || '',
                longitude: plan.longitude || '',
                altitude: plan.altitude || '',
                focalLength: plan.focalLength || '50',
                aperture: plan.aperture || '1.5',
                tilesetUrl: plan.tilesetUrl || '',
                userId: plan.userId || 'default_user',
                ...plan
              };

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
              console.error(`加载 ${plan.name || plan.planName} 的图片失败:`, error);
              
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

        console.log('✅ 处理后的计划数据:', plansWithImages.length, '个计划');
        setPlans(plansWithImages);
      } catch (error) {
        console.error('❌ 加载计划失败:', error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllPlans();
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
          <p>
            共找到 {filteredPlans.length} 个计划 
            {plans.length > filteredPlans.length ? `(共 ${plans.length} 个)` : ''}
            {!apiStatus.connected && <span className="api-warning"> ⚠️ API未连接</span>}
          </p>
        </div>

        <div className="plans-grid">
          {!apiStatus.connected ? (
            <div className="api-error-message">
              <div className="error-content">
                <h3>🔌 API连接失败</h3>
                <p>无法连接到后端服务，请检查：</p>
                <ul>
                  <li>后端服务是否正常运行</li>
                  <li>API地址配置是否正确</li>
                  <li>网络连接是否正常</li>
                </ul>
                <button 
                  onClick={() => window.location.reload()} 
                  className="retry-button"
                >
                  重试连接
                </button>
              </div>
            </div>
          ) : filteredPlans.length > 0 ? (
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
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans-message">
              {plans.length === 0 ? (
                <>
                  <p>🎯 API中还没有任何拍摄计划</p>
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
/**
 * 图片服务 - 通用智能匹配算法
 * 支持任意新主题的动态识别和匹配
 */

const UNSPLASH_API_KEY = 'C8rXmGY84jAU7f04x-PkCqiu50iaIfSj_BE8GOgeMPI';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

const imageCache = new Map();

// 通用地理词汇识别
const GEO_PATTERNS = {
  // 山脉标识
  mountains: {
    suffixes: ['山', '峰', '岭', '岗', '坡', '崖', '谷'],
    keywords: ['山脉', '高峰', '雪山', '火山'],
    englishKeywords: ['mountain', 'peak', 'ridge', 'summit', 'hill', 'volcano'],
    scenes: ['sunrise', 'sunset', 'landscape', 'hiking']
  },
  
  // 水体标识
  waters: {
    suffixes: ['湖', '海', '江', '河', '溪', '泉', '潭', '池', '湾'],
    keywords: ['湖泊', '海洋', '河流', '瀑布', '温泉'],
    englishKeywords: ['lake', 'ocean', 'sea', 'river', 'waterfall', 'spring'],
    scenes: ['reflection', 'sunset', 'beach', 'waves']
  },
  
  // 城市/建筑标识
  places: {
    suffixes: ['市', '县', '区', '镇', '村', '乡', '城', '都', '京', '州'],
    keywords: ['古城', '古镇', '老街', '建筑', '寺庙', '塔', '桥', '宫殿'],
    englishKeywords: ['city', 'town', 'ancient', 'temple', 'architecture', 'bridge'],
    scenes: ['architecture', 'street', 'traditional', 'historical']
  },
  
  // 自然景观标识
  nature: {
    suffixes: ['林', '森', '园', '谷', '沟', '原', '坝', '滩', '岛'],
    keywords: ['森林', '草原', '沙漠', '湿地', '竹林', '花园'],
    englishKeywords: ['forest', 'grassland', 'desert', 'wetland', 'bamboo', 'garden'],
    scenes: ['nature', 'wilderness', 'trees', 'flowers']
  }
};

// 时间/天气场景识别
const SCENE_PATTERNS = {
  time: {
    '日出': ['sunrise', 'dawn', 'morning light', 'golden hour morning'],
    '日落': ['sunset', 'dusk', 'evening light', 'golden hour evening'],
    '黄昏': ['twilight', 'dusk', 'evening glow'],
    '夜景': ['night', 'night lights', 'illuminated', 'after dark'],
    '星空': ['starry sky', 'night sky', 'milky way', 'stars'],
    '凌晨': ['early morning', 'dawn', 'pre-sunrise'],
    '正午': ['midday', 'noon', 'bright sunlight'],
    '傍晚': ['evening', 'late afternoon', 'golden hour']
  },
  
  weather: {
    '云海': ['sea of clouds', 'cloud ocean', 'misty mountains'],
    '雾景': ['foggy', 'misty', 'fog', 'haze'],
    '雪景': ['snow', 'winter', 'snowy landscape'],
    '雨景': ['rain', 'rainy', 'wet', 'storm'],
    '彩虹': ['rainbow', 'colorful sky', 'after rain'],
    '晴空': ['clear sky', 'blue sky', 'sunny'],
    '多云': ['cloudy', 'overcast', 'dramatic clouds']
  },
  
  season: {
    '春景': ['spring', 'cherry blossom', 'flowers blooming'],
    '夏景': ['summer', 'lush green', 'vibrant'],
    '秋景': ['autumn', 'fall colors', 'golden leaves'],
    '冬景': ['winter', 'snow', 'frozen', 'ice']
  }
};

// 摄影风格识别
const STYLE_PATTERNS = {
  '人像': ['portrait', 'people', 'human'],
  '风景': ['landscape', 'scenery', 'vista'],
  '建筑': ['architecture', 'building', 'structure'],
  '街拍': ['street photography', 'urban', 'candid'],
  '野生动物': ['wildlife', 'animals', 'nature'],
  '微距': ['macro', 'close-up', 'detail'],
  '航拍': ['aerial', 'drone', 'bird eye view'],
  '长曝光': ['long exposure', 'motion blur', 'light trails'],
  '黑白': ['black and white', 'monochrome', 'grayscale']
};

/**
 * 智能分析标题 - 动态识别地理和场景特征
 */
const analyzeTitle = (title) => {
  console.log(`🔍 智能分析标题: "${title}"`);
  
  const analysis = {
    geoType: null,
    geoName: '',
    location: '',
    keywords: [],
    confidence: 0
  };
  
  // 1. 优先识别知名地点（精确匹配）
  const knownPlaces = {
    '海南': { type: 'waters', keywords: ['Hainan', 'tropical', 'beach'], confidence: 25 },
    '三亚': { type: 'waters', keywords: ['Sanya', 'Hainan', 'beach'], confidence: 30 },
    '张家界': { type: 'mountains', keywords: ['Zhangjiajie', 'stone', 'pillars'], confidence: 30 },
    '黄山': { type: 'mountains', keywords: ['Huangshan', 'Yellow Mountain'], confidence: 30 },
    '玉龙雪山': { type: 'mountains', keywords: ['Jade Dragon', 'snow mountain'], confidence: 30 },
    '西湖': { type: 'waters', keywords: ['West Lake', 'Hangzhou'], confidence: 30 },
    '长城': { type: 'places', keywords: ['Great Wall', 'ancient'], confidence: 30 },
    '泰山': { type: 'mountains', keywords: ['Mount Tai'], confidence: 25 },
    '华山': { type: 'mountains', keywords: ['Mount Hua'], confidence: 25 },
    '九寨沟': { type: 'waters', keywords: ['Jiuzhaigou', 'valley'], confidence: 25 },
    '桂林': { type: 'waters', keywords: ['Guilin', 'karst'], confidence: 25 },
    '丽江': { type: 'places', keywords: ['Lijiang', 'ancient town'], confidence: 25 }
  };
  
  // 检查知名地点
  for (const [place, info] of Object.entries(knownPlaces)) {
    if (title.includes(place)) {
      analysis.geoType = info.type;
      analysis.geoName = place;
      analysis.location = place;
      analysis.keywords.push(...info.keywords);
      analysis.confidence = info.confidence;
      console.log(`✅ 识别知名地点: ${place}`);
      break;
    }
  }
  
  // 2. 如果没有找到知名地点，识别地理后缀
  if (!analysis.geoType) {
    for (const [type, patterns] of Object.entries(GEO_PATTERNS)) {
      for (const suffix of patterns.suffixes) {
        if (title.includes(suffix)) {
          analysis.geoType = type;
          analysis.confidence += 20;
          
          // 提取地名（去掉后缀或包含后缀）
          const index = title.indexOf(suffix);
          if (index > 0) {
            analysis.geoName = title.substring(Math.max(0, index - 2), index + 1);
            analysis.location = analysis.geoName;
          } else {
            analysis.geoName = title.substring(0, Math.min(4, title.length));
            analysis.location = analysis.geoName;
          }
          break;
        }
      }
      if (analysis.geoType) break;
    }
  }
  
  // 3. 兜底：提取可能的地名
  if (!analysis.geoType) {
    // 从标题开头提取2-3个字符作为地名
    const possibleName = title.substring(0, Math.min(3, title.length));
    analysis.geoName = possibleName;
    analysis.location = possibleName;
    analysis.geoType = 'unknown';
    analysis.confidence = 5;
  }
  
  // 4. 添加对应的英文关键词
  if (analysis.geoType && analysis.geoType !== 'unknown') {
    const patterns = GEO_PATTERNS[analysis.geoType];
    if (patterns && analysis.keywords.length === 0) {
      analysis.keywords.push(...patterns.englishKeywords.slice(0, 2));
      analysis.keywords.push(...patterns.scenes.slice(0, 1));
    }
  }
  
  // 5. 通用关键词
  analysis.keywords.push('China', 'landscape');
  
  console.log(`📊 分析结果:`, analysis);
  return analysis;
};

/**
 * 智能分析标签 - 识别场景、时间、风格
 */
const analyzeTags = (tags) => {
  console.log(`🏷️ 分析标签: [${tags.join(', ')}]`);
  
  const analysis = {
    timeScene: [],
    weatherScene: [],
    seasonScene: [],
    styleScene: [],
    unknownTags: [],
    priority: []
  };
  
  for (const tag of tags) {
    let found = false;
    
    // 检查时间场景
    for (const [key, values] of Object.entries(SCENE_PATTERNS.time)) {
      if (tag.includes(key) || key.includes(tag)) {
        analysis.timeScene.push({ tag, keywords: values, priority: 'high' });
        found = true;
        break;
      }
    }
    
    // 检查天气场景
    if (!found) {
      for (const [key, values] of Object.entries(SCENE_PATTERNS.weather)) {
        if (tag.includes(key) || key.includes(tag)) {
          analysis.weatherScene.push({ tag, keywords: values, priority: 'medium' });
          found = true;
          break;
        }
      }
    }
    
    // 检查季节场景
    if (!found) {
      for (const [key, values] of Object.entries(SCENE_PATTERNS.season)) {
        if (tag.includes(key) || key.includes(tag)) {
          analysis.seasonScene.push({ tag, keywords: values, priority: 'medium' });
          found = true;
          break;
        }
      }
    }
    
    // 检查摄影风格
    if (!found) {
      for (const [key, values] of Object.entries(STYLE_PATTERNS)) {
        if (tag.includes(key) || key.includes(tag)) {
          analysis.styleScene.push({ tag, keywords: values, priority: 'low' });
          found = true;
          break;
        }
      }
    }
    
    // 未识别的标签
    if (!found) {
      analysis.unknownTags.push(tag);
    }
  }
  
  // 按优先级排序
  const allScenes = [
    ...analysis.timeScene,
    ...analysis.weatherScene,
    ...analysis.seasonScene,
    ...analysis.styleScene
  ];
  
  analysis.priority = allScenes.sort((a, b) => {
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  console.log(`📊 标签分析结果:`, analysis);
  return analysis;
};

/**
 * 构建智能搜索查询 - 更精确的策略
 */
const buildIntelligentQueries = (title, tags) => {
  const titleAnalysis = analyzeTitle(title);
  const tagAnalysis = analyzeTags(tags);
  
  const queries = [];
  
  // 策略1: 精确地名 + 高优先级场景（最重要）
  if (titleAnalysis.confidence >= 25 && tagAnalysis.priority.length > 0) {
    const topScene = tagAnalysis.priority[0];
    const geoKeywords = titleAnalysis.keywords.slice(0, 2).join(' ');
    
    queries.push({
      query: `${titleAnalysis.geoName} ${topScene.keywords[0]} ${geoKeywords}`,
      priority: 1,
      description: `精确匹配: ${titleAnalysis.geoName} + ${topScene.tag}`,
      expectedElements: [topScene.tag, titleAnalysis.geoName]
    });
    
    // 添加英文版本
    queries.push({
      query: `${titleAnalysis.keywords[0]} ${topScene.keywords[0]} China`,
      priority: 1.5,
      description: `英文精确: ${titleAnalysis.keywords[0]} + ${topScene.tag}`,
      expectedElements: [topScene.tag, titleAnalysis.geoName]
    });
  }
  
  // 策略2: 地名 + 场景 + 地理类型特征
  if (titleAnalysis.geoName && tagAnalysis.priority.length > 0) {
    const mainScene = tagAnalysis.priority[0];
    const geoTypeKeyword = titleAnalysis.geoType !== 'unknown' ? 
      GEO_PATTERNS[titleAnalysis.geoType]?.englishKeywords[0] : '';
    
    if (geoTypeKeyword) {
      queries.push({
        query: `${titleAnalysis.geoName} ${mainScene.keywords[0]} ${geoTypeKeyword} China`,
        priority: 2,
        description: `地名+场景+类型: ${titleAnalysis.geoName} + ${mainScene.tag} + ${geoTypeKeyword}`,
        expectedElements: [titleAnalysis.geoName, mainScene.tag]
      });
    }
  }
  
  // 策略3: 纯场景搜索（当地名不够明确时）
  if (tagAnalysis.priority.length > 0) {
    const topScenes = tagAnalysis.priority.slice(0, 2);
    const sceneKeywords = topScenes.map(s => s.keywords[0]).join(' ');
    
    queries.push({
      query: `${sceneKeywords} ${titleAnalysis.geoName || ''} China landscape`,
      priority: 3,
      description: `场景优先: ${topScenes.map(s => s.tag).join('+')}`,
      expectedElements: topScenes.map(s => s.tag)
    });
  }
  
  // 策略4: 地名 + 通用关键词
  if (titleAnalysis.geoName) {
    queries.push({
      query: `${titleAnalysis.geoName} China landscape photography`,
      priority: 4,
      description: `纯地名: ${titleAnalysis.geoName}`,
      expectedElements: [titleAnalysis.geoName]
    });
    
    // 如果有英文关键词，也尝试英文搜索
    if (titleAnalysis.keywords.length > 0) {
      queries.push({
        query: `${titleAnalysis.keywords[0]} landscape China`,
        priority: 4.5,
        description: `英文地名: ${titleAnalysis.keywords[0]}`,
        expectedElements: [titleAnalysis.geoName]
      });
    }
  }
  
  // 策略5: 组合未知标签
  if (tagAnalysis.unknownTags.length > 0) {
    const unknownQuery = `${tagAnalysis.unknownTags.join(' ')} ${titleAnalysis.geoName || title} China`;
    queries.push({
      query: unknownQuery,
      priority: 5,
      description: `未知标签组合: ${tagAnalysis.unknownTags.join('+')}`,
      expectedElements: tagAnalysis.unknownTags
    });
  }
  
  return queries.slice(0, 6); // 限制查询数量，提高效率
};

/**
 * 增强的图片验证
 */
const validateImageContent = (imageData, titleAnalysis, tagAnalysis) => {
  const description = (imageData.alt_description || '').toLowerCase();
  const tags = imageData.tags ? imageData.tags.map(t => t.title?.toLowerCase() || '') : [];
  const allText = `${description} ${tags.join(' ')}`;
  
  let score = 0;
  const reasons = [];
  
  // 地名匹配
  if (titleAnalysis.geoName) {
    const geoName = titleAnalysis.geoName.toLowerCase();
    if (allText.includes(geoName) || description.includes(geoName)) {
      score += 25;
      reasons.push(`✅ 地名匹配: ${titleAnalysis.geoName}`);
    }
  }
  
  // 地理类型匹配
  if (titleAnalysis.geoType && titleAnalysis.geoType !== 'unknown') {
    const geoPattern = GEO_PATTERNS[titleAnalysis.geoType];
    for (const keyword of geoPattern.englishKeywords) {
      if (allText.includes(keyword)) {
        score += 15;
        reasons.push(`✅ 地理类型: ${keyword}`);
        break;
      }
    }
  }
  
  // 场景匹配
  for (const scene of tagAnalysis.priority.slice(0, 2)) {
    for (const keyword of scene.keywords) {
      if (allText.includes(keyword.toLowerCase())) {
        score += scene.priority === 'high' ? 20 : 10;
        reasons.push(`✅ 场景匹配: ${scene.tag}(${keyword})`);
        break;
      }
    }
  }
  
  // 质量指标
  const likes = imageData.likes || 0;
  if (likes > 100) {
    score += 5;
    reasons.push(`✅ 高质量: ${likes}赞`);
  }
  
  // 尺寸匹配
  if (imageData.width >= 1920 && imageData.height >= 1080) {
    score += 5;
    reasons.push(`✅ 高分辨率`);
  }
  
  console.log(`🎯 图片验证: "${description}" -> 得分: ${score}`);
  console.log(`📝 ${reasons.join(', ')}`);
  
  return { score, reasons, description: allText };
};

/**
 * 执行智能搜索
 */
const performIntelligentSearch = async (query, titleAnalysis, tagAnalysis) => {
  try {
    console.log(`🔍 执行搜索: "${query.query}"`);
    
    const response = await fetch(`${UNSPLASH_API_URL}/search/photos?${new URLSearchParams({
      query: query.query,
      orientation: 'landscape',
      per_page: 5,
      order_by: 'relevant'
    })}`, {
      headers: { 'Authorization': `Client-ID ${UNSPLASH_API_KEY}` }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.results?.length) return null;
    
    // 验证并评分所有图片
    const scoredImages = data.results.map(image => ({
      image,
      validation: validateImageContent(image, titleAnalysis, tagAnalysis)
    }));
    
    // 选择最高分图片
    const best = scoredImages.reduce((prev, curr) => 
      curr.validation.score > prev.validation.score ? curr : prev
    );
    
    // 设置分数阈值
    const threshold = titleAnalysis.confidence > 15 ? 20 : 10;
    
    if (best.validation.score >= threshold) {
      return {
        url: best.image.urls.regular,
        thumbnail: best.image.urls.small,
        alt: best.image.alt_description || query.description,
        photographer: best.image.user.name,
        photographerUrl: best.image.user.links.html,
        searchQuery: query.query,
        likes: best.image.likes || 0,
        validationScore: best.validation.score,
        validationReasons: best.validation.reasons,
        strategy: query.description
      };
    }
    
    return null;
  } catch (error) {
    console.error(`搜索错误: ${query.query}`, error);
    return null;
  }
};

/**
 * 主搜索方法 - 通用智能匹配（添加详细调试）
 */
const getImageByTitleAndTags = async (title, tags = [], forceRefresh = false) => {
  const cacheKey = `${title}-${tags.join('-')}`;
  
  // 详细日志
  console.log(`\n🎯 === 图片搜索开始 ===`);
  console.log(`📝 标题: "${title}"`);
  console.log(`🏷️ 标签: [${tags.join(', ')}]`);
  console.log(`🔑 缓存键: "${cacheKey}"`);
  console.log(`🔄 强制刷新: ${forceRefresh}`);
  
  // 强制刷新时清除该项缓存
  if (forceRefresh && imageCache.has(cacheKey)) {
    imageCache.delete(cacheKey);
    console.log(`🗑️ 已清除缓存: ${cacheKey}`);
  }
  
  if (imageCache.has(cacheKey) && !forceRefresh) {
    const cached = imageCache.get(cacheKey);
    console.log(`💾 使用缓存图片: ${cached.searchQuery || '未知来源'}`);
    console.log(`🎯 === 搜索结束（缓存） ===\n`);
    return cached;
  }
  
  try {
    console.log(`🚀 开始智能搜索...`);
    
    const titleAnalysis = analyzeTitle(title);
    const tagAnalysis = analyzeTags(tags);
    const queries = buildIntelligentQueries(title, tags);
    
    console.log(`📊 标题分析:`, titleAnalysis);
    console.log(`📊 标签分析:`, tagAnalysis);
    console.log(`📋 生成 ${queries.length} 个搜索策略:`, queries.map(q => q.query));
    
    // 按优先级尝试每个策略
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`🔍 尝试策略 ${i + 1}/${queries.length}: "${query.query}"`);
      
      const result = await performIntelligentSearch(query, titleAnalysis, tagAnalysis);
      if (result) {
        console.log(`✅ 搜索成功! 策略: ${query.description}`);
        console.log(`📸 图片URL: ${result.url}`);
        console.log(`⭐ 验证得分: ${result.validationScore}`);
        
        // 添加调试信息
        result.debugInfo = {
          title,
          tags,
          cacheKey,
          strategy: query.description,
          searchQuery: query.query,
          titleAnalysis,
          tagAnalysis
        };
        
        imageCache.set(cacheKey, result);
        console.log(`💾 已缓存结果: ${cacheKey}`);
        console.log(`🎯 === 搜索结束（成功） ===\n`);
        return result;
      } else {
        console.log(`❌ 策略失败: ${query.description}`);
      }
    }
    
    // 生成智能占位图
    console.log(`⚠️ 所有搜索策略失败，生成占位图`);
    const placeholder = generateIntelligentPlaceholder(title, tags, titleAnalysis, tagAnalysis);
    placeholder.debugInfo = {
      title,
      tags,
      cacheKey,
      strategy: 'placeholder',
      reason: 'all_searches_failed',
      titleAnalysis,
      tagAnalysis
    };
    
    console.log(`🎨 占位图生成: ${placeholder.url}`);
    console.log(`🎯 === 搜索结束（占位图） ===\n`);
    return placeholder;
    
  } catch (error) {
    console.error('🚨 智能搜索错误:', error);
    console.log(`🎯 === 搜索结束（错误） ===\n`);
    return generateIntelligentPlaceholder(title, tags);
  }
};

/**
 * 批量强制刷新图片
 */
const forceRefreshImages = async (plans) => {
  console.log(`🔄 开始批量强制刷新 ${plans.length} 张图片...`);
  
  const results = await Promise.all(
    plans.map(({ title, tags }) => 
      getImageByTitleAndTags(title, tags, true) // 强制刷新
    )
  );
  
  console.log(`✅ 批量刷新完成`);
  return results;
};

/**
 * 缓存调试工具
 */
const getCacheStatus = () => {
  const cacheEntries = [];
  for (const [key, value] of imageCache.entries()) {
    cacheEntries.push({
      key,
      url: value.url?.substring(0, 50) + '...',
      strategy: value.debugInfo?.strategy || value.strategy || '未知',
      searchQuery: value.searchQuery || '未知查询'
    });
  }
  
  return {
    size: imageCache.size,
    entries: cacheEntries
  };
};

/**
 * 检查是否有重复图片
 */
const findDuplicateImages = () => {
  const urlMap = new Map();
  const duplicates = [];
  
  for (const [key, value] of imageCache.entries()) {
    const url = value.url;
    if (urlMap.has(url)) {
      duplicates.push({
        url,
        keys: [urlMap.get(url), key]
      });
    } else {
      urlMap.set(url, key);
    }
  }
  
  return duplicates;
};

/**
 * 强制清除并重新搜索特定项目
 */
const forceSearchSpecific = async (title, tags = []) => {
  const cacheKey = `${title}-${tags.join('-')}`;
  console.log(`🔄 强制搜索: ${title}`);
  
  // 清除缓存
  imageCache.delete(cacheKey);
  
  // 重新搜索
  return await getImageByTitleAndTags(title, tags, true);
};

/**
 * 全局调试工具 - 挂载到window对象
 */
const setupGlobalDebugTools = () => {
  // 挂载到全局，方便在控制台调用
  window.debugImageService = {
    // 基本信息
    status: () => {
      console.log('=== 图片服务调试信息 ===');
      console.log('缓存大小:', imageCache.size);
      console.log('缓存内容:', getCacheStatus());
      console.log('重复图片:', findDuplicateImages());
    },
    
    // 清理操作
    clear: () => {
      imageService.clearCache();
      console.log('✅ 已清除所有缓存');
    },
    
    // 测试搜索策略
    testQueries: (title, tags = []) => {
      console.log(`=== ${title} 的搜索策略 ===`);
      const queries = imageService.buildIntelligentQueries(title, tags);
      queries.forEach((q, i) => {
        console.log(`${i + 1}. ${q.description}: "${q.query}"`);
      });
      return queries;
    },
    
    // 强制刷新
    refresh: async (title, tags = []) => {
      console.log(`🔄 强制刷新: ${title}`);
      const result = await imageService.forceSearchSpecific(title, tags);
      console.log('✅ 刷新完成:', result.url);
      return result;
    },
    
    // 批量测试
    testAll: () => {
      console.log('=== 测试所有标题的搜索策略 ===');
      const tests = [
        { title: '海南晚霞', tags: ['日落'] },
        { title: '张家界', tags: ['山景'] },
        { title: '玉龙雪山', tags: ['雪景'] },
        { title: '黄山日出', tags: ['日出'] },
        { title: '西湖黄昏', tags: ['湖景'] },
        { title: '长城星轨', tags: ['夜景'] }
      ];
      
      tests.forEach(test => {
        console.log(`\n--- ${test.title} ---`);
        const queries = imageService.buildIntelligentQueries(test.title, test.tags);
        queries.slice(0, 3).forEach((q, i) => {
          console.log(`${i + 1}. "${q.query}"`);
        });
      });
    }
  };
  
  console.log('🔧 调试工具已就绪！在控制台输入以下命令：');
  console.log('debugImageService.status() - 查看状态');
  console.log('debugImageService.clear() - 清除缓存');
  console.log('debugImageService.testAll() - 测试所有搜索策略');
  console.log('debugImageService.refresh("海南晚霞", ["日落"]) - 强制刷新特定项目');
};

// 自动设置调试工具
if (typeof window !== 'undefined') {
  setupGlobalDebugTools();
}

/**
 * 智能占位图生成
 */
const generateIntelligentPlaceholder = (title, tags, titleAnalysis, tagAnalysis) => {
  // 根据分析结果选择颜色
  const colorMap = {
    // 地理类型
    mountains: '#8B4513', waters: '#4682B4', places: '#708090', nature: '#228B22',
    // 时间场景
    '日出': '#FF6347', '日落': '#FF8C00', '夜景': '#191970', '星空': '#000080',
    // 天气场景  
    '雪景': '#F0F8FF', '云海': '#B0C4DE', '雾景': '#D3D3D3'
  };
  
  let color = '#667EEA';
  
  // 优先使用高优先级标签的颜色
  if (tagAnalysis?.priority?.length > 0) {
    const topTag = tagAnalysis.priority[0].tag;
    if (colorMap[topTag]) color = colorMap[topTag];
  }
  
  // 然后使用地理类型颜色
  if (color === '#667EEA' && titleAnalysis?.geoType) {
    if (colorMap[titleAnalysis.geoType]) color = colorMap[titleAnalysis.geoType];
  }
  
  return {
    url: `https://via.placeholder.com/800x600/${color.substring(1)}/ffffff?text=${encodeURIComponent(title)}`,
    thumbnail: `https://via.placeholder.com/300x200/${color.substring(1)}/ffffff?text=${encodeURIComponent(title)}`,
    alt: `${title}的智能占位图`,
    photographer: 'AI占位图',
    photographerUrl: '#',
    searchQuery: 'intelligent_placeholder',
    validationScore: 0,
    strategy: '智能占位图生成'
  };
};

// 工具方法
const preloadCommonLocations = async () => {
  const plans = [
    { title: '黄山日出', tags: ['日出', '山景'] },
    { title: '西湖日落', tags: ['日落', '湖景'] },
    { title: '长城夜景', tags: ['夜景'] },
    { title: '张家界', tags: ['山景'] },
    { title: '三亚海滩', tags: ['海景'] },
    { title: '青海湖', tags: ['湖景'] }
  ];
  
  console.log('🚀 预加载常用图片...');
  const results = await Promise.allSettled(
    plans.map(p => getImageByTitleAndTags(p.title, p.tags))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`✅ 预加载完成: ${successful}/${plans.length}`);
  return results;
};

const clearCache = () => {
  imageCache.clear();
  console.log('🗑️ 缓存已清除');
};

const getDetailedDebugInfo = (title, tags = []) => {
  const titleAnalysis = analyzeTitle(title);
  const tagAnalysis = analyzeTags(tags);
  const queries = buildIntelligentQueries(title, tags);
  
  return {
    title, tags,
    titleAnalysis, tagAnalysis, queries,
    cacheKey: `${title}-${tags.join('-')}`,
    recommendations: {
      titleClarity: titleAnalysis.confidence < 15 ? '建议使用更明确的地名' : '标题清晰',
      tagCoverage: tagAnalysis.priority.length === 0 ? '建议添加场景标签' : '标签覆盖良好',
      searchStrategy: `将使用${queries.length}个搜索策略`
    }
  };
};

// 导出服务
const imageService = {
  // 主要方法
  getImageByTitleAndTags,
  getImageByTags: getImageByTitleAndTags, // 兼容旧版本
  
  // 缓存管理
  clearCache,
  clearSpecificCache: (title, tags = []) => {
    const cacheKey = `${title}-${tags.join('-')}`;
    return imageCache.delete(cacheKey);
  },
  forceRefreshImages,
  forceSearchSpecific,
  
  // 调试工具
  getCacheStatus,
  findDuplicateImages,
  getDetailedDebugInfo,
  
  // 预加载
  preloadCommonLocations,
  
  // 分析工具
  analyzeTitle,
  analyzeTags,
  buildIntelligentQueries,
  
  // 内部方法（调试用）
  _performSearch: performIntelligentSearch,
  _validateImage: validateImageContent,
  _generatePlaceholder: generateIntelligentPlaceholder,
  _cache: imageCache // 暴露缓存对象用于调试
};

export default imageService;
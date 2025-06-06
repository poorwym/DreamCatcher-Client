const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * 实用工具 API 封装
 * 
 * 提供实用工具服务的API接口：
 * - 天气信息查询
 * - 地图瓦片获取
 * - 地理位置搜索
 */

/**
 * 获取天气信息
 * @param {number} lat - 纬度 (-90 到 90)
 * @param {number} lon - 经度 (-180 到 180)
 * @param {number} dt - Unix时间戳
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 包含天气信息的响应对象
 *
 *   {
 *   "lat": 52.2297,
 *   "lon": 21.0122,
 *   "timezone": "Europe/Warsaw",
 *   "timezone_offset": 3600,
 *   "data": [
 *     {
 *       "dt": 1645888976,
 *       "sunrise": 1645853361,
 *       "sunset": 1645891727,
 *       "temp": 279.13,
 *       "feels_like": 276.44,
 *       "pressure": 1029,
 *       "humidity": 64,
 *       "dew_point": 272.88,
 *       "uvi": 0.06,
 *       "clouds": 0,
 *       "visibility": 10000,
 *       "wind_speed": 3.6,
 *       "wind_deg": 340,
 *       "weather": [
 *         {
 *           "id": 800,
 *           "main": "Clear",
 *           "description": "clear sky",
 *           "icon": "01d"
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 *
 */
export const getWeather = async (lat, lon, dt, fetchWithAuth) => {
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('纬度必须是-90到90之间的数字');
    }

    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
        throw new Error('经度必须是-180到180之间的数字');
    }

    if (typeof dt !== 'number' || dt <= 0) {
        throw new Error('时间戳必须是有效的正整数');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const url = new URL(`${API_BASE}/util/weather`);
        url.searchParams.append('lat', lat.toString());
        url.searchParams.append('lon', lon.toString());
        url.searchParams.append('dt', dt.toString());

        const response = await fetchWithAuth(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `获取天气信息失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('天气信息请求失败:', error);
        throw error;
    }
};

/**
 * 获取地图瓦片URL
 * @param {number} x - 瓦片X坐标 (>=0)
 * @param {number} y - 瓦片Y坐标 (>=0)
 * @param {number} z - 缩放级别 (0-20)
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 包含瓦片URL的响应对象
 */
export const getTile = async (x, y, z, fetchWithAuth) => {
    if (typeof x !== 'number' || x < 0 || !Number.isInteger(x)) {
        throw new Error('瓦片X坐标必须是非负整数');
    }

    if (typeof y !== 'number' || y < 0 || !Number.isInteger(y)) {
        throw new Error('瓦片Y坐标必须是非负整数');
    }

    if (typeof z !== 'number' || z < 0 || z > 20 || !Number.isInteger(z)) {
        throw new Error('缩放级别必须是0-20之间的整数');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const url = new URL(`${API_BASE}/util/tile`);
        url.searchParams.append('x', x.toString());
        url.searchParams.append('y', y.toString());
        url.searchParams.append('z', z.toString());

        const response = await fetchWithAuth(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `获取地图瓦片失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('地图瓦片请求失败:', error);
        throw error;
    }
};

/**
 * 根据名称搜索地理位置
 * @param {string} name - 地点名称 (1-100个字符)
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 包含位置信息列表的响应对象
 * {
    "tips": [
        {
            "id": [],
            "name": "肯德基",
            "district": [],
            "adcode": [],
            "location": [],
            "address": [],
            "typecode": [],
            "city": []
        },
        {
            "id": "B0FFKEPXS2",
            "name": "肯德基(望京西)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.473962,39.997751",
            "address": "望京西园4区410号学生宿舍1层",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B000A7BM4H",
            "name": "肯德基(花家地餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.469250,39.985563",
            "address": "花家地小区1号商业楼",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B000A7C99U",
            "name": "肯德基(北京酒仙桥餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.490332,39.976127",
            "address": "酒仙桥路12号",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B000A7FVJQ",
            "name": "肯德基(中福百货餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.463372,40.000471",
            "address": "望京南湖东园201号楼1层",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B0FFHPAN04",
            "name": "肯德基(望京西路餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.456759,39.994764",
            "address": "望京西路41号梦秀欢乐广场1层",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B0FFIPRH9X",
            "name": "肯德基(利泽西街KFC)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.466550,40.010842",
            "address": "广顺北大街17号北区一层",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B000A80GPM",
            "name": "肯德基(酒仙桥二餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.495339,39.961943",
            "address": "酒仙桥路39号京客隆购物广场地下一层",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B000A9P8KT",
            "name": "肯德基(北京太阳宫餐厅)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.448473,39.971184",
            "address": "太阳宫中路12号凯德MALL(太阳宫店)F1层01-13A-14-15B",
            "typecode": "050301",
            "city": []
        },
        {
            "id": "B0HKALPLKP",
            "name": "肯德基(霄云路店)",
            "district": "北京市朝阳区",
            "adcode": "110105",
            "location": "116.464688,39.959198",
            "address": "霄云路与天泽路交叉口西南140米",
            "typecode": "050301",
            "city": []
        }
    ],
    "status": "1",
    "info": "OK",
    "infocode": "10000",
    "count": "10"
}
 */
export const getPosition = async (name, fetchWithAuth) => {
    if (!name || typeof name !== 'string') {
        throw new Error('地点名称不能为空');
    }

    if (name.length < 1 || name.length > 100) {
        throw new Error('地点名称长度必须在1-100个字符之间');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const url = new URL(`${API_BASE}/util/position`);
        url.searchParams.append('name', name);

        const response = await fetchWithAuth(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `位置搜索失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('位置搜索请求失败:', error);
        throw error;
    }
};

/**
 * 检查实用工具服务健康状态
 * @returns {Promise<Object>} 服务状态信息
 */
export const checkUtilHealth = async () => {
    try {
        const response = await fetch(`${API_BASE}/util/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `健康检查失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('实用工具健康检查失败:', error);
        throw error;
    }
};

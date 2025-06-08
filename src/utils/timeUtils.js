import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 注册dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将任意时间字符串转换为UTC时间
 * @param {string|Date} time - 时间字符串或Date对象
 * @returns {string} UTC时间字符串 (ISO格式)
 */
export function toUTC(time) {
    if (!time) return null;
    return dayjs(time).utc().format();
}

/**
 * 将UTC时间转换为本地时间显示
 * @param {string} utcTime - UTC时间字符串
 * @param {string} format - 格式化字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 本地时间字符串
 */
export function utcToLocal(utcTime, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!utcTime) return '';
    return dayjs.utc(utcTime).local().format(format);
}

/**
 * 将UTC时间转换为指定时区的时间
 * @param {string} utcTime - UTC时间字符串
 * @param {string} timezone - 时区名称，如 'Asia/Shanghai'
 * @param {string} format - 格式化字符串
 * @returns {string} 指定时区的时间字符串
 */
export function utcToTimezone(utcTime, timezone, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!utcTime) return '';
    return dayjs.utc(utcTime).tz(timezone).format(format);
}

/**
 * 格式化UTC时间为中文显示
 * @param {string} utcTime - UTC时间字符串
 * @param {Object} options - 格式化选项
 * @returns {Object} 包含日期和时间的对象
 */
export function formatUTCForDisplay(utcTime, options = {}) {
    if (!utcTime) return { date: '', time: '' };
    
    const localTime = dayjs.utc(utcTime).local();
    
    return {
        date: localTime.format(options.dateFormat || 'YYYY年MM月DD日'),
        time: localTime.format(options.timeFormat || 'HH:mm'),
        fullDateTime: localTime.format(options.fullFormat || 'YYYY年MM月DD日 HH:mm:ss'),
        iso: localTime.format(),
        weekday: localTime.format('dddd')
    };
}

/**
 * 将本地时间输入值转换为UTC时间
 * @param {string} localDateTime - 本地时间字符串 (datetime-local格式)
 * @returns {string} UTC时间字符串
 */
export function localToUTC(localDateTime) {
    if (!localDateTime) return null;
    return dayjs(localDateTime).utc().format();
}

/**
 * 将UTC时间转换为datetime-local输入格式
 * @param {string} utcTime - UTC时间字符串
 * @returns {string} datetime-local格式的字符串
 */
export function utcToDateTimeLocal(utcTime) {
    if (!utcTime) return '';
    return dayjs.utc(utcTime).local().format('YYYY-MM-DDTHH:mm');
}

/**
 * 获取当前UTC时间
 * @returns {string} 当前UTC时间字符串
 */
export function getCurrentUTC() {
    return dayjs.utc().format();
}

/**
 * 获取当前时间的datetime-local格式（用于输入框最小值）
 * @returns {string} datetime-local格式的当前时间
 */
export function getCurrentDateTimeLocal() {
    return dayjs().format('YYYY-MM-DDTHH:mm');
}

/**
 * 判断UTC时间是否在未来
 * @param {string} utcTime - UTC时间字符串
 * @returns {boolean} 是否在未来
 */
export function isUTCFuture(utcTime) {
    if (!utcTime) return false;
    return dayjs.utc(utcTime).isAfter(dayjs.utc());
}

/**
 * 计算两个UTC时间之间的差值
 * @param {string} utcTime1 - 第一个UTC时间
 * @param {string} utcTime2 - 第二个UTC时间
 * @param {string} unit - 时间单位 ('days', 'hours', 'minutes' 等)
 * @returns {number} 时间差值
 */
export function utcDiff(utcTime1, utcTime2, unit = 'days') {
    if (!utcTime1 || !utcTime2) return 0;
    return dayjs.utc(utcTime1).diff(dayjs.utc(utcTime2), unit);
}

/**
 * 在UTC时间基础上增加时间
 * @param {string} utcTime - UTC时间字符串
 * @param {number} amount - 数量
 * @param {string} unit - 时间单位
 * @returns {string} 新的UTC时间字符串
 */
export function utcAdd(utcTime, amount, unit) {
    if (!utcTime) return null;
    return dayjs.utc(utcTime).add(amount, unit).format();
}

/**
 * 格式化UTC时间为相对时间（多久前/多久后）
 * @param {string} utcTime - UTC时间字符串
 * @returns {string} 相对时间描述
 */
export function utcToRelative(utcTime) {
    if (!utcTime) return '';
    return dayjs.utc(utcTime).local().fromNow();
}

// 向后兼容的函数
export function stringToTime(timeString) {
    return toUTC(timeString);
}

export function UTCToChina(utcTime) {
    return utcToTimezone(utcTime, 'Asia/Shanghai');
}

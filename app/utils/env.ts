/**
 * 是否是生产环境
 * @returns
 */
export const isDev = () => process.env.NODE_ENV === 'development';

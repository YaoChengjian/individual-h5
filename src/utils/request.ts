import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios';
import { Local } from '/@/utils/storage';
import qs from 'qs';

// 白名单，不需要 token 的接口
const whiteList = ['/api/captcha/', '/api/login/', '/h5/login'];

// 新建一个 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BASE_API,
	timeout: 1000 * 5,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// 配置请求拦截器
service.interceptors.request.use(
	// 在发送请求之前做些什么
	(config) => {
		const token = Local.get('token');
		if (config.url && !whiteList.includes(config.url) && token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	// 处理请求错误
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// 配置响应拦截器
service.interceptors.response.use(
	// 对响应数据做点什么
	async (response: AxiosResponse) => {
		const { data } = response;
		if (data.code && data.code !== 0) {
			return Promise.reject(data);
		}
		return data;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// 导出 axios 实例
export default service;

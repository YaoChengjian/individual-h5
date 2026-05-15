import request from '/@/utils/request';
import { Local } from '/@/utils/storage';

// 获取验证码图片
export function getCodeImage(): Promise<HttpResultType> {
	return request.get('/api/captcha/');
}

// 用户登录
export function userLogin(data: EmptyObjectType): Promise<HttpResultType> {
	return request.post('/api/login/', data);
}

// 用户登出
export function userLogout(token: string): Promise<HttpResultType> {
	return request.post('/api/logout/', token);
}

// 刷新 Token
export function refreshToken(): Promise<{ access: string; refresh: string }> {
	if (!Local.has('refresh')) return Promise.reject();
	return request.post('/api/token/refresh/', { refresh: Local.get('refresh') });
}

import { defineStore } from 'pinia';
import { Session, Local } from '/@/utils/storage';

// api
// import { useLoginApi } from '/@/api/login/index';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			chn_name: '',
			eng_name: '',
			is_superuser: false,
			name: '',
			perm_list: [],
			perm_main: ['patrol', 'patrolDetail', 'patrolWorkOrders', '1'],
			role: '',
			token: '',
			user_id: 0,
		},
	}),
	actions: {
		async setUserInfos() {
			// 存储用户信息到浏览器缓存
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
			} else {
				await this.getApiUserInfo();
			}
		},
		// 模拟接口数据
		// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
		async getApiUserInfo() {
			return new Promise((resolve) => {
				const user = Local.get('h5User') || {};
				this.userInfos = {
					...this.userInfos,
					chn_name: user.nickname || user.username || '巡查员',
					name: user.username || 'h5_demo',
					token: Local.get('token') || '',
					user_id: user.userId || 0,
					perm_main: ['patrol', 'patrolDetail', 'patrolWorkOrders', '1'],
				};
				Session.set('userInfo', this.userInfos);
				resolve(this.userInfos);
				// loginApi.getUserInfo({}).then(() => {
				// 	const permMain = res.data.perm_main;
				// 	let fixedPerm = ['1', '3', '8', '10', '11', '11-1', '11-1-1', '11-1-1-1'];
				// 	Object.values(fiexObj).forEach((rule) => {
				// 		// 如果 permMain 和 hasIds 有交集
				// 		if (rule.hasIds.some((id) => permMain.includes(id))) {
				// 			fixedPerm.push(...rule.ids);
				// 		}
				// 	});
				// 	// 去重（防止重复加）
				// 	fixedPerm = [...new Set(fixedPerm)];
				// 	res.data.perm_main.push(...fixedPerm);
				// 	this.userInfos = res.data;
				// 	Session.set('userInfo', res.data);
				// 	resolve(res.data);
				// });
			});
		},
	},
});

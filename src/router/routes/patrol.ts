export default {
	id: 'patrol',
	path: '/patrol',
	name: 'patrol',
	component: () => import('/@/views/patrol/index.vue'),
	meta: {
		title: '巡查任务',
		isLink: '',
		isBabbar: false,
		isHide: false,
		isKeepAlive: false,
		isAffix: false,
		isIframe: false,
		roles: ['admin', 'common'],
		icon: 'iconfont icon-oa',
	},
};

export default {
	id: 'patrolDetail',
	path: '/patrol/detail/:taskId',
	name: 'patrolDetail',
	component: () => import('/@/views/patrol/detail.vue'),
	meta: {
		title: '任务详情',
		isLink: '',
		isBabbar: false,
		isHide: true,
		isKeepAlive: false,
		isAffix: false,
		isIframe: false,
		roles: ['admin', 'common'],
		icon: 'iconfont icon-oa',
	},
};

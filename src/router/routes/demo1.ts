export default {
	id: '1',
	path: '/demo1',
	name: 'demo1',
	component: () => import('/@/views/demo1/index.vue'),
	meta: {
		title: '测试1',
		isLink: '',
		isBabbar: true,
		isHide: false,
		isKeepAlive: false,
		isAffix: false,
		isIframe: false,
		roles: ['admin', 'common'],
		icon: 'iconfont icon-oa',
	},
};

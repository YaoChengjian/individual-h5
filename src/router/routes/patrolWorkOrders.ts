export default {
	id: 'patrolWorkOrders',
	path: '/patrol/work-orders/:taskId',
	name: 'patrolWorkOrders',
	component: () => import('/@/views/patrol/work-orders.vue'),
	meta: {
		title: '工单打印',
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

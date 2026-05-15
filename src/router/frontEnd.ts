// import { NextLoading } from '/@/utils/loading';

/** store */
import { storeToRefs } from 'pinia';
import pinia from '/@/stores/index';
import { useUserInfo } from '/@/stores/userInfo';
import { useRoutesList } from '/@/stores/routesList';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
/** 本地存储 */
import { Local } from '/@/utils/storage';
/** 路由 */
import { RouteRecordRaw } from 'vue-router';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router';
import { dynamicRoutes, notFoundAndNoPower } from '/@/router/route';

/**
 * 前端控制路由：初始化方法，防止刷新时路由丢失
 * @method  NextLoading 界面 loading 动画开始执行
 * @method useUserInfo(pinia).getUserInfos() 触发初始化用户信息 pinia
 * @method setAddRoute 添加动态路由
 * @method setFilterMenuAndCacheTagsViewRoutes 设置递归过滤有权限的路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 */
export async function initFrontEndControlRoutes() {
	// 界面 loading 动画开始执行
	// if (window.nextLoading === undefined) NextLoading.start();
	// 无 token 停止执行下一步
	if (!Local.get('token')) Local.set('token', 'h5-demo-token');
	// 触发初始化用户信息 pinia
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo(pinia).getApiUserInfo();
	// 无登录权限时，添加判断
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	if (useUserInfo().userInfos?.perm_main?.length <= 0 && !useUserInfo().userInfos.is_superuser) return Promise.resolve(true);
	// 添加动态路由
	await setAddRoute();
	// 设置递归过滤有权限的路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
	setFilterMenuAndCacheTagsViewRoutes();
}

/**
 * 添加动态路由
 * @method router.addRoute
 * @description 此处循环为 dynamicRoutes（/@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		if (route.name && router.hasRoute(route.name)) return;
		router.addRoute(route);
	});
}

/**
 * 删除/重置路由
 * @method router.removeRoute
 * @description 此处循环为 dynamicRoutes（/@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#push
 */
export async function frontEndsResetRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		const routeName: any = route.name;
		router.hasRoute(routeName) && router.removeRoute(routeName);
	});
}

/**
 * 获取有当前用户权限标识的路由数组，进行对原路由的替换
 * @description 替换 dynamicRoutes（/@/router/route）第一个顶级 children 的路由
 * @returns 返回替换后的路由数组
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	const stores = useUserInfo(pinia);
	const { userInfos } = storeToRefs(stores);
	// notFoundAndNoPower 防止 404、401 不在 layout 布局中，不设置的话，404、401 界面将全屏显示
	// 关联问题 No match found for location with path 'xxx'
	// 超级管理员
	if (userInfos.value.is_superuser) {
		filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
	} else {
		const result: any = updateRedirects(filteredChildren(dynamicRoutes, userInfos.value.perm_main));
		filterRouteEnd[0].children = [...flatTreeData(result[0]?.children), ...notFoundAndNoPower];
		filterRouteEnd[0].redirect = result[0]?.redirect;
	}
	return filterRouteEnd;
}

/**
 * 缓存多级嵌套数组处理后的一维数组
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setCacheTagsViewRoutes() {
	// 获取有权限的路由，否则 tagsView、菜单搜索中无权限的路由也将显示
	const stores = useUserInfo(pinia);
	const storesTagsView = useTagsViewRoutes(pinia);
	const { userInfos } = storeToRefs(stores);
	// 添加到 pinia setTagsViewRoutes 中
	// 判断是否超管
	if (userInfos.value.is_superuser) {
		storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children);
	} else {
		storesTagsView.setTagsViewRoutes(
			formatTwoStageRoutes(formatFlatteningRoutes(filteredChildren(dynamicRoutes, userInfos.value.perm_main)))[0]?.children
		);
	}
}

/**
 * 设置递归过滤有权限的路由到 pinia routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 * @description 用于左侧菜单、横向菜单的显示
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
	const stores = useUserInfo(pinia);
	const storesRoutesList = useRoutesList(pinia);
	const { userInfos } = storeToRefs(stores);
	if (userInfos.value.is_superuser) {
		if (dynamicRoutes[0]) storesRoutesList.setRoutesList(dynamicRoutes[0].children);
	} else {
		storesRoutesList.setRoutesList(filteredChildren(dynamicRoutes, userInfos.value.perm_main)[0]?.children);
	}
	setCacheTagsViewRoutes();
}

/**
 * 判断路由 `meta.roles` 中是否包含当前登录用户权限字段
 * @param roles 用户权限标识，在 userInfos（用户信息）的 roles（登录页登录时缓存到浏览器）数组
 * @param route 当前循环时的路由项
 * @returns 返回对比后有权限的路由项
 */
export function hasRoles(roles: any, route: any) {
	if (route.meta && route.meta.roles) return roles.some((role: any) => route.meta.roles.includes(role));
	else return true;
}

/**
 * 获取当前用户权限标识去比对路由表，设置递归过滤有权限的路由
 * @param routes 当前路由 children
 * @param roles 用户权限标识，在 userInfos（用户信息）的 roles（登录页登录时缓存到浏览器）数组
 * @returns 返回有权限的路由数组 `meta.roles` 中控制
 */
export function setFilterHasRolesMenu(routes: any, roles: any) {
	const menu: any = [];
	routes.forEach((route: any) => {
		const item = { ...route };
		if (hasRoles(roles, item)) {
			if (item.children) item.children = setFilterHasRolesMenu(item.children, roles);
			menu.push(item);
		}
	});
	return menu;
}

/**
 * 获取当前用户权限标识去比对路由表，设置递归过滤有权限的路由
 * @param routes 当前路由 children
 * @param roles 用户权限标识，在 userInfos（用户信息）的 perm_list（登录页登录时缓存到浏览器）数组
 * @returns 返回有权限的路由数组
 */
const filteredChildren = (routes: any, permList: any) => {
	return routes.reduce((acc: any[], child: { id: string; children: any }) => {
		const isInArr = permList?.includes(child.id);

		const filteredSubChildren = child.children ? filteredChildren(child.children, permList) : [];

		if (isInArr || filteredSubChildren.length > 0) {
			acc.push({
				...child,
				children: filteredSubChildren,
			});
		}

		return acc;
	}, []);
};

/**
 * 将多维数组扁平化
 * @param arr 当前路由 children
 * @returns 一维数组，数组扁平化
 */
type TreeNode = {
	label: string;
	value: string;
	children?: TreeNode[];
};
const flatTreeData = (treeData: TreeNode[]): TreeNode[] => {
	const flatData: TreeNode[] = [];

	const main = (node: TreeNode): void => {
		flatData.push(node);

		if (node.children && node.children.length > 0) {
			node.children.forEach((item: any): void => {
				main(item);
			});
		}
	};
	treeData.forEach((item: any): void => main(item));

	return flatData;
};

/**
 * 递归修改重定向路由路径
 * @param arr 当前路由 children
 * @returns 重定向后的路由
 */
const updateRedirects = (arr: any) => {
	for (const item of arr) {
		// If the item has children
		if (item.children && item.children.length > 0) {
			const filtered = item.children.filter((item: { id: string }) => item.id !== '1');
			// Update the redirect to the path of the first child
			if (item.redirect) item.redirect = filtered.length > 0 ? filtered[0]?.path : item.children[0]?.path;
			// Recursively update the children
			updateRedirects(item.children);
		}
	}
	return arr;
};

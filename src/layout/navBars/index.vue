<template>
	<van-nav-bar :title="currentRoute?.meta.title" fixed placeholder>
		<template #left>
			<!-- <div @click="router.back" class="flex flex-items-center">
				<svg-icon class="text-24 color-#1989fa" name="left-arrow" /><span class="color-#1989fa">返回</span>
			</div> -->
		</template>
	</van-nav-bar>
</template>

<script setup lang="ts" name="layoutTagsView">
import { reactive, onMounted, computed, ref, nextTick, onBeforeUpdate, onBeforeMount, onUnmounted, watch } from 'vue';
import { showFailToast } from 'vant';

/** utils工具类 */
import mittBus from '/@/utils/mitt';
import { Session } from '/@/utils/storage';
import { isObjectValueEqual } from '/@/utils/arrayOperation';
/** stores */
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useKeepALiveNames } from '/@/stores/keepAliveNames';
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const storesTagsViewRoutes = useTagsViewRoutes();
const storesKeepALiveNames = useKeepALiveNames();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { tagsViewRoutes } = storeToRefs(storesTagsViewRoutes);

/** router */
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
const route = useRoute();
const router = useRouter();

/** 定义变量内容 */
const tagsRefs = ref<RefType>([]);
const state = reactive<TagsViewState>({
	routeActive: '',
	routePath: route.path,
	dropdown: { x: '', y: '' },
	sortable: '',
	tagsRefsIndex: 0,
	tagsViewList: [],
	tagsViewRoutesList: [],
});

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

// 获取当前路由配置信息
const currentRoute = computed(() => {
	return router.currentRoute.value;
});

// 存储 tagsViewList 到浏览器临时缓存中，页面刷新时，保留记录
const addBrowserSetSession = (tagsViewList: Array<object>) => {
	Session.set('tagsViewList', tagsViewList);
};
// 获取 pinia 中的 tagsViewRoutes 列表
const getTagsViewRoutes = async () => {
	state.routeActive = await setTagsViewHighlight(route);
	state.routePath = (await route.meta.isDynamic) ? route.meta.isDynamicPath : route.path;
	state.tagsViewList = [];
	state.tagsViewRoutesList = tagsViewRoutes.value;
	initTagsView();
};
// pinia 中获取路由信息：如果是设置了固定的（isAffix），进行初始化显示
const initTagsView = async () => {
	if (Session.get('tagsViewList') && getThemeConfig.value.isCacheTagsView) {
		state.tagsViewList = await Session.get('tagsViewList');
	} else {
		await state.tagsViewRoutesList.map((v: RouteItem) => {
			if (v.meta?.isAffix && !v.meta.isHide) {
				v.url = setTagsViewHighlight(v);
				state.tagsViewList.push({ ...v });
				storesKeepALiveNames.addCachedView(v);
			}
		});
		await addTagsView(route.path, <RouteToFrom>route);
	}
	// 初始化当前元素(li)的下标
	getTagsRefsIndex(getThemeConfig.value.isShareTagsView ? state.routePath : state.routeActive);
};
// 处理可开启多标签详情，单标签详情（动态路由（xxx/:id/:name"），普通路由处理）
const solveAddTagsView = async (path: string, to?: RouteToFrom) => {
	let isDynamicPath = to?.meta?.isDynamic ? to.meta.isDynamicPath : path;
	let current = state.tagsViewList.filter(
		(v: RouteItem) =>
			v.path === isDynamicPath &&
			isObjectValueEqual(
				to?.meta?.isDynamic ? (v.params ? v.params : null) : v.query ? v.query : null,
				to?.meta?.isDynamic ? (to?.params ? to?.params : null) : to?.query ? to?.query : null
			)
	);
	if (current.length <= 0) {
		// 防止：Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.
		let findItem = state.tagsViewRoutesList.find((v: RouteItem) => v.path === isDynamicPath);
		if (!findItem) return false;
		if (findItem.meta.isAffix) return false;
		if (findItem.meta.isLink && !findItem.meta.isIframe) return false;
		to?.meta?.isDynamic ? (findItem.params = to.params) : (findItem.query = to?.query);
		findItem.url = setTagsViewHighlight(findItem);
		state.tagsViewList.push({ ...findItem });
		await storesKeepALiveNames.addCachedView(findItem);
		addBrowserSetSession(state.tagsViewList);
	}
};
// 处理单标签时，第二次的值未覆盖第一次的 tagsViewList 值（Session Storage）
const singleAddTagsView = (path: string, to?: RouteToFrom) => {
	let isDynamicPath = to?.meta?.isDynamic ? to.meta.isDynamicPath : path;
	state.tagsViewList.forEach((v) => {
		if (
			v.path === isDynamicPath &&
			!isObjectValueEqual(
				to?.meta?.isDynamic ? (v.params ? v.params : null) : v.query ? v.query : null,
				to?.meta?.isDynamic ? (to?.params ? to?.params : null) : to?.query ? to?.query : null
			)
		) {
			to?.meta?.isDynamic ? (v.params = to.params) : (v.query = to?.query);
			v.url = setTagsViewHighlight(v);
			addBrowserSetSession(state.tagsViewList);
		}
	});
};
// 1、添加 tagsView：未设置隐藏（isHide）也添加到在 tagsView 中（可开启多标签详情，单标签详情）
const addTagsView = (path: string, to?: RouteToFrom) => {
	// 防止拿取不到路由信息
	nextTick(async () => {
		// 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
		let item: RouteItem;
		if (to?.meta?.isDynamic) {
			// 动态路由（xxx/:id/:name"）：参数不同，开启多个 tagsview
			if (!getThemeConfig.value.isShareTagsView) await solveAddTagsView(path, to);
			else await singleAddTagsView(path, to);
			if (state.tagsViewList.some((v: RouteItem) => v.path === to?.meta?.isDynamicPath)) {
				// 防止首次进入界面时(登录进入) tagsViewList 不存浏览器中
				addBrowserSetSession(state.tagsViewList);
				return false;
			}
			item = state.tagsViewRoutesList.find((v: RouteItem) => v.path === to?.meta?.isDynamicPath);
		} else {
			// 普通路由：参数不同，开启多个 tagsview
			if (!getThemeConfig.value.isShareTagsView) await solveAddTagsView(path, to);
			else await singleAddTagsView(path, to);
			if (state.tagsViewList.some((v: RouteItem) => v.path === path)) {
				// 防止首次进入界面时(登录进入) tagsViewList 不存浏览器中
				addBrowserSetSession(state.tagsViewList);
				return false;
			}
			item = state.tagsViewRoutesList.find((v: RouteItem) => v.path === path);
		}
		if (!item) return false;
		if (item?.meta?.isLink && !item.meta.isIframe) return false;
		if (to?.meta?.isDynamic) item.params = to?.params ? to?.params : route.params;
		else item.query = to?.query ? to?.query : route.query;
		item.url = setTagsViewHighlight(item);
		await storesKeepALiveNames.addCachedView(item);
		await state.tagsViewList.push({ ...item });
		await addBrowserSetSession(state.tagsViewList);
	});
};
// 2、刷新当前 tagsView：
const refreshCurrentTagsView = async (fullPath: string) => {
	const decodeURIPath = decodeURI(fullPath);
	let item: RouteToFrom = {};
	state.tagsViewList.forEach((v: RouteItem) => {
		v.transUrl = transUrlParams(v);
		if (v.transUrl) {
			if (v.transUrl === transUrlParams(v)) item = v;
		} else {
			if (v.path === decodeURIPath) item = v;
		}
	});
	if (!item) return false;
	await storesKeepALiveNames.delCachedView(item);
	mittBus.emit('onTagsViewRefreshRouterView', fullPath);
	if (item.meta?.isKeepAlive) storesKeepALiveNames.addCachedView(item);
};
// 3、关闭当前 tagsView：如果是设置了固定的（isAffix），不可以关闭
const closeCurrentTagsView = (path: string) => {
	state.tagsViewList.map((v: RouteItem, k: number, arr: RouteItems) => {
		if (!v.meta?.isAffix) {
			if (getThemeConfig.value.isShareTagsView ? v.path === path : v.url === path) {
				storesKeepALiveNames.delCachedView(v);
				state.tagsViewList.splice(k, 1);
				setTimeout(() => {
					if (state.tagsViewList.length === k && getThemeConfig.value.isShareTagsView ? state.routePath === path : state.routeActive === path) {
						// 最后一个且高亮时
						if (arr[arr.length - 1].meta.isDynamic) {
							// 动态路由（xxx/:id/:name"）
							if (k !== arr.length) router.push({ name: arr[k].name, params: arr[k].params });
							else router.push({ name: arr[arr.length - 1].name, params: arr[arr.length - 1].params });
						} else {
							// 普通路由
							if (k !== arr.length) router.push({ path: arr[k].path, query: arr[k].query });
							else router.push({ path: arr[arr.length - 1].path, query: arr[arr.length - 1].query });
						}
					} else {
						// 非最后一个且高亮时，跳转到下一个
						if (state.tagsViewList.length !== k && getThemeConfig.value.isShareTagsView ? state.routePath === path : state.routeActive === path) {
							if (arr[k].meta.isDynamic) {
								// 动态路由（xxx/:id/:name"）
								router.push({ name: arr[k].name, params: arr[k].params });
							} else {
								// 普通路由
								router.push({ path: arr[k].path, query: arr[k].query });
							}
						}
					}
				}, 0);
			}
		}
	});
	addBrowserSetSession(state.tagsViewList);
};
// 4、关闭其它 tagsView：如果是设置了固定的（isAffix），不进行关闭
const closeOtherTagsView = (path: string) => {
	if (Session.get('tagsViewList')) {
		state.tagsViewList = [];
		Session.get('tagsViewList').map((v: RouteItem) => {
			if (v.meta?.isAffix && !v.meta.isHide) {
				v.url = setTagsViewHighlight(v);
				storesKeepALiveNames.delOthersCachedViews(v);
				state.tagsViewList.push({ ...v });
			}
		});
		addTagsView(path, <RouteToFrom>route);
		addBrowserSetSession(state.tagsViewList);
	}
};
// 5、关闭全部 tagsView：如果是设置了固定的（isAffix），不进行关闭
const closeAllTagsView = () => {
	if (Session.get('tagsViewList')) {
		storesKeepALiveNames.delAllCachedViews();
		state.tagsViewList = [];
		Session.get('tagsViewList').map((v: RouteItem) => {
			if (v.meta?.isAffix && !v.meta.isHide) {
				v.url = setTagsViewHighlight(v);
				state.tagsViewList.push({ ...v });
				router.push({ path: state.tagsViewList[state.tagsViewList.length - 1].path });
			}
		});
		addBrowserSetSession(state.tagsViewList);
	}
};
// 6、开启当前页面全屏
const openCurrenFullscreen = async (path: string) => {
	const item = state.tagsViewList.find((v: RouteItem) => (getThemeConfig.value.isShareTagsView ? v.path === path : v.url === path));
	if (item.meta.isDynamic) await router.push({ name: item.name, params: item.params });
	else await router.push({ name: item.name, query: item.query });
	stores.setCurrenFullscreen(true);
};
// 当前项右键菜单点击，拿 `当前点击的路由路径` 对比 `tagsView 路由数组`，取当前点击项的详细路由信息
// 防止 tagsView 非当前页演示时，操作异常
// https://gitee.com/lyt-top/vue-next-admin/issues/I61VS9
const getCurrentRouteItem = (item: RouteItem): any => {
	let resItem: RouteToFrom = {};
	state.tagsViewList.forEach((v: RouteItem) => {
		v.transUrl = transUrlParams(v);
		if (v.transUrl) {
			// 动态路由、普通路由带参数
			if (v.transUrl === transUrlParams(v) && v.transUrl === item.commonUrl) resItem = v;
		} else {
			// 路由不带参数
			if (v.path === decodeURI(item.path)) resItem = v;
		}
	});
	if (!resItem) return null;
	else return resItem;
};
// 当前项右键菜单点击
const onCurrentContextmenuClick = async (item: RouteItem) => {
	item.commonUrl = transUrlParams(item);
	if (!getCurrentRouteItem(item)) return showFailToast({ message: '请正确输入路径及完整参数（query、params）' });
	const { path, name, params, query, meta, url } = getCurrentRouteItem(item);
	switch (item.contextMenuClickId) {
		case 0:
			// 刷新当前
			if (meta.isDynamic) await router.push({ name, params });
			else await router.push({ path, query });
			refreshCurrentTagsView(route.fullPath);
			break;
		case 1:
			// 关闭当前
			closeCurrentTagsView(getThemeConfig.value.isShareTagsView ? path : url);
			break;
		case 2:
			// 关闭其它
			if (meta.isDynamic) await router.push({ name, params });
			else await router.push({ path, query });
			closeOtherTagsView(path);
			break;
		case 3:
			// 关闭全部
			closeAllTagsView();
			break;
		case 4:
			// 开启当前页面全屏
			openCurrenFullscreen(getThemeConfig.value.isShareTagsView ? path : url);
			break;
	}
};

// 处理 url，地址栏链接有参数时，tagsview 右键菜单刷新功能失效问题，感谢 @ZzZz-RIPPER、@dejavuuuuu
// https://gitee.com/lyt-top/vue-next-admin/issues/I5K3YO
// https://gitee.com/lyt-top/vue-next-admin/issues/I61VS9
const transUrlParams = (v: RouteItem) => {
	let params = v.query && Object.keys(v.query).length > 0 ? v.query : v.params;
	if (!params) return '';
	let path = '';
	for (let [key, value] of Object.entries(params)) {
		if (v.meta?.isDynamic) path += `/${value}`;
		else path += `&${key}=${value}`;
	}
	// 判断是否是动态路由（xxx/:id/:name"）isDynamic
	if (v.meta?.isDynamic) {
		/**
		 *
		 * isFnClick 用于判断是通过方法调用，还是直接右键菜单点击（此处只针对动态路由）
		 * 原因：
		 * 1、右键菜单点击时，路由的 path 还是原始定义的路由格式，如：/params/dynamic/details/:t/:id/:tagsViewName
		 * 2、通过事件调用时，路由的 path 不是原始定义的路由格式，如：/params/dynamic/details/vue-next-admin/111/我是动态路由测试tagsViewName(非国际化)
		 *
		 * 所以右侧菜单点击时，需要处理路径拼接 v.path.split(':')[0]，得到路径 + 参数的完整路径
		 */
		return v.isFnClick ? decodeURI(v.path) : `${v.path.split(':')[0]}${path.replace(/^\//, '')}`;
	} else {
		return `${v.path}${path.replace(/^&/, '?')}`;
	}
};
// 处理 tagsView 高亮（多标签详情时使用，单标签详情未使用）
const setTagsViewHighlight = (v: RouteToFrom) => {
	let params = v.query && Object.keys(v.query).length > 0 ? v.query : v.params;
	if (!params || Object.keys(params).length <= 0) return v.path;
	let path = '';
	for (let i in params) {
		path += params[i];
	}
	// 判断是否是动态路由（xxx/:id/:name"）
	return `${v.meta?.isDynamic ? v.meta.isDynamicPath : v.path}-${path}`;
};
// 获取 tagsView 的下标：用于处理 tagsView 点击时的横向滚动
const getTagsRefsIndex = (path: string | unknown) => {
	nextTick(async () => {
		// await 使用该写法，防止拿取不到 tagsViewList 列表数据不完整
		let tagsViewList = await state.tagsViewList;
		state.tagsRefsIndex = tagsViewList.findIndex((v: RouteItem) => {
			if (getThemeConfig.value.isShareTagsView) {
				return v.path === path;
			} else {
				return v.url === path;
			}
		});
	});
};
// 页面加载前
onBeforeMount(() => {
	// 监听非本页面调用 0 刷新当前，1 关闭当前，2 关闭其它，3 关闭全部 4 当前页全屏
	mittBus.on('onCurrentContextmenuClick', (data: RouteItem) => {
		// 通过方法点击关闭 tagsView
		data.isFnClick = true;
		onCurrentContextmenuClick(data);
	});
});
// 页面卸载时
onUnmounted(() => {});
// 页面更新时
onBeforeUpdate(() => {
	tagsRefs.value = [];
});
// 页面加载时
onMounted(() => {
	// 初始化 pinia 中的 tagsViewRoutes 列表
	getTagsViewRoutes();
});
// 路由更新时（组件内生命钩子）
onBeforeRouteUpdate(async (to) => {
	state.routeActive = setTagsViewHighlight(to);
	state.routePath = to.meta.isDynamic ? to.meta.isDynamicPath : to.path;
	await addTagsView(to.path, <RouteToFrom>to);
	getTagsRefsIndex(getThemeConfig.value.isShareTagsView ? state.routePath : state.routeActive);
});
// 监听路由的变化，动态赋值给 tagsView
watch(
	() => tagsViewRoutes.value,
	(val) => {
		if (val.length === state.tagsViewRoutesList.length) return false;
		getTagsViewRoutes();
	},
	{
		deep: true,
	}
);
</script>

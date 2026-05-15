<template>
	<div class="app-wrapper">
		<van-config-provider :theme="getThemeConfig.isIsDark ? 'dark' : 'light'" class="h-full">
			<router-view />
		</van-config-provider>
	</div>
</template>

<script setup lang="ts">
import { allowMultipleToast } from 'vant';
import { onMounted, watch, computed } from 'vue';

/** utils */
import other from '/@/utils/other';
/** 路由 */
import { useRoute } from 'vue-router';
const route = useRoute();
/** 本地存储 */
import { Local } from '/@/utils/storage';
/** store */
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

/** 声明周期 */
onMounted(() => {
	// 允许同时弹出多个 Toast
	allowMultipleToast();
	// 获取缓存中的布局配置
	if (Local.get('themeConfig')) {
		storesThemeConfig.setThemeConfig({
			themeConfig: {
				...Local.get('themeConfig'),
				globalTitle: '智能单兵巡查系统',
				globalViceTitle: '智能单兵巡查系统',
			},
		});
	}
});

/** computed */
/** 获取布局配置信息 */
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

/** watch */
// 监听路由的变化，设置网站标题
watch(
	() => route.path,
	() => {
		other.useTitle();
	},
	{
		deep: true,
	}
);
</script>

<style scoped lang="less">
@import url('/@/styles/mixin.scss');
.app-wrapper {
	@include clearfix;
	position: relative;
	height: 100%;
	width: 100%;
}
</style>

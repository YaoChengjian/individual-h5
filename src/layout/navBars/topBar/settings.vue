<template>
	<div class="text-[0px]"></div>
</template>

<script setup lang="ts" name="layoutBreadcrumbSeting">
import { onMounted, computed } from 'vue';

/** utils工具类 */
import { Local } from '/@/utils/storage';

/** stores */
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

/** 声明周期 */
onMounted(() => {
	setLocalThemeConfig();
});

/** computed */
/** 获取布局配置信息 */
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

/** methods */

/** 存储布局配置 */
const setLocalThemeConfig = () => {
	Local.remove('themeConfig');
	Local.set('themeConfig', getThemeConfig.value);
};
</script>

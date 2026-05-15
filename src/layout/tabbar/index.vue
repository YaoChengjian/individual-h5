<template>
	<van-tabbar v-if="currentRoute?.meta.isBabbar" v-model="state.active" placeholder :route="true" fixed>
		<van-tabbar-item to="/patrol" icon="location-o">巡查</van-tabbar-item>
		<van-tabbar-item to="/demo1" icon="apps-o">工具</van-tabbar-item>
	</van-tabbar>
</template>

<script setup lang="ts" name="Tabbar">
import { computed, reactive } from 'vue';

/** router */
import { useRouter } from 'vue-router';
const router = useRouter();

/** 定义变量内容 */
const state = reactive({
	active: 0,
});

// 获取当前路由配置信息
const currentRoute = computed(() => {
	return router.currentRoute.value;
});
</script>

<style scoped lang="less">
:deep(.van-tabbar) {
	max-width: 100vw;
}
</style>

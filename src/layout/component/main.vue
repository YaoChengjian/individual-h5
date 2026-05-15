<template>
	<div class="flex flex-col">
		<LayoutParentView />
	</div>
</template>

<script lang="ts" name="layoutMain" setup>
import { defineAsyncComponent } from 'vue';

/** 引入组件 */
const LayoutParentView = defineAsyncComponent(() => import('/@/layout/routerView/parent.vue'));
</script>

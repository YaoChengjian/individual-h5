<template>
	<div class="w-full">
		<LayoutMain />
	</div>
</template>

<script setup lang="ts" name="layoutTransverse">
import { defineAsyncComponent } from 'vue';

/** 引入组件 */
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));
</script>

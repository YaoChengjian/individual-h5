<template>
	<component :is="layouts['defaults']" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

/** 引入组件 */
const layouts: any = {
	defaults: defineAsyncComponent(() => import('/@/layout/main/defaults.vue')),
};
</script>

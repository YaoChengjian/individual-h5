<template>
	<header>
		<NavBarsIndex />
	</header>
</template>

<script lang="ts" name="layoutHeader" setup>
import { defineAsyncComponent } from 'vue';

/** 引入组件 */
const NavBarsIndex = defineAsyncComponent(() => import('/@/layout/navBars/index.vue'));
</script>

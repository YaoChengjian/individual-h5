<template>
	<van-nav-bar fixed placeholder @click-right="onClickRight">
		<template #left>
			<div v-show="back" @click="router.back" class="flex flex-items-center">
				<svg-icon class="text-24 color-#1989fa" name="left-arrow" /><span class="color-#1989fa">返回</span>
			</div>
		</template>
		<template #right>
			<svg-icon class="text-18" :name="useDarkMode() ? 'light' : 'dark'" />
		</template>
	</van-nav-bar>
</template>

<script setup lang="ts" name="Navbar">
import { useRouter } from "vue-router";
import { useDarkMode, useToggleDarkMode } from "/@/hooks/useToggleDarkMode";

interface NavBarProps {
	back?: boolean;
}
withDefaults(defineProps<NavBarProps>(), {
	back: false,
});

const router = useRouter();
const onClickRight = () => useToggleDarkMode();
</script>

<style scoped lang="less"></style>

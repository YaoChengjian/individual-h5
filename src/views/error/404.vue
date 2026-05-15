<template>
	<div class="not_found_page">
		<svg-icon class="text-200 mb-20" name="404-not-found" />
		<div class="text-16 mb-150">抱歉，您访问的页面不存在</div>
	</div>
</template>

<script setup lang="ts" name="NotFound"></script>

<style scoped lang="less">
.not_found_page {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: calc(100vh - 46px);
}
</style>

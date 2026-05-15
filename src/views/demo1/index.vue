<template>
	<div class="demo1-page">
		<button class="open-pdf-btn" type="button" @click="openPdf">
			点击打开线上 PDF Demo
		</button>
		<div class="pdf-url">{{ state.downloadUrl }}</div>
	</div>
</template>

<script lang="ts" name="demo1" setup>
import { reactive } from 'vue';

const downloadUrl = `${window.location.origin}/dispatch-schedule-demo.pdf`;

/** 定义变量内容 */
const state = reactive({
	demo: 'demo1',
	downloadUrl,
});

const openPdf = () => {
	const url = `openlabel://com.jancsinn.label/pdf?file=${encodeURIComponent(state.downloadUrl)}`;
	window.location.href = url;
};
</script>

<style scoped lang="scss">
.demo1-page {
	min-height: 100vh;
	padding: 24px;
	background: #f7f8fa;
}

.open-pdf-btn {
	width: 100%;
	height: 44px;
	border: 0;
	border-radius: 6px;
	color: #fff;
	font-size: 16px;
	background: #1677ff;
}

.pdf-url {
	margin-top: 16px;
	color: #666;
	font-size: 13px;
	line-height: 1.5;
	word-break: break-all;
}
</style>

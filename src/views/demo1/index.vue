<template>
	<div class="demo1-page">
		<article class="notice-doc">
			<p class="notice-title">智能单兵巡查体验工单</p>
			<p class="notice-title">整改提醒告知书</p>
			<p class="notice-number">{{ state.noticeNumber }}</p>
			<p class="notice-paragraph">
				智能单兵巡查项目体验者于<strong>{{ state.currentDate }}</strong
				>在模拟场景中，成功发现并上报了一份事件工单，具体如下：
			</p>
			<p class="notice-paragraph">{{ state.workOrderInfo }}</p>
			<p class="notice-paragraph">
				请于<strong>{{ state.currentDate }}</strong
				>之前完成上述问题的整改。逾期未改的，将严格依法处理。
			</p>
			<p class="notice-right">广州雁盟科技有限公司</p>
			<p class="notice-right">
				<strong>{{ state.currentDate }}</strong>
			</p>
		</article>

		<div class="action-panel no-print">
			<button class="open-pdf-btn" type="button" @click="printByBrowser">
				系统打印测试
			</button>
			<button class="open-pdf-btn is-ghost" type="button" @click="openPdf">
				唤起打印 App
			</button>
		</div>
		<div class="pdf-url no-print">{{ state.downloadUrl }}</div>
	</div>
</template>

<script lang="ts" name="demo1" setup>
import { reactive } from 'vue';

const downloadUrl = `${window.location.origin}/dispatch-schedule-demo.pdf`;
const now = new Date();
const currentDate = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
const workOrderInfo = new URLSearchParams(window.location.search).get('print') || '巡查发现现场存在待整改问题，请相关责任人及时确认并完成处置。';

/** 定义变量内容 */
const state = reactive({
	demo: 'demo1',
	downloadUrl,
	currentDate,
	noticeNumber: `改${now.getTime()}号`,
	workOrderInfo,
});

const printByBrowser = () => {
	window.print();
};

const openPdf = () => {
	const url = `openlabel://com.jancsinn.label/pdf?file=${encodeURIComponent(state.downloadUrl)}`;
	window.location.href = url;
};
</script>

<style scoped lang="scss">
.demo1-page {
	min-height: 100vh;
	padding: 24px;
	color: #1f2933;
	background: #eef2f5;
}

.notice-doc {
	max-width: 720px;
	margin: 0 auto;
	padding: 18px 22px 26px;
	border-radius: 6px;
	background: #fff;
	box-shadow: 0 8px 24px rgb(24 39 75 / 8%);
	font-size: 15.5px;
	line-height: 1.6;
	word-break: break-word;
}

.notice-doc p {
	margin: 0;
}

.notice-title {
	text-align: center;
	font-size: 21px;
	font-weight: 700;
	line-height: 1.5;
}

.notice-number {
	font-size: 13px;
	line-height: 1.6;
	text-align: right;
}

.notice-paragraph {
	line-height: 1.6;
	text-indent: 2em;
	white-space: pre-wrap;
}

.notice-right {
	line-height: 1.6;
	text-align: right;
}

.action-panel {
	display: flex;
	gap: 12px;
	width: 100%;
	max-width: 720px;
	margin: 18px auto 0;
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

.open-pdf-btn.is-ghost {
	color: #1677ff;
	border: 1px solid #1677ff;
	background: #fff;
}

.pdf-url {
	max-width: 720px;
	margin-top: 16px;
	margin-right: auto;
	margin-left: auto;
	color: #666;
	font-size: 13px;
	line-height: 1.5;
	word-break: break-all;
}

@media print {
	:global(body) {
		background: #fff;
	}

	.demo1-page {
		min-height: auto;
		padding: 0;
		background: #fff;
	}

	.no-print {
		display: none !important;
	}

	.notice-doc {
		max-width: none;
		margin: 0;
		padding: 0;
		border-radius: 0;
		box-shadow: none;
	}
}
</style>

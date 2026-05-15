<template>
	<div class="demo-content px-12">
		<img class="block w-120 mx-auto mb-20 pt-30" alt="Vue logo" src="/@/assets/logo_vue3_ts.png" />
		<div class="pl-12 border-l-3 border-#41b883">
			<a class="flex items-center" href="https://gitee.com/mj-project/vue3-h5-template" target="_blank">
				<svg-icon class="text-20 mr-8" name="gitee" />
				<h3 class="font-bold text-18 my-4">vue3-h5-template</h3>
				<svg-icon class="text-12 ml-5" name="link" />
			</a>
		</div>
		<div class="text-14 py-2 px-10 rounded-4 my-14 bg-[var(--van-background-2)]" @click="pushToAbout">
			<p class="my-14 leading-24">🌱 基于 Vue3 全家桶、Vite 构建工具、TypeScript，开箱即用的移动端项目基础模板</p>
		</div>
		<div class="demo-main mb-20 rounded-4 overflow-hidden">
			<van-cell v-for="(item, idx) in contentList" :key="idx" :title="item" />
		</div>
	</div>
</template>

<script setup lang="ts" name="Home">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const pushToAbout = () => {
	router.push('/about');
};

const contentList = reactive([
	'✔ ⚡ Vue3 + Vite4',
	'✔ 🍕 TypeScript',
	'✔ ✨ Vant4 组件库',
	'✔ 🍍 Pinia 状态管理',
	'✔ 🌀 UnoCSS 原子化 CSS 引擎',
	'✔ 🌓 支持深色模式',
	'✔ Vue-router 4',
	'✔ Axios 封装',
	'✔ 支持 SVG 图标自动注册组件',
	'✔ 打包资源 gzip 压缩',
	'✔ 开发环境支持 Mock',
	'✔ 首屏加载动画',
	'✔ 开发环境调试面板',
]);
</script>

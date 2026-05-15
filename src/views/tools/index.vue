<template>
	<div class="tools-content">
		<div class="pl-12 border-l-3 border-#41b883 mb-12">
			<h3 class="font-bold text-18 my-4">Mock</h3>
		</div>
		<van-space>
			<van-button type="success" @click="handleGetReq">GET请求</van-button>
			<van-button type="primary" @click="handlePostReq">POST请求</van-button>
		</van-space>
		<div class="text-14 py-2 px-10 rounded-4 bg-[var(--color-block-background)] mt-14" @click="pushToAbout">
			<p class="my-14 leading-24">
				{{ showList }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts" name="Tools">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showFailToast } from 'vant';
import { getListApi, postListApi } from '/@/api/mock';

const router = useRouter();
const pushToAbout = () => {
	router.push('/about');
};

const showList = ref<EmptyArrayType>([]);
const handleGetReq = async () => {
	const { code, data } = await getListApi();
	if (code !== 0) return showFailToast('请求失败');
	showList.value.push(...data.list);
};
const handlePostReq = async () => {
	const { code, data } = await postListApi();
	console.log(code, data);
	if (code !== 0) return showFailToast('请求失败');
	console.log('handlePostReq', data);
};
</script>

<style scoped lang="less">
.tools-content {
	padding: 20px 12px 0;
}
</style>

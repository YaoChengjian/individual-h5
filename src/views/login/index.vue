<template>
	<div class="min-h-100vh bg-#f5f8ff px-20 py-34 text-#172033">
		<div class="mx-auto max-w-420">
			<div class="pt-18">
				<div class="text-26 font-900 leading-34">智能单兵巡查套件</div>
				<div class="mt-6 text-14 text-#718096">巡查员移动端登录</div>
			</div>

			<div class="mt-34 rounded-20 bg-white px-16 py-20 shadow-[0_12px_36px_rgba(30,78,150,0.10)]">
				<van-form @submit="handleLogin">
					<van-field
						v-model="form.username"
						name="username"
						label="账号"
						placeholder="请输入账号"
						clearable
						:rules="[{ required: true, message: '请输入账号' }]"
					/>
					<van-field
						v-model="form.password"
						name="password"
						label="密码"
						type="password"
						placeholder="请输入密码"
						clearable
						:rules="[{ required: true, message: '请输入密码' }]"
					/>
					<van-button class="mt-22" block round type="primary" native-type="submit" size="large" :loading="loading">
						登录
					</van-button>
				</van-form>
			</div>

			<div class="mt-14 rounded-14 bg-#eaf3ff px-14 py-12 text-12 leading-20 text-#4b6282">
				演示账号：patrol_001 / 123456
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="Login">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast } from 'vant';
import { h5Login } from '/@/api/patrol';
import { Local, Session } from '/@/utils/storage';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const form = reactive({
	username: 'patrol_001',
	password: '123456',
});

const handleLogin = async () => {
	loading.value = true;
	try {
		const data = await h5Login(form);
		Local.set('token', data.accessToken);
		Local.set('h5User', data.user);
		Session.remove('userInfo');
		showSuccessToast('登录成功');
		const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/patrol';
		router.replace(redirect || '/patrol');
	} finally {
		loading.value = false;
	}
};
</script>

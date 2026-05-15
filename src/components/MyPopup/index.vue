<template>
	<van-popup v-model:show="isShow" round position="bottom" teleport="#app">
		<slot></slot>
	</van-popup>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isShow = ref(false);

const onPopup = () => (isShow.value = true);
const onClose = () => (isShow.value = false);
defineExpose({ onPopup, onClose });
</script>

<style scoped lang="less"></style>

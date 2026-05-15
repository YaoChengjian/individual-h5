<template>
	<MyPopup ref="myPopupRef">
		<van-picker
			v-model="selectVal"
			:title="props.title"
			:columns="props.list"
			:columns-field-names="{ text: 'label', value: 'value', children: 'children' }"
			@confirm="onConfirm"
			@cancel="onClose"
		/>
	</MyPopup>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, nextTick } from "vue";

const MyPopup = defineAsyncComponent(() => import("/@/components/MyPopup/index.vue"));
const myPopupRef = ref();

interface PGSProps {
	list: PickerOptionItem[]; // 选择项
	title?: string; // 标题
	result?: "value" | "object"; // 结果类型
	defaultVal?: (string | number)[]; // 默认选中项
}
const props = withDefaults(defineProps<PGSProps>(), { title: "请选择", result: "value" });
const emits = defineEmits(["confirm"]);

const selectVal = ref<(string | number)[]>([]);
const onPopup = () => {
	nextTick(() => {
		selectVal.value = props.defaultVal || [];
		myPopupRef.value.onPopup();
	});
};
const onClose = () => myPopupRef.value.onClose();
const onConfirm = () => {
	if (props.result === "value") {
		emits("confirm", selectVal.value);
	} else {
		emits(
			"confirm",
			props.list.filter(item => item.value === selectVal.value[0])
		);
	}
	onClose();
};

defineExpose({ onPopup, onClose });
</script>

<style scoped lang="less"></style>

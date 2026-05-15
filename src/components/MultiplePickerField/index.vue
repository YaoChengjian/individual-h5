<template>
	<van-field
		v-model="filedText"
		center
		is-link
		readonly
		label-class="label_class"
		:label="props.label"
		:name="props.name"
		:placeholder="props.placeholder || `请选择${props.label}`"
		:rules="[{ required: props.required, message: props.validateMsg || `${props.label}不能为空` }]"
		@click="() => multiplePickerRef.onPopup()"
	/>
	<MultiplePicker
		ref="multiplePickerRef"
		result="value"
		:list="props.options"
		:title="`请选择${props.label}`"
		:limits="props.limit"
		:default-val="props.modelValue"
		@confirm="onConfirmMultiple"
	/>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";

interface PickerFieldProps {
	modelValue: (string | number)[];
	label: string;
	name: string;
	options: PickerOptionItem[]; // 可选项
	limit?: number; // 限制选择数量
	required?: boolean; // 是否必填
	validateMsg?: string; // 校验结果提示
	placeholder?: string;
}
const props = withDefaults(defineProps<PickerFieldProps>(), {
	limit: 0,
	required: true,
	validateMsg: "",
	placeholder: "",
});
const emits = defineEmits(["update:modelValue"]);

const MultiplePicker = defineAsyncComponent(() => import("/@/components/MultiplePicker/index.vue"));
const multiplePickerRef = ref();

const filedText = ref("");
watch(
	() => props.modelValue,
	val => {
		const items = props.options.filter(item => val.includes(item.value));
		filedText.value = items.map(item => item.label).join("、");
	},
	{ immediate: true }
);

const onConfirmMultiple = (val: (string | number)[]) => {
	emits("update:modelValue", val);
	multiplePickerRef.value.onClose();
};
</script>

<style scoped lang="less"></style>

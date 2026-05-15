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
		@click="() => singlePickerRef.onPopup()"
	/>
	<SinglePicker
		ref="singlePickerRef"
		result="value"
		:list="props.options"
		:title="`请选择${props.label}`"
		:default-val="[props.modelValue]"
		@confirm="onConfirmSingle"
	/>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";

interface PickerFieldProps {
	modelValue: string | number;
	label: string;
	name: string;
	options: PickerOptionItem[]; // 可选项
	required?: boolean; // 是否必填
	validateMsg?: string; // 校验结果提示
	placeholder?: string;
}
const props = withDefaults(defineProps<PickerFieldProps>(), {
	required: true,
	validateMsg: "",
	placeholder: "",
});
const emits = defineEmits(["update:modelValue"]);

const SinglePicker = defineAsyncComponent(() => import("/@/components/SinglePicker/index.vue"));
const singlePickerRef = ref();

const filedText = ref("");
watch(
	() => props.modelValue,
	val => {
		const item = props.options.find(item => item.value === val);
		filedText.value = item ? item.label : "";
	},
	{ immediate: true }
);

const onConfirmSingle = (val: (string | number)[]) => {
	emits("update:modelValue", val[0]);
	singlePickerRef.value.onClose();
};
</script>

<style scoped lang="less"></style>

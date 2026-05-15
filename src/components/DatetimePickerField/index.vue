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
		@click="() => datetimePickerRef.onPopup()"
	/>
	<DateTimePicker ref="datetimePickerRef" :default-val="props.modelValue" @confirm="onConfirmDateTime" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";

interface PickerFieldProps {
	modelValue: string; // YYYY-MM-DD HH:mm:ss
	label: string;
	name: string;
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

const DateTimePicker = defineAsyncComponent(() => import("/@/components/DatetimePicker/index.vue"));
const datetimePickerRef = ref();

const filedText = ref("");
watch(
	() => props.modelValue,
	val => {
		filedText.value = val;
	},
	{ immediate: true }
);

const onConfirmDateTime = (val: string[]) => {
	emits("update:modelValue", val.join(" "));
	filedText.value = val.join(" ");
	datetimePickerRef.value.onClose();
};
</script>

<style scoped lang="less"></style>

<template>
	<MyPopup ref="myPopupRef">
		<van-picker-group
			title="请选择日期时间"
			:tabs="['选择日期', '选择时间']"
			v-model:active-tab="activeTab"
			next-step-text="下一步"
			@confirm="onConfirm"
			@cancel="onClose"
		>
			<van-date-picker v-model="currentDate" />
			<van-time-picker v-model="currentTime" :columns-type="['hour', 'minute', 'second']" />
		</van-picker-group>
	</MyPopup>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, nextTick } from "vue";
import dayjs from "dayjs";

const MyPopup = defineAsyncComponent(() => import("/@/components/MyPopup/index.vue"));
const myPopupRef = ref();

interface DatetimePickerProps {
	defaultVal?: string; // YYYY-MM-DD HH:mm:ss
}
const props = withDefaults(defineProps<DatetimePickerProps>(), { defaultVal: "" });
const emits = defineEmits(["confirm"]);

const activeTab = ref(0);
const currentDate = ref([`${dayjs().year()}`, `${dayjs().month() + 1}`, `${dayjs().date()}`]);
const currentTime = ref(["12", "00", "00"]);

const onConfirm = () => {
	emits("confirm", [currentDate.value.join("-"), currentTime.value.join(":")]);
	onClose();
};
const onPopup = () => {
	nextTick(() => {
		if (props.defaultVal) {
			const [date, time] = props.defaultVal.split(" ");
			currentDate.value = date.split("-");
			currentTime.value = time.split(":");
		}
		activeTab.value = 0;
		myPopupRef.value.onPopup();
	});
};
const onClose = () => myPopupRef.value.onClose();
defineExpose({ onPopup, onClose });
</script>

<style scoped lang="less"></style>

<template>
	<MyPopup ref="myPopupRef">
		<div class="check_toolbar">
			<button class="toolbar_btn cancel" @click.prevent="onClose">取消</button>
			<div class="toolbar_title">{{ props.title }}</div>
			<button class="toolbar_btn confirm" @click.prevent="onConfirm">确定</button>
		</div>
		<van-checkbox-group class="check_box" v-model="checked" style="height: 264px">
			<van-cell-group>
				<van-cell
					v-for="(item, index) in columns"
					:key="item.value"
					:title="item.label"
					clickable
					@click="toggleCheckbox(index)"
				>
					<template #right-icon>
						<van-checkbox
							:ref="(el:CheckboxInstance) => (checkboxRefs[index] = el)"
							:disabled="item.disabled"
							:name="item.value"
							@click.stop
						/>
					</template>
				</van-cell>
			</van-cell-group>
		</van-checkbox-group>
	</MyPopup>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch, nextTick } from "vue";
import type { CheckboxInstance } from "vant";

const MyPopup = defineAsyncComponent(() => import("/@/components/MyPopup/index.vue"));
const myPopupRef = ref();

interface PMSProps {
	list: PickerOptionItem[]; // 选择项
	title?: string; // 标题
	limits?: number; // 限制选择数量
	result?: "value" | "object"; // 结果类型
	defaultVal?: (string | number)[]; // 默认选中项
}
const props = withDefaults(defineProps<PMSProps>(), {
	title: "请选择",
	limits: 0,
	result: "value",
});
const emits = defineEmits(["confirm"]);

const columns = ref<PickerOptionItem[]>([]);
const checked = ref<(string | number)[]>([]);
const checkboxRefs = ref<CheckboxInstance[]>([]);
const toggleCheckbox = (index: number) => {
	if (columns.value[index].disabled) return;
	checkboxRefs.value[index].toggle();
};
const calcLimits = () => {
	if (props.limits && checked.value.length === props.limits) {
		columns.value.forEach(item => {
			if (!checked.value.includes(item.value)) item.disabled = true;
		});
	} else if (props.limits && checked.value.length < props.limits) {
		columns.value.forEach(item => (item.disabled = false));
	}
};

const onPopup = () => {
	nextTick(() => {
		columns.value = props.list.map(item => ({ ...item, disabled: false }));
		checked.value = props.defaultVal || [];
		myPopupRef.value.onPopup();
		calcLimits();
	});
};
const onClose = () => myPopupRef.value.onClose();
const onConfirm = () => {
	if (props.result === "value") {
		emits("confirm", checked.value);
	} else {
		emits(
			"confirm",
			columns.value.filter(item => checked.value.includes(item.value))
		);
	}
	onClose();
};

watch(checked, calcLimits);

defineExpose({ onPopup, onClose });
</script>

<style scoped lang="less">
.check_toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 44px;
	.toolbar_title {
		flex: 1;
		font-weight: var(--van-font-bold);
		font-size: var(--van-picker-title-font-size);
		line-height: var(--van-picker-title-line-height);
		text-align: center;
	}
	.toolbar_btn {
		height: 100%;
		padding: var(--van-picker-action-padding);
		font-size: var(--van-picker-action-font-size);
		background-color: transparent;
		border: none;
	}
	.cancel {
		color: var(--van-picker-cancel-action-color);
	}
	.confirm {
		color: var(--van-picker-confirm-action-color);
	}
}
.check_box {
	box-sizing: border-box;
	padding-bottom: 4px;
	overflow-y: auto;
}
</style>

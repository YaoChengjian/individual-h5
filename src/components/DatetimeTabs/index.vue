<template>
	<div class="datetime_tabs">
		<van-tabs v-model:active="active" type="card">
			<van-tab title="开始时间" name="start">
				<van-date-picker v-model="startTime" :show-toolbar="false" :min-date="minDate" />
			</van-tab>
			<van-tab title="结束时间" name="finish">
				<van-date-picker
					v-model="finishTime"
					:show-toolbar="false"
					:min-date="dayjs(startTime.join('-')).toDate()"
				/>
			</van-tab>
		</van-tabs>
		<div class="btns_container">
			<div class="datetime_btn">
				<van-button round block type="default" size="small" @click="onClear">清 空</van-button>
			</div>
			<div class="datetime_btn">
				<van-button round block type="primary" size="small" @click="onSubmit">{{
					active === "start" ? "下一步" : "确 定"
				}}</van-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";

const emits = defineEmits(["submit", "close"]);

const active = ref("start");
const minDate = new Date(2020, 0, 1);
const startTime = ref<string[]>([
	`${dayjs().get("year")}`,
	`${dayjs().get("month") + 1}`,
	`${dayjs().get("date")}`,
]);
const finishTime = ref<string[]>([
	`${dayjs().get("year")}`,
	`${dayjs().get("month") + 1}`,
	`${dayjs().get("date")}`,
]);

const onClear = () => {
	startTime.value = [`${dayjs().get("year")}`, `${dayjs().get("month") + 1}`, `${dayjs().get("date")}`];
	finishTime.value = [`${dayjs().get("year")}`, `${dayjs().get("month") + 1}`, `${dayjs().get("date")}`];
	active.value = "start";
	emits("submit", { startTime: "", finishTime: "" });
	emits("close");
};
const onSubmit = () => {
	if (active.value === "start") {
		active.value = "finish";
	} else {
		emits("submit", {
			startTime: dayjs(startTime.value.join("-")).format("YYYY-MM-DD 00:00:00"),
			finishTime: dayjs(finishTime.value.join("-")).format("YYYY-MM-DD 23:59:59"),
		});
		emits("close");
	}
};
</script>

<style scoped lang="less">
.datetime_tabs {
	.btns_container {
		display: flex;
		align-items: center;
		.datetime_btn {
			flex: 1;
			padding: 0 8px 10px;
		}
	}
}
</style>

<template>
	<div class="min-h-100vh bg-gradient-to-b from-#eef5ff to-#f7faff text-#172033" :class="actionVisible ? 'pb-92' : 'pb-12'">
		<van-loading v-if="loading" class="mt-70 flex justify-center" />
		<div v-else-if="current" class="px-12 py-12">
			<section class="rounded-18 border border-#e5edf8 bg-white p-14 shadow-[0_10px_26px_rgba(28,75,145,0.08)]">
				<div class="space-y-2">
					<div class="flex items-center justify-between gap-12 border-b border-#edf2f7 py-11">
						<div class="inline-flex h-22 shrink-0 items-center text-13 leading-22 text-#8b95a5">状态</div>
						<span class="inline-flex h-22 items-center text-12 font-700 leading-22" :style="{ color: statusColor(current) }">{{ statusName(current) }}</span>
					</div>
					<InfoRow label="任务标题" :value="current.title" />
					<div class="flex items-center justify-between gap-12 border-b border-#edf2f7 py-11">
						<div class="inline-flex h-22 shrink-0 items-center text-13 leading-22 text-#8b95a5">任务类型</div>
						<span class="inline-flex min-h-22 items-center rounded-6 border px-8 py-2 text-12 font-700 leading-18" :style="tagStyle(taskTypeColor(current))">
							{{ taskTypeName(current) }}
						</span>
					</div>
					<div class="flex items-center justify-between gap-12 border-b border-#edf2f7 py-11">
						<div class="inline-flex h-22 shrink-0 items-center text-13 leading-22 text-#8b95a5">优先级</div>
						<span class="inline-flex min-h-22 items-center rounded-6 border px-8 py-2 text-12 font-700 leading-18" :style="tagStyle(priorityColor(current))">
							{{ priorityName(current) }}
						</span>
					</div>
					<InfoRow label="任务编号" :value="current.taskCode" />
					<InfoRow label="任务开始时间" :value="current.startTime" />
					<InfoRow label="任务结束时间" :value="current.endTime" />
					<InfoRow label="预计时长" :value="durationText" />
					<InfoRow label="重复规则" :value="repeatRuleName(current)" />
					<InfoRow label="执行人" :value="current.executorName || current.assigneeName || '-'" />
					<InfoRow label="任务说明" :value="current.description || '暂无任务说明'" />
				</div>
			</section>
			<section
				v-if="workOrderEntryVisible"
				class="mt-10 flex items-center justify-between rounded-16 border border-#e5edf8 bg-white px-14 py-13 shadow-[0_10px_26px_rgba(28,75,145,0.08)] active:scale-[0.99]"
				@click="openWorkOrders"
			>
				<div class="min-w-0">
					<div class="text-15 font-900 leading-21 text-#172033">事件工单</div>
					<div class="mt-2 truncate text-12 leading-18 text-#8b95a5">{{ workOrderEntryDesc }}</div>
				</div>
				<div class="ml-12 inline-flex h-30 w-30 shrink-0 items-center justify-center rounded-full bg-#eef5ff text-#1677ff">
					<van-icon name="arrow" size="16" />
				</div>
			</section>
		</div>

		<div v-if="current && actionVisible" class="fixed bottom-0 left-0 right-0 z-20 border-t border-#e7edf7 bg-white px-12 py-10">
			<van-button v-if="taskStatusCode === 'waiting'" block round type="primary" size="large" :loading="actionLoading" @click="handleStart">
				开始巡查
			</van-button>
			<van-button v-else block round type="danger" size="large" :loading="actionLoading" @click="handleFinish">结束巡查</van-button>
		</div>
	</div>
</template>

<script setup lang="ts" name="PatrolDetail">
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { finishTask, getTaskDetail, listDictionaryData, startTask, type DictionaryData, type PatrolTask } from '/@/api/patrol';

const InfoRow = defineComponent({
	name: 'InfoRow',
	props: {
		label: { type: String, required: true },
		value: { type: String, default: '-' },
	},
	setup(props) {
		return () =>
			h('div', { class: 'flex items-center justify-between gap-12 border-b border-#edf2f7 py-11 last:border-b-0' }, [
				h('div', { class: 'inline-flex h-22 shrink-0 items-center text-13 leading-22 text-#8b95a5' }, props.label),
				h('div', { class: 'inline-flex min-h-22 min-w-0 flex-1 items-center justify-end break-words text-right text-14 font-800 leading-22 text-#253046' }, props.value || '-'),
			]);
	},
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const actionLoading = ref(false);
const current = ref<PatrolTask>();
const statusDict = ref<DictionaryData[]>([]);

const fallbackStatusDict: DictionaryData[] = [
	{ dictDataCode: 'waiting', dictDataName: '待执行', color: '#7c3aed', ripple: 1 },
	{ dictDataCode: 'running', dictDataName: '执行中', color: '#20b56b', ripple: 1 },
	{ dictDataCode: 'finished', dictDataName: '已完成', color: '#1f6feb', ripple: 0 },
	{ dictDataCode: 'overdue', dictDataName: '已逾期', color: '#f04438', ripple: 1 },
];

const fallbackTypeName: Record<string, string> = {
	fire_safety: '消防安全',
	environment: '环境巡查',
	governance: '综合治理',
};

const fallbackPriority: Record<string, { label: string; color: string }> = {
	low: { label: '低', color: '#22c55e' },
	medium: { label: '中', color: '#f59e0b' },
	high: { label: '高', color: '#f97316' },
	urgent: { label: '紧急', color: '#f04438' },
};

const fallbackRepeatRuleName: Record<string, string> = {
	none: '不重复',
	repeat: '重复',
};

const statusMap = computed(() => {
	const rows = statusDict.value.length ? statusDict.value : fallbackStatusDict;
	return rows.reduce<Record<string, DictionaryData>>((map, item) => {
		map[item.dictDataCode] = item;
		return map;
	}, {});
});

const taskStatusCode = computed(() => current.value?.status || current.value?.taskStatus || '');
const actionVisible = computed(() => ['waiting', 'running'].includes(taskStatusCode.value));
const workOrderEntryVisible = computed(() => ['running', 'finished'].includes(taskStatusCode.value));
const workOrderEntryDesc = computed(() => (taskStatusCode.value === 'finished' ? '查看已完成巡查工单与打印记录' : '查看巡查中推送的工单并打印'));
const durationText = computed(() => `${current.value?.durationHours || 0} 小时`);

const tagStyle = (color?: string) => ({
	color: color || '#1677ff',
	backgroundColor: `${color || '#1677ff'}16`,
	borderColor: `${color || '#1677ff'}30`,
});
const getStatus = (task: PatrolTask) => statusMap.value[task.status] || statusMap.value[task.taskStatus] || undefined;
const statusName = (task: PatrolTask) => getStatus(task)?.dictDataName || task.statusName || task.taskStatusName || task.status;
const statusColor = (task: PatrolTask) => getStatus(task)?.color || task.statusColor || '#1677ff';
const taskTypeName = (task: PatrolTask) => task.taskTypeName || task.typeName || fallbackTypeName[task.taskType] || fallbackTypeName[task.type] || task.taskType || task.type;
const priorityName = (task: PatrolTask) => task.priorityName || fallbackPriority[task.priority || '']?.label || task.priority || '-';
const taskTypeColor = (task: PatrolTask) => {
	const code = task.taskType || task.type;
	const colorMap: Record<string, string> = {
		fire_safety: '#1677ff',
		environment: '#20b56b',
		governance: '#f59e0b',
	};
	return colorMap[code] || '#1677ff';
};
const priorityColor = (task: PatrolTask) => fallbackPriority[task.priority || '']?.color || '#1677ff';
const repeatRuleName = (task: PatrolTask) => task.repeatRuleName || fallbackRepeatRuleName[task.repeatRule || ''] || task.repeatRule || '-';

const loadDictionary = async () => {
	try {
		const rows = await listDictionaryData('patrol_task_status');
		statusDict.value = rows.filter((item) => item.dictDataCode !== 'pending');
	} catch {
		statusDict.value = fallbackStatusDict;
	}
};

const loadDetail = async () => {
	const taskId = Number(route.params.taskId);
	if (!taskId) {
		await router.replace('/patrol');
		return;
	}
	loading.value = true;
	try {
		current.value = await getTaskDetail(taskId);
	} finally {
		loading.value = false;
	}
};

const handleStart = async () => {
	if (!current.value) return;
	actionLoading.value = true;
	try {
		current.value = await startTask(current.value.taskId);
		showSuccessToast('任务已开始');
	} catch (error: any) {
		showFailToast(error?.message || '当前还有任务未执行完成，请完成后再开始新的巡查任务');
	} finally {
		actionLoading.value = false;
	}
};

const openWorkOrders = () => {
	if (!current.value) return;
	router.push(`/patrol/work-orders/${current.value.taskId}`);
};

const handleFinish = async () => {
	if (!current.value) return;
	await showConfirmDialog({
		title: '结束巡查',
		message: '确认结束当前巡查任务？结束后任务状态会变为已完成。',
	});
	actionLoading.value = true;
	try {
		current.value = await finishTask(current.value.taskId);
		showSuccessToast('任务已完成');
	} finally {
		actionLoading.value = false;
	}
};

onMounted(async () => {
	await loadDictionary();
	await loadDetail();
});
</script>

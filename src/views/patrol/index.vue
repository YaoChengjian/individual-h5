<template>
	<div class="flex h-full min-h-100vh flex-col bg-gradient-to-b from-#eef5ff to-#f7faff text-#172033">
		<van-pull-refresh v-model="refreshing" class="min-h-0 flex-1" @refresh="loadTasks">
			<div class="min-h-full px-12 py-14">
				<van-loading v-if="loading" class="mt-70 flex justify-center" />
				<van-empty v-else-if="!tasks.length" description="暂无巡查任务" />
				<div v-else class="space-y-10">
					<div
						v-for="item in tasks"
						:key="item.taskId"
						class="overflow-hidden rounded-14 border border-#e4ebf6 bg-white px-14 py-12 shadow-[0_10px_26px_rgba(28,75,145,0.08)] active:scale-[0.99]"
						@click="openDetail(item.taskId)"
					>
						<div class="space-y-8">
							<div class="flex items-center justify-between gap-10">
								<InfoLine label="编号" :value="item.taskCode" value-class="text-#7b8798" />
							</div>
							<InfoLine label="标题" :value="item.title" value-class="font-800 text-#172033" />
							<div class="flex items-center gap-8">
								<FieldLabel text="标签" />
								<div class="flex min-w-0 flex-1 flex-wrap items-center gap-6">
									<span class="inline-flex min-h-22 items-center rounded-6 border border-#b8d4ff bg-#eef5ff px-8 py-2 text-12 font-700 leading-18 text-#1677ff">{{ taskTypeName(item) }}</span>
								</div>
							</div>
							<InfoLine label="开始时间" :value="item.startTime" value-class="text-#4b5563" />
							<InfoLine label="结束时间" :value="item.endTime" value-class="text-#4b5563" />
							<div class="mt-4 flex items-center justify-between border-t border-#edf2f7 pt-10">
								<van-tag color="#f2f5fa" text-color="#637083" round size="medium" @click.stop="copyTaskCode(item.taskCode)">复制</van-tag>
								<span class="text-12 font-700" :style="{ color: statusColor(item) }">{{ statusName(item) }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</van-pull-refresh>
	</div>
</template>

<script setup lang="ts" name="Patrol">
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast } from 'vant';
import { getMyTasks, listDictionaryData, type DictionaryData, type PatrolTask } from '/@/api/patrol';

const FieldLabel = defineComponent({
	name: 'FieldLabel',
	props: {
		text: { type: String, required: true },
	},
	setup(props) {
		return () => h('span', { class: 'inline-flex h-22 shrink-0 items-center justify-center rounded-4 bg-#f3f7ff px-7 text-12 font-700 leading-18 text-#566273' }, props.text);
	},
});

const InfoLine = defineComponent({
	name: 'InfoLine',
	props: {
		label: { type: String, required: true },
		value: { type: String, default: '-' },
		valueClass: { type: String, default: 'text-#4b5563' },
	},
	setup(props) {
		return () =>
			h('div', { class: 'flex min-w-0 flex-1 items-center gap-8' }, [
				h(FieldLabel, { text: props.label }),
				h('div', { class: `min-w-0 flex-1 break-words text-13 leading-22 ${props.valueClass}` }, props.value || '-'),
			]);
	},
});

const router = useRouter();
const loading = ref(false);
const refreshing = ref(false);
const tasks = ref<PatrolTask[]>([]);
const statusDict = ref<DictionaryData[]>([]);

const fallbackStatusDict: DictionaryData[] = [
	{ dictDataCode: 'waiting', dictDataName: '待执行', color: '#7c3aed', ripple: 1 },
	{ dictDataCode: 'running', dictDataName: '执行中', color: '#20b56b', ripple: 1 },
	{ dictDataCode: 'finished', dictDataName: '已完成', color: '#1f6feb', ripple: 0 },
	{ dictDataCode: 'overdue', dictDataName: '已逾期', color: '#f04438', ripple: 1 },
];

const statusMap = computed(() => {
	const rows = statusDict.value.length ? statusDict.value : fallbackStatusDict;
	return rows.reduce<Record<string, DictionaryData>>((map, item) => {
		map[item.dictDataCode] = item;
		return map;
	}, {});
});

const fallbackTypeName: Record<string, string> = {
	fire_safety: '消防安全',
	environment: '环境巡查',
	governance: '综合治理',
};

const tagStyle = (color?: string) => ({
	color: color || '#1677ff',
	backgroundColor: `${color || '#1677ff'}16`,
	border: `1px solid ${color || '#1677ff'}30`,
});
const getStatus = (task: PatrolTask) => statusMap.value[task.status] || statusMap.value[task.taskStatus] || undefined;
const statusName = (task: PatrolTask) => getStatus(task)?.dictDataName || task.statusName || task.taskStatusName || task.status;
const statusColor = (task: PatrolTask) => getStatus(task)?.color || task.statusColor || '#1677ff';
const statusStyle = (task: PatrolTask) => tagStyle(statusColor(task));
const taskTypeName = (task: PatrolTask) => task.taskTypeName || task.typeName || fallbackTypeName[task.taskType] || fallbackTypeName[task.type] || task.taskType || task.type;

const loadDictionary = async () => {
	try {
		const rows = await listDictionaryData('patrol_task_status');
		statusDict.value = rows.filter((item) => item.dictDataCode !== 'pending');
	} catch {
		statusDict.value = fallbackStatusDict;
	}
};

const loadTasks = async () => {
	loading.value = true;
	try {
		const data = await getMyTasks();
		tasks.value = data.list || [];
	} finally {
		loading.value = false;
		refreshing.value = false;
	}
};

const openDetail = (taskId: number) => {
	router.push(`/patrol/detail/${taskId}`);
};

const copyTaskCode = async (taskCode: string) => {
	if (!taskCode) return;
	await navigator.clipboard?.writeText(taskCode);
	showSuccessToast('已复制');
};

onMounted(async () => {
	await loadDictionary();
	await loadTasks();
});
</script>

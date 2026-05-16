<template>
	<div class="min-h-100vh bg-gradient-to-b from-#eef5ff to-#f7faff text-#172033" :class="selectedOrders.length ? 'pb-94' : 'pb-12'">
		<van-loading v-if="loading" class="mt-70 flex justify-center" />
		<div v-else class="px-12 py-12">
			<section class="mb-12 rounded-18 border border-#e5edf8 bg-white p-12 shadow-[0_10px_26px_rgba(28,75,145,0.08)]">
				<van-address-list
					v-model="selectedIds"
					class="work-order-address-list"
					:list="addressList"
					:disabled-list="disabledAddressList"
					:right-icon="''"
					:switchable="true"
					:show-add-button="false"
				>
					<template #item-bottom="item">
						<div class="mt-8 flex items-center justify-between gap-10 pl-30 pr-34 text-12 text-#7b8798">
							<van-tag round :type="item.statusType">{{ item.statusName }}</van-tag>
							<span class="min-w-0 text-right">{{ item.reportTime }}</span>
						</div>
						<button
							type="button"
							class="work-order-card-action"
							:class="{ 'is-view': item.processed }"
							@click.stop="handleAddressEdit(item)"
						>
							<van-icon :name="item.processed ? 'eye-o' : 'edit'" />
						</button>
					</template>
				</van-address-list>
				<van-empty v-if="!workOrders.length" image-size="72" description="暂无工单" />
			</section>
		</div>

		<van-popup v-model:show="previewVisible" round position="bottom" class="max-h-86vh overflow-hidden bg-#f7faff">
			<div class="flex h-86vh flex-col">
				<div class="flex items-center justify-between border-b border-#e7edf7 bg-white px-14 py-12">
					<div class="text-16 font-900">打印预览</div>
					<van-tag round type="primary">{{ selectedOrders.length }} 条</van-tag>
				</div>
				<div class="flex-1 overflow-y-auto px-12 py-12">
					<article ref="noticeDocRef" class="notice-doc">
						<p class="notice-title">智能单兵巡查体验工单</p>
						<p class="notice-title">整改提醒告知书</p>
						<p class="notice-number">{{ state.noticeNumber }}</p>
						<p class="notice-paragraph">
							智能单兵巡查项目体验者于<strong>{{ state.currentDate }}</strong
							>在模拟场景中，成功发现并上报了一份事件工单,具体如下:
						</p>
						<p v-for="item in selectedWorkOrderTexts" :key="item" class="notice-paragraph">{{ item }}</p>
						<p class="notice-paragraph">
							请于<strong>{{ state.currentDate }}</strong
							>之前完成上述问题的整改。逾期未改的，将严格依法处理。
						</p>
						<p class="notice-right">广州雁盟科技有限公司</p>
						<p class="notice-right">
							<strong>{{ state.currentDate }}</strong>
						</p>
						<p class="notice-paragraph">感谢您亲身体验“巡查-上报-处置”的数字化闭环！真正的智能，始于每一次敏锐的发现与高效的协同。</p>
						<p class="notice-paragraph">
							<strong>广州雁盟科技</strong
							>以<strong>数字孪生</strong>与<strong>AI</strong>融合创新，为政府与企业提供“软硬服”一体的智慧化综合解决方案,为城市精细化管理提供端到端的数字赋能。让每一次巡查都智能，让每一个事件都被妥善响应。
						</p>
						<p class="notice-right"><strong>联系方式：XXX@yanmeng-tech.com</strong></p>
					</article>
				</div>
				<div class="grid grid-cols-2 gap-10 border-t border-#e7edf7 bg-white px-12 py-10">
					<van-button round plain type="default" size="large" @click="previewVisible = false">取消</van-button>
					<van-button round type="primary" size="large" :loading="state.isUploading" @click="confirmPrint">
						{{ state.isUploading ? '生成中...' : '确认工单并打印' }}
					</van-button>
				</div>
			</div>
		</van-popup>

		<van-popup v-model:show="editVisible" round position="bottom" class="bg-#f7faff">
			<div class="px-14 pb-14 pt-12">
				<div class="mb-12 flex items-center justify-between">
					<div class="flex items-center gap-6 text-16 font-900 text-#172033">
						<van-icon :name="editReadonly ? 'eye-o' : 'edit'" class="text-#1677ff" />
						<span>{{ editReadonly ? '查看工单' : '编辑工单' }}</span>
					</div>
					<van-tag round :type="editReadonly ? 'success' : 'warning'">{{ editReadonly ? '已完成' : '待处理' }}</van-tag>
				</div>
				<van-form @submit="saveWorkOrderEdit">
					<van-cell-group inset class="!mx-0 overflow-hidden rounded-16">
						<van-field
							v-model="editForm.title"
							name="title"
							label="标题"
							type="textarea"
							placeholder="请输入工单标题"
							rows="2"
							autosize
							maxlength="50"
							show-word-limit
							:readonly="editReadonly"
							:rules="[{ required: true, message: '请输入工单标题' }]"
						/>
						<van-field
							v-model="editForm.description"
							name="description"
							label="描述"
							type="textarea"
							placeholder="请输入工单描述"
							rows="4"
							autosize
							maxlength="300"
							show-word-limit
							:readonly="editReadonly"
							:rules="[{ required: true, message: '请输入工单描述' }]"
						/>
					</van-cell-group>
					<div class="mt-12 rounded-16 bg-white p-12 shadow-[0_8px_20px_rgba(28,75,145,0.06)]">
						<div class="mb-8 flex items-center gap-6 text-13 font-800 text-#172033">
								<van-icon name="photo-o" class="text-#1677ff" />
							<span>图片</span>
						</div>
						<div v-if="editImageList.length" class="grid grid-cols-3 gap-8">
							<van-image
								v-for="(image, index) in editImageList"
								:key="image"
								class="aspect-square w-full overflow-hidden rounded-12 border border-#d8e6f7 shadow-[0_6px_14px_rgba(28,75,145,0.08)]"
								width="100%"
								height="100%"
								fit="cover"
								:src="image"
								@click.stop="previewWorkOrderImage(index)"
							/>
						</div>
						<van-empty v-else image-size="54" description="暂无现场图片" />
					</div>
					<div class="mt-12 grid grid-cols-2 gap-10">
						<van-button round plain block size="large" native-type="button" @click="editVisible = false">取消</van-button>
						<van-button v-if="!editReadonly" round block type="primary" size="large" native-type="submit" :loading="editSaving">保存</van-button>
						<van-button v-else round block type="primary" size="large" native-type="button" @click="editVisible = false">关闭</van-button>
					</div>
				</van-form>
			</div>
		</van-popup>

		<van-image-preview
			v-model:show="imagePreviewVisible"
			:images="editImageList"
			:start-position="imagePreviewIndex"
			closeable
			teleport="body"
			@change="imagePreviewIndex = $event"
		/>

		<div v-if="selectedOrders.length" class="fixed bottom-0 left-0 right-0 z-20 border-t border-#e7edf7 bg-white px-12 py-10">
			<van-button block round type="primary" size="large" @click="openPreview"> 打印查看 </van-button>
		</div>
	</div>
</template>

<script setup lang="ts" name="PatrolWorkOrders">
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import {
	bindTaskWorkOrders,
	getTaskDetail,
	getTaskWorkOrders,
	updateTaskWorkOrder,
	uploadH5PrintFile,
	type PatrolTask,
	type PatrolWorkOrder,
} from '/@/api/patrol';

type AddressItem = {
	id: number;
	name: string;
	tel: string;
	address: string;
	statusName: string;
	statusType: 'warning' | 'success';
	reportTime: string;
	editable: boolean;
	processed: boolean;
};

const uploadHost = 'http://gas.coschat.com/';
const uploadUrl = `${uploadHost}admin/upload`;
const route = useRoute();
const router = useRouter();
const now = new Date();
const currentDate = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
const noticeDocRef = ref<HTMLElement>();
const loading = ref(false);
const task = ref<PatrolTask>();
const workOrders = ref<PatrolWorkOrder[]>([]);
const selectedIds = ref<number[]>([]);
const previewVisible = ref(false);
const editVisible = ref(false);
const editSaving = ref(false);
const editReadonly = ref(false);
const editImageList = ref<string[]>([]);
const imagePreviewVisible = ref(false);
const imagePreviewIndex = ref(0);
const editForm = reactive({
	workOrderId: 0,
	title: '',
	description: '',
});
let pollTimer: number | undefined;

const state = reactive({
	currentDate,
	noticeNumber: `改${now.getTime()}号`,
	isUploading: false,
});

const selectedOrders = computed(() => {
	const selectedSet = new Set(selectedIds.value);
	return workOrders.value.filter((item) => selectedSet.has(item.workOrderId) && !isProcessedWorkOrder(item));
});

const isProcessedWorkOrder = (item: PatrolWorkOrder) => ['processed', 'finished'].includes(item.status) || item.printStatus === 'PRINTED' || !!item.printed;

const pendingWorkOrders = computed(() => workOrders.value.filter((item) => !isProcessedWorkOrder(item)));

const processedWorkOrders = computed(() => workOrders.value.filter(isProcessedWorkOrder));

const toAddressItem = (item: PatrolWorkOrder, processed = false): AddressItem => ({
	id: item.workOrderId,
	name: item.title || item.locationName || item.addressDetail || item.eventTypeName || '智能巡查工单',
	tel: '',
	address: [item.addressDetail, item.description].filter(Boolean).join(' ｜ '),
	statusName: processed ? '已完成' : item.statusName || '待处理',
	statusType: processed ? 'success' : 'warning',
	reportTime: item.reportTime || '',
	editable: !processed && (item.status === 'pending_report' || item.statusName === '待处理'),
	processed,
});

const selectedWorkOrderTexts = computed(() => {
	if (!selectedOrders.value.length) return ['请选择需要打印的事件工单。'];
	return selectedOrders.value.map((item, index) => {
		const location = [item.locationName, item.addressDetail].filter(Boolean).join('，');
		return `${index + 1}. 工单标题：${item.title || item.eventTypeName || '智能巡查工单'}；事件类型：${
			item.eventTypeName || '智能巡查事件'
		}；上报人：${item.reporterName || '-'}；位置：${location || '-'}；上报时间：${item.reportTime || '-'}；问题描述：${
			item.description || '-'
		}；整改建议：${item.suggestion || '请尽快核实并完成整改'}。`;
	});
});

const documentContent = computed(() => {
	return [
		'智能单兵巡查体验工单',
		'整改提醒告知书',
		state.noticeNumber,
		`智能单兵巡查项目体验者于${state.currentDate}在模拟场景中，成功发现并上报了一份事件工单,具体如下:`,
		...selectedWorkOrderTexts.value,
		`请于${state.currentDate}之前完成上述问题的整改。逾期未改的，将严格依法处理。`,
		'广州雁盟科技有限公司',
		state.currentDate,
		'感谢您亲身体验“巡查-上报-处置”的数字化闭环！真正的智能，始于每一次敏锐的发现与高效的协同。',
		'广州雁盟科技以数字孪生与AI融合创新，为政府与企业提供“软硬服”一体的智慧化综合解决方案,为城市精细化管理提供端到端的数字赋能。让每一次巡查都智能，让每一个事件都被妥善响应。',
		'联系方式：XXX@yanmeng-tech.com',
	].join('\n');
});

const addressList = computed<AddressItem[]>(() => pendingWorkOrders.value.map((item) => toAddressItem(item)));

const disabledAddressList = computed<AddressItem[]>(() => processedWorkOrders.value.map((item) => toAddressItem(item, true)));

const normalizeImageSrc = (value?: string) => {
	const imageSrc = value?.trim();
	if (!imageSrc) return '';
	if (/^(data:|https?:\/\/|\/)/i.test(imageSrc)) return imageSrc;
	return `data:image/jpeg;base64,${imageSrc}`;
};

const getWorkOrderImages = (order?: PatrolWorkOrder) => {
	if (!order) return [];
	const candidates = [
		order.imageBase64,
		order.imageUrl,
		order.base64,
		...(order.evidenceList || []).flatMap((item) => [
			item?.imageBase64,
			item?.imageUrl,
			item?.base64,
			item?.fileUrl,
			item?.url,
		]),
	];
	return Array.from(new Set(candidates.map((item) => normalizeImageSrc(String(item || ''))).filter(Boolean)));
};

const openWorkOrderPanel = (workOrderId: number, readonly = false) => {
	const order = workOrders.value.find((item) => item.workOrderId === workOrderId);
	if (!order) return;
	editForm.workOrderId = order.workOrderId;
	editForm.title = order.title || '';
	editForm.description = order.description || '';
	editReadonly.value = readonly || isProcessedWorkOrder(order);
	editImageList.value = getWorkOrderImages(order);
	editVisible.value = true;
};

const handleAddressEdit = (item: AddressItem) => {
	openWorkOrderPanel(item.id, item.processed || !item.editable);
};

const previewWorkOrderImage = (index = 0) => {
	if (!editImageList.value.length) return;
	imagePreviewIndex.value = index;
	imagePreviewVisible.value = true;
};

const saveWorkOrderEdit = async () => {
	if (editReadonly.value) return;
	const taskId = task.value?.taskId || Number(route.params.taskId);
	if (!taskId || !editForm.workOrderId) return;
	editSaving.value = true;
	try {
		const updated = await updateTaskWorkOrder({
			taskId,
			workOrderId: editForm.workOrderId,
			title: editForm.title.trim(),
			description: editForm.description.trim(),
		});
		workOrders.value = workOrders.value.map((item) => (item.workOrderId === updated.workOrderId ? { ...item, ...updated } : item));
		editVisible.value = false;
		showToast({ message: '工单已更新', icon: '' });
	} catch (error: any) {
		showToast({ message: error?.message || '保存失败', icon: '' });
	} finally {
		editSaving.value = false;
	}
};

const mergeWorkOrders = (rows: PatrolWorkOrder[]) => {
	const rowMap = new Map(rows.map((item) => [item.workOrderCode || String(item.workOrderId), item]));
	const nextList = workOrders.value.map((item) => {
		const key = item.workOrderCode || String(item.workOrderId);
		const latest = rowMap.get(key);
		if (!latest) return item;
		rowMap.delete(key);
		return { ...item, ...latest };
	});

	const newRows = Array.from(rowMap.values());
	workOrders.value = [...nextList, ...newRows];
	const availableIds = new Set(workOrders.value.filter((item) => !isProcessedWorkOrder(item)).map((item) => item.workOrderId));
	selectedIds.value = selectedIds.value.filter((id) => availableIds.has(id));
};

const pollWorkOrders = async () => {
	const taskId = Number(route.params.taskId);
	if (!taskId || !task.value || task.value.taskStatus === 'waiting') return;
	try {
		const rows = await getTaskWorkOrders(taskId);
		if (rows.length) mergeWorkOrders(rows);
	} catch {
		// 演示轮询保持静默，避免弱网时频繁打断操作。
	}
};

const startPolling = () => {
	if (pollTimer) window.clearInterval(pollTimer);
	pollTimer = window.setInterval(pollWorkOrders, 1000);
};

const loadData = async () => {
	const taskId = Number(route.params.taskId);
	if (!taskId) {
		await router.replace('/patrol');
		return;
	}
	loading.value = true;
	try {
		task.value = await getTaskDetail(taskId);
		const rows = await getTaskWorkOrders(taskId);
		mergeWorkOrders(rows);
		startPolling();
	} finally {
		loading.value = false;
	}
};

const getUploadFilePath = (data: any): string => {
	if (!data) return '';
	if (typeof data === 'string') return data;

	const filePath = data.path || data.filePath || data.file_path || data.url;
	if (typeof filePath === 'string') return filePath;

	return getUploadFilePath(data.data || data.file || data.result);
};

const normalizeFileUrl = (filePath: string, host = uploadHost) => {
	const rawPath = filePath.trim();
	if (/^https?:\/\//i.test(rawPath)) return rawPath;
	const normalizedPath = rawPath.replace(/^\/+/, '').replace(/^static\/?/, '');
	return `${host.replace(/\/?$/, '/')}static/${normalizedPath}`;
};

const parseUploadResult = (responseText: string) => {
	if (!responseText) return {};
	try {
		return JSON.parse(responseText);
	} catch {
		return responseText;
	}
};

const formatFileUrl = (filePath: string) => {
	return normalizeFileUrl(filePath);
};

const createCurrentNoticePdf = async () => {
	await nextTick();
	if (!noticeDocRef.value) throw new Error('文档内容不存在');

	const canvas = await html2canvas(noticeDocRef.value, {
		backgroundColor: '#ffffff',
		scale: Math.max(window.devicePixelRatio || 1, 2),
		useCORS: true,
	});
	const imageData = canvas.toDataURL('image/jpeg', 0.98);
	const pdf = new jsPDF('p', 'mm', 'a4');
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;
	const maxWidth = pageWidth - margin * 2;
	const maxHeight = pageHeight - margin * 2;
	const imageRatio = canvas.width / canvas.height;
	let renderWidth = maxWidth;
	let renderHeight = renderWidth / imageRatio;

	if (renderHeight > maxHeight) {
		renderHeight = maxHeight;
		renderWidth = renderHeight * imageRatio;
	}

	const renderX = (pageWidth - renderWidth) / 2;
	pdf.addImage(imageData, 'JPEG', renderX, margin, renderWidth, renderHeight);

	return pdf.output('blob');
};

const uploadPdfToGasHost = async (pdfBlob: Blob, fileName: string) => {
	const formData = new FormData();
	formData.append('file', pdfBlob, fileName);

	const uploadResponse = await fetch(uploadUrl, {
		method: 'POST',
		body: formData,
	});
	if (!uploadResponse.ok) throw new Error('PDF 上传失败');

	const responseText = await uploadResponse.text();
	const uploadResult = parseUploadResult(responseText);
	const filePath = getUploadFilePath(uploadResult);
	if (!filePath) throw new Error('上传接口未返回文件路径');

	return formatFileUrl(filePath);
};

const uploadPdfToLocalHost = async (pdfBlob: Blob, fileName: string) => {
	const uploadResult = await uploadH5PrintFile(pdfBlob, fileName);
	const filePath = getUploadFilePath(uploadResult);
	if (!filePath) throw new Error('上传接口未返回文件路径');
	return normalizeFileUrl(filePath, window.location.origin);
};

const uploadPdf = async () => {
	const pdfBlob = await createCurrentNoticePdf();
	const fileName = `${state.noticeNumber}.pdf`;
	try {
		return await uploadPdfToGasHost(pdfBlob, fileName);
	} catch {
		return uploadPdfToLocalHost(pdfBlob, fileName);
	}
};

const openPrinterProtocol = (fileUrl: string) => {
	const protocolUrl = `openlabel://com.jancsinn.label/pdf?file=${encodeURIComponent(fileUrl)}`;
	window.location.href = protocolUrl;
};

const openPreview = () => {
	if (!selectedOrders.value.length) {
		showToast({ message: '请选择需要打印的工单', icon: '' });
		return;
	}
	previewVisible.value = true;
};

const confirmPrint = async () => {
	if (state.isUploading) return;
	const ordersToPrint = [...selectedOrders.value];
	const printedIdSet = new Set(ordersToPrint.map((item) => item.workOrderId));
	state.isUploading = true;
	try {
		const fileUrl = await uploadPdf();
		if (task.value?.taskId) {
			const result = await bindTaskWorkOrders(
				task.value.taskId,
				ordersToPrint.map((item) => item.workOrderId),
				{
					printed: true,
					noticeNumber: state.noticeNumber,
					documentContent: documentContent.value,
					fileUrl,
				}
			);
			if (result?.length) mergeWorkOrders(result);
		}
		workOrders.value = workOrders.value.map((item) =>
			printedIdSet.has(item.workOrderId)
				? {
						...item,
						status: 'finished',
						statusName: '已完成',
						statusColor: '#18a058',
						statusRipple: false,
						printStatus: 'PRINTED',
						printed: true,
						documentContent: documentContent.value,
						noticeNumber: state.noticeNumber,
						fileUrl,
				  }
				: item
		);
		selectedIds.value = selectedIds.value.filter((id) => !printedIdSet.has(id));
		openPrinterProtocol(fileUrl);
		previewVisible.value = false;
	} catch (error: any) {
		showToast({ message: error?.message || 'PDF 上传失败', icon: '' });
	} finally {
		state.isUploading = false;
	}
};

onMounted(loadData);
onUnmounted(() => {
	if (pollTimer) window.clearInterval(pollTimer);
});
</script>

<style scoped lang="scss">
.work-order-address-list {
	--van-address-list-padding: 0;
	--van-address-list-item-padding: 12px;

	height: auto;
	padding-bottom: 0;
}

.work-order-address-list :deep(.van-address-item__title) {
	padding-right: 34px;
}

.work-order-address-list :deep(.van-address-item) {
	position: relative;
	animation: workOrderSlideIn 0.28s ease both;
}

.work-order-address-list :deep(.van-address-item__edit) {
	display: none;
}

.work-order-address-list :deep(.van-address-item--disabled .van-address-item__edit) {
	display: none;
}

.work-order-card-action {
	position: absolute;
	top: 50%;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border: 0;
	border-radius: 999px;
	background: #eaf3ff;
	color: #1677ff;
	font-size: 18px;
	transform: translateY(-50%);
}

.work-order-card-action.is-view {
	background: #edf8f1;
	color: #18a058;
}

.work-order-address-list :deep(.van-address-item__name) {
	align-items: flex-start;
	gap: 6px;
	font-size: 14px;
	font-weight: 800;
	line-height: 20px;
}

.work-order-address-list :deep(.van-address-item__address) {
	color: #637083;
	line-height: 19px;
}

.notice-doc {
	max-width: 720px;
	margin: 0 auto;
	padding: 10px 22px 26px;
	border-radius: 10px;
	background: #fff;
	box-shadow: 0 10px 26px rgb(28 75 145 / 8%);
	font-size: 15.5px;
	line-height: 1.6;
	word-break: break-word;
}

.notice-doc p {
	margin: 0;
}

.notice-title {
	text-align: center;
	font-size: 21px;
	font-weight: 700;
	line-height: 1.5;
}

.notice-number {
	font-size: 13px;
	line-height: 1.6;
	text-align: right;
}

.notice-paragraph {
	line-height: 1.6;
	text-indent: 2em;
	white-space: pre-wrap;
}

.notice-right {
	line-height: 1.6;
	text-align: right;
}

@keyframes workOrderSlideIn {
	from {
		opacity: 0;
		transform: translateX(28px);
	}

	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@media print {
	@page {
		size: A4;
		margin: 18mm;
	}

	.notice-doc {
		max-width: none;
		padding: 0;
		box-shadow: none;
	}
}
</style>

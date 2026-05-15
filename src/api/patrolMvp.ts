import request from '/@/utils/request';

type ApiResult<T> = {
	code: number;
	message: string;
	data: T;
};

type PageResult<T> = {
	list: T[];
	count: number;
};

export type PatrolTask = {
	taskId: number;
	taskNo: string;
	title: string;
	typeName: string;
	assigneeName: string;
	pointCount: number;
	startTime: string;
	endTime: string;
	status: string;
	statusName: string;
	statusColor: string;
	progress: number;
	currentPoint?: PatrolPoint;
	points: PatrolPoint[];
	workOrderId?: number;
	documentId?: number;
	flowRecords?: FlowRecord[];
	closureSummary?: ClosureSummary;
};

export type PatrolPoint = {
	pointRecordId: number;
	pointId: number;
	pointName: string;
	address: string;
	longitude: number;
	latitude: number;
	status: string;
	statusName: string;
	statusColor: string;
	preCheckInfo: Record<string, any>;
};

export type AiDetection = {
	detectionId: number;
	detectionNo: string;
	eventType: string;
	eventTypeName: string;
	riskLevel: string;
	riskLevelName: string;
	riskColor: string;
	confidence: number;
	description: string;
	suggestion: string;
	detectedAt: string;
	imageUrl: string;
	markedImageUrl: string;
};

export type Evidence = {
	evidenceId: number;
	evidenceNo: string;
	fileType: string;
	fileName: string;
	fileUrl: string;
	capturedBy: string;
	capturedAt: string;
};

export type WorkOrder = {
	workOrderId: number;
	workOrderNo: string;
	title: string;
	eventTypeName: string;
	riskLevelName: string;
	riskColor: string;
	reporterName: string;
	reportTime: string;
	locationName: string;
	addressDetail: string;
	status: string;
	statusName: string;
	statusColor: string;
	pushStatus: string;
	pushStatusName: string;
	pushStatusColor: string;
	thirdOrderNo?: string;
	description: string;
	suggestion: string;
	evidenceList: Array<{ fileType: string; fileName: string; fileUrl: string }>;
	documentId?: number;
};

export type LawDocument = {
	documentId: number;
	documentNo: string;
	documentTitle: string;
	documentTypeName: string;
	targetName: string;
	checkedUnit: string;
	checkLocation: string;
	illegalFact: string;
	legalBasis: string;
	rectificationRequirement: string;
	deadline: string;
	reviewRequirement: string;
	patrolUserName: string;
	status: string;
	statusName: string;
	statusColor: string;
	content: string;
	qrCode: string;
	generatedAt: string;
	printedAt: string;
};

export type FlowRecord = {
	flowId: number;
	action: string;
	fromStatus?: string;
	toStatus?: string;
	operatorName: string;
	remark: string;
	createdAt: string;
};

export type ClosureSummary = {
	taskId: number;
	taskNo: string;
	title: string;
	pointCount: number;
	riskCount: number;
	workOrderCount: number;
	pushSuccessCount: number;
	documentPrintedCount: number;
	timeline: Array<{ time: string; title: string; remark?: string }>;
	summaryText: string;
};

const unwrap = async <T>(promise: Promise<ApiResult<T>>) => {
	const res = await promise;
	return res.data;
};

export function ensureDemo() {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/ensure-demo'));
}

export function resetDemo() {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/reset-demo'));
}

export function getMyTasks(params: Record<string, any> = {}) {
	return unwrap<PageResult<PatrolTask>>(request.post('/patrol-mvp/h5/tasks', { limit: 50, ...params }));
}

export function getTaskDetail(taskId: number) {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/task/detail', { taskId }));
}

export function receiveTask(taskId: number) {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/task/receive', { taskId }));
}

export function startGoing(taskId: number, pointRecordId?: number) {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/task/start-going', { taskId, pointRecordId }));
}

export function arrivePoint(taskId: number, pointRecordId?: number) {
	return unwrap<{ task: PatrolTask; point: PatrolPoint }>(request.post('/patrol-mvp/task/arrive', { taskId, pointRecordId }));
}

export function startInspection(taskId: number, pointRecordId?: number) {
	return unwrap<PatrolTask>(request.post('/patrol-mvp/task/start-inspection', { taskId, pointRecordId }));
}

export function mockDetect(taskId: number, pointRecordId?: number) {
	return unwrap<AiDetection>(request.post('/patrol-mvp/ai/mock-detect', { taskId, pointRecordId, scene: 'FIRE_PASSAGE_BLOCKED' }));
}

export function captureEvidence(taskId: number, pointRecordId: number | undefined, detectionId: number) {
	return unwrap<Evidence>(request.post('/patrol-mvp/evidence/capture', { taskId, pointRecordId, detectionId }));
}

export function generateWorkOrderDraft(params: { taskId: number; pointRecordId?: number; detectionId: number; evidenceId: number }) {
	return unwrap<WorkOrder>(request.post('/patrol-mvp/work-order/generate-draft', params));
}

export function updateWorkOrder(data: Pick<WorkOrder, 'workOrderId' | 'title' | 'addressDetail' | 'description'>) {
	return unwrap<WorkOrder>(request.post('/patrol-mvp/work-order/update', data));
}

export function submitWorkOrder(workOrderId: number) {
	return unwrap<WorkOrder>(request.post('/patrol-mvp/work-order/submit', { workOrderId }));
}

export function getWorkOrderDetail(workOrderId: number) {
	return unwrap<{ workOrder: WorkOrder; aiDetection?: AiDetection; document?: LawDocument; flowRecords: FlowRecord[] }>(
		request.post('/patrol-mvp/work-order/detail', { workOrderId })
	);
}

export function getDocumentDetail(data: { documentId?: number; workOrderId?: number }) {
	return unwrap<LawDocument>(request.post('/patrol-mvp/document/detail', data));
}

export function mockPrintDocument(documentId: number) {
	return unwrap<{ document: LawDocument }>(request.post('/patrol-mvp/document/mock-print', { documentId }));
}

export function closeTask(taskId: number) {
	return unwrap<ClosureSummary>(request.post('/patrol-mvp/task/close', { taskId }));
}

export function getClosureSummary(taskId: number) {
	return unwrap<ClosureSummary>(request.post('/patrol-mvp/task/closure-summary', { taskId }));
}

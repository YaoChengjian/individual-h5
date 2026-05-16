import request from '/@/utils/request';

type ApiResult<T> = {
	code: number;
	message: string;
	data: T;
};

export type PageResult<T> = {
	list: T[];
	count: number;
};

export type DictionaryData = {
	dictDataId?: number;
	dictId?: number;
	dictCode?: string;
	dictDataCode: string;
	dictDataName: string;
	color?: string;
	ripple?: number;
	sortNumber?: number;
	comments?: string;
};

export type PatrolPoint = {
	pointId: number;
	areaId?: number;
	areaName?: string;
	pointCode?: string;
	pointName: string;
	pointType?: string;
	lat: number;
	lng: number;
	address?: string;
};

export type PatrolWorkOrder = {
	workOrderId: number;
	workOrderCode: string;
	title: string;
	taskId?: number;
	eventTypeName: string;
	riskLevelName: string;
	riskColor: string;
	status: string;
	statusName: string;
	statusColor: string;
	statusRipple?: boolean;
	printStatus?: string;
	printed?: boolean;
	reporterName: string;
	locationName: string;
	addressDetail: string;
	description: string;
	suggestion?: string;
	reportTime: string;
	documentContent?: string;
	noticeNumber?: string;
	fileUrl?: string;
	imageBase64?: string;
	imageUrl?: string;
	base64?: string;
	evidenceList?: Array<Record<string, any>>;
	selected?: boolean;
};

export type PatrolTask = {
	taskId: number;
	taskCode: string;
	taskNo: string;
	taskTitle: string;
	title: string;
	taskType: string;
	type: string;
	typeName: string;
	taskTypeName?: string;
	priority?: string;
	priorityName?: string;
	description?: string;
	aiFocus?: boolean;
	patrolLocation: string;
	planTime: string;
	startTime: string;
	endTime: string;
	durationHours?: number;
	repeatRule?: string;
	repeatRuleName?: string;
	executorId?: number;
	executorName?: string;
	assigneeName?: string;
	status: string;
	taskStatus: string;
	statusName: string;
	taskStatusName: string;
	statusColor: string;
	statusRipple?: boolean;
	progress: number;
	exceptionCount: number;
	pointCount: number;
	workOrderCount: number;
	createTime: string;
	points?: PatrolPoint[];
	currentPoint?: PatrolPoint;
	workOrders?: PatrolWorkOrder[];
	route?: Array<{ lat: number; lng: number; name?: string }>;
};

export type H5User = {
	userId: number;
	username: string;
	nickname: string;
	avatar?: string;
	phone?: string;
};

export type LoginResult = {
	accessToken: string;
	user: H5User;
};

const unwrap = async <T>(promise: Promise<ApiResult<T>>) => {
	const res = await promise;
	return res.data;
};

export function h5Login(data: { username: string; password: string }) {
	return unwrap<LoginResult>(request.post('/h5/login', data));
}

export function listDictionaryData(dictCode: string) {
	return unwrap<DictionaryData[]>(request.post('/h5/dictionary/list', { dictCode }));
}

export function getMyTasks(params: Record<string, any> = {}) {
	return unwrap<PageResult<PatrolTask>>(request.post('/h5/task/page', { page: 1, limit: 50, ...params }));
}

export function getTaskDetail(taskId: number) {
	return unwrap<PatrolTask>(request.post('/h5/task/detail', { taskId }));
}

export function startTask(taskId: number) {
	return unwrap<PatrolTask>(request.post('/h5/task/start', { taskId }));
}

export function finishTask(taskId: number) {
	return unwrap<PatrolTask>(request.post('/h5/task/finish', { taskId }));
}

export function getTaskWorkOrders(taskId: number) {
	return unwrap<PatrolWorkOrder[]>(request.post('/h5/task/work-orders', { taskId }));
}

export function updateTaskWorkOrder(data: { taskId: number; workOrderId: number; title: string; description: string }) {
	return unwrap<PatrolWorkOrder>(request.post('/h5/task/work-orders/update', data));
}

export function bindTaskWorkOrders(
	taskId: number,
	workOrderIds: number[],
	options: {
		printed?: boolean;
		noticeNumber?: string;
		documentContent?: string;
		fileUrl?: string;
	} = {}
) {
	return unwrap<PatrolWorkOrder[]>(request.post('/h5/task/work-orders/bind', { taskId, workOrderIds, ...options }));
}

export function uploadH5PrintFile(file: Blob, fileName: string) {
	const formData = new FormData();
	formData.append('file', file, fileName);
	return unwrap<Record<string, any>>(request.post('/h5/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
}

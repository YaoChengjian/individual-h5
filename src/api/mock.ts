import request from "/@/utils/request";

export function getListApi(params?: EmptyObjectType): Promise<HttpResultType> {
	return request.get("/mock/example/get", { params });
}

export function postListApi(data?: EmptyObjectType): Promise<HttpResultType> {
	return request.post("/mock/example/post", data);
}

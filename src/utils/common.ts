import { whoami } from "./validate";

// 格式化错误信息
export function formatErrMsg(err: any) {
	return whoami(err) === "String" ? err : JSON.stringify(err);
}

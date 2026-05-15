/**
 * 传入参数类型   ->  返回值
 * 0						  ->  "Number"
 * ""						  ->  "String"
 * []             ->  "Array"
 * {}             ->  "Object"
 * function(){}   ->  "Function"
 * null           ->  "Null"
 * undefined      ->  "Undefined"
 * true / false   ->  "Boolean"
 * new Date()     ->  "Date"
 * new Error()    ->  "Error"
 * new RegExp()   ->  "RegExp"
 * @param {any} val
 */
export function whoami(val: any) {
	return Object.prototype.toString.call(val).slice(8, -1);
}

/**
 * @param {string} path
 */
export function isExternal(path: string) {
	return /^(https?:|mailto:|tel:)/.test(path);
}

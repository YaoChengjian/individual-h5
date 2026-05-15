// 申明外部 npm 无类型声明的模块
// declare module "mockjs";
declare module "qs";

// 声明一个模块，防止引入文件时报错
// declare module "*.json";
// declare module "*.png";
// declare module "*.jpg";
// declare module "*.scss";
// declare module "*.ts";
// declare module "*.js";

// 声明文件，*.vue 后缀的文件交给 vue 模块来处理
declare module "*.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

// 声明文件，定义全局变量
declare interface Window {
	WebControl: any;
	TMap: any;
}

// 声明 ref
declare type RefType<T = any> = T | null;

// 声明 HTMLElement
declare type HtmlType = HTMLElement | string | undefined | null;

// 声明 children 可选
declare type ChilType<T = any> = {
	children?: T[];
};

// 声明 数组
declare type EmptyArrayType<T = any> = T[];

// 声明 对象
declare type EmptyObjectType<T = any> = {
	[key: string]: T;
};

// 声明 选项
declare type SelectOptionType = {
	value: string | number;
	label: string | number;
	children?: SelectOptionType[];
};

// 声明 请求结果
declare type HttpResultType<T = any> = {
	code: number;
	data: T;
	message: string | EmptyObjectType;
};

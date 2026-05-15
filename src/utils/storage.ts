import CryptoJS from "crypto-js";
import { showDialog } from "vant";
import { debounce } from "lodash-es";

// 是否加密浏览器的 LocalStorage 缓存数据
const isCrypto = JSON.parse(import.meta.env.VITE_LOCAL_CRYPTO) as boolean;
// 十六位十六进制数作为密钥
const SECRET_KEY = CryptoJS.enc.Utf8.parse("49smv9ac0vendef9");
// 十六位十六进制数作为密钥偏移量
const SECRET_IV = CryptoJS.enc.Utf8.parse("2ma7v0cuda7yr8ed");

/**
 * 加密方法
 * @param data 被加密的数据
 * @returns 加密后的密文
 */
const encrypt = (data: any): string => {
	const dataHex = CryptoJS.enc.Utf8.parse(data);
	const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
		iv: SECRET_IV,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	return encrypted.ciphertext.toString();
};

/**
 * 解密方法
 * @param ciphertext 原始密文
 * @returns 解除加密的数据
 */
const decrypt = (ciphertext: string): string => {
	const encryptedHexStr = CryptoJS.enc.Hex.parse(ciphertext);
	const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	const decrypted = CryptoJS.AES.decrypt(str, SECRET_KEY, {
		iv: SECRET_IV,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
	return decryptedStr.toString();
};

/**
 * 生成以【项目名:key】为格式的新key，解决同一域名下，不同项目的 localStorage 变量冲突问题
 * @param key
 */
const createKey = (key: string) => {
	// @ts-ignore
	return `${__PROJ_NAME__}:${key}`;
};

/**
 * 校验报错信息提示 + 自动重新登陆（已防抖）
 * @param msg
 */
const handleCheckError = debounce((msg: string) => {
	Local.clear();
	Session.clear();
	showDialog({
		title: "系统提示",
		message: msg,
		messageAlign: "left",
	}).then(() => window.location.reload());
}, 200);

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method has 是否存在永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key: string, val: any) {
		const storageVal = isCrypto ? encrypt(JSON.stringify(val)) : JSON.stringify(val);
		window.localStorage.setItem(createKey(key), storageVal);
	},
	// 获取永久缓存
	get(key: string) {
		const storageVal = window.localStorage.getItem(createKey(key));
		if (storageVal) {
			try {
				return JSON.parse(isCrypto ? decrypt(storageVal) : storageVal);
			} catch (e) {
				handleCheckError("缓存数据正确性校验失败，请重新登录！");
			}
		} else {
			return null;
		}
	},
	// 是否存在永久缓存
	has(key: string) {
		return window.localStorage.getItem(createKey(key)) !== null;
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(createKey(key));
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method has 是否存在临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
	// 设置临时缓存
	set(key: string, val: any) {
		window.sessionStorage.setItem(createKey(key), JSON.stringify(val));
	},
	// 获取临时缓存
	get(key: string) {
		const storageVal = window.sessionStorage.getItem(createKey(key));
		if (storageVal) {
			return JSON.parse(storageVal);
		} else {
			return null;
		}
	},
	// 是否存在临时缓存
	has(key: string) {
		return window.sessionStorage.getItem(createKey(key)) !== null;
	},
	// 移除临时缓存
	remove(key: string) {
		window.sessionStorage.removeItem(createKey(key));
	},
	// 移除全部临时缓存
	clear() {
		window.sessionStorage.clear();
	},
};

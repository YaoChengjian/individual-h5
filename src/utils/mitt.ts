import mitt from 'mitt';
import type { Emitter } from 'mitt';

// 类型
const emitter: Emitter<MittEventType> = mitt<MittEventType>();

// 导出
export default emitter;

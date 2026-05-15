import { defineStore } from 'pinia';
import { store } from '/@/stores';

export const useCachedScrollTopStore = defineStore({
	id: 'cached-scroll-top',
	state: () => ({
		cachedInfo: {} as { [key: string]: number },
	}),
	actions: {
		setScrollTop(name: string, scrollTop: number) {
			this.cachedInfo[name] = scrollTop;
		},
		getScrollTop(name: string) {
			return this.cachedInfo[name] || 0;
		},
		clearScrollTop(name: string) {
			this.cachedInfo[name] = 0;
		},
	},
});

export function useCachedScrollTopStoreHook() {
	return useCachedScrollTopStore(store);
}

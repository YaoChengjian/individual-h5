import { useDarkModeStoreHook } from '/@/stores/modules/darkMode';

export function useDarkMode() {
	return useDarkModeStoreHook().darkMode;
}

export function useToggleDarkMode() {
	useDarkModeStoreHook().toggleDarkMode();
}

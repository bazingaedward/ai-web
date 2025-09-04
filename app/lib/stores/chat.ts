import { map } from "nanostores";

export type ChatStoreState = {
	started: boolean;
	aborted: boolean;
	showChat: boolean;
	input: string;
};

export const $chatStore = map<ChatStoreState>({
	started: false,
	aborted: false,
	showChat: true,
	input: "",
});

/**
 * 更新 chatStore 的字段（支持单字段和多字段）
 * @param updates 可以是 { key, value } 或 { key1: value1, key2: value2 }
 */
export function updateChatStore(data: Partial<ChatStoreState> = {}): void {
	$chatStore.set({ ...$chatStore.get(), ...data });
}

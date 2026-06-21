import type { ITEMS } from "../data/items";

export type ItemId = keyof typeof ITEMS;
export type ItemInfo = {
	name: string;
	description: string;
	price: number;
	totalStock?: number;
};

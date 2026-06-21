import type { ItemInfo } from "../types/item";

const SOLO_CUP: ItemInfo = {
	name: "Solo cup",
	description: "Red, cheap and trustworthy.\nConvenient for sharing potions with customers",
	price: 2
};
const CONICAL_FLASK: ItemInfo = {
	name: "Conial flask",
	description: "Great for mixing things",
	price: 50,
	totalStock: 1
};
export const ITEMS = {
	SOLO_CUP,
	CONICAL_FLASK
} as const;


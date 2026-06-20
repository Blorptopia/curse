import type { IngredientInfo } from "../types/ingredient";

const BLUE_PILL: IngredientInfo = {
	name: "Blue pill",
	description: "Oh no not again",
	effects: {},
	price: 50
};
const RED_PILL: IngredientInfo = {
	name: "Red pill",
	description: "Mmm tasty",
	effects: {},
	price: 80
};
export const INGREDIENTS = {
	BLUE_PILL,
	RED_PILL
} as const;


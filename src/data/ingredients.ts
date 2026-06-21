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
	effects: {
		explodesWhenMixedWith: ["RED_PILL", "BLUE_PILL"]
	},
	price: 80
};
const BURGER: IngredientInfo = {
	name: "Burger",
	description: "One who burgs",
	effects: {
	},
	price: 10
};
export const INGREDIENTS = {
	BLUE_PILL,
	RED_PILL,
	BURGER
} as const;


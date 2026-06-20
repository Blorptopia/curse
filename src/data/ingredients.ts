import type { IngredientInfo } from "../types/ingredient";

const BLUE_PILL_INGREDIENT: IngredientInfo = {
	name: "Blue pill",
	description: "",
	effects: {}
};
export const INGREDIENTS = {
	BLUE_PILL: BLUE_PILL_INGREDIENT
} as const;


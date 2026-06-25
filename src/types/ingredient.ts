import type { ColorInstance } from "color";
import type { INGREDIENTS } from "../data/ingredients";
export type IngredientId = keyof typeof INGREDIENTS;
export type IngredientInfo = {
	name: string;
	description: string;
	effects: IngredientEffects;
	price: number;
	color: ColorInstance;
};

type IngredientEffects = {
	explodesWhenMixedWith?: IngredientId[];
};

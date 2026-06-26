import type { IngredientId } from "./ingredient";

export type IngredientInstance = {
	ingredientId: IngredientId;
	mixedFraction: number;
	heatedFraction: number;
	poisonFraction: number;
	totalRotation: number;
	spinsFromStart: number;
};

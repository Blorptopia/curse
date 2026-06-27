import type { IngredientId } from "./ingredient";

export type IngredientInstance = {
	ingredientId: IngredientId;
	heatedFraction: number;
	wronglyHeatedScore: number;
	poisonFraction: number;
	totalRotation: number;
	spinsFromStart: number;
};

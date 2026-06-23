import type { IngredientId } from "./ingredient";
import type { ItemId } from "./item";

export type PlaceItemData = {
	itemId: ItemId;
	sizePixels: number;
};
export type PlaceIngredientData = {
	ingredientId: IngredientId;
	sizePixels: number;
};

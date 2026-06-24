import type { IngredientId } from "./ingredient";
import type { ItemId } from "./item";

export type PlaceItemData = {
	itemId: ItemId;
	sizePixels: {
		height: number;
		width: number;
	}
};
export type PlaceIngredientData = {
	ingredientId: IngredientId;
	sizePixels: number;
};

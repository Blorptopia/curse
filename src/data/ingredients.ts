import Color from "color";
import type { IngredientInfo } from "../types/ingredient";

const BLUE_PILL: IngredientInfo = {
	name: "Blue pill",
	description: "Oh no not again",
	effects: {},
	price: 50,
	color: Color("#0000ff"),
};
const RED_PILL: IngredientInfo = {
	name: "Red pill",
	description: "Mmm tasty",
	effects: {
		cannotBeMixedWith: ["RED_PILL", "BLUE_PILL"]
	},
	price: 80,
	color: Color("#ff0000"),
};
const BURGER: IngredientInfo = {
	name: "Burger",
	description: "One who burgs",
	effects: {
		tempratureRange: {
			min: 5,
			max: 20
		}
	},
	price: 10,
	color: Color("#d2408e"),
};
export const INGREDIENTS = {
	BLUE_PILL,
	RED_PILL,
	BURGER
} as const;

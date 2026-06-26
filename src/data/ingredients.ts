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
	},
	price: 40,
	color: Color("#d2408e"),
};
const FLAT_BURGER: IngredientInfo = {
	name: "Burger (flat)",
	description: "Who sat on the burger :(",
	effects: {
	},
	price: 10,
	color: Color("#ae3ed1"),
};
const CRAB: IngredientInfo = {
	name: "Crab",
	description: "A fearless red tank",
	effects: {
		consumesIngredient: {
			ingredient: "BURGER",
			every: 5
		}
	},
	price: 50,
	color: Color("#ae3ed1"),
};
const EGG: IngredientInfo = {
	name: "Egg",
	description: "Only the shell is kept in the potion",
	effects: {
		crash: {
			every: 10
		}
	},
	price: 5,
	color: Color("#ae3ed1"),
};
const CHICKEN: IngredientInfo = {
	name: "Chicken",
	description: "Well that's one way to end the debate",
	effects: {
		consumesIngredient: {
			ingredient: "EGG",
			every: 20
		}
	},
	price: 50,
	color: Color("#ae3ed1"),
};
export const INGREDIENTS = {
	BLUE_PILL,
	RED_PILL,
	BURGER,
	FLAT_BURGER,
	CRAB,
	CHICKEN,
	EGG
} as const;

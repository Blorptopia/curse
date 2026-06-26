import Color from "color";
import type { IngredientInfo } from "../types/ingredient";

const BURGER: IngredientInfo = {
	name: "Burger",
	description: "One who burgs",
	effects: {
		cannotBeMixedWith: ["FLAT_BURGER"]
	},
	price: 40,
	color: Color("#d2408e"),
};
const FLAT_BURGER: IngredientInfo = {
	name: "Burger (flat)",
	description: "Who sat on the burger :(",
	effects: {
		cannotBeMixedWith: ["BURGER"]
	},
	price: 10,
	color: Color("#ae3ed1"),
};
const CRAB: IngredientInfo = {
	name: "Crab",
	description: "A fearless red tank",
	effects: {
		consumesIngredient: {
			ingredientId: "BURGER",
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
			ingredientId: "EGG",
			every: 20
		}
	},
	price: 50,
	color: Color("#ae3ed1"),
};
const WORM: IngredientInfo = {
	name: "Worm",
	description: "Likes to dig. Very britle",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#fdadd4"),
};
const NIGHTSHADE: IngredientInfo = {
	name: "Nightshade",
	description: "Beautiful woman",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#524167"),
};
const MELOTONIN: IngredientInfo = {
	name: "MELOTONIN",
	description: "Eeepy pills",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#bfbac1"),
};
const LYTTA: IngredientInfo = {
	name: "Lytta Vesicatoria",
	description: "Some weird spanish fly",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#a5a881"),
};
const MANDRAKE: IngredientInfo = {
	name: "Mandrake",
	description: "Screaming baby plant",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#584f49"),
};
const UNICORN_HORN: IngredientInfo = {
	name: "Unicorn horn",
	description: "Kindly donated by a unicorn startup",
	effects: {
		tempratureRange: {
			max: 30
		}
	},
	price: 50,
	color: Color("#ece0ae"),
};
export const INGREDIENTS = {
	BURGER,
	FLAT_BURGER,
	CRAB,
	CHICKEN,
	EGG,
	WORM,
	NIGHTSHADE,
	MELOTONIN,
	LYTTA,
	MANDRAKE,
	UNICORN_HORN,
} as const;

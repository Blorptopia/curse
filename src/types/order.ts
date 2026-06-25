import type { CustomerId } from "./customer";
import type { IngredientId } from "./ingredient";

export type OrderId = string;
export type Order = {
	id: OrderId;
	name: string;
	description?: string[];
	customer: {
		id: CustomerId;
		pose?: string;
	};
	requiredIngredients: IngredientId[];
	/** How much the customer will pay for this */
	value: number;
};
export type OrderTemplate = Omit<Omit<Order, "value">, "id"> & {
	/** The base purchase price of the other
	 * This will be affected by
	 * 	- Your reputation with the customer
	 * 	- What day it is
	*/
	baseValue: number;
};

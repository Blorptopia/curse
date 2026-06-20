import { CUSTOMERS } from "../data/market";
import type { IngredientId } from "./ingredient";

export type CustomerId = keyof typeof CUSTOMERS;
export type CustomerVisualAttributes = {};
export type Customer = {
	name: string;
	visualAttributes: CustomerVisualAttributes;
};
export type OrderId = string;
export type Order = {
	id: OrderId;
	customerId: CustomerId;
	ingredientIds: IngredientId[];
	/** How much the customer will pay for this */
	value: number;
};

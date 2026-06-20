import { CUSTOMERS } from "../data/market";

export type CustomerId = keyof typeof CUSTOMERS;
export type CustomerVisualAttributes = {};
export type Customer = {
	name: string;
	visualAttributes: CustomerVisualAttributes;
};
export type OrderId = string;
export type Order = {
	id: OrderId;
	name: string;
	description: string;
	customerId: CustomerId;
	targetColor: string;
	/** How much the customer will pay for this */
	value: number;
};


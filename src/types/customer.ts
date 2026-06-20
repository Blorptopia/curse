import { CUSTOMERS } from "../data/customers";

export type CustomerId = keyof typeof CUSTOMERS;
export type CustomerVisualAttributes = {};
export type Customer = {
	name: string;
	visualAttributes: CustomerVisualAttributes;
};

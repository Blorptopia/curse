import { MAX_ORDERS_PER_DAY } from "./config";
import type { CustomerId } from "./types/customer";
import type { Order, OrderTemplate } from "./types/order";

const RANDOM_VALUE_VARIATION: number = 0.1;

export class GameLogic {
	private orders: Order[];
	private dayIndex: number;
	private deadCustomerIds: CustomerId[];
	public constructor() {
		this.dayIndex = 0;
		this.orders = this.createOrders();
		this.deadCustomerIds = [];
	}
	private createOrderTemplates(): OrderTemplate[] {
		const JACK_INTERACTIONS: OrderTemplate[] = [
			{
				name: "Genius potion",
				description: "My wife keeps winning at trivia and maths, please make me a genius potion.",
				customerId: "JACK",
				targetColor: "#00FF00",
				baseValue: 1
			},
			{
				name: "Stupid potion",
				description: "I never lose to my wife anymore, but somehow, i learned to speak dog. All my dog does is argue politics with me now. Please make me a stupid potion.",
				customerId: "JACK",
				targetColor: "#00FFFF",
				baseValue: 1
			},
			{
				name: "Antidepressant potion",
				description: "Now that i'm stupid, both my dog and wife keep beating me at everything.\nI still speak dog.\nPlease make me an anti-depression potion.",
				customerId: "JACK",
				targetColor: "#00FFFF",
				baseValue: 1
			},

		];
		const templates: OrderTemplate[] = [];
		if (this.dayIndex === 0) {
			templates.push(JACK_INTERACTIONS[0]);
		}
		if (this.dayIndex === 1) {
			templates.push(JACK_INTERACTIONS[1]);
		}
		if (this.dayIndex === 2) {
			templates.push(JACK_INTERACTIONS[2]);
		}

		const RANDOM_ORDER_TEMPLATES: OrderTemplate[] = [
			{
				name: "Armor potion",
				customerId: "JACK",
				targetColor: "#00FFFF",
				baseValue: 1
			},
			{
				name: "Upside-down potion",
				customerId: "JACK",
				targetColor: "#00FFFF",
				baseValue: 1
			},
		];
		
		const desiredRandomOrderCount = MAX_ORDERS_PER_DAY - templates.length;
		for (let i = 0; i < desiredRandomOrderCount; i++) {
			const template = RANDOM_ORDER_TEMPLATES[Math.floor(Math.random() * RANDOM_ORDER_TEMPLATES.length)]!;
			templates.push(template);
		}
		return templates;
	}
	private createOrders(): Order[] {
		const templates = this.createOrderTemplates();
		const templatesWithoutDeadCustomers = templates.filter(template => !this.deadCustomerIds.includes(template.customerId));

		const orders = templatesWithoutDeadCustomers.map(template => {
			const valueRandomMultiplier = 1 + (Math.random() * RANDOM_VALUE_VARIATION) - (RANDOM_VALUE_VARIATION / 2);
			const valueReputationMultipier = 1; // TODO: Change
			const valueDayMultiplier = this.getDayValueMultiplier();
			const value = Math.floor(template.baseValue * valueRandomMultiplier * valueReputationMultipier * valueDayMultiplier);
			const order = {
				id: crypto.randomUUID(),
				name: template.name,
				description: template.description,
				customerId: template.customerId,
				targetColor: template.targetColor,
				value
			} satisfies Order;
			return order;
		});
		return orders;
	}
	private getDayValueMultiplier(): number {
		if (this.dayIndex === 0) {
			return 50;
		}
		if (this.dayIndex === 1) {
			return 100;
		}
		if (this.dayIndex === 2) {
			return 100;
		}
		const baseValue = 150;
		return baseValue - (this.dayIndex * 10);
	}
	private getLoanSharkPayment(): number {
		if (this.dayIndex === 0) {
			return 50;
		}
		if (this.dayIndex === 1) {
			return 150;
		}
		if (this.dayIndex === 2) {
			return 250;
		}
		if (this.dayIndex === 3) {
			return 350;
		}
		return 550;
	}
}

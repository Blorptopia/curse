import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "./orders";
import "./mixing_screen";
import { INGREDIENTS } from "../data/ingredients";
import type { Order, OrderTemplate } from "../types/order";
import type { CustomerId } from "../types/customer";
import { MAX_ORDERS_PER_DAY } from "../config";

const RANDOM_VALUE_VARIATION: number = 0.1;

@customElement("curse-game")
export class GameElement extends LitElement {
	// State
	@state()
	private dayIndex: number;
	@state()
	private pendingOrders: Order[];
	@state()
	private activeOrder?: Order;
	@state()
	private deadCustomerIds: CustomerId[];

	// Elements
	@query(`[data-screen="orders"]`)
	private ordersScreenElement?: HTMLElement;
	@query(`[data-screen="mixing"]`)
	private mixingScreenElement?: HTMLElement;

	public constructor() {
		super();

		this.dayIndex = 0;
		this.deadCustomerIds = [];
		this.pendingOrders = this.createOrders();
	}

	protected render(): HTMLTemplateResult {
		const ingredientIds = Object.keys(INGREDIENTS);
	   	return html`
			<div id="screens">
				<div class="screen-container" data-screen="orders">
					<button id="go-to-mixing-screen" class="navigation-button" @click=${() => this.gotoScreen("mixing")}>&gt;</button>
					<curse-orders
						.orders=${this.pendingOrders}
						.hasActiveOrder=${this.activeOrder !== undefined}
					></curse-orders>
				</div>
				<div class="screen-container" data-screen="mixing">
					<button id="go-to-orders" class="navigation-button" @click=${() => this.gotoScreen("orders")}>&lt;</button>
					<curse-mixing-screen
						.unlockedIngredientIds=${ingredientIds}
					></curse-mixing-screen>
				</div>
			</div>
		`; 
	}

	private gotoScreen(screen: Screen): void {
		console.log(`navigating to ${screen}`);
		if (screen === "mixing") {
			if (this.mixingScreenElement === undefined) {
				throw new Error("cannot navigate - element not defined");
			}
			this.mixingScreenElement.scrollIntoView({behavior: "smooth"});
		}
		if (screen === "orders") {
			if (this.ordersScreenElement === undefined) {
				throw new Error("cannot navigate - element not defined");
			}
			this.ordersScreenElement.scrollIntoView({behavior: "smooth"});
		}
		
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
		if (this.dayIndex === 0) {
			return [
					JACK_INTERACTIONS[0],
			];
		}
		if (this.dayIndex === 1) {
			return [
					JACK_INTERACTIONS[1],
			];
		}
		if (this.dayIndex === 2) {
			return [
					JACK_INTERACTIONS[1],
			];
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
		
		const templates: OrderTemplate[] = [];
		for (let i = 0; i < MAX_ORDERS_PER_DAY; i++) {
			const template = RANDOM_ORDER_TEMPLATES[Math.random() * RANDOM_ORDER_TEMPLATES.length]!;
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

	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		#screens {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			width: 200%;
			height: 100%;
		}
		.screen-container {
			display: block;
			position: relative;
			width: 100%;
		}
		curse-store {
			grid-area: store;
		}
		curse-orders {
			grid-area: orders;
		}
		.navigation-button {
			position: absolute;
			top: 0.1rem;

			font-size: 2rem;
		}
		#go-to-orders-screen {
			left: 0.1rem;
		}
		#go-to-mixing-screen {
			right: 0.1rem;
		}
	`;
}

type Screen = "mixing" | "orders";

import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./customer_portrait";
import "./hot_plate";
import "./cup";
import "./ingredient_icon";
import "./customer_shadow";
import "./flask";
import "./physics_world";
import { map } from "lit/directives/map.js";
import type { Order, OrderTemplate } from "../types/order";
import { MAX_ORDERS_PER_DAY } from "../config";
import type { CustomerId } from "../types/customer";
import { styleMap } from "lit/directives/style-map.js";
import { CUSTOMER_ID_TO_NAME } from "../data/customer";
import { INGREDIENTS } from "../data/ingredients";
import type { IngredientId } from "../types/ingredient";
import type { ItemId } from "../types/item";
import { ITEMS } from "../data/items";

const RANDOM_VALUE_VARIATION: number = 0.1;

@customElement("curse-game")
export class GameElement extends LitElement {
	@state()
	private dayIndex: number;
	@state()
	private orders: Order[];
	@state()
	private deadCustomerIds: CustomerId[];
	@state()
	private dialogIndex: number;
	@state()
	private productPurchaseCount: Partial<Record<ItemId | IngredientId, number>>;

	public constructor() {
		super();

		this.dayIndex = 0;
		this.deadCustomerIds = [];
		this.orders = this.createOrders();
		this.dialogIndex = 0;
		this.productPurchaseCount = {};
	}

	protected render(): HTMLTemplateResult {
		return html`
			<curse-physics-world>
				<div id="left-window" class="window"></div>
				<div id="right-window" class="window"></div>

				${this.orders.length === 0 ? this.renderCustomer(this.dayIndex === 0 ? "LOANS_HARK_PRE_EXPLOSION" : "LOANS_HARK", 0) : null}
				${map(this.orders, (order, index) => this.renderCustomer(order.customerId, index))}
				${this.renderDialog()}
				<div id="hot-plate-container">
					<curse-hot-plate></curse-hot-plate>
				</div>
			</curse-physics-world>
			<section id="shelf">
				<div id="items-row" class="shelf-row">
					${map(Object.keys(ITEMS) as ItemId[], itemId => this.renderItemListing(itemId))}
				</div>
				<div id="ingredients-row" class="shelf-row">
					${map(Object.keys(INGREDIENTS) as IngredientId[], ingredientId => this.renderIngredientListing(ingredientId))}
				</div>
			</section>
		`
	}
	private renderIngredientListing(ingredientId: IngredientId): HTMLTemplateResult {
		const ingredient = INGREDIENTS[ingredientId];

		const factFragments: HTMLTemplateResult[] = [];

		factFragments.push(html`
			<dt>Price</dt>
			<dd class="price">${ingredient.price}$</dd>
	   	`);

		if (ingredient.effects.explodesWhenMixedWith !== undefined) {
			factFragments.push(html`
				<dt>Explodes when mixed with</dt>
				${ingredient.effects.explodesWhenMixedWith?.map(ingredientId => html`<dd>${INGREDIENTS[ingredientId].name}`)}
			`);
		}

		return html`
			<div
				class="listing"
				style=${styleMap({
					anchorName: `--listing-${ingredientId}`
				})}
			>
				<div
					class="listing-details"
					style=${styleMap({
						positionAnchor: `--listing-${ingredientId}`
					})}
				>
					<h1>${ingredient.name}</h1>
					<p>${ingredient.description}</p>
					<h2>Ingredient facts</h2>
					<dl>
						${factFragments}
					</dl>
				</div>
				<curse-ingredient-icon ingredientid=${ingredientId}></curse-ingredient-icon>
			</div>
		`

	}
	private renderItemListing(itemId: ItemId): HTMLTemplateResult {
		const item = ITEMS[itemId];

		let itemIconFragment: HTMLTemplateResult | undefined;

		if (itemId === "SOLO_CUP") {
			itemIconFragment = html`<curse-cup class="icon"></curse-cup>`;
		}
		if (itemId === "CONICAL_FLASK") {
			itemIconFragment = html`<curse-flask class="icon" disabled></curse-flask>`;
		}

		return html`
			<div
				class="listing"
				style=${styleMap({
					anchorName: `--listing-${itemId}`
				})}
			>
				<div
					class="listing-details"
					style=${styleMap({
						positionAnchor: `--listing-${itemId}`
					})}
				>
					<h1>${item.name}</h1>
					<p>${item.description}</p>
				</div>
				${itemIconFragment}
			</div>
		`

	}
	private renderCustomer(customerId: CustomerId, orderIndex: number): HTMLTemplateResult {
		if (orderIndex > 4) {
			return html``;
		}
		return html`
			<div
				class="customer-container"
				data-index=${orderIndex}
			>
				${orderIndex === 0 ? html`
					<curse-customer-portrait
						customerid=${customerId}
					></curse-customer-portrait>
				` : html`
					<curse-customer-shadow
						customerid=${customerId}
					></curse-customer-portrait>
				`}
			</div>
		`

	}
	private renderDialog(): HTMLTemplateResult {
		const activeOrder = this.orders[0];
		const canDecline = this.dayIndex !== 0;

		if (activeOrder !== undefined) {
			const dialogPages = activeOrder.description?.length ?? 0;
			const currentDialogPage = activeOrder.description?.[this.dialogIndex] ?? activeOrder.name;
			const hasMorePages = dialogPages > this.dialogIndex + 1;
			return html`
				<div id="dialog">
					<div id="dialog-heading">
						<h1>${CUSTOMER_ID_TO_NAME[activeOrder.customerId]}</h1>
						<div id="target-color" style=${styleMap({backgroundColor: activeOrder.targetColor})}></div>
					</div>
					<p>${currentDialogPage}</p>

					<div id="actions">
						${hasMorePages ? html`
							<button
								class="primary"
								type="button"
								@click=${() => {
									this.dialogIndex++;
								}}
							>Next</button>
						` : html`
							<button
								class="destructive"
								type="button"
								@click=${() => {
									this.orders = [
										...this.orders.slice(1)
									];
									this.dialogIndex = 0;
								}}
								?hidden=${!canDecline}
							>Reject</button>
						`}
					</div>
				</div>
			`
		}
		const payment = this.getLoanSharkPayment();
		if (this.dayIndex === 0) {
			return html`
				<div id="dialog">
					<div id="dialog-heading">
						<h1>${CUSTOMER_ID_TO_NAME["LOANS_HARK_PRE_EXPLOSION"]}</h1>
						<div id="target-color" style=${styleMap({backgroundColor: "#f00"})}></div>
					</div>
					<p>Dialoge here</p>
				</div>
			`
		}

		return html`
			<div id="dialog">
				<div id="dialog-heading">
					<h1>${CUSTOMER_ID_TO_NAME["LOANS_HARK_PRE_EXPLOSION"]}</h1>
					<div id="target-color" style=${styleMap({backgroundColor: "#f00"})}></div>
				</div>
				<p>I'm here for my daily payment of <span class="price">${payment}</span></p>
				<div id="actions">
					<button class="primary">Pay</button>
					<button class="destructive">Reject</button>
				</div>
			</div>
		`
	}
	private createOrderTemplates(): OrderTemplate[] {
		const JACK_INTERACTIONS: OrderTemplate[] = [
			{
				name: "Genius potion",
				description: ["My wife keeps winning at trivia and maths, please make me a genius potion."],
				customerId: "JACK",
				targetColor: "#00FF00",
				baseValue: 1
			},
			{
				name: "Stupid potion",
				description: ["I never lose to my wife anymore, but somehow, i learned to speak dog. All my dog does is argue politics with me now. Please make me a stupid potion."],
				customerId: "JACK",
				targetColor: "#00FFFF",
				baseValue: 1
			},
			{
				name: "Antidepressant potion",
				description: ["Now that i'm stupid, both my dog and wife keep beating me at everything.\nI still speak dog.\nPlease make me an anti-depression potion."],
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
	public static styles?: CSSResultGroup = css`
		#window-frame {
			border: 2rem solid #775079;

			height: 100%;
			box-sizing: border-box;
		}
		.window {
			position: absolute;
			z-index: -50;
			top: 0;
			background: #ffffff55;
			border-color: #ffffff99;
			height: 100%;
			width: 15%;
			border-width: .2rem;
		}
		#left-window {
			border-right-style: solid;
			left: 0;
		}
		#right-window {
			border-left-style: solid;
			right: 0;
		}
		#shelf {
			background: #775079;
			padding: 1rem;

			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
		.shelf-row {
			background: #a15d7b;
			padding: 1rem;
			width: 100%;
			box-sizing: border-box;

			display: flex;
			gap: 1rem;
		}
		.customer-container {
			position: absolute;
			overflow-y: hidden;
			z-index: -100;

			display: flex;
			justify-content: center;

			pointer-events: none;

			curse-customer-portrait {
				--size-multiplier: .35rem;
				anchor-name: --active-customer;
			}
			curse-customer-shadow {
				--size-multiplier: .25rem;
			}
		}
		.customer-container[data-index="0"] {
			z-index: -50;
			width: 100%;
			left: 0;
			bottom: 0;
		}
		.customer-container[data-index="1"] {
			left: 0;
			bottom: -7rem;
		}
		.customer-container[data-index="2"] {
			right: 0;
			bottom: -5rem;
			transform: rotateY(180deg);
		}
		.customer-container[data-index="3"] {
			left: 20rem;
			bottom: -5rem;
		}
		.customer-container[data-index="4"] {
			right: 20rem;
			bottom: -3rem;
		}
		#hot-plate-container {
			position: absolute;
			left: 0;
			bottom: 1rem;
			width: 100%;

			display: flex;
			justify-content: center;

			curse-hot-plate {
				--size-multiplier: .17rem;
			}
		}
		curse-cup {
			--size-multiplier: .14rem;
		}
		curse-ingredient-icon {
			--size-multiplier: 0.04rem;
		}
		@media (max-width: 900px) {
			#window-frame {
				border-top: none;
				border-left: none;
				border-right: none;
			}
			.window {
				display: none;
			}
			#space-saving-row {
				display: flex;
			}
		}
		@media (max-width: 1000px) {
			.customer-container[data-index="1"] {
				display: none;
			}
			.customer-container[data-index="2"] {
				display: none;
			}
		}
		@media (max-width: 1900px) {
			.customer-container[data-index="3"] {
				display: none;
			}
			.customer-container[data-index="4"] {
				display: none;
			}
		}
		#dialog {
			position: absolute;
			position-anchor: --active-customer;
			position-area: top right;

			padding: 1rem;
			background: white;
			color: black;
			border-radius: .75rem;

			#dialog-heading {
				display: flex;
				align-content: center;
				justify-content: space-between;
			}
			h1 {
				margin: 0;
				vertical-align: middle;
			}
			#target-color {
				--size: 1.75rem;
				height: var(--size);
				width: var(--size);
				border-radius: 50%;
			}
		}
		.listing-details {
			position: absolute;
			position-area: top center;

			width: max-content;

			background: white;
			color: black;
			padding: 1rem;
			border-radius: 1rem;
		}
		.listing:not(:hover) > .listing-details {
			display: none;
		}
		.price {
			color: green;
		}
		dt {
			font-weight: bold;
		}
	`;
}

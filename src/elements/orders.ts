import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Order } from "../types/order";
import "./order";
import OrdersBackgroundURL from "../assets/orders_background.jpg";
import { styleMap } from "lit/directives/style-map.js";
import { repeat } from "lit/directives/repeat.js";

const MAX_PENDING_ORDERS = 7;

@customElement("curse-orders")
export class OrdersElement extends LitElement {
	@property({type: Array})
	public orders: Order[];
	@property({type: Boolean})
	public hasActiveOrder: boolean;

	public constructor() {
		super();
		this.orders = [];
		this.hasActiveOrder = false;
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<div id="orders" style=${styleMap({backgroundImage: `url("${OrdersBackgroundURL}")`, "--max-pending-orders": MAX_PENDING_ORDERS})}>
				${repeat(this.orders, order => order, (order, index) => this.renderOrder(order, index))}
			</div>
		`;
	}
	private renderOrder(order: Order, orderIndex: number): HTMLTemplateResult | null {
		if (orderIndex > MAX_PENDING_ORDERS) {
			return null;
		}
		return html`
			<curse-order
				.order=${order}
				.canAccept=${!this.hasActiveOrder}
				.showDetails=${orderIndex === 0}
				style=${styleMap({
					gridColumn: MAX_PENDING_ORDERS - orderIndex,
					gridRow: 1
				})}
			></curse-order>
		`;
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: contents;
		}
		#orders {
			display: grid;
			grid-template-columns: repeat(var(--max-pending-orders), 1fr);
			grid-template-rows: 1fr;
			justify-content: flex-end;
			width: 100%;
			height: 100%;
			padding: 5rem;
			box-sizing: border-box;
			gap: 1rem;
		}
		#content {
			background-size: cover;
			background-repeat: cover;
		}
	`;
}

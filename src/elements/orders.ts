import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Order } from "../types/market";
import "./order";
import OrdersBackgroundURL from "../assets/orders_background.jpg";
import { styleMap } from "lit/directives/style-map.js";
import { repeat } from "lit/directives/repeat.js";

const MAX_PENDING_ORDERS = 7;

@customElement("curse-orders")
export class OrdersElement extends LitElement {
	@property({type: Array})
	public orders: Order[];

	public constructor() {
		super();
		this.orders = [];
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<div id="orders" style=${styleMap({backgroundImage: `url("${OrdersBackgroundURL}")`, "--max-pending-orders": MAX_PENDING_ORDERS})}>
				${repeat(this.orders, order => order, (order, index) => html`
					<curse-order .order=${order} style=${styleMap({gridColumn: MAX_PENDING_ORDERS - index})}></curse-order>
				 `)}
			</div>
		`;
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: contents;
		}
		#orders {
			display: grid;
			grid-template-columns: repeat(var(--max-pending-orders), 1fr);
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

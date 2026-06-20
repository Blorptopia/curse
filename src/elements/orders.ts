import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { Order } from "../types/market";
import "./order";

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
			<h1>Market</h1>
			<div id="orders">
				${repeat(this.orders, order => order.id, order => html`<curse-order id=${order.id} .order=${order}></curse-order>`)}
			</div>
		`;
	}

	public static styles?: CSSResultGroup = css`
		:host {
			padding: 1rem;
			background: brown;
		}
		#orders {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
		}
	`;
}

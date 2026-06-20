import { css, html, type HTMLTemplateResult, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Order } from "../types/market";
import { repeat } from "lit/directives/repeat.js";
import "./ingredient_icon";
import "./customer_icon";

@customElement("curse-order")
export class OrderElement extends LitElement {
	@property({type: Object})
	public order?: Order;

	public render(): HTMLTemplateResult {
		if (this.order === undefined) {
			return html``;
		}
		return html`
			<curse-customer-icon .customerId=${this.order.customerId}></curse-customer-icon>
			<div class="ingredients">
				${repeat(this.order.ingredientIds, ingredientId => ingredientId, ingredientId => html`
					<curse-ingredient-icon .ingredientId=${ingredientId}></curse-ingredient-icon>
				 `)}
			</div>
		`;
	}
	public static styles?: CSSResultGroup = css`
		:host {
			padding: 1rem;
			position: relative;
		}
		curse-customer-icon {
			display: block;
			--size: 4rem;
			height: var(--size);
			width: var(--size);
		}
		.ingredients {
			position: absolute;
			bottom: .1rem;
			right: .1rem;

			background: black;
			border-radius: 1rem;
			padding: .25rem;

			display: flex;
			gap: .2rem;
		}
		curse-ingredient-icon {
			display: block;
			--size: 1.2rem;
			height: var(--size);
			width: var(--size);
		}
	`;
}

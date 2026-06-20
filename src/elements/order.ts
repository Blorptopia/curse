import { css, html, type HTMLTemplateResult, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type AcceptOrderEventData, type RejectOrderEventData, type Order } from "../types/order";
import "./ingredient_icon";
import "./customer_shadow";
import { styleMap } from "lit/directives/style-map.js";

@customElement("curse-order")
export class OrderElement extends LitElement {
	@property({type: Object})
	public order?: Order;
	@property({type: Boolean})
	public canAccept: boolean;

	public constructor() {
		super();
		this.canAccept = true;
	}

	public render(): HTMLTemplateResult {
		if (this.order === undefined) {
			return html``;
		}
		return html`
			<div id="details">
				<div id="details-header">
					<h1 id="name">${this.order.name}</h1>
					<div>
						<div id="target-color" style=${styleMap({backgroundColor: this.order.targetColor})}></div>
					</div>
				</div>
				${this.order.description !== "" ? html`<p>${this.order.description}</p>` : null}
				<div id="actions">
					<span id="value">${this.order.value}$</span>
					<button class="primary" type="button" ?hidden=${!this.canAccept} @click=${this.accept}>Accept</button>
					<button class="destructive" type="button" @click=${this.reject}>Reject</button>
				</div>
			</div>
			<curse-customer-shadow .customerId=${this.order.customerId}></curse-customer-shadow>
		`;
	}
	private accept(): void {
		const customEvent = new CustomEvent<AcceptOrderEventData>(
			"curse-accept-order",
			{
				detail: {
					orderId: this.order!.id
				},
				composed: true
			}
		);
		this.dispatchEvent(customEvent);
	}
	private reject(): void {
		const customEvent = new CustomEvent<RejectOrderEventData>(
			"curse-reject-order",
			{
				detail: {
					orderId: this.order!.id
				},
				composed: true
			}
		);
		this.dispatchEvent(customEvent);
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			justify-content: flex-end;
		}
		#details {
			background: white;
			color: black;
			border-radius: 2rem;
			padding: 1rem;

			display: flex;
			flex-direction: column;
		}
		#details-header {
			display: flex;
			align-items: center;
			gap: 1rem;
		}
		#target-color {
			display: block;
			--size: 2rem;
			height: var(--size);
			width: var(--size);

			border-radius: 50%;
		}
		#value {
			color: green;
		}
	`;
}

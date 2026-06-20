import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/market";

const ID_TO_IMAGES = {
	GUSTAVO: ""
} satisfies Record<CustomerId, string>;

@customElement("curse-customer-icon")
export class CustomerIconElement extends LitElement {
	@property({type: String})
	public customerId: CustomerId;

	public constructor() {
		super();
		this.customerId = "GUSTAVO";
	}
	protected render(): HTMLTemplateResult {
		const imageUrl = ID_TO_IMAGES[this.customerId];
	   	return html`
			<img src=${imageUrl} alt="">
		`;
	}

	public static styles?: CSSResultGroup = css`
		img {
			height: 100%;
			width: 100%;
			aspect-ratio: 1;
		}
	`;
}

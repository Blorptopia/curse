import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/market";

const ID_TO_IMAGES = {
	GUSTAVO: "",
	JACK: ""
} satisfies Record<CustomerId, string>;

@customElement("curse-customer-portrait")
export class CustomerPortaitElement extends LitElement {
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
		:host {
			display: block;
			height: 100%;
			width: 100%;
			aspect-ratio: 1 / 3;
		}
		img {
			height: 100%;
			width: 100%;
			aspect-ratio: 1 / 3;
		}
	`;
}

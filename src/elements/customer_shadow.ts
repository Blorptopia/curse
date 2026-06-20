import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/market";

import JackShadowURL from "../assets/customers/jack/shadow.png";

const ID_TO_IMAGES = {
	GUSTAVO: "",
	JACK: JackShadowURL
} satisfies Record<CustomerId, string>;

@customElement("curse-customer-shadow")
export class CustomerShadowElement extends LitElement {
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
			--height: 110;
			--width: 233;
			display: block;
			aspect-ratio: 1 / 3;
		}
		img {
			width: 100%;
			aspect-ratio: 1 / 3;
		}
	`;
}

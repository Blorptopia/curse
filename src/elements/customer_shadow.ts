import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/customer";

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
			display: block;
			height: 100%;
			width: 100%;
		}
		img {
			height: 100%;
			width: 100%;
		}
	`;
}

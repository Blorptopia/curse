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
			--source-height: 200;
			--source-width: 133;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
	`;
}

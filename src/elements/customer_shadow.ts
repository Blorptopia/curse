import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/customer";

import JackShadowURL from "../assets/customers/jack/shadow.png";
import JoanyShadowURL from "../assets/customers/joany/shadow.png";
import TimTomShadowURL from "../assets/customers/tim_tom/shadow.png";
import OleMartinssonShadowURL from "../assets/customers/ole_martinsson/shadow.png";
import WhichyVequliaShadowURL from "../assets/customers/whicky_vequlia/shadow.png";
import JonJodunShadowURL from "../assets/customers/jon_jodun/shadow.png";

const ID_TO_IMAGES = {
	JACK: JackShadowURL,
	JOANY: JoanyShadowURL,
	TIM_TOM: TimTomShadowURL,
	LOANS_HARK: "",
	OLE_MARTINSSON: OleMartinssonShadowURL,
	WHICKY_VEQUILIA: WhichyVequliaShadowURL,
	JON_JODUN: JonJodunShadowURL
} satisfies Record<CustomerId, string>;

@customElement("curse-customer-shadow")
export class CustomerShadowElement extends LitElement {
	@property({type: String})
	public customerId: CustomerId;

	public constructor() {
		super();
		this.customerId = "JACK";
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

			user-select: none;
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

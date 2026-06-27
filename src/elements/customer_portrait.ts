import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CustomerId } from "../types/customer";

import JackDefaultURL from "../assets/customers/jack/poses/default.png";
import JoanyDefaultURL from "../assets/customers/joany/poses/default.png";
import TimTomDefaultURL from "../assets/customers/tim_tom/poses/default.png";
import OleMartinssonDefaultURL from "../assets/customers/ole_martinsson/poses/default.png";
import WhichyVequliaDefaultURL from "../assets/customers/whicky_vequlia/poses/default.png";
import JonJodunDefaultURL from "../assets/customers/whicky_vequlia/poses/default.png";
import LoansHarkDefaultURL from "../assets/customers/loans_hark/poses/default.png";


const ID_TO_IMAGES = {
	JACK: {
		default: JackDefaultURL,
	},
	JOANY: {
		default: JoanyDefaultURL
	},
	TIM_TOM: {
		default: TimTomDefaultURL,
	},
	LOANS_HARK: {
		default: LoansHarkDefaultURL,
	},
	OLE_MARTINSSON: {
		default: OleMartinssonDefaultURL,
	},
	WHICKY_VEQUILIA: {
		default: WhichyVequliaDefaultURL
	},
	JON_JODUN: {
		default: JonJodunDefaultURL
	}
} satisfies Record<CustomerId, Record<string, string>>;

@customElement("curse-customer-portrait")
export class CustomerPortraitElement extends LitElement {
	@property({type: String})
	public customerId: CustomerId;
	@property({type: String})
	public pose: string;

	public constructor() {
		super();
		this.customerId = "JACK";
		this.pose = "default";
	}
	protected render(): HTMLTemplateResult {
		const images = ID_TO_IMAGES[this.customerId];
		let imageUrl = (images[this.pose] ?? images["default"])!;
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

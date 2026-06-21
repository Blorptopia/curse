import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement } from "lit/decorators.js";
import HotPlateURL from "../assets/cup.png";

@customElement("curse-cup")
export class CupElement extends LitElement {
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${HotPlateURL}
				alt
			>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			height: 100%;
			width: 100%;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;

			image-rendering: pixelated;
		}
	`;
}

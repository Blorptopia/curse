import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import HotPlateURL from "../assets/hot_plate/base.png";
import HotPlateUnpressedButtonURL from "../assets/cup.png";
import HotPlatePressedButtonURL from "../assets/hot_plate/button/pressed.png";
import PressAudio1URL from "../assets/hot_plate/button/press/1.wav";
import PressAudio2URL from "../assets/hot_plate/button/press/2.wav";
import PressAudio3URL from "../assets/hot_plate/button/press/3.wav";

const PRESS_AUDIO_URLS: string[] = [
	PressAudio1URL,
	PressAudio2URL,
	PressAudio3URL
];
// Preload the clips
PRESS_AUDIO_URLS.map(url => new Audio(url));

@customElement("curse-hot-plate")
export class HotPlateElement extends LitElement {
	@state()
	private pressed: boolean;
	
	public constructor() {
		super();
		this.pressed = false;
	}

	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				class="base"
				src=${HotPlateURL}
				draggable="false"
				alt
				@mousedown=${this.press}
				@mouseup=${this.release}
				@touchstart=${this.press}
				@touchend=${this.release}
			>
			<img
				?data-pressed=${this.pressed}
				class="button"
				src=${this.pressed ? HotPlatePressedButtonURL : HotPlateUnpressedButtonURL}
				alt
			>
		`; 
	}
	private press(): void {
		this.pressed = true;
		
		const audioUrl = PRESS_AUDIO_URLS[Math.floor(Math.random() * PRESS_AUDIO_URLS.length)];
		const audio = new Audio(audioUrl);
		audio.volume = .5;
		audio.play();
	}
	private release(): void {
		this.pressed = false;
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 61;
			--source-width: 196;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));

			position: relative;
		}
		.base {
			cursor: pointer;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;

			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
		.button {
			position: absolute;
			top: 0;
			left: 0;
			pointer-events: none;
		}
		.button[data-pressed] {
			background: red;
		}
	`;
}

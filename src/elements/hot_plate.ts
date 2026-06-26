import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import HotPlateURL from "../assets/hot_plate/base.png";
import HotPlateUnpressedButtonURL from "../assets/hot_plate/button/unpressed.png";
import HotPlatePressedButtonURL from "../assets/hot_plate/button/pressed.png";
import PressAudio1URL from "../assets/hot_plate/button/press/1.wav";
import PressAudio2URL from "../assets/hot_plate/button/press/2.wav";
import PressAudio3URL from "../assets/hot_plate/button/press/3.wav";
import ReleaseAudio1URL from "../assets/hot_plate/button/release/1.wav";
import ReleaseAudio2URL from "../assets/hot_plate/button/release/2.wav";
import ReleaseAudio3URL from "../assets/hot_plate/button/release/3.wav";
import FireAudioURL from "../assets/hot_plate/fire.mp3";
import { IGNITION_OFFSET_MS } from "../config";
import { repeat } from "lit/directives/repeat.js";

const PRESS_AUDIO_URLS: string[] = [
	PressAudio1URL,
	PressAudio2URL,
	PressAudio3URL
];
const RELEASE_AUDIO_URLS: string[] = [
	ReleaseAudio1URL,
	ReleaseAudio2URL,
	ReleaseAudio3URL
];

@customElement("curse-hot-plate")
export class HotPlateElement extends LitElement {
	// Props
	@property({type: Array})
	public temperatures: number[];

	// State
	@state()
	private state: HotPlateState;
	@state()
	private desiredToBePressed: boolean;

	// Attributes
	private pressAudios: HTMLAudioElement[];
	private releaseAudios: HTMLAudioElement[];
	private fireAudio: HTMLAudioElement;

	public constructor() {
		super();
		this.temperatures = [];

		this.state = "unpressed";
		this.desiredToBePressed = false;

		this.pressAudios = PRESS_AUDIO_URLS.map(url => new Audio(url));
		this.releaseAudios = RELEASE_AUDIO_URLS.map(url => new Audio(url));
		this.fireAudio = new Audio(FireAudioURL);
		this.fireAudio.loop = true;
		this.fireAudio.volume = .1;
	}

	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				class="base"
				src=${HotPlateURL}
				draggable="false"
				alt
				@mousedown=${this.humanPress}
				@mouseup=${this.humanRelease}
				@touchstart=${this.humanPress}
				@touchend=${this.humanRelease}
			>
			<img
				data-state=${this.state}
				class="button"
				src=${["activating", "pressed"].includes(this.state) ? HotPlatePressedButtonURL : HotPlateUnpressedButtonURL}
				alt
			>
			<div id="temperatures-container">
				${repeat(this.temperatures, temperature => temperature, temperature => html`
					<span class="temperature" ?data-high=${temperature > 90}>${temperature} &deg;C</span>
				`)}
		`; 
	}
	private humanPress(): void {
		this.desiredToBePressed = true;

		if (this.state !== "unpressed") {
			// This will be handled elsewhere
			return;
		}
		this.state = "activating";
		this.handleStateTransition("unpressed");
		
	}
	private humanRelease(): void {
		this.desiredToBePressed = false;
		if (this.state !== "pressed") {
			// This will be handled elsewhere
			return;
		}
		this.state = "deactivating";
		this.handleStateTransition("pressed");
	}
	private async handleStateTransition(from: HotPlateState): Promise<void> {
		console.log(`transition from ${from} to ${this.state}`);
		if (this.state === "activating") {
			const audio = this.pressAudios[Math.floor(Math.random() * this.pressAudios.length)];
			audio.addEventListener("ended", () => {
				if (this.desiredToBePressed) {
					this.state = "pressed";
				} else {
					this.state = "deactivating";
				}
				this.handleStateTransition("activating");
			}, {once: true});
			audio.volume = .5;
			await audio.play();
			await new Promise(resolve => setTimeout(resolve, IGNITION_OFFSET_MS));
			const allowedNewState: HotPlateState[] = [
				"activating",
				"pressed"
			];
			if (allowedNewState.includes(this.state)) {
				this.fireAudio.play();
				console.log("FIRE");
			}
		}
		if (this.state === "deactivating") {
			const audio = this.releaseAudios[Math.floor(Math.random() * this.releaseAudios.length)];
			audio.addEventListener("ended", () => {
				if (this.desiredToBePressed) {
					this.state = "activating";
				} else {
					this.state = "unpressed";
				}
				this.handleStateTransition("deactivating");
			}, {once: true});
			audio.volume = .5;
			audio.play();

			this.fireAudio.pause();
			this.fireAudio.fastSeek(Math.random() * 5);
		}
		if (this.state === "pressed") {
			const event = new CustomEvent("curseenablehotplate");
			this.dispatchEvent(event);
		}
		if (from === "pressed") {
			const event = new CustomEvent("cursedisablehotplate");
			this.dispatchEvent(event);
		}

	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 61;
			--source-width: 196;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));

			position: relative;

			user-select: none;
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
		#temperatures-container {
			position: absolute;
			top: 0;
			left: 0;
			box-sizing: border-box;
			width: 50%;
			height: 100%;
			overflow: hidden;
			font-size: 1.3rem;
			padding: 1rem;

			display: flex;
			align-items: center;
			gap: .5rem;

		}
		.temperature {
			background: #5c1361;
			padding: .5rem;
			border-radius: .5rem;
		}
		.temperature[data-high] {
			color: red;
		}
	`
}

type HotPlateState = "unpressed" | "activating" | "pressed" | "deactivating";

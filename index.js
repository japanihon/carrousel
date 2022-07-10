import Alpine from "https://cdn.skypack.dev/alpinejs@3.10.2";

Alpine.data('carousel', function carousel() {
	return {
		scrollEl: null,

		index: 0,

		momentum: {
			active: false,
			handler: null,
			dragging: false,
			velocity: 0,
			startPos: 0,
			scrollLeft: 0,
		},

		init() {
			this.scrollEl = this.$root.querySelector(".carousel__scroll");

			this.dragScroll();
			this.updateIndex();
		},

		// move the slider
		go(mode) {
			this.scrollEl.scrollLeft = this.getNewPos(mode);
		},

		// get the new position of the slider after movement
		getNewPos(mode) {
			const currentScroll = this.scrollEl.scrollLeft;
			const slideWidth = this.scrollEl.offsetWidth;
			const scrollWidth = this.scrollEl.scrollWidth;

			let newScrollPos = currentScroll;

			// next
			if (mode === "next") {
				newScrollPos += slideWidth;
				// we're within 20px of the end so loop to the start
				if (Math.abs(scrollWidth - newScrollPos) < 20) {
					newScrollPos = 0;
				}
				return newScrollPos;
			}

			// prev
			if (mode === "prev") {
				// we're within 20px of the beginning so loop to the end
				if (Math.abs(newScrollPos) < 20) {
					return scrollWidth - slideWidth;
				}
				return (newScrollPos -= slideWidth);
			}

			// an index
			const index = parseInt(mode);
			if (typeof index === "number") {
				return (newScrollPos = slideWidth * index);
			}
		},

		/**
		 * update index
		 */
		updateIndex() {
			const slides = [...this.$root.querySelectorAll(".carousel__slide")];

			const observer = new IntersectionObserver(
				(entries, observer) => {
					// get the state of what slides are visible
					const state = [];
					for (const entry of entries) {
						const index = slides.indexOf(entry.target);
						state[index] = entry.intersectionRatio > 0.5;
					}

					// set index to the first visible slide
					const index = state.findIndex((v) => v);
					if (index !== -1) this.index = index;
				},
				{
					root: this.scrollEl,
					threshold: 0.5,
				}
			);

			for (const slide of slides) {
				observer.observe(slide);
			}
		},

		/**
		 * momentum drag for mouse users
		 */
		dragScroll() {
			this.scrollEl.addEventListener("mousedown", (e) => {
				this.momentum.dragging = true;
				this.momentum.active = true;
				this.momentum.startPos = e.pageX - this.scrollEl.offsetLeft;
				this.momentum.scrollLeft = this.scrollEl.scrollLeft;

				this.cancelMomentum();
			});

			this.scrollEl.addEventListener("mouseup", () => {
				this.momentum.dragging = false;
				this.beginMomentum();
			});

			this.scrollEl.addEventListener("mouseleave", () => {
				this.momentum.dragging = false;
				this.beginMomentum();
			});

			this.scrollEl.addEventListener("mousemove", (e) => {
				if (!this.momentum.dragging) return;
				e.preventDefault();

				const x = e.pageX - this.scrollEl.offsetLeft;
				const walk = x - this.momentum.startPos;

				// store the previous scroll position
				const prevScrollLeft = this.scrollEl.scrollLeft;
				this.scrollEl.scrollLeft = this.momentum.scrollLeft - walk;

				// Compare change in position to work out drag speed
				this.momentum.velocity = this.scrollEl.scrollLeft - prevScrollLeft;
			});

			this.scrollEl.addEventListener("wheel", (e) => {
				this.cancelMomentum();
			});
		},

		beginMomentum() {
			this.cancelMomentum();
			this.momentum.handler = requestAnimationFrame(() => this.momentumLoop());
		},

		cancelMomentum() {
			cancelAnimationFrame(this.momentum.handler);
		},

		momentumLoop() {
			this.scrollEl.scrollLeft += this.momentum.velocity;
			this.momentum.velocity *= 0.95; // slow the velocity slightly
			// are we still moving?
			if (Math.abs(this.momentum.velocity) > 0.5) {
				this.momentum.handler = requestAnimationFrame(() =>
					this.momentumLoop()
				);
			} else {
				this.momentum.active = false;
			}
		},
	};
})

Alpine.start()
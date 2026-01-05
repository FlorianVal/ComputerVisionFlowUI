import '@testing-library/jest-dom'

// Provide a minimal HTMLCanvasElement.getContext('2d') polyfill for jsdom
// to avoid needing the full 'canvas' native package in unit tests.
// jsdom may implement getContext but return null; override it to ensure tests run reliably.
if (typeof HTMLCanvasElement !== 'undefined') {
	// eslint-disable-next-line no-undef
	HTMLCanvasElement.prototype.getContext = function (type) {
		if (type !== '2d') return null
		return {
			// used by BaseNode and imageProcessor tests
			drawImage: () => {},
			getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
			putImageData: () => {},
			createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
			measureText: () => ({ width: 0 }),
			fillRect: () => {},
			fillText: () => {},
		}
	}
}

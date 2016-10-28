'use strict';

const cv = require('opencv');
const logger = require('winston');

// Find the biggest part of the image that is different from the baseline
function detectMotion(baseImage, image) {
	// Compute the diff
	var diff = new cv.Matrix(baseImage.height(), baseImage.width());
	diff.absDiff(baseImage, image);

	// Convert to grayscale
	diff.convertGrayscale();

	// Create a binary threshold:
	// 0: the difference is less than 35
	// 1: the difference is at least 35
	var thresh = diff.threshold(35, 255, "Binary");

	// Fill in any gaps
	thresh.dilate(2);

	// Find the contours
	var contours = thresh.findContours();

	// Pick the biggest one
	if (contours.size()) {
		var biggestContour = {
			area: 0,
			index: 0,
		};
		
		for (var i = 0; i < contours.size(); i++) {
			if (contours.area(i) > biggestContour.area) {
				biggestContour.index = i;
				biggestContour.area = contours.area(i);
			}
		}

		// Find the bounding box and return
		var rect = contours.boundingRect(biggestContour.index);
		return rect;
	}
	else {
		return;
	}
}

class MotionDetector {
	constructor({ io, dimensions }) {
		this.io = io;
		this.dimensions = dimensions;
	}

	detect(image) {
		if (this.baseImage === undefined) {
			this.baseImage = image;
			logger.debug('set baseImage');
		}
		else {
			let rect = detectMotion(this.baseImage, image);
			if (rect) {
				// Mirror
				rect.x = this.dimensions.w - rect.x;
				logger.debug(rect);

				// Focus
				this.io.emit('focus', rect);
				logger.debug('emitted focus event');
			}
			else {
				logger.debug('no motion detected');
			}
		}
	}
}

module.exports = MotionDetector;

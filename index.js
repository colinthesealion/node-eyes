'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const cv = require('opencv');
const logger = require('winston');

const MotionDetector = require('./lib/MotionDetector');
const settings = require('./settings');

if (settings.hasOwnProperty('logLevel')) {
	logger.level = settings.logLevel;
}

const motionDetector = new MotionDetector({
	io: io,
	dimensions: settings.resolution,
});

if (settings.raspi) {
	logger.info(`using raspicam ${settings.resolution.w}x${settings.resolution.h}`);
	const RaspiCam = require('raspicam');
	const camera = new RaspiCam(settings.resolution);
	camera.on('read', (err, filename) => {
		if (err) {
			logger.error(err);
		}
		else {
			logger.debug(`raspicam got an image: ${filename}`);
			cv.readImage(filename, (err, image) => {
				if (err) {
					logger.error(err);
				}
				else {
					motionDetector.detect(image);
				}
			});
		}
	});
}
else {
	logger.info(`using webcam ${settings.resolution.w}x${settings.resolution.h}`);
	const camera = new cv.VideoCapture(0);
	camera.setWidth(settings.resolution.w);
	camera.setHeight(settings.resolution.h);
	setInterval(() => {
		camera.read((err, image) => {
			if (err) {
				logger.error(err);
			}
			else {
				logger.debug('webcam got an image');
				motionDetector.detect(image);
			}
		});
	}, 200);
}

io.on('connect', (client) => {
	logger.info(`client ${client.id} connected`);
	client.on('disconnect', () => { logger.info(`client ${client.id} disconnected`); });
});

app.use(express.static('build'));

http.listen(settings.port, function() {
	logger.info(`Navigate to http://localhost:${settings.port}`);
});

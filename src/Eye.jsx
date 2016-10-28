'use strict';

import React from 'react';

const Pupil = React.createClass({
	propTypes: {
		boundaies: React.PropTypes.shape({
			h: React.PropTypes.number,
			w: React.PropTypes.number,
		}),
		center: React.PropTypes.shape({
			x: React.PropTypes.number,
			y: React.PropTypes.number,
		}),
		r: React.PropTypes.number,
	},
	getDefaultProps() {
		return {
			initialPos: {
				x: 50,
				y: 50,
			},
			center: {
				x: 0,
				y: 0,
			},
			r: 25,
		};
	},
	getInitialState() {
		let a = this.props.boundaries.w / 2;
		let b = this.props.boundaries.h / 2;
		return {
			a: a,
			b: b,
			x: a,
			y: b,
		};
	},
	componentDidMount() {
		this.listenForFocus();
		// this.eyeRoll();
	},
	listenForFocus() {
		let socket = io();
		socket.on('focus', (boundingBox) => {
			if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
				this.focusOn({
					x: boundingBox.x + boundingBox.width / 2,
					y: boundingBox.y + boundingBox.height / 2,
				});
			}
		});
	},
	eyeRoll() {
		let position = {
			x: 0,
			y: 0,
		};
		setInterval(
			() => {
				this.focusOn(position);
				position.x += 10;
				if (position.x > window.innerWidth) {
					position.x = 0;
					position.y += 10;
					if (position.y > window.innerHeight) {
						position.y = 0;
					}
				}
			},
			25
		);
		return;
	},
	focusOn(position) {
		// Determine the polar coordinates of the position to focus on
		let offsetX = position.x - this.props.center.x;
		let offsetY = position.y - this.props.center.y;
		let theta = Math.atan2(offsetY, offsetX);
		let desiredR = Math.sqrt( offsetX * offsetX + offsetY * offsetY );

		// Determine the polar coordinates of the edge of the oval
		let sinTheta = Math.sin(theta);
		let cosTheta = Math.cos(theta);
		let maxR = (
			( this.state.a * this.state.b )
			/
			Math.sqrt(
				this.state.a * this.state.a * sinTheta * sinTheta
				+
				this.state.b * this.state.b * cosTheta * cosTheta
			)
		) - this.props.r - 5;

		// And finally determine the coordinates for the pupils
		let r = Math.min(desiredR, maxR);
		let state = Object.assign({}, this.state);
		state.x = state.a + r * cosTheta;
		state.y = state.b + r * sinTheta;

		this.setState(state);

		return;
	},
	render() {
		let style = {
			width: 2 * this.props.r,
			height: 2 * this.props.r,
			marginLeft: -this.props.r,
			marginTop: -this.props.r,
			left: this.state.x,
			top: this.state.y,
		};
		return (
			<div className="pupil" style={style} />
		);
	},
});

const Eye = React.createClass({
	propTypes: {
		position: React.PropTypes.shape({
			x: React.PropTypes.number,
			y: React.PropTypes.number,
		}),
		dimensions: React.PropTypes.shape({
			w: React.PropTypes.number,
			h: React.PropTypes.number,
		}),
		pupilRadius: React.PropTypes.number,
	},
	getDefaultProps() {
		return {
			position: {
				x: 0,
				y: 0,
			},
			dimensions: {
				w: 200,
				h: 300,
			},
			pupilRadius: 25,
		};
	},
	render() {
		let style = {
			left: this.props.position.x,
			top: this.props.position.y,
			width: this.props.dimensions.w,
			height: this.props.dimensions.h,
			marginLeft: -this.props.dimensions.w / 2,
			marginTop: -this.props.dimensions.h / 2,
		};
		return (
			<div className="eye" style={style}>
				<Pupil center={this.props.position} boundaries={this.props.dimensions} r={this.props.pupilRadius} />
			</div>
		);
	},
});

export default Eye;

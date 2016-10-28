'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Eye from './Eye';
import settings from '../settings';

ReactDOM.render(
	<div>
		<Eye position={settings.left} dimensions={settings.eye} pupilRadius={settings.pupil.r} />
		<Eye position={settings.right} dimensions={settings.eye} pupilRadius={settings.pupil.r} />
	</div>,
	document.getElementById('root')
);

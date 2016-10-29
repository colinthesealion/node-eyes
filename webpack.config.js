const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: [
		'./src/index.jsx',
	],
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'bundle.js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: { presets: [ 'es2015', 'react', 'stage-2' ] },
			},
		],
	},
	resolve: {
                extensions: ['', '.js', '.jsx'],
        },
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'static' }
		])
	],
	devtool: 'source-map',
};

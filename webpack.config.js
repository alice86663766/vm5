var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: './client/scripts/admock.js',
	output: {
		path: path.join(__dirname, 'client'),
		filename: 'bundle.js'
	},
	module: {
		loaders: [{ 
			test: /\.json$/, 
			loader: 'json'
		},{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['es2015', 'react']
			}
		}, {
	    	test: /\.css$/,
			loader: 'style!css?modules',
			include: /flexboxgrid/
	    }]
	},
	watch: true
};
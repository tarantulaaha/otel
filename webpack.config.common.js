const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const generateHTMLPlugins = () => glob.sync('./src/*.html').map(
	dir => new HTMLWebpackPlugin({
		filename: path.basename(dir), // Output
		template: dir, // Input
	}),
);

module.exports = {
	node: {
		fs: 'empty',
	},
	entry: ['./src/js/app.js', './src/style/main.scss'],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'app.bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
			},
			{
				test: /\.html$/,
				loader: 'raw-loader',
			},
			{
				test: /\.css$/,
				loaders: ["style-loader", "css-loader"]
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loader: "file-loader",
				options: {
					name: '[name].[ext]',
					outputPath: 'static/'
				}
			},
			{
				test: /\.(eot|woff|woff2|ttf)([\?]?.*)$/,
				loader: "file-loader",
				options: {
					name: '[name].[ext]',
					outputPath: 'fonts/'
				}
			}
		],
	},
	plugins: [
		new CopyWebpackPlugin([
			{
				from: './src/static/',
				to: './static/',
			},
			{
				from: './src/json/',
				to: './json/',
			},
			{
				from: './src/templates/',
				to: './templates/',
			},
		]),
       
		new webpack.ProvidePlugin({ // inject ES5 modules as global vars
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			'window.$': 'jquery',
		}),
		...generateHTMLPlugins(),
	],

	stats: {
		colors: true,
	},
	devtool: 'source-map',
};

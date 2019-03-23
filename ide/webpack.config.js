const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');

const isProduction = false;
const context = path.resolve(__dirname, 'src');

module.exports = {
	mode: isProduction ? 'production' : 'development',

	entry: './App',

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'ide.js'
	},

	context,

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
	},

	devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /\/node_modules\//,
				loader: {
					loader: 'babel-loader',
					options: {
						babelrc: false,
						presets: [
							'@babel/typescript',
							'@babel/react',
							[
								'@babel/env',
								{
									modules: false
								}
							]
						],
						plugins: [
							'@babel/proposal-class-properties',
							[
								'react-css-modules',
								{
									context,
									autoResolveMultipleImports: true,
									'filetypes': {
										'.scss': {
											syntax: 'postcss-scss',
										}
									}
								}
							]
						]
					}
				},
			},

			{
				test: /\.scss$/,
				exclude: /\/node_modules\//,
				loaders: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
							importLoaders: 2,
							localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
						},
					},
				],
			},

			{
				test: /\.css$/,
				loaders: [
					'style-loader',
					'css-loader'
				],
			},
		],
	},

	plugins: [
		new MonacoWebpackPlugin()
	],
};

if (isProduction === false) {
	module.exports.plugins.push(
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin(),
	);

	module.exports.devServer = {
		hot: true,
		index: 'index.html',
	};
}
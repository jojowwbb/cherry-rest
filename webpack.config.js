const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode:'development',
    entry: {
        bundle: path.resolve(__dirname, './src/Cherry.js')
    },
    output: {
        chunkFilename: "[name].js",
        filename: "index.js",
        libraryTarget: 'umd',
        library: 'CherryRest',
        path: path.resolve(__dirname, './dist'),
    },

    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist',
            'build'], {
            root:__dirname,
            verbose: true,
            dry: false
        })
    ]
};

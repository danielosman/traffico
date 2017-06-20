const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fileName = 'traffico'
const libraryName = 'traffico'


const extractSass = new ExtractTextPlugin({
  filename: 'css/' + fileName + '.css',
  disable: process.env.NODE_ENV === "development"
})
const htmlWebpack = new HtmlWebpackPlugin({
  title: 'Traffico',
  filename: 'index.html'
})
/*
const provideJQueryPlugin = new webpack.ProvidePlugin({
  $: "jquery",
  jQuery: "jquery"
})
*/

const plugins = []
//plugins.push(provideJQueryPlugin)
plugins.push(extractSass)
plugins.push(htmlWebpack)

const externals = {
  'jquery': {amd: 'jquery', root: 'jQuery'},
  'lodash': {amd: 'lodash', root: '_'},
  'backbone': {amd: 'backbone', root: 'Backbone'},
}

const config = {
  entry: {
    'traffico': path.join(__dirname, '/src/index.js')
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'js/' + '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        //use: 'css-loader'
        use: extractSass.extract({
          loader: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          loader: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'handlebars-loader'
        }]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          //options: {
            query: {
              presets: ['es2015']
            }
          //}
        }],
      }
    ]
  },
  externals: {},
  resolve: {
    alias: {}
  },
  plugins: plugins,
  stats: { children: false }
  /*
  devServer: {
    publicPath: path.join(__dirname, 'build'),
    compress: true,
    port: 8000
  }
  */
}

module.exports = config

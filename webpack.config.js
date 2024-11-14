const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const weekEntries = {}
const plugins = []
const CURRENT_WEEK = 4

for (let i = 0; i < CURRENT_WEEK; i ++) {
  weekEntries[`week${i+1}`] = `./src/week${i+1}.js`
  plugins.push(new HtmlWebpackPlugin({
    filename: `week${i+1}.html`,
    chunks: [`week${i + 1}`],
    title: `[Threejs] Week${i + 1}`,
  }))
}

module.exports = {
  entry: {
    index:'./src/index.js',
    ...weekEntries,
    week3_1:'./src/week3-1.js'
  },
  mode:'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    runtimeChunk: 'single',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      title: 'Threejs Studies',
    }),
    ...plugins,
    new HtmlWebpackPlugin({
      filename: 'week3-1.html',
      chunks: ['week3_1'],
      title: 'Threejs Studies week3-1',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
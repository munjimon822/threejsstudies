const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const weekEntries = {}
const plugins = []
const CURRENT_WEEK = 5

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
    week3_1:'./src/week3-1.js',
    week5_1:'./src/week5-1.js',
    week5_2:'./src/week5-2.js'
  },
  mode:'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
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
    new HtmlWebpackPlugin({
      filename: 'week5-1.html',
      chunks: ['week5_1'],
      title: 'Threejs Studies week5-1',
    }),
    new HtmlWebpackPlugin({
      filename: 'week5-2.html',
      chunks: ['week5_2'],
      title: 'Threejs Studies week5-2',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|gltf|glb|fbx|bin|hdr|png)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]', // 원래 소스 폴더 구조 유지
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      }
    ],
  },
};
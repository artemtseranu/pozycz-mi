const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlPlugin({
  template: './src/index.html',
  filename: 'index.html',
});

module.exports = {
  entry: ['webpack/hot/dev-server', 'babel-polyfill', './src/main.jsx'],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Root: path.resolve(__dirname, 'src'),
      Components: path.resolve(__dirname, 'src/components'),
      Constants: path.resolve(__dirname, 'src/constants'),
      Events: path.resolve(__dirname, 'src/events'),
      Models: path.resolve(__dirname, 'src/models'),
      Entities: path.resolve(__dirname, 'src/entities'),
      Reducers: path.resolve(__dirname, 'src/reducers'),
      Lib: path.resolve(__dirname, 'src/lib'),
      ContractArtifacts: path.resolve(__dirname, '../build/contracts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    htmlPlugin,
  ],
};

const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");

const htmlPlugin = new HtmlPlugin({
  template: "./src/index.html",
  filename: "index.html"
});

module.exports = {
  entry: ["webpack/hot/dev-server", "babel-polyfill", "./src/main.js"],
  resolve: {
    alias: {
      Root: path.resolve(__dirname, "src"),
      Components: path.resolve(__dirname, "src/components"),
      Events: path.resolve(__dirname, "src/events"),
      Models: path.resolve(__dirname, "src/models"),
      Lib: path.resolve(__dirname, "src/lib"),
      ContractArtifacts: path.resolve(__dirname, "../build/contracts")
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    htmlPlugin
  ]
};

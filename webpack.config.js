const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/app/index.js',
  // webpack 5 を利用していて、IE 対応する場合は以下のコメントを外す
  // target: ['web', 'es5'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
      {
        // 拡張子 cssのファイル
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

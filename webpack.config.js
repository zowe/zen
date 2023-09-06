const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/renderer/index.tsx',
  output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'app.js'
	},
  stats: {
    children: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match both .ts and .tsx files
        use: 'ts-loader', // Use ts-loader for TypeScript files
        exclude: /node_modules/, // Exclude node_modules directory
      },
      // {
      //   test:  /\.worker\.js$/,
      //   use:  { loader: 'worker-loader' },
      // },
      {
        test: /\.css$/, // Add a rule for CSS files
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|woff|woff2|eot|ttf|otf|pdf|ico|mp4|webm)$/,
        use: 'ignore-loader', // Use ignore-loader for unknown file types
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Add .tsx and .ts as resolvable extensions
  },
  plugins:[
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/renderer/assets'),
          to: path.resolve('../web/assets'),
        },
        {
          from: path.resolve(__dirname, './node_modules/monaco-editor/min/vs/editor/editor.main.css'),
          to: path.resolve('../web/assets/monaco/editor/editor.main.css'),
        },
        {
          from: path.resolve(__dirname, './node_modules/monaco-editor/min/vs/base'),
          to: path.resolve('../web/assets/monaco/base'),
        },
      ],
    }),
    new MonacoWebpackPlugin(),
  ],
};

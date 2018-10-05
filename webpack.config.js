const path = require( 'path' )
const webpack = require( 'webpack' )
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' )
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin
const ChunkhashReplaceWebpackPlugin = require( 'chunkhash-replace-webpack-plugin' )

// const isProduction = process.env.NODE_ENV === 'production'
const isProduction = true

module.exports = {
  mode: 'production',
  entry: {
    'gen-statem': './dist/index.js',
  },

  output: {
    path: path.resolve( __dirname, './dist/umd' ),
    libraryTarget: 'umd',
    // library: 'statem',
    // libraryExport: 'default',
    // umdNamedDefine: true,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          declaration: true,
        },
      },
    ],
  },

  resolve: {
    extensions: ['*', '.js', '.vue', '.json', '.ts'],
  },

  performance: {
    hints: false,
  },

  // devtool: '#eval-source-map',
};

if ( isProduction ) {
  module.exports.devtool = '#source-map';
  // noinspection JSUnusedGlobalSymbols, JSUnresolvedFunction
  module.exports.plugins = (module.exports.plugins || []).concat( [

    new BundleAnalyzerPlugin( { analyzerMode: 'static' } ),

    new webpack.DefinePlugin( {
      'process.env': { NODE_ENV: '"production"' },
    } ),

  ] );
}

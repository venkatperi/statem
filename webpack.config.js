const path = require( 'path' )
const webpack = require( 'webpack' )
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin

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
  },
  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
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

    // new BundleAnalyzerPlugin( { analyzerMode: 'static' } ),

    new webpack.DefinePlugin( {
      'process.env': { NODE_ENV: '"production"' },
    } ),

  ] );
}

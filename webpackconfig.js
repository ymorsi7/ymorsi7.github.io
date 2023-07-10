const path = require('path');

module.exports = {
  mode: 'development',
  entry: 'js/newMap.js', // Replace with the path to your main JavaScript file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Replace with your desired output directory
  },
};

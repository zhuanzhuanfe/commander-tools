const rucksack = require('rucksack-css')
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [
    rucksack(), // css alias syntax plugin
    autoprefixer({
      browsers: [
        'last 3 versions',
        '> 1%',
        'iOS >= 8',
        'Android >= 4',
      ],
    }),
  ],
}

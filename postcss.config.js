// const { join } = require('path')
module.exports = ({ file: { dirname, basename } }) => {
  const designWidth = 375
  return {
    plugins: [
      require('autoprefixer'),
      require('postcss-px-to-viewport')({
        unitToConvert: 'px',
        viewportWidth: designWidth,
        unitPrecision: 3,
        viewportUnit: 'vw',
        fontViewportUnit: 'vw',
        minPixelValue: 1
        // mediaQuery: true,
        // include: /src\/views\/map\//,
      })
    ]
  }
}

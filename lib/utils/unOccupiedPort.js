const net = require('net')

function unOccupiedPort(port) {
  const server = net.createServer().listen(port)

  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      server.close()
      resolve(port)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(unOccupiedPort(port + 1)) // 如占用端口号+1
      } else {
        reject(err)
      }
    })
  })

}

module.exports = unOccupiedPort

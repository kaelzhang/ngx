const make_array = require('make-array')

class Servers {
  constructor (servers, options) {
    this._servers = make_array(servers)
    .map(server => new Server(server, options))
  }

  toString () {
    return this._servers
    .map(server => server.toString())
    .join('\n\n')
  }
}


class Server {
  constructor ({
    port = [80, 443],
    server_name,
    route
  }, options) {

    this._port = make_array(port).map(Number)
    this._server_name = make_array(server_name)

    if (!this._server_name.length) {
      throw new Error('server_name is not defined.')
    }

    this._options = options
    this._route = route
  }

  // server {
  //   listen 80;
  //   server_name api.thebeastshop.com api-test.thebeastshop.com;
  //   limit_conn perip 20;
  //   include route/api.thebeastshop.com.conf;
  // }

  // server {
  //   listen 443 ssl http2;
  //   server_name api.thebeastshop.com api-test.thebeastshop.com;
  //   include snippet/ssl.conf;
  //   include route/api.thebeastshop.com.conf;
  // }

  _serverToString (port) {
    if (port === 443) {
      return `server {
  listen ${port} ssl http2;
  server_name ${this._server_name.join(' ')};
  proxy_set_header 'X-Gaia-Use-HTTPS' '1';
  proxy_set_header 'X-Gaia-Level' '2';
  include snippet/ssl.conf;
  include ${this._routeString()};
}`
    }

    return `server {
  listen ${port};
  server_name ${this._server_name.join(' ')};
  include ${this._routeString()};
}`
  }

  _routeString () {
    return this._route
      ? route
      : `route/${this._server_name[0]}.conf`
  }

  toString () {
    return this._port
    .map((port) => {
      return this._serverToString(port)
    })
    .join('\n\n')
  }
}


module.exports = {
  Servers,
  Server
}

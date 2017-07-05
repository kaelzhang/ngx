import make_array from 'make-array'

export class Servers {
  constructor (servers) {
    this._servers = make_array(servers)
    .map(server => new Server(server))
  }

  map (fn) {
    return this._servers.map(fn)
  }

  // async toString (include) {
  //   return Promise.all(
  //     this._servers.map(server => server.toString(include))
  //   )
  //   .then(contents => {
  //     return contents.join('\n\n')
  //   })
  // }
}


export class Server {
  constructor ({
    port = [80, 443],
    server_name,
    include,
    data = {}
  }) {

    this._port = make_array(port).map(Number)
    this._server_name = make_array(server_name)

    if (!this._server_name.length) {
      throw new Error('server_name is not defined.')
    }

    this._include = include
    this._data = data
  }

  get data () {
    return this._data
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

  async _serverToString (port, include) {
    const content = await include(this._routeString())

    if (port === 443) {
      const ssl = await include('snippet/ssl.conf')

      return `server {
  listen ${port} ssl http2;
  server_name ${this._server_name.join(' ')};
  ${ssl};
  ${content};
}`
    }

    return `server {
  listen ${port};
  server_name ${this._server_name.join(' ')};
  ${content};
}`
  }

  _routeString () {
    return this._include
      ? this._include
      : `route/${this._server_name[0]}.conf`
  }

  toString (include) {
    return Promise.all(
      this._port.map(port => this._serverToString(port, include))
    )
    .then(contents => {
      return contents.join('\n\n')
    })
  }
}

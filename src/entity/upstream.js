const UPSTREAMS_ADD = Symbol.for('add-upstream')
import make_array from 'make-array'

const RESERVED_UPSTREAM_NAMES = [
  'constructor',
  'remove',
  'forEach',
  'toString'
]

export class Upstreams {
  constructor (upstreams) {
    this._upstreams = {}

    Object.keys(upstreams).forEach(name => {
      if (~RESERVED_UPSTREAM_NAMES.indexOf(name)) {
        throw new Error(`upstream name "${name}" is reserved`)
      }

      this[UPSTREAMS_ADD](name, upstreams[name])
    })
  }

  [UPSTREAMS_ADD] (name, upstream) {
    this._upstreams[name] = new Upstream(name, upstream)

    Object.defineProperty(this, name, {
      get () {
        return this._upstreams[name]
      }
    })
  }

  remove (ip, port) {
    Object.keys(this._upstreams).forEach(name => {
      this._upstreams[name].remove(ip, port)
    })

    return this
  }

  forEach (fn) {
    Object.keys(this._upstreams).forEach(name => {
      fn(name, this._upstreams[name].value())
    })

    return this
  }

  toString () {
    return Object.keys(this._upstreams)
    .map(name => this._upstreams[name].toString())
    .join('\n\n')
  }
}


export class Upstream {
  constructor (name, {
    server_options,
    server
  }) {

    this._name = name
    this._servers = make_array(server)
    .map(server => new UpstreamServer(server, server_options))
  }

  // List all servers
  value () {
    return this._servers.map(server => server.value())
  }

  forEach (fn) {
    this._servers.forEach((server, i) => {
      fn(server.value(), i)
    })

    return this
  }

  remove (ip, port) {
    this._servers.forEach((server) => {
      if (server.is(ip, port)) {
        server.disable()
      }
    })

    return this
  }

  _serverToString () {
    return this._servers
    .filter(server => server.enabled())
    .map(server => server.toString())
    .join('\n')
  }

  toString () {
    return `upstream ${this._name} {
${this._serverToString()}
}`
  }
}


const REGEX_SERVER = /(^[^:]+)(?::(\d+))?(?:\s+(.*))?$/

export class UpstreamServer {
  constructor (server, default_options = null) {
    const {
      ip,
      port,
      options
    } = this._parse(server)

    this._enabled = true
    this._ip = ip
    this._port = port
    this._options = options
      ? options
      : default_options
  }

  is (ip, port) {
    return this._ip === ip && (!port || this._port === port)
  }

  enabled () {
    return this._enabled
  }

  disable () {
    this._enabled = false
    return this
  }

  value () {
    return {
      ip: this._ip,
      port: this._port,
      enabled: this._enabled,
      options: Object.assign({}, this._options)
    }
  }

  _parse_options (options_string) {
    if (!options_string) {
      return null
    }

    const options = {}
    options_string
    .split(/\s+/g)
    .forEach((pair) => {
      const [
        name,
        value = true
      ] = pair.split('=')

      options[name] = value
    })

    return options
  }

  _parse (server) {
    const match = server.match(REGEX_SERVER)
    return {
      ip: match[1],
      port: match[2] || 80,
      options: this._parse_options(match[3])
    }
  }

  _stringify_options (options) {
    return options
      ? ' ' + Object.keys(options)
        .map((name) => {
          const value = options[name]

          return value === true
            ? name
            : `${name}=${options[name]}`
        })
        .join(' ')
      : ''
  }

  toString () {
    const options_string = this._stringify_options(this._options)
    return `  server ${this._ip}:${this._port}${options_string};`
  }
}

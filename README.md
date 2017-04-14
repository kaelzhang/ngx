[![Build Status](https://travis-ci.org/kaelzhang/node-ngx.svg?branch=master)](https://travis-ci.org/kaelzhang/node-ngx)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-ngx?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-ngx)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/ngx.svg)](http://badge.fury.io/js/ngx)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/ngx.svg)](https://www.npmjs.org/package/ngx)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-ngx.svg)](https://david-dm.org/kaelzhang/node-ngx)
-->

# ngx

The Data-driven nginx configuration manager, featured:

- Resolved path calculation for `include`, `root`, and other directives.
- Nginx-style template engine and building system to reuse a template with several sets of data.
- Directive `include` with glob patterns, such as `include conf.d/**/*.conf;`

## Install

```sh
$ npm install -g ngx
```

## Usage

```sh
NGX_ENV=production ngx start
# or
ngx start --env production
```

For now, you can find the example at the [sample](https://github.com/kaelzhang/node-ngx/tree/master/sample) directory.

```sh
git clone git@github.com:kaelzhang/node-ngx.git
cd node-ngx
npm link
cd sample
ngx start --env production
```

And the nginx will start and you will find compiled nginx conf files at `sample/nginx` directory.

## Contributing

PRs or wishlists are welcome. Please be free to create an [issue](https://github.com/kaelzhang/node-ngx/issues/new).

## License

MIT

Cell Maps
===========

HTML5 systems biology tool

## Download code
```bash
git clone https://github.com/opencb/cell-maps.git
cd cell-maps/
git submodule update --init
```


## Compiling CSS and JavaScript

```bash
cd cell-maps/
```

### Install Node
To install node click [here.](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

**What is `npm`?** npm stands for [node packaged modules](http://npmjs.org/) is the node dependency manager.

### Install bower components and npm modules

```bash

sudo npm install -g bower
npm install
bower install
cd lib/jsorolla
bower install

### Run builder
npm run build
```
Minimized files will be located in the `/build` dir.

Cell Maps
===========

HTML5 systems biology tool

## Download code
```bash
git clone https://github.com/babelomics/bierapp.git
git submodule update --init
```


## Compiling CSS and JavaScript

```bash
cd bierapp-web/
```

### Install Node
To install node click [here.](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

**What is `npm`?** npm stands for [node packaged modules](http://npmjs.org/) is the node dependency manager.

### Install bower components and npm modules

```bash
sudo npm install -g bower
bower install
npm install
npm run build
```
Minimized files will be located in the `/build` dir.

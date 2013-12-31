Cellbrowser
===========
HTML5 systems biology tool

## Compiling CSS and JavaScript

Cellbrowser uses [Grunt](http://gruntjs.com/) task runner to build the code and run tests and other convenient tasks. 
To use it, install the required dependencies as directed and then run some Grunt commands. Grunt runs on top of Node.js, it must be installed first.

### Install Grunt

From the command line:

1. Install `grunt-cli` globally with `npm install -g grunt-cli`.
2. Navigate to the root `/` directory, then run `npm install`. npm will look at [package.json](package.json) and automatically install the necessary local dependencies listed there.

When completed, you'll be able to run the various Grunt commands provided from the command line.

**Unfamiliar with `npm`? Don't have node installed?** That's a-okay. npm stands for [node packaged modules](http://npmjs.org/) and is a way to manage development dependencies through node.js. [Download and install node.js](http://nodejs.org/download/) before proceeding.

[Node install help.](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager). 

### Available Grunt commands

#### Build - `grunt`
Run `grunt` to build Cellbrowser, compiled files will be located in the `/build` dir.

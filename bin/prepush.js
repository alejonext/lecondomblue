#!/usr/bin/env node

const fs 	= require('fs');
const path	= require('path');
var pack	= path.join(__dirname, '..', 'package.json');
var packageJSON = require(pack);
packageJSON.version = packageJSON.version.split('.');
packageJSON.version[2] = parseInt(packageJSON.version[2]);
packageJSON.version[2]++;
packageJSON.version = packageJSON.version.join('.');
packageJSON = JSON.stringify(packageJSON, null, '\t');
fs.writeFile(pack, packageJSON, function (err) {
	if(err) console.error(err);
	process.exit();
});
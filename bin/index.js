#!/bin/env node

GLOBAL.os		= require('os');
GLOBAL.fs		= require('fs');
GLOBAL.url		= require('url');
GLOBAL.sys		= require('sys');
GLOBAL.util		= require('util');
GLOBAL.path		= require('path');
GLOBAL.async	= require('async');
GLOBAL.moment	= require('moment');
GLOBAL._		= require('underscore');
GLOBAL._.str	= require('underscore.string');
GLOBAL.express	= require('express');

GLOBAL._.mixin(GLOBAL._.str.exports());

GLOBAL.packages = require('../package.json');

async.series({
	variables : function (callback) {
		console.log('Check Variables');
		// OPENSHIFT
		process.env.OPENSHIFT_APP_NAME = process.env.OPENSHIFT_APP_NAME || 'BLUE';
		process.env.OPENSHIFT_APP_UUID = process.env.OPENSHIFT_APP_UUID || 'BLAS';
		process.env.OPENSHIFT_DATA_DIR = process.env.OPENSHIFT_DATA_DIR || '';
		process.env.OPENSHIFT_MONGODB_DB_HOST = process.env.OPENSHIFT_MONGODB_DB_HOST || '127.0.0.1';
		process.env.OPENSHIFT_MONGODB_DB_PORT = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
		process.env.OPENSHIFT_NODEJS_IP = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
		process.env.OPENSHIFT_NODEJS_PORT = process.env.OPENSHIFT_NODEJS_PORT || 3000;

		// Render
		process.env.COMPRESS_RESP_CSS = process.env.COMPRESS_RESP_CSS || false;
		process.env.COMPRESS_RESP_JS = process.env.COMPRESS_RESP_JS || false;
		process.env.PUBLIC_DATA = path.join(process.env.OPENSHIFT_DATA_DIR, 'tmp');

		/*// KEYS
		if( _.isEmpty(process.env.FACEBOOK_ID) ) return callback(new Error('ID Facebook'));
		if( _.isEmpty(process.env.FACEBOOK_SECRET)) return callback(new Error('Secret Facebook'));
		if( _.isEmpty(process.env.GOOGLE_ID)) return callback(new Error('ID Google'));
		if( _.isEmpty(process.env.GOOGLE_SECRET)) return callback(new Error('Secret Google'));
		if( _.isEmpty(process.env.TWITTER_ID)) return callback(new Error('ID Twitter'));
		if( _.isEmpty(process.env.TWITTER_SECRET)) return callback(new Error('Secret Twitter'));
		*/
		process.env.FACEBOOK_ID='810919125631829';
		process.env.FACEBOOK_SECRET='cb6251203378258e00ffd17b6f4a7745';
		process.env.GOOGLE_ID='666666323660-qal4klork40h2vsb1duoks4pi0ujels6.apps.googleusercontent.com';
		process.env.GOOGLE_SECRET='5GOFhMZD-IEW8ie5Yd-DY7Kj';
		process.env.TWITTER_ID='J0dLhBsC7mUjAFOKe51dqKXjx';
		process.env.TWITTER_SECRET ='omdh6NbGwCA6AgYTt53wgq3HqCFhwCg8uecGzGUlvsGTtBV740';
		process.env.COINBASE_ID='J0dLhBsC7mUjAFOKe51dqKXjx';
		process.env.COINBASE_SECRET ='omdh6NbGwCA6AgYTt53wgq3HqCFhwCg8uecGzGUlvsGTtBV740';
		process.env.URL_DOMAIN ='localhost:3000';
		process.env.HTTPS_ACTIVE = '';
		process.env.COMPRESS_RESP_CSS='true';
		process.env.COMPRESS_RESP_JS='true';
		process.env.NODE_ENV='production';

		callback();
	},

	path : function (callback) {
		fs.exists(process.env.PUBLIC_DATA, function (exist) {
			if(exist) return callback();
			fs.mkdir(process.env.PUBLIC_DATA, callback);
		});
	},
	
	javascript : function(callback){
		console.log('Check Javascript');
		const browserify = require('browserify');
		const UglifyJS = require('uglifyjs');

		const javascript = path.join(__dirname, '..', 'public' );

		fs.readdir(javascript, function (err, files) {
			if(err) return callback(err);
			async.map(files, function (file, next) {
				if( !/\.js$/i.test(file) )
					return next();

				var b = browserify({
					entries: [  path.join(javascript, file) ],
					basedir: path.join(__dirname, '..' ),
					detectGlobals : true
				});
				var last = path.join(process.env.PUBLIC_DATA, file);
				try{
					b.bundle(function (err, src) {
						if(err) return next(err);
						if(false){ //  _.toBoolean(process.env.COMPRESS_RESP_JS)
							var result = UglifyJS.minify(src.toString(),{
								fromString : true,
								mangle : true
							});
							src = result.code;
						}
						fs.writeFile(last, src, function (err) {
							next(err);
						});
					});
				}catch(e){
					next(e);
				}
			}, callback);
		});
	},/*
	css: function(callback){
		console.log('Check Scss');
		const scss = path.join(__dirname, '..', 'public' ,'css');
		fs.readdir(scss, function (err, files) {
			if(err) return callback(err);
			async.map(files, function (file, next) {
				if( !/\.css$/i.test(file) )
					return next();
				fs.readFile( path.join(scss, file), function (err, data) {
					if (err) return next(err);
					fs.writeFile(path.join(process.env.PUBLIC_DATA, file), data, function (err, data) {
						next(err, data);
					});
				});
			}, callback);
		});
	},*/
	image: function(callback){
		console.log('Check Image');
		const image = path.join(__dirname, '..', 'public' ,'image');
		fs.readdir(image, function (err, files) {
			if(err) return callback(err);
			async.map(files, function (file, next) {
				if( !/\.(png|jpg|ico)$/i.test(file) )
					return next();
				fs.readFile( path.join(image, file), function (err, data) {
					if (err) return next(err);
					fs.writeFile(path.join(process.env.PUBLIC_DATA, file), data, function (err, data) {
						next(err, data);
					});
				});
			}, callback);
		});
	},
	server : function (callback) {
		console.log('Check Server');
		var server;
		try{
			server = require('../routes');
			callback(null, server);
		}catch(e){
			callback(e, server);
		}
	},/*
	process :function (callback) {
		console.log('Check Process');
		var error;
		try{
			var terminator = require('../lib/process');
			var list = [
				'SIGHUP',
				'SIGINT',
				'SIGQUIT',
				'SIGILL',
				'SIGTRAP',
				'SIGABRT',
				'SIGBUS',
				'SIGFPE',
				'SIGUSR1',
				'SIGSEGV',
				'SIGUSR2', 
				'SIGTERM' 
				// Removed 'SIGPIPE' from the list - bugz 852598.
			];
			process.on('exit', terminator );
			list.forEach(function(element, index, array) {
				process.on(element, terminator.bind(element) );
			});	
		}catch(e){
			error = e;
		}
		
		callback(error);
	}*/
}, function (err, results) {
	if(err || _.isEmpty(results.server)) 
		throw ( err || new Error('The server no exist') ).toString();
	
	results.server.listen(results.server.get('port'), results.server.get('ip'), function () {
		console.log('%s: Node server started on %s:%d ...', new Date(), results.server.get('ip'), results.server.get('port'));
	});
	
});
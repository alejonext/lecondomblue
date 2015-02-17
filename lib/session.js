const connect = require('./models');

var Session = require('express-session');
var db = new connect();

var session = function(options) {
	options = options || {};
	options.interval = setInterval( function () {
		db.session.AutoRemove();
	}, ( options.expire || 100000 ) * 3);
	Session.Store.call(this, options);
};

util.inherits(session,  Session.Store);

session.prototype.set = function (sid, data, fn) {
	delete data.isd;
	db.session.findMe(sid, function (err, doc){
		if(err) return fn(err);
		if(GLOBAL._.isEmpty(doc) ) {
			var doc = new db.session({
				sid : sid
			});
		}

		doc.expires = GLOBAL._.isEmpty(data.cookie) ? doc.lastAccess.setDate(doc.lastAccess.getDate() + 1): data.cookie._expires;
		doc.lastAccess = GLOBAL._.isEmpty( data.lastAccess ) ? new Date() : new Date(data.lastAccess);

		doc.data = GLOBAL._.clone(data);

		doc.save(function (err) {
			data.isd = doc._id.toString();
			fn(err, data);
		});
	});
};

session.prototype.get = function(sid, fn) {
	var data = null;
	db.session.findMe(sid, function (err, session){
		if( err || GLOBAL._.isEmpty(session) )
			return fn(err, data);
		data = GLOBAL._.clone(session.data);
		data.isd = session._id.toString();
		fn(null, data );
	});
};

session.prototype.destroy = function(sid, fn) {
	db.session.remove({
		sid: sid
	}, fn);
};

session.prototype.length = function(fn) {
	db.session.count({}, fn);
};

session.prototype.all = function(fn) {
	db.session.drop(fn);
};

session.prototype.clear = function(fn) {
	db.session.count({}, fn);
};

module.exports = session;
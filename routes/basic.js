module.exports.render = function (name) {
	return function (req, res) {
		res.status(202);
		res.locals.sessionId = req.sessionID;
		res.locals.session = req.session;
		res.locals.me = req.user;
		res.locals.login = _.isObject(req.user);
		if(req.session.bodys) res.locals.body = req.session.bodys;
		res.render(name || req.params.template);
	};
};

module.exports.text = function (name) {
	return function (req, res, next) {
		req.status(202);
		res.send( name );
	};
};

module.exports.login = function (name) {
	return function (req, res, next) {
		if(name && _.isEmpty(req.user)) return next(new Error('Not find'));
		next();
	};
};

module.exports.goToError = function (name, num) {
	return function (req, res, next) {
		if(!_.isString(name)) return next();
		var err = new Error(name);
		if(_.isNumber(num) ) err.status = num;
		next(err);
	};
};

module.exports.notFound = function (data, req, res, next) {
	console.log(data.toString());
	if(util.isError(data))
		return next(data);

	var goTos = new Error('Not found');
	goTos.url = req.url;
	goTos.status = 404;

	next(goTos);
};

module.exports.error = function (data, req, res, next) {
	res.status(data.status || 500);
	res.format({
		text : function(){
			res.send(data.toString());
		},
		json : function(){
			res.send({ error : data });
		},
		html : function() {
			res.render('error', { error: data });
		}
	});
};

module.exports.redirect = function (req, res) {
	res.redirect('/');
};

module.exports.sends  = function (name) {
	return function (data, req, res) {
		var jsons = {};
		jsons[name] = data;
		res.send(jsons);
	};
};

module.exports.create = function (req, res, next) {
	res.locals.SECURE = 'http' + process.env.HTTPS_ACTIVE + '://';
	res.locals.URL_DOMAIN = process.env.URL_DOMAIN;
	req.urlServer = res.locals.SECURE;
	next();
};
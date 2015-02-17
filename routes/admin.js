var db = new ( require('../lib/models') );
var router = express();
var orders = router.route('/order/:id');
var product = router.route('/product/:id');

router.use(function (req, res, next) {
	if(!req.user || !req.user.admin)
		return next(new Error('Not found'));
	req.query.page = parseFloat(req.query.page);
	req.query.page = _.isNull(req.query.page) ? 0 : req.query.page;
	next();
});

router.get('/', function (req, res, next) {
	res.redirect('/order');
});

router.get('/order', function (req, res, next) {
	var now = moment();
	db.baucher.findAdmin({
		goNow : {
			$gte : now.add('day', -3).startof('day'),
			$lte : now.add('day', -3).endof('day'),
		}
	}, req.page ).populate('').exec(function (err, doc) {
		if(err) return next(err);
		res.render('table-orders', { data : doc });
	});
});

router.post('/order', function (req, res, next) {
	var nuevoOrden = new db.baucher(req.body);
	nuevoOrden.save(function (err) {
		if(err) return next(err);
		res.redirect('/order/' + nuevoOrden._id );
	});
});

router.get('/product', function (req, res, next) {
	db.products.find({}, function (err, doc) {
		if(err) return next(err);
		res.render('table-products', { data : doc });
	});
});

router.post('/product', function (req, res, next) {
	var nuevoOrden = new db.products(req.body);
	nuevoOrden.save(function (err) {
		if(err) return next(err);
		res.redirect('/product/' + nuevoOrden._id );
	});
});

orders.all(function (req, res, next) {
	db.baucher.findById(req.params.id, function (err, doc) {
		if(err || _.isEmpty(doc) ) return next(err || new Error('Dont found'));
		next(doc);
	});
});

orders.get(function (data, req, res, next) {
	if(util.isError(data))
		return next(data);
	res.render('ordrer-admin', data );
});

orders.post(function (data, req, res, next) {
	if(util.isError(data))
		return next(data);
	db.baucher.findByIdAndUpdate(data._id, req.body, function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

orders.put(function (data, req, res, next) {
	if(util.isError(data))
		return next(data);
	data.public = !data.public;
	data.save(function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

orders.delete(function (data, req, res, next) {
	if(util.isError(data))
		return next(data);
	data.remove(function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

product.all(function (req, res, next) {
	db.products.findById(req.params.id, function (err, doc) {
		if(err || _.isEmpty(doc) ) return next(err || new Error('Dont found'));
		next(doc);
	});
});

product.get(function (req, res, next) {
	if(util.isError(data))
		return next(data);
	res.render('product-admin', data );
});

product.post(function (data, req, res, next) {
	if(util.isError(data))
		return next(data);
	db.products.findByIdAndUpdate(data._id, req.body, function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

product.put(function (req, res, next) {
	if(util.isError(data))
		return next(data);
	data.public = !data.public;
	data.save(function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

product.delete(function (req, res, next) {
	if(util.isError(data))
		return next(data);
	data.remove(function (err) {
		if(err) return next(err);
		res.redirect('back');
	});
});

module.exports = router;
module.exports.url = '/admin';
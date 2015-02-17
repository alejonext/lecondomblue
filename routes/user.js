const routes = require('../public/json/routes.json');
const basic = require('./basic');
const pays = require('../public/json/pay.json').pay;
var coinbase = new ( require('coinbase') )({
	APIKey: process.env.COINBASE_ID,
	APISecret: process.env.COINBASE_SECRET
});
var paypal = require('paypal-rest-sdk');
var api = express();
var visual = express();
var pagos = express();

paypal.configure({
	'mode': 'sandbox', //sandbox or live
	'client_id': process.env.PAYPAL_ID,
	'client_secret': process.env.PAYPAL_SECRET
});

visual.param('session', function (req, res, next, valor ){
	var test = valor === req.sessionID ? null : new Error('Session no repsond base 32');
	next( test );
});

visual.param('template',function (req, res, next, valor ){
	fs.exists(path.join(__dirname, '..', 'views', valor + '.jade' ), function (exists) {
		next( exists ? null : new Error('No exist') );
	});
});

function orders (req, res, next) {
	db.orders.find({
		public : true,
		user : req.user._id
	}, function (err, doc) {
		next(err || doc);
	});
}

function visualisar (req, res, next) {
	var query = {
		_id : req.params.id,
		public : true
	};
	if(req.user) query.user = req.user._id;

	db.orders.findOne(query).populate('list').exec(function (err, doc) {
		next(err || doc);
	});
}

function crear (req, res, next) {
	var nuevaOrden = new db.orders(req.body);
	if(req.user)
		nuevaOrden.user = req.user;
	else
		if(_.isArray(req.session.bay))
			req.session.bay.push(nuevaOrden._id);
		else
			req.session.bay = [nuevaOrden._id];

	if( req.body.cada < 0 ){
		for (var i = req.body.cada; i >= 0; i--)
			nuevaOrden.goNow({
				date : moment().add(3, 'days').add( i, 'months').toDate()
			});
	} else {
		nuevaOrden.goNow({
			date : moment()
		});
	}
	nuevaOrden.save(function (err, doc) {
		if(err) return next(err);
		res.redirect('/pago/' + doc._id + '/pagar' );
	});
}

function pagar (doc, req, res, next) {
	if(util.isError(doc))
		return next(doc);
	var payment = _.clone( pays[ routes.pay[ doc.metodo ] ] )
	if(doc.metodo === 1){ //Paypal
		paypalPayment.transactions[0].amount.total = doc.total;
		paypalPayment.transactions[0].description = req.session.desc;
		paypalPayment.redirect_urls.return_url = "http://localhost:" + (config.port ? config.port : 3000) + "/orderExecute?order_id=" + order_id;
		paypalPayment.redirect_urls.cancel_url = "http://localhost:" + (config.port ? config.port : 3000) + "/?status=cancel&order_id=" + order_id;

		paypal.payment.create(Payment, {}, function (err, resp) {
			if(err || !order) return next(err || new Error('No respond'));
			var link = resp.links;
			for (var i = 0; i < link.length; i++) {
				if (link[i].rel === 'approval_url') {
					res.redirect(link[i].href);
				}
			}
		});
	}else if(doc.metodo === 2){ //PayuLatam

		
	}else if(doc.metodo === 3){ // Bitcoin
		payment.button.name =  "bla";
		payment.button.price_string = doc.total + '';
		payment.button.price_currency_iso = doc.currency;
		coinbase.orders.create(payment, function (err, data) {
			if(err || !order) return next(err || new Error('No respond'));
			res.redirect('');
		});
	} else{
		next(new Error('No exist the metoth'));
	}
}

visual.all('/:session.:template', basic.render());

pagos.get('/all', orders, basic.sends('order') );

pagos.post('/', crear );
pagos.post('/:id', visualisar, basic.sends('order') );
pagos.post('/:id/pagar', visualisar, pagar );
//pagos.post('/:metodo', devuelta);

visual.all(routes.user, basic.render('home'));

api.url = '/api';
pagos.url = '/pago';

module.exports = [ visual, api, pagos, require('./admin') ];
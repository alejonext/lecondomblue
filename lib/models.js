const mongo = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

var model = function () {
	var ObjectId = mongo.Schema.Types.ObjectId;
	var Mixed    = mongo.Schema.Types.Mixed;
	var urlObj   = {
		protocol : 'mongodb',
		slashes  : true,
		port     : process.env.OPENSHIFT_MONGODB_DB_PORT,
		hostname : process.env.OPENSHIFT_MONGODB_DB_HOST,
		pathname : process.env.OPENSHIFT_APP_NAME,
	};

	if( !_.isEmpty(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) &&  !_.isEmpty(process.env.OPENSHIFT_MONGODB_DB_USERNAME) )
		urlObj.auth = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

	this.connect = mongo.createConnection( url.format(urlObj) );

	var UserSchema = new mongo.Schema({
		public   : { type : Boolean, required : true, default : true },
		admin    : { type : Boolean, required : true, default : false },
		uid      : { type : String, trim : true, required : true, unique : true, index : true },
		secret   : { type : String, trim : true },
		token    : { type : String, trim : true, required : true },
		provider : { type : String, trim : true, required : true, index : true },
		data     :  Mixed
	});

	var SessionSchema = new mongo.Schema({
		public  : { type : Boolean, required : true, default : true },
		sid     : { type : String, required : true, unique : true, index : true },
		data    : Mixed,
		expires : { type : Date, index : true },
		lastAccess: { type: Date, index : { expires: parseInt(86400) * 1000 } },
	});

	var ProductSchema = new mongo.Schema({
		public   : { type : Boolean, required : true, default : true },
		principal: { type : Boolean, required : true, default : true },
		name     : { type : String, trim : true, required : true, unique : true },
		description: { type : String, trim : true, required : true },
		cantidad : { type : Number, Min : 0, default : 0, required : true },
		price    : { type : Number, Min : 0, default : 0, required : true },
		tax      : { type : Number, Min : 0, default : 0, required : true },
	});
	
	ProductSchema.virtual('quantity').get(function () {
		return '1';
	});

	ProductSchema.virtual('currency').get(function () {
		return 'COP';
	});

	ProductSchema.virtual('sku').get(function () {
		return this._id.toString();
	});

	ProductSchema.set('toJSON', {
		virtuals : true
	});

	var TrackerSchema = new mongo.Schema({
		public   : { type : Boolean, required : true, default : true },
		traker   : { type : String, trim : true },
		status   : { type : Number, Min : 0, default : 0, Max : 4 },
		date     : { type : Date, required : true, index : true, default : Date.now } // Tres dias adiconales
	});
	
	// 0) Pendiente - Falta de pago o no esta en fecha
	// 1) en alistamiento 
	// 2) En transporte
	// 3) despachado
	// 4) entregado en destino
	
	var SendsSchema = new mongo.Schema({
		public   : { type : Boolean, required : true, default : true },
		dCreate  : { type : Date, required : true, index : true, default : Date.now },
		dUpdate  : { type : Date, required : true, index : true, default : Date.now },
		metodo   : { type : Number, Min : 0, default : 0, Max : 4 },
		status   : { type : Number, Min : 0, default : 0, Max : 5 },
		user     : { type : ObjectId, ref: 'user' },
		total    : { type : Number, Min : 0, default : 0, required : true },
		list     : [ { type : ObjectId, ref: 'product', required : true } ],
		send     : {
			zip  : { type : Number, Min : 0, Max: 999999 },
			tel  : { type : Number, Min : 11111, Max: 3219999999, required : true },
			addr : { type : String, required : true },
			regs : { type : Number, Min : 1, default : 1, Max : 10000 },
			tos  : { type : String, required : true, trim : true },
			form : { type : String, required : true, trim : true }
		},
		goNow : [ TrackerSchema ]
	});

	SendsSchema.virtual('send.region').get(function () {
		return fuck[this.send.regs];
	});

	SendsSchema.virtual('send.municipio').get(function () {
		return fuck[this.send.regs];
	});

	SessionSchema.static('findMe', function (id, callback){
		return this.findOne({
			sid : id,
			//public : true
		}, callback);
	});

	SessionSchema.static('all', function (callback) {
		return this.find({}, 'sid expires', callback);
	});

	SessionSchema.static('AutoRemove', function () {
		this.find({
			'data.cart' : {
				$exists : false
			}
		}, function (err, docs) {
			if(err) console.error(err);
			GLOBAL.async.map(docs, function (item, callb){ 
				item.remove(callb);
			}, function (err) {
				if(err) console.log(err)
			});		
		});
	});

	SendsSchema.static('findByUser', function (id, callback) {
		return this.find({
			user : id
		}, callback);
	});

	SendsSchema.static('findAdmin', function (query, page) {
		return this.find(_.extend(query, {
			metodo : 5,
			is : false
		})).skip( page * 100 ).limit(100);
	});

	SendsSchema.on('presave', function (next) {
		if( this.status < 5 )
			this.send.date = moment().add('day', 3);
		next();
	});

	UserSchema.plugin(findOrCreate);

	model.prototype.user = this.connect.model('user' , UserSchema );
	model.prototype.product = this.connect.model('products' , ProductSchema );
	model.prototype.baucher = this.connect.model('baucher' , SendsSchema );
	model.prototype.session = this.connect.model('session' , SessionSchema );
};


module.exports = model;
const session = require('express-session');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const store = require('../lib/session.js');
const user =  require('./user');
const basic =  require('./basic');
const auth = require('../lib/user');

const urlCallback = '/auth/callback/';
var passport = auth(urlCallback);
var app = express();

app.set('title', 'Le Condom Blue');
app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP);
app.set('view engine', 'jade'); // Insertado engine de plantillas
app.set('views', path.join(__dirname, '..', 'views')); //Direcion de las plantillas
//app.enable('view cache');
//app.disable('verbose errors');
//app.use(require('compression')());
//app.use(morgan('combined',{
//	skip: function (req, res) { return res.statusCode < 400; }
//}));
app.use(morgan('dev'));
app.use(require('serve-favicon')(path.join(__dirname, '..', 'public', 'image', '16.ico')));
app.use('/public', express.static( process.env.PUBLIC_DATA));

app.use(require('cookie-parser')()); //Parerear Cookies
app.use(session({ //Sessiones
	secret  : process.env.OPENSHIFT_APP_UUID,
	key     : '_' + process.env.OPENSHIFT_APP_NAME,
	rolling : true,
	saveUninitialized : true,
	resave : true,
	store   : new store(),
	cookie  : {
		// TODO
		//secure: false
		//domain : 'http' + process.env.HTTPS_ACTIVE + '://' + process.env.URL_DOMAIN
		//httpOnly : true,
		//path : "*" 
	}
}));

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

app.use(passport.initialize());
app.use(passport.session());

app.use(require('flash')());
app.use(basic.create);

app.get('/sitemap.xml', basic.render('sitemap') );
app.get('/robots.txt', basic.text('robots') );
app.get('/humans.txt', basic.text('humans') );

for (var i = user.length - 1; i >= 0; i--){
	if( user[i].url )
		app.use(user[i].url, user[i]);
	else
		app.use(user[i]);
}

app.get('/auth/logout', function (req, res){
	req.logout();
	res.redirect('/');
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/google', passport.authenticate('google',{
	scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email']
}));

app.get( urlCallback + 'facebook', passport.authenticate('facebook'), basic.redirect);
app.get( urlCallback + 'twitter', passport.authenticate('twitter'), basic.redirect);
app.get( urlCallback + 'google', passport.authenticate('google'), basic.redirect);

app.all('/404', basic.goToError());
app.all('/403', basic.goToError('Not allowed!', 403));
app.all('/500', basic.goToError('keyboard cat!'));

app.use(basic.notFound);
app.use(basic.error);

module.exports = app;
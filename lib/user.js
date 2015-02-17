const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const connect = require('./models.js');
const secure = 'http' + process.env.HTTPS_ACTIVE + '://';

var db = new connect();
var passport = require('passport');

function make (tokens, tokenSecret, profile, done) {
	var data = _.clone(profile);
	_.extend(data, profile._json);

	delete data._raw;
	delete data._json;
	delete data.id;
	delete data.provider;

	db.user.findOrCreate({
		uid: profile.id,
		provider : profile.provider
	}, {
		token : tokens,
		secret : tokenSecret,
		data : data
	}, done);
}

module.exports = function (url) {
	passport.serializeUser(function (user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		db.user.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		clientID : process.env.FACEBOOK_ID,
		clientSecret: process.env.FACEBOOK_SECRET,
		callbackURL: secure+ process.env.URL_DOMAIN + url + 'facebook'
	}, make));

	passport.use(new TwitterStrategy({
		consumerKey: process.env.TWITTER_ID,
		consumerSecret: process.env.TWITTER_SECRET,
		callbackURL: secure + process.env.URL_DOMAIN + url + 'twitter'
	}, make ));

	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_ID,
		clientSecret: process.env.GOOGLE_SECRET,
		callbackURL: secure + process.env.URL_DOMAIN + url + 'google'
	}, make ));

	return passport;
};
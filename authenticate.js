var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.role==="admin"){
        next();
    }
    else{
        const error = new Error("You're not authorized to do this operation");
        error.statusCode = 403; //forbidden
        next(error);
    }
}

exports.verifyNurse = (req, res, next) => {
    if (req.user.role==="nurse"){
        next();
    }
    else{
        const error = new Error("You're not authorized to do this operation");
        error.statusCode = 403; //forbidden
        next(error);
    }
}

exports.verifyPatient = (req, res, next) => {
    if (req.user.role==="patient"){
        next();
    }
    else{
        const error = new Error("You're not authorized to do this operation");
        error.statusCode = 403; //forbidden
        next(error);
    }
}
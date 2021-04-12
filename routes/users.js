var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

const bodyParser = require('body-parser');
var User = require('../models/user');
var Nurse = require('../models/nurses');
var Patient = require('../models/patients');
var Robots = require('../models/robots');

router.use(bodyParser.json());
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )

router.post('/signup', (req, res, next) => {
    var U = new User({username: req.body.username, isActive: true})
    User.register(U,
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            }
        });
});

router.route('/createPatient')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions,
    //authenticate.verifyUser,authenticate.verifyAdmin,
    (req, res, next) => {
        User.register(new User({username: req.body.username, isActive: false, role: "patient"}),
            req.body.password, (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                } else {
                    if (req.body.firstname)
                        user.firstname = req.body.firstname;
                    if (req.body.lastname)
                        user.lastname = req.body.lastname;
                    if (req.body.phonenumber)
                        user.phonenumber = req.body.phonenumber;
                    const pat = new Patient({
                        description: req.body.description,
                        dateofBirth: req.body.dateofBirth,
                        allergies: req.body.allergies,
                        emergencyContact: req.body.emergencyContact,
                        bloodType: req.body.bloodType,
                        temperatures: []
                    })
                    pat.save();
                    user.patient = pat._id;
                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});
                            return;
                        }
                        passport.authenticate('local')(req, res, () => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({success: true, status: 'Registration Successful!'});
                        });
                    });
                }
            });
    });


router.route('/AssignRobot')
    .post((req, res, next) => {
        User.findOne({patient: req.body.patientId})
            .then((cp) => {
                console.log("is active ? " + cp.isActive)
                if (cp.isActive) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: "User already assigned"})
                } else {
                    User.findOneAndUpdate({patient: req.body.patientId}, {
                        isActive: true
                    })
                        .then(()=>{
                            //assign to robot
                            Robots.findOneAndUpdate({number: req.body.robotnumber}, {
                                patient: req.body.patientId,
                                isOccupied: true
                            })
                                .then(()=>{
                                    //send good request
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json({success: true, status: 'Assignment Successful!'});
                                },(err) => next(err))
                                .catch((err) => next(err));



                        },(err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));


    });
/*
router.route('/DeAssignRobot')
    .post( cors.corsWithOptions,(req, res, next) => {
        User.findOne({patient: req.body.patientId})
            .then((cp) => {
                console.log("is active ? " + cp.isActive)
                if (!cp.isActive) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: "User already assigned"})
                } else {
                    User.findOneAndUpdate({patient: req.body.patientId}, {
                        isActive: false
                    })
                        .then(()=>{
                            //assign to robot
                            Robots.findOneAndUpdate({number: req.body.robotnumber}, {
                                patient: null,
                                isOccupied: false
                            })
                                .then(()=>{
                                    //send good request
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json({success: true, status: 'Assignment Successful!'});
                                },(err) => next(err))
                                .catch((err) => next(err));



                        },(err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));


    });

 */


router.post('/createNurse',
    //authenticate.verifyUser,authenticate.verifyAdmin,
    (req, res, next) => {
        User.register(new User({username: req.body.username, isActive: true, role: "nurse"}),
            req.body.password, (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                } else {
                    if (req.body.firstname)
                        user.firstname = req.body.firstname;
                    if (req.body.lastname)
                        user.lastname = req.body.lastname;
                    if (req.body.phonenumber)
                        user.phonenumber = req.body.phonenumber;
                    const nur = new Nurse({
                        description: req.body.description
                    })
                    nur.save();
                    console.log("nurse saved")
                    user.nurse = nur._id;
                    console.log("id of nurse : " + user.nurse)


                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});
                            return;
                        }
                        passport.authenticate('local')(req, res, () => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({success: true, status: 'Registration Successful!'});
                        });
                    });
                    console.log("user saved")
                }
            });
    });
/*
router.post('/login', cors.corsWithOptions, (req, res, next) => {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});*/
router.post('/login', cors.corsWithOptions, (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, status: 'Login Unsuccessful!', err: info});
        }
        req.logIn(user, (err) => {
            if (err) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
            }
            var token = authenticate.getToken({_id: req.user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Login Successful!', token: token,userRole:user.role});
        });
    }) (req, res, next);
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT invalid!', success: false, err: info});
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT valid!', success: true, user: user});

        }
    }) (req, res);
});
router.route('/')
    .get(cors.cors, (req,res,next) => {
        User.find({})
            // Populate is used here to implement a foreign key-like mechanism (Mongoose population)
            // see https://mongoosejs.com/docs/populate.html
            //.populate('comments.author')
            .then((users) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

router.delete('/', (req, res, next) => {
    User.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});

router.route('/PatientIsNotActive')
    .get(cors.cors, (req,res,next) => {
        User.find({isActive:false, role:'patient'})
            .then((users) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = router;


var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');

const bodyParser = require('body-parser');
var User = require('../models/user');
var Nurse = require('../models/nurses');
var Patient = require('../models/patients');

router.use(bodyParser.json());

router.post('/signup',(req, res, next) => {
    var U=new User({username: req.body.username})
    User.register(U,
      req.body.password, (err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else {
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});
          });
        }
      });
});

router.post('/createPatient',
    //authenticate.verifyUser,authenticate.verifyAdmin,
    (req, res, next) => {
    User.register(new User({username: req.body.username,isActive:true,role:"patient"}),
        req.body.password, (err, user) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else {
                if (req.body.firstname)
                    user.firstname = req.body.firstname;
                if (req.body.lastname)
                    user.lastname = req.body.lastname;
                if (req.body.phonenumber)
                    user.phonenumber = req.body.phonenumber;
                // var pat= Patient.create(req.body);
                // user.patient=pat._id;

                const pat=new Patient({
                        description:req.body.description,
                        dateofBirth:req.body.dateofBirth,
                        allergies:req.body.allergies,
                        emergencyContact:req.body.emergencyContact,
                        bloodType:req.body.bloodType,
                        temperatures:[]
                })
                pat.save();
                user.patient=pat._id;

                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return ;
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

router.post('/createNurse', authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    User.register(new User({username: req.body.username,isActive:true,role:"nurse"}),
        req.body.password, (err, user) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else {
                if (req.body.firstname)
                    user.firstname = req.body.firstname;
                if (req.body.lastname)
                    user.lastname = req.body.lastname;
                if (req.body.phonenumber)
                    user.phonenumber = req.body.phonenumber;
                var N=new Nurse({
                    description:req.body.description
                })
                N.save();
                user.nurse=N._id;
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return ;
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

    router.post('/login', passport.authenticate('local'), (req, res) => {
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

    router.get('/',(req,res,next) => {
        User.find({})
            .then((users) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

        router.delete('/',(req, res, next) => {
            User.remove({})
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
        });

module.exports = router;


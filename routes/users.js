var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');

const bodyParser = require('body-parser');
var User = require('../models/user');
var Nurse = require('../models/nurses');
var Patient = require('../models/patients');
var Robots = require('../models/robots');

router.use(bodyParser.json());

router.post('/signup',(req, res, next) => {
    var U=new User({username: req.body.username,isActive:true})
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

                Robots.findOneAndUpdate({number: req.body.robotnumber}, {
                    patient: pat._id,
                    isOccupied: true
                }, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });

                // const filter = { number: req.body.robotnumber };
                // const update = {patient: pat._id,
                //              isOccupied: true };
                // let rob = Robots.findOneAndUpdate(filter, update);
                // rob.save();



                // Robots.findOneAndUpdate({number: req.body.robotnumber}, {
                //     $set: {
                //         patient: pat._id,
                //         isOccupied: true
                //     }
                // }, {new: true})

                // ({number: req.body.robotnumber})
                //     .then((robot)=>{
                //         robot.patient=pat._id;
                //         isOccupied=true
                //     })
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

router.post('/createNurse',
    //authenticate.verifyUser,authenticate.verifyAdmin,
    (req, res, next) => {
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
                    const nur=new Nurse({
                        description:req.body.description
                    })
                    nur.save();
                    console.log("nurse saved")
                    user.nurse=nur._id;
                    console.log("id of nurse : "+user.nurse)



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
                    console.log("user saved")
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


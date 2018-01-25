var express = require('express');
var jwt = require('jsonwebtoken');

var routes = function (User) {

    var userRouter = express.Router();


    userRouter.get('/setup', function (req, res) {

        // create a sample user
        var sampleUser = new User({
            name: 'Balraj Pote',
            password: 'Digital',            
            email: "test2@test.com",
            phone: "3435",
            gender: "female",
            avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/marcoramires/128.jpg",
            isEmployee: false
        });

        // save the sample user
        sampleUser.save(function (err) {
            if (err) throw err;

            console.log('User saved successfully');
            res.json({ success: true });
        });
    });

    userRouter.post('/Authenticate', function (req, res) {

        User.findOne({
            name: req.body.name
        }, function (err, user) {

            if (err)
                throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found' })
            }
            else if (user) {
                if (user.password != req.body.password) {
                    res.json({ success: false, message: 'Authentication failed. Wrong Password' })
                }
                else {
                    var token = jwt.sign(user, req.app.get('supersecret'), {
                        //expiresIn: 6000
                    });                  

                    res.json({
                        success: true,
                        message: 'Enjoy your Token',
                        token: token
                    });
                }
            }
        })
    });

    ////CORS Middleware
    //userRouter.use(function (req, res, next) {
    //    //Enabling CORS 
    //    res.header("Access-Control-Allow-Origin", "*");
    //    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    //    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    //    next();
    //});

    userRouter.use(function (req, res, next) {

        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        if (token) {

            jwt.verify(token, req.app.get('supersecret'), function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' + err});
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {

            return res.status(403).send({
                success: false,
                message: 'No token provided'
            });
        }        
    });

    userRouter.route('/')
        .get(function (req, res) {
            res.send('Welcome to my user API');
        });

    userRouter.route('/Users')
        .post(function (req, res) {
            var user = new User(req.body);
            user.save();
            res.status(201).send(user);
        })
        .get(function (req, res) {
            var query = {};
            if (req.query.gender) {
                query.gender = req.query.gender;
            }
            User.find(query, function (err, users) {
                if (err) {
                    res.status(500).send(err);
                }
                else
                    res.json(users);
            });
        });

    userRouter.use('/Users/:userId', function (req, res, next) {
        User.findById(req.params.userId, function (err, user) {
            if (err)
                res.status(500).send(err);
            else if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(404).send('No User found');
            }
        });
    })

    userRouter.route('/Users/:userId')
        .get(function (req, res) {
            res.json(req.user);
        })
        .put(function (req, res) {
            req.user.name = req.body.name;
            req.user.email = req.body.email;
            req.user.phone = req.body.phone;
            req.user.gender = req.body.gender;
            req.user.isEmployee = req.body.isEmployee;
            req.user.avatar = req.body.avatar;
            req.user.save(function (err) {
                if (err)
                    res.status(500).send(err);
                else
                    res.json(req.user);
            });
        })
        .patch(function (req, res) {
            if (req.body._id)
                delete req.body._id;

            for (var p in req.body) {
                req.user[p] = req.body[p];
            }
            req.user.save(function (err) {
                if (err)
                    res.status(500).send(err);
                else
                    res.json(req.user);
            });
        })
        .delete(function (req, res) {
            req.user.remove(function (err) {
                if (err)
                    res.status(500).send(err);
                else
                    res.status(204).send('User Deleted');
            });
        });        
    return userRouter;
};

module.exports = routes;
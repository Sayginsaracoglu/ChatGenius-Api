const mongoose = require('mongoose');
const bcrypt =require("bcryptjs");
const dotenv = require('dotenv');

/*CONFIG */
let Schema = mongoose.Schema;
dotenv.config();
let mongoDBConnectionString = process.env.MONGO_DB_CONNECTION_STRING;


let userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: String
});

let User;
//, { useNewUrlParser: true }
module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        bcrypt.hash(userData.password, 10).then(hash => {

            userData.password = hash;

            let newUser = new User(userData);

            newUser.save().then(() => {
                resolve("User " + userData.email + " successfully registered");  
            }).catch(err => {
                if (err.code == 11000) {
                    reject(`${userData.email} already taken`);
                } else {
                    reject("There was an error creating the user: " + err);
                }
            })
        }).catch(err => reject(err));
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {

        User.findOne({ email: userData.email })
            .exec()
            .then(user => {
                bcrypt.compare(userData.password, user.password).then(res => {
                    if (res === true) {
                        resolve(user);
                    } else {
                        reject("Incorrect password for user " + userData.userName);
                    }
                });
            }).catch(err => {
                reject("Unable to find user " + userData.userName);
            });
    });
};


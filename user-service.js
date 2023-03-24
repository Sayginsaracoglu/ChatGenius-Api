const mongoose = require('mongoose');
const bcryptjs =require("bcryptjs");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: String
});

module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString, { useNewUrlParser: true });

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
            bcryptjs.hash(userData.password,5).then((hashedData)=>{
                console.log(hashedData)
                userData.password=hashedData;

                let newUser = new User(userData);

                newUser.save((err) => {
                    if (err) {
                        if (err.code == 11000) {
                            reject("Email already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
    
                    } else {
                        resolve("User " + userData.email + " successfully registered");
                    }
                });
            });
    });
};


const mongoose = require('mongoose');

const url = process.env.URL

mongoose.connect(url);

const db = mongoose.connection;

db.on('open', (err) => {
    if(err){
        console.log("Database connection error");
    }else{
        console.log("Database is connected.......");
    }
})

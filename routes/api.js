/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});


// UNCOMMENT TO DELETE ALL DATA
/* MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
  if (err) return console.error(err);
  var books = db.db('test').collection('books');
  books.deleteMany({}, function (err, deleted) {
    if (err) return console.error(err);
    console.log(`complete delete successful: ${deleted.result.n} books deleted`);
    db.close();
  })
}); */

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentCount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.find({}).toArray(function (err, bookList) {
          if (err) return console.error(err);
          console.log(bookList);
          res.json(bookList);
          db.close();
        })
      });
      // res.send('/api/books.get responding');
    })

    .post(function (req, res) {
      var title = req.body.title;
      //response will contain new book object including at least _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.insertOne({ title: title, commentCount: 0 }, function (err, book) {
          if (err) return console.error(err);
          console.log(book.ops);
          res.json(book.ops);
          db.close();
        })
      });
      // res.send('/res/books.post responding');
    })

    .delete(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.deleteMany({}, function (err, deleted) {
          if (err) return console.error(err);
          // console.log(deleted.ops);
          res.send(`complete delete successful: ${deleted.result.n} books deleted`);
          db.close();
        })
        //if successful response will be 'complete delete successful'
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

    })

    .delete(function (req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });

};

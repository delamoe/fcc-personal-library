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
var checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

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

/* MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
  if (err) return console.error(err);
  var books = db.db('test').collection('books');
  books.insertOne({ title: 'Automatically Created Book for Functional Tests', commentCount: 0 }, function (err, book) {
    if (err) return console.error(err);
    console.log(`${book.insertedCount} test book inserted`);
    db.close();
  })
}) */

//TEST /api/books/:id
/* var id = '5dd2fa17d2b74325d0b8d671';
MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
  if (err) return console.error(err);
  var books = db.db('test').collection('books');
  books.findOne({_id: ObjectId(id) }, function (err, book) {
    if (err) return console.error(err);
    console.log(`/api/books/:id.get book: `, book);
    if (book === null) return console.error('Please check the book id is valid');
    console.log("_id: ", book._id);
    db.close();
  })
}) */

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
          // console.log(bookList);
          res.json(bookList);
          db.close();
        })
      });
      // res.send('/api/books.get responding');
    })

    .post(function (req, res) {
      // console.log(`req.body.title: `, req.body.title);
      // console.log(`req.body._id: `, req.body._id);
      if (req.body.title === undefined) return res.send('Please go back and provide a book title');
      //response will contain new book object including at least _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.insertOne(
          {
            _id: req.body._id,
            title: req.body.title,
            commentCount: 0
          }, function (err, book) {
            if (err) return console.error(err);
            // console.log(book.ops);
            res.json(book.ops);
            db.close();
          });
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
        });
        //if successful response will be 'complete delete successful'
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      if (!req.params.id.match(checkForHexRegExp))
        return res.send('Please check the book id is valid');
      else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
          if (err) return console.error(err);
          var books = db.db('test').collection('books');
          books.findOne({ _id: ObjectId(req.params.id) }, function (err, book) {
            if (err) return console.error(err);
            if (book === null) return res.send('Please check the book id is valid');
            res.json({ "_id": book._id, "title": book.title, "comments": book.comments });
            db.close();
          })
        })
      }
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      // console.log(` bookid: `, bookid);
      var comment = req.body.comment;
      // console.log(`comment: `, comment);
      if (!req.params.id.match(checkForHexRegExp))
        return res.send('Please check the book id is valid');
      else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
          if (err) return console.error(err);
          var books = db.db('test').collection('books');
          books.updateOne(
            { _id: ObjectId(req.params.id) },
            {
              $push: { comments: comment },
              $inc: { commentCount: +1 }
            },
            { upsert: true },
            function (err, book) {
              if (err) return console.error(err);
              if (book === null) return res.send('Please check the book id is valid');
              res.json({ "_id": book._id, "title": book.title, "comments": book.comments });
              db.close();
            });
        });
      }
    })

    .delete(function (req, res) {
      var bookid = req.params.id;
      // console.log(req.params.id);
      // console.log(req.params.id.match(checkForHexRegExp));
      if (!req.params.id.match(checkForHexRegExp))
        return res.send('no book exists');
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.deleteOne({ _id: bookid }, function (err, deleted) {
          if (err) return console.error(err);
          // console.log(deleted.result.n);
          if (deleted.result.n > 0) res.send(`delete successful`);
          else res.send('no book exists');
          db.close();
        });
      });
    });

};

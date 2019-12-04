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

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.find({}).toArray(function (err, bookList) {
          if (err) return console.error(err);
          res.json(bookList);
          db.close();
        })
      });
    })

    .post(function (req, res) {
      if (req.body.title === undefined) return res.send('Please go back and provide a book title');
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.insertOne(
          {
            _id: ObjectId(req.body._id),
            title: req.body.title,
            commentCount: 0
          }, function (err, book) {
            if (err) return console.error(err);
            res.json(book.ops);
            db.close();
          });
      });
    })

    .delete(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.deleteMany({}, function (err, deleted) {
          if (err) return console.error(err);
          res.send(`complete delete successful: ${deleted.result.n} books deleted`);
          db.close();
        });
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
            res.json({
              "_id": book._id,
              "title": book.title,
              "comments": book.comments,
              "commentCount": book.commentCount
            });
            db.close();
          });
        });
      }
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (!req.params.id.match(checkForHexRegExp))
        return res.send('Please check the book id is valid');
      else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
          if (err) return console.error(err);
          var books = db.db('test').collection('books');
          books.updateOne(
            { _id: ObjectId(bookid) },
            {
              $push: { comments: comment },
              $inc: { commentCount: 1 }
            });
          books.findOne({ _id: ObjectId(bookid) }, function (err, book) {
            if (err) return console.error(err);
            // console.log(book);
            if (book === null) return res.send("Please check the book id is valid");
            res.json({
              "_id": book._id,
              "title": book.title,
              "comments": book.comments,
              "commentCount": book.commentCount
            });
            db.close();
          });
        });
      }
    })

    .delete(function (req, res) {
      if (!req.params.id.match(checkForHexRegExp))
        return res.send('no book exists');
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, function (err, db) {
        if (err) return console.error(err);
        var books = db.db('test').collection('books');
        books.deleteOne({ _id: ObjectId(req.params.id) }, function (err, CommandResult) {
          if (err) return console.error(err);
          if (CommandResult.result.n > 0) res.send(`delete successful`);
          else res.send('no book exists');
          db.close();
        });
      });
    });

};

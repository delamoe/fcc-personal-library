/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    this.timeout(15000);
    var id = new require('mongodb').ObjectID();
    chai.request(server)
      .post('/api/books')
      .send(
        {
          _id: id,
          title: 'Functional Test GET EXAMPLE TEST'
        }
      )
      .end(function (err, res) {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentCount', 'Books in array should contain commentCount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */
  suite('Routing tests', function () {

    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', function (done) {
        this.timeout(15000);
        var id = new require('mongodb').ObjectID();
        chai.request(server)
          .post('/api/books')
          .send(
            {
              _id: id,
              title: 'Functional Test POST with Title'
            }
          )
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentCount', 'Books in array should contain commentCount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        this.timeout(15000);
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Please go back and provide a book title')
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        this.timeout(15000);
        var id = new require('mongodb').ObjectID();
        chai.request(server)
          .post('/api/books')
          .send(
            {
              _id: id,
              title: 'Test GET /api/books'
            }
          )
          .end(function (err, res) {
            chai.request(server)
              .get('/api/books')
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'response should be an array');
                assert.property(res.body[0], 'commentCount', 'Books in array should contain commentCount');
                assert.property(res.body[0], 'title', 'Books in array should contain title');
                assert.property(res.body[0], '_id', 'Books in array should contain _id');
                done();
              });
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        // this test implies two tests, I would make them unique
        // except for fcc requirement to keep tests in order
        this.timeout(15000);
        chai.request(server)
          // checking with an invalid _id: will error in ObjectId()
          .get(`/api/books/dtheryjh`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Please check the book id is valid')
          });
        chai.request(server)
          // checking with a incorrect valid unique _id
          .get(`/api/books/${new require('mongodb').ObjectID()}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Please check the book id is valid');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        this.timeout(15000);
        var id = new require('mongodb').ObjectID();
        chai.request(server)
          .post('/api/books')
          .send(
            {
              _id: id,
              title: 'Test GET /api/books/[id] with valid id in db'
            }
          )
          .end(function (err, res) {
            chai.request(server)
              .get('/api/books')
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'response should be an array');
                assert.property(res.body[0], 'commentCount', 'Books in array should contain commentCount');
                assert.property(res.body[0], 'title', 'Books in array should contain title');
                assert.property(res.body[0], '_id', 'Books in array should contain _id');
                done();
              });
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        this.timeout(15000);
        var id = new require('mongodb').ObjectID();
        chai.request(server)
          .post('/api/books')
          .send(
            {
              _id: id,
              title: 'Test POST /api/books/[id] with comment'
            }
          )
          .end(function (err, res) {
            chai.request(server)
              .post(`/api/books/${id}`)
              .send({ comment: 'A sample comment' })
              .end(function (err, res) {
                chai.request(server)
                  .get(`/api/books/${id}`)
                  .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.property(res.body, '_id', 'Books in array should contain _id');
                    assert.property(res.body, 'title', 'Books in array should contain title');
                    assert.property(res.body, 'comments', 'Books in array should contain comments');
                    assert.property(res.body, 'commentCount', 'Books in array should contain commentCount');
                    done();
                  });
              });
          });
      });
    });

    suite('Delete tests', function () {

      suite('DELETE /api/books with title => delete book object/expect book object', function () {

        test('Test DELETE /api/books with title', function (done) {
          // I'm not sure if this is supposed to pass when a book title is passed in
          // or fail because a book id was not used
          // I've set this to fail without a valid book id as per
          // 7. I can delete /api/books/{_id} to delete a book from the collection. Returned will be 'delete successful' if successful.
          // 8. If I try to request a book that doesn't exist I will get a 'no book exists' message.
          this.timeout(15000);
          var id = new require('mongodb').ObjectID();
          var bad_id = new require('mongodb').ObjectID();
          var title = 'Test DELETE /api/books with title';
          chai.request(server)
            .post('/api/books')
            .send(
              {
                _id: id,
                title: title
              }
            )
            .end(function (err, res) {
              chai.request(server)
                .delete(`/api/books/${bad_id}`)
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'no book exists');
                  done();
                });
            });
        });

        test('Test DELETE /api/books all books', function (done) {
          this.timeout(15000);
          chai.request(server)
            .delete('/api/books')
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.match(res.text, /complete delete successful: \d+ books deleted/);
              done();
            });
        });
      });
    });
  });
});

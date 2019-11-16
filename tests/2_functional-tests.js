/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  suite('POST /api/issues/{project} => object with issue data', function () {

    test('Every field filled in', function (done) {
      chai.request(server)
        .post('/api/issues/Functional Tests')
        .send({
          _id: 'Put_Test',
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          done();
        });
    });

    test('Required fields filled in', function (done) {
      chai.request(server)
        .post('/api/issues/Functional Tests')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/Functional Tests')
        .send({
          /* issue_title: 'Title',
          issue_text: 'text', 
          created_by: 'Functional Test - Missing required fields',*/
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Please go back and fill in all required fields')
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put('/api/issues/Functional Tests')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no updated field sent');
          done();
        })
    });

    test('One field to update', function (done) {
      chai.request(server)
        .put('/api/issues/Functional Tests')
        .query({ "issue_text": `issue text updated ${new Date()}` })
        .send(
          {
            "_id": "Put_Test"
          })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });


    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/Functional Tests')
        .query(
          {
            "issue_title": `issue_title updated ${new Date()}`,
            "created_by": `created_by updated ${new Date()}`
          })
        .send(
          {
            "_id": "Put_Test"
          })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/Functional Tests')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('One filter', function (done) {
      chai.request(server)
        .get('/api/issues/Functional Tests')
        .query({ "issue_title": "Title" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get('/api/issues/Functional Tests')
        .query({ "status_text": "In QA", "assigned_to": "Chai and Mocha" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/Functional Tests')
        .query({})
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, '_id error');
          done();
        });
    });

    test('Valid _id', function (done) {
      chai.request(server)
        .post('/api/issues/Functional Tests')
        .send({
          _id: "Test_Id1",
          issue_title: 'Test Delete',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        });
      chai.request(server)
        .delete('/api/issues/Functional Tests')
        .query({})
        .send(
          {
            "_id": "Test_Id1"
          })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'deleted Test_Id1');
          done();
        });
    });
  });

  // delete all issues after tests run
  // chai.request(server)
  //   .get('/api/issues/deleteProject/Functional Tests')
  //   .end();
});

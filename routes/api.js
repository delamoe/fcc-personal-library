/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

// not using
// var ObjectId = require('mongodb').ObjectID;

// needed for node to use .env file
// require('dotenv').config();

// using mongoose instead of MongoClient
var mongoose = require("mongoose");
var shortid = require("shortid");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// specify the shape of the data to be stored
var Issue = mongoose.model(
  "Issue",
  mongoose.Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_by: {
      type: String,
      required: true
    },
    assigned_to: {
      type: String,
      default: ''
    },
    status_text: {
      type: String,
      default: ''
    },
    created_on: {
      type: Number,
      default: new Date().getTime()
    },
    updated_on: {
      type: Number,
      default: new Date().getTime()
    },
    open: {
      type: Boolean,
      default: true
    }
  })
);

var Project = mongoose.model(
  "Project",
  mongoose.Schema({
    project_name: {
      type: String,
      required: true
    },
    issues: { type: [], Issue: [Issue] }
  })
);

// Ensure test data is not too big
Project.deleteMany({ project_name: 'Functional Tests' }).exec();

module.exports = function (app) {


  app.route('/api/issues/:project')

    // this .get will not filter dates properly
    .get(function (req, res) {
      var project_name = req.params.project.replace(/%20/g, ' ');
      // console.log(project_name);
      // console.log(`query: `, req.query);
      // var issues = [];
      var project = Project.findOne({ project_name: project_name }).exec().then(project => {
        // console.log(`project: `, project);
        if (project === null) return res.json([]);
        // filter for queries here
        // console.log(`query.open: `, typeof req.query.open);
        var issues = project.issues
          .filter(issue =>
            req.query.open === `${issue.open}` || req.query.open === undefined)
          .filter(issue =>
            req.query.issue_title === issue.issue_title || req.query.issue_title === undefined)
          .filter(issue =>
            req.query.issue_text === issue.issue_text || req.query.issue_text === undefined)
          .filter(issue =>
            req.query.created_by === issue.created_by || req.query.created_by === undefined)
          .filter(issue =>
            req.query.assigned_to === issue.assigned_to || req.query.assigned_to === undefined)
          .filter(issue =>
            req.query.status_text === issue.status_text || req.query.status_text === undefined);
        //********************************************
        // TODO:
        //      filter by dates
        res.json(issues);
      });
    })

    .post(function (req, res) {
      var project_name = req.params.project.replace(/%20/g, ' ');
      // console.log(`project_name: ${project_name}`);
      // console.log(`req.body: `, req.body);
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) return res.send('Please go back and fill in all required fields');
      var issue = new Issue({
        _id: req.body._id,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || ''
      });
      Project.updateOne(
        { project_name: project_name },
        { $push: { issues: { $each: [issue], $position: 0 } } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
        function (err, data) {
          if (err) return console.error(err);
          res.json(issue);
        })
    })

    .put(function (req, res) {
      var project_name = req.params.project.replace(/%20/g, ' ');
      // console.log(`query: `, typeof req.query, req.query);
      // console.log(`body: `, req.body);
      if (!req.body._id && Object.keys(req.query).length === 0)
        return res.send('no updated field sent');
      Project.findOne(
        {
          project_name: project_name,
          "issues._id": req.body._id
        }, function (err, project) {
          if (err) return console.error(err);
          var issue = project.issues.filter(issue => issue._id === req.body._id);
          var issue_title, issue_text, created_by, assigned_to, status_text;
          issue_title = req.query.issue_title === undefined ? issue[0].issue_title : req.query.issue_title;
          issue_text = req.query.issue_text === undefined ? issue[0].issue_text : req.query.issue_text;
          created_by = req.query.created_by === undefined ? issue[0].created_by : req.query.created_by;
          assigned_to = req.query.assigned_to === undefined ? issue[0].assigned_to : req.query.assigned_to;
          status_text = req.query.status_text === undefined ? issue[0].status_text : req.query.status_text;
          Project.updateOne(
            {
              project_name: project_name,
              "issues._id": req.body._id
            },
            {
              $set:
              {
                "issues.$.open": req.body.open === 'false' ? false : true,
                "issues.$.updated_on": new Date().getTime(),
                "issues.$.issue_title": issue_title,
                "issues.$.issue_text": issue_text,
                "issues.$.created_by": created_by,
                "issues.$.assigned_to": assigned_to,
                "issues.$.status_text": status_text
              }
            },
            function (err, issue) {
              if (err) {
                console.error(err);

                res.send('could not update');
              }
              // console.log(`issue: `, issue);
              res.send('successfully updated');
            })
        });
    })

    .delete(function (req, res) {
      var project_name = req.params.project.replace(/%20/g, ' ');
      // console.log(req.body);
      if (!req.body._id) return res.send('_id error');
      Project.updateOne(
        { project_name: project_name },
        { $pull: { issues: { _id: req.body._id } } },
        function (err, issue) {
          if (err) {
            console.error(err);
            res.send('could not delete ' + req.body._id);
          }
          // console.log(`issue: `, issue);
          res.send('deleted ' + req.body._id);
        });
    });

  app.route('/api/issues/deleteProject/:project')
    .get(function (req, res) {
      var project_name = req.params.project.replace(/%20/g, ' ');
      console.log(project_name);

      Project.deleteOne({ project_name: project_name }, function (err, project) {
        if (err) return console.error(err);
        console.log(project);
        res.send(`${project_name} successfully deleted.`);
      });
    });

};

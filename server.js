'use strict';

// from only git-glitch
const { execSync } = require('child_process')
const path = require('path')

var express     = require('express');
var bodyParser  = require('body-parser');
var app = express();

var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var helmet = require('helmet');

app.use(helmet.noSniff());
app.use(helmet.xssFilter());

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// git-glitch sync code KEEP ABOVE OTHER ROUTES
// **************************************************
app.post('/deploy', (request, response) => {
  if (request.query.secret !== process.env.SECRET) {
    response.status(401).send()
    return
  }
  
  if (request.body.ref !== 'refs/heads/glitch') {
    response.status(200).send('Push was not to glitch branch, so did not deploy.')
    return
  }
  
  const repoUrl = request.body.repository.git_url
  
  console.log('Fetching latest changes.')
  const output = execSync(
    `git checkout -- ./ && git pull -X theirs ${repoUrl} glitch && refresh`
    ).toString()
    console.log(output)
  response.status(200).send()
})
// **************************************************




//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// process.env.NODE_ENV = 'test';
console.log(`NODE_ENV: `, process.env.NODE_ENV);

const listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        var error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
})

//Start our server and tests!
/* app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
}); */

module.exports = app; //for testing

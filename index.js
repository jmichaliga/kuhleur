'use strict';

const Hapi = require('hapi');
const Good = require('good');
const _ = require('lodash');
const low = require('lowdb');

const db = low('db.json');

const server = new Hapi.Server();
server.connection({
  port: process.env.PORT ? process.env.PORT : 3000,
  host: 'localhost'
});

server.route({
  method: 'POST',
  path: '/applications',
  handler: function(req, res){
    let h = req.headers;
    let c = h.college;
    let n = h.name;
    let s = h.score;

    let dupe = db.get('applications')
      .find({ college: c, name: n })
      .size()
      .value()

    let pass = (c && n && s && dupe == 0) ? true : false; //valid format w/out duplicate;
    let data = {};
    let payload = {college: c, name: n, score: s};

    if(pass){
      data = {
        statusCode: 200,
        message: "Application submitted successfully"
      }
      db.get('applications')
        .push(payload)
        .last()
        .write()
    }else{
      data = {
        statusCode: 400,
        error: "Bad request",
        message:"Application already submitted for this college/name pair"
      }
    }

    res(data);
  }
});

server.route({
  method: 'GET',
  path: '/applicants',
  handler: function(req, res){

    let applicants = _.clone(db.get('applications')
      .groupBy('name')
      .value());

    res(applicants);
  }
});

server.route({
  method: 'GET',
  path: '/applicants/{name}',
  handler: function(req, res){

    let name = encodeURIComponent(req.params.name);
    let applications = _.clone(db.get('applications')
      .filter({'name': name})
      .value());

    let data = {
      name: name,
      applications: applications
    };

    res(data);
  }
});

server.route({
  method: 'GET',
  path: '/colleges',
  handler: function(req, res){

    let colleges = _.clone(db.get('applications')
      .groupBy('college')
      .value());

    res(colleges);
  }
});

server.route({
  method: 'GET',
  path: '/colleges/{name}',
  handler: function(req, res){

    let name = encodeURIComponent(req.params.name);
    let applications = _.clone(db.get('applications')
      .filter({'college': name})
      .value());

    let data = {
      college: name,
      applications: applications
    };

    res(data);
  }
});

server.route({
  method: 'POST',
  path: '/backup',
  handler: function(req, res){
    db.write('backup.json');
    res({statusCode: 200, message:'Backup successful'});
  }
});

db.defaults({
  applications: [
    {
        "college": "CompSci",
        "name": "Alice",
        "score": 100
    },
    {
        "college": "CompSci",
        "name": "Bob",
        "score": 80
    },
    {
        "college": "Business",
        "name": "Bob",
        "score": 90
    }
  ]
}).write();

server.register({
  register: Good,
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      }, {
        module: 'good-console'
      }, 'stdout']
    }
  }
}, (err) => {

  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start((err) => {

    if (err) {
        throw err;
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

'use strict';

const Hapi = require('hapi');
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

      // let applicants = db.get('applications')
      //   .map('name')
      //   .cloneDeep()
      //   .value();

      let applicants = _.clone(db.get('applications')
        .groupBy('name')
        .value());

      var apps = _.forEach(applicants, function(a){
        _.forEach(a, function(app){
          delete app.name
        });
      });

      res(apps);
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

      let apps = _.forEach(applications, function(a){delete a.name});

      let data = {
        name: name,
        applications: apps
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

      var apps = _.forEach(colleges, function(c){
        _.forEach(c, function(app){
          delete app.college
        });
      });

      res(apps);
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

      let apps = _.forEach(applications, function(a){delete a.college});
      //let apps = _.forEach(applications, function(a){_.omit(a, 'college')});

      let data = {
        college: name,
        applications: apps
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
    },
  ]
})
  .write()

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Boom = require('boom');
const uuid = require('uuid');
const _ = require('lodash');
const low = require('lowdb');

const db = low('db.json');

const server = new Hapi.Server();

let backupFile = process.env.BKUP ? process.env.BKUP : 'backup.json'
server.connection({
  port: process.env.PORT ? process.env.PORT : 3000,
  host: 'localhost'
});

/* Entry Model:

    {
        uid: string,
        hex: string,
        name: string,
        timestamp: datetime,
        user: string
    }

*/

server.route({
  method: 'POST',
  path: '/entries',
  handler: function(req, res){
    let h = req.headers;
    let x = h.hex;
    let n = h.name;
    let t = h.timestamp;

    let dupe = db.get('entries')
      .find({ hex: x, name: n })
      .size()
      .value()

    //let pass = (c && n && s && dupe == 0) ? true : false; //valid format w/out duplicate;
    let data = {};
    let payload = {hex: x, name: n, timestamp: t, user: '1'};

    //if(pass){
      data = {
        statusCode: 200,
        message: "Entry submitted successfully"
      }
      db.get('entries')
        .push(payload)
        .last()
        .write()
    // }else{
    //   data = Boom.badRequest("Entry already submitted for this college/name pair");
    // }

    res(data);
  }
});

server.route({
  method: 'GET',
  path: '/hexes',
  handler: function(req, res){

    let hexes = _.clone(db.get('entries')
      .groupBy('hex')
      .transform(function(result, hexes, x) {
        result[ x ] = _.map(hexes, function(h) {
          return _.omit(h, 'hex')
        });
      })
      .value());

    res(hexes);
  }
});

server.route({
  method: 'GET',
  path: '/hexes/{hex}',
  handler: function(req, res){

    let hex = encodeURIComponent(req.params.hex);
    let entries = _.clone(db.get('entries')
      .filter({'hex': hex})
      .transform(function(result, value, key) {
        result[key] = {name: value.name, timestamp: value.timestamp, user: value.user}
      }, [])
      .value());

    let data = {
      hex: hex,
      entries: entries
    };

    res(data);
  }
});

server.route({
  method: 'GET',
  path: '/names',
  handler: function(req, res){

    let names = _.clone(db.get('entries')
      .groupBy('name')
      .transform(function(result, names, x) {
        result[ x ] = _.map(names, function(n) {
          return _.omit(n, 'name')
        });
      })
      .value());

    res(names);
  }
});

server.route({
  method: 'GET',
  path: '/names/{name}',
  handler: function(req, res){

    let name = encodeURIComponent(req.params.name);
    let entries = _.clone(db.get('entries')
      .filter({'name': name})
      .transform(function(result, value, key) {
        result[key] = {hex: value.hex, timestamp: value.timestamp, user: value.user}
      }, [])
      .value());

    let data = {
      name: name,
      entries: entries
    };

    res(data);
  }
});

// server.route({
//   method: 'GET',
//   path: '/colleges',
//   handler: function(req, res){

//     let colleges = _.clone(db.get('applications')
//       .groupBy('college')
//       .transform(function(result, apps, i) {
//         result[i] = _.map(apps, function(app) {
//           return _.omit(app, 'college')
//         });
//       })
//       .value());

//     res(colleges);
//   }
// });

// server.route({
//   method: 'GET',
//   path: '/colleges/{name}',
//   handler: function(req, res){

//     let name = encodeURIComponent(req.params.name);
//     let applications = _.clone(db.get('applications')
//       .filter({'college': name})
//       .transform(function(result, value, key) {
//         result[key] = {name: value.name, score: value.score}
//       }, [])
//       .value());

//     let data = {
//       college: name,
//       applications: applications
//     };

//     res(data);
//   }
// });

server.route({
  method: 'POST',
  path: '/backup',
  handler: function(req, res){
    db.write(backupFile);
    res({statusCode: 200, message:'Backup successful'});
  }
});

db.defaults({
  entries: [
    {
        "hex": "FF0000",
        "name": "Red",
        "timestamp": +new Date(),
        "user": "Anon"
    },
    {
        "hex": "00FF00",
        "name": "Green",
        "timestamp": +new Date(),
        "user": "Anon"
    },
    {
        "hex": "0000FF",
        "name": "Blue",
        "timestamp": +new Date(),
        "user": "Anon"
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

'use strict';

const next = require('next');
const Hapi = require('hapi');
const Good = require('good');
const Boom = require('boom');
const uuid = require('uuid');
const _ = require('lodash');
const low = require('lowdb');
const { pathWrapper, defaultHandlerWrapper } = require('./next-wrapper');
const corsHeaders = require('hapi-cors-headers')

const db = low('/tmp/db.json');


const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const server = new Hapi.Server();

let backupFile = process.env.BKUP ? '/tmp/'+process.env.BKUP : '/tmp/backup.json'

server.connection({
  port: process.env.PORT ? process.env.PORT : 3000,
  host: 'localhost',
  routes: {
    cors: true
  }
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

  /* URL ROUTES */

  server.route({
    method: 'GET',
    path: '/a',
    handler: pathWrapper(app, '/a')
  });

  server.route({
    method: 'GET',
    path: '/b',
    handler: pathWrapper(app, '/b')
  });

  server.route({
    method: 'GET',
    path: '/{p*}', /* catch all route */
    handler: defaultHandlerWrapper(app)
  });

  /* API ENDPOINTS */

  server.route({
    method: 'POST',
    path: '/api/entries',
    handler: function(req, res){
      let h = req.headers;
      let x = h.hex;
      let n = h.name;
      let t = h.timestamp;
      let u = uuid.v4();

      let dupe = db.get('entries')
        .find({ hex: x, name: n })
        .size()
        .value()

      //let pass = (c && n && s && dupe == 0) ? true : false; //valid format w/out duplicate;
      let data = {};
      let payload = {uuid: u, hex: x, name: n, timestamp: t, user: '1'};

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
    path: '/api/hexes',
    handler: function(req, res){

      let hexes = _.clone(db.get('entries')
        .groupBy('hex')
        .map(function(items, hex){
          return {
            hex: hex,
            entries: _.map(items, function(h) {
              return _.omit(h, 'hex')
            })
          }
        })
        .value());

      res(hexes);
    }
  });

  server.route({
    method: 'GET',
    path: '/api/hexes/{hex}',
    handler: function(req, res){

      let hex = encodeURIComponent(req.params.hex);
      let entries = _.clone(db.get('entries')
        .filter({'hex': hex})
        .transform(function(result, value, key) {
          result[key] = {uuid: value.uuid, name: value.name, timestamp: value.timestamp, user: value.user}
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
    path: '/api/names',
    handler: function(req, res){

      let names = _.clone(db.get('entries')
        .groupBy('name')
        .map(function(items, name){
          return {
            name: name,
            entries: _.map(items, function(n) {
              return _.omit(n, 'name')
            })
          }
        })
        .value());

      res(names);
    }
  });

  server.route({
    method: 'GET',
    path: '/api/names/{name}',
    handler: function(req, res){

      let name = encodeURIComponent(req.params.name);
      let entries = _.clone(db.get('entries')
        .filter({'name': name})
        .transform(function(result, value, key) {
          result[key] = {uuid: value.uuid, hex: value.hex, timestamp: value.timestamp, user: value.user}
        }, [])
        .value());

      let data = {
        name: name,
        entries: entries
      };

      res(data);
    }
  });

  server.route({
    method: 'POST',
    path: '/api/backup',
    handler: function(req, res){
      db.write(backupFile);
      res({statusCode: 200, message:'Backup successful'});
    }
  });

  server.ext('onPreResponse', corsHeaders);

  server.start((err) => {
    if (err) {
        throw err;
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });

});




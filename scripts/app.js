(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("config/app", function(exports, require, module) {
var env, options;

env = require('config/environment');

if (env.get('isDevelopment')) {
  options = {
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: false,
    LOG_STACKTRACE_ON_DEPRECATION: true,
    LOG_BINDINGS: true,
    LOG_VIEW_LOOKUPS: true,
    LOG_ACTIVE_GENERATION: true
  };
  Ember.RSVP.configure('onerror', function(error) {
    var message;
    if (Ember.typeOf(error) === 'object') {
      message = (error != null ? error.message : void 0) || 'No error message';
      Ember.Logger.error("RSVP Error: " + message);
      Ember.Logger.error(error != null ? error.stack : void 0);
      return Ember.Logger.error(error != null ? error.object : void 0);
    } else {
      return Ember.Logger.error('RSVP Error', error);
    }
  });
  Ember.STRUCTURED_PROFILE = true;
  Ember.Logger.debug("Running in the %c" + (env.get('name')) + "%c environment", 'color: red;', '');
} else {
  options = {};
}

module.exports = Ember.Application.create(options);
});

;require.register("config/environment", function(exports, require, module) {
var Environment;

window.require.list().forEach(function(module) {
  if (new RegExp("^config/environments/").test(module)) {
    return require(module);
  }
});

Environment = Ember.Object.extend({
  isTest: Ember.computed.equal('name', 'test'),
  isDevelopment: Ember.computed.equal('name', 'development'),
  isProduction: Ember.computed.equal('name', 'production')
});

module.exports = Environment.create(window.TAPAS_ENV);
});

;require.register("config/router", function(exports, require, module) {
module.exports = App.Router.map(function() {});
});

;require.register("controllers/index", function(exports, require, module) {
module.exports = App.IndexController = Ember.ObjectController.extend({
  current_line: 'loading..',
  lines: [],
  isPlaying: false,
  speed: 50,
  init: function() {
    var context;
    context = this;
    return setTimeout(function() {
      return context.play();
    }, 200);
  },
  play: function() {
    var context;
    this.set('isPlaying', true);
    context = this;
    this.lines = this.get('content').split('\n');
    return this.updateLine();
  },
  pause: function() {
    return this.isPlaying = false;
  },
  updateLine: function() {
    var context;
    context = this;
    if (this.isPlaying) {
      if (this.get('current_line') === 'paused') {
        this.lines = this.get('content').split('\n');
      }
      this.set('current_line', this.lines.shift());
      this.lines.push(this.current_line);
    } else {
      this.set('current_line', 'paused');
    }
    return setTimeout(function() {
      return context.updateLine();
    }, this.speed);
  },
  updateContent: function() {
    return this.set('current_line', 'paused');
  }
});
});

;require.register("helpers/test", function(exports, require, module) {
Ember.Handlebars.helper('test', function(value, options) {});
});

;require.register("initialize", function(exports, require, module) {
var folderOrder;

window.App = require('config/app');

require('config/router');

folderOrder = ['initializers', 'utils', 'mixins', 'adapters', 'serializers', 'routes', 'models', 'views', 'controllers', 'helpers', 'templates', 'components'];

folderOrder.forEach(function(folder) {
  return window.require.list().filter(function(module) {
    return new RegExp("^" + folder + "/").test(module);
  }).forEach(function(module) {
    return require(module);
  });
});
});

;require.register("initializers/environment", function(exports, require, module) {
var env;

env = require('config/environment');

module.exports = Ember.Application.initializer({
  name: 'environment',
  initialize: function(container, application) {
    application.register('environment:main', env, {
      instantiate: false,
      singleton: true
    });
    return application.inject('controller', 'env', 'environment:main');
  }
});
});

;require.register("routes/index", function(exports, require, module) {
module.exports = App.IndexRoute = Ember.Route.extend({
  model: function() {
    return '>\n' + '=>\n' + '==>\n' + '===>\n' + '====>\n' + '=====>\n' + '======>\n' + '<======>\n' + ' <======>\n' + '  <======>\n' + '   <======>\n' + '    <======>\n' + '     <======>\n' + '      <======>\n' + '       <======>\n' + '        <======>\n' + '         <======>\n' + '          <======>\n' + '           <======>\n' + '            <======>\n' + '             <======>\n' + '              <======>\n' + '               <======>\n' + '                <======>\n' + '                 <======>\n' + '                  <======>\n' + '                   <======>\n' + '                    <======>\n' + '                     <======>\n' + '                      <======>\n' + '                      <======>\n' + '                     <========>\n' + '                    <==========>\n' + '                   <============>\n' + '                <==================>\n' + '             <========================>\n' + '          <==============================>\n' + '             <========================>\n' + '                <==================>\n' + '                   <============>\n' + '                    <==========>\n' + '                     <========>\n' + '                      <======>\n' + '                      <======>\n' + '                      <======>\n' + '                       <======>\n' + '                        <======>\n' + '                         <======>\n' + '                          <======>\n' + '                           <======>\n' + '                            <======>\n' + '                             <======>\n' + '                              <======>\n' + '                               <======>\n' + '                                <======>\n' + '                                 <======>\n' + '                                  <======>\n' + '                                   <======>\n' + '                                    <======>\n' + '                                     <======>\n' + '                                      <======>\n' + '                                       <======>\n' + '                                        <======>\n' + '                                         <======>\n' + '                                          <======>\n' + '                                           <======>\n' + '                                            <======>\n' + '                                             <======\n' + '                                              <=====\n' + '                                               <====\n' + '                                                <===\n' + '                                                 <==\n' + '                                                  <=\n' + '                                                   <\n';
  }
});
});

;require.register("templates/application", function(exports, require, module) {
module.exports = Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
});

;require.register("templates/index", function(exports, require, module) {
module.exports = Ember.TEMPLATES['index'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<h2>Text Scroller</h2>\n<h4>Created by <a href='http://nickbusey.com/' target='_new'>Nick Busey</a>.</h4>\n<p>\n	I used to make elaborate text files in Notepad.exe, which I would shrink to only show one line at a time, and hold the down arrow to make low budget animations. Here's a webapp designed to recreate that experience.\n</p>\n<p>\n	Just update the Text Area, then click anywhere else to get the animation to update.\n</p>\n<p>\n	Playing: ");
  hashContexts = {'type': depth0,'name': depth0,'checked': depth0};
  hashTypes = {'type': "STRING",'name': "STRING",'checked': "ID"};
  options = {hash:{
    'type': ("checkbox"),
    'name': ("isPlaying"),
    'checked': ("isPlaying")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<br/>\n	Speed (milliseconds): ");
  hashContexts = {'value': depth0};
  hashTypes = {'value': "ID"};
  options = {hash:{
    'value': ("speed")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n</p>\n<p>\n	");
  hashContexts = {'value': depth0,'disabled': depth0,'size': depth0};
  hashTypes = {'value': "ID",'disabled': "BOOLEAN",'size': "INTEGER"};
  options = {hash:{
    'value': ("current_line"),
    'disabled': (true),
    'size': (50)
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("<br />\n</p>\n<p>\n	");
  hashContexts = {'value': depth0,'rows': depth0,'cols': depth0,'focus-out': depth0};
  hashTypes = {'value': "ID",'rows': "INTEGER",'cols': "INTEGER",'focus-out': "STRING"};
  options = {hash:{
    'value': ("content"),
    'rows': (300),
    'cols': (50),
    'focus-out': ("updateContent")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.textarea || (depth0 && depth0.textarea)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("\n</p>\n");
  return buffer;
  
});
});

;require.register("config/environments/development", function(exports, require, module) {
window.TAPAS_ENV = {
  name: 'development'
};
});

;
//# sourceMappingURL=app.js.map
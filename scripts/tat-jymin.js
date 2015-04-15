/**
 * This file is used in conjunction with Jymin to form the Tat client.
 *
 * If you're already using Jymin, you can use this file with it.
 * Otherwise use ../tat-client.js which includes the required Jymin functions.
 *
 * @use jymin/jymin.js
 */

/**
 * Tat is a function that accepts new tags.
 *
 * @param {String}   tagName   A custom HTML tag name.
 * @param {Function} template  A template function used to generate HTML.
 */
var Tat = window.Tat = function (tagName, template) {
  Tat._registerTag(tagName, template);
  Tat._tags[tagName] = template;
};

/**
 * Keep a map of custom tags by tag name.
 *
 * @type {Object}
 */
Tat._tags = {
  '$': function(v){return (!v&&v!==0?'':(typeof v=='object'?Jymin.stringify(v)||'':''+v)).replace(/</g,'&lt;');},
  '&': function(v){return Jymin.escape(!v&&v!==0?'':''+v);},
  '%': function(v){return Jymin.attrify(v);}
};

/**
 * Register a new custom tag.
 *
 * @param {String}   tagName   A custom HTML tag name.
 * @param {Function} template  A template function used to generate HTML.
 */
Tat._registerTag = function (tagName, template) {
  if (document.registerElement) {
    document.registerElement(tagName, {
      prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
          value: function () {
            Tat._populateElement(this, template);
          }
        }
      })
    });
  }
  else if (!Tat._fallback) {
    function populate(element) { // jshint ignore:line
      var tag = Jymin.getTag(element);
      var template = Tat._tags[tag];
      if (template) {
        Tat._populateElement(element, template);
      }
    }
    Tat._fallback = function (readyElement) {
      Jymin.all(readyElement, '*', populate);
    };
    Jymin.onReady(Tat._fallback);
    Jymin.bind(document, 'DOMNodeInserted', function (element, event, target) {
      Tat._fallback = Jymin.doNothing;
      populate(target);
    });
  }
};

/**
 * Populate HTML into a custom element by rendering a template.
 *
 * @param {HTMLElement} element   An HTML element to populate.
 * @param {Function}    template  A template function used to generate HTML.
 */
Tat._populateElement = function (element, template) {
  if (!element._template) {

    // Get the element's innerHTML, and use it to initialize its state.
    var html = Jymin.getHtml(element);
    var state = {
      html: html,
      data: Tat._parseValue(html)
    };

    // Add each attribute to the state.
    Jymin.forEach(element.attributes, function (pair) {
      var name = pair.name;
      var value = Jymin.getAttribute(element, name);
      state[name] = Tat._parseValue(value);
    });

    // Save what we need for rendering, and render.
    element._state = state;
    element._template = template;
    element._update = Tat._proto._update;
    element._render = Tat._proto._render;
    element._render();
  }
};

Tat._proto = {};

/**
 * Decorate an element's state with new data, and re-render it.
 *
 * @param  {Object} data  Properties and values to decorate the state.
 * @return {HTMLElement}
 */
Tat._proto._update = function (data) {
  var self = this;
  Jymin.decorateObject(self._state, data);
  self._render();
  return self;
};

Tat._renders = {};

/**
 * Render an element's HTML, and if it's different from before, set it.
 * TODO: DOM diff.
 */
Tat._proto._render = function () {
  var self = this;
  var html = self._template.call(Tat._tags, self._state);
  if (html != self._renderedHtml) {

    // TODO: Remove this because it's just for debugging.
    var tag = Jymin.getTag(self);
    Tat._renders[tag] = (Tat._renders[tag] || 0) + 1;

    Tat._diff(self, html);
    Jymin.setHtml(self, html);
    self._renderedHtml = html;
    if (document._isReady || Tat._fallback) {
      Jymin.ready(self);
    }
  }
  return self;
};

/**
 * Set HTML by DOM diffing.
 *
 * @return {[type]} [description]
 */
Tat._diff = function (element, html) {
  var virtual = Jymin.createElement('div', html);
  // TODO: Actually write this shit.
},

/**
 * Evaluate a value as non-strict JSON if it looks object or array notation.
 *
 * @param  {String} value  A string to parse.
 * @return {String}        The resulting string or object.
 */
Tat._parseValue = function (value) {
  // If it starts with a brace or bracket, assume JSON.
  if (/^\s*[\{\[]/.test(value)) {
    // Try to parse the value, but on failure, use the value as a string.
    value = Jymin.parse(value, value);
  }
  return value;
};

/**
 * Listen for state changes on a list of events.
 *
 * @param  {String|Array} events  A list of events.
 */
Tat._listenForStateEvents = function (events) {
  Jymin.on('state', events, function (parent, event, element) {
    if (/^(button|input|select|textarea)$/.test(Jymin.getTag(element))) {
    }
  });
};

/**
 * Bind to state changes.
 */
Tat._listenForStateEvents('blur,change,click,copy,cut,' +
  'drag,dragenter,dragleave,dragover,dragstart,drop,' +
  'focus,keydown,keypress,keyup,mousedown,mousemove,' +
  'mouseout,mouseover,mousewheel,paste,scroll,submit,select');

/**
 * Store a map of Tat elements for various purposes:
 * - Active form elements.
 * - Last clicked element.
 *
 * @type {Object}
 */
Tat._elements = {};

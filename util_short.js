function log(msg) {}

var STRING_empty = '';

var CSS_display = 'display';
var CSS_position = 'position';

var TYPE_boolean = 'boolean';
var TYPE_number = 'number';
var TYPE_object = 'object';
var TYPE_string = 'string';
var TYPE_function = 'function';
var TYPE_undefined = 'undefined';

function jsEval(expr) {
  try {
    return eval('[' + expr + '][0]');
  } catch (e) {
    log('EVAL FAILED ' + expr + ': ' + e);
    return null;
  }
}

function jsLength(obj) {
  return obj.length;
}

function assert(obj) {}

function copyProperties(to, from) {
  for (var p in from) {
    to[p] = from[p];
  }
}

function getDefaultObject(value, defaultValue) {
  if (typeof value != TYPE_undefined && value != null) {
    return (value);
  } else {
    return defaultValue;
  }
}

function isArray(value) {
  return value != null && typeof value == TYPE_object && typeof value.length == TYPE_number;
}

function arraySlice(array, start, opt_end) {
  return Function.prototype.call.apply(Array.prototype.slice, arguments);
}

function parseInt10(s) {
  return parseInt(s, 10);
}

function arrayClear(array) {
  array.length = 0;
}

function bindFully(object, method, var_args) {
  var args = arraySlice(arguments, 2);
  return function () {
    return method.apply(object, args);
  };
}

var DOM_ELEMENT_NODE = 1;
var DOM_ATTRIBUTE_NODE = 2;
var DOM_TEXT_NODE = 3;
var DOM_CDATA_SECTION_NODE = 4;
var DOM_ENTITY_REFERENCE_NODE = 5;
var DOM_ENTITY_NODE = 6;
var DOM_PROCESSING_INSTRUCTION_NODE = 7;
var DOM_COMMENT_NODE = 8;
var DOM_DOCUMENT_NODE = 9;
var DOM_DOCUMENT_TYPE_NODE = 10;
var DOM_DOCUMENT_FRAGMENT_NODE = 11;
var DOM_NOTATION_NODE = 12;

function domGetElementById(document, id) {
  return document.getElementById(id);
}

function domCreateElement(doc, name) {
  return doc.createElement(name);
}

function domTraverseElements(node, callback) {
  var traverser = new DomTraverser(callback);
  traverser.run(node);
}

function DomTraverser(callback) {
  this.callback_ = callback;
}

DomTraverser.prototype.run = function (root) {
  var me = this;
  me.queue_ = [root];
  while (jsLength(me.queue_)) {
    me.process_(me.queue_.shift());
  }
}

DomTraverser.prototype.process_ = function (node) {
  var me = this;
  me.callback_(node);
  for (var c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType == DOM_ELEMENT_NODE) {
      me.queue_.push(c);
    }
  }
}

function domGetAttribute(node, name) {
  return node.getAttribute(name);
}

function domSetAttribute(node, name, value) {
  node.setAttribute(name, value);
}

function domRemoveAttribute(node, name) {
  node.removeAttribute(name);
}

function domCloneNode(node) {
  return node.cloneNode(true);
}

function domCloneElement(element) {
  return (domCloneNode(element));
}

function ownerDocument(node) {
  if (!node) {
    return document;
  } else if (node.nodeType == DOM_DOCUMENT_NODE) {
    return (node);
  } else {
    return node.ownerDocument || document;
  }
}

function domCreateTextNode(doc, text) {
  return doc.createTextNode(text);
}

function domAppendChild(node, child) {
  return node.appendChild(child);
}

function displayDefault(node) {
  node.style[CSS_display] = '';
}

function displayNone(node) {
  node.style[CSS_display] = 'none';
}

function positionAbsolute(node) {
  node.style[CSS_position] = 'absolute';
}

function domInsertBefore(newChild, oldChild) {
  return oldChild.parentNode.insertBefore(newChild, oldChild);
}

function domReplaceChild(newChild, oldChild) {
  return oldChild.parentNode.replaceChild(newChild, oldChild);
}

function domRemoveNode(node) {
  return domRemoveChild(node.parentNode, node);
}

function domRemoveChild(node, child) {
  return node.removeChild(child);
}

function stringTrim(str) {
  return stringTrimRight(stringTrimLeft(str));
}

function stringTrimLeft(str) {
  return str.replace(/^\s+/, "");
}

function stringTrimRight(str) {
  return str.replace(/\s+$/, "");
}

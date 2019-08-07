// short version of jstemplate.js
var ATT_select = 'jsselect';
var ATT_instance = 'jsinstance';
var ATT_display = 'jsdisplay';
var ATT_values = 'jsvalues';
var ATT_vars = 'jsvars';
var ATT_eval = 'jseval';
var ATT_transclude = 'transclude';
var ATT_content = 'jscontent';
var ATT_skip = 'jsskip';

var ATT_jstcache = 'jstcache';

var PROP_jstcache = '__jstcache';

var STRING_jsts = 'jsts';

var CHAR_asterisk = '*';
var CHAR_dollar = '$';
var CHAR_period = '.';
var CHAR_ampersand = '&';
var STRING_div = 'div';
var STRING_id = 'id';
var STRING_asteriskzero = '*0';
var STRING_zero = '0';

function jstProcess(context, template, opt_debugging) {
  var processor = new JstProcessor;
  JstProcessor.prepareTemplate_(template);

  processor.document_ = ownerDocument(template);
  processor.run_(bindFully(processor, processor.jstProcessOuter_, context, template));
}

function JstProcessor() {}

JstProcessor.jstid_ = 0;
JstProcessor.jstcache_ = {};
JstProcessor.jstcache_[0] = {};
JstProcessor.jstcacheattributes_ = {};
JstProcessor.attributeValues_ = {};
JstProcessor.attributeList_ = [];

JstProcessor.prepareTemplate_ = function (template) {
  if (!template[PROP_jstcache]) {
    domTraverseElements(template, function (node) {
      JstProcessor.prepareNode_(node);
    });
  }
};

var JST_ATTRIBUTES = [
  [ATT_select, jsEvalToFunction],
  [ATT_display, jsEvalToFunction],
  [ATT_values, jsEvalToValues],
  [ATT_vars, jsEvalToValues],
  [ATT_eval, jsEvalToExpressions],
  [ATT_transclude, jsEvalToSelf],
  [ATT_content, jsEvalToFunction],
  [ATT_skip, jsEvalToFunction]
];

JstProcessor.prepareNode_ = function (node) {

  if (node[PROP_jstcache]) {
    return node[PROP_jstcache];
  }

  var jstid = domGetAttribute(node, ATT_jstcache);
  if (jstid != null) {
    return node[PROP_jstcache] = JstProcessor.jstcache_[jstid];
  }
  var attributeValues = JstProcessor.attributeValues_;
  var attributeList = JstProcessor.attributeList_;
  attributeList.length = 0;

  for (var i = 0, I = jsLength(JST_ATTRIBUTES); i < I; ++i) {
    var name = JST_ATTRIBUTES[i][0];
    var value = domGetAttribute(node, name);
    attributeValues[name] = value;
    if (value != null) {
      attributeList.push(name + "=" + value);
    }
  }

  if (attributeList.length == 0) {
    domSetAttribute(node, ATT_jstcache, STRING_zero);
    return node[PROP_jstcache] = JstProcessor.jstcache_[0];
  }

  var attstring = attributeList.join(CHAR_ampersand);
  if (jstid = JstProcessor.jstcacheattributes_[attstring]) {
    domSetAttribute(node, ATT_jstcache, jstid);
    return node[PROP_jstcache] = JstProcessor.jstcache_[jstid];
  }

  var jstcache = {};

  for (var i = 0, I = jsLength(JST_ATTRIBUTES); i < I; ++i) {
    var att = JST_ATTRIBUTES[i];
    var name = att[0];
    var parse = att[1];
    var value = attributeValues[name];
    if (value != null) {
      jstcache[name] = parse(value);
    }
  }
  jstid = STRING_empty + ++JstProcessor.jstid_;
  domSetAttribute(node, ATT_jstcache, jstid);
  JstProcessor.jstcache_[jstid] = jstcache;
  JstProcessor.jstcacheattributes_[attstring] = jstid;
  return node[PROP_jstcache] = jstcache;
};

JstProcessor.prototype.run_ = function (f) {

  var me = this;
  var calls = me.calls_ = [];
  var queueIndices = me.queueIndices_ = [];
  var arrayPool = me.arrayPool_ = [];

  f();

  var queue, queueIndex;
  var method, arg1, arg2;
  var temp;

  while (calls.length) {
    queue = calls[calls.length - 1];
    queueIndex = queueIndices[queueIndices.length - 1];
    if (queueIndex >= queue.length) {
      me.recycleArray_(calls.pop());
      queueIndices.pop();
      continue;
    }

    method = queue[queueIndex++];
    arg1 = queue[queueIndex++];
    arg2 = queue[queueIndex++];
    queueIndices[queueIndices.length - 1] = queueIndex;
    method.call(me, arg1, arg2);
  }
};

JstProcessor.prototype.push_ = function (args) {
  this.calls_.push(args);
  this.queueIndices_.push(0);
};

JstProcessor.prototype.setDebugging = function (debugging) {};

JstProcessor.prototype.createArray_ = function () {
  if (this.arrayPool_.length) {
    return this.arrayPool_.pop();
  } else {
    return [];
  }
};

JstProcessor.prototype.recycleArray_ = function (array) {
  arrayClear(array);
  this.arrayPool_.push(array);
};

JstProcessor.prototype.jstProcessOuter_ = function (context, template) {

  var me = this;
  var jstAttributes = me.jstAttributes_(template);
  var transclude = jstAttributes[ATT_transclude];

  if (transclude) {
    var tr = jstGetTemplate(transclude);
    if (tr) {
      domReplaceChild(tr, template);
      var call = me.createArray_();
      call.push(me.jstProcessOuter_, context, tr);
      me.push_(call);
    } else {
      domRemoveNode(template);
    }
    return;
  }
  var select = jstAttributes[ATT_select];
  if (select) {
    me.jstSelect_(context, template, select);
  } else {
    me.jstProcessInner_(context, template);
  }
};

JstProcessor.prototype.jstProcessInner_ = function (context, template) {

  var me = this;
  var jstAttributes = me.jstAttributes_(template);
  var display = jstAttributes[ATT_display];

  if (display) {
    var shouldDisplay = context.jsexec(display, template);
    if (!shouldDisplay) {
      displayNone(template);
      return;
    }
    displayDefault(template);
  }

  var values = jstAttributes[ATT_vars];
  if (values) {
    me.jstVars_(context, template, values);
  }

  values = jstAttributes[ATT_values];

  if (values) {
    me.jstValues_(context, template, values);
  }

  var expressions = jstAttributes[ATT_eval];
  if (expressions) {
    for (var i = 0, I = jsLength(expressions); i < I; ++i) {
      context.jsexec(expressions[i], template);
    }
  }
  var skip = jstAttributes[ATT_skip];
  if (skip) {
    var shouldSkip = context.jsexec(skip, template);
    if (shouldSkip) return;
  }

  var content = jstAttributes[ATT_content];
  if (content) {
    me.jstContent_(context, template, content);
  } else {

    var queue = me.createArray_();
    for (var c = template.firstChild; c; c = c.nextSibling) {
      if (c.nodeType == DOM_ELEMENT_NODE) {
        queue.push(me.jstProcessOuter_, context, c);
      }
    }
    if (queue.length) { me.push_(queue); }
  }
};

JstProcessor.prototype.jstSelect_ = function (context, template, select) {
  var me = this;
  var value = context.jsexec(select, template);

  var instance = domGetAttribute(template, ATT_instance);
  var instanceLast = false;

  if (instance) {
    if (instance.charAt(0) == CHAR_asterisk) {
      instance = parseInt10(instance.substr(1));
      instanceLast = true;
    } else {
      instance = parseInt10((instance));
    }
  }

  var multiple = isArray(value);
  var count = multiple ? jsLength(value) : 1;
  var multipleEmpty = (multiple && count == 0);

  if (multiple) {
    if (multipleEmpty) {

      if (!instance) {
        domSetAttribute(template, ATT_instance, STRING_asteriskzero);
        displayNone(template);
      } else {
        domRemoveNode(template);
      }
    } else {
      displayDefault(template);

      if (instance === null || instance === STRING_empty || (instanceLast && instance < count - 1)) {

        var queue = me.createArray_();
        var instancesStart = instance || 0;
        var i, I, clone;

        for (i = instancesStart, I = count - 1; i < I; ++i) {
          var node = domCloneNode(template);
          domInsertBefore(node, template);
          jstSetInstance((node), value, i);
          clone = context.clone(value[i], i, count);
          queue.push(me.jstProcessInner_, clone, node, JsEvalContext.recycle, clone, null);
        }

        jstSetInstance(template, value, i);
        clone = context.clone(value[i], i, count);
        queue.push(me.jstProcessInner_, clone, template, JsEvalContext.recycle, clone, null);
        me.push_(queue);
      } else if (instance < count) {
        var v = value[instance];
        jstSetInstance(template, value, instance);
        var clone = context.clone(v, instance, count);
        var queue = me.createArray_();
        queue.push(me.jstProcessInner_, clone, template, JsEvalContext.recycle, clone, null);
        me.push_(queue);
      } else {
        domRemoveNode(template);
      }
    }
  } else {
    if (value == null) {
      displayNone(template);
    } else {
      displayDefault(template);
      var clone = context.clone(value, 0, 1);
      var queue = me.createArray_();
      queue.push(me.jstProcessInner_, clone, template, JsEvalContext.recycle, clone, null);
      me.push_(queue);
    }
  }
};

JstProcessor.prototype.jstVars_ = function (context, template, values) {
  for (var i = 0, I = jsLength(values); i < I; i += 2) {
    var label = values[i];
    var value = context.jsexec(values[i + 1], template);
    context.setVariable(label, value);
  }
};

JstProcessor.prototype.jstValues_ = function (context, template, values) {
  for (var i = 0, I = jsLength(values); i < I; i += 2) {

    var label = values[i];
    var value = context.jsexec(values[i + 1], template);

    if (label.charAt(0) == CHAR_dollar) {

      context.setVariable(label, value);

    } else if (label.charAt(0) == CHAR_period) {

      var nameSpaceLabel = label.substr(1).split(CHAR_period);
      var nameSpaceObject = template;
      var nameSpaceDepth = jsLength(nameSpaceLabel);

      for (var j = 0, J = nameSpaceDepth - 1; j < J; ++j) {
        var jLabel = nameSpaceLabel[j];
        if (!nameSpaceObject[jLabel]) {
          nameSpaceObject[jLabel] = {};
        }
        nameSpaceObject = nameSpaceObject[jLabel];
      }
      nameSpaceObject[nameSpaceLabel[nameSpaceDepth - 1]] = value;
    } else if (label) {

      if (typeof value == TYPE_boolean) {

        if (value) {
          domSetAttribute(template, label, label);
        } else {
          domRemoveAttribute(template, label);
        }
      } else {
        domSetAttribute(template, label, STRING_empty + value);
      }
    }
  }
};

JstProcessor.prototype.jstContent_ = function (context, template, content) {

  var value = STRING_empty + context.jsexec(content, template);

  if (template.innerHTML == value) {
    return;
  }
  while (template.firstChild) {
    domRemoveNode(template.firstChild);
  }
  var t = domCreateTextNode(this.document_, value);
  domAppendChild(template, t);
};

JstProcessor.prototype.jstAttributes_ = function (template) {
  if (template[PROP_jstcache]) {
    return template[PROP_jstcache];
  }
  var jstid = domGetAttribute(template, ATT_jstcache);
  if (jstid) {
    return template[PROP_jstcache] = JstProcessor.jstcache_[jstid];
  }
  return JstProcessor.prepareNode_(template);
};

function jstGetTemplate(name, opt_loadHtmlFn) {

  var doc = document;
  var section;

  if (opt_loadHtmlFn) {
    section = jstLoadTemplateIfNotPresent(doc, name, opt_loadHtmlFn);
  } else {
    section = domGetElementById(doc, name);
  }
  if (section) {
    JstProcessor.prepareTemplate_(section);
    var ret = domCloneElement(section);
    domRemoveAttribute(ret, STRING_id);
    return ret;
  } else {
    return null;
  }
}

function jstGetTemplateOrDie(name, opt_loadHtmlFn) {
  var x = jstGetTemplate(name, opt_loadHtmlFn);
  check(x !== null);
  return (x);
}

function jstLoadTemplateIfNotPresent(doc, name, loadHtmlFn, opt_target) {
  var section = domGetElementById(doc, name);
  if (section) {
    return section;
  }

  jstLoadTemplate_(doc, loadHtmlFn(), opt_target || STRING_jsts);
  var section = domGetElementById(doc, name);
  if (!section) {
    log("Error: jstGetTemplate was provided with opt_loadHtmlFn, " + "but that function did not provide the id '" + name + "'.");
  }
  return (section);
}

function jstLoadTemplate_(doc, html, targetId) {

  var existing_target = domGetElementById(doc, targetId);
  var target;

  if (!existing_target) {
    target = domCreateElement(doc, STRING_div);
    target.id = targetId;
    displayNone(target);
    positionAbsolute(target);
    domAppendChild(doc.body, target);
  } else {
    target = existing_target;
  }
  var div = domCreateElement(doc, STRING_div);
  target.appendChild(div);
  div.innerHTML = html;
}

function jstSetInstance(template, values, index) {
  if (index == jsLength(values) - 1) {
    domSetAttribute(template, ATT_instance, CHAR_asterisk + index);
  } else {
    domSetAttribute(template, ATT_instance, STRING_empty + index);
  }
}

JstProcessor.prototype.logState_ = function (caller, template, jstAttributeValues) {};

JstProcessor.prototype.getLogs = function () {
  return this.logs_;
};

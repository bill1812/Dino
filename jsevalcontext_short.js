var VAR_index = '$index';
var VAR_count = '$count';
var VAR_this = '$this';
var VAR_context = '$context';
var VAR_top = '$top';

var GLOB_default = '$default';

var CHAR_colon = ':';
var REGEXP_semicolon = /\s*;\s*/;

function JsEvalContext(opt_data, opt_parent) {
  this.constructor_.apply(this, arguments);
}

JsEvalContext.prototype.constructor_ = function (opt_data, opt_parent) {
  var me = this;

  if (!me.vars_) {
    me.vars_ = {};
  }
  if (opt_parent) {

    copyProperties(me.vars_, opt_parent.vars_);
  } else {

    copyProperties(me.vars_, JsEvalContext.globals_);
  }
  me.vars_[VAR_this] = opt_data;
  me.vars_[VAR_context] = me;
  me.data_ = getDefaultObject(opt_data, STRING_empty);

  if (!opt_parent) {
    me.vars_[VAR_top] = me.data_;
  }
};

JsEvalContext.globals_ = {};

JsEvalContext.setGlobal = function (name, value) {
  JsEvalContext.globals_[name] = value;
};

JsEvalContext.setGlobal(GLOB_default, null);
JsEvalContext.recycledInstances_ = [];

JsEvalContext.create = function (opt_data, opt_parent) {
  if (jsLength(JsEvalContext.recycledInstances_) > 0) {
    var instance = JsEvalContext.recycledInstances_.pop();
    JsEvalContext.call(instance, opt_data, opt_parent);
    return instance;
  } else {
    return new JsEvalContext(opt_data, opt_parent);
  }
};

JsEvalContext.recycle = function (instance) {
  for (var i in instance.vars_) {
    delete instance.vars_[i];
  }
  instance.data_ = null;
  JsEvalContext.recycledInstances_.push(instance);
};

JsEvalContext.prototype.jsexec = function (exprFunction, template) {
  try {
    return exprFunction.call(template, this.vars_, this.data_);
  } catch (e) {
    log('jsexec EXCEPTION: ' + e + ' at ' + template + ' with ' + exprFunction);
    return JsEvalContext.globals_[GLOB_default];
  }
};

JsEvalContext.prototype.clone = function (data, index, count) {
  var ret = JsEvalContext.create(data, this);
  ret.setVariable(VAR_index, index);
  ret.setVariable(VAR_count, count);
  return ret;
};

JsEvalContext.prototype.setVariable = function (name, value) {
  this.vars_[name] = value;
};

JsEvalContext.prototype.getVariable = function (name) {
  return this.vars_[name];
};

JsEvalContext.prototype.evalExpression = function (expr, opt_template) {
  var exprFunction = jsEvalToFunction(expr);
  return this.jsexec(exprFunction, opt_template);
};

var STRING_a = 'a_';
var STRING_b = 'b_';
var STRING_with = 'with (a_) with (b_) return ';

JsEvalContext.evalToFunctionCache_ = {};

function jsEvalToFunction(expr) {
  if (!JsEvalContext.evalToFunctionCache_[expr]) {
    try {

      JsEvalContext.evalToFunctionCache_[expr] = new Function(STRING_a, STRING_b, STRING_with + expr);
    } catch (e) {
      log('jsEvalToFunction (' + expr + ') EXCEPTION ' + e);
    }
  }
  return JsEvalContext.evalToFunctionCache_[expr];
}

function jsEvalToSelf(expr) {
  return expr;
}

function jsEvalToValues(expr) {

  var ret = [];
  var values = expr.split(REGEXP_semicolon);
  for (var i = 0, I = jsLength(values); i < I; ++i) {
    var colon = values[i].indexOf(CHAR_colon);
    if (colon < 0) {
      continue;
    }
    var label = stringTrim(values[i].substr(0, colon));
    var value = jsEvalToFunction(values[i].substr(colon + 1));
    ret.push(label, value);
  }
  return ret;
}

function jsEvalToExpressions(expr) {
  var ret = [];
  var values = expr.split(REGEXP_semicolon);
  for (var i = 0, I = jsLength(values); i < I; ++i) {
    if (values[i]) {
      var value = jsEvalToFunction(values[i]);
      ret.push(value);
    }
  }
  return ret;
}

function model(args){
  return new Model(args);
}

function Model(args){
  this.valueCore;
  this.listeners;
  args = args || {};
  this.value = args.initial;
  if(args.value !== undefined){
    this.value = args.value;
  }
  if(typeof args.listener === "function"){
    this.listen(args.listener);
  }
  if(typeof args.onchange === "function"){
    this.onchange(args.onchange);
  }
}

sk.Model = Model;

Model.prototype.isSkModel = true;

Model.prototype.set = function(val, upstream){
  var self = this, i;
  var event = {
    target: self,
    value: val,
  }
  this.valueCore = event.value;
  for (i in this.listeners){
    this.listeners[i](event);
  }
}

Model.prototype.get = function(){
  return this.valueCore;
}

Model.prototype.listen = function(handler){
  if(!this.listeners){
    this.listeners = [];
  }
  if(typeof handler === 'function'){
    this.listeners.push(handler);
    handler({
      value: this.value,
    }, [this]);
  }
};
Model.prototype.onvalue = Model.prototype.listen;

Model.prototype.onchange = function(handler){
  if(!this.listeners){
    this.listeners = [];
  }
  if(typeof handler === 'function'){
    this.listeners.push(handler);
  }
};
Model.prototype.onvalue = Model.prototype.listen;

Object.defineProperty(Model.prototype, 'value', {
  get: function(){
    return this.get();
  },
  set: function(val){
    this.set(val);
  },
});

Model.prototype.true = function(listener){
  if(typeof listener === "function"){
    this.listen(function(e){
      if(Boolean(e.val)){
        listener(Boolean(e.val));
      }
    });
  }
  else{
    this.value = true;
  }
}

Model.prototype.false = function(listener){
  if(typeof listener === "function"){
    this.listen(function(e){
      if(!Boolean(e.val)){
        listener(Boolean(e.val));
      }
    });
  }
  else{
    this.value = false;
  }
}

Model.prototype.prop = function(prop, val){
  var self = this;
  this.value[prop] = val;
  this.set(this.value);
  this.listeners.forEach(function(handler){
    handler(self.value, [self]);
  });
};
Model.prototype.property = Model.prototype.prop;

function withAnyDo(value, callback){
  if(value.isSkModel){
    value.listen(function(e){
      var val = e.value;
      callback(val);
    });
  }
  else{
    callback(value);
  }
}

function withNumberDo(value, callback){
  if(value instanceof Model){
    value.listen(function(e){
      var val = e.value;
      callback(Number(val));
    });
  }
  else{
    if (typeof callback === "function"){
      callback(Number(value));
    }
  }
}

function withStringDo(value, callback){
  if(typeof callback !== "function" || value == null){
    return;
  }
  if(value instanceof Model){
    value.listen(function(e){
      var val = e.value;
      callback(String(val));
    });
  }
  else{
    if (typeof callback === "function"){
      callback(String(value));
    }
  }
}

function withBooleanDo(value, callback){
  if(value instanceof Model){
    value.listen(function(e){
      var val = e.value;
      callback(Boolean(val));
    });
  }
  else{
    if (typeof callback === "function"){
      callback(Boolean(value));
    }
  }
}

sk.model = model;
sk.withBooleanDo = withBooleanDo;
sk.bool = withBooleanDo;
sk.withStringDo = withStringDo;
sk.str = withStringDo;
sk.withNumberDo = withNumberDo;
sk.num = withNumberDo;
sk.withAnyDo = withAnyDo;
sk.any = withAnyDo;
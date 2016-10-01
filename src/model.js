function model(args){
  return new Model(args);
}

function Model(args){
  this.valueCore;
  this.listeners = [];
  this.filters = [];

  this.init(args);
}

sk.Model = Model;

Model.prototype.set = function(arg1, arg2, arg3){
  var self = this;
  var values = [];
  var customUpstream, filter, val;
  if(arguments.length >= 3){
    for (var i=0; i<arguments.length-2; i++){
      values.push(arguments[i]);
    }
    if(typeof arguments[arguments.length-2] === "function"){
      filter = arguments[arguments.length-2];
      customUpstream = arguments[arguments.length-1];
    }
    else{
      values.push(arguments[arguments.length-2]);
      filter = arguments[arguments.length-1];
    }
  }
  else{
    values.push(arg1);
    if(typeof arg2 === "function"){
      filter = arg2;
    }
    else {
      customUpstream = arg2;
    }
  }
  values.forEach(function(value){
    if(value instanceof Model){
      value.listen(function(val, upstream){
        upstream = upstream.concat(customUpstream);
        if(upstream && upstream.indexOf(self) !== -1){
          return;
        }
        if(typeof filter === "function"){
          val = filter.apply(this, values.map(function(value){
            if(value instanceof Model){
              return value.get();
            }
            else{
              return value;
            }
          }));
        }
        self.setValue(val, upstream);
      });
    }
  });
  if(typeof filter === "function"){
    val = filter.apply(this, values.map(function(value){
      if(value instanceof Model){
        return value.get();
      }
      else{
        return value;
      }
    }));
  }
  else{
    if(arg1 instanceof Model){
      val = arg1.get();
    }
    else{
      val = arg1;
    }
  }
  self.setValue(val, customUpstream);
}

Model.prototype.setValue = function(val, upstream){
  var self = this;
  for (var i in this.filters){
    val = this.filters[i](val);
  }
  // if(this.valueCore === val){
  //   return;
  // }
  this.valueCore = val;
  if(upstream == null){
    upstream = [self];
  }
  else{
    upstream.push(self);
  }
  this.listeners.forEach(function(handler){
    handler(self.value, upstream);
  });
}

Model.prototype.get = function(){
  return this.valueCore;
}

Model.prototype.bind = function(arg1, upstreamFilter, downstreamFilter){
  if(arg1 instanceof Model){
    this.set(arg1, upstreamFilter);
    //arg1.set(this, downstreamFilter);
    this.listen(function(val, upstream){
      if(upstream && upstream.indexOf(arg1) !== -1){
        return;
      }
      if(typeof downstreamFilter === "function"){
        val = downstreamFilter(val);
      }
      arg1.setValue(val, upstream);
    });
  }
  else{
    this.set(arg1, upstreamFilter);
  }
}
Model.prototype.sync = Model.prototype.bind;

Model.prototype.init = function(args){
  args = args || {};
  if(args.value !== undefined){
    this.value = args.value;
  }
  if(typeof args.listener === "function"){
    this.listen(args.listener);
  }
  if(typeof args.onchange === "function"){
    this.onchange(args.onchange);
  }
  if(typeof args.filter === "function"){
    this.filter(args.filter);
  }
}

Model.prototype.listen = function(handler){
  if(typeof handler === 'function'){
    this.listeners.push(handler);
    handler(this.get(), [this]);
  }
};
Model.prototype.onvalue = Model.prototype.listen;

Model.prototype.onchange = function(handler){
  if(typeof handler === 'function'){
    this.listeners.push(handler);
  }
};
Model.prototype.onvalue = Model.prototype.listen;

Model.prototype.filter = function(handler){
  if(typeof handler === 'function'){
    this.filters.push(handler);
  }
};

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
    this.listen(function(val){
      if(Boolean(val)){
        listener(Boolean(val));
      }
    });
  }
  else{
    this.value = true;
  }
}

Model.prototype.false = function(listener){
  if(typeof listener === "function"){
    this.listen(function(val){
      if(!Boolean(val)){
        listener(Boolean(val));
      }
    });
  }
  else{
    this.value = false;
  }
}

Model.prototype.property = function(prop, val){
  this.value[prop] = val;
  this.set(this.value);
};

Model.prototype.propertyModel = function(prop){
  var model = sk.model();
  var self = this;
  model.bind(this, function(parent){
    return parent[prop];
  }, function(val){
    self.property(prop, val);
    return self.value;
  });
  return model;
}

Model.prototype.switchClasses = function(elem, classes){
  if(typeof classes === "string"){
    classes = {
      true: classes,
    }
  }
  if(elem instanceof Element){
    this.listen(function(val){
      if(Boolean(val)){
        if(classes.true != null){
          elem.classList.add(String(classes.true));
        }
        if(classes.false != null){
          elem.classList.remove(String(classes.false));
        }
      }
      else{
        if(classes.true != null){
          elem.classList.remove(String(classes.true));
        }
        if(classes.false != null){
          elem.classList.add(String(classes.false));
        }
      }
    });
  }
};
Model.prototype.switchClass = Model.prototype.switchClasses;

Model.prototype.setAsClass = function(elem){
  if(elem instanceof Element){
    this.listen(function(val){
      elem.classList.add(String(this.value));
    });
  }
}

Model.prototype.syncWithStorage = function(item, storage){
  var self = this;
  storage = storage || localStorage;
  this.value = storage.getItem(item);
  this.listen(function(val){
    storage.setItem(item, String(val));
  });
  window.addEventListener('storage', function(e){
    console.log("STORAGE EVENT", e);
    self.value = e.newValue;
  });
}

// Experimental
Model.prototype.syncWithScrollTopP = function(elem){
  var self = this;
  if(elem instanceof Element){
    this.value = elem.scrollTop / (elem.scrollHeight - elem.clientHeight);

    elem.addEventListener('scroll', function(e){
      self.value = elem.scrollTop / (elem.scrollHeight - elem.clientHeight);
    });
  }
  else if(elem instanceof Document || elem === window){
    elem = document;
    var body = elem.body;
    this.value = body.scrollTop / (body.scrollHeight - window.innerHeight);

    elem.addEventListener('scroll', function(e){
      self.value = body.scrollTop / (body.scrollHeight - window.innerHeight);
    });
  }
}

function withAnyDo(value, callback){
  if(value instanceof Model){
    value.listen(function(val){
      callback(val);
    });
  }
  else{
    if (typeof callback === "function"){
      callback(value);
    }
  }
}

function withNumberDo(value, callback){
  if(value instanceof Model){
    value.listen(function(val){
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
    value.listen(function(val){
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
    value.listen(function(val){
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
sk.withStringDo = withStringDo;
sk.withNumberDo = withNumberDo;
sk.withAnyDo = withAnyDo;
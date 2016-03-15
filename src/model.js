function model(args){
  return new Model(args);
}

function Model(args){
  this.valueCore;
  this.listeners = [];
  this.filters = [];

  this.init(args);
}

Model.prototype.set = function(arg1, filter){
  var self;
  if(arg1 instanceof Model){
    arg1.listen(function(val){
      if(typeof filter === "function"){
        val = filter(val);
      }
      self.value = val;
    });
  }
  else{
    self.value = arg1;
  }
}

Model.prototype.get = function(){
  return this.value;
}

Model.prototype.sync = function(arg1, upstreamFilter, downstreamFilter){
  if(arg1 instanceof Model){
    this.set(arg1, upstreamFilter);
    this.listen(function(val){
      if(typeof downstreamFilter === "function"){
        val = downstreamFilter(val);
      }
      arg1.value = val;
    });
  }
  else{
    this.set(arg1, upstreamFilter);
  }
}

Model.prototype.init = function(args){
  args = args || {};
  if(args.value !== undefined){
    this.value = args.value;
  }
  if(typeof args.listener === "function"){
    this.listen(args.listener);
  }
  if(typeof args.filter === "function"){
    this.filter(args.filter);
  }
}

// TODO: Decide whether to add onchange event or not.
Model.prototype.listen = function(handler, silence){
  if(typeof handler === 'function'){
    this.listeners.push(handler);
    if(!silence){
      handler(this.value);
    }
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
    return this.valueCore;
  },
  set: function(candidate){
    var self = this;
    for (var i in this.filters){
      candidate = this.filters[i](candidate);
    }
    if(this.valueCore === candidate){
      return;
    }
    this.valueCore = candidate;
    this.listeners.forEach(function(handler){
      handler(self.value);
    });
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
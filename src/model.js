function model(args){
  return new Model(args);
}

function Model(args){
  this.valueCore;
  this.listeners;
  this.filters;

  this.init(args);
}

sk.Model = Model;

Model.prototype.isSkModel = true;

Model.prototype.set = function(val, upstream){
  var self = this, i, cancel = false;
  if(upstream == null){
    upstream = [];
  }
  else if(upstream.indexOf(self) !== -1){
    return;
  }
  var event = {
    cancel: false,
    upstream: upstream || [],
    target: self,
    value: val,
  }
  this.valueCore = event.value;
  event.upstream.push(self);
  for (i in this.listeners){
    this.listeners[i](event);
    if(event.cancel){
      return;
    }
  }
}

Model.prototype.get = function(){
  return this.valueCore;
}

Model.prototype.init = function(args){
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
  if(typeof args.filter === "function"){
    this.filter(args.filter);
  }
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

// Model.prototype.propertyModel = function(prop){
//   var model = sk.model();
//   var self = this;
//   model.bind(this, function(parent){
//     return parent[prop];
//   }, function(val){
//     self.property(prop, val);
//     return self.value;
//   });
//   return model;
// }

// Model.prototype.switchClasses = function(elem, classes){
//   if(typeof classes === "string"){
//     classes = {
//       true: classes,
//     }
//   }
//   if(elem instanceof Element){
//     this.listen(function(e){
//       var val = e.value;
//       if(Boolean(val)){
//         if(classes.true != null){
//           elem.classList.add(String(classes.true));
//         }
//         if(classes.false != null){
//           elem.classList.remove(String(classes.false));
//         }
//       }
//       else{
//         if(classes.true != null){
//           elem.classList.remove(String(classes.true));
//         }
//         if(classes.false != null){
//           elem.classList.add(String(classes.false));
//         }
//       }
//     });
//   }
// };
// Model.prototype.switchClass = Model.prototype.switchClasses;

// Model.prototype.setAsClass = function(elem){
//   if(elem instanceof Element){
//     this.listen(function(val){
//       elem.classList.add(String(this.value));
//     });
//   }
// }

// Model.prototype.syncWithStorage = function(item, storage){
//   var self = this;
//   storage = storage || localStorage;
//   this.value = storage.getItem(item);
//   this.listen(function(val){
//     storage.setItem(item, String(val));
//   });
//   window.addEventListener('storage', function(e){
//     console.log("STORAGE EVENT", e);
//     self.value = e.newValue;
//   });
// }

// // Experimental
// Model.prototype.syncWithScrollTopP = function(elem){
//   var self = this;
//   if(elem instanceof Element){
//     this.value = elem.scrollTop / (elem.scrollHeight - elem.clientHeight);

//     elem.addEventListener('scroll', function(e){
//       self.value = elem.scrollTop / (elem.scrollHeight - elem.clientHeight);
//     });
//   }
//   else if(elem instanceof Document || elem === window){
//     elem = document;
//     var body = elem.body;
//     this.value = body.scrollTop / (body.scrollHeight - window.innerHeight);

//     elem.addEventListener('scroll', function(e){
//       self.value = body.scrollTop / (body.scrollHeight - window.innerHeight);
//     });
//   }
// }

function withAnyDo(value, callback){
  if(value instanceof Model){
    value.listen(function(e){
      var val = e.value;
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
sk.withStringDo = withStringDo;
sk.withNumberDo = withNumberDo;
sk.withAnyDo = withAnyDo;
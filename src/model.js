function model(args){
  return new Model(args);
}

function Model(args){
  args = args || {};
  this.valueCore;
  this.listeners = [];
  this.filters = [];
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
    this.valueCore = candidate;
    this.listeners.forEach(function(handler){
      handler(self.value);
    });
  },
});

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
var idCount=0;
sk.element = function(arg1, arg2, arg3){
  var args, elem;
  args = sk.args(arguments,
    'str element, Element? parent, args?',
    'Element element, Element? parent, args?',
    'args?');
  if(!args.element){
    return sk.create(args);
  }
  else if(typeof args.element === 'string'){
    if(args.element.charAt(0) === '<' && args.element.charAt(args.element.length - 1) === '>'){
      args.tag = args.element.substr(1, args.element.length-2);
      return sk.create(args);
    }
    else{
      return sk.query(args.element, args);
    }
  }
  else{
    return sk.init(args.element, args);
  }
};

var element = sk.element;

sk.create = function(arg1, arg2){
  var elem, tag, args;
  args = sk.args(arguments, 'str? tag, Element? parent, str? cls, args?');
  elem = document.createElement( args.tag || 'div' );

  return args ? sk.init(elem, args) : elem;
}

sk.query = function(arg1, arg2, arg3){
  var rootNode, selector, args, elem;
  if( typeof arg2 === "string" && arg1 instanceof Element){
    rootNode = arg1;
    selector = arg2;
    args = arg3;
  }
  else if( typeof arg1 === "string" ){
    selector = arg1;
    args = arg2;
    rootNode = document;
  }
  else if( arguments.length === 1 && typeof arg1 === "object" ){
    args = arg1;
    selector = args.element || args.query || args.selector;
    rootNode = document;
  }
  else{
    throw('sk.query(): wrong arguments.');
  }

  try{
    elem = rootNode.querySelector(selector);
  }
  catch(e){
    return
  }
  
  return args ? sk.init(elem, args) : elem;
}

// EventTarget interface
sk.eventTarget = function(args){
  var elem = args.element;
  var listeners = args.listeners || args.events;
  if(listeners !== undefined){
    sk.each(listeners, function(listener, event){
      elem.addEventListener( event, listener);
    });
  }
  if(args.removeListeners !== undefined){
    sk.each(args.listeners, function(listener, event){
      elem.removeEventListener( event, listener);
    });
  }
}

//
// Node interface handlers
// https://developer.mozilla.org/en-US/docs/Web/API/Node
//
sk.node = function(args){
  // Parent handler 
  var elem = args.element;
  var parent = args.insertIn || args.parent || args.appendTo;
  if(parent !== undefined){
    parent.insertBefore( elem, args.insertBefore || null );
  }
  
  // textContent handler
  if(args.text !== undefined){
    elem.textContent = args.text;
  }

  // Children handler
  if(args.children !== undefined){
    args.children.forEach(function(child){
      elem.appendChild(child);
    });
  }

  //nodeValue
  if(args.nodeValue !== undefined){
    elem.nodeValue = args.nodeValue;
  } 

  return sk.eventTarget(args);
}

//
// Element interface handlers
// https://developer.mozilla.org/en-US/docs/Web/API/Element
//
sk.element = function(arg1, arg2){
  var args;
  var i;
  var elem;
  if(arguments.length === 1){
    args = arg1;
    elem = args.element; 
  }
  else if(arguments.length > 1){
    args = arg2;
    elem = arg1;
  }
  else{
    args = {};
  }

  sk.withElementDo(arg1, function(result){
    elem = result;
    args.element = elem;
  });

  for(i in args){
    if(i in _argHandlers['*']){
      _argHandlers['*'][i](elem, args);
    }
  }

  if(_argHandlers[elem.tagName]){
    var tag = elem.tagName;
    for(i in args){
      if(i in _argHandlers[tag]){
        _argHandlers[tag][i](elem, args);
      }
    }
  }

  sk.node(args);

  return elem;
};

//
// HTMLElement interface
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
//
sk.html = function(args){
  return args.elem;
}

element.init = sk.element;

var _argHandlers = {};
_argHandlers['Node'] = {
  insertIn: function(elem, args){
    
  }
}
_argHandlers['*'] = {
  id: function(elem, args){
    if ( args.id === true ) {
      elem.id = 'sk-' + elem.tagName.toLowerCase() + '-' + ++idCount;
    }
    else{
      sk.withStringDo(args.id, function(id){
        elem.id = id;
      });
    }
  },
  cls: function(elem, args){
    sk.cls(elem, args['cls']);
  },
  content: function(elem, args){
    if ( args.content instanceof Node ) {
      elem.appendChild( args.content );
    } else if ( args.content != null ) {
      withStringDo( args.content, function(val){
        elem.textContent = val;
      });
    }
  },
  attr: function(elem, args){
    var attributes = args.attributes || args.attr;
    if ( typeof attributes === "object" ) {
      for ( var key in attributes ) {
        sk.withStringDo(attributes[ key ], function(val){
          elem.setAttribute(key, val);
        });
      }
    }
  },
  css: function(elem, args){
    var css = args.css || args.styles || args.style;
    element.style(elem, css);
  },
  action: function(elem, args){
    if ( typeof args.action === "function" ) {
      // TODO: Touch events
      elem.addEventListener( "click", args.action );
    }
  },
  // listeners: function(elem, args){
  //   var listeners = args.listeners || args.events;

  //   sk.each(listeners, function(listener, event){
  //     elem.addEventListener( event, listener);
  //   });
  // },
  title: function(elem, args){
    elem.title = args.title;
  },
  accessKey: function(elem, args){
    elem.accessKey = args.accessKey;
  },
  dir: function(elem, args){
    elem.dir = args.dir;
  },
  editable: function(elem, args){
    elem.contentEditable = args.editable;
  },
  lang: function(elem, args){
    elem.lang = args.lang;
  },
  tabIndex: function(elem, args){
    elem.tabIndex = args.tabIndex;
  },
  html: function(elem, args){
    elem.innerHTML = args.html;
  }
}

_argHandlers['A'] = {
  href: function(elem, args){
    elem.href = args.href;
  },
  target: function(elem, args){
    elem.target = args.target;
  },
  rel: function(elem, args){
    elem.rel = args.rel;
  },
  type: function(elem, args){
    elem.type = args.type;
  },
}

_argHandlers['INPUT'] = {
  type: function(elem, args){
    elem.type = args.type;
  },
  name: function(elem, args){
    elem.name = args.name;
  },
  disabled: function(elem, args){
    elem.disabled = args.disabled;
  },
  required: function(elem, args){
    elem.required = args.required;
  },
  value: function(elem, args){
    elem.value = args.value;
  },
  autofocus: function(elem, args){
    elem.autofocus = args.autofocus;
  }
}


//
// SVGElement interface
// https://developer.mozilla.org/en-US/docs/Web/API/SVGElement
//
var svg = function(args){
  args = args || {};
  args.namespace = 'http://www.w3.org/2000/svg';
  if(args.tag == null){
    args.tag = 'svg';
  }
  return element(args);
};

element.addClass = function(elem, arg1) {
  var saved;
  if(arg1 == null){
    return;
  }
  else if(arg1 instanceof Array){
    arg1.forEach(function(cls){
      element.addClass(elem, cls);
    });
  }
  else {
    sk.withStringDo(arg1, function(val){
      val = val.trim();
      if(val != ''){
        val.split(" ").forEach(function(cls){
          elem.classList.add(cls);
        });
      }
      if(saved){
        saved.split(' ').forEach(function(cls){
          elem.classList.remove(cls);
        });
      }
      saved = val;
    });
  }
};

element.style = function(elem, arg1, arg2){
  var args;
  if(arg1 == null){
    return;
  }
  else if(typeof arg1 === "string"){
    args = {};
    args[arg1] = arg2;
  }
  else if(typeof arg1 === "object"){
    args = arg1;
  }
  else{
    args = {};
  }

  for (var i in args){
    element.setOneStyle(elem, i, args[i]);
  }
};
var style = element.style;

element.setOneStyle = function(elem, property, value){
  if(element.styleMods[property] != null){
    var mod = element.styleMods[property];
    var properties = [];
    property = mod.property || property;
    properties.push(property);
    // Add prefixes if needed
    if(mod.prefixed){
      var capProperty = property.charAt(0).toUpperCase() + property.slice(1);
      properties.push('webkit' + capProperty);
      properties.push('moz' + capProperty);
      properties.push('ms' + capProperty);
      properties.push('o' + capProperty);
    }
    withStringDo(value, function(val){
      if(typeof mod.filter === "function"){
        val = mod.filter(val);
      }
      for(var j in properties){
        elem.style[properties[j]] = val;
      }
    });
  }
  else{
    withStringDo(value, function(val){
      elem.style[property] = val;
    });
  }
}

element.styleMods = {};

element.lengthUnits = ['px', 'em', 'pc', 'mm', 'in', 'ex', 'ch', 'rem', 'cm', 'pt'];

element.processModValues =  function(modName, mod){
  if(mod.values != null){
    mod.values.forEach(function(v){
      if(v === '<length>'){
        element.lengthUnits.forEach(function(unit){
          var capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1);
          var unitModName = modName + capitalizedUnit;
          element.styleMods[unitModName] = {
            prefixed: mod.prefixed,
            filter: function(val){
              if(isNaN(val)){
                return String(val);
              }
              else{
                return String(val) + unit;
              }
            },
            property: mod.property || modName,
          }
        });
      }
      else if (v === '<percentage>'){
        element.styleMods[modName+'Pct'] = {
          prefixed: mod.prefixed,
          filter: function(val){
            if(isNaN(val)){
              return String(val);
            }
            else{
              return String(val) + '%';
            }
          },
          property: mod.property || modName,
        }
        element.styleMods[modName+'P'] = {
          prefixed: mod.prefixed,
          filter: function(val){
            if(isNaN(val)){
              return String(val);
            }
            else{
              return (100 * val) + '%';
            }
          },
          property: mod.property || modName,
        }
      }
    });
  }
};

element.setValueUnits = function(units, properties){
  properties.forEach(function(property){
    if(element.styleMods[property] == null){
      element.styleMods[property] = {};
    }
    element.styleMods[property]['values'] = units;
  });
}

element.setPrefixed = function(properties){
  properties.forEach(function(property){
    if(element.styleMods[property] == null){
      element.styleMods[property] = {};
    }
    element.styleMods[property]['prefixed'] = true;
  });
}

element.setPrefixed(['flex', 'flexGrow', 'flexShrink', 'flexDirection',
                    'flexFlow', 'flexWrap', 'justifyContent', 'order',
                    'alignSelf', 'alignItems', 'alignContent', 'transform']);

element.setValueUnits(['<length>', '<percentage>'], ['top', 'right', 'bottom',
                      'left', 'margin', 'padding', 'fontSize', 'width',
                      'height', 'minWidth', 'maxWidth', 'minHeight',
                      'maxHeight']);

element.setValueUnits(['length'], ['outlineWidth', 'borderWidth',
                      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth',
                      'borderLeftWidth']);

element.styleMods['translateX'] = {
  prefixed: true,
  property: 'transform',
  filter: function(val){
    console.log("Filtering", val);
    return 'translateX(' + val + 'px)';
  }
};

for (var name in element.styleMods){
  var mod = element.styleMods[name];
  element.processModValues(name, mod);
}

var apply = function(arg1, args) {
  element.init(arg1, args);
};

var span = function(){
  var args = sk.args(arguments, 'str? content, Node? parent, args?');
  args.tag = 'span';
  return sk.create(args);
};

var div = function(){
  var args = sk.args(arguments, 'Node? parent, args?');
  args.tag = 'div';
  return element(args);
};

var path = function(args){
  args = args || {};
  args.tag = 'path';
  return svg(args);
};

sk.element = element;
sk.init = element.init;
sk.div = div;
sk.span = span;
sk.svg = svg;
sk.path = path;
sk.apply = apply;
sk.cls = element.addClass;
sk.style = element.style;
sk.css = element.style;
sk.q = sk.query;
sk.c = sk.create;
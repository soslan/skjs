var idCount=0;
sk.element = function(arg1, arg2, arg3){
  var args, elem;
  if( !(arg1 instanceof Element) && typeof arg1 === "object" ) {
    args = arg1;
    elem = args.element || args.query || args.selector;
  }
  else {
    args = arg2;
    elem = arg1;
  }

  if(typeof elem === "string"){
    return sk.query(elem, args);
  }
  else if(elem == null){
    return sk.create(args);
  }
  else if(elem instanceof Node){
    return args ? sk.init(elem, args) : elem;
  }
  else{
    throw("sk.element(): wrong arguments.");
  }
};

var element = sk.element;

sk.create = function(arg1, arg2){
  var elem, tag, args;

  if( arguments.length === 1 && typeof arg1 === "object" ){
    args = arg1 || {};
    tag = args.tag || args.tagName || 'div';
  }
  else if(typeof arg1 === "string"){
    tag = arg1;
    args = arg2;
  }
  else if(arg1 == null){
    tag = 'div';
    args = arg2;
  }
  else{
    throw("sk.create(): wrong arguments.");
  }
  elem = document.createElement( tag );
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

element.init = function(arg1, args){
  var w = args.window || window;
  var parent = args.parent || args.appendTo;
  var classes = args.classes || args.className || args.cls || args.class;
  var attributes = args.attributes || args.attr;
  var elem;
  sk.withElementDo(arg1, function(result){
    elem = result;
  });

  if ( args.id === true ) {
    elem.id = 'sk-' + elem.tagName + ++idCount;
  }
  else{
    sk.withStringDo(args.id, function(id){
      elem.id = id;
    });
  }

  element.addClass(elem, classes);

  if ( args.content instanceof w.Node ) {
    elem.appendChild( args.content );
  } else if ( args.content != null ) {
    withStringDo( args.content, function(val){
      elem.textContent = val;
    });
  }
  var parent = args.parent || args.appendTo;
  if(parent instanceof Object && typeof parent.skHandleChild === "function"){
    parent.skHandleChild(elem);
  }
  else{
    sk.withElementDo(args.parent || args.appendTo, function(parent){
      parent.appendChild(elem);
    });
  }

  if ( typeof attributes === "object" ) {
    for ( var key in attributes ) {
      sk.withStringDo(attributes[ key ], function(val){
        elem.setAttribute(key, val);
      });
    }
  }

  args.style = args.styles || args.style;
  element.style(elem, args.style || args.styles);

  if ( typeof args.action === "function" ) {
    // TODO: Touch events
    elem.addEventListener( "click", args.action );
  }

  args.listeners = args.listeners || args.events;

  sk.withEachDo(args.listeners, function(listener, ev){
    elem.addEventListener( ev, function(e){
      if ( typeof listener === "function" ) {
        listener(e);
      }
    });
  });

  // if ( typeof args.listeners === "object" ) {
  //   for ( var i in args.listeners ) {
  //     elem.addEventListener( i, function(e){
  //       if ( typeof args.listeners[i] === "function" ) {
  //         args.listeners[i](e);
  //       }
  //     });
  //   }
  // }

  return elem;
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

var span = function(args){
  args = args || {};
  args.tag = 'span';
  return element(args);
};

var div = function(args){
  args = args || {};
  args.tag = 'div';
  return element(args);
};

var svg = function(args){
  args = args || {};
  args.namespace = 'http://www.w3.org/2000/svg';
  if(args.tag == null){
    args.tag = 'svg';
  }
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
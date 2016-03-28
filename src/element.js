var element = function( args ) {
  args = args || {};
  var w = args.window || window;
  if(typeof args.query === 'string'){
    var elem = w.document.querySelector(args.query);
  }
  else {
    if(typeof args.namespace === 'string'){
      var elem = w.document.createElementNS( args.namespace, args.tag || "div" );
    }
    else{
      var elem = w.document.createElement( args.tag || "div" );
    }
  }
  if(elem){
    return element.init(elem, args);
  }
  else{
    return null;
  }
};

element.init = function(arg1, args){
  var w = args.window || window;
  var parent = args.parent || args.appendTo;
  var classes = args.classes || args.className || args.class;
  var attributes = args.attributes || args.attr;

  if( typeof args.id === "string" ) {
    arg1.id = args.id;
  }

  if ( typeof classes === "string" ) {
    classes.split( " " ).forEach(function( className ) {
      arg1.classList.add( className );
    });
  }

  if ( args.content instanceof w.Node ) {
    arg1.appendChild( args.content );
  } else if ( args.content != null ) {
    withStringDo( args.content, function(val){
      arg1.textContent = val;
    });
  }

  if ( typeof parent === "string" ) {
    parent = w.document.querySelector( parent );
  }
  if ( parent instanceof w.Node ) {
    parent.appendChild( arg1 );
  }

  if ( typeof attributes === "object" ) {
    for ( var key in attributes ) {
      arg1.setAttribute( key, attributes[ key ] );
    }
  }

  args.style = args.styles || args.style;
  if ( typeof args.style === "object" ) {
    element.style(arg1, args.style);
  }

  if ( typeof args.action === "function" ) {
    // TODO: Touch events
    arg1.addEventListener( "click", args.action );
  }

  if ( typeof args.listeners === "object" ) {
    for ( var i in args.listeners ) {
      arg1.addEventListener( i, function(e){
        if ( typeof args.listeners[i] === "function" ) {
          args.listeners[i](e);
        }
      });
    }
  }

  return arg1;
};

element.style = function(elem, arg1, arg2){
  var args;
  if(typeof arg1 === "string"){
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

var query = function(arg1, args){
  args.query = arg1;
  return element(args);
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
sk.style = style;
sk.div = div;
sk.span = span;
sk.svg = svg;
sk.path = path;
sk.query = query;

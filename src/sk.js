function element( args ) {
  args = args || {};
  if(typeof args.query === 'string'){
    var elem = document.querySelector(args.query);
  }
  else {
    if(typeof args.namespace === 'string'){
      var elem = document.createElementNS( args.namespace, args.tag || "div" );
    }
    else{
      var elem = document.createElement( args.tag || "div" );
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

  if ( args.content instanceof Node ) {
    arg1.appendChild( args.content );
  } else if ( args.content != null ) {
    withStringDo( args.content, function(val){
      arg1.textContent = val;
    });
  }

  if ( typeof parent === "string" ) {
    parent = document.querySelector( parent );
  }

  if ( parent instanceof Node ) {
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

element.addStyleMod =  function(modName, mod){
  if(typeof mod.values === 'string'){
    mod.values.split(' ').forEach(function(v){
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
  else{
    element.styleMods[modName] = mod;
  }
};

element.addFourSideProperty = function(propName, mod){
  ['Top', 'Right', 'Bottom', 'Left'].forEach(function(side){
    element.addStyleMod(propName+side, mod);
  });
};

// These take about 5ms of execution time.
// TODO: optimize
element.addStyleMod('height', {values: '<length> <percentage>'});
element.addStyleMod('minHeight', {values: '<length> <percentage>'});
element.addStyleMod('maxHeight', {values: '<length> <percentage>'});

element.addStyleMod('width', {values: '<length> <percentage>'});
element.addStyleMod('minWidth', {values: '<length> <percentage>'});
element.addStyleMod('maxWidth', {values: '<length> <percentage>'});

element.addStyleMod('fontSize', {values: '<length> <percentage>'});

element.addFourSideProperty('margin', {values: '<length> <percentage>'});
element.addFourSideProperty('padding', {values: '<length> <percentage>'});

element.addStyleMod('outlineWidth', {values: '<length>'});
element.addStyleMod('borderWidth', {values: '<length>'});
element.addStyleMod('borderTopWidth', {values: '<length>'});
element.addStyleMod('borderRightWidth', {values: '<length>'});
element.addStyleMod('borderBottomWidth', {values: '<length>'});
element.addStyleMod('borderLeftWidth', {values: '<length>'});

element.addStyleMod('top', {values: '<length> <percentage>'});
element.addStyleMod('right', {values: '<length> <percentage>'});
element.addStyleMod('bottom', {values: '<length> <percentage>'});
element.addStyleMod('left', {values: '<length> <percentage>'});

element.addStyleMod('flex', {prefixed: true});
element.addStyleMod('flexGrow', {prefixed: true});
element.addStyleMod('flexShrink', {prefixed: true});
element.addStyleMod('flexDirection', {prefixed: true});
element.addStyleMod('flexFlow', {prefixed: true});
element.addStyleMod('flexWrap', {prefixed: true});
element.addStyleMod('justifyContent', {prefixed: true});
element.addStyleMod('order', {prefixed: true});
element.addStyleMod('alignSelf', {prefixed: true});
element.addStyleMod('alignItems', {prefixed: true});
element.addStyleMod('alignContent', {prefixed: true});

element.addStyleMod('transform', {
  prefixed: true,
});

element.addStyleMod('translateX', {
  prefixed: true,
  property: 'transform',
  filter: function(val){
    console.log("Filtering", val);
    return 'translateX(' + val + 'px)';
  }
});

function apply(arg1, args) {
  element.init(arg1, args);
}

function query(arg1, args){
  args.query = arg1;
  return element(args);
}

function span(args){
  args = args || {};
  args.tag = 'span';
  return element(args);
}

function div(args){
  args = args || {};
  args.tag = 'div';
  return element(args);
}

function svg(args){
  args = args || {};
  args.namespace = 'http://www.w3.org/2000/svg';
  if(args.tag == null){
    args.tag = 'svg';
  }
  return element(args);
}

function path(args){
  args = args || {};
  args.tag = 'path';
  return svg(args);
}

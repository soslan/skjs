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

  if ( typeof args.content === "string" || typeof args.content === "number" ) {
    arg1.textContent = args.content;
  } else if ( args.content instanceof Node ) {
    arg1.appendChild( args.content );
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

  if ( typeof args.style === "object" ) {
    for ( var i in args.style ) {
      arg1.style[ i ] = args.style[ i ];
    }
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

element.addStyleMod =  function(modName, mod){
  element.styleMods[modName] = mod;
};

element.addStyleMod('flex', {
  prefixed: true,
});

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

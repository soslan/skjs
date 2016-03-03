function apply(arg1, args) {
  element.init(arg1, args);
}

function element( args ) {
  args = args || {};
  var elem = document.createElement( args.tag || "div" );
  return element.init(elem, args);
};

element.init = function(arg1, args){
  var parent = args.parent || args.appendTo;
  var classes = args.classes || args.className || args.class;
  var attributes = args.attributes || args.attr;

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

  if ( parent instanceof HTMLElement ) {
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
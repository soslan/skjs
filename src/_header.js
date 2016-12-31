;(function(sk){

sk.args = function(args){
	var synopses = [], out, defaults = {}, optional;
	for(var i = 1; i < arguments.length - 1; i++){
		synopses.push(arguments[i]);
	}
	var last = arguments[arguments.length - 1];
	if(typeof last === 'object'){
		defaults = last;
	}
	else if(typeof last === 'string'){
		synopses.push(last);
	}
	for(var i in synopses){
		var synopsis = synopses[i];
		var parts = synopsis.split(',')
		var types = sk.args.types;
		var typeMatch;
		out = {};
		match = true;
		argi = 0;
		for(var j=0, argi=0; j<parts.length; j++, argi++){
			if (false && args[j] === undefined) {
				break;
				match = false;
			}
			var val = args[argi];
			// This may strike performance a bit.
			// parts[j] = parts[j].replace(/  +/g, ' ');
			// 
			var part = parts[j].trim().split(' ');
			if(part.length >= 2){
				type = part[0];
				name = part[1];
			}
			else if(part.length === 1){
				type = part[0];
				if(type === ''){
					continue;
				}
				name = null;
			}
			else{
				match = false;
				break;
			}
			if(type.charAt(type.length - 1) === '?'){
				optional = true;
				type = type.slice(0, -1);
			}
			else{
				optional = false;
			}
			if(types[type]){
				typeMatch = types[type].checker(val)
			}
			else if(window[type] && typeof window[type] === 'function'){
				typeMatch = val instanceof window[type];
			}
			if(typeMatch){
				if(type === 'args'){
					for (var k in val){
						if(val[k] !== undefined){
							out[k] = val[k];
						}
					}
				}
				else{
					out[name] = val;
				}	
			}
			else if(optional){
				argi--;
			}
			else{
				match = false;
				break;
			}
		}
		if(match){
			for(var k in defaults){
				if(out[k] === undefined){
					out[k] = defaults[k];
				}
			}
			return out;
		}
	}
	throw('sk.args: wrong arguments');
}

sk.args.types = {};

sk.args.register = function(type, checker){
	sk.args.types[type] = {
		checker: checker,
	}
}

sk.args.register('str', function(val){
	return typeof val === 'string';
});
sk.args.register('num', function(val){
	return typeof val === 'number';
});
sk.args.register('func', function(val){
	return typeof val === 'function';
});
sk.args.register('array', function(val){
	return val instanceof Array;
});
sk.args.register('obj', function(val){
	return typeof val === 'object' && val !== null;
});
sk.args.register('any', function(val){
	return true;
});
sk.args.register('args', function(val){
	return typeof val === 'object' && val !== null;
});
sk.args.register('Element', function(val){
	return val instanceof Element;
})
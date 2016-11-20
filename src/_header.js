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
			if(type === 'str' && typeof val === 'string'){
				out[name] = val;
			}
			else if(type === 'num' && typeof val === 'number'){
				out[name] = val;
			}
			else if(type === 'func' && typeof val === 'function'){
				out[name] = val;
			}
			else if(type === 'array' && val instanceof Array){
				out[name] = val;
			}
			else if(type === 'obj' && typeof val === 'object'){
				out[name] = val;
			}
			else if(type === 'any'){
				out[name] = val;
			}
			else if(type === 'args' && typeof val === 'object' && val !== null){
				for (var k in val){
					if(val[k] !== undefined){
						out[k] = val[k];
					}
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
	throw('Wrong arguments');
}
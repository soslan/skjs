sk.ajax = function(args){
  var url = args.url;
  var content;
  var queryString;
  var method = args.method ? args.method.toUpperCase() : 'GET';
  if(method === 'POST'){
    if(args.successCodes === undefined){
      args.successCodes = [201];
    }
    if(typeof args.args === 'object'){
      var form = new FormData();
      for(var i in args.args){
        var arg = args.args[i];
        if(typeof arg === "object"){
          arg = JSON.stringify(arg);
        }
        form.append(i, arg);
      }
    }
    content = form;
  }
  else if(method === 'GET' && typeof args.args === 'object'){
    url = url + getQueryString(args.args);
    args.successCodes = [200];
  }
  var successCodes = [];
  var req = new XMLHttpRequest();
  req.open(method, url);
  if(typeof args.load === 'function'){
    req.addEventListener('load', args.load);
  }
  if(typeof args.error === 'function'){
    req.addEventListener('error', args.error);
  }
  if(typeof args.abort === 'function'){
    req.addEventListener('abort', args.abort);
  }
  if(typeof args.progress === 'function'){
    req.addEventListener('progress', args.progress);
  }
  if(typeof args.success === 'function'){
    req.addEventListener('load', function(e){
      if(args.successCodes.indexOf(req.status) === -1){
        return;
      }
      args.success(req.response);
    });
  }
  req.send(content);
};

sk.ajax.post = function(args){
  args.method = 'post';
  return sk.ajax(args);
}

sk.ajax.get = function(args){
  args.method = 'get';
  return sk.ajax(args);
}

var getQueryString = function(args){
  var queryString = '?';
  segments = [];
  for(var i in args){
    segments.push(i + '=' + encodeURIComponent(args[i]));
  }

  return '?' + segments.join('&');
}
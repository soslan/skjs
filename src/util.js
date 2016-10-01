sk.withEachDo = function(seq, callback){
  var i;
  if(typeof callback !== "function"){
    return;
  }
  if(seq instanceof Array || typeof seq === "object"){
    for(i in seq){
      callback(seq[i], i);
    }
  }
  else if(seq instanceof NodeList){
    for(i=0; i<seq.length; i++){
      callback(seq[i], i);
    }
  }
};

sk.withElementDo = function(arg, callback){
  if(typeof callback !== "function" || arg == null){
    return;
  }
  if(arg instanceof Element){
    callback(arg);
  }
  else if(typeof arg === "string"){
    var elem = document.querySelector(arg);
    if(elem){
      callback(elem);
    }
  }
  else{
    for (var i in sk.elementDrivers){
      var driver = sk.elementDrivers[i];
      var result = driver(arg);
      if(result === undefined){
        continue;
      }
      else{
        sk.withElementDo(result, callback);
        return;
      }
    }
  }
}

sk.addElementDriver = function(driver){
  if(typeof driver === "function"){
    sk.elementDrivers.push(driver);
  }
};

sk.elementDrivers = [];

var runDrivers = function(drivers, val, callback){
  for (var i in drivers){
    var driver = drivers[i];
    var check = driver.check;
    if(check === 'instanceof' && val instanceof driver.value){
      handler(val, callback);
    }
    else if(check === 'typeof' && typeof val === driver.value){
      handler(val, callback);
    }
    else if(check === 'property' && val[driver.value] === true){
      handler(val, callback);
    }
  }
}

sk.getAbsolutePosition = function(elem){
  var temp = elem;
  var offset = {
    top: 0,
    left: 0,
  };
  while (temp !== null){
    offset.left += temp.offsetLeft;
    offset.top += temp.offsetTop;
    temp = temp.offsetParent;
  }
  return offset;
};
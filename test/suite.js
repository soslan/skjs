function suite(name, callback){
  var self = {};
  suite.current = self;

  self.container = sk.div({
    parent: document.body,
  });
  self.name = sk.div({
    parent: self.container,
    content: name,
  });
  self.tests = sk.div({
    parent: self.container,
    classes: 'suite-body'
  });

  if(typeof callback === "function"){
    callback.call(self);
  }
}

var Test = function(suite, description, callback, expected, timeout){
  var self = this;
  assert.test = self;
  self.passed = 0;
  self.expected = expected;
  self.suite = suite;
  self.timeout = timeout || 1000;

  self.status = sk.model({
    value: 'running',
  });
  self.container = sk.div({
    parent: self.suite.tests,
    classes: ['test', self.status],
  });
  sk.span({
    parent: self.container,
    content: description,
  });
  self.statusElement = sk.span({
    parent: self.container,
    classes: 'status',
  });
  self.messages = sk.div({
    parent: self.container,
    classes: 'message',
  });

  var statusCallback = function(self){
    return function(val){
      if(val === 'running'){
        self.statusElement.textContent = '...';
      }
      else if(val === 'success'){
        self.statusElement.textContent = 'OK';
      }
      else if(val === 'fail'){
        self.statusElement.textContent = 'FAIL';
      }
    }
  };
  sk.withStringDo(self.status, statusCallback(self));

  var assertion = new Assertion(self);

  if(typeof callback === "function"){
    callback.call(self, assertion);
  }

  if(self.expected == null && self.status.value === 'running'){
    self.status.value = 'success';
  }
  else if(self.expected){
    var onTimeout = function(self){
      return function(){
        if(self.passed >= self.expected && self.status.value === 'running'){
          self.status.value = 'success';
        }
        else if(self.passed < self.expected){
          console.log(description, self.passed, self.expected);
          self.fail("timeout");
        }
      }
    };
    setTimeout(onTimeout(self), self.timeout);
  }
}

Test.prototype.pass = function(){
  this.passed++;
  if(this.expected && this.passed >= this.expected && this.status.value === 'running'){
    this.status.value = 'success';
  }
}

Test.prototype.fail = function(msg){
  this.status.value = 'fail';
  this.addMessage(msg);
}

Test.prototype.addMessage = function(msg){
  sk.div({
    parent: this.messages,
    classes: 'message',
    content: msg,
  });
}

function test(description, callback, expected, timeout){
  return new Test(suite.current, description, callback, expected, timeout);
}

function Assertion(testObj){
  this.test = testObj;
}

Assertion.prototype.equal = function(arg1, arg2){
  if (arg1 === arg2){
    this.test.pass();
  }
  else{
    this.test.fail("'" + arg1 + "' and '" + arg2 + "' are not equal");
  }
}

Assertion.prototype.true = function(arg1){
  if(arg1 === true){
    this.test.pass();
  }
  else{
    this.test.fail("'" + arg1 + "' is not true");
  }
}

var assert = new Assertion();
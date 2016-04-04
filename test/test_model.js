suite("Model tests", function(){
  test("initial value is undefined", function(assert){
    m = sk.model();
    assert.equal(m.get(), undefined);
  });

  suite("Initialization options", function(){
    test("value initialization", function(assert){
      m = sk.model({
        value: 1,
      });
      assert.equal(m.value, 1);
    });
  });

  test("setting and getting value", function(assert){
    m = sk.model();
    m.set(1);
    assert.equal(m.get(), 1);
  });
  test("setter and getter", function(assert){
    m=sk.model();
    m.set(1);
    assert.equal(m.get(), m.value);
    m.value = 3;
    assert.equal(m.get(), m.value);
  });
  test("listener", function(assert){
    m=sk.model();
    m.value = 1;
    m.listen(function(val){
      assert.equal(val, m.value);
    });
    m.value = 3;
  }, 2);
  test("onchange", function(assert){
    m=sk.model();
    m.onchange(function(val){
      assert.equal(val, m.value);
    });
    m.value = 4;
  }, 1);
  test("advanced set()", function(assert){
    m1 = sk.model();
    m2 = sk.model({
      value: 2,
    });
    m3 = sk.model({
      value: 3,
    });
    m1.set(m2, m3, function(val2, val3){
      return val2 + val3;
    });
    assert.equal(m1.value, 5);
    m2.set(7);
    assert.equal(m1.value, 10);
  });
  test("binding two models", function(assert){
    m1 = sk.model({
      value: 1,
    });
    m2 = sk.model({
      value: 2,
    });
    m1.bind(m2, function(m2Val){
      return m2Val + 10;
    }, function(m1Val){
      return m1Val - 10;
    });
    assert.equal(m1.value, 12);
    m1.set(10);
    assert.equal(m2.get(), 0);
    m2.set(20);
    assert.equal(m1.get(), 30);
  });
  test("infinite loop prevention", function(assert){
    m1 = sk.model();
    m2 = sk.model({
      value: 1,
    });

    m1.bind(m2, function(val2){
      return val2 + 1;
    }, function(val1){
      return val1 + 1;
    });
    assert.equal(m1.value, 2);
    assert.equal(m2.value, 3);
  });
});
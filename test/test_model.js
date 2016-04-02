suite("Model tests", function(){
  test("initial value is undefined", function(assert){
    m = sk.model();
    assert.equal(m.get(), undefined);
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
});
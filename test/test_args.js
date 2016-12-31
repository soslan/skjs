suite("Arguments parser tests", function(){
	test("first test", function(assert){
		var func = function(){
			var args = sk.args(arguments, 'str a');
			assert.true(args.a === 'a');
		}
		func('a');
	});
	test("empty arguments", function(assert){
		var f = function(){
			var args = sk.args(arguments, '');
			return args;
		};
		assert.equal(Object.keys(f()).length, 0);
	});
	test("any type", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'any arg1');
			return args;
		}
		assert.equal(f(1).arg1, 1);
		assert.equal(f(null).arg1, null);
		assert.equal(f("abc").arg1, "abc");
	})
	test("two arguments", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'any a, any b');
			return args;
		};
		assert.equal(Object.keys(f(1,2)).length, 2);
	});
	test("various types", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'str arg1, num arg2, array arg3, obj arg4');
			return args;
		}
		args = f("abc", 1, [], {foo:'bar'});
		assert.equal(args.arg1, 'abc');
		assert.equal(args.arg2, 1);
		assert.true(args.arg3 instanceof Array);
		assert.equal(args.arg4.foo, 'bar');
	});
	test("wrong argument type", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'str arg1');
			return args;
		}
		assert.throws(function(){
			f(123);
		})
	});
	test("multiple synopses", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'str arg1', 'num arg1');
			return args;
		}
		assert.equal(f(123).arg1, 123)
	});
	test("unknown type, found in global namespace", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'Array arg1');
			return args;
		}
		assert.true(f([true]).arg1[0]);
	})
	test("unknown type, not found in global namespace", function(assert){
		var f = function(){
			var args = sk.args(arguments, 'ThisTypeDoesNotExist arg1');
			return args;
		}
		assert.throws(function(){
			f(1);
		});
	})
})
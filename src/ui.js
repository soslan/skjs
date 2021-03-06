var skui = {}
sk.ui = skui;

skui.Component = function(){
	this.element = sk.div();
	this.container = this.element;
	return this;
}

skui.component = function(){
	return new skui.Component();
}

skui.section = function(cArgs){
	var container = {};
	container.container = sk.c('div', cArgs);
	container.element = container.container;
	container.container.classList.add('section');
	container.header = sk.c('div', {
		cls: 'header',
		parent: container.container,
	});
	container.body = sk.c('div', {
		parent: container.container,
		cls: 'body',
	});
	container.footer = sk.c('div', {
		parent: container.container,
		cls: 'footer',
	});
	return container;
}

skui.window = function(){
	var args = sk.args(arguments, 'str title, num? level, args?');
	var wind = {};
	wind.container = sk.div(args);
	wind.container.classList.add('skui-wind');
	wind.element = wind.container;
	wind.container.classList.add('window');
	wind.header = sk.c('div', {
		cls: 'header skui-wind-header',
		parent: wind.container,
	});
	wind.actions = sk.c('div', wind.header, 'skui-wind-actions');
	wind.title = sk.c('h' + (args.level || 2), wind.header, 'skui-wind-title title', {content: args.title || 'Window'});
	wind.toolbar = sk.c('div', wind.element, 'toolbar skui-wind-toolbar');
	wind.body = sk.c('div', wind.element, 'body skui-wind-body');
	wind.footer = sk.c('div', wind.element, 'footer skui-wind-footer');
	return wind;
}

// skui.labeled = function()

// Scene manager
skui.scenes = function(cArgs){
	var self = {};
	self.container = sk.c(cArgs);
	self.nextId = 1;
	self.scenes = {};
	self.activeScenes = [];
	self.add = function(args){
		self.container.appendChild(args.container);
		self.scenes[self.nextId] = args;
		args.container.dataset.sceneId = self.nextId;
		self.nextId += 1;
	}
	self.activate = function(scene){
		if(scene.parentNode === self.container){
			scene.classList.add('active');
			self.activeScenes.push(scene);
			var onactivated = self.scenes[scene.dataset.sceneId].onactivated;
			if(typeof onactivated === 'function'){
				onactivated.call();
			}
		}
	}
	self.deactivate = function(scene){
		scene.classList.remove('active');
	}
	self.deactivateAll = function(){
		for(var i in self.activeScenes){
			self.deactivate(self.activeScenes[i])
		}
		self.activeScenes = [];
	}
	self.reset = function(scene){
		self.deactivateAll();
		self.activate(scene);
	}
	return self;
}

sk.ui.field = function(args){
	var field = {};
	field.element = sk.div(args);
	field.element.classList.add('skui-field');

	field.header = sk.div({
		parent: field.element,
		cls: 'skui-field-header',
	});

	field.body = sk.div({
		parent: field.element,
		cls: 'skui-field-body',
	});

	field.label = sk.html({
		tag: 'label',
		parent: field.header,
		cls: 'skui-field-label',
		text: args.label,
	});
	return field;
}

skui.controlContainer = function(args, label){
	var out = {
		container: sk.c('div', args),
	};
	out.container.classList.add('control-container');
	out.container.classList.add('form-group');
	out.header = sk.c('div', {
		parent: out.container,
		cls: 'header',
	})
	out.label = sk.c('label', {
		parent: out.header,
		cls: 'control-label',
		content: label,
	})
	out.body = sk.c('div', {
		parent: out.container,
		cls: 'body',
	})
	return out;
}

skui.textControl = function(args, label, name, value){
	var control = skui.controlContainer(args, label);
	control.input = sk.c('input', {
		parent: control.body,
		content: value,
		id: true,
		attr: {
			name: name,
			type: 'text',
		},
		cls: 'control text-control form-control',
	});
	control.label.htmlFor = control.input.id;
	return control;
}

skui.textareaControl = function(args, label, name, value){
	var control = skui.controlContainer(args, label);
	control.input = sk.c('textarea', {
		parent: control.body,
		content: value,
		id: true,
		attr: {
			name: name,
		},
		cls: 'control textarea-control form-control',
	});
	control.label.htmlFor = control.input.id;
	return control;
}

skui.numberControl = function(){
	var args = sk.args(arguments, 
		'obj? contArgs, str label, str name, args?',
		{
			label: 'Number',
		});
	var control = skui.controlContainer(args.contArgs, args.label);
	control.input = sk.c('input', {
		parent: control.body,
		id: true,
		attr: {
			name: args.name,
			type: 'number',
		},
		cls: 'control number-control form-control',
	});
	control.label.htmlFor = control.input.id;
	return control;
}

skui.fileControl = function(){
	var args = sk.args(arguments, 
		'obj? contArgs, str label, str name, args?',
		{
			label: 'File',
		});
	var control = skui.controlContainer(args.contArgs, args.label);
	control.input = sk.c('input', {
		parent: control.body,
		id: true,
		attr: {
			name: args.name,
			type: 'file',
		},
		cls: 'control file-control form-control',
	});
	control.label.htmlFor = control.input.id;
	return control;
}

skui.menu = function(){
	var menu = {};
	menu.element = sk.c('ul',{
		cls: 'menu-list'
	});
	menu.container = menu.element;
	menu.activator = sk.activator({
		activation: function(prev, next){
			next.element.classList.add('active');
		},
		deactivation: function(prev){
			prev.element.classList.remove('active');
		}
	});
	menu.item = function(content, action){
		var item = {
			action: action,
			menu: menu,
		};
		item.element = sk.c('li', menu.element, {
			action: function(){
				item.activate();
			}
		});
		item.element.appendChild(content);
		item.activate = function(){
			if(typeof item.action === 'function'){
				item.action();
			}
		}
	}
	return menu;
}

sk.ui.admin = function(args){
	var admin = {};
	admin.element = sk.div(args);
	admin.element.classList.add('skui-admin');
	admin.header = sk.div({
		parent: admin.element,
		cls: 'skui-admin-header'
	});
	admin.body = sk.div({
		parent: admin.element,
		cls: 'skui-admin-body',
	})
	admin.navigation = sk.div({
		parent: admin.body,
		cls: 'skui-admin-nav',
	});
	admin.main = sk.ui.scenes({
		parent: admin.body,
		cls: 'skui-admin-main',
	});
	admin.footer = sk.div({
		parent: admin.element,
		cls: 'skui-admin-footer'
	});

	admin.menu = sk.ui.scenes({
		parent: admin.navigation,
	});

	admin.brand = sk.span({
		parent: admin.header,
		cls: 'skui-admin-brand',
		text: args.brandName || '',
	});

	return admin;
}

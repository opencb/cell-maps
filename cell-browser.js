function CellBrowser(targetId,args){
	var _this=this;
	this.id = "Cell Browser"+ Math.round(Math.random()*10000);
	this.suiteId = 9;
	this.title="Cell Browser";
	this.description="RC";
	this.wum=true;

	this.args = args;
	
	this.width =  $(window).width();
	this.height = $(window).height();
	this.targetId=document.body;
	
	if (targetId != null){
		this.targetId=targetId;
	}
//	if (args != null){
//		if(args.wum != null){
//			this.wum = args.wum;
//		}
//	}
	
	if (args != null){
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.wum != null) {
			this.wum = args.wum;
		}
	}
	this.headerWidget = new HeaderWidget({
		appname: this.title,
		description: this.description,
		suiteId : this.suiteId
	});
	
//	this.genomeViewer = new GenomeViewer(null, {description:"Homo Sapiens", menuBar:this.getMenuBar()});
	this.networkViewer =new NetworkViewer(null, AVAILABLE_SPECIES[0],{
		width:this.width,
		height:this.height-this.headerWidget.height,
		menuBar:this.getMenuBar()
	});
	
//	if (this.wum==true){
	
	/**Atach events i listen**/
	this.headerWidget.onLogin.addEventListener(function (sender){
		Ext.example.msg('Welcome', 'You logged in');
	});
	
	this.headerWidget.onLogout.addEventListener(function (sender){
		Ext.example.msg('Good bye', 'You logged out');
	});
//	}
	
	//SPECIE EVENT
	this.networkViewer.onSpeciesChange.addEventListener(function(sender,data){
//		_this.draw();
		_this.headerWidget.setDescription(_this.networkViewer.speciesName);
	});
	
//	//RESIZE EVENT
//	$(window).smartresize(function(a){
//		_this.setSize($(window).width(),$(window).height());
//	});
	
};



CellBrowser.prototype.draw = function(){
	if(this._panel==null){
		
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
//			renderTo:Ext.getBody(),
//		layout: { type: 'vbox',align: 'stretch'},
			border:false,
			width:this.width,
			height:this.height,
			items:[this.headerWidget.getPanel(),this.networkViewer._getPanel(this.width, this.height-this.headerWidget.height)]
		});
	}
	
	this.headerWidget.setDescription(this.networkViewer.speciesName);
	
	this.networkViewer.setSpeciesMenu(AVAILABLE_SPECIES);
	this.setPluginsMenu();
	this.networkViewer.draw();

};


//CellBrowser.prototype.setSize = function(width,height){
//	this.width=width;
//	this.height=height;
//	
//	this._panel.setSize(width,height);
//	this.networkViewer.setSize(width,height-this.headerWidget.height);
//	this.headerWidget.setWidth(width);
//};


CellBrowser.prototype.getMenuBar = function() {

};






CellBrowser.prototype.getPluginsMenu = function() {
	if(this._pluginsMenu == null){
		this._pluginsMenu = Ext.create('Ext.menu.Menu', {
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._pluginsMenu;
};

CellBrowser.prototype.setPluginsMenu = function() {
	var _this = this;
	var plugins_cat = GENOME_MAPS_AVAILABLE_PLUGINS;
	var species = this.networkViewer.species;
	
	//Auto generate menu items depending of AVAILABLE_PLUGINS config
	var menu = this.getPluginsMenu();
	menu.removeAll(); // Remove the old entries
	for (var i = 0; i < plugins_cat.length; i++) {
		// If category is blank, adds directly a button in the root menu
		if(plugins_cat[i].category == ""){
			for (var j = 0; j < plugins_cat[i].plugins.length; j++){
				menu.add({
					text : plugins_cat[i].plugins[j].name,
					pluginName : plugins_cat[i].plugins[j].name,
					handler : function() {
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].draw();
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].launch();
					}
				});
			}
		}
		else{
			var sources = [];
			for (var j = 0; j < plugins_cat[i].plugins.length; j++){
//			if(plugins[i].species == species){
				sources.push({text : plugins_cat[i].plugins[j].name,
					pluginName : plugins_cat[i].plugins[j].name,
					handler : function() {
						
						
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].draw();
						GENOME_MAPS_REGISTERED_PLUGINS[this.pluginName].launch();
					}
				});
//				break;
//			}
			}
			menu.add({
				text : plugins_cat[i].category,
				menu : sources
			});
		}
	}
};
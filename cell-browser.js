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




CellBrowser.prototype.getMenuBar = function(){
	var _this = this;
	
	if (this.menuBar == null){
		var downloadMenu = Ext.create('Ext.menu.Menu', {
			items :[
			        {
			        	text:"PNG",
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		var content = _this.networkViewer.networkWidget.getGraphCanvas().toHTML();
			        		_this.networkViewer.drawConvertPNGDialog(content,"png");
			        	}
			        },{
			        	text:"JPG", 
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		var content = _this.networkViewer.networkWidget.getGraphCanvas().toHTML();
			        		_this.networkViewer.drawConvertPNGDialog(content,"jpg");
			        	}
			        },
			        {
			        	text:"SVG (recommended)",
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		var content = _this.networkViewer.networkWidget.getGraphCanvas().toHTML();
			        		var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
			        		clienSideDownloaderWindowWidget.draw(content, content);
			        	}
			        }
			        ]

		});

//		var importLocalNetwork = new Ext.create('Ext.menu.Menu', {
//			floating: true,
//			items: [
//				{
//					text: 'SIF',
//					handler : function() {
//						openSIFDialog.show();
//					}
//				}
//			]
//		});
		var importLocalNetwork = new Ext.create('Ext.menu.Menu', {
			floating: true,
			items: [
				{
					text: 'SIF',
					handler : function() {
						var sifNetworkFileWidget =  new SIFNetworkFileWidget();
						sifNetworkFileWidget.draw();	
						sifNetworkFileWidget.onOk.addEventListener(function(sender,data){
							_this.networkViewer.loadSif(data);
						});
					}
				}
			]
		});
		
		
			var fileMenu = new Ext.create('Ext.menu.Menu', {
				floating: true,
//				width: menuItemWidth,
				items: [
	//			{
	//				text: 'New'
	//			},
				{
					text: 'Open...',
					handler: function() {
						var networkFileWidget =  new NetworkFileWidget();
						networkFileWidget.draw();	
						networkFileWidget.onOk.addEventListener(function(sender,data){
							_this.networkViewer.loadJSON(data);
						});
					}
				},
				{
					text: 'Save as',
					handler: function(){
						var content = JSON.stringify(_this.networkViewer.networkWidget.getGraphCanvas().toJSON());
						var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
						clienSideDownloaderWindowWidget.draw(content, content);
					}
				}
				,'-',
				{
					text: 'Import',
					menu: importLocalNetwork
				},
				{
	//				text: 'Export',
					text : 'Download as',
					iconCls:'icon-box',
					menu: downloadMenu//exportFileMenu
					
				}]
			});
		
			
			
		
			this.menuToolbar = Ext.create('Ext.toolbar.Toolbar',{
				cls:'bio-menubar',
				height:27,
				padding:'0 0 0 10'
			});
			this.menuToolbar.add({
				text:'File',
				menu: fileMenu  // assign menu by instance
			}
//			,{
//				text:'Edit',
//				menu: this.getEditMenu()
//			}
			,
//			{
//				text:'View',
//				menu: _this.getViewMenu()
//			},
			{
				text:'Search',
				menu: _this.getSearchMenu()
			},
			{
				text:'Attributes',
				handler: function(){
					var networkAttributesWidget = new NetworkAttributesWidget({title:'Attributes',wum:true,width:_this.width,height:_this.height});
					networkAttributesWidget.draw(_this.networkViewer.networkWidget.getDataset(), _this.networkViewer.networkWidget.getFormatter(),_this.networkViewer.networkWidget.getLayout());
					
					networkAttributesWidget.verticesSelected.addEventListener(function(sender, vertices){
						_this.networkWidget.deselectNodes();
						_this.networkWidget.selectVerticesByName(vertices);
					});
					
					
					_this.networkViewer.networkWidget.onVertexOver.addEventListener(function(sender, nodeId){
						var name = _this.networkViewer.networkWidget.getDataset().getVertexById(nodeId).getName();
						_this.setNodeInfoLabel(networkAttributesWidget.getVertexAttributesByName(name).toString());
					});
					
				}
			},
//			{
//				text:'Layout',
//				menu: this.getLayoutViewMenu()
//			},
			
			{
				text:'Plugins',
				menu:this.getAnalysisMenu()

			}
		//	{
		//		text:'Layout',
		//		menu: layoutViewMenu
		//	},{
		//		text:'Analysis',
		//		menu: extensionsMenu
		//	}
			);
	}
	 return _this.menuToolbar;
};
CellBrowser.prototype.getSearchMenu = function() {
	var _this = this;
	var viewMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
					text : 'Xref',
					handler : function() {
						var inputListWidget = new InputListWidget({viewer:_this.networkViewer});
						//var geneNames = "BRCA2";
						inputListWidget.onOk.addEventListener(function(evt, xref) {
							_this.networkViewer.openGeneListWidget(xref);
						});
						inputListWidget.draw();
					}
				}, 
				{
					text : 'ID'
//					menu : this.getLabelMenu()
				}, 
				{
					text : 'Functional term',
					handler: function(){
		        		_this.openViewer = "searcherViewer";
		        		_this.networkViewer.loadMetaData();
					}
				}
	
		]
	});
	return viewMenu;
};

CellBrowser.prototype.getAnalysisMenu = function() {
	var _this=this;
	var analysisMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
					text : 'Expression',
					handler: function(){
						_this.networkViewer.expressionSelected();
					}
				}, 
				{
					text : 'Interactome browser',
					handler: function(){
					}
				},
				{
					text : 'Reactome browser',
					handler: function(){
						_this.networkViewer.reactomeSelected();
					}
				}
		]
	});
	return analysisMenu;
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
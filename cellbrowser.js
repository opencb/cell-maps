/*
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of Cell Browser.
 *
 * Cell Browser is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Cell Browser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Cell Browser. If not, see <http://www.gnu.org/licenses/>.
 */

function CellBrowser (targetId, args){
	var _this = this;
	this.id = "Cell Browser"+ Math.round(Math.random()*10000);
	this.suiteId = 10;
	this.title="Cell Browser";
	this.description="RC";
	this.wum=true;
	
	
	this.width =  $(window).width();
	this.height = $(window).height();
	this.targetId=document.body;
	
	if (targetId != null){
		this.targetId=targetId;
	}
	if (args != null){
		if(args.wum != null){
			this.wum = args.wum;
		}
	}
	this.args = args;
	
	/** ID **/
	this.eastPanelId = this.id + "_eastPanelID";
	this.centerPanelId = this.id + "_centerPanelID";
	this.menuBarId = this.id + "_menuBarID";
	
	this.grnViewerBtnId = this.id + "vcfViewerBtn";

	/** create widgets **/
	this.jobListWidget = new JobListWidget({
		"timeout":4000,
		"suiteId":this.suiteId,
		"pagedViewList":{
			"title": 'Jobs',
			"pageSize": 7, 
			"targetId": this.eastPanelId,
			"order" : 0,
			"width": 280,
			"height": 650,
			"mode":"view"
		}
	});
	this.dataListWidget = new DataListWidget({
		"timeout":4000,
		"suiteId":this.suiteId,
		"pagedViewList":{
			"title": 'Data',
			"pageSize": 7,
			"targetId": this.eastPanelId,
			"order" : 1,
			"width": 280,
			"height": 650,
			"mode":"view"  //allowed grid | view
		}
	});
	
	/**Atach events i listen**/
	this.jobListWidget.pagedListViewWidget.onItemClick.addEventListener(function (sender, record){
		_this.jobItemClick(record);
	});
	
	this.dataListWidget.pagedListViewWidget.onItemClick.addEventListener(function (sender, record){
		_this.dataItemClick(record);		
	});
	
	
	if (this.wum==true){
		this.headerWidget = new HeaderWidget({
			appname: this.title,
			description: this.description,
			suiteId : this.suiteId
		});
		
		/**Atach events i listen**/
		this.headerWidget.onLogin.addEventListener(function (sender){
			Ext.example.msg('Welcome', 'You logged in');
			_this.sessionInitiated();
		});
		
		this.headerWidget.onLogout.addEventListener(function (sender){
			Ext.example.msg('Good bye', 'You logged out');
			_this.sessionFinished();
		});
		
		this.headerWidget.userBarWidget.onProjectChange.addEventListener(function (sender){
			_this.jobListWidget.getResponse();
		});
		
	}
	//RESIZE EVENT
	$(window).smartresize(function(a){
//		_this.setSize($(window).width(),$(window).height());
	});
};

///** appInterface **/
//CellBrowser.prototype.getAppMenu = function(){
//	return this.getMenu();
//};
//
//CellBrowser.prototype.getAppPanel = function(){
//	return this.getPanel();
//};
//CellBrowser.prototype.getAppEastPanel = function(){
//	return this.getEastPanel();
//};
//
CellBrowser.prototype.draw = function(){
	
	if(this._wrapPanel==null){
		this._wrapPanel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
//			renderTo:Ext.getBody(),
//			layout: {type:'vbox', align:'strech'},
			border:false,
			width:this.width,
			height:this.height,
			items: [this.headerWidget.getPanel(),this.getPanel()]
		});
	}
	if($.cookie('bioinfo_sid') != null){
		this.sessionInitiated();
	}else{
		this.sessionFinished();
	}
	
	this.showGRNViewer();
};

CellBrowser.prototype.sessionInitiated = function(){
	/*action buttons*/
//	Ext.getCmp(this.grnViewerBtnId).enable();
	
	Ext.getCmp(this.eastPanelId).expand();//se expande primero ya que si se hide() estando collapsed peta.
	Ext.getCmp(this.eastPanelId).show();
	this.jobListWidget.draw();
	this.dataListWidget.draw();
};

CellBrowser.prototype.sessionFinished = function(){
	/*action buttons*/
//	Ext.getCmp(this.grnViewerBtnId).disable();
	
	Ext.getCmp(this.eastPanelId).expand(); //se expande primero ya que si se hide() estando collapsed peta.
	Ext.getCmp(this.eastPanelId).hide();
	this.jobListWidget.clean();
	this.dataListWidget.clean();
	
	while(Ext.getCmp(this.centerPanelId).items.items.length>1){
		Ext.getCmp(this.centerPanelId).remove(Ext.getCmp(this.centerPanelId).items.items[Ext.getCmp(this.centerPanelId).items.items.length-1]);
	}
	
//	this.centerPanel.removeChildEls(function(o) { return o.title != 'Home'; });
};

CellBrowser.prototype.jobItemClick = function (record){
	this.jobId = record.data.jobId;
	var _this = this;
	if(record.data.visites >= 0 ){
		
		if(!Ext.getCmp(this.eastPanelId).isHidden() || Ext.getCmp(this.eastPanelId).collapsed){
			Ext.getCmp(this.eastPanelId).collapse();
		}
		
		resultWidget = new ResultWidget({targetId:this.centerPanelId,application:'renato'});
//		resultWidget.onRendered.addEventListener(function (sender, targetId){
//			_this.createCellBrowser(targetId, record);
//		});
		resultWidget.draw($.cookie('bioinfo_sid'),record);
		//TODO: borrar
		this.resultWiget = resultWidget;
	}
};
CellBrowser.prototype.dataItemClick = function (record){
//	_this.adapter.-------(record.data.DATAID, "js", $.cookie('bioinfo_sid'));	
};




CellBrowser.prototype.showGRNViewer= function (){
	var _this = this;
	this.grnViewer = Ext.getCmp(this.id+"_grnViewer");
	if(this.grnViewer==null){
		//Collapse to calculate width for CellBrowser
		pan = 26;
		if(!Ext.getCmp(this.eastPanelId).isHidden() || Ext.getCmp(this.eastPanelId).collapsed){
			Ext.getCmp(this.eastPanelId).collapse();
			pan=0;
		}
		var cellBrowserContainer = Ext.create('Ext.container.Container', {
			id:this.id+'contGRNViewer'
//			html:'<div id=grnViewerCellBrowser></div>'
		});
		
		this.grnViewer = Ext.create('Ext.panel.Panel', {
			id:this.id+"_grnViewer",
			border: false,
		    title: "Workspace",
//		    closable:true,
		    items: cellBrowserContainer
//		    autoScroll:true
		});
		
		Ext.getCmp(this.centerPanelId).add(this.grnViewer);

		//Once actived, the div element is visible, and CellBrowser can be rendered
		Ext.getCmp(this.centerPanelId).setActiveTab(this.grnViewer);
		this.networkViewer = new NetworkViewer(this.id+'contGRNViewer',AVAILABLE_SPECIES[0],{
			width:this.grnViewer.getWidth()-(0/*15+pan*/),
			height:this.grnViewer.getHeight()-0/*26*/,
			menuBar:this.getMenuBar(),
			overview:true
		});
		this.networkViewer.setSpeciesMenu(AVAILABLE_SPECIES);
		this.networkViewer.draw();
		
		this.attributeEditWidget = new AttributeEditWidget(this.networkViewer.getNetworkData().getAttributes());
		this.attributeFilterWidget = new AttributeFilterWidget(this.networkViewer.getNetworkData().getAttributes());
		
		this.networkViewer.onSelectionChange.addEventListener(function(sender,data){
			if(Ext.getCmp("editAttrWindow")){
				_this.attributeEditWidget.selectRowsById(data);
			}
			if(Ext.getCmp("filterAttrWindow")){
				_this.attributeFilterWidget.selectRowsById(data);
			}
		});
		
		this.attributeEditWidget.onSelectNodes.addEventListener(function(sender, data) {
			_this.networkViewer.selectNodes(data);
		});
		
		this.attributeFilterWidget.onSelectNodes.addEventListener(function(sender, data) {
			_this.networkViewer.selectNodes(data);
		});
		
		this.attributeFilterWidget.onDeselectNodes.addEventListener(function() {
			_this.networkViewer.deselectAllNodes();
		});
		
		this.attributeFilterWidget.onFilterNodes.addEventListener(function(sender, data) {
			_this.networkViewer.filterNodes(data);
		});
		
		this.attributeFilterWidget.onRestoreNodes.addEventListener(function() {
			_this.networkViewer.refresh();
		});
		
	}
	else {
		Ext.getCmp(this.centerPanelId).setActiveTab(this.grnViewer);
	}
};


CellBrowser.prototype.getPanel = function(){
	if(this.centerPanel==null){
//		var loginButton = new Ext.create('Ext.button.Button', {
//			text:'Sign in',
//			margin: '0 0 20 0',
//			handler: function (){
////			if($.cookie('bioinfo_sid') != null && $.cookie('bioinfo_sid') != "")
////				this.hide();
//			}
//		});
	
		//background-image:url(\'http:\/\/jsapi.bioinfo.cipf.es\/libs\/resources\/img\/wordle_tuned_white_crop.jpg\')
		var suiteInfo =  '<div style=" width: 800px;">'
			+'<h1>Overview</h1><br><span align="justify">RENATO (REgulatory Network Analysis TOol) is a network-based analysis web tool for the interpretation and visualization of transcriptional and post-transcriptional regulatory information, designed to identify common regulatory elements in a list of genes. RENATO maps these genes to the regulatory network, extracts the corresponding regulatory connections and evaluate each regulator for significant over-representation in the list. Ranked gene lists can also be analysed with RENATO.</span>'
			+'<br><br><br>'
			+'<p align="justify"><h1>Note</h1><br>This web application makes an intensive use of new web technologies and standards like HTML5, so browsers that are fully supported for this site are: Chrome 14+, Firefox 7+, Safari 5+ and Opera 11+. Older browser like Chrome13-, Firefox 5- or Internet Explorer 9 may rise some errors. Internet Explorer 6 and 7 are no supported at all.</p>'
			+'</div>';
		
		var loginInfo='<br><br><br><h1>Sign in</h1><br><p style=" width: 800px;">You must be logged in to use this Web application, you can <b><i>register</i></b> or use a <b><i>anonymous user</i></b> as shown in the following image by clicking on the <b><i>"Sign in"</i></b> button on the top bar</p><br><div style="float:left;"><img src="http://jsapi.bioinfo.cipf.es/libs/resources/img/loginhelpbutton.png"></div><img src="http://jsapi.bioinfo.cipf.es/libs/resources/img/loginhelp.png">';
		var homeLeft = Ext.create('Ext.panel.Panel', {
//			title:'Home',
			padding : 30,
			border:false,
			autoScroll:true,
			html: suiteInfo+loginInfo,
			bodyPadding:30,
			flex:1
		});
//		var homeRight = Ext.create('Ext.panel.Panel', {
////			title:'Home',
//			border:false,
////			html:'<h1>Sign in</h1><br><p>You must be logged in to use this Web application, you can register or use a <i>anonymous</i> as shown in the following image.</p><br><img src="http://jsapi.bioinfo.cipf.es/libs/resources/img/loginhelp.png">',
////			items:loginButton,
//			bodyPadding:30,
//			flex:0.3
//		});
		
		var homepanel = Ext.create('Ext.panel.Panel', {
//			padding : 30,
			margin:"50 0 0 0",
			title:'Home',
//			html: suiteInfo,
			layout: {
		        type: 'vbox',
		        align: 'stretch'
		    },
//			items: [homeLeft]
			items: []
		});
		
		var centerPanel = Ext.create('Ext.tab.Panel', {
			id: this.centerPanelId,
			region: 'center',
			border:false,
			activeTab: 0,
//			items : homepanel
			items : []
		});
		
		this._centerPanel = Ext.create('Ext.panel.Panel', {
			layout: 'border',
			border:false,
			width:this.width,
			height:this.height-this.headerWidget.height,
			items:[centerPanel,this.getEastPanel()]
		});
	}
	
	return this._centerPanel;
};

CellBrowser.prototype.getEastPanel = function(){
	var eastPanel = Ext.create('Ext.tab.Panel', {
		id: this.eastPanelId,
		region: 'east',
		style : 'border: 0',
		title: 'Jobs & Data list',
		collapsible : true,
		titleCollapse: true,
		animCollapse : false,
		width:280,
		collapseDirection:'top',
		activeTab:0
	});
	return eastPanel;
};




//Menu functions
CellBrowser.prototype.getMenuBar = function(){
	var _this = this;
	
	if (this.menuBar == null){
		var downloadMenu = Ext.create('Ext.menu.Menu', {
			items :[
			        {
			        	text:"PNG",
			        	href: "none",
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		// quit the image background
			        		var image = _this.networkViewer.getNetworkSvg().svg.removeChild(_this.networkViewer.networkSvg.backgroundImage);
							// serialize the svg
			        		var svg = new XMLSerializer().serializeToString(_this.networkViewer.getNetworkSvg().svg);
							// put again the image background
							_this.networkViewer.getNetworkSvg().svg.insertBefore(image, _this.networkViewer.getNetworkSvg().svgC);
							
							var canvas = DOM.createNewElement("canvas", document.body, [["id", _this.id+"png"],["visibility", _this.id+"hidden"]]);
							
							canvg(canvas, svg);

							this.getEl().child("a").set({
								href: canvas.toDataURL("image/png"),
								target: "_blank",
								download: "network.png"
							});
							
							$("#"+_this.id+"png").remove();
			        	}
			        },{
			        	text:"JPG", 
			        	href: "none",
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		// quit the image background
			        		var image = _this.networkViewer.getNetworkSvg().svg.removeChild(_this.networkViewer.networkSvg.backgroundImage);
							// serialize the svg
			        		var svg = new XMLSerializer().serializeToString(_this.networkViewer.getNetworkSvg().svg);
							// put again the image background
							_this.networkViewer.getNetworkSvg().svg.insertBefore(image, _this.networkViewer.getNetworkSvg().svgC);
							
			        		var canvas = DOM.createNewElement("canvas", document.body, [["id", _this.id+"jpg"],["visibility", _this.id+"hidden"]]);
			        		
			        		canvg(canvas, svg);
			        		
			        		this.getEl().child("a").set({
			        			href: canvas.toDataURL("image/jpeg"),
			        			target: "_blank",
			        			download: "network.jpg"
			        		});
			        		
			        		$("#"+_this.id+"jpg").remove();
			        	}
			        },
			        {
			        	text:"SVG (recommended)",
			        	href: "none",
			        	iconCls:'icon-blue-box',
			        	handler:function(){
			        		var svg = new XMLSerializer().serializeToString(_this.networkViewer.getNetworkSvg().svg);
			        		
			        		this.getEl().child("a").set({
			        			href: 'data:image/svg+xml,'+encodeURIComponent(svg),
			        			target: "_blank",
			        			download: "network.svg"
			        		});
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
//							_this.networkViewer.networkSvg.loadFromJson(data);
						});
					}
				},
				{
					text: 'Save as JSON',
					href: "none",
					handler: function(){
						var content = JSON.stringify(_this.networkViewer.toJSON());
						this.getEl().child("a").set({
							href: 'data:text/csv,'+encodeURIComponent(content),
							download: "network.json"
						});
					}
				}
				,'-',
//				{
//					text: 'Import',
//					menu: importLocalNetwork
//				},
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
				menu:_this.getAttributesMenu()
//				handler: function(){
//					var attributeManagerWidget = new AttributeManagerWidget(_this.attributes, _this.networkViewer.networkSvg.getSelectedNodes());
//					
////					var networkAttributesWidget = new NetworkAttributesWidget({title:'Attributes',wum:true,width:_this.width,height:_this.height});
////					networkAttributesWidget.draw(_this.networkViewer.networkWidget.getDataset(), _this.networkViewer.networkWidget.getFormatter(),_this.networkViewer.networkWidget.getLayout());
////					
////					networkAttributesWidget.verticesSelected.addEventListener(function(sender, vertices){
////						_this.networkWidget.deselectNodes();
////						_this.networkWidget.selectVerticesByName(vertices);
////					});
////					
////					
////					_this.networkViewer.networkWidget.onVertexOver.addEventListener(function(sender, nodeId){
////						var name = _this.networkViewer.networkWidget.getDataset().getVertexById(nodeId).getName();
////						_this.setNodeInfoLabel(networkAttributesWidget.getVertexAttributesByName(name).toString());
////					});
//					
//				}
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

CellBrowser.prototype.getAttributesMenu = function() {
	var _this = this;
	
	var filtersMenu = Ext.create('Ext.menu.Menu', {
		id: "filtersAttrMainMenu",
		items :[
		        {
		        	text:"Edit...",
		        	handler:function(){
		        		if(!Ext.getCmp("filterAttrWindow")){
		        			_this.attributeFilterWidget.draw(_this.networkViewer.getSelectedNodes());
		        		}
		        	}
		        },'-'
		       ]
	});
	
	var menu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [
		         {
		        	 text : 'Import...',
		        	 handler : function() {
		        		 var importAttributesFileWidget =  new ImportAttributesFileWidget({"numNodes": _this.networkViewer.getNumNodes()});
		        		 importAttributesFileWidget.draw();	
		        		 importAttributesFileWidget.onOk.addEventListener(function(sender, data){
		        			 _this.networkViewer.importAttributes(data);
		        		 });
		        	 }
		         },'-',
		         {
		        	 text : 'Edit...',
		        	 handler : function() {
		        		 if(!Ext.getCmp("editAttrWindow")){
		        			 _this.attributeEditWidget.draw(_this.networkViewer.getSelectedNodes());
		        		 }
		        	 }
		         },
		         {
		        	 text : 'Filters',
		        	 menu: filtersMenu,
		        	 handler : function() {
		        		 if(!Ext.getCmp("filterAttrWindow")){
		        			 _this.attributeFilterWidget.draw(_this.networkViewer.getSelectedNodes());
		        		 }
		        	 }
		         }
		        ]
	});
	return menu;
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
				}
//				,{
//					text : 'ID'
////					menu : this.getLabelMenu()
//				}, 
//				{
//					text : 'Functional term',
//					handler: function(){
//		        		_this.openViewer = "searcherViewer";
//		        		_this.networkViewer.loadMetaData();
//					}
//				}
	
		]
	});
	return viewMenu;
};

CellBrowser.prototype.getAnalysisMenu = function() {
	var _this=this;
	
	var importFileMenu = Ext.create('Ext.menu.Menu', {
		items :[
		        {
		        	text:"DOT",
		        	handler:function(){
		        		var dotNetworkFileWidget =  new DOTNetworkFileWidget({"networkData":_this.networkViewer.networkData});
		        		dotNetworkFileWidget.draw();	
		        		dotNetworkFileWidget.onOk.addEventListener(function(sender,data){
		        			_this.networkViewer.loadNetwork(data);
		        		});
		        	}
		        },
		        {
		        	text:"SIF",
		        	handler:function(){
		        		var sifNetworkFileWidget =  new SIFNetworkFileWidget({"networkData":_this.networkViewer.networkData});
		        		sifNetworkFileWidget.draw();	
		        		sifNetworkFileWidget.onOk.addEventListener(function(sender,data){
		        			_this.networkViewer.loadNetwork(data, "circle");
		        		});
		        	}
		        },
		        {
		        	text:"txt", 
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"SBML",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Biopax",
		        	handler:function(){
		        	}
		        }
		       ]
	});
	
	var importMenu = Ext.create('Ext.menu.Menu', {
		items :[
		        {
		        	text:"File",
		        	menu: importFileMenu
		        },
		        {
		        	text:"Reactome", 
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Intact",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Differential Expression Analysis",
		        	handler:function(){
		        	}
		        }
		       ]
	});
	
	var networkMenu = Ext.create('Ext.menu.Menu', {
		items :[
		        {
		        	text:"Cellular localization network",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Genome structure network", 
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Shortestspath",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Merge",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Network generator",
		        	handler:function(){
		        	}
		        }
		       ]
	});
	
	var functionalMenu = Ext.create('Ext.menu.Menu', {
		items :[
		        {
		        	text:"Functional network",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Regulation network", 
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Clustering network",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Disease network",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Interactome 3D",
		        	handler:function(){
		        	}
		        }
		       ]
	});
	
	var pathwayMenu = Ext.create('Ext.menu.Menu', {
		items :[
		        {
		        	text:"Network miner",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"PODA", 
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Probability path",
		        	handler:function(){
		        	}
		        },
		        {
		        	text:"Superpathways",
		        	handler:function(){
		        	}
		        }
		       ]
	});
	
	var analysisMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
					text: 'Import',
					menu: importMenu
				},
				{
					text: 'Network analysis',
					menu: networkMenu
				},
				{
					text: 'Functional enrichment',
					menu: functionalMenu
				},
				{
					text: 'Pathway based analysis',
					menu: pathwayMenu
				}
//					text : 'Expression',
//					handler: function(){
//						_this.networkViewer.expressionSelected();
//					}
//				}
//				, 
//				{
//					text : 'Interactome browser',
//					handler: function(){
//					}
//				},
//				{
//					text : 'Reactome browser',
//					handler: function(){
//						_this.networkViewer.reactomeSelected();
//					}
//				}
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
	var plugins_cat = CELLBROWSER_AVAILABLE_PLUGINS;
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
						CELLBROWSER_REGISTERED_PLUGINS[this.pluginName].draw();
						CELLBROWSER_REGISTERED_PLUGINS[this.pluginName].launch();
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
						CELLBROWSER_REGISTERED_PLUGINS[this.pluginName].draw();
						CELLBROWSER_REGISTERED_PLUGINS[this.pluginName].launch();
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

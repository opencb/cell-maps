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

FatigoPlugin.prototype = new GenericFormPanel("fatigo");

function FatigoPlugin(cellbrowser) {
	this.id = Math.round(Math.random() * 10000000);
	
	this.cellbrowser = cellbrowser;
	
	this.onSelectNodes = new Event(this);
};

FatigoPlugin.prototype.beforeRun = function() {
	var selectedNodes = this.cellbrowser.getNodeLabelsFromNodeList(this.cellbrowser.getSelectedNodes()); 
	this.paramsWS["list1fromtxt"] = selectedNodes.toString().replace(/,/g,"\n");
	
	if(Ext.getCmp(this.id + "defComparison").getValue().comparison == "snvrn") {
		var unselectedNodes = this.cellbrowser.getUnselectedNodes();
		this.paramsWS["list2fromtxt"] = unselectedNodes.toString().replace(/,/g,"\n");
	}
	
	if(this.paramsWS["go-bp"] && this.paramsWS["go-bp"] == true) {
		this.paramsWS["go-bp"] = "";
	}
	else {
		delete this.paramsWS["go-bp"];
	}
	
	if(this.paramsWS["go-mf"] && this.paramsWS["go-mf"] == true) {
		this.paramsWS["go-mf"] = "";
	}
	else {
		delete this.paramsWS["go-mf"];
	}
	
	if(this.paramsWS["go-cc"] && this.paramsWS["go-cc"] == true) {
		this.paramsWS["go-cc"] = "";
	}
	else {
		delete this.paramsWS["go-cc"];
	}
	
	if(this.paramsWS["go-slim"] && this.paramsWS["go-slim"] == true) {
		this.paramsWS["go-slim"] = "";
	}
	else {
		delete this.paramsWS["go-slim"];
	}
	
	if(this.paramsWS["jaspar"] && this.paramsWS["jaspar"] == true) {
		this.paramsWS["jaspar"] = "";
	}
	else {
		delete this.paramsWS["jaspar"];
	}
	
	if(this.paramsWS["mirna"] && this.paramsWS["mirna"] == true) {
		this.paramsWS["mirna"] = "";
	}
	else {
		delete this.paramsWS["mirna"];
	}
};

//TODO DELETE
FatigoPlugin.prototype.runOLD = function() {
	var _this = this;
	
	this.paramsWS = this.getForm().getForm().getFieldValues();
	this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
	
	// Upload list1 file
	var selectedNodes = this.cellbrowser.getNodeLabelsFromNodeList(this.cellbrowser.getSelectedNodes()); 
	var formData1 = new FormData();
	formData1.append("file", selectedNodes.toString().replace(/,/g,"\n"));
	var gcsaManager1 = new GcsaManager();
	gcsaManager1.onUploadDataToProject.addEventListener(function(sender, response) {
		if(response.data.indexOf("ERROR") == -1) {
			_this.paramsWS["list1"] = response.data;
			
			// Upload list2 file
			if(Ext.getCmp(_this.id + "defComparison").getValue().comparison == "snvrn") {
				var unselectedNodes = _this.cellbrowser.getUnselectedNodes();
				var formData2 = new FormData();
				formData2.append("file", unselectedNodes.toString().replace(/,/g,"\n"));
				var gcsaManager2 = new GcsaManager();
				gcsaManager2.onUploadDataToProject.addEventListener(function(sender, response){
					if(response.data.indexOf("ERROR") == -1) {
						_this.paramsWS["list2"] = response.data;
						callWS();
					}
					else {
						console.log(response.data);
					}
				});
				gcsaManager2.uploadDataToProject($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), "default", "fatigoList2", formData2, true);
			}
			else {
				callWS();
			}
		}
		else {
			console.log(response.data);
		}
	});
	gcsaManager1.uploadDataToProject($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), "default", "fatigoList1", formData1, true);
	
	var callWS = function() {
		_this.gcsaManager.runAnalysis(_this.analysis, _this.paramsWS);
		
		
	};
};

FatigoPlugin.prototype.getPanels = function() {
	return [
	         this._getComparisonPanel(),
	         this._getOptionsPanel(),
	         this._getDatabasesPanel()
	        ];
};

FatigoPlugin.prototype._getComparisonPanel = function() {
	var _this = this;
	
	return Ext.create('Ext.panel.Panel', {
		title: 'Define your comparison',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "100%",
		buttonAlign:'center',
		items:[
		       {
		    	   xtype: 'radiogroup',
		    	   id : this.id + "defComparison",
		    	   columns: 1,
		    	   vertical: true,
		    	   items: [
		    	           { boxLabel: 'Selected nodes vs Rest of nodes', name: 'comparison', inputValue: 'snvrn', checked: true},
		    	           { boxLabel: 'Selected nodes vs Rest of genome', name: 'comparison', inputValue: 'snvrg'}
		    	   ]
		       }
		      ]
	});
};

FatigoPlugin.prototype._getOptionsPanel = function() {
	var fisherValues = Ext.create('Ext.data.Store', {
		fields: ['value', 'name'],
		data : [
		        {"value":"two-tailed", "name":"Two tailed"},
		        {"value":"less", "name":"Over-represented terms in selected nodes (genome comparison)"},
		        {"value":"greater", "name":"Over-represented terms in non-selected nodes"}
		       ]
	});
	
	var duplicateValues = Ext.create('Ext.data.Store', {
		fields: ['value', 'name'],
		data : [
		        {"value":"never", "name":"Never"},
		        {"value":"each", "name":"Remove on each selection separately"},
		        {"value":"each", "name":"Remove on each selection and common ids"},
		        {"value":"ref", "name":"Remove from non-selected those appearing in selected (complementary list)"}
		       ]
	});
	
	return Ext.create('Ext.panel.Panel', {
		title: 'Options',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "100%",
		buttonAlign:'center',
		items:[
		       this.createCombobox("fisher", "Fisher exact test", fisherValues, 0, 115),
		       this.createCombobox("duplicates", "Remove duplicates?", duplicateValues, 0)
		      ]
	});
};

FatigoPlugin.prototype._getDatabasesPanel = function() {
	var organismValues = Ext.create('Ext.data.Store', {
		fields: ['value', 'name'],
		data : [
		        {"value":"hsapiens", "name":"Human (homo sapiens)"},
		        {"value":"mmusculus", "name":"Mouse (mus musculus)"}
//		        {"value":"rnorvegicus", "name":"Rat (rattus norvegicus)"},
//		        {"value":"dmelanogaster", "name":"Fruitfly (drosophila melanogaster)"},
//		        {"value":"btaurus", "name":"Cow (bos taurus)"},
//		        {"value":"drerio", "name":"Zebrafish (danio rerio)"},
//		        {"value":"scerevisiae", "name":"Saccharomyces cerevisiae"},
//		        {"value":"celegans", "name":"Caenorhabditis elegans"},
//		        {"value":"athaliana", "name":"Arabidopsis thaliana"}
		       ]
	});
	
	var goBPContainer = Ext.create('Ext.container.Container', {
		layout: "hbox",
		items:[
		       this.createCheckBox("go-bp", "GO biological process", false, '8 0 0 0', false),
		       {
		           xtype: 'numberfield',
		           name: 'goBPMin',
		           margin: '5 0 0 20',
		           width: '10',
		           flex: 0.5,
		           fieldLabel: 'Min',
		           labelWidth: '20',
		           value: 5,
		           minValue: 0
		       },
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goBPMax',
		    	   margin: '5 0 0 20',
		    	   width: '10',
		           flex: 0.5,
		    	   fieldLabel: 'Max',
		    	   labelWidth: '22',
		    	   value: 1000,
		    	   minValue: 0
		       }
		      ]
	});
	
	var goMFContainer = Ext.create('Ext.container.Container', {
		layout: "hbox",
		items:[
		       this.createCheckBox("go-mf", "GO molecular function", false, '8 0 0 0', false),
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goMFMin',
		    	   margin: '5 0 0 19',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Min',
		    	   labelWidth: '20',
		    	   value: 5,
		    	   minValue: 0
		       },
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goMFMax',
		    	   margin: '5 0 0 20',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Max',
		    	   labelWidth: '22',
		    	   value: 1000,
		    	   minValue: 0
		       }
		       ]
	});
	
	var goCCContainer = Ext.create('Ext.container.Container', {
		layout: "hbox",
		items:[
		       this.createCheckBox("go-cc", "GO cellular component", false, '8 0 0 0', false),
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goCCMin',
		    	   margin: '5 0 0 15',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Min',
		    	   labelWidth: '20',
		    	   value: 5,
		    	   minValue: 0
		       },
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goCCMax',
		    	   margin: '5 0 0 20',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Max',
		    	   labelWidth: '22',
		    	   value: 1000,
		    	   minValue: 0
		       }
		       ]
	});
	
	var goSlimContainer = Ext.create('Ext.container.Container', {
		layout: "hbox",
		items:[
		       this.createCheckBox("go-slim", "GOSlim GOA", false, '8 0 0 0', false),
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goSlimMin',
		    	   margin: '5 0 0 69',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Min',
		    	   labelWidth: '20',
		    	   value: 5,
		    	   minValue: 0
		       },
		       {
		    	   xtype: 'numberfield',
		    	   name: 'goSlimMax',
		    	   margin: '5 0 0 20',
		    	   width: '10',
		    	   flex: 0.5,
		    	   fieldLabel: 'Max',
		    	   labelWidth: '22',
		    	   value: 1000,
		    	   minValue: 0
		       }
		       ]
	});
	
	return Ext.create('Ext.panel.Panel', {
		title: 'Databases',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "100%",
		buttonAlign:'center',
		items:[
		       this.createCombobox("species", "Organism", organismValues, 0),
		       goBPContainer,
		       goMFContainer,
		       goCCContainer,
		       goSlimContainer,
		       this.createCheckBox("mirnA", "miRNA targets", false, '8 0 0 0', false),
		       this.createCheckBox("jaspar", "Jaspar TFBS", false, '8 0 0 0', false)
		      ]
	});
};

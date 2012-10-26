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

function ReactomePlugin() {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	
	this.onAddNode = new Event(this);
	this.onNeedClear = new Event(this);
	this.onNeedRefresh = new Event(this);
};

ReactomePlugin.prototype.draw = function(selectedNodes) {
	var _this = this;
	
	Ext.define('pathwayModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	             {name:'text', mapping: 'displayName' }
//	             {name:'children', mapping :'subPathways'}
	            ]
	});
	
	var store = Ext.create('Ext.data.TreeStore', {
		model: 'pathwayModel',
//        proxy: {
//            type: 'ajax',
//            url: 'http://localhost:8080/cellbase/rest/latest/hsa/network/reactome-pathway/tree',
//            reader: {
//                type: 'json'
//            }
//        },
        root: {
            title: 'Pathways',
            expand: true,
            children:[]
        }
    });
	

    var tree = Ext.create('Ext.tree.Panel', {
        store: store,
        rootVisible: false,
        useArrows: true,
        listeners: {
        	itemclick : function(view, record, item, index, e) {
        		var pathwayId = record.raw.name;
        		
//        		_this.onNeedClear.notify();
        		
        		$.ajax({url:"http://localhost:8080/cellbase/rest/latest/hsa/network/reactome-pathway/"+pathwayId+"/info",success:function(data){
        			var json = JSON.parse(data)[0];
        			for(var i=0, len=json.subPathways.length; i<len; i++) {
        				_this.addPathway(json.subPathways[i].name, json.subPathways[i].displayName[0]);
        			}
        			_this.onNeedRefresh.notify();
        		}});
        	}
        }
    });
	
	var window = Ext.create('Ext.window.Window', {
		title : "Reactome plugin",
		height : 550,
		width : 350,
		layout : "fit",
		items : tree
	}).show();
	
	window.setLoading(true);
	
	$.ajax({url:"http://localhost:8080/cellbase/rest/latest/hsa/network/reactome-pathway/tree",success:function(data){
		var json = JSON.parse(data.replace(/\"subPathways\" : \[ \]/g,"\"leaf\":true").replace(/subPathways/g,"children"));
		store.setRootNode({
			children:json
		});
		window.setLoading(false);
	}});
};

ReactomePlugin.prototype.addPathway = function(name, displayName) {
	var args = {};
	args.name = name;
	args.type = "pathway";
	args.metainfo = {
		"label": displayName
	};
	
	this.onAddNode.notify(args);
};

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

function IntactPlugin() {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	
	this.onSelectNodes = new Event(this);
};

IntactPlugin.prototype.draw = function(selectedNodes) {
	var _this = this;
	
	var form = Ext.create('Ext.form.Panel', {
		border: false,
//		bodyStyle: 'background: #dedcd8',
		bodyPadding: "10 5 10 5",
		layout: 'vbox',
		items: [
				{
				    xtype: 'radiogroup',
				    id : this.id + "searchOver",
				    fieldLabel: 'Search over',
				    margin: "0 0 0 10",
				    columns: 1,
				    vertical: true,
//				    columnWidth: '280',
				    items: [
				        { boxLabel: 'All nodes', name: 'rb', inputValue: 'all', checked: true},
				        { boxLabel: 'Selected nodes', name: 'rb', inputValue: 'selected'}
				    ]
				},
		        {
		        	xtype : 'numberfield',
		        	id : this.id + "searchLimit",
		        	fieldLabel: 'Max. number of nodes between interactions:',
		        	labelWidth : 270,
		        	width : 450,
		        	margin: "10 0 0 10",
		        	allowBlank : false,
		        	value: 3,
		            maxValue: 100,
		            minValue: 0
		        },
		        {
		        	xtype: 'button',
		        	text: 'Ok',
		        	margin: "100 0 0 425",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var searchOver = Ext.getCmp(_this.id + "searchOver").getChecked()[0].inputValue;
		        		var searchLimit = Ext.getCmp(_this.id + "searchLimit").getValue();
		        		
		        		console.log(searchOver);
		        		console.log(searchLimit);
		        	}
		        }
       ]
	});
	
	Ext.create('Ext.window.Window', {
		title : "Intact plugin",
		height : 250,
		width : 500,
		layout : "fit",
		items : form
	}).show();
};

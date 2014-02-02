/*
 * Copyright (c) 2014 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2014 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2014 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function CellMapsConfiguration(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('CellMapsConfigurationPanel');

    this.width = 300;
    this.height = 600;

    this.nodeAttributeManager;
    this.edgeAttributeManager;

    //set instantiation args, must be last
    _.extend(this, args);

    this.panel;
    this.nodeComboStore;
    this.edgeComboStore;

    this.vertexDefaults = {
        shape: 'circle',
        size: 20,
        color: '#9fc6e7',
        strokeSize: 1,
        strokeColor: '#9fc6e7',
        opacity: 0.8,
        labelSize: 12,
        labelColor: '#111111'
    };
    this.edgeDefaults = {
        shape: 'undirected',
        size: 1,
        color: '#cccccc',
        opacity: 1,
        labelSize: 0,
        labelColor: '#111111'
    }


    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CellMapsConfiguration.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');

            return;
        }
        this.nodeAttributeManager.on('change:attributes', function () {
            _this.reconfigureNodeComponents();
        });
        this.edgeAttributeManager.on('change:attributes', function () {
            _this.reconfigureEdgeComponents();
        });

        this.nodeComboStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.nodeAttributeManager.attributes
        });
        this.edgeComboStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.edgeAttributeManager.attributes
        });

        this.panel = Ext.create('Ext.panel.Panel', {
//            title: 'Configuration',
            width: this.width,
            height: this.height,
//            collapsible: true,
//            titleCollapse: true,
//            border:false,
            layout: 'accordion',
            hidden: true,
            items: [this.createPropertiesPanel()],
            renderTo: this.targetId
        });

        this.colorMenu = this._createColorMenu();

    },
    setNodeAttributeManager: function (attrMan) {
        var _this = this;
        this.nodeAttributeManager = attrMan;
        this.nodeAttributeManager.on('change:attributes', function () {
            _this.reconfigureNodeComponents();
        });
        this.reconfigureNodeComponents();
    },
    reconfigureNodeComponents: function () {
        this.nodeComboStore.loadData(this.nodeAttributeManager.attributes);
    },

    setEdgeAttributeManager: function (attrMan) {
        var _this = this;
        this.edgeAttributeManager = attrMan;
        this.edgeAttributeManager.on('change:attributes', function () {
            _this.reconfigureEdgeComponents();
        });
        this.reconfigureEdgeComponents();
    },
    reconfigureEdgeComponents: function () {
        this.edgeComboStore.loadData(this.edgeAttributeManager.attributes);
    },
    getColorDiv: function (color) {
        return '<div style="width:30px;height:12px;background-color: ' + color + ';"></div>';
    },
    getColorSelect: function (defaultColor, handler) {
        var _this = this;

        return {
            xtype: 'box',
            margin: '4 10 0 0',
            name: 'colorBox',
            html: '<div style="border:1px solid gray;width:65px;height:15px;background-color: ' + defaultColor + ';" color="' + defaultColor + '"></div>',
            setColor: function (color) {
                var el = this.getEl();
                $(el.dom).find('div').attr('color', color);
                $(el.dom).find('div').css({'background-color': color});
            },
            listeners: {
                afterrender: function (box) {
                    var el = this.getEl();
                    el.on('click', function (e, t, eOpts) {
                        var x = e.browserEvent.clientX;
                        var y = e.browserEvent.clientY;
                        _this._showColorMenu(x, y, function (color) {
                            $(el.dom).find('div').attr('color', color);
                            $(el.dom).find('div').css({'background-color': color});

                            if ($.isFunction(handler)) {
                                handler(color, box);
                            }
                        });
                    });
                }
            }
        }
    },
    createAttributeColorComponent: function (args) {
        var _this = this;

        var visualSettingWindow;

        return {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    text: args.displayAttribute,
                    width: 80,
                    margin: '5 0 0 0'
                },
                this.getColorSelect(args.defaultValue, function (color, box) {
                    _this.trigger(args.eventName, {color: color});
                    args.defaultValue = color;
                    var triggerObject = box.ownerCt.triggerObject;
                    if (triggerObject) {
                        _this.trigger(args.attributeEventName, triggerObject);
                    }
                }),
                {
                    xtype: 'button',
                    text: 'Select attribute',
                    width: 100,
                    handler: function () {
                        visualSettingWindow.show();
                    },
                    listeners: {
                        afterrender: function (bt) {
                            args.visualComponent = bt.ownerCt;
                            args.okHandler = function (attributeName, triggerObject) {
                                bt.setText(attributeName);
                                bt.nextNode().enable();
                                bt.ownerCt.triggerObject = triggerObject;
                            }
                            visualSettingWindow = _this.createColorMappingWindow(args);
                        }
                    }
                },
                {
                    xtype: 'button',
                    disabled: true,
                    text: '<span class="bootstrap"><span class="glyphicon glyphicon-remove" style="font-size: 15px"></span></span>',
                    handler: function (bt) {
                        bt.previousSibling().setText('Select attribute');
                        bt.disable();
                        var color = $(bt.previousNode().previousNode().getEl().dom).find('div').attr('color');
                        delete bt.ownerCt.triggerObject;
                        _this.trigger(args.eventName, {color: color});
                    }
                }
            ]
        }
    },
    createAttributeNumberComponent: function (args) {
        var _this = this;

        var visualSettingWindow;

        return {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    text: args.displayAttribute,
                    width: 80,
                    margin: '5 0 0 0'
                },
                {
                    xtype: 'numberfield',
                    width: 65,
                    value: args.defaultValue,
                    maxValue: args.maxvalue,
                    minValue: args.minValue,
                    step: args.step,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    _this.trigger(args.eventName, {value: newValue});
                                    args.defaultValue = newValue;
                                    var triggerObject = field.ownerCt.triggerObject;
                                    if (triggerObject) {
                                        _this.trigger(args.attributeEventName, triggerObject);
                                    }

                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Select attribute',
                    width: 100,
                    handler: function () {
                        visualSettingWindow.show();
                    },
                    listeners: {
                        afterrender: function (bt) {
                            args.visualComponent = bt.ownerCt;
                            args.okHandler = function (attributeName, triggerObject) {
                                bt.setText(attributeName);
                                bt.nextNode().enable();
                                bt.ownerCt.triggerObject = triggerObject;
                            }
                            visualSettingWindow = _this.createNumberMappingWindow(args);
                        }
                    }
                },
                {
                    xtype: 'button',
                    disabled: true,
                    text: '<span class="bootstrap"><span class="glyphicon glyphicon-remove" style="font-size: 15px"></span></span>',
                    handler: function (bt) {
                        bt.previousSibling().setText('Select attribute');
                        bt.disable();
                        var value = bt.previousNode().previousNode().getValue();
                        delete bt.ownerCt.triggerObject;
                        _this.trigger(args.eventName, {value: value});
                    }
                }
            ]
        }
    },
    createAttributeComboComponent: function (args) {
        var _this = this;

        var visualSettingWindow;

        return {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    width: 80,
                    margin: '5 0 0 0',
                    text: args.displayAttribute
                },
                {
                    xtype: 'combo',
                    value: args.defaultValue,
                    store: args.comboValues,
                    width: 65,
                    margin: '0 10 0 0',
                    listeners: {
                        change: function (field, e) {
                            var value = field.getValue();
                            if (value != null) {
                                _this.trigger(args.eventName, {value: value});
                                args.defaultValue = value;
                                var triggerObject = field.ownerCt.triggerObject;
                                if (triggerObject) {
                                    _this.trigger(args.attributeEventName, triggerObject);
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Select attribute',
                    width: 100,
                    handler: function () {
                        visualSettingWindow.show();
                    },
                    listeners: {
                        afterrender: function (bt) {
                            args.visualComponent = bt.ownerCt;
                            args.okHandler = function (attributeName, triggerObject) {
                                bt.setText(attributeName);
                                bt.nextNode().enable();
                                bt.ownerCt.triggerObject = triggerObject;
                            }
                            visualSettingWindow = _this.createComboMappingWindow(args);
                        }
                    }
                },
                {
                    xtype: 'button',
                    disabled: true,
                    text: '<span class="bootstrap"><span class="glyphicon glyphicon-remove" style="font-size: 15px"></span></span>',
                    handler: function (bt) {
                        bt.previousSibling().setText('Select attribute');
                        bt.disable();
                        var value = bt.previousNode().previousNode().getValue();
                        delete bt.ownerCt.triggerObject;
                        _this.trigger(args.eventName, {value: value});
                    }
                }
            ]
        }
    },
    createLabelComboComponent: function (args) {
        var _this = this;
        return {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    width: 80,
                    margin: '5 0 0 0',
                    text: 'Attribute'
                },
                {
                    xtype: 'combo',
                    store: args.comboStore,
                    displayField: 'name',
                    valueField: 'name',
                    width: 120,
                    queryMode: 'local',
                    margin: '0 10 0 0',
                    listeners: {
                        change: function (field, e) {
                            var value = field.getValue();
                            if (value != null) {
                                _this.trigger(args.eventName, {value: value});
                            }
                        }
                    }
                }
            ]
        }
    },

    createPropertiesPanel: function () {
        var _this = this;

        this.propertiesPanel = Ext.create('Ext.tab.Panel', {
            title: 'Visualization settings',
            autoHeight: true,
            width: 600,
            border: false,
            defaults: {
                border: false,
                bodyPadding: 5
            },
            items: [
                {
                    title: 'Nodes',
                    defaults: {
                        anchor: '100%',
                        labelWidth: 100,
                        margin: '0 0 2 0'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: '0 0 5 0',
                            style: {
                                borderBottom: '1px solid gray'
                            },
                            defaults: {
                                style: {
                                    fontWeight: 'bold'
                                }
                            },
                            items: [
                                {xtype: 'text', width: 80, margin: '0 0 0 0', text: 'Name'},
                                {xtype: 'text', width: 65, margin: '0 10 0 0', text: 'Default'},
                                {xtype: 'text', width: 100, text: 'Attribute'}
                            ]
                        },
                        this.createAttributeColorComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeColor',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.color,
                            displayAttribute: 'Color'
                        }),
                        this.createAttributeColorComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeStrokeColor',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.strokeColor,
                            displayAttribute: 'Stroke color'
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeSize',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.size,
                            displayAttribute: 'Size',
                            maxValue: 160,
                            minValue: 0,
                            step: 1
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeStrokeSize',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.strokeSize,
                            displayAttribute: 'Stroke size',
                            maxValue: 10,
                            minValue: 0,
                            step: 1
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeOpacity',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.opacity,
                            displayAttribute: 'Opacity',
                            maxValue: 1,
                            minValue: 0,
                            step: 0.1
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeLabelSize',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.labelSize,
                            displayAttribute: 'Label size',
                            maxValue: 16,
                            minValue: 0,
                            step: 1
                        }),
                        this.createAttributeComboComponent({
                            attributeManager: this.nodeAttributeManager,
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeShape',
                            attributeEventName: 'change:nodeDiplayAttribute',
                            defaultValue: this.vertexDefaults.shape,
                            displayAttribute: 'Shape',
                            comboValues: ["circle", "square", "ellipse", "rectangle"]
                        }),
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: '20 0 5 0',
                            style: {
                                borderBottom: '1px solid gray'
                            },
                            defaults: {
                                style: {
                                    fontWeight: 'bold'
                                }
                            },
                            items: [
                                {xtype: 'text', margin: '0 0 0 0', text: 'Set attribute as label'}
                            ]
                        },
                        this.createLabelComboComponent({
                            comboStore: this.nodeComboStore,
                            eventName: 'change:nodeLabel'
                        })
                    ]
                },
                {
                    title: 'Edges',
                    defaults: {
                        anchor: '100%',
                        labelWidth: 100,
                        margin: '0 0 2 0'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: '0 0 5 0',
                            style: {
                                borderBottom: '1px solid gray'
                            },
                            defaults: {
                                style: {
                                    fontWeight: 'bold'
                                }
                            },
                            items: [
                                {xtype: 'text', width: 80, margin: '0 0 0 0', text: 'Name'},
                                {xtype: 'text', width: 65, margin: '0 10 0 0', text: 'Default'},
                                {xtype: 'text', width: 100, text: 'Attribute'}
                            ]
                        },

                        this.createAttributeColorComponent({
                            attributeManager: this.edgeAttributeManager,
                            comboStore: this.edgeComboStore,
                            eventName: 'change:edgeColor',
                            attributeEventName: 'change:edgeDiplayAttribute',
                            defaultValue: this.edgeDefaults.color,
                            displayAttribute: 'Color'
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.edgeAttributeManager,
                            comboStore: this.edgeComboStore,
                            eventName: 'change:edgeSize',
                            attributeEventName: 'change:edgeDiplayAttribute',
                            defaultValue: this.edgeDefaults.size,
                            displayAttribute: 'Size',
                            maxValue: 10,
                            minValue: 0,
                            step: 1
                        }),
                        this.createAttributeNumberComponent({
                            attributeManager: this.edgeAttributeManager,
                            comboStore: this.edgeComboStore,
                            eventName: 'change:edgeLabelSize',
                            attributeEventName: 'change:edgeDiplayAttribute',
                            defaultValue: this.edgeDefaults.labelSize,
                            displayAttribute: 'Label size',
                            maxValue: 16,
                            minValue: 0,
                            step: 1
                        }),
                        this.createAttributeComboComponent({
                            attributeManager: this.edgeAttributeManager,
                            comboStore: this.edgeComboStore,
                            eventName: 'change:edgeShape',
                            attributeEventName: 'change:edgeDiplayAttribute',
                            defaultValue: this.edgeDefaults.shape,
                            displayAttribute: 'Shape',
                            comboValues: ["directed", "undirected", "inhibited", "dot", "odot"]
                        }),
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: '20 0 5 0',
                            style: {
                                borderBottom: '1px solid gray'
                            },
                            defaults: {
                                style: {
                                    fontWeight: 'bold'
                                }
                            },
                            items: [
                                {xtype: 'text', margin: '0 0 0 0', text: 'Set attribute as label'}
                            ]
                        },
                        this.createLabelComboComponent({
                            comboStore: this.edgeComboStore,
                            eventName: 'change:edgeLabel'
                        })
                    ]

                }
            ]
        });
        return this.propertiesPanel;
    },
    createColorMappingWindow: function (args) {
        var _this = this;
        var gridMap = {};
        args.getAttributeGrid = function (attributeName) {
            if (typeof gridMap[attributeName] === 'undefined') {
                args.attributeName = attributeName;
                gridMap[attributeName] = _this._createColorGrid(args);
            }
            return gridMap[attributeName];
        };
        return this.createMappingWindow(args);
    },
    createNumberMappingWindow: function (args) {
        var _this = this;
        var gridMap = {};
        args.getAttributeGrid = function (attributeName) {
            if (typeof gridMap[attributeName] === 'undefined') {
                args.attributeName = attributeName;
                gridMap[attributeName] = _this._createNumberGrid(args);
            }
            return gridMap[attributeName];
        };
        return this.createMappingWindow(args);
    },
    createComboMappingWindow: function (args) {
        var _this = this;
        var gridMap = {};
        args.getAttributeGrid = function (attributeName) {
            if (typeof gridMap[attributeName] === 'undefined') {
                args.attributeName = attributeName;
                gridMap[attributeName] = _this._createComboGrid(args);
            }
            return gridMap[attributeName];
        };
        return this.createMappingWindow(args);
    },
    createMappingWindow: function (args) {
        var _this = this;

        var stringMappingPanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            layout: 'fit'
        });

        var numberMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'Number mapping',
            border: 0,
            layout: 'fit'
        });

        var ListStringMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'List string mapping',
            border: 0,
            layout: 'fit'
        });
        var ListNumberMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'List number mapping',
            border: 0,
            layout: 'fit'
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    xtype: 'combo',
                    margin: '0 0 0 10',
                    width: 200,
                    labelWidth: 80,
                    fieldLabel: 'Attribute name',
                    store: args.comboStore,
                    queryMode: 'local',
                    qid: 'attrCombo',
                    displayField: 'name',
                    valueField: 'name',
                    forceSelection: true,
                    editable: false,
                    listeners: {
                        afterrender: function () {
                            this.select(this.getStore().getAt(0));
                        },
                        change: function (combo, select) {
                            console.log(select)
                            stringMappingPanel.removeAll(false);
                            stringMappingPanel.add(args.getAttributeGrid(select));
                        }
                    }
                },
                {
                    xtype: 'combo',
                    margin: '0 0 0 10',
                    width: 200,
                    labelWidth: 70,
                    fieldLabel: 'Attribute type',
                    qid: 'typeCombo',
                    store: ['String'/*,'Number','List string','List number'*/],
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    forceSelection: true,
                    editable: false,
                    listeners: {
                        afterrender: function () {
                            this.select(this.getStore().getAt(0));
                            attrComboId = this.id
                        },
                        change: function (combo, select) {
                            console.log(select);
                            var cont = combo.up('window').down('container[qid=gridContainer]');
                            cont.removeAll(false);
                            switch (select) {
                                case 'String':
                                    cont.add(stringMappingPanel);
                                    break;
//                                case 'number':
//                                    cont.add(numberMappingPanel);
//                                    break;
//                                case 'liststring':
//                                    cont.add(ListStringMappingPanel);
//                                    break;
//                                case 'listnumber':
//                                    cont.add(ListNumberMappingPanel);
//                                    break;

                            }
                        }
                    }
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: args.displayAttribute + ' by attributes',
            height: 400,
            width: 600,
            closable: false,
            constrain: true,
//            modal: true,
            layout: 'fit',
            defaults: {
                margin: '0 0 0 0'
            },
            dockedItems: [toolbar],
            items: [
                {
                    xtype: 'container',
                    qid: 'gridContainer',
                    layout: 'fit'
                }
            ],
            buttons: [
                {
                    text: 'Close',
                    handler: function (bt) {
                        bt.up('window').hide();
                    }
                },
                {
                    text: 'Ok',
                    handler: function (bt) {
                        var typeCombo = bt.up('window').down('combo[qid=typeCombo]');
                        var attrCombo = bt.up('window').down('combo[qid=attrCombo]');

                        var attributeName = attrCombo.getValue();

                        var st = args.getAttributeGrid(attributeName).getStore();

                        var aux = st.getRange();
                        var map = {};
                        for (var i = 0; i < aux.length; i++) {
                            var d = aux[i].data;
                            if (args.type == "number") {
                                d.visualParam = parseFloat(d.visualParam);
                            }
                            map[d.value] = d.visualParam;
                        }
//                        console.log(map);

                        var triggerObject = {diplayAttribute: Utils.camelCase(args.displayAttribute), attribute: attributeName, map: map, sender: _this};
                        _this.trigger(args.attributeEventName, triggerObject)

                        args.okHandler(attributeName, triggerObject);

                        bt.up('window').hide();

                    }
                }
            ]
        });
        return window;
    },
    _getUniqueValues: function (args) {
        var values = args.attributeManager.getUniqueByAttribute(args.attributeName);
        var valuesData = [];
        for (var j = 0; j < values.length; j++) {
            var value = values[j];
            valuesData.push({value: value, visualParam: args.defaultValue});
        }
        return valuesData;
    },
    _createUniqueStore: function (args) {
        var store = Ext.create('Ext.data.Store', {
            pageSize: 50,
            proxy: {type: 'memory'},
            fields: ['value', 'visualParam'],
            data: this._getUniqueValues(args)
        });
        args.uniqueStore = store;
        return store;
    },
    _updateUniqueStore: function (config, modifiedFieldNames, store) {
        if (config.attributeName === modifiedFieldNames[0]) {
            var data = store.snapshot || store.data;
            var records = data.items;
            var dirtyRecords = {};
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                if (record.dirty) {
                    dirtyRecords[record.get('value')] = record.get('visualParam');
                }
            }

            store.loadData(this._getUniqueValues(config));


            var data = store.snapshot || store.data;
            var records = data.items;
            store.suspendEvents();
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                var dirtyValue = dirtyRecords[record.get('value')];
                if (dirtyValue) {
                    record.set('visualParam', dirtyValue);
                }
            }
            store.resumeEvents();
            store.fireEvent('refresh');

            var triggerObject = config.visualComponent.triggerObject;
            if (triggerObject) {
                this.trigger(config.attributeEventName, triggerObject);
            }
        }
    },
    _createColorGrid: function (args) {
        var _this = this;
        var store = this._createUniqueStore(args);

        var config = {};
        _.extend(config, args);
        args.attributeManager.store.on('update', function (st, record, operation, modifiedFieldNames) {
            _this._updateUniqueStore(config, modifiedFieldNames, store);
        });

        this.on(args.eventName, function (e) {
            args.defaultValue = e.color;
            grid.down('box[name=colorBox]').setColor(e.color);

            var data = store.snapshot || store.data;
            var records = data.items;
            store.suspendEvents();
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                if (!record.dirty) {
                    record.set('visualParam', e.color);
                    record.commit();
                }
            }
            store.resumeEvents();
            store.fireEvent('refresh');
        });

        var grid = Ext.create('Ext.grid.Panel', {
            xtype: 'grid',
            border: false,
            store: store,
            loadMask: true,
            cls: 'bootstrap',
            plugins: [
                'bufferedrenderer',
                Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1})
            ],
            selModel: {
                mode: 'MULTI'
            },
            tbar: {items: [
                {
                    text: 'Select all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().selectAll();
                    }
                },
                {
                    text: 'Deselect all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().deselectAll();
                    }
                },
                '->',
                {
                    xtype: 'tbtext',
                    text: 'Apply to selected rows:'
                },
                this.getColorSelect(args.defaultValue, function (color, component) {
                    var grid = component.up('grid');
                    var store = grid.store;
                    store.suspendEvents();
                    var records = grid.getSelectionModel().getSelection();
                    for (var i = 0; i < records.length; i++) {
                        var record = records[i];
                        record.set('visualParam', color);
                    }
                    store.resumeEvents();
                    store.fireEvent('refresh');
                })
            ]},
            listeners: {
                cellclick: function (cell, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if (cellIndex == 1) {
                        var x = e.browserEvent.clientX;
                        var y = e.browserEvent.clientY;
                        _this._showColorMenu(x, y, function (color) {
                            record.set('visualParam', color);
                        });
                    }
                }
            },
            columns: [
                { text: args.attributeName, dataIndex: 'value', menuDisabled: true, flex: 1},
                { xtype: 'templatecolumn', text: 'Display ' + args.displayAttribute, menuDisabled: true, width: 100, tpl: '<div style="text-align:center;width:30px;height:12px;background-color: {visualParam};"></div>'},
                {  dataIndex: 'visualParam', width: 70, menuDisabled: true, editor: {xtype: 'textfield', allowBlank: false}}
            ]
        });

        return grid;
    },
    _createNumberGrid: function (args) {
        var _this = this;
        var store = this._createUniqueStore(args);

        var config = {};
        _.extend(config, args);
        args.attributeManager.store.on('update', function (st, record, operation, modifiedFieldNames) {
            _this._updateUniqueStore(config, modifiedFieldNames, store);
        });

        this.on(args.eventName, function (e) {
            args.defaultValue = e.value;
            grid.down('numberfield').setValue(e.value);

            var data = store.snapshot || store.data;
            var records = data.items;
            store.suspendEvents();
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                if (!record.dirty) {
                    record.set('visualParam', e.value);
                    record.commit();
                }
            }
            store.resumeEvents();
            store.fireEvent('refresh');
        });

        var grid = Ext.create('Ext.grid.Panel', {
            xtype: 'grid',
            border: false,
            store: store,
            cls: 'bootstrap',
            selModel: {
                mode: 'MULTI'
            },
            plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1})],
            tbar: {items: [
                {
                    text: 'Select all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().selectAll();
                    }
                },
                {
                    text: 'Deselect all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().deselectAll();
                    }
                },
                '->',
                {
                    xtype: 'tbtext',
                    text: 'Apply to selected rows:'
                },
                {
                    xtype: 'numberfield',
                    width: 100,
                    maxValue: args.maxValue,
                    minValue: args.minValue,
                    step: args.step,
                    listeners: {
                        change: function (field, newValue) {
                            if (newValue != null) {
                                var grid = field.up('grid');
                                var store = grid.store;
                                store.suspendEvents();
                                var records = grid.getSelectionModel().getSelection();
                                for (var i = 0; i < records.length; i++) {
                                    var record = records[i];
                                    record.set('visualParam', newValue)
                                }
                                store.resumeEvents();
                                store.fireEvent('refresh');
                            }
                        }
                    }
                }
            ]},
            columns: [
                { text: args.attributeName, dataIndex: 'value', menuDisabled: true, flex: 1},
                {
                    text: 'Display ' + args.displayAttribute,
                    dataIndex: 'visualParam',
                    menuDisabled: true,
                    width: 130,
                    editor: {
                        xtype: 'numberfield',
                        maxValue: args.maxValue,
                        minValue: args.minValue,
                        step: args.step
                    }
                }
            ]
        });
        return grid;
    },
    _createComboGrid: function (args) {
        var _this = this;
        var store = this._createUniqueStore(args);

        var config = {};
        _.extend(config, args);
        args.attributeManager.store.on('update', function (st, record, operation, modifiedFieldNames) {
            _this._updateUniqueStore(config, modifiedFieldNames, store);
        });

        this.on(args.eventName, function (e) {
            args.defaultValue = e.value;
            grid.down('combo').setValue(e.value);

            var data = store.snapshot || store.data;
            var records = data.items;
            store.suspendEvents();
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                if (!record.dirty) {
                    record.set('visualParam', e.value);
                    record.commit();
                }
            }
            store.resumeEvents();
            store.fireEvent('refresh');
        });

        var grid = Ext.create('Ext.grid.Panel', {
            xtype: 'grid',
            border: false,
            store: store,
            cls: 'bootstrap',
            selModel: {
                mode: 'MULTI'
            },
            plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1})],
            tbar: {items: [
                {
                    text: 'Select all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().selectAll();
                    }
                },
                {
                    text: 'Deselect all',
                    handler: function (bt) {
                        bt.up('grid').getSelectionModel().deselectAll();
                    }
                },
                '->',
                {
                    xtype: 'tbtext',
                    text: 'Apply to selected rows:'
                },
                {
                    xtype: 'combo',
                    width: 100,
                    store: args.comboValues,
                    listeners: {
                        change: function (combo, select) {
                            var grid = combo.up('grid');
                            var store = grid.store;
                            store.suspendEvents();
                            var records = grid.getSelectionModel().getSelection();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                record.set('visualParam', select)
                            }
                            store.resumeEvents();
                            store.fireEvent('refresh');
                        }
                    }
                }
            ]},
            columns: [
                { text: args.attributeName, dataIndex: 'value', menuDisabled: true, flex: 1},
                {
                    text: 'Display ' + args.displayAttribute,
                    dataIndex: 'visualParam',
                    width: 130,
                    menuDisabled: true,
                    editor: {
                        xtype: 'combo',
                        store: args.comboValues
                    }
                }
            ]
        });
        return grid;
    },


    _createColorMenu: function () {
        var _this = this;
        var div = $('<div></div>')[0];
        this.colorSelect = $('<select></select>')[0];
        $(div).append(this.colorSelect);
        _this._setColorSelect(this.colorSelect);
        $(this.colorSelect).simplecolorpicker()
        var colorMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            width: 170,
            items: [
                {
                    xtype: 'box',
                    margin: 5,
                    listeners: {
                        afterrender: function () {
                            $(this.getEl().dom).append(div);
                        }
                    }
                }
            ]
        });
        return colorMenu;
    },
    _showColorMenu: function (x, y, func) {
        var _this = this;
        $(this.colorSelect).simplecolorpicker('destroy');
        $(this.colorSelect).off('change');
        $(this.colorSelect).simplecolorpicker().on('change', function () {
            func($(_this.colorSelect).val());
            _this.colorMenu.hide();
        });
        this.colorMenu.showAt(x, y);
    },
    _setColorSelect: function (select) {
        var colors = ["cccccc", "888888",
            "ac725e", "d06b64", "f83a22", "fa573c", "ff7537", "ffad46", "42d692", "16a765", "7bd148", "b3dc6c", "fbe983", "fad165",
            "92e1c0", "9fe1e7", "9fc6e7", "4986e7", "9a9cff", "b99aff", "c2c2c2", "cabdbf", "cca6ac", "f691b2", "cd74e6", "a47ae2",
            "ffffff", "000000"
        ];

        for (var i in colors) {
            var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
            $(select).append(menuEntry);
        }
    }
}
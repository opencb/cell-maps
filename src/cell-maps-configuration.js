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
    this.height = 750;

    this.vertexAttributeManager;
    this.edgeAttributeManager;

    //set instantiation args, must be last
    _.extend(this, args);

    this.panel;
    this.vertexComboStore;
    this.edgeComboStore;

    if (typeof localStorage.CELLMAPS_CONFIG !== 'undefined') {
        var config = JSON.parse(localStorage.CELLMAPS_CONFIG);
        if (typeof config.vertexDefaults !== 'undefined') {
            this.vertexDefaults = config.vertexDefaults;
        }
        if (typeof config.edgeDefaults !== 'undefined') {
            this.edgeDefaults = config.edgeDefaults;
        }
    } else {
        this.vertexDefaults = {
            shape: 'circle',
            size: 40,
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
        localStorage.CELLMAPS_CONFIG = JSON.stringify({vertexDefaults: this.vertexDefaults, edgeDefaults: this.edgeDefaults});
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
        this.vertexAttributeManager.on('change:attributes', function () {
            _this.reconfigureVertexComponents();
        });
        this.edgeAttributeManager.on('change:attributes', function () {
            _this.reconfigureEdgeComponents();
        });

        this.vertexComboStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: this.vertexAttributeManager.attributes
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
            bodyStyle: {
                fontFamily: 'Oxygen'
            },
            items: [this.createPropertiesPanel()],
            renderTo: this.targetId
        });


        if (typeof localStorage.CELLMAPS_CONFIG !== 'undefined') {
            var config = JSON.parse(localStorage.CELLMAPS_CONFIG);
            if (typeof config.visualSets !== 'undefined') {
                for (widgetName in config.visualSets) {
                    if (typeof config.visualSets[widgetName] !== 'undefined') {
                        this[widgetName].restoreVisualSet(config.visualSets[widgetName]);
                    }
                }
            }
        }

    },
    saveConfig: function () {
        localStorage.CELLMAPS_CONFIG = JSON.stringify({
            vertexDefaults: this.vertexDefaults,
            edgeDefaults: this.edgeDefaults,

            visualSets: {
                //nodes
                vertexLabelSizeAttributeWidget: this.vertexLabelSizeAttributeWidget.getVisualSet(),
                vertexOpacityAttributeWidget: this.vertexOpacityAttributeWidget.getVisualSet(),
                vertexShapeAttributeWidget: this.vertexShapeAttributeWidget.getVisualSet(),
                vertexColorAttributeWidget: this.vertexColorAttributeWidget.getVisualSet(),
                vertexStrokeColorAttributeWidget: this.vertexStrokeColorAttributeWidget.getVisualSet(),
                vertexSizeAttributeWidget: this.vertexSizeAttributeWidget.getVisualSet(),
                vertexStrokeSizeAttributeWidget: this.vertexStrokeSizeAttributeWidget.getVisualSet(),


                vertexPieColorAttributeWidget: this.vertexPieColorAttributeWidget.getVisualSet(),
                vertexPieSizeAttributeWidget: this.vertexPieSizeAttributeWidget.getVisualSet(),
                vertexPieAreaAttributeWidget: this.vertexPieAreaAttributeWidget.getVisualSet(),

                vertexDonutColorAttributeWidget: this.vertexDonutColorAttributeWidget.getVisualSet(),
                vertexDonutSizeAttributeWidget: this.vertexDonutSizeAttributeWidget.getVisualSet(),
                vertexDonutAreaAttributeWidget: this.vertexDonutAreaAttributeWidget.getVisualSet(),

                //edges
                edgeLabelSizeAttributeWidget: this.edgeLabelSizeAttributeWidget.getVisualSet(),
                edgeOpacityAttributeWidget: this.edgeOpacityAttributeWidget.getVisualSet(),
                edgeShapeAttributeWidget: this.edgeShapeAttributeWidget.getVisualSet(),
                edgeColorAttributeWidget: this.edgeColorAttributeWidget.getVisualSet(),
                edgeSizeAttributeWidget: this.edgeSizeAttributeWidget.getVisualSet()
            }
        });
    },
    reconfigureVertexComponents: function () {
        this.vertexComboStore.loadData(this.vertexAttributeManager.attributes);
    },
    reconfigureEdgeComponents: function () {
        this.edgeComboStore.loadData(this.edgeAttributeManager.attributes);
    },
    createLabelComboComponent: function (args) {
        var _this = this;
        return Ext.create('Ext.container.Container', {
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    width: 150,
                    margin: '5 0 0 0',
                    text: args.text
                },
                {
                    xtype: 'combo',
                    store: args.comboStore,
                    displayField: 'name',
                    valueField: 'name',
                    width: 100,
                    queryMode: 'local',
                    forceSelection: true,
                    editable: false,
                    listeners: {
                        afterrender: function () {
                            this.select(this.getStore().getAt(0));
                        },
                        change: function (field, e) {
                            var value = field.getValue();
                            if (value != null) {
                                args.changeAttribute(value);
                            }
                        }
                    }
                },
                {
                    xtype: 'button',
                    tooltip: 'Configure',
                    text: '<span class="bootstrap"><span class="glyphicon glyphicon-eye-open" style="font-size: 15px"></span></span>',
                    enableToggle: true,
                    width: 35,
                    pressed: true,
                    hidden: false,
                    toggleHandler: function () {
                        args.changeVisibility(this.pressed);
                    }
                }
            ]
        })
    },
    createLabelPositionComponent: function (args) {
        var _this = this;
        return Ext.create('Ext.container.Container', {
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    width: 131,
                    margin: '5 0 0 0',
                    text: 'Label position'
                },
                {
                    xtype: 'numberfield',
                    labelWidth: 15,
                    fieldLabel: 'X',
                    width: 72,
                    value: 0,
                    maxValue: 100,
                    minValue: -100,
                    step: 1,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    args.changeX(newValue);
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'numberfield',
                    labelWidth: 15,
                    fieldLabel: 'Y',
                    width: 72,
                    value: 0,
                    maxValue: 100,
                    minValue: -100,
                    step: 1,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    args.changeY(newValue);
                                }
                            }
                        }
                    }
                }
            ]
        })
    },
    createComplexLabelComponent: function (args) {
        var _this = this;
        return Ext.create('Ext.container.Container', {
            layout: 'hbox',
            defaults: {
                margin: '0 1 0 1'
            },
            items: [
                {
                    xtype: 'text',
                    width: 80,
                    margin: '5 0 0 0',
                    text: 'Text size'
                },
                {
                    xtype: 'numberfield',
                    xid: 'size',
                    width: 59,
                    value: 12,
                    maxValue: 16,
                    minValue: 0,
                    step: 1,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    args.changeSize(newValue);
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'text',
                    width: 80,
                    margin: '5 0 0 0',
                    text: 'Text distance'
                },
                {
                    xtype: 'numberfield',
                    xid: 'offset',
                    width: 59,
                    value: 0,
                    maxValue: 200,
                    minValue: -200,
                    step: 1,
                    margin: '0 10 0 0',
                    listeners: {
                        change: {
                            buffer: 100,
                            fn: function (field, newValue) {
                                if (newValue != null) {
                                    args.changeOffset(newValue);
                                }
                            }
                        }
                    }
                }
            ]
        })
    },

    _processComplexVisualSet: function () {
        console.log('_processComplexVisualSet')
        var args = {};
        args.settings = [];
        args.defaults = {};
        this._processPieVisualSet(args);
        this._processDonutVisualSet(args);

        if (args.settings.length > 0) {
            this.saveConfig();
            this.trigger('change:vertexComplexDisplayAttribute', {args: args, sender: this});
        }
    },

    _checkComplexVisualSet: function () {
        var args = {};
        args.settings = [];
        args.defaults = {};
        this._processPieVisualSet(args);
        this._processDonutVisualSet(args);

        if (args.settings.length > 0) {
            return true;
        }
        return false;
    },

    _processPieVisualSet: function (args) {
        var settings = args.settings;

        var labelData = [];

        var pieColorVisualSet = this.vertexPieColorAttributeWidget.getVisualSet();
        var pieSizeVisualSet = this.vertexPieSizeAttributeWidget.getVisualSet();
        var pieAreaVisualSet = this.vertexPieAreaAttributeWidget.getVisualSet();

        var configs = [];
        if (typeof pieColorVisualSet !== 'undefined') {
            configs.push(pieColorVisualSet);
            labelData.push({name: pieColorVisualSet.attribute});
        }
        if (typeof pieSizeVisualSet !== 'undefined') {
            configs.push(pieSizeVisualSet);
            labelData.push({name: pieSizeVisualSet.attribute});
        }
        if (typeof pieAreaVisualSet !== 'undefined') {
            configs.push(pieAreaVisualSet);
            labelData.push({name: pieAreaVisualSet.attribute});
        }
        args.defaults['pieSlices'] = {
            'color': this.vertexColorAttributeWidget.getDefaultValue(),
            'size': this.vertexSizeAttributeWidget.getDefaultValue(),
            'area': this.vertexPieAreaAttributeWidget.getDefaultValue()
        };
        if (configs.length > 0) {
            var button = this.vertexPieLabelComponent.down('button');
            var combo = this.vertexPieLabelComponent.down('combo');
            var size = this.vertexPieComplexLabelComponent.down('numberfield[xid=size]').getValue();
            var offset = this.vertexPieComplexLabelComponent.down('numberfield[xid=offset]').getValue();
            combo.store.loadData(labelData);
            var label = {enable: button.pressed, attribute: combo.getValue(), size: size, offset: offset};
            settings.push({configs: configs, label: label, slicesName: 'pieSlices'});
        }
    },
    _processDonutVisualSet: function (args) {
        var settings = args.settings;
        var labelData = [];

        var donutColorVisualSet = this.vertexDonutColorAttributeWidget.getVisualSet();
        var donutSizeVisualSet = this.vertexDonutSizeAttributeWidget.getVisualSet();
        var donutAreaVisualSet = this.vertexDonutAreaAttributeWidget.getVisualSet();

        var configs = [];
        if (typeof donutColorVisualSet !== 'undefined') {
            configs.push(donutColorVisualSet);
            labelData.push({name: donutColorVisualSet.attribute});
        }
        if (typeof donutSizeVisualSet !== 'undefined') {
            configs.push(donutSizeVisualSet);
            labelData.push({name: donutSizeVisualSet.attribute});
        }
        if (typeof donutAreaVisualSet !== 'undefined') {
            configs.push(donutAreaVisualSet);
            labelData.push({name: donutAreaVisualSet.attribute});
        }
        args.defaults['donutSlices'] = {
            'color': this.vertexStrokeColorAttributeWidget.getDefaultValue(),
            'size': this.vertexStrokeSizeAttributeWidget.getDefaultValue(),
            'area': this.vertexDonutAreaAttributeWidget.getDefaultValue()
        };
        if (configs.length > 0) {
            var button = this.vertexDonutLabelComponent.down('button');
            var combo = this.vertexDonutLabelComponent.down('combo');
            var size = this.vertexDonutComplexLabelComponent.down('numberfield[xid=size]').getValue();
            var offset = this.vertexDonutComplexLabelComponent.down('numberfield[xid=offset]').getValue();
            combo.store.loadData(labelData);
            var label = {enable: button.pressed, attribute: combo.getValue(), size: size, offset: offset};
            settings.push({configs: configs, label: label, slicesName: 'donutSlices'});
        }
    },

    createPropertiesPanel: function () {
        var _this = this;

//        /*Vertex General*/
        this.vertexLabelPositionComponent = this.createLabelPositionComponent({
            changeX: function (v) {
                _this.trigger('change:vertexLabelPositionX', {value: v, sender: this});
            },
            changeY: function (v) {
                _this.trigger('change:vertexLabelPositionY', {value: v, sender: this});
            }
        });


        this.vertexOpacityAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Opacity',
            displayLabel: 'Opacity',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Opacity',
                defaultValue: this.vertexDefaults.opacity,
                maxValue: 1,
                minValue: 0,
                step: 0.1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.opacity = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:vertexOpacity', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });
        this.vertexLabelSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Label size',
            displayLabel: 'Label size',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Label size',
                defaultValue: this.vertexDefaults.labelSize,
                maxValue: 16,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.labelSize = e.sender.getDefaultValue();
                    _this.saveConfig();
                    var btn = _this.vertexLabelComponent.down('button');
                    if (btn.pressed) {
                        _this.trigger('change:vertexLabelSize', e);
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });
        this.vertexLabelComponent = this.createLabelComboComponent({
            text: 'Label',
            comboStore: this.vertexComboStore,
            changeVisibility: function (bool) {
                var value = (bool === true) ? _this.vertexLabelSizeAttributeWidget.getDefaultValue() : 0;
                _this.trigger('change:vertexLabelSize', {value: value, sender: _this});
            },
            changeAttribute: function (attribute) {
                _this.trigger('change:vertexLabel', {value: attribute});
            }
        });

        this.vertexShapeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Shape',
            displayLabel: 'Shape',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new SelectAttributeControl({
                displayAttribute: 'Shape',
                defaultValue: this.vertexDefaults.shape,
                comboValues: [
                    {name: 'circle'},
                    {name: 'square'},
                    {name: 'ellipse'},
                    {name: 'rectangle'}
                ]
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.shape = e.sender.getDefaultValue();
                    _this.saveConfig();
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexShape', e);
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });


        /* Vertex */
        this.vertexColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Color',
            displayLabel: 'Color fill',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new ColorAttributeControl({
                displayAttribute: 'Color',
                defaultValue: this.vertexDefaults.color
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.color = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.vertexPieColorAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexColor', e);
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });

        this.vertexSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Size',
            displayLabel: 'Size',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Size',
                defaultValue: this.vertexDefaults.size,
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.size = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.vertexPieSizeAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexSize', e);
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });

        this.vertexStrokeColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Stroke color',
            displayLabel: 'Stroke color',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new ColorAttributeControl({
                displayAttribute: 'Stroke color',
                defaultValue: this.vertexDefaults.strokeColor
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.strokeColor = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.vertexDonutColorAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexStrokeColor', e);
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });

        this.vertexStrokeSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Stroke size',
            displayLabel: 'Stroke size',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Stroke size',
                defaultValue: this.vertexDefaults.strokeSize,
                maxValue: 20,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.vertexDefaults.strokeSize = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.vertexDonutSizeAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexStrokeSize', e);
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });


        //List Vertex
        this.vertexPieColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'color',
            displayLabel: 'Pie chart fill',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new ColorAttributeControl({
                displayAttribute: 'pieColor',
                defaultValue: this.vertexDefaults.color
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexColorAttributeWidget.defaultValueChanged();
                    _this.saveConfig();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexPieSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'size',
            displayLabel: 'Pie chart size',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new NumberAttributeControl({
                displayAttribute: 'size',
                defaultValue: this.vertexDefaults.size,
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexSizeAttributeWidget.defaultValueChanged();
                    _this.saveConfig();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexPieAreaAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'area',
            displayLabel: 'Pie chart area',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new NumberAttributeControl({
                displayAttribute: 'area',
                defaultValue: 1,
                maxValue: 100,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this._processComplexVisualSet();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexPieLabelComponent = this.createLabelComboComponent({
            text: 'Pie chart text',
            comboStore: Ext.create('Ext.data.Store', {fields: ['name'], data: []}),
            eventName: 'change:vertexPieLabel',
            changeVisibility: function (bool) {
                _this._processComplexVisualSet();
            },
            changeAttribute: function (attribute) {
                _this._processComplexVisualSet();
            }
        });
        this.vertexPieComplexLabelComponent = this.createComplexLabelComponent({
            changeSize: function (size) {
                _this._processComplexVisualSet();
            },
            changeOffset: function (offset) {
                _this._processComplexVisualSet();
            }
        });


        this.vertexDonutColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'color',
            displayLabel: 'Donut chart fill',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new ColorAttributeControl({
                displayAttribute: 'color',
                defaultValue: this.vertexDefaults.color
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexStrokeColorAttributeWidget.defaultValueChanged();
                    _this.saveConfig();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexDonutSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'size',
            displayLabel: 'Donut chart size',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new NumberAttributeControl({
                displayAttribute: 'size',
                defaultValue: this.vertexDefaults.size,
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexStrokeSizeAttributeWidget.defaultValueChanged();
                    _this.saveConfig();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexDonutAreaAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'area',
            displayLabel: 'Donut chart area',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list: true,
            showControl: false,
            control: new NumberAttributeControl({
                displayAttribute: 'area',
                defaultValue: 1,
                maxValue: 100,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this._processComplexVisualSet();
                },
                'click:ok': function (e) {
                    _this._processComplexVisualSet();
                }
            }
        });
        this.vertexDonutLabelComponent = this.createLabelComboComponent({
            text: 'Donut chart text',
            comboStore: Ext.create('Ext.data.Store', {fields: ['name'], data: []}),
            eventName: 'change:vertexDonutLabel',
            changeVisibility: function (bool) {
                _this._processComplexVisualSet();
            },
            changeAttribute: function (attribute) {
                _this._processComplexVisualSet();
            }
        });
        this.vertexDonutComplexLabelComponent = this.createComplexLabelComponent({
            changeSize: function (size) {
                _this._processComplexVisualSet();
            },
            changeOffset: function (offset) {
                _this._processComplexVisualSet();
            }
        });

        //EDGES
        this.edgeColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Color',
            displayLabel: 'Color',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new ColorAttributeControl({
                displayAttribute: 'Color',
                defaultValue: this.edgeDefaults.color
            }),
            handlers: {
                'change:default': function (e) {
                    _this.edgeDefaults.color = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:edgeColor', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:edgeDisplayAttribute', e.visualSet);
                }
            }
        });
        this.edgeSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Size',
            displayLabel: 'Size',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Size',
                defaultValue: this.edgeDefaults.size,
                maxValue: 10,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.edgeDefaults.size = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:edgeSize', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:edgeDisplayAttribute', e.visualSet);
                }
            }
        });
        this.edgeOpacityAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Opacity',
            displayLabel: 'Opacity',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Opacity',
                defaultValue: this.edgeDefaults.opacity,
                maxValue: 1,
                minValue: 0,
                step: 0.1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.edgeDefaults.opacity = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:edgeOpacity', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:edgeDisplayAttribute', e.visualSet);
                }
            }
        });
        this.edgeLabelSizeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Label size',
            displayLabel: 'Label size',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new NumberAttributeControl({
                displayAttribute: 'Opacity',
                defaultValue: this.edgeDefaults.labelSize,
                maxValue: 16,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.edgeDefaults.labelSize = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:edgeLabelSize', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:edgeDisplayAttribute', e.visualSet);
                }
            }
        });
        this.edgeShapeAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Shape',
            displayLabel: 'Shape',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new SelectAttributeControl({
                displayAttribute: 'Shape',
                defaultValue: this.edgeDefaults.shape,
                comboValues: [
                    {name: 'directed'},
                    {name: 'undirected'},
                    {name: 'inhibited'},
                    {name: 'dot'},
                    {name: 'odot'}
                ]
            }),
            handlers: {
                'change:default': function (e) {
                    _this.edgeDefaults.shape = e.sender.getDefaultValue();
                    _this.saveConfig();
                    _this.trigger('change:edgeShape', e);
                },
                'click:ok': function (e) {
                    _this.saveConfig();
                    _this.trigger('change:edgeDisplayAttribute', e.visualSet);
                }
            }
        });


        var attrSettingsHeader = {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            margin: '10 0 5 0',
            style: {
                borderBottom: '1px solid lightgray'
            },
            items: [
                {xtype: 'box', width: 80, margin: '0 0 0 0', html: 'Name'},
                {xtype: 'box', width: 65, margin: '0 10 0 0', html: 'Default'},
                {xtype: 'box', width: 100, html: 'Attribute'}
            ]
        };

        var complexSettingsHeader = {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            margin: '10 0 5 0',
            style: {
                borderBottom: '1px solid lightgray'
            },
            items: [
                {xtype: 'box', width: 145, margin: '0 0 0 0', html: 'Name'},
                {xtype: 'box', width: 100, html: 'Attribute'}
            ]
        };

        this.propertiesPanel = Ext.create('Ext.tab.Panel', {
            title: 'Visualization settings',
            autoHeight: true,
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
                            xtype: 'box',
                            margin: '5 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '110%',
                                borderBottom: '1px solid gray'
                            },
                            html: 'General settings'
                        },
                        this.vertexLabelComponent,
                        this.vertexLabelPositionComponent,
                        attrSettingsHeader,
                        this.vertexLabelSizeAttributeWidget.getComponent(),
                        this.vertexOpacityAttributeWidget.getComponent(),
                        this.vertexShapeAttributeWidget.getComponent(),
                        {
                            xtype: 'box',
                            margin: '20 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '110%',
                                borderBottom: '1px solid gray'
                            },
                            html: 'Simple node settings'
                        },
                        attrSettingsHeader,
                        this.vertexColorAttributeWidget.getComponent(),
                        this.vertexStrokeColorAttributeWidget.getComponent(),
                        this.vertexSizeAttributeWidget.getComponent(),
                        this.vertexStrokeSizeAttributeWidget.getComponent(),
                        {
                            xtype: 'box',
                            margin: '20 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '110%',
                                borderBottom: '1px solid gray'
                            },
                            html: 'Complex node settings'
                        },
                        complexSettingsHeader,
                        this.vertexPieColorAttributeWidget.getComponent(),
                        this.vertexPieSizeAttributeWidget.getComponent(),
                        this.vertexPieAreaAttributeWidget.getComponent(),
                        this.vertexPieLabelComponent,
                        this.vertexPieComplexLabelComponent,
                        complexSettingsHeader,
                        this.vertexDonutColorAttributeWidget.getComponent(),
                        this.vertexDonutSizeAttributeWidget.getComponent(),
                        this.vertexDonutAreaAttributeWidget.getComponent(),
                        this.vertexDonutLabelComponent,
                        this.vertexDonutComplexLabelComponent
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
//                        {
//                            xtype: 'container',
//                            layout: {
//                                type: 'hbox',
//                                align: 'stretch'
//                            },
//                            margin: '0 0 5 0',
//                            style: {
//                                borderBottom: '1px solid lightgray',
//                                textAlign: 'center'
//                            },
//                            items: [
//                                {xtype: 'box', width: 80, margin: '0 0 0 0', html: 'Name'},
//                                {xtype: 'box', width: 65, margin: '0 10 0 0', html: 'Default'},
//                                {xtype: 'box', width: 100, html: 'Attribute'}
//                            ]
//                        },
                        {
                            xtype: 'box',
                            margin: '5 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '110%',
                                borderBottom: '1px solid gray'
                            },
                            html: 'Simple edge settings'
                        },
                        this.createLabelComboComponent({
                            text: 'Label',
                            comboStore: this.edgeComboStore,
                            changeAttribute: function (attribute) {
                                _this.trigger('change:edgeLabel', {value: attribute});
                            }
                        }),
                        this.edgeLabelSizeAttributeWidget.getComponent(),
                        this.edgeOpacityAttributeWidget.getComponent(),
                        this.edgeShapeAttributeWidget.getComponent(),
                        this.edgeColorAttributeWidget.getComponent(),
                        this.edgeSizeAttributeWidget.getComponent()
                    ]

                }
            ]
        });
        return this.propertiesPanel;
    }
}
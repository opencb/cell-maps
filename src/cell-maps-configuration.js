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
    this.height = 825;
    this.session;
    this.autoRender = true;


    this.vertexAttributeManager;
    this.edgeAttributeManager;

    //set instantiation args, must be last
    _.extend(this, args);

    this.panel;
    this.vertexComboStore;
    this.edgeComboStore;

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CellMapsConfiguration.prototype = {
    render: function () {
        var _this = this;

        this.div = $('<div></div>')[0];

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
//            layout: 'accordion',
//            border:false,
//            hidden: true,
            bodyStyle: {
                fontFamily: 'Oxygen'
            },
            items: [this.createPropertiesPanel()]
        });
    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (this.targetDiv === 'undefined') {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.panel.render(this.div);


        var visualSets = this.session.getVisualSets();
        for (var widgetName in visualSets) {
            if (typeof visualSets[widgetName] !== 'undefined') {
                this[widgetName].restoreVisualSet(visualSets[widgetName]);
            }
        }

    },
    show: function () {
        this.panel.show()
    },
    hide: function () {
        this.panel.hide();
    },
    toggle: function () {
        if (this.panel.isVisible()) {
            this.panel.hide();
        } else {
            this.panel.show();
        }
    },
    _getVisualSets: function () {
        return  {
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
    },
    saveSession: function () {
        this.session.loadVisualSets(this._getVisualSets());

        //defaults
        this.session.setVertexDefault('labelSize', this.vertexLabelSizeAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('opacity', this.vertexOpacityAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('shape', this.vertexShapeAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('color', this.vertexColorAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('strokeColor', this.vertexStrokeColorAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('size', this.vertexSizeAttributeWidget.getDefaultValue());
        this.session.setVertexDefault('strokeSize', this.vertexStrokeSizeAttributeWidget.getDefaultValue());

        this.session.setEdgeDefault('labelSize', this.edgeLabelSizeAttributeWidget.getDefaultValue());
        this.session.setEdgeDefault('opacity', this.edgeOpacityAttributeWidget.getDefaultValue());
        this.session.setEdgeDefault('shape', this.edgeShapeAttributeWidget.getDefaultValue());
        this.session.setEdgeDefault('color', this.edgeColorAttributeWidget.getDefaultValue());
        this.session.setEdgeDefault('size', this.edgeSizeAttributeWidget.getDefaultValue());
    },
    loadSession: function () {
        this.loadDefaults();

        this.cleanVisualSets();

        var visualSets = session.getVisualSets();
        for (var widgetName in visualSets) {
            if (typeof visualSets[widgetName] !== 'undefined') {
                this[widgetName].restoreVisualSet(visualSets[widgetName]);
            }
        }
    },
    loadDefaults: function () {
        //nodes
        this.vertexLabelSizeAttributeWidget.defaultValueChanged(this.session.getVertexDefault('labelSize'));
        this.vertexOpacityAttributeWidget.defaultValueChanged(this.session.getVertexDefault('opacity'));
        this.vertexShapeAttributeWidget.defaultValueChanged(this.session.getVertexDefault('shape'));
        this.vertexColorAttributeWidget.defaultValueChanged(this.session.getVertexDefault('color'));
        this.vertexStrokeColorAttributeWidget.defaultValueChanged(this.session.getVertexDefault('strokeColor'));
        this.vertexSizeAttributeWidget.defaultValueChanged(this.session.getVertexDefault('size'));
        this.vertexStrokeSizeAttributeWidget.defaultValueChanged(this.session.getVertexDefault('strokeSize'));

        //edges
        this.edgeLabelSizeAttributeWidget.defaultValueChanged(this.session.getEdgeDefault('labelSize'));
        this.edgeOpacityAttributeWidget.defaultValueChanged(this.session.getEdgeDefault('opacity'));
        this.edgeShapeAttributeWidget.defaultValueChanged(this.session.getEdgeDefault('shape'));
        this.edgeColorAttributeWidget.defaultValueChanged(this.session.getEdgeDefault('color'));
        this.edgeSizeAttributeWidget.defaultValueChanged(this.session.getEdgeDefault('size'));
    },
    cleanVisualSets: function () {
        this.vertexLabelSizeAttributeWidget.removeVisualSet();
        this.vertexOpacityAttributeWidget.removeVisualSet();
        this.vertexShapeAttributeWidget.removeVisualSet();
        this.vertexColorAttributeWidget.removeVisualSet();
        this.vertexStrokeColorAttributeWidget.removeVisualSet();
        this.vertexSizeAttributeWidget.removeVisualSet();
        this.vertexStrokeSizeAttributeWidget.removeVisualSet();


        this.vertexPieColorAttributeWidget.removeVisualSet();
        this.vertexPieSizeAttributeWidget.removeVisualSet();
        this.vertexPieAreaAttributeWidget.removeVisualSet();

        this.vertexDonutColorAttributeWidget.removeVisualSet();
        this.vertexDonutSizeAttributeWidget.removeVisualSet();
        this.vertexDonutAreaAttributeWidget.removeVisualSet();

        //edges
        this.edgeLabelSizeAttributeWidget.removeVisualSet();
        this.edgeOpacityAttributeWidget.removeVisualSet();
        this.edgeShapeAttributeWidget.removeVisualSet();
        this.edgeColorAttributeWidget.removeVisualSet();
        this.edgeSizeAttributeWidget.removeVisualSet();
    },
    reconfigureVertexComponents: function () {
        this.vertexComboStore.loadData(this.vertexAttributeManager.attributes);
    },
    reconfigureEdgeComponents: function () {
        this.edgeComboStore.loadData(this.edgeAttributeManager.attributes);
    },
    createLabelComboComponent: function (args) {
        var _this = this;
        return Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            labelWidth: 151,
            fieldLabel: args.text,
            items: [
                {
                    xtype: 'combo',
                    store: args.comboStore,
                    displayField: 'name',
                    valueField: 'name',
                    width: 95,
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
                    margin: '0 0 0 2',
                    tooltip: 'Configure',
                    text: '<span class="bootstrap"><span class="glyphicon glyphicon-eye-open"></span></span>',
                    enableToggle: true,
                    width: 35,
                    height: 25,
                    pressed: args.pressed,
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
        return Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            labelWidth: 127,
            fieldLabel: 'Label position',
            defaults: {
                margin: '1 4'
            },
            items: [
                {
                    xtype: 'numberfield',
                    labelWidth: 15,
                    fieldLabel: 'X',
                    width: 72,
                    value: 0,
                    maxValue: 100,
                    minValue: -100,
                    step: 1,
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
        return Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            defaults: {
                margin: '1'
            },
            items: [
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Text size',
                    labelWidth: 70,
                    xid: 'size',
                    width: 75 + 59,
                    value: 12,
                    maxValue: 16,
                    minValue: 0,
                    step: 1,
                    margin: '1 5 1 1',
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
                    xtype: 'numberfield',
                    fieldLabel: 'Text distance',
                    labelWidth: 85,
                    xid: 'offset',
                    width: 88 + 59,
                    value: 0,
                    maxValue: 200,
                    minValue: -200,
                    step: 1,
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
                defaultValue: this.session.getVertexDefault('opacity'),
                maxValue: 1,
                minValue: 0,
                step: 0.1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('opacity', e.sender.getDefaultValue()),
                        _this.trigger('change:vertexOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexOpacityAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('labelSize'),
                maxValue: 16,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('labelSize', e.sender.getDefaultValue());
                    var btn = _this.vertexLabelComponent.down('button');
                    if (btn.pressed) {
                        _this.trigger('change:vertexLabelSize', e);
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexLabelSizeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e.visualSet);
                }
            }
        });
        this.vertexLabelComponent = this.createLabelComboComponent({
            text: 'Label',
            comboStore: this.vertexComboStore,
            pressed: true,
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
                defaultValue: this.session.getVertexDefault('shape'),
                comboValues: [
                    {name: 'circle'},
                    {name: 'square'},
                    {name: 'ellipse'},
                    {name: 'rectangle'}
                ]
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('shape', e.sender.getDefaultValue());
                    if (!_this._checkComplexVisualSet()) {
                        _this.trigger('change:vertexShape', e);
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexShapeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('color')
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('color', e.sender.getDefaultValue());
                    _this.vertexPieColorAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        if (e.sender.visualSet) {
                            _this.trigger('change:vertexDisplayAttribute', e.sender.visualSet);
                        } else {
                            _this.trigger('change:vertexColor', e);
                        }
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexColorAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('size'),
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('size', e.sender.getDefaultValue());
                    _this.vertexPieSizeAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        if (e.sender.visualSet) {
                            _this.trigger('change:vertexDisplayAttribute', e.sender.visualSet);
                        } else {
                            _this.trigger('change:vertexSize', e);
                        }
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexSizeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('strokeColor')
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('strokeColor', e.sender.getDefaultValue());
                    _this.vertexDonutColorAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        if (e.sender.visualSet) {
                            _this.trigger('change:vertexDisplayAttribute', e.sender.visualSet);
                        } else {
                            _this.trigger('change:vertexStrokeColor', e);
                        }
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexStrokeColorAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('strokeSize'),
                maxValue: 20,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setVertexDefault('strokeSize', e.sender.getDefaultValue());
                    _this.vertexDonutSizeAttributeWidget.defaultValueChanged(e.value);
                    if (!_this._checkComplexVisualSet()) {
                        if (e.sender.visualSet) {
                            _this.trigger('change:vertexDisplayAttribute', e.sender.visualSet);
                        } else {
                            _this.trigger('change:vertexStrokeSize', e);
                        }
                    } else {
                        _this._processComplexVisualSet();
                    }
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexStrokeSizeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getVertexDefault('color')
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexColorAttributeWidget.defaultValueChanged();
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexPieColorAttributeWidget', e.visualSet);
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
                defaultValue: this.session.getVertexDefault('size'),
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexSizeAttributeWidget.defaultValueChanged();
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexPieSizeAttributeWidget', e.visualSet);
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
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexPieAreaAttributeWidget', e.visualSet);
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
                defaultValue: this.session.getVertexDefault('strokeColor')
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexStrokeColorAttributeWidget.defaultValueChanged();
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexDonutColorAttributeWidget', e.visualSet);
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
                defaultValue: this.session.getVertexDefault('strokeSize'),
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'remove:visualSet': function (e) {
                    _this.vertexStrokeSizeAttributeWidget.defaultValueChanged();
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexDonutSizeAttributeWidget', e.visualSet);
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
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('vertexDonutAreaAttributeWidget', e.visualSet);
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
        this.edgeLabelComponent = this.createLabelComboComponent({
            text: 'Label',
            comboStore: this.edgeComboStore,
            pressed: false,
            changeVisibility: function (bool) {
                var value = (bool === true) ? _this.edgeLabelSizeAttributeWidget.getDefaultValue() : 0;
                _this.trigger('change:edgeLabelSize', {value: value, sender: _this});
            },
            changeAttribute: function (attribute) {
                _this.trigger('change:edgeLabel', {value: attribute});
            }
        });

        this.edgeColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'Color',
            displayLabel: 'Color',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            control: new ColorAttributeControl({
                displayAttribute: 'Color',
                defaultValue: this.session.getEdgeDefault('color')
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setEdgeDefault('color', e.sender.getDefaultValue())
                    _this.trigger('change:edgeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('edgeColorAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getEdgeDefault('size'),
                maxValue: 10,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setEdgeDefault('size', e.sender.getDefaultValue());
                    _this.trigger('change:edgeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('edgeSizeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getEdgeDefault('opacity'),
                maxValue: 1,
                minValue: 0,
                step: 0.1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setEdgeDefault('opacity', e.sender.getDefaultValue());
                    _this.trigger('change:edgeOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('edgeOpacityAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                displayAttribute: 'Label size',
                defaultValue: this.session.getEdgeDefault('labelSize'),
                maxValue: 16,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.session.setEdgeDefault('labelSize', e.sender.getDefaultValue());
                    var btn = _this.edgeLabelComponent.down('button');
                    if (btn.pressed) {
                        _this.trigger('change:edgeLabelSize', e);
                    }

                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('edgeLabelSizeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
                defaultValue: this.session.getEdgeDefault('shape'),
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
                    _this.session.setEdgeDefault('shape', e.sender.getDefaultValue());
                    _this.trigger('change:edgeShape', e);
                },
                'change:visualSet': function (e) {
                    _this.session.setVisualSet('edgeShapeAttributeWidget', e.visualSet);
                },
                'click:ok': function (e) {
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
//            title: 'Visualization settings',
            autoHeight: true,
            border: false,
//            plain:true,
            defaults: {
                border: false,
                bodyPadding: 5
            },
            items: [
                {
                    title: 'Nodes',
                    defaults: {
                        margin: '2 0 2 0'
                    },
                    items: [
                        {
                            xtype: 'box',
//                            margin: '5 0 5 0',
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
                        this.edgeLabelComponent,
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
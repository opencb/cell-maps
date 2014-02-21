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

    },
//    setNodeAttributeManager: function (attrMan) {
//        var _this = this;
//        this.nodeAttributeManager = attrMan;
//
//        this._setNodeComponentsAttributeManager();
//
//        this.nodeAttributeManager.on('change:attributes', function () {
//            _this.reconfigureNodeComponents();
//        });
//        this.reconfigureNodeComponents();
//    },
    reconfigureNodeComponents: function () {
        this.nodeComboStore.loadData(this.nodeAttributeManager.attributes);
    },
//    _setNodeComponentsAttributeManager: function () {
//        this.nodeColorAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeStrokeColorAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeSizeAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeStrokeSizeAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeOpacityAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeLabelSizeAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//        this.nodeShapeAttributeWidget.setAttributeManager(this.nodeAttributeManager);
//    },

//    setEdgeAttributeManager: function (attrMan) {
//        var _this = this;
//        this.edgeAttributeManager = attrMan;
//
//        this._setEdgeComponentsAttributeManager();
//
//        this.edgeAttributeManager.on('change:attributes', function () {
//            _this.reconfigureEdgeComponents();
//        });
//        this.reconfigureEdgeComponents();
//    },
    reconfigureEdgeComponents: function () {
        this.edgeComboStore.loadData(this.edgeAttributeManager.attributes);
    },
//    _setEdgeComponentsAttributeManager: function () {
//        this.edgeColorAttributeWidget.setAttributeManager(this.edgeAttributeManager);
//        this.edgeSizeAttributeWidget.setAttributeManager(this.edgeAttributeManager);
//        this.edgeOpacityAttributeWidget.setAttributeManager(this.edgeAttributeManager);
//        this.edgeLabelSizeAttributeWidget.setAttributeManager(this.edgeAttributeManager);
//        this.edgeShapeAttributeWidget.setAttributeManager(this.edgeAttributeManager);
//    },

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
                    forceSelection: true,
                    editable: false,
                    listeners: {
                        afterrender: function () {
                            this.select(this.getStore().getAt(0));
                        },
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

        this.nodeColorAttributeWidget = new ColorAttributeWidget({
            displayAttribute: 'Color',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.color,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });

        this.nodeStrokeColorAttributeWidget = new ColorAttributeWidget({
            displayAttribute: 'Stroke color',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.strokeColor,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeStrokeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });
        this.nodeSizeAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Size',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.size,
            maxValue: 160,
            minValue: 0,
            step: 1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });
        this.nodeStrokeSizeAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Stroke size',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.strokeSize,
            maxValue: 10,
            minValue: 0,
            step: 1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeStrokeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });

        this.nodeOpacityAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Opacity',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.opacity,
            maxValue: 1,
            minValue: 0,
            step: 0.1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });
        this.nodeLabelSizeAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Label size',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.labelSize,
            maxValue: 16,
            minValue: 0,
            step: 1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeLabelSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });
        this.nodeShapeAttributeWidget = new SelectAttributeWidget({
            displayAttribute: 'Shape',
            attributeManager: this.nodeAttributeManager,
            attributesStore: this.nodeComboStore,
            defaultValue: this.vertexDefaults.shape,
            comboValues: ["circle", "square", "ellipse", "rectangle"],
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:nodeShape', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:nodeDisplayAttribute', e);
                }
            }
        });


        //EDGES
        this.edgeColorAttributeWidget = new ColorAttributeWidget({
            displayAttribute: 'Color',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            defaultValue: this.edgeDefaults.color,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:edgeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
                }
            }
        });
        this.edgeSizeAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Size',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            defaultValue: this.edgeDefaults.size,
            maxValue: 10,
            minValue: 0,
            step: 1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:edgeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
                }
            }
        });
        this.edgeOpacityAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Opacity',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            defaultValue: this.edgeDefaults.opacity,
            maxValue: 1,
            minValue: 0,
            step: 0.1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:edgeOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
                }
            }
        });
        this.edgeLabelSizeAttributeWidget = new NumberAttributeWidget({
            displayAttribute: 'Label size',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            defaultValue: this.edgeDefaults.labelSize,
            maxValue: 16,
            minValue: 0,
            step: 1,
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:edgeLabelSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
                }
            }
        });
        this.edgeShapeAttributeWidget = new SelectAttributeWidget({
            displayAttribute: 'Shape',
            attributeManager: this.edgeAttributeManager,
            attributesStore: this.edgeComboStore,
            defaultValue: this.edgeDefaults.shape,
            comboValues: ["directed", "undirected", "inhibited", "dot", "odot"],
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:edgeShape', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
                }
            }
        });


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
                        this.nodeColorAttributeWidget.getComponent(),
                        this.nodeStrokeColorAttributeWidget.getComponent(),
                        this.nodeSizeAttributeWidget.getComponent(),
                        this.nodeStrokeSizeAttributeWidget.getComponent(),
                        this.nodeOpacityAttributeWidget.getComponent(),
                        this.nodeLabelSizeAttributeWidget.getComponent(),
                        this.nodeShapeAttributeWidget.getComponent(),
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
                        this.edgeColorAttributeWidget.getComponent(),
                        this.edgeSizeAttributeWidget.getComponent(),
                        this.edgeOpacityAttributeWidget.getComponent(),
                        this.edgeLabelSizeAttributeWidget.getComponent(),
                        this.edgeShapeAttributeWidget.getComponent(),
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
    }
}
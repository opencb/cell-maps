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

    this.vertexAttributeManager;
    this.edgeAttributeManager;

    //set instantiation args, must be last
    _.extend(this, args);

    this.panel;
    this.vertexComboStore;
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
            items: [this.createPropertiesPanel()],
            renderTo: this.targetId
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
                    text: 'Label'
                },
                {
                    xtype: 'combo',
                    store: args.comboStore,
                    displayField: 'name',
                    valueField: 'name',
//                    width: 120,
                    flex: 1,
                    queryMode: 'local',
                    margin: '0 32 0 0',
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

        /*Vertex General*/

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
                    _this.trigger('change:vertexOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
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
                    _this.trigger('change:vertexLabelSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
                }
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
                comboValues: ["circle", "square", "ellipse", "rectangle"]
            }),
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:vertexShape', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
                }
            }
        });


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
                    _this.trigger('change:vertexColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
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
                    _this.trigger('change:vertexStrokeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
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
                    _this.trigger('change:vertexSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
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
                    _this.trigger('change:vertexStrokeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexDisplayAttribute', e);
                }
            }
        });


        //List Vertex
        this.vertexPieColorAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'pieColor',
            displayLabel: 'Pie chart fill',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list : true,
            control: new ColorAttributeControl({
                displayAttribute: 'pieColor',
                defaultValue: this.vertexDefaults.color
            }),
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:vertexPieColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexPieDisplayAttribute', e);
                }
            }
        });
        this.vertexPieRadiusAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'pieRadius',
            displayLabel: 'Pie chart radius',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list : true,
            control: new NumberAttributeControl({
                displayAttribute: 'pieRadius',
                defaultValue: this.vertexDefaults.size,
                maxValue: 160,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:vertexPieRadius', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexPieDisplayAttribute', e);
                }
            }
        });
        this.vertexPieAreaAttributeWidget = new VisualAttributeWidget({
            displayAttribute: 'pieArea',
            displayLabel: 'Pie chart area',
            attributeManager: this.vertexAttributeManager,
            attributesStore: this.vertexComboStore,
            list : true,
            control: new NumberAttributeControl({
                displayAttribute: 'pieArea',
                defaultValue: 1,
                maxValue: 1,
                minValue: 0,
                step: 1
            }),
            handlers: {
                'change:default': function (e) {
                    _this.trigger('change:vertexPieArea', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:vertexPieDisplayAttribute', e);
                }
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
                    _this.trigger('change:edgeColor', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
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
                    _this.trigger('change:edgeSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
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
                    _this.trigger('change:edgeOpacity', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
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
                    _this.trigger('change:edgeLabelSize', e);
                },
                'change:visualSet': function (e) {
                    _this.trigger('change:edgeDisplayAttribute', e);
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
                comboValues: ["directed", "undirected", "inhibited", "dot", "odot"]
            }),
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
                            xtype: 'box',
                            margin: '5 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                borderBottom: '1px solid gray'
                            },
                            html: 'General settings'
                        },
                        this.createLabelComboComponent({
                            comboStore: this.vertexComboStore,
                            eventName: 'change:vertexLabel'
                        }),
                        this.vertexLabelSizeAttributeWidget.getComponent(),
                        this.vertexOpacityAttributeWidget.getComponent(),
                        this.vertexShapeAttributeWidget.getComponent(),
                        {
                            xtype: 'box',
                            margin: '20 0 5 0',
                            flex: 1,
                            style: {
                                fontWeight: 'bold',
                                borderBottom: '1px solid gray'
                            },
                            html: 'Simple node settings'
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            margin: '0 0 5 0',
                            style: {
                                borderBottom: '1px solid lightgray',
                                textAlign: 'center'
                            },
                            items: [
                                {xtype: 'box', width: 80, margin: '0 0 0 0', html: 'Name'},
                                {xtype: 'box', width: 65, margin: '0 10 0 0', html: 'Default'},
                                {xtype: 'box', width: 100, html: 'Attribute'}
                            ]
                        },
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
                                borderBottom: '1px solid gray'
                            },
                            html: 'Complex node settings'
                        },
                        this.vertexPieColorAttributeWidget.getComponent(),
                        this.vertexPieRadiusAttributeWidget.getComponent(),
                        this.vertexPieAreaAttributeWidget.getComponent()
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
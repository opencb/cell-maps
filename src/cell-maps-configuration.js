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
                        {
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
                                    text: 'Color'
                                },
                                this.getColorSelect('#9fc6e7', function (color, component) {
                                    component.nextSibling().setText('Select attribute');
                                    component.nextSibling().nextSibling().disable();
                                    _this.trigger('change:nodeColor', {color: color});
                                }),
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var color = $(bt.previousNode().getEl().dom).find('div').attr('color');
                                        _this.createMappingWindow({
                                            type: 'color',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: color,
                                            button: bt
                                        });
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
                                        _this.trigger('change:nodeColor', {color: color});
                                    }
                                }

                            ]
                        },
                        {
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
                                    text: 'Stroke color'
                                },
                                this.getColorSelect('#9fc6e7', function (color, component) {
                                    component.nextSibling().setText('Select attribute');
                                    component.nextSibling().nextSibling().disable();
                                    _this.trigger('change:nodeStrokeColor', {color: color});
                                }),
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var color = $(bt.previousNode().getEl().dom).find('div').attr('color');
                                        _this.createMappingWindow({
                                            type: 'color',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: color,
                                            button: bt
                                        });
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
                                        _this.trigger('change:nodeStrokeColor', {color: color});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Size'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:10,
                                    width: 65,
                                    maxValue: 160,
                                    minValue: 0,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:nodeSize', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 160,
                                            minValue: 0,
                                            step: 1
                                        });
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
                                        _this.trigger('change:nodeSize', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Stroke size'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:1,
                                    width: 65,
                                    maxValue: 10,
                                    minValue: 0,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:nodeStrokeSize', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 10,
                                            minValue: 0,
                                            step: 1
                                        });
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
                                        _this.trigger('change:nodeStrokeSize', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Opacity'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:1,
                                    width: 65,
                                    maxValue: 1,
                                    minValue: 0,
                                    step: 0.1,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:nodeOpacity', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 1,
                                            minValue: 0,
                                            step: 0.1
                                        });
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
                                        _this.trigger('change:nodeOpacity', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Label size'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:12,
                                    width: 65,
                                    maxValue: 16,
                                    minValue: 0,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:nodeLabelSize', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 16,
                                            minValue: 0,
                                            step: 1
                                        });
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
                                        _this.trigger('change:nodeLabelSize', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Shape'
                                },
                                {
                                    xtype: 'combo',
                                    value:'circle',
                                    store: ["circle", "square", "ellipse", "rectangle"],
                                    width: 65,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: function (field, e) {
                                            var value = field.getValue();
                                            if (value != null) {
                                                _this.trigger('change:nodeShape', {value: value});
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'select',
                                            graphElement: 'node',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            selectItems: ["circle", "square", "ellipse", "rectangle"]
                                        });
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
                                        _this.trigger('change:nodeShape', {value: value});
                                    }
                                }
                            ]
                        },
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
                        {
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
                                    store: Ext.create('Ext.data.Store', {fields: ['name'], data: [
                                        {name: ''}
                                    ]}),
                                    displayField: 'name',
                                    valueField: 'name',
                                    width: 120,
                                    queryMode: 'local',
                                    margin: '0 10 0 0',
                                    listeners: {
                                        afterrender: function (combo) {
                                            var el = combo.getEl();
                                            el.on('click', function () {
                                                combo.collapse();
                                                combo.store.loadData(_this.nodeAttributeManager.attributes);
                                                combo.expand();
                                            });
                                        },
                                        change: function (field, e) {
                                            var value = field.getValue();
                                            if (value != null) {
                                                _this.trigger('change:nodeLabel', {value: value});
                                            }
                                        }
                                    }
                                }
                            ]
                        }
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
                        {
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
                                    text: 'Color'
                                },
                                this.getColorSelect('#dddddd', function (color, component) {
                                    component.nextSibling().setText('Select attribute');
                                    component.nextSibling().nextSibling().disable();
                                    _this.trigger('change:edgeColor', {color: color});
                                }),
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var color = $(bt.previousNode().getEl().dom).find('div').attr('color');
                                        _this.createMappingWindow({
                                            type: 'color',
                                            graphElement: 'edge',
                                            displayAttr: text,
                                            defaultValue: color,
                                            button: bt
                                        });
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
                                        _this.trigger('change:edgeColor', {color: color});
                                    }
                                }

                            ]
                        },
                        {
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
                                    text: 'Size'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:1,
                                    width: 65,
                                    maxValue: 10,
                                    minValue: 1,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:edgeSize', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'edge',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 10,
                                            minValue: 1,
                                            step: 1
                                        });
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
                                        _this.trigger('change:edgeSize', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Label size'
                                },
                                {
                                    xtype: 'numberfield',
                                    value:0,
                                    width: 65,
                                    maxValue: 16,
                                    minValue: 0,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: {
                                            buffer: 100,
                                            fn: function (field, newValue) {
                                                if (newValue != null) {
                                                    _this.trigger('change:edgeLabelSize', {value: newValue});
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'number',
                                            graphElement: 'edge',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            maxValue: 16,
                                            minValue: 0,
                                            step: 1
                                        });
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
                                        _this.trigger('change:edgeLabelSize', {value: value});
                                    }
                                }
                            ]
                        },
                        {
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
                                    text: 'Shape'
                                },
                                {
                                    xtype: 'combo',
                                    value:'undirected',
                                    store: ["directed", "undirected", "inhibited", "dot", "odot"],
                                    width: 65,
                                    margin: '0 10 0 0',
                                    listeners: {
                                        change: function (field, e) {
                                            var value = field.getValue();
                                            if (value != null) {
                                                _this.trigger('change:edgeShape', {value: value});
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    text: 'Select attribute',
                                    width: 100,
                                    handler: function (bt) {
                                        var text = bt.up('container').down('text').text;
                                        var value = bt.previousNode().getValue();
                                        _this.createMappingWindow({
                                            type: 'select',
                                            graphElement: 'edge',
                                            displayAttr: text,
                                            defaultValue: value,
                                            button: bt,
                                            selectItems: ["directed", "undirected", "inhibited", "dot", "odot"]
                                        });
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
                                        _this.trigger('change:edgeShape', {value: value});
                                    }
                                }
                            ]
                        },
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
                        {
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
                                    store: Ext.create('Ext.data.Store', {fields: ['name'], data: [
                                        {name: ''}
                                    ]}),
                                    displayField: 'name',
                                    valueField: 'name',
                                    width: 120,
                                    queryMode: 'local',
                                    margin: '0 10 0 0',
                                    listeners: {
                                        afterrender: function (combo) {
                                            var el = combo.getEl();
                                            el.on('click', function () {
                                                combo.collapse();
                                                combo.store.loadData(_this.edgeAttributeManager.attributes);
                                                combo.expand();
                                            });
                                        },
                                        change: function (field, e) {
                                            var value = field.getValue();
                                            if (value != null) {
                                                _this.trigger('change:edgeLabel', {value: value});
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]

                }
            ]




        });
        return this.propertiesPanel;
    },
    createMappingWindow: function (args) {

        var _this = this;
        // The data store containing the list of states
        var typeSt = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": "string", "name": "String"},
//                {"id": "number", "name": "Number"},
//                {"id": "listnumber", "name": "List string"},
//                {"id": "liststring", "name": "List number"}
            ]
        });

        var attributeManager;
        if(args.graphElement == 'edge'){
            attributeManager = this.edgeAttributeManager;
        }else{
            attributeManager = this.nodeAttributeManager;
        }

        this.attrSt = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: attributeManager.attributes
        });

        var uniqueStoreMap = {};
        var mappingGridMap = {};
        var getColorGrid = function (fieldName) {
            return Ext.create('Ext.grid.Panel', {
                border: false,
                store: uniqueStoreMap[fieldName],
                cls: 'bootstrap',
                selModel: {
                    mode: 'MULTI'
                },
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1, listeners: {
//                    edit: function (editor, e, eOpts) {
//                        console.log(e.record)
//                    }
                }})],
                tbar: {items: [
                    '->',
                    {
                        text: 'Select all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().selectAll();
                        }
                    }, {
                        text: 'Deselect all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().deselectAll();
                        }
                    },

                    _this.getColorSelect(args.defaultValue, function (color) {
                        var records = mappingGridMap[fieldName].getSelectionModel().getSelection();
                        for (var i = 0; i < records.length; i++) {
                            var record = records[i];
                            record.set('visualParam', color)
                        }
                    })
                ]},
                listeners: {
                    cellclick: function (cell, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        if (cellIndex == 1) {
                            var x = e.browserEvent.clientX;
                            var y = e.browserEvent.clientY;
                            _this._showColorMenu(x, y, function (color) {
                                record.set('visualParam', color);
//                                    $(el.dom).find('div').attr('color', record.get('visualParam'));
//                                    $(el.dom).find('div').css({'background-color': color});
                            });
                        }
                    }
                },
                columns: [
                    { text: 'Attribute Value', dataIndex: 'value', menuDisabled: true, flex: 1},
                    { xtype: 'templatecolumn', menuDisabled: true, width: 45, tpl: '<div style="width:30px;height:12px;background-color: {visualParam};"></div>'},
                    { text: args.displayAttr, dataIndex: 'visualParam', flex: 1, menuDisabled: true, editor: {xtype: 'textfield', allowBlank: false}}
                ]
            });
        };
        var getSelectGrid = function (fieldName) {
            return Ext.create('Ext.grid.Panel', {
                border: false,
                store: uniqueStoreMap[fieldName],
                cls: 'bootstrap',
                selModel: {
                    mode: 'MULTI'
                },
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1, listeners: {
//                    edit: function (editor, e, eOpts) {
//                        console.log(e.record)
//                    }
                }})],
                tbar: {items: [
                    '->',
                    {
                        text: 'Select all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().selectAll();
                        }
                    }, {
                        text: 'Deselect all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().deselectAll();
                        }
                    },
                    {
                        xtype: 'combo',
                        width: 100,
                        store: args.selectItems,
                        listeners: {
                            change: function (combo, select) {
                                var records = mappingGridMap[fieldName].getSelectionModel().getSelection();
                                for (var i = 0; i < records.length; i++) {
                                    var record = records[i];
                                    record.set('visualParam', select)
                                }
                            }
                        }
                    }
                ]},
                columns: [
                    { text: 'Attribute Value', dataIndex: 'value', menuDisabled: true, flex: 1},
                    {
                        header: args.displayAttr,
                        dataIndex: 'visualParam',
                        width: 130,
                        menuDisabled: true,
                        editor: {
                            xtype: 'combo',
                            store: args.selectItems
                        }
                    }
                ]
            });
        };
        var getNumberGrid = function (fieldName) {
            return Ext.create('Ext.grid.Panel', {
                border: false,
                store: uniqueStoreMap[fieldName],
                cls: 'bootstrap',
                selModel: {
                    mode: 'MULTI'
                },
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 1, listeners: {
//                    edit: function (editor, e, eOpts) {
//                        console.log(e.record)
//                    }
                }})],
                tbar: {items: [
                    '->',
                    {
                        text: 'Select all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().selectAll();
                        }
                    }, {
                        text: 'Deselect all',
                        handler: function () {
                            mappingGridMap[fieldName].getSelectionModel().deselectAll();
                        }
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
                                    var records = mappingGridMap[fieldName].getSelectionModel().getSelection();
                                    for (var i = 0; i < records.length; i++) {
                                        var record = records[i];
                                        record.set('visualParam', newValue)
                                    }
                                }
                            }
                        }
                    }
                ]},
                columns: [
                    { text: 'Attribute Value', dataIndex: 'value', menuDisabled: true, flex: 1},
                    {
                        header: args.displayAttr,
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
        };

        var getUniqueGrid = function (fieldName, type) {
            if (typeof uniqueStoreMap[fieldName] === 'undefined') {

                var values = attributeManager.getUniqueByAttribute(fieldName);
                var valuesData = [];
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    valuesData.push({value: value, visualParam: args.defaultValue});

                }
                uniqueStoreMap[fieldName] = Ext.create('Ext.data.Store', {
                    fields: ['value', 'visualParam'],
                    data: valuesData
                });
                switch (type) {
                    case 'color':
                        mappingGridMap[fieldName] = getColorGrid(fieldName);
                        break;
                    case 'select':
                        mappingGridMap[fieldName] = getSelectGrid(fieldName);
                        break;
                    case 'number':
                        mappingGridMap[fieldName] = getNumberGrid(fieldName);
                        break;
                }
            }
            return mappingGridMap[fieldName];
        };

        var stringMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'String mapping',
            border: 0,
            layout:'fit'
        });

        var numberMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'Number mapping',
            border: 0,
            layout:'fit'
        });

        var ListStringMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'List string mapping',
            border: 0,
            layout:'fit'
        });
        var ListNumberMappingPanel = Ext.create('Ext.panel.Panel', {
//            title: 'List number mapping',
            border: 0,
            layout:'fit'
        });


        var window = Ext.create('Ext.window.Window', {
            title: args.displayAttr + ' mapping',
            height: 400,
            width: 600,
            closable: true,
            bodyStyle: 'background-color: white;',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: '0 0 0 0'
            },
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    padding: 5,
                    border: '0 0 1 0',
                    bodyStyle: {
                    },
                    style: {
                        backgroundColor: '#f5f5f5',
                        borderColor: 'lightgray',
                        borderStyle: 'solid'
                    },
                    defaults: {
                        margin: '0 1 0 1'
                    },
                    items: [
                        {
                            xtype: 'text',
                            margin: '5 0 0 0',
                            text: 'Attribute name:'
                        },
                        {
                            xtype: 'combo',
                            margin: '0 0 0 10',
                            width: 100,
                            store: this.attrSt,
                            queryMode: 'local',
                            qid: 'attrCombo',
                            displayField: 'name',
                            valueField: 'name',
                            listeners: {
                                afterrender: function () {
                                    this.select(this.getStore().getAt(0));
                                },
                                change: function (combo, select) {
                                    console.log(select)
                                    stringMappingPanel.removeAll(false);
                                    stringMappingPanel.add(getUniqueGrid(select, args.type));
                                }
                            }
                        },
                        {
                            xtype: 'text',
                            margin: '5 0 0 10',
                            text: 'Attribute type:'
                        },
                        {
                            xtype: 'combo',
                            margin: '0 0 0 10',
                            width: 100,
                            qid: 'typeCombo',
                            store: typeSt,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'id',
                            listeners: {
                                afterrender: function () {
                                    this.select(this.getStore().getAt(0));
                                    attrComboId = this.id
                                },
                                change: function (combo, select) {
                                    console.log(select);
                                    var cont = combo.up('container').nextSibling();
                                    cont.removeAll(false);
                                    switch (select) {
                                        case 'string':
                                            cont.add(stringMappingPanel);
                                            break;
                                        case 'number':
                                            cont.add(numberMappingPanel);
                                            break;
                                        case 'liststring':
                                            cont.add(ListStringMappingPanel);
                                            break;
                                        case 'listnumber':
                                            cont.add(ListNumberMappingPanel);
                                            break;

                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'container',
                    flex: 1,
//                    border:'1 1 1 1',
//                    style:{
//                        borderColor:'lightgray',
//                        borderStyle:'solid'
//                    },
                    layout: 'fit'
                }
            ],
            buttons: [
                {
                    text: 'Close',
                    handler: function (bt) {
                        bt.up('window').close();
                    }
                },
                {
                    text: 'Ok',
                    handler: function (bt) {
//                        text.setText('Enabled');
//                        button.setText();
//                        cellMaps.networkViewer.network.setVerticesRendererAttributeMap("color","Column1",{"autophagy":"#659939", "carboxylic acid metabolic process":"#FF0011"})

                        var typeCombo = bt.up('window').down('combo[qid=typeCombo]');
                        var attrCombo = bt.up('window').down('combo[qid=attrCombo]');

                        var attributeName = attrCombo.getValue();

                        var st = uniqueStoreMap[attributeName];
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
                        args.button.setText(attributeName);
                        args.button.nextNode().enable();

                        _this.trigger('change:' + args.graphElement + 'DiplayAttribute', {diplayAttribute: Utils.camelCase(args.displayAttr), attribute: attributeName, map: map, sender: _this})

                        bt.up('window').close();

                    }
                }
            ]
        }).show();


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
            "000000"
        ];

        for (var i in colors) {
            var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
            $(select).append(menuEntry);
        }
    }
}
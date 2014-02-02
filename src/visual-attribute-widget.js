function VisualAttributeWidget(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('VisualAttributeWidget');

    this.width = 400;
    this.height = 600;


    this.visualType;
    this.attributeManager;
    //set instantiation args, must be last
    _.extend(this, args);

//    this.uniqueStoreMap = {};
    this.gridMap = {};
    this.storeMap = {};


    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

VisualAttributeWidget.prototype = {
    render: function () {
        var _this = this;

        this.comboStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'a'}
            ]
        });

        var typeSt = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": "string", "name": "String"},
//                {"id": "number", "name": "Number"},
//                {"id": "listnumber", "name": "List string"},
//                {"id": "liststring", "name": "List number"}
            ]
        });


        var stringMappingPanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            layout: 'fit'
        });

        var numberMappingPanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            layout: 'fit'
        });

        var ListStringMappingPanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            layout: 'fit'
        });
        var ListNumberMappingPanel = Ext.create('Ext.panel.Panel', {
            border: 0,
            layout: 'fit'
        });

        this.window = Ext.create('Ext.window.Window', {
            title: this.title,
            height: this.width,
            width: this.height,
            closable: false,
            minimizable: true,
            modal: true,
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
                            store: this.comboStore,
                            queryMode: 'local',
                            qid: 'attrCombo',
                            displayField: 'name',
                            valueField: 'name',
                            listeners: {
                                afterrender: function () {
                                    this.select(this.getStore().getAt(0));
                                },
                                change: function (combo, select) {
                                    var attributeType = combo.up('container').nextSibling().down('combo').getValue();
//                                    console.log(select)
                                    stringMappingPanel.removeAll(false);
                                    stringMappingPanel.add(_this.getUniqueGrid(select), attributeType);
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
                        bt.up('window').hide();
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
            ],
            listeners: {
                minimize: function () {
                    this.hide();
                }
            }
        });
    },
    draw: function () {
        this.window.show();
    },
    getUniqueGrid: function (attributeName, attributeType) {
        if (typeof this.gridMap[attributeName] === 'undefined') {

            var values = this.attributeManager.getUniqueByAttribute(attributeName);
            var valuesData = [];
            for (var i = 0; i < values.length; i++) {
                var value = values[i];
                valuesData.push({value: value, visualParam: args.defaultValue});

            }
            this.storeMap[attributeName] = Ext.create('Ext.data.Store', {
                fields: ['value', 'visualParam'],
                data: valuesData
            });
            switch (this.visualType) {
                case 'color':
                    this.gridMap[attributeName] = this.getColorGrid(attributeName);
                    break;
                case 'select':
                    this.gridMap[attributeName] = this.getSelectGrid(attributeName);
                    break;
                case 'number':
                    this.gridMap[attributeName] = this.getNumberGrid(attributeName);
                    break;
            }
        }
        return this.gridMap[attributeName];
    },
    getColorGrid: function (attributeName) {
        var _this = this;
        return Ext.create('Ext.grid.Panel', {
            border: false,
            store: this.storeMap[attributeName],
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
                        _this.gridMap[attributeName].getSelectionModel().selectAll();
                    }
                }, {
                    text: 'Deselect all',
                    handler: function () {
                        _this.gridMap[attributeName].getSelectionModel().deselectAll();
                    }
                },

                _this.getColorSelect(args.defaultValue, function (color) {
                    var records = _this.gridMap[attributeName].getSelectionModel().getSelection();
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
                { text: this.visualType, dataIndex: 'visualParam', flex: 1, menuDisabled: true, editor: {xtype: 'textfield', allowBlank: false}}
            ]
        });
    },
    getSelectGrid: function (attributeName) {
        var _this = this;
        return Ext.create('Ext.grid.Panel', {
            border: false,
            store: this.storeMap[attributeName],
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
                        _this.gridMap[attributeName].getSelectionModel().selectAll();
                    }
                }, {
                    text: 'Deselect all',
                    handler: function () {
                        _this.gridMap[attributeName].getSelectionModel().deselectAll();
                    }
                },
                {
                    xtype: 'combo',
                    width: 100,
                    store: args.selectItems,
                    listeners: {
                        change: function (combo, select) {
                            var records = _this.gridMap[attributeName].getSelectionModel().getSelection();
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
                    header: this.visualType,
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
    },
    getNumberGrid: function (attributeName) {
        var _this = this;
        return Ext.create('Ext.grid.Panel', {
            border: false,
            store: uniqueStoreMap[attributeName],
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
                        _this.gridMap[attributeName].getSelectionModel().selectAll();
                    }
                }, {
                    text: 'Deselect all',
                    handler: function () {
                        _this.gridMap[attributeName].getSelectionModel().deselectAll();
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
                                var records = _this.gridMap[attributeName].getSelectionModel().getSelection();
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
                    header: this.visualType,
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
    }

};
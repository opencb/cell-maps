function VisualAttributeWidget(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('VisualAttributeWidget');

    //set instantiation args, must be last
    _.extend(this, args);

    this.displayAttribute;
    this.attributeManager;
    this.attributesStore;
    this.defaultValue

    this.visualSet;

    this.on(this.handlers);

    this.gridMap = {};
    this.window;
    this.component;
    this.button;
    this.removeButton;

    this.lastAttributeName;
    this.lastStore;

    this.autoRender = true;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


VisualAttributeWidget.prototype.createControl = function (changeFunction) {
    // abstract
}

VisualAttributeWidget.prototype.defaultValueChanged = function () {
    this.trigger('change:default', {value: this.defaultValue});
    if (typeof this.visualSet !== 'undefined') {
        this._updateVisualSet(this.lastStore, this.lastAttributeName);
    }
}

VisualAttributeWidget.prototype.visualSetChanged = function () {
    if (typeof this.visualSet !== 'undefined') {
        this.trigger('change:visualSet', this.visualSet);
    }
}

VisualAttributeWidget.prototype.render = function () {
    this._createWindow();
    this._createComponent();
}

VisualAttributeWidget.prototype.getComponent = function () {
    return this.component;
}
VisualAttributeWidget.prototype._createComponent = function () {
    var _this = this;
    this.button = Ext.create('Ext.Button', {
        xtype: 'button',
        text: 'Select attribute',
        width: 100,
        handler: function () {
            _this.window.show();
        }
    });

    this.removeButton = Ext.create('Ext.Button', {
        disabled: true,
        text: '<span class="bootstrap"><span class="glyphicon glyphicon-remove" style="font-size: 15px"></span></span>',
        handler: function (bt) {
            _this.button.setText('Select attribute');
            _this.removeButton.disable();
            delete _this.visualSet;
            _this.defaultValueChanged();
        }
    });

    this.component = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        defaults: {
            margin: '0 1 0 1'
        },
        items: [
            {
                xtype: 'text',
                text: this.displayAttribute,
                width: 80,
                margin: '5 0 0 0'
            },
            this.createControl(function (newValue) {
                _this.defaultValue = newValue;
                _this.defaultValueChanged();

            }),
            this.button,
            this.removeButton
        ]
    });
}
VisualAttributeWidget.prototype._createWindow = function () {
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
                store: this.attributesStore,
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
                        stringMappingPanel.removeAll(false);
                        console.log(select)
                        _this.lastAttributeName = select;
                        var grid = _this._createGrid(select);
                        _this.lastStore = _this.gridMap[select].getStore();
                        stringMappingPanel.add(grid);
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

    this.window = Ext.create('Ext.window.Window', {
        title: this.displayAttribute + ' by attributes',
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

                    var store = _this.gridMap[attributeName].getStore();
                    _this._updateVisualSet(store, attributeName);

                    _this.button.setText(attributeName);
                    _this.removeButton.enable();

                    bt.up('window').hide();
                }
            }
        ]
    });
}

VisualAttributeWidget.prototype._updateVisualSet = function (store, attributeName) {
    var map = {};

    var data = store.snapshot || store.data;
    var records = data.items;
    for (var i = 0; i < records.length; i++) {
        var d = records[i].data;
        map[d.value] = d.visualParam;
    }
//                        console.log(map);
    this.visualSet = {diplayAttribute: Utils.camelCase(this.displayAttribute), attribute: attributeName, map: map, sender: this};
    this.visualSetChanged();
}


VisualAttributeWidget.prototype._createGrid = function (attributeName) {
    var _this = this;
    if (typeof this.gridMap[attributeName] === 'undefined') {

        var store = this._createUniqueStore(attributeName);

        this.attributeManager.on('change:recordsAttribute', function (e) {
            _this._updateUniqueStore(attributeName, e.attributeName, store);
        });

        this.on('change:default', function (e) {
            control.setRawValue(e.value);

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

        var control = this.createControl(function (newValue) {
            store.suspendEvents();
            var records = grid.getSelectionModel().getSelection();
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                record.set('visualParam', newValue);
            }
            store.resumeEvents();
            store.fireEvent('refresh');
        })

        var cols = [
            { text: attributeName, dataIndex: 'value', menuDisabled: true, flex: 1}
        ];
        var columns = cols.concat(this.createGridColumns());
        var gridListeners = this.createGridListeners();

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
                control
            ]},
            listeners: gridListeners,
            columns: columns
        });

        this.gridMap[attributeName] = grid;
    }
    return this.gridMap[attributeName];
}


VisualAttributeWidget.prototype._getUniqueValues = function (attributeName) {
    var values = this.attributeManager.getUniqueByAttribute(attributeName);
    var valuesData = [];
    for (var j = 0; j < values.length; j++) {
        var value = values[j];
        valuesData.push({value: value, visualParam: this.defaultValue});
    }
    return valuesData;
};
VisualAttributeWidget.prototype._createUniqueStore = function (attributeName) {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {type: 'memory'},
        fields: ['value', 'visualParam'],
        data: this._getUniqueValues(attributeName)
    });
    return store;
};
VisualAttributeWidget.prototype._updateUniqueStore = function (attributeName, modifiedAttributeName, store) {
    if (attributeName === modifiedAttributeName) {
        var data = store.snapshot || store.data;
        var records = data.items;
        var dirtyRecords = {};
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (record.dirty) {
                dirtyRecords[record.get('value')] = record.get('visualParam');
            }
        }

        store.loadData(this._getUniqueValues(attributeName));

        //restore value on records
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

        this._updateVisualSet(store, attributeName);
    }
};
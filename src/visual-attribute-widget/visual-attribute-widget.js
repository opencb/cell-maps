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
    this.lastType;
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

VisualAttributeWidget.prototype.setAttributeManager = function (attributeManager) {
    var _this = this;
    this.attributeManager = attributeManager;

    var addHandler = function (attributeName, store) {
        _this.attributeManager.on('change:recordsAttribute', function (e) {
            _this._updateUniqueStore(attributeName, e.attributeName, store);
        });
    }
    for (var attributeName in this.gridMap) {
        var store = this.gridMap[attributeName].getStore();
        addHandler(attributeName, store);
    }
}

VisualAttributeWidget.prototype.applyVisualSet = function (attributeName, type) {
    this.button.el.dom.click();
    this.attributeNameCombo.select(attributeName);
    this.attributeTypeCombo.select(type);
    var grid = this.gridMap[attributeName][type];
    grid.down('button[text~=Apply]').el.dom.click();
    this.window.down('button[text~=Ok]').el.dom.click();
}
VisualAttributeWidget.prototype.removeVisualSet = function () {
    this.removeButton.el.dom.click();
}

VisualAttributeWidget.prototype.defaultValueChanged = function () {
    this.trigger('change:default', {value: this.defaultValue});
    if (typeof this.visualSet !== 'undefined') {
        this._updateVisualSet();
    }
}

VisualAttributeWidget.prototype.visualSetChanged = function () {
    if (typeof this.visualSet !== 'undefined') {
        this.trigger('change:visualSet', this.visualSet);
    }
}

VisualAttributeWidget.prototype.render = function () {
    if (this.rendered !== true) {
        this._createWindow();
        this._createComponent();
        this.rendered = true;
    }
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
        text: '<span class="bootstrap"><span class="glyphicon glyphicon-trash" style="font-size: 15px"></span></span>',
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

    var container = Ext.create('Ext.container.Container', {
        layout: 'fit'
    });


    this.attributeNameCombo = Ext.create('Ext.form.field.ComboBox', {
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
                _this.lastAttributeName = select;
                if (typeof _this.lastType === 'undefined') {
                    _this.lastType = 'String';
                }
                var grid = _this._createGrid(_this.lastAttributeName, _this.lastType);
                _this.lastStore = _this.gridMap[_this.lastAttributeName][_this.lastType].getStore();

                console.log(_this.lastAttributeName + ' - ' + _this.lastType);
                container.removeAll(false);
                container.add(grid);
            }
        }
    });

    this.attributeTypeCombo = Ext.create('Ext.form.field.ComboBox', {
        margin: '0 0 0 10',
        width: 200,
        labelWidth: 70,
        fieldLabel: 'Attribute type',
        qid: 'typeCombo',
        store: ['String', 'Integer', 'Float'/*, 'List string','List number'*/],
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
                _this.lastType = select;

                var grid = _this._createGrid(_this.lastAttributeName, _this.lastType);
                _this.lastStore = _this.gridMap[_this.lastAttributeName][_this.lastType].getStore();

                console.log(_this.lastAttributeName + ' - ' + _this.lastType);
                container.removeAll(false);
                container.add(grid);
            }
        }
    });

    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        items: [
            this.attributeNameCombo,
            this.attributeTypeCombo
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
            container
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
                    _this._updateVisualSet();
                    _this.button.setText(_this.lastAttributeName);
                    _this.removeButton.enable();
                    bt.up('window').hide();
                }
            }
        ]
    });
}

VisualAttributeWidget.prototype._updateVisualSet = function () {
    var map = {};

    var store = this.lastStore;
    var attributeName = this.lastAttributeName;

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


VisualAttributeWidget.prototype._createGrid = function (attributeName, type) {
    var _this = this;

    if (typeof this.gridMap[attributeName] === 'undefined') {
        this.gridMap[attributeName] = {};
    }

    if (typeof this.gridMap[attributeName][type] === 'undefined') {

        var grid;
        switch (type) {
            case 'String':
            case 'Integer':
                grid = this._createStringGrid(attributeName);
                break;
            case 'Float':
                grid = this._createContinousGrid(attributeName);
                break;
            default:

        }
        this.gridMap[attributeName][type] = grid;
    }

    return this.gridMap[attributeName][type];
}

VisualAttributeWidget.prototype._createStringGrid = function (attributeName) {
    var _this = this;

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
        dockedItems: [
            {
                xtype: 'toolbar',
                items: [
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
                    '-',
                    {
                        text: 'Apply direct',
                        handler: function (bt) {
                            var store = bt.up('grid').store;
                            //restore value on records
                            var data = store.snapshot || store.data;
                            var records = data.items;
                            store.suspendEvents();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                record.set('visualParam', record.get('value'));
                            }
                            store.resumeEvents();
                            store.fireEvent('refresh');
                        }
                    },
                    '->',
                    {
                        xtype: 'tbtext',
                        text: 'Apply to selected rows:'
                    },
                    control
                ]
            }
        ],
        listeners: gridListeners,
        columns: columns
    });

    return grid;
}

VisualAttributeWidget.prototype._createContinousGrid = function (attributeName) {
    var _this = this;
    var normArray = [];

    var updateNormArray = function () {
        normArray = [];
        var items = panel.items.getAt(0).items.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var contValue = item.items.getAt(0).getRawValue();
            var normValue = item.items.getAt(1).getRawValue();
            normArray.push({cont: contValue, norm: normValue});
        }
    };

    var panel = this._createContinousControlPanel(function () {
        updateNormArray();
        _this._updateContinousUniqueStore(attributeName, false, store, normalizeFunction);
    });
    updateNormArray();

    var normalizeFunction = function (value) {
        var value = parseFloat(value);
        if (isNaN(value)) {
            return 'not a number'
        }
        var first = normArray[0];
        var second = normArray[normArray.length - 1];
        for (var i = 0; i < normArray.length; i++) {
            var contValue = normArray[i].cont;
            if (normArray[i + 1]) {
                var nextContValue = normArray[i + 1].cont;
                if (value >= contValue && value <= nextContValue) {
                    var first = normArray[i];
                    var second = normArray[i + 1];
                }
            }
        }
        var val = _this.getNormalizedValue(first, second, value);
        return val;
    };
    var store = this._createContinousUniqueStore(attributeName, normalizeFunction);

    this.attributeManager.on('change:recordsAttribute', function (e) {
        updateNormArray();
        _this._updateContinousUniqueStore(attributeName, e.attributeName, store, normalizeFunction);
    });

    this.on('change:default', function (e) {
        //TODO not necessary for now
    });

    var cols = [
        { text: attributeName, dataIndex: 'value', menuDisabled: true, flex: 1}
    ];
    var columns = cols.concat(this.createGridColumns());

    var grid = Ext.create('Ext.grid.Panel', {
        xtype: 'grid',
        border: false,
        store: store,
        loadMask: true,
        cls: 'bootstrap',
        plugins: [
            'bufferedrenderer',
        ],
        dockedItems: [
            panel
        ],
        columns: columns
    });

    return grid;

}

VisualAttributeWidget.prototype._interpolate = function (pBegin, pEnd, pStep, pMax) {
    if (pBegin < pEnd) {
        return ((pEnd - pBegin) * (pStep / pMax)) + pBegin;
    } else {
        return ((pBegin - pEnd) * (1 - (pStep / pMax))) + pEnd;
    }
}

VisualAttributeWidget.prototype._createContinousControlPanel = function (changeFunction) {
    var _this = this;
    var maxmin = this._getContinousUniqueMaxAndMin(this.lastAttributeName);

    var updateLegend = function () {
        var items = panel.items.getAt(0).items.items;
        var component = _this.updateLegend(items);

        var legendPanel = panel.items.getAt(1);
        legendPanel.removeAll();
        legendPanel.add(component);
    }

    var min = Ext.create('Ext.form.field.Number', {
        hideTrigger: true,
        width: 130,
        value: maxmin.min,
        labelWidth: 70,
        fieldLabel: 'Min point',
        margin: '0 10 0 0',
        listeners: {
            change: {
                buffer: 100,
                fn: function (field, newValue) {
                    if (newValue != null) {
                        changeFunction();
                        updateLegend();
                    }
                }
            }
        }
    });
    var controlMin = this.createControl(function (newValue) {
        changeFunction();
        updateLegend();
    });
    var minContainer = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            min, controlMin
        ]
    });

    var max = Ext.create('Ext.form.field.Number', {
        hideTrigger: true,
        width: 130,
        value: maxmin.max,
        labelWidth: 70,
        fieldLabel: 'Max point',
        margin: '0 10 0 0',
        listeners: {
            change: {
                buffer: 100,
                fn: function (field, newValue) {
                    if (newValue != null) {
                        changeFunction();
                        updateLegend();
                    }
                }
            }
        }
    });
    var controlMax = this.createControl(function (newValue) {
        changeFunction();
        updateLegend();
    });
    var maxContainer = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            max, controlMax
        ]
    });


    var pointsContainer = Ext.create('Ext.panel.Panel', {
        border: 0,
        bodyPadding: 5,
        layout: 'vbox',
        width: 250,
        items: [minContainer, maxContainer]
    });

    var panel = Ext.create('Ext.panel.Panel', {
        border: 0,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        dockedItems: [
            {
                xtype: 'toolbar',
                items: [
                    {
                        text: '<span class="bootstrap"><span class="glyphicon glyphicon-plus" style="font-size: 14px"></span></span> Intermediate point',
                        handler: function () {
                            var i = pointsContainer.items.length - 1;

                            var minVal = parseFloat(pointsContainer.items.getAt(0).items.getAt(0).getRawValue());
                            var maxVal = parseFloat(pointsContainer.items.getAt(i).items.getAt(0).getRawValue());

                            var field = Ext.create('Ext.form.field.Number', {
                                hideTrigger: true,
                                width: 130,
                                value: (maxVal + minVal) / 2,
                                labelWidth: 70,
                                fieldLabel: 'Point',
                                margin: '0 10 0 0',
                                listeners: {
                                    change: {
                                        buffer: 100,
                                        fn: function (field, newValue) {
                                            if (newValue != null) {
                                                changeFunction();
                                                updateLegend();
                                            }
                                        }
                                    }
                                }
                            });
                            var control = _this.createControl(function (newValue) {
                                changeFunction();
                                updateLegend();
                            });
                            var cont = Ext.create('Ext.container.Container', {
                                layout: 'hbox',
                                items: [
                                    field, control,
                                    {
                                        xtype: 'button',
                                        text: '<span class="bootstrap"><span class="glyphicon glyphicon-trash" style="font-size: 12px;height:15px"></span></span>',
                                        handler: function (bt) {
                                            bt.up('container').destroy();
                                            changeFunction();
                                            updateLegend();
                                        }}
                                ]
                            });
                            pointsContainer.insert(i, cont);
                        }
                    }
                ]
            }
        ],
        items: [
            pointsContainer,
            {
                border: false,
                bodyPadding: 5,
                flex: 1,
                layout: 'fit',
                items: []
            }

        ]
    });
    updateLegend();
    return panel;
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

        this._updateVisualSet();
    }
};

// CONTINOUS
VisualAttributeWidget.prototype._getContinousUniqueValues = function (attributeName, normalizeFunction) {
    var values = this.attributeManager.getUniqueByAttribute(attributeName);
    var valuesData = [];
    for (var j = 0; j < values.length; j++) {
        var value = values[j];
        valuesData.push({value: value, visualParam: normalizeFunction(value)});
    }
    return valuesData;
};
VisualAttributeWidget.prototype._createContinousUniqueStore = function (attributeName, normalizeFunction) {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {type: 'memory'},
        fields: ['value', 'visualParam'],
        data: this._getContinousUniqueValues(attributeName, normalizeFunction)
    });
    return store;
};
VisualAttributeWidget.prototype._updateContinousUniqueStore = function (attributeName, modifiedAttributeName, store, normalizeFunction) {
    if (modifiedAttributeName === false || attributeName === modifiedAttributeName) {
        store.loadData(this._getContinousUniqueValues(attributeName, normalizeFunction));
        this._updateVisualSet();
    }
};

VisualAttributeWidget.prototype._getContinousUniqueMaxAndMin = function (attributeName) {
    var values = this.attributeManager.getUniqueByAttribute(attributeName);
    var max = 0, min = 0;
    for (var j = 0; j < values.length; j++) {
        var parsedValue = parseFloat(values[j]);
        if (!isNaN(parsedValue)) {
            max = Math.max(parsedValue, max);

            if (min === 0) {
                min = parsedValue;
            }
            min = Math.min(parsedValue, min);
        }
    }
    return {max: max, min: min};
};

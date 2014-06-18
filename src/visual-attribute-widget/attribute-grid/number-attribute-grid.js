NumberAttributeGrid.prototype = new AttributeGrid();
function NumberAttributeGrid(args) {
    AttributeGrid.prototype.constructor.call(this, args);

    this.id = Utils.genId('NumberAttributeGrid');

    this.normArray = [];
};

NumberAttributeGrid.prototype.create = function () {
    var _this = this;

    this.numberPanel = this._createNumberControlPanel(function () {
        _this._updateNormArray();
        _this._updateUniqueStore(false);
    });
    this._updateNormArray();

    this.store = this._createUniqueStore();

    this.attributeManager.on('change:recordsAttribute', function (e) {
        _this._updateNormArray();
        _this._updateUniqueStore(e.attributeName);
    });
    this.attributeManager.on('change:data', function (e) {
        _this._updateNormArray();
        _this._updateUniqueStore(_this.attributeName);
    });

    var cols = [
        { text: this.attributeName, dataIndex: 'value', menuDisabled: true, flex: 1}
    ];
    var columns = cols.concat(this.control.createGridColumns());

    var grid = Ext.create('Ext.grid.Panel', {
        xtype: 'grid',
        border: false,
        store: this.store,
        loadMask: true,
        plugins: [
            'bufferedrenderer'
        ],
        dockedItems: [
            this.numberPanel
        ],
        columns: columns
    });

    this.grid = grid;
    return grid;
};



NumberAttributeGrid.prototype._updateNormArray = function () {
    this.normArray = [];
    var items = this.numberPanel.items.getAt(0).items.items;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var contValue = item.items.getAt(0).getRawValue();
        var normValue = item.items.getAt(1).getRawValue();
        this.normArray.push({cont: contValue, norm: normValue});
    }
};

NumberAttributeGrid.prototype._normalizeFunction = function (value) {
        var value = parseFloat(value);
        if (isNaN(value)) {
            return 'not a number'
        }
        var first = this.normArray[0];
        var second = this.normArray[this.normArray.length - 1];
        for (var i = 0; i < this.normArray.length; i++) {
            var contValue = this.normArray[i].cont;
            if (this.normArray[i + 1]) {
                var nextContValue = this.normArray[i + 1].cont;
                if (value >= contValue && value <= nextContValue) {
                    var first = this.normArray[i];
                    var second = this.normArray[i + 1];
                }
            }
        }
        var val = this.control.getNormalizedValue(first, second, value);
        return val;
};

NumberAttributeGrid.prototype.changeDefaultValue = function (value) {
    //TODO not necessary for now
};

NumberAttributeGrid.prototype._createNumberControlPanel = function (changeFunction) {
    var _this = this;
    var maxmin = this._getUniqueMaxAndMin();

    var updateLegend = function () {
        var items = panel.items.getAt(0).items.items;
        var component = _this.control.updateLegend(items);

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
    var controlMin = this.control.create(function (newValue) {
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
    var controlMax = this.control.create(function (newValue) {
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
                            var control = _this.control.create(function (newValue) {
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
};

// NUMBER
NumberAttributeGrid.prototype._getUniqueValues = function () {
    var values = this.attributeManager.getUniqueByAttribute(this.attributeName);
    var valuesData = [];
    for (var j = 0; j < values.length; j++) {
        var value = values[j];
        valuesData.push({value: value, visualParam: this._normalizeFunction(value)});
    }
    return valuesData;
};
NumberAttributeGrid.prototype._createUniqueStore = function () {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {type: 'memory'},
        fields: ['value', 'visualParam'],
        data: this._getUniqueValues()
    });
    return store;
};
NumberAttributeGrid.prototype._updateUniqueStore = function (modifiedAttributeName) {
    if (modifiedAttributeName === false || this.attributeName === modifiedAttributeName) {
        this.store.loadData(this._getUniqueValues());
        this.trigger('update:uniqueStore');
    }
};

NumberAttributeGrid.prototype._getUniqueMaxAndMin = function () {
    var values = this.attributeManager.getUniqueByAttribute(this.attributeName);
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
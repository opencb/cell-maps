ListStringAttributeGrid.prototype = new AttributeGrid();
function ListStringAttributeGrid(args) {
    AttributeGrid.prototype.constructor.call(this, args);

    this.id = Utils.genId('ListStringAttributeGrid');
};


ListStringAttributeGrid.prototype.create = function () {
    var _this = this;

    this.store = this._createUniqueStore();

    this.attributeManager.on('change:recordsAttribute', function (e) {
        _this._updateUniqueStore(e.attributeName);
    });

    this.controlComponent = this.control.create(function (newValue) {
        _this.store.suspendEvents();
        var records = grid.getSelectionModel().getSelection();
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            record.set('visualParam', newValue);
        }
        _this.store.resumeEvents();
        _this.store.fireEvent('refresh');
    })

    var cols = [
        { text: this.attributeName, dataIndex: 'value', menuDisabled: true, flex: 1}
    ];
    var columns = cols.concat(this.control.createGridColumns());
    var gridListeners = this.control.createGridListeners();

    var grid = Ext.create('Ext.grid.Panel', {
        xtype: 'grid',
        border: false,
        store: this.store,
        loadMask: true,
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
                            //restore value on records
                            var data = _this.store.snapshot || _this.store.data;
                            var records = data.items;
                            _this.store.suspendEvents();
                            for (var i = 0; i < records.length; i++) {
                                var record = records[i];
                                record.set('visualParam', record.get('value'));
                            }
                            _this.store.resumeEvents();
                            _this.store.fireEvent('refresh');
                        }
                    },
                    '->',
                    {
                        xtype: 'tbtext',
                        text: 'Apply to selected rows:'
                    },
                    this.controlComponent
                ]
            }
        ],
        listeners: gridListeners,
        columns: columns
    });

    return grid;
};

ListStringAttributeGrid.prototype.changeDefaultValue = function (value) {
    this.controlComponent.setRawValue(value);

    var data = this.store.snapshot || this.store.data;
    var records = data.items;
    this.store.suspendEvents();
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (!record.dirty) {
            record.set('visualParam', value);
            record.commit();
        }
    }
    this.store.resumeEvents();
    this.store.fireEvent('refresh');
};

// LIST
ListStringAttributeGrid.prototype._getUniqueValues = function () {
    var values = this.attributeManager.getUniqueByAttribute(this.attributeName);
    var valuesData = [];
    var valuesMap = {};
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var valueSplit = value.split(',');
        for (var j = 0; j < valueSplit.length; j++) {
            var v = valueSplit[j];
            if (typeof valuesMap[v] === 'undefined') {
                valuesMap[v] = true;
                valuesData.push({value: v, visualParam: this.control.defaultValue});
            }
        }
    }
    return valuesData;
};
ListStringAttributeGrid.prototype._createUniqueStore = function () {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 50,
        proxy: {type: 'memory'},
        fields: ['value', 'visualParam'],
        data: this._getUniqueValues()
    });
    return store;
};
ListStringAttributeGrid.prototype._updateUniqueStore = function (modifiedAttributeName) {
    if (this.attributeName === modifiedAttributeName) {
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        var dirtyRecords = {};
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (record.dirty) {
                dirtyRecords[record.get('value')] = record.get('visualParam');
            }
        }

        this.store.loadData(this._getUniqueValues());

        //restore value on records
        var data = this.store.snapshot || this.store.data;
        var records = data.items;
        this.store.suspendEvents();
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var dirtyValue = dirtyRecords[record.get('value')];
            if (dirtyValue) {
                record.set('visualParam', dirtyValue);
            }
        }
        this.store.resumeEvents();
        this.store.fireEvent('refresh');

        this.trigger('update:uniqueStore');
    }
};
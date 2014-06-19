function VisualAttributeWidget(args) {
    var _this = this;
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('VisualAttributeWidget');

    this.displayAttribute;
    this.displayLabel;
    this.attributeManager;
    this.attributesStore;
    this.control;
    this.list = false;
    this.showControl = true;


    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.visualSet;


    this.types = [
        {name: 'String'},
        {name: 'Number'}
    ];
    if (this.list) {
        this.types = [
            {name: 'List string'},
            {name: 'List number'}
        ];
    }

    this.typesStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.types
    })

//    this.gridMap = {};
    this.attributeGridMap = {};
    this.window;
    this.component;
    this.controlComponent;
    this.button;
    this.removeButton;

    this.lastAttributeName;
    this.lastType;
    this.lastStore;

    this.autoRender = true;


    this.attributeManager.on('change:attributes', function (e) {
//        if (_this.displayLabel === 'Color fill') {
        _this.attributesStore.loadData(_this.attributeManager.attributes);
        if (_this.attributeManager.attributes.length === 0) {
            _this._eachAttributeGridMap(function (attributeGrid, attr, type) {
                attributeGrid.destroy();
                delete _this.attributeGridMap[attr][type];
            });
        } else {
            _this._eachAttributeGridMap(function (attributeGrid, attr, type) {
                var attribute = _this.attributeManager.getAttribute(attr);
                if (typeof attribute === 'undefined') {
                    attributeGrid.destroy();
                    delete _this.attributeGridMap[attr][type];
                } else {
                    attributeGrid.updateUniqueStore();
                }
            });
        }
//
//        }
    });

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

VisualAttributeWidget.prototype._eachAttributeGridMap = function (fn) {
    for (var id in this.attributeGridMap) {
        for (type in this.attributeGridMap[id]) {
            this.attributeGridMap[id][type];
            fn(this.attributeGridMap[id][type], id, type);
        }
    }
};

/************************/
VisualAttributeWidget.prototype.applyDirectVisualSet = function (attributeName, type) {
    this.window.show();
    var found = this.attributeNameCombo.store.find("name", attributeName);
    if (found !== -1) {
        this._attributeNameComboHandler(attributeName);
        this._attributeTypeComboHandler(type);
        var grid = this.attributeGridMap[attributeName][type].grid;
        grid.down('button[text~=Apply]').el.dom.click();
        this.window.down('button[text~=Ok]').el.dom.click();
        return true;
    }
    this.window.hide();
    return false;
}

VisualAttributeWidget.prototype.restoreVisualSet = function (visualSet) {
    var attributeName = visualSet.attribute;
    var type = visualSet.type;
    var map = visualSet.map;

    this.window.show();
    var found = this.attributeNameCombo.store.find("name", attributeName);
    if (found !== -1) {
        this._attributeNameComboHandler(attributeName);
        this._attributeTypeComboHandler(type);
        var grid = this.attributeGridMap[attributeName][type].grid;

        var store = grid.store;
        //restoreMap
        var records = store.query().items;
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var value = record.get('value');
            if (typeof map[value] !== 'undefined') {
                record.set('visualParam', map[value])
            }
        }
        this.window.down('button[text~=Ok]').el.dom.click();
        return true;
    }
    this.window.hide();
    return false;
}

VisualAttributeWidget.prototype.removeVisualSet = function () {
    this._removeButtonHandler();
};

VisualAttributeWidget.prototype._removeButtonHandler = function (button) {
    this.button.setText('Select attribute');
    this.removeButton.disable();
    delete this.visualSet;
    this.defaultValueChanged(this.control.defaultValue);
    this.trigger('remove:visualSet', {visualSet: this.visualSet, sender: this});
    this.trigger('change:visualSet', {visualSet: this.visualSet, sender: this});
};

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
    this.visualSet = {displayAttribute: Utils.camelCase(this.displayAttribute), attribute: attributeName, map: map, type: this.lastType};
    this.trigger('change:visualSet', {visualSet: this.visualSet, sender: this});
};


VisualAttributeWidget.prototype.defaultValueChanged = function (value) {
    if (typeof value !== 'undefined') {
        this.control.defaultValue = value;

        if (this.controlComponent) {//pie and donut does not has controlComponent
            this.controlComponent.setRawValue(value);
        }

        for (var id in this.attributeGridMap) {
            for (type  in this.attributeGridMap[id]) {
                this.attributeGridMap[id][type].changeDefaultValue(value);
            }
        }

        if (typeof this.visualSet !== 'undefined') {
            this._updateVisualSet();
        }

        this.trigger('change:default', {value: this.control.defaultValue, sender: this});
    }
};

VisualAttributeWidget.prototype.getVisualSet = function () {
    return this.visualSet;
};
VisualAttributeWidget.prototype.getDefaultValue = function () {
    return this.control.defaultValue;
};
/************************/


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

    var width = 150;
    if (this.showControl == true) {
        this.controlComponent = this.control.create(function (newValue) {
            _this.defaultValueChanged(newValue);
        });
        width = 75;
    }

    this.button = Ext.create('Ext.Button', {
        xtype: 'button',
        text: 'Select attribute',
        width: 95,
        height: 25,
        handler: function () {
            _this.window.show();
        }
    });

    this.removeButton = Ext.create('Ext.Button', {
        disabled: true,
        text: '<span class="bootstrap"><span class="glyphicon glyphicon-trash"></span></span>',
        width: 35,
        height: 25,
        handler: function (bt) {
            _this._removeButtonHandler(bt);
        }
    });

    this.component = Ext.create('Ext.form.FieldContainer', {
        layout: 'hbox',
        labelWidth: width,
        fieldLabel: this.displayLabel,
        defaults: {
            margin: '1'
        },
        items: [
            this.controlComponent,
            this.button,
            this.removeButton
        ]
    });
}


VisualAttributeWidget.prototype._attributeNameComboHandler = function (attributeName) {
    this.lastAttributeName = attributeName;
    if (typeof this.lastType === 'undefined') {
        this.lastType = this.typesStore.getAt(0).get('name');
    }
    var grid = this._createGrid(this.lastAttributeName, this.lastType);
    this.lastStore = this.attributeGridMap[this.lastAttributeName][this.lastType].grid.getStore();

    console.log(this.lastAttributeName + ' - ' + this.lastType);
    this.container.removeAll(false);
    this.container.add(grid);
    this.lastStore.fireEvent('refresh');
};

VisualAttributeWidget.prototype._attributeTypeComboHandler = function (type) {
    this.lastType = type;

    var grid = this._createGrid(this.lastAttributeName, this.lastType);
    this.lastStore = this.attributeGridMap[this.lastAttributeName][this.lastType].grid.getStore();

    console.log(this.lastAttributeName + ' - ' + this.lastType);
    this.container.removeAll(false);
    this.container.add(grid);
    this.lastStore.fireEvent('refresh');
};


VisualAttributeWidget.prototype._createWindow = function () {
    var _this = this;

    this.container = Ext.create('Ext.container.Container', {
        layout: 'fit'
    });

    this.attributeNameCombo = Ext.create('Ext.form.field.ComboBox', {
        margin: '0 0 0 10',
        width: 270,
        labelWidth: 100,
        fieldLabel: 'Attribute name',
        store: this.attributesStore,
        queryMode: 'local',
        qid: 'attrCombo',
        displayField: 'name',
        valueField: 'name',
        forceSelection: true,
        editable: false,
        listConfig: {
            listeners: {
                itemclick: function (list, record) {
                    _this._attributeNameComboHandler(record.get('name'));
                }
            }
        },
        listeners: {
            afterrender: function () {
                var record = this.getStore().getAt(0);
                this.select(record);
                _this._attributeNameComboHandler(record.get('name'));
            }
        }
    });

    this.attributeTypeCombo = Ext.create('Ext.form.field.ComboBox', {
        margin: '0 0 0 10',
        width: 270,
        labelWidth: 90,
        fieldLabel: 'Attribute type',
        qid: 'typeCombo',
        store: this.typesStore,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id',
        forceSelection: true,
        editable: false,
        listConfig: {
            listeners: {
                itemclick: function (list, record) {
                    _this._attributeTypeComboHandler(record.get('name'));
                }
            }
        },
        listeners: {
            afterrender: function () {
                var record = this.getStore().getAt(0);
                this.select(record);
                _this._attributeTypeComboHandler(record.get('name'));
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
        closable: false,
        resizable: false,
        constrain: true,
        items: {
            layout: 'fit',
            height: 400,
            width: 600,
            defaults: {
                margin: '0 0 0 0'
            },
            items: [
                this.container
            ],
            dockedItems: [
                toolbar,
            ],
            bbar: {
                layout: {
                    pack: 'end'
                },
                defaults: {
                    width: 100
                },
                items: [
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
                            if (typeof _this.visualSet !== 'undefined') {
                                _this.trigger('click:ok', {visualSet: _this.visualSet, sender: _this});
                            }
                        }
                    }
                ]

            }
        }
    });
}


VisualAttributeWidget.prototype._createGrid = function (attributeName, type) {
    var _this = this;

    if (typeof this.attributeGridMap[attributeName] === 'undefined') {
        this.attributeGridMap[attributeName] = {};
    }

    if (typeof this.attributeGridMap[attributeName][type] === 'undefined') {

        var attributeGrid;
        switch (type) {
            case 'String':
                attributeGrid = new StringAttributeGrid({
                    attributeName: attributeName,
                    control: this.control,
                    attributeManager: this.attributeManager,
                    handlers: {
                        'update:uniqueStore': function () {
                            _this._updateVisualSet();
                        }
                    }
                });
                break;
            case 'Number':
                attributeGrid = new NumberAttributeGrid({
                    attributeName: attributeName,
                    control: this.control,
                    attributeManager: this.attributeManager,
                    handlers: {
                        'update:uniqueStore': function () {
                            _this._updateVisualSet();
                        }
                    }
                });
                break;
            case 'List string':
                attributeGrid = new ListStringAttributeGrid({
                    attributeName: attributeName,
                    control: this.control,
                    attributeManager: this.attributeManager,
                    handlers: {
                        'update:uniqueStore': function () {
                            _this._updateVisualSet();
                        }
                    }
                });
                break;
            case 'List number':
                attributeGrid = new ListNumberAttributeGrid({
                    attributeName: attributeName,
                    control: this.control,
                    attributeManager: this.attributeManager,
                    handlers: {
                        'update:uniqueStore': function () {
                            _this._updateVisualSet();
                        }
                    }
                });
                break;
            default:
        }
        attributeGrid.create();
        this.attributeGridMap[attributeName][type] = attributeGrid;

    }
    return this.attributeGridMap[attributeName][type].grid;
}

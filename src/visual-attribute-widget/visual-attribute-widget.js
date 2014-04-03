function VisualAttributeWidget(args) {
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

    this.types = ['String', 'Number'];
    if (this.list) {
        this.types = ['List string', 'List number'];
    }

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


/************************/
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
    this.visualSet = {displayAttribute: Utils.camelCase(this.displayAttribute), attribute: attributeName, map: map, sender: this};
};


VisualAttributeWidget.prototype.defaultValueChanged = function (value) {
    if (typeof value !== 'undefined') {
        this.control.defaultValue = value;
    }
    this.trigger('change:default', {value: this.control.defaultValue});
    if (typeof this.visualSet !== 'undefined') {
        this._updateVisualSet();
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

    var control;
    var width = 150;
    if (this.showControl == true) {
        control = this.control.create(function (newValue) {
            _this.defaultValueChanged(newValue);
        });
        width = 75;
    }

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
        width: 35,
        handler: function (bt) {
            _this.button.setText('Select attribute');
            _this.removeButton.disable();
            delete _this.visualSet;
            _this.defaultValueChanged(_this.control.defaultValue);
            _this.trigger('remove:visualSet', {sender: _this});
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
                text: this.displayLabel,
                width: width,
                margin: '5 0 0 0'
            },
            control,
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
                    _this.lastType = _this.types[0];
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
        store: this.types,
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
                    if (typeof _this.visualSet !== 'undefined') {
                        _this.trigger('click:ok', {visualSet: _this.visualSet, sender: _this});
                    }
                }
            }
        ]
    });
}


VisualAttributeWidget.prototype._createGrid = function (attributeName, type) {
    var _this = this;

    if (typeof this.gridMap[attributeName] === 'undefined') {
        this.gridMap[attributeName] = {};
    }

    if (typeof this.gridMap[attributeName][type] === 'undefined') {

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
                this.on('change:default', function (e) {
                    attributeGrid.changeDefaultValue(e.value);
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
                this.on('change:default', function (e) {
                    attributeGrid.changeDefaultValue(e.value);
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
                this.on('change:default', function (e) {
                    attributeGrid.changeDefaultValue(e.value);
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
                this.on('change:default', function (e) {
                    attributeGrid.changeDefaultValue(e.value);
                });
                break;
            default:
        }
        this.gridMap[attributeName][type] = attributeGrid.create();
    }

    return this.gridMap[attributeName][type];
}

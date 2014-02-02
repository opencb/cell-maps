ColorAttributeWidget.prototype.render = VisualAttributeWidget.prototype.render;
ColorAttributeWidget.prototype.getComponent = VisualAttributeWidget.prototype.getComponent;
ColorAttributeWidget.prototype.defaultValueChanged = VisualAttributeWidget.prototype.defaultValueChanged;
ColorAttributeWidget.prototype.visualSetChanged = VisualAttributeWidget.prototype.visualSetChanged;

ColorAttributeWidget.prototype._createWindow = VisualAttributeWidget.prototype._createWindow;
ColorAttributeWidget.prototype._createComponent = VisualAttributeWidget.prototype._createComponent;

ColorAttributeWidget.prototype._createGrid = VisualAttributeWidget.prototype._createGrid;
ColorAttributeWidget.prototype._getUniqueValues = VisualAttributeWidget.prototype._getUniqueValues;
ColorAttributeWidget.prototype._createUniqueStore = VisualAttributeWidget.prototype._createUniqueStore;
ColorAttributeWidget.prototype._updateUniqueStore = VisualAttributeWidget.prototype._updateUniqueStore;
ColorAttributeWidget.prototype._updateVisualSet = VisualAttributeWidget.prototype._updateVisualSet;


function ColorAttributeWidget(args) {
    VisualAttributeWidget.prototype.constructor.call(this, args);

    this.id = Utils.genId('ColorAttributeWidget');

    this.colorMenu = this._createColorMenu();
};


ColorAttributeWidget.prototype.createControl = function (changeFunction) {
    return this._getColorSelect(this.defaultValue, function (color) {
        changeFunction(color);
    })
}

ColorAttributeWidget.prototype.createGridColumns = function () {
    return [
        { xtype: 'templatecolumn', text: 'Display ' + this.displayAttribute, menuDisabled: true, width: 100, tpl: '<div style="text-align:center;width:30px;height:12px;background-color: {visualParam};"></div>'},
        {  dataIndex: 'visualParam', width: 70, menuDisabled: true, editor: {xtype: 'textfield', allowBlank: false}}
    ];
}

ColorAttributeWidget.prototype.createGridListeners = function () {
    var _this = this;
    return {
        cellclick: function (cell, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            if (cellIndex == 1) {
                var x = e.browserEvent.clientX;
                var y = e.browserEvent.clientY;
                _this._showColorMenu(x, y, function (color) {
                    record.set('visualParam', color);
                });
            }
        }
    }
}

/* Private Methods */
ColorAttributeWidget.prototype._getColorDiv = function (color) {
    return '<div style="width:30px;height:12px;background-color: ' + color + ';"></div>';
}

ColorAttributeWidget.prototype._getColorSelect = function (defaultColor, handler) {
    var _this = this;

    return Ext.create('Ext.Component', {
        margin: '4 10 0 0',
        name: 'control',
        html: '<div style="border:1px solid gray;width:65px;height:15px;background-color: ' + defaultColor + ';" color="' + defaultColor + '"></div>',
        setRawValue: function (color) {
            var el = this.getEl();
            $(el.dom).find('div').attr('color', color);
            $(el.dom).find('div').css({'background-color': color});
        },
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
    });
}

ColorAttributeWidget.prototype._createColorMenu = function () {
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
}

ColorAttributeWidget.prototype._showColorMenu = function (x, y, func) {
    var _this = this;
    $(this.colorSelect).simplecolorpicker('destroy');
    $(this.colorSelect).off('change');
    $(this.colorSelect).simplecolorpicker().on('change', function () {
        func($(_this.colorSelect).val());
        _this.colorMenu.hide();
    });
    this.colorMenu.showAt(x, y);
}

ColorAttributeWidget.prototype._setColorSelect = function (select) {
    var colors = ["cccccc", "888888",
        "ac725e", "d06b64", "f83a22", "fa573c", "ff7537", "ffad46", "42d692", "16a765", "7bd148", "b3dc6c", "fbe983", "fad165",
        "92e1c0", "9fe1e7", "9fc6e7", "4986e7", "9a9cff", "b99aff", "c2c2c2", "cabdbf", "cca6ac", "f691b2", "cd74e6", "a47ae2",
        "ffffff", "000000"
    ];

    for (var i in colors) {
        var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
        $(select).append(menuEntry);
    }
}
ColorAttributeControl.prototype = new AttributeControl();
function ColorAttributeControl(args) {
    AttributeControl.prototype.constructor.call(this, args);

    this.id = Utils.genId('ColorAttributeControl');

    this.colorMenu = this._createColorMenu();
};

ColorAttributeControl.prototype.setDefaultValue = function (value) {

};

//Parent methods
ColorAttributeControl.prototype.create = function (changeFunction) {
    return this._getColorSelect(this.defaultValue, function (color) {
        changeFunction(color);
    })
};



ColorAttributeControl.prototype.createGridColumns = function () {
    return [
        {
            xtype: 'templatecolumn',
            text: 'Display ' + this.displayAttribute,
            menuDisabled: true,
            width: 120,
            tpl: '<div style="border:1px solid gray;text-align:center;width:60px;height:16px;background-color: {visualParam};"></div>'
        },
        {
            dataIndex: 'visualParam',
            text: 'Hex',
            width: 120, menuDisabled: true,
            editor: {
                xtype: 'textfield',
                allowBlank: false
            }
        }
    ];
}

ColorAttributeControl.prototype.createGridListeners = function () {
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

ColorAttributeControl.prototype.getNormalizedValue = function (first, second, value) {
    var _this = this;
    var color1 = parseInt(first.norm.replace('#', ''), 16);
    var color2 = parseInt(second.norm.replace('#', ''), 16);

    var firstCont = parseFloat(first.cont);
    var secondCont = parseFloat(second.cont);

    var steps = 255;
    var c = (secondCont - firstCont) / steps;
    var R1 = (color1 & 0xff0000) >> 16;
    var G1 = (color1 & 0x00ff00) >> 8;
    var B1 = (color1 & 0x0000ff) >> 0;

    var R2 = (color2 & 0xff0000) >> 16;
    var G2 = (color2 & 0x00ff00) >> 8;
    var B2 = (color2 & 0x0000ff) >> 0;

    var v = (value - firstCont) / c;
    v = (isNaN(v) || !isFinite(v)) ? 0 : v;

    var R = Math.round(this._interpolate(R1, R2, v, steps)).toString(16);
    var G = Math.round(this._interpolate(G1, G2, v, steps)).toString(16);
    var B = Math.round(this._interpolate(B1, B2, v, steps)).toString(16);

    R = (R.length < 2) ? '0' + R : R;
    G = (G.length < 2) ? '0' + G : G;
    B = (B.length < 2) ? '0' + B : B;

    var color = '#' + R + G + B;
    return color;
}

ColorAttributeControl.prototype.updateLegend = function (items) {
    var l = items.length - 1;
    var minNorm = items[0].items.getAt(1).getRawValue();
    var maxNorm = items[l].items.getAt(1).getRawValue();

    var minVal = items[0].items.getAt(0).getRawValue();
    var maxVal = items[l].items.getAt(0).getRawValue();

    var diff = maxVal - minVal;

    var stops = {};
    var stopsCSS = [];
    stops['0'] = {color: minNorm};
    stops['100'] = {color: maxNorm};

    stopsCSS.push(minNorm+' 0%');
    for (var i = 1; i < l; i++) {
        var item = items[i];
        var pointValue = item.items.getAt(0).getRawValue();
        var normValue = item.items.getAt(1).getRawValue();
        var pointDiff = pointValue - minVal;
        var stopPercentage = Math.round(pointDiff * 100 / diff);
        stops[stopPercentage] = {color: normValue};
        stopsCSS.push(normValue+' '+stopPercentage+'%');
    }
    stopsCSS.push(maxNorm+' 100%');

    var cmp = Ext.create('Ext.Component', {
        style:{
            background: 'linear-gradient(to bottom, '+stopsCSS.join(',')+');'
        }

    });
    return cmp;
}


//Custom methods
ColorAttributeControl.prototype._getColorSelect = function (defaultColor, handler) {
    var _this = this;

    return Ext.create('Ext.Component', {
        margin: '4 10 0 0',
        name: 'control',
        html: '<div style="border:1px solid gray;width:65px;height:18px;background-color: ' + defaultColor + ';" color="' + defaultColor + '"></div>',
        setRawValue: function (color) {
            // check if rendered to modify the color div
            this.color = color;
            if(this.rendered){
                var el = this.getEl();
                $(el.dom).find('div').attr('color', this.color);
                $(el.dom).find('div').css({'background-color': this.color});
            }
        },
        getRawValue: function () {
            return this.color;
        },
        color: defaultColor,
        listeners: {
            afterrender: function (box) {
                var el = this.getEl();
                // color could be modifed by setRawValue
                $(el.dom).find('div').attr('color', this.color);
                $(el.dom).find('div').css({'background-color': this.color});

                //attach menu
                el.on('click', function (e, t, eOpts) {
                    var x = e.browserEvent.clientX;
                    var y = e.browserEvent.clientY;
                    _this._showColorMenu(x, y, function (color) {
                        $(el.dom).find('div').attr('color', color);
                        $(el.dom).find('div').css({'background-color': color});
                        box.color = color;

                        if ($.isFunction(handler)) {
                            handler(color, box);
                        }
                    });
                });
            }
        }
    });
}

ColorAttributeControl.prototype._createColorMenu = function () {
    var _this = this;
    var div = $('<div></div>')[0];
    this.colorSelect = $('<select></select>')[0];
    $(div).append(this.colorSelect);
    this._setColorSelect(this.colorSelect);
    $(this.colorSelect).simplecolorpicker()
    var colorMenu = Ext.create('Ext.menu.Menu', {
        plain: true,
        width: 218,
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
};

ColorAttributeControl.prototype._showColorMenu = function (x, y, func) {
    var _this = this;
    $(this.colorSelect).simplecolorpicker('destroy');
    $(this.colorSelect).off('change');
    $(this.colorSelect).simplecolorpicker().on('change', function () {
        func($(_this.colorSelect).val());
        _this.colorMenu.hide();
    });
    this.colorMenu.showAt(x, y);
};

ColorAttributeControl.prototype._setColorSelect = function (select) {
    var colors = ["d88c8c", "d8ac8c", "d8cc8c", "c5d88c", "a5d88c", "8cd892", "8cd8b2", "8cd8d2", "8cbfd8", "8c9fd8", "988cd8", "b88cd8", "e19797", "e1b697", "e1d597", "cfe197", "b0e197", "97e19d", "97e1bc", "97e1db", "97c9e1", "97aae1", "a397e1", "c297e1", "eba7a7", "ebc3a7", "ebdfa7", "daeba7", "beeba7", "a7ebad", "a7ebc9", "a7ebe5", "a7d4eb", "a7b8eb", "b2a7eb", "cfa7eb", "f2b9b9", "f2d1b9", "f2e9b9", "e4f2b9", "ccf2b9", "b9f2be", "b9f2d6", "b9f2ee", "b9dff2", "b9c7f2", "c3b9f2", "dab9f2", "f7c9c9", "f7dcc9", "f7efc9", "ecf7c9", "d8f7c9", "c9f7cd", "c9f7e0", "c9f7f3", "c9e8f7", "c9d4f7", "d0c9f7", "e4c9f7", "fbdede", "fbeade", "fbf7de", "f4fbde", "e8fbde", "defbe0", "defbed", "defbf9", "def2fb", "dee5fb", "e3defb", "efdefb", "ffffff", "eaeaea", "d5d5d5", "c0c0c0", "aaaaaa", "959595", "808080", "6b6b6b", "555555", "404040", "2b2b2b", "161616"];

    for (var i in colors) {
        var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
        $(select).append(menuEntry);
    }
};
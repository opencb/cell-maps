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
        html: '<div style="border:1px solid gray;width:65px;height:15px;background-color: ' + defaultColor + ';" color="' + defaultColor + '"></div>',
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
        width: 206,
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
    var colors = ["cccccc", "888888",
        "ac725e", "d06b64", "f83a22", "fa573c", "ff7537", "ffad46", "42d692", "16a765", "7bd148", "b3dc6c", "fbe983", "fad165",
        "92e1c0", "9fe1e7", "9fc6e7", "4986e7", "9a9cff", "b99aff", "c2c2c2", "cabdbf", "cca6ac", "f691b2", "cd74e6", "a47ae2",
        "ffffff", "000000"
    ];

    for (var i in colors) {
        var menuEntry = $('<option value="#' + colors[i] + '">#' + colors[i] + '</option>')[0];
        $(select).append(menuEntry);
    }
};
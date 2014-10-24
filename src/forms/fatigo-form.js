/*
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of Cell Browser.
 *
 * Cell Browser is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * Cell Browser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Cell Browser. If not, see <http://www.gnu.org/licenses/>.
 */

FatigoForm.prototype = new GenericFormPanel();

function FatigoForm(args) {
    var _this = this;
    args.analysis = 'fatigo.default';
    args.title = 'Fatigo';
    args.border = false;
    args.buttonConfig = {
        width: 100,
        height: undefined
    };
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("FatigoForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

    this.attributeManager = this.webapp.networkViewer.network.vertexAttributeManager;
    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });
    this.webapp.networkViewer.on('select:vertices', function () {
        var value = _this.radioInputType1.getValue();
        if (value.inputSource1 === 'textselection') {
            _this.inputArea1.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected1));
        }
        var value = _this.radioInputType2.getValue();
        if (value.inputSource2 === 'textselection') {
            _this.inputArea2.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected2));

        }
    });

    this.EMPH_COLOR = '#0068cc';

}

FatigoForm.prototype.beforeRun = function () {

    //--go-bp gobp
    //--go-bp-max-level 9
    //--go-bp-min-level 3
    //--go-bp-max-num-genes 1000
    //--go-bp-min-num-genes 5
    //--go-bp-nannot-domain genome
    //--go-bp-propagation propagate
    //--go-bp-keyword-operator all

//    --annotations none
//    --duplicates never
//    --fisher two-tailed


    if (this.paramsWS['inputSource1'] === 'text') {
        this.paramsWS['list1'] = 'list1-text'
    } else {
        delete this.paramsWS['list1-text'];
    }

    if (this.paramsWS['inputSource2'] === 'text') {
        this.paramsWS['list2'] = 'list2-text'
    } else {
        delete this.paramsWS['list2-text'];
    }

    delete this.paramsWS['comparison'];
    delete this.paramsWS['inputSource1'];
    delete this.paramsWS['inputSource2'];


    if ('go-bp' in this.paramsWS) {
        this.paramsWS['go-bp-max-level'] = 12;
        this.paramsWS['go-bp-min-level'] = 3;
        this.paramsWS['go-bp-max-num-genes'] = 1000;
        this.paramsWS['go-bp-min-num-genes'] = 5;
        this.paramsWS['go-bp-nannot-domain'] = 'genome';
        this.paramsWS['go-bp-propagation'] = 'propagate';
        this.paramsWS['go-bp-keyword-operator'] = 'all';
    }

    if ('go-mf' in this.paramsWS) {
        this.paramsWS['go-mf-max-level'] = 12;
        this.paramsWS['go-mf-min-level'] = 3;
        this.paramsWS['go-mf-max-num-genes'] = 1000;
        this.paramsWS['go-mf-min-num-genes'] = 5;
        this.paramsWS['go-mf-nannot-domain'] = 'genome';
        this.paramsWS['go-mf-propagation'] = 'propagate';
        this.paramsWS['go-mf-keyword-operator'] = 'all';
    }

    if ('go-cc' in this.paramsWS) {
        this.paramsWS['go-cc-max-level'] = 12;
        this.paramsWS['go-cc-min-level'] = 3;
        this.paramsWS['go-cc-max-num-genes'] = 1000;
        this.paramsWS['go-cc-min-num-genes'] = 5;
        this.paramsWS['go-cc-nannot-domain'] = 'genome';
        this.paramsWS['go-cc-propagation'] = 'propagate';
        this.paramsWS['go-cc-keyword-operator'] = 'all';
    }

    if (!('list2' in this.paramsWS)) {
        this.paramsWS['genome'] = '';
    }

    this.paramsWS['annotations'] = 'none';
};


FatigoForm.prototype.getPanels = function () {
    this.dataForm = this._getDataForm();
    return [
        this._getExampleForm(),
        this._getDefineComparisonForm(),
        this.dataForm,
        this._getSpeciesForm(),
        this._getGoForm(),
        this._getOptionsForm()
    ];
};


FatigoForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample();
                    Utils.msg("Example 1", "Loaded");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: 'Motor vs apoptosis'

            }
        ]
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example1],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};


FatigoForm.prototype._getDefineComparisonForm = function () {
    var _this = this;

//    Id list vs Id list
//    Id List vs Rest of genome


    this.radioComparison = Ext.create('Ext.form.RadioGroup', {
//        fieldLabel: 'Select your list 1 from',
//        labelWidth: this.labelWidth,
//        labelAlign: 'top',
        defaults: {
            margin: '0 0 0 10',
            name: 'comparison'
        },
        flex: 1,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                boxLabel: ' Id list vs Id list',
                inputValue: 'lvsl'
            },
            {
                boxLabel: 'Id List vs Rest of genome',
                inputValue: 'lvsgenome'
            },
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = radiogroup.getValue();
                if (value.comparison === 'lvsl') {
                    _this.dataForm.insert(1, _this.fieldContainerList2);
                } else {
                    _this.dataForm.remove(_this.fieldContainerList2, false);
                }

            }
        }
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Define your comparison",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 5,
        defaults: {
            margin: '10 0'
        },
        items: [
            this.radioComparison
        ]
    });
    return formBrowser;
};


FatigoForm.prototype._getDataForm = function () {
    var _this = this;


    /*LIST 1*/
    this.listAttributeCombo1 = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Node attribute',
        labelAlign: 'top',
        store: this.attributeStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.attributeNameSelected1 = value;

                    var value = _this.radioInputType1.getValue();
                    switch (value.inputSource1) {
                        case 'textnodes':
                            _this.inputArea1.setValue(_this.getNetworkVerticesText(_this.attributeNameSelected1));
                            break;
                        case 'textselection':
                            _this.inputArea1.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected1));
                            break;
                    }

                }
            }
        }
    });

    this.inputArea1 = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text list 1',
//        labelWidth: this.labelWidth,
        labelAlign: 'top',
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'list1-text',
        allowBlank: false,
        listeners: {
            change: function (me) {
                me.getValue()
            }
        }
    });

    this.opencgaBrowserCmp1 = this.createOpencgaBrowserCmp({
        fieldLabel: 'List 1',
        labelAlign: 'top',
        dataParamName: 'list1',
        width: '100%',
        id: this.id + 'list1',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    this.radioInputType1 = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: '<span style="color:' + this.EMPH_COLOR + '">Select your list 1 from</span>',
        labelWidth: this.labelWidth,
        labelAlign: 'top',
        defaults: {
            margin: '0 0 0 10',
            name: 'inputSource1'
        },
        width: 160,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                boxLabel: 'Network selection',
                checked: true,
                inputValue: 'textselection'
            },
            {
                boxLabel: 'Network nodes',
                inputValue: 'textnodes'
            },
            {
                boxLabel: 'Text area',
                inputValue: 'text'
            },
            {
                boxLabel: 'File from server',
                inputValue: 'file'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = radiogroup.getValue();
                var container = _this.fieldContainerList1.down().next();
                switch (value.inputSource1) {
                    case 'file':
                        container.remove(_this.listAttributeCombo1, false);
                        container.remove(_this.inputArea1, false);
                        container.insert(0, _this.opencgaBrowserCmp1);
                        break;
                    case 'text':
                        _this.inputArea1.reset();
                        container.remove(_this.listAttributeCombo1, false);
                        container.remove(_this.opencgaBrowserCmp1, false);
                        container.insert(0, _this.inputArea1);
                        break;
                    case 'textnodes':
                        _this.inputArea1.reset();
                        container.remove(_this.opencgaBrowserCmp1, false);
                        container.insert(0, _this.listAttributeCombo1);
                        container.insert(1, _this.inputArea1);
                        _this.inputArea1.setValue(_this.getNetworkVerticesText(_this.attributeNameSelected1));
                        break;
                    case 'textselection':
                        _this.inputArea1.reset();
                        container.remove(_this.opencgaBrowserCmp1, false);
                        container.insert(0, _this.listAttributeCombo1);
                        container.insert(1, _this.inputArea1);
                        _this.inputArea1.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected1));
                        break;

                }
            }
        }
    });
    this.fieldContainerList1 = Ext.create('Ext.container.Container', {
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        height: 150,
        flex: 1,
        items: [
            this.radioInputType1,
            {
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.listAttributeCombo1,
                    this.inputArea1
                ]
            }

        ]
    });

    /*LIST 2*/
    this.listAttributeCombo2 = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Node attribute',
        labelAlign: 'top',
        store: this.attributeStore,
        allowBlank: true,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.attributeNameSelected2 = value;

                    var value = _this.radioInputType2.getValue();
                    switch (value.inputSource2) {
                        case 'textnodes':
                            _this.inputArea2.setValue(_this.getNetworkVerticesText(_this.attributeNameSelected2));
                            break;
                        case 'textselection':
                            _this.inputArea2.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected2));
                            break;

                    }

                }
            }
        }
    });

    this.inputArea2 = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text list 2',
//        labelWidth: this.labelWidth,
        labelAlign: 'top',
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'list2-text',
        allowBlank: false,
        listeners: {
            change: function (me) {
                me.getValue()
            }
        }
    });

    this.opencgaBrowserCmp2 = this.createOpencgaBrowserCmp({
        fieldLabel: 'List 2',
        labelAlign: 'top',
        dataParamName: 'list2',
        width: '100%',
        id: this.id + 'list2',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    this.radioInputType2 = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: '<span style="color:' + this.EMPH_COLOR + '">Select your list 2 from</span>',
        labelWidth: this.labelWidth,
        labelAlign: 'top',
        defaults: {
            margin: '0 0 0 10',
            name: 'inputSource2'
        },
        width: 160,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                boxLabel: 'Network selection',
                checked: true,
                inputValue: 'textselection'
            },
            {
                boxLabel: 'Network nodes',
                inputValue: 'textnodes'
            },
            {
                boxLabel: 'Text area',
                inputValue: 'text'
            },
            {
                boxLabel: 'File from server',
                inputValue: 'file'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = radiogroup.getValue();
                var container = _this.fieldContainerList2.down().next();
                switch (value.inputSource2) {
                    case 'file':
                        container.remove(_this.listAttributeCombo2, false);
                        container.remove(_this.inputArea2, false);
                        container.insert(0, _this.opencgaBrowserCmp2);
                        break;
                    case 'text':
                        _this.inputArea2.reset();
                        container.remove(_this.listAttributeCombo2, false);
                        container.remove(_this.opencgaBrowserCmp2, false);
                        container.insert(0, _this.inputArea2);
                        break;
                    case 'textnodes':
                        _this.inputArea2.reset();
                        container.remove(_this.opencgaBrowserCmp2, false);
                        container.insert(0, _this.listAttributeCombo2);
                        container.insert(1, _this.inputArea2);
                        _this.inputArea2.setValue(_this.getNetworkVerticesText(_this.attributeNameSelected2));
                        break;
                    case 'textselection':
                        _this.inputArea2.reset();
                        container.remove(_this.opencgaBrowserCmp2, false);
                        container.insert(0, _this.listAttributeCombo2);
                        container.insert(1, _this.inputArea2);
                        _this.inputArea2.setValue(_this.getSelectedNetworkVerticesText(_this.attributeNameSelected2));
                        break;

                }
            }
        }
    });
    this.fieldContainerList2 = Ext.create('Ext.container.Container', {
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        height: 150,
        flex: 1,
        items: [
            this.radioInputType2,
            {
                flex: 1,
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.listAttributeCombo2,
                    this.inputArea2
                ]
            }

        ]
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input parameters",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        defaults: {
            margin: '10 10'
        },
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [
            this.fieldContainerList1,
            this.fieldContainerList2
        ]
    });
    return formBrowser;
};

FatigoForm.prototype._getSpeciesForm = function () {


    this.speciesStore = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'value' ],
        data: [
            {name: "Homo sapiens", value: "hsa"},
//            {name: "Mus musculus", value: "mmusculus"},
//            {name: "Rattus norvegicus", value: "rnorvegicus"},
//            {name: "Bos taurus", value: "btaurus"},
//            {name: "Gallus gallus", value: "ggallus"},
//            {name: "Sus scrofa", value: "sscrofa"},
//            {name: "Canis familiaris", value: "cfamiliaris"},
//            {name: "Drosophila melanogaster", value: "dmelanogaster"},
//            {name: "Caenorhabditis elegans", value: "celegans"},
//            {name: "Saccharomyces cerevisiae", value: "scerevisiae"},
//            {name: "Danio rerio", value: "drerio"},
//            {name: "Schizosaccharomyces pombe", value: "spombe"},
//            {name: "Escherichia coli", value: "ecoli"},
//            {name: "Human immunodeficiency virus 1", value: "hiv-1"},
//            {name: "Influenza A virus", value: "flu-a"},
//            {name: "Clostridium botulinum", value: "cbotulinum"},
//            {name: "Arabidopsis thaliana", value: "athaliana"},
//            {name: "Plasmodium falciparum", value: "pfalciparum"},
//            {name: "Dictyostelium discoideum", value: "ddiscoideum"},
//            {name: "Mycobacterium tuberculosis", value: "mtuberculosis"},
//            {name: "Neisseria meningitidis serogroup B", value: "nmeningitidis"},
//            {name: "Chlamydia trachomatis", value: "ctrachomatis"},
//            {name: "Oryza sativa", value: "osativa"},
//            {name: "Toxoplasma gondii", value: "tgondii"},
//            {name: "Xenopus tropicalis", value: "xtropicalis"},
//            {name: "Salmonella typhimurium", value: "styphimurium"},
//            {name: "Taeniopygia guttata", value: "tguttata"},
//            {name: "Staphylococcus aureus N315", value: "saureus"}
        ]
    });


    this.speciesCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: this.labelWidth,
        name: 'species',
        fieldLabel: 'Species',
        store: this.speciesStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: 'hsa',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Select your specie",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 5,
        defaults: {
            margin: '10 0'
        },
        items: [
            this.speciesCombo,
        ]
    });
    return formBrowser;
};

FatigoForm.prototype._getOptionsForm = function () {

    this.fisherTestCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Fisher exact test',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'fisher',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Two tailed', value: 'two-tailed'},
                {name: 'Over-represented terms in list 1 (genome comparision)', value: 'greater'},
                {name: 'Over-represented terms in list 2', value: 'less'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });

    this.removeDuplicatesCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Remove duplicates?',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'duplicates',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Never', value: 'never'},
                {name: 'Remove on each list separately', value: 'each'},
                {name: 'Remove on each list and common ids', value: 'all'},
                {name: 'Remove from list 2 those appearing in list 1 (complementary list)', value: 'ref'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Options",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 5,
        defaults: {
            margin: '10 0'
        },
        items: [
            {
                xtype: 'box',
                html: '<span style="color:' + this.EMPH_COLOR + '">Select the side of the comparison of the Fisher test.</span>'
            },
            this.fisherTestCombo,
            {
                xtype: 'box',
                html: '<span style="color:' + this.EMPH_COLOR + '">Do you want to remove duplicates from your list?</span>',
                margin: '20 0 10 0'
            },
            this.removeDuplicatesCombo,
        ]
    });
    return formBrowser;
};
FatigoForm.prototype._getGoForm = function () {


    this.bpBox = Ext.create('Ext.form.field.Checkbox', {
        xtype: 'checkbox',
        margin: '0 0 0 20',
        boxLabel: 'GO biological process',
        name: 'go-bp',
        inputValue: 'gobp',
        checked: false
    });

    this.mfBox = Ext.create('Ext.form.field.Checkbox', {
        xtype: 'checkbox',
        margin: '0 0 0 20',
        boxLabel: 'GO molecular function',
        name: 'go-mf',
        inputValue: 'gomf',
        checked: false
    });

    this.ccBox = Ext.create('Ext.form.field.Checkbox', {
        xtype: 'checkbox',
        margin: '0 0 0 20',
        boxLabel: 'GO cellular component',
        name: 'go-cc',
        inputValue: 'gocc',
        checked: false
    });

    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Select the GO domains",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 5,
        defaults: {
            margin: '10 0'
        },
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [
            this.bpBox, this.mfBox, this.ccBox
        ]
    });
    return formBrowser;
};

FatigoForm.prototype.getNetworkVerticesText = function (attributeNameSelected) {
    var values = this.webapp.networkViewer.network.vertexAttributeManager.getValuesByAttribute(attributeNameSelected);
    var queries = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        queries.push(v.value);
    }
    return queries.join('\n');
};

FatigoForm.prototype.getSelectedNetworkVerticesText = function (attributeNameSelected) {
    var values = this.webapp.networkViewer.network.vertexAttributeManager.getSelectedValuesByAttribute(attributeNameSelected);
    var queries = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        queries.push(v.value);
    }
    return queries.join('\n');
};


FatigoForm.prototype.loadExample = function () {
    this.clean();

    this.radioInputType1.setValue({inputSource1: 'file'});
    this.radioInputType2.setValue({inputSource2: 'file'});

    this.fisherTestCombo.select('two-tailed');
    this.removeDuplicatesCombo.select('never');

    this.bpBox.setValue(true);

    Ext.getCmp(this.id + 'list1').setValue('motor');
    Ext.getCmp(this.id + 'list1' + 'hidden').setValue('example_example.motor');

    Ext.getCmp(this.id + 'list2').setValue('apoptosis');
    Ext.getCmp(this.id + 'list2' + 'hidden').setValue('example_example.apoptosis');


    Ext.getCmp(this.id + 'jobname').setValue("Motor vs apoptosis");
    Ext.getCmp(this.id + 'jobdescription').setValue("A fatigo comparison between motor and apoptosis related genes");
};
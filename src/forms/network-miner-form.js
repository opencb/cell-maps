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

NetworkMinerForm.prototype = new GenericFormPanel();

function NetworkMinerForm(args) {
    args.analysis = 'network-miner.default';
    args.title = 'Network set enrichment analysis - Network Miner';
    args.border = false;
    args.buttonConfig = {
        width: 100,
        height: undefined
    };
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("NetworkMinerForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

}

NetworkMinerForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }
    this.paramsWS['o-name'] = 'result';
    this.paramsWS['components'] = 'true';
    this.paramsWS['randoms'] = '1000';

    if (this.paramsWS['inputSource'] === 'text') {
        this.paramsWS['list'] = 'list-text'
    } else {
        delete this.paramsWS['list-text'];
    }

    if (this.paramsWS['seedInputSource'] === 'text') {
        if(this.paramsWS['seedlist-text'] !== ''){
            this.paramsWS['seedlist'] = 'seedlist-text';
        }else{
            delete this.paramsWS['seedlist-text'];
            delete this.paramsWS['seedlist'];
        }
    } else {
        delete this.paramsWS['seedlist-text'];
    }

    delete this.paramsWS['inputSource'];
    delete this.paramsWS['seedInputSource'];
};


NetworkMinerForm.prototype.getPanels = function () {
    return [this._getForm()];
};


//NetworkMinerForm.prototype._getExampleForm = function () {
//    var _this = this;
//
//    var example1 = Ext.create('Ext.Component', {
//        html: '<span class="s140"><span class="btn btn-default">Load</span> &nbsp; VCF file example</span>',
//        cls: 'dedo',
//        listeners: {
//            afterrender: function () {
//                this.getEl().on("click", function () {
//                    _this.loadExample1();
//                    Ext.example.msg("Example loaded", "");
//                });
//
//            }
//        }
//    });
//
//    var exampleForm = Ext.create('Ext.container.Container', {
//        bodyPadding: 10,
//        cls: 'bootstrap',
//        items: [this.note1, example1],
//        defaults: {margin: '5 0 0 0'},
//        margin: '0 0 10 0'
//    });
//
//    return exampleForm;
//};

NetworkMinerForm.prototype._getForm = function () {
    var _this = this;

//    var note1 = Ext.create('Ext.container.Container', {
//        html: 'Please select a file from your <span class="info">server account</span> using the <span class="emph">Browse</span> button'
//    });


    var inputArea = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text ranked list',
        labelWidth: this.labelWidth,
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'list-text',
        allowBlank: false,
        listeners: {
            change: function (este) {
                este.getValue()
            }
        }
    });

    var opencgaBrowserCmp = this.createOpencgaBrowserCmp({
        fieldLabel: 'Ranked  list',
        dataParamName: 'list',
        id: this.id + 'list',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    var radioInputType = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Select your ranked list from',
        labelWidth: this.labelWidth,
        width: 400,
        defaults: {
            margin: '0 0 0 10',
            name: 'inputSource'
        },
        items: [
            {
                boxLabel: 'Text area',
                checked: true,
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
                if (value['inputSource'] === 'text') {
                    formBrowser.remove(opencgaBrowserCmp, false);
                    formBrowser.insert(1, inputArea);
                } else {
                    formBrowser.remove(inputArea, false);
                    formBrowser.insert(1, opencgaBrowserCmp);
                }
            }
        }
    });


    var listNatureCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Lists nature',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'list-tags',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Genes', value: 'gene,idlist'},
                {name: 'Ranked', value: 'ranked,idlist'},
                {name: 'Proteins', value: 'protein,idlist'},
                {name: 'Transcripts', value: 'transcript,idlist'}
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


    var seedInputArea = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text seed list',
        labelWidth: this.labelWidth,
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'seedlist-text',
        allowBlank: true,
        listeners: {
            change: function (este) {
                este.getValue()
            }
        }
    });

    var seedOpencgaBrowserCmp = this.createOpencgaBrowserCmp({
        fieldLabel: 'Seed list',
        dataParamName: 'seedlist',
        id: this.id + 'seedlist',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    var seedRadioInputType = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Select your seed list from',
        labelWidth: this.labelWidth,
        width: 400,
        defaults: {
            margin: '0 0 0 10',
            name: 'seedInputSource'
        },
        items: [
            {
                boxLabel: 'Text area',
                checked: true,
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
                if (value['seedInputSource'] === 'text') {
                    formBrowser.remove(seedOpencgaBrowserCmp, false);
                    formBrowser.insert(3, seedInputArea);
                } else {
                    formBrowser.remove(seedInputArea, false);
                    formBrowser.insert(3, seedOpencgaBrowserCmp);
                }
            }
        }
    });


    var speciesStore = Ext.create('Ext.data.Store', {
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

    var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: this.labelWidth,
        name: 'interactome',
        fieldLabel: 'Species',
        store: speciesStore,
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


    var interactomeReferenceCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Select interactome confidence',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'group',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Non curated', value: 'all'},
                {name: 'Curated (detected by at least two methods)', value: 'curated'}
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


    var orderCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Sort ranked list',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'order',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Ascending', value: 'ascending'},
                {name: 'Descending', value: 'descending'}
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


    var externalIntermediateCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: this.labelWidth,
        name: 'intermediate',
        fieldLabel: 'Allow one external intermediate in the subnetwork',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Yes', value: '1'},
                {name: 'No', value: '0'}
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


    var significanceNumberField = Ext.create('Ext.form.field.Number', {
        labelWidth: this.labelWidth,
        name: 'significant-value',
        fieldLabel: 'Select threshold of significance (p-value)',
        value: 0.05,
        maxValue: 1,
        minValue: 0,
        step: 0.01,
        listeners: {
            change: {
                buffer: 100,
                fn: function (field, newValue) {
                    if (newValue != null) {

                    }
                }
            }
        }
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input parameters",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 10,
        defaults: {
            margin: '10 0'
        },
        items: [
//            note1,
            radioInputType,
            inputArea,
            seedRadioInputType,
            seedInputArea,
            listNatureCombo,
            speciesCombo,
            interactomeReferenceCombo,
            orderCombo,
            externalIntermediateCombo,
            significanceNumberField
        ]
    });
    return formBrowser;
};


//NetworkMinerForm.prototype.loadExample1 = function () {
//    Ext.getCmp(this.id + 'vcf-file').setText('<span class="emph">Example file.vcf</span>', false);
//    Ext.getCmp(this.id + 'vcf-file' + 'hidden').setValue('example_file.vcf');
//
//    Ext.getCmp(this.id + 'ped-file').setText('<span class="emph">Example file.ped</span>', false);
//    Ext.getCmp(this.id + 'ped-file' + 'hidden').setValue('example_file.ped');
//
//
//    Ext.getCmp(this.id + 'jobname').setValue("VCF example");
//    Ext.getCmp(this.id + 'jobdescription').setValue("VCF example");
//};
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

function CellbasePlugin(args) {
    var _this = this;
    this.id = Utils.genId('CellMapsConfigurationPanel');

    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.nodeAttributeManager;
    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });

    this.speciesSelected = "hsapiens";
    this.attributeNameSelected;
};

CellbasePlugin.prototype.draw = function () {
    var _this = this;
    var speciesStore = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'value' ],
        data: [
            {name: "Homo sapiens", value: "hsapiens"},
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
        margin: "0 0 0 5",
        width: 300,
        labelWidth: 60,
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
            change: function (combo, newValue, oldValue) {
                _this.speciesSelected = newValue;
            }
        }
    });

    var attributeCombo = Ext.create('Ext.form.field.ComboBox', {
        margin: "0 0 0 5",
        width: 300,
        labelWidth: 60,
        fieldLabel: 'Node attribute',
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
                    _this.attributeNameSelected = value;
                }
            }
        }
    });

    var extList = [
        {"boxLabel": "HGNC Symbol", "name": "dbNameShort", "inputValue": {db: "hgnc_symbol", field: "id"}},
        {"boxLabel": "Ensembl gene", "name": "dbNameShort", "inputValue": {db: "ensembl_gene", field: "id"}},
//        {"boxLabel": "MIM gene", "name": "protein", "inputValue": {db: "omim_gene", field: "id"}}, //mysql cellbase
        {"boxLabel": "Ensembl protein", "name": "dbNameShort", "inputValue": {db: "ensembl_protein", field: "id"}},
        {"boxLabel": "UCSC Stable ID", "name": "dbNameShort", "inputValue": {db: "ucsc_stable_id", field: "id"}},
        {"boxLabel": "Havana gene", "name": "dbNameShort", "inputValue": {db: "havana_gene", field: "id"}},
//        {"boxLabel": "UniProtKB/Swiss-Prot", "name": "protein", "inputValue": {db: "uniprotkb/swissprot", field: "id"}}, //mysql cellbase
        {"boxLabel": "UniProtKB/TrEMBL", "name": "dbNameShort", "inputValue": {db: "uniprotkb/trembl", field: "id"}},
        {"boxLabel": "UniParc", "name": "dbNameShort", "inputValue": {db: "uniparc", field: "id"}},
        {"boxLabel": "miRBase", "name": "dbNameShort", "inputValue": {db: "miRBase", field: "id"}},

        {"boxLabel": "Ensembl transcript", "name": "dbNameShort", "inputValue": {db: "ensembl_transcript", field: "id"}},
        {"boxLabel": "HGNC transcript name", "name": "dbNameShort", "inputValue": {db: "hgnc_transcript_name", field: "id"}},
        {"boxLabel": "Havana transcript", "name": "dbNameShort", "inputValue": {db: "havana_transcript", field: "id"}},
        {"boxLabel": "RefSeq peptide", "name": "dbNameShort", "inputValue": {db: "refseq_peptide", field: "id"}},
        {"boxLabel": "RefSeq mRNA", "name": "dbNameShort", "inputValue": {db: "refseq_mrna", field: "id"}}
    ];

    var funcList = [
//        {"boxLabel": "Biotype", "name": "biotype", "inputValue": "biotype"},

        {"boxLabel": "GO Term Accession", "name": "dbNameShort", "inputValue": {db: "go", field: "id"}},
        {"boxLabel": "GO Term Name", "name": "dbNameShort", "inputValue": {db: "go", field: "description"}},
        {"boxLabel": "Propagated GO Accession", "name": "dbNameShort", "inputValue": {db: "projected_go", field: "id"}},
        {"boxLabel": "Propagated GO Name", "name": "dbNameShort", "inputValue": {db: "projected_go", field: "description"}},
        {"boxLabel": "GOSlim GOA Accession", "name": "dbNameShort", "inputValue": {db: "goslim_goa", field: "id"}},
        {"boxLabel": "GOSlim GOA Name", "name": "dbNameShort", "inputValue": {db: "goslim_goa", field: "description"}},
        {"boxLabel": "InterPro ID", "name": "protein", "inputValue": {db: "interpro", field: "id"}},
        {"boxLabel": "InterPro Short Description", "name": "protein", "inputValue": {db: "interpro", field: "description"}}
    ];


    var repoList = [
//        {"boxLabel": "PDB", "name": "dbNameShort", "inputValue": {db: "pdb", field: "id"}}, //mysql cellbase
        {"boxLabel": "European Nucleotide Archive", "name": "dbNameShort", "inputValue": {db: "european_nucleotide_archive", field: "id"}},
        {"boxLabel": "Human Protein Atlas", "name": "dbNameShort", "inputValue": {db: "human_protein_atlas", field: "id"}},
        {"boxLabel": "INSDC protein ID", "name": "dbNameShort", "inputValue": {db: "insdc_protein_id", field: "id"}}
    ];


//        {"boxLabel": "LRG display in Ensembl", "name": "dbNameShort", "inputValue": "lrg_display_in_ensembl"},
//        {"boxLabel": "Transcript having exact match between ENSEMBL and HAVANA", "name": "dbNameShort", "inputValue": "transcript_having_exact_match_between_ensembl_and_havana"},
//        {"boxLabel": "Vega transcript", "name": "dbNameShort", "inputValue": "vega_transcript"},
//        {"boxLabel": "Vega translation", "name": "dbNameShort", "inputValue": "vega_translation"},
//        {"boxLabel": "Ensembl Human Translation", "name": "dbNameShort", "inputValue": "ensembl_human_translation"},
//        {"boxLabel": "CCDS", "name": "dbNameShort", "inputValue": "ccds"},

    this.extCheckGroup = Ext.create('Ext.form.CheckboxGroup', {
        columns: 1,
        vertical: true,
        title: 'External references',
        items: extList
    });
    this.funcCheckGroup = Ext.create('Ext.form.CheckboxGroup', {
        columns: 1,
        vertical: true,
        title: 'Functional information',
        items: funcList
    });
    this.repocheckGroup = Ext.create('Ext.form.CheckboxGroup', {
        columns: 1,
        vertical: true,
        title: 'Repositories',
        items: repoList
    });

    this.progress = Ext.create('Ext.ProgressBar', {
        text: 'Click search to retrieve data...',
        border: 1,
        margin: 3
    });

    this.window = Ext.create('Ext.window.Window', {
        title: "Cellbase",
        taskbar: Ext.getCmp(this.cellMaps.networkViewer.id + 'uxTaskbar'),
        height: 600,
        width: 500,
        closable: false,
        minimizable: true,
        collapsible: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [speciesCombo]
            },
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [attributeCombo]
            }
        ],
        items: [
            {
                xtype: 'tabpanel',
                border: false,
                flex: 1,
                buttonAlign: 'center',
                bodyPadding: 10,
                items: [
                    this.extCheckGroup,
                    this.funcCheckGroup,
                    this.repocheckGroup
                ]
            },
            this.progress
        ],
        buttons: [
            {
                text: 'Search',
                handler: function () {
                    _this.retrieveData();
                    _this.progress.updateProgress(0.1, 'Requesting data');
                }
            }
        ],
        listeners: {
            minimize: function () {
                this.hide();
            }
        }
    });
    /**/
};

CellbasePlugin.prototype.show = function () {
    this.window.show();
};


CellbasePlugin.prototype.retrieveData = function () {
    var _this = this;

    var attributes = [];
    var idAttr = {name: "Id", type: "string", defaultValue: ""};
    var idx = attributes.push(idAttr) - 1;
    var attributesMap = {"Id": idx};
    var dbnamesMap = {};

    var processCheckBoxes = function (item) {
        var value = item.getSubmitValue();
        if (value != null) {
            var label = item.boxLabel;

            var attr = {name: label, type: "string", defaultValue: ""};
            var index = attributes.push(attr) - 1;

            var mapId = value.db + value.field;
            attributesMap[mapId] = index;

            if (typeof dbnamesMap[value.db] === 'undefined') {
                dbnamesMap[value.db] = true;
            }
        }
    }
    this.extCheckGroup.items.each(processCheckBoxes);
    this.funcCheckGroup.items.each(processCheckBoxes);
    this.repocheckGroup.items.each(processCheckBoxes);


    var values = this.attributeManager.getValuesByAttribute(this.attributeNameSelected);

    var queries = [];
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        queries.push(v.value);
    }

    CellBaseManager.get({
        species: this.speciesSelected,
        category: 'feature',
        subCategory: 'id',
        query: queries.toString(),
        resource: 'xref',
        params: {
            dbname: Object.keys(dbnamesMap)
        },
        success: function (data) {
            _this.progress.updateProgress(0.4, 'Processing data');
//            var map = {};
//            var arr = [];
            var object = {};
            object.attributes = attributes;
            object.data = [];
            for (var r = 0; r < data.response.length; r++) {
                var response = data.response[r];
                var attributeId = values[r].id;
                var xrefs = response.result;
                if (xrefs.length > 0) {
                    var d = [];
                    d[0] = attributeId;
                    for (var i = 0; i < xrefs.length; i++) {
                        var xref = xrefs[i];

                        var mapId1 = xref.dbNameShort + 'id';
                        var mapId2 = xref.dbNameShort + 'description';

                        var index1 = attributesMap[mapId1];
                        var index2 = attributesMap[mapId2];

                        if (typeof index1 !== 'undefined') {
                            if (typeof d[index1] === 'undefined') {
                                d[index1] = '';
                            }
                            if (d[index1] === '') {
                                d[index1] += xref.id;
                            } else {
                                d[index1] += ',' + xref.id;
                            }
                        }
                        if (typeof index2 !== 'undefined') {
                            if (typeof d[index2] === 'undefined') {
                                d[index2] = '';
                            }
                            if (d[index2] === '') {
                                d[index2] += xref.description;
                            } else {
                                d[index2] += ',' + xref.description;
                            }

                        }

                    }
                    object.data.push(d);
                }
            }
            _this.progress.updateProgress(0.7, 'Adding attributes');
            _this.cellMaps.networkViewer.importVertexWithAttributes({content: object});
            _this.progress.updateProgress(1, 'Complete!');
            _this.attributeStore.loadData(_this.attributeManager.attributes);
        }
    });
};


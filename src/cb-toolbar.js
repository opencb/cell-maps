/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function CbToolBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("CbToolBar");


    //set instantiation args, must be last
    _.extend(this, args);

    this.toolbar;

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CbToolBar.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar' + this.id + '" class="unselectable"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.id + "navToolbar",
            renderTo: $(this.div).attr('id'),
            cls: 'jso-white-background',
            region: "north",
            width: '100%',
            border: false,
            items: [
                {
                    text: 'File',
                    menu: {
                        plain: true,
                        items: [
                            {
                                text: 'Open JSON...',
                                handler: function () {
                                    _this.trigger('openJSON:click', {sender: _this});
                                }
                            },
                            {
                                text: 'Save as JSON',
                                href: 'none',
                                handler: function () {
                                    _this.trigger('saveJSON:click', {a: this.getEl().child("a"), sender: _this});
                                }
                            }
                            ,
                            '-',
                            {
                                text: "Save as PNG",
                                href: "none",
                                iconCls: 'icon-blue-box',
                                handler: function () {
                                    _this.trigger('savePNG:click', {a: this.getEl().child("a"), sender: _this});
                                }
                            },
                            {
                                text: "Save as JPG",
                                href: "none",
                                iconCls: 'icon-blue-box',
                                handler: function () {
                                    _this.trigger('saveJPG:click', {a: this.getEl().child("a"), sender: _this});
                                }
                            },
                            {
                                text: "Save as SVG (recommended)",
                                href: "none",
                                iconCls: 'icon-blue-box',
                                handler: function () {
                                    _this.trigger('saveSVG:click', {a: this.getEl().child("a"), sender: _this});
                                }
                            }
                        ]
                    }
                },


                {

                    text: 'Attributes',
                    menu: this.getAttributesMenu()
                },


                {
                    text: 'Plugins',
                    menu: this.getAnalysisMenu()
                }
            ]
        });

        this.rendered = true;
    },


    getHeight: function () {
        return this.toolbar.getHeight();
    },


    getAttributesMenu: function () {
        var _this = this;

        var nodeFiltersMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            id: "filtersNodeAttrMenu",
            items: [
                {
                    text: "Edit...",
                    handler: function () {
                        _this.trigger('filterNodeAttributes:click', {sender: _this});
                    }
                },
                '-'
            ]
        });

        var nodeMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            margin: '0 0 10 0',
            floating: true,
            items: [
                {
                    text: 'Import...',
                    handler: function () {
                        _this.trigger('importNodeAttributes:click', {sender: _this});
                    }
                },
                '-',
                {
                    text: 'Edit...',
                    handler: function () {
                        _this.trigger('editNodeAttributes:click', {sender: _this});
                    }
                },
                {
                    text: 'Filters',
                    menu: nodeFiltersMenu,
                    handler: function () {
                        _this.trigger('filterNodeAttributes:click', {sender: _this});
                    }
                }
            ]
        });

        var edgeFiltersMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            id: "filtersEdgeAttrMenu",
            items: [
                {
                    text: "Edit...",
                    handler: function () {
                        if (!Ext.getCmp("filterEdgeAttrWindow")) {
                            _this.edgeAttributeFilterWidget.draw(_this.networkViewer.getSelectedNodes());
                        }
                    }
                },
                '-'
            ]
        });

        var edgeMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            margin: '0 0 10 0',
            floating: true,
            items: [
//		         {
//		        	 text : 'Import...',
//		        	 handler : function() {
//		        		 var importAttributesFileWidget =  new ImportAttributesFileWidget({"numNodes": _this.networkViewer.getNumNodes()});
//		        		 importAttributesFileWidget.draw();
//		        		 importAttributesFileWidget.onOk.addEventListener(function(sender, data){
//		        			 _this.networkViewer.importAttributes(data);
//		        		 });
//		        	 }
//		         },'-',
                {
                    text: 'Edit...',
                    handler: function () {
                        if (!Ext.getCmp("editEdgeAttrWindow")) {
                            _this.edgeAttributeEditWidget.draw(_this.networkViewer.getSelectedNodes());
                        }
                    }
                },
                {
                    text: 'Filters',
                    menu: edgeFiltersMenu,
                    handler: function () {
                        if (!Ext.getCmp("filterEdgeAttrWindow")) {
                            _this.edgeAttributeFilterWidget.draw(_this.networkViewer.getSelectedNodes());
                        }
                    }
                }
            ]
        });

        var menu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: 'Nodes',
                    menu: nodeMenu
                },
                {
                    text: 'Edges',
                    menu: edgeMenu
                }
            ]
        });

        return menu;
    },


    getAnalysisMenu: function () {
        var _this = this;

        var importFileMenu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: "DOT",
                    handler: function () {
                        var dotNetworkFileWidget = new DOTNetworkFileWidget({"networkData": _this.networkViewer.networkData});
                        dotNetworkFileWidget.draw();
                        dotNetworkFileWidget.onOk.addEventListener(function (sender, data) {
                            _this.networkViewer.loadNetwork(data.content, data.layout);
                        });
                    }
                },
                {
                    text: "SIF",
                    handler: function () {
                        var sifNetworkFileWidget = new SIFNetworkFileWidget({"networkData": _this.networkViewer.networkData});
                        sifNetworkFileWidget.draw();
                        sifNetworkFileWidget.onOk.addEventListener(function (sender, data) {
                            _this.networkViewer.loadNetwork(data.content, data.layout);
                        });
                    }
                },
                {
                    text: "STRING",
                    handler: function () {
                        var stringNetworkFileWidget = new StringNetworkFileWidget({"networkData": _this.networkViewer.networkData});
                        stringNetworkFileWidget.draw();
                        stringNetworkFileWidget.onOk.addEventListener(function (sender, data) {
                            _this.networkViewer.loadNetwork(data.content, data.layout);
                        });
                    }
                },
                {
                    text: "txt",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "SBML",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Biopax",
                    disabled: true,
                    handler: function () {
                    }
                }
            ]
        });

        var importMenu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: "File",
                    menu: importFileMenu
                },
                {
                    text: "Reactome",
//		        	disabled: true,
                    handler: function () {
                        var reactome = new ReactomePlugin(_this);
                        reactome.draw();
                    }
                },
                {
                    text: "Intact",
                    disabled: true,
                    handler: function () {
                        var intact = new IntactPlugin();
                        intact.draw();
                    }
                },
                {
                    text: "Differential Expression Analysis",
                    disabled: true,
                    handler: function () {
                    }
                }
            ]
        });

        var networkMenu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: "Cellular localization network",
                    handler: function () {
                    }
                },
                {
                    text: "Genome structure network",
                    handler: function () {
                    }
                },
                {
                    text: "Shortestspath",
                    handler: function () {
                    }
                },
                {
                    text: "Merge",
                    handler: function () {
                    }
                },
                {
                    text: "Network generator",
                    handler: function () {
                    }
                }
            ]
        });

        var functionalMenu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: "FatiGO",
                    disabled: true,
                    id: this.id + "fatigoBtn",
                    handler: function () {
                        var fatigo = new FatigoPlugin(_this);
                        var args = {
                            type: "window",
                            title: "Fatigo plugin",
                            taskbar: Ext.getCmp(_this.networkViewer.id + 'uxTaskbar')
                        };
                        fatigo.draw(args);
                    },
                    listeners: {
                        afterrender: function (me) {
                            if ($.cookie("bioinfo_sid") != null) {
                                me.enable()
                            }
                        }
                    }
                },
                {
                    text: "Gene set analysis",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Functional network",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Regulation network",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Clustering network",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Disease network",
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Interactome 3D",
                    disabled: true,
                    handler: function () {
                    }
                }
            ]
        });

        var pathwayMenu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: "Network miner",
                    handler: function () {
                    }
                },
                {
                    text: "PODA",
                    handler: function () {
                    }
                },
                {
                    text: "Probability path",
                    handler: function () {
                    }
                },
                {
                    text: "Superpathways",
                    handler: function () {
                    }
                }
            ]
        });

        var analysisMenu = Ext.create('Ext.menu.Menu', {
            margin: '0 0 10 0',
            floating: true,
            items: [
                {
                    text: 'Import',
                    menu: importMenu
                },
                {
                    text: 'Network analysis',
                    disabled: true,
                    menu: networkMenu
                },
                {
                    text: 'Functional enrichment',
//					disabled: true,
                    menu: functionalMenu
                },
                {
                    text: 'Pathway based analysis',
                    disabled: true,
                    menu: pathwayMenu
                }
//					text : 'Expression',
//					handler: function(){
//						_this.networkViewer.expressionSelected();
//					}
//				}
//				,
//				{
//					text : 'Interactome browser',
//					handler: function(){
//					}
//				},
//				{
//					text : 'Reactome browser',
//					handler: function(){
//						_this.networkViewer.reactomeSelected();
//					}
//				}
            ]
        });
        return analysisMenu;
    }

}
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

function CmToolBar(args) {

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

CmToolBar.prototype = {
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


        var importFileMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: 'Network from SIF...',
                    handler: function () {
                        _this.trigger('openSIF:click', {sender: _this});
                    }
                },
                {
                    text: 'Network from DOT...',
                    hidden: true,
                    handler: function () {
                        _this.trigger('openDOT:click', {sender: _this});
                    }
                },
                {
                    text: "STRING",
                    hidden: true,
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
                    hidden: true,
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "SBML",
                    hidden: true,
                    disabled: true,
                    handler: function () {
                    }
                },
                {
                    text: "Biopax",
                    hidden: true,
                    disabled: true,
                    handler: function () {
                    }
                },
                '-',
                {
                    text: 'Node attributes...',
                    handler: function () {
                        _this.trigger('importNodeAttributes:click', {sender: _this});
                    }
                },
                {
                    text: 'Edge attributes...',
                    handler: function () {
                        _this.trigger('importEdgeAttributes:click', {sender: _this});
                    }
                }
//                {
//                    text: 'Background image',
//                    handler: function () {
//
//                    }
//                }

            ]
        })

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
                                tooltip: 'Network will be deleted permanently!',
                                text: 'New Session',
                                handler: function () {
                                    _this.trigger('click:newsession', {sender: _this});
                                }
                            },
                            {
                                text: 'Open Session...',
                                handler: function () {
                                    _this.trigger('openJSON:click', {sender: _this});
                                }
                            },
                            {
                                text: 'Save Session',
                                href: 'none',
                                handler: function () {
                                    _this.trigger('saveJSON:click', {a: this.getEl().child("a"), sender: _this});
                                }
                            },
                            '-',
                            {
                                text: 'Import',
                                menu: importFileMenu
                            },
                            '-',
                            {
                                text: 'Export',
                                menu: {
                                    plain: true,
                                    items: [
                                        {
                                            text: "Network as SIF",
                                            href: "none",
                                            icon: Utils.images.r,
                                            handler: function () {
                                                _this.trigger('saveSIF:click', {a: this.getEl().child("a"), sender: _this});
                                            }
                                        },
                                        '-',
                                        {
                                            text: "Network as SVG",
                                            href: "none",
                                            iconCls: 'icon-blue-box',
                                            handler: function () {
                                                _this.trigger('saveSVG:click', {a: this.getEl().child("a"), sender: _this});
                                            }
                                        },
                                        {
                                            text: "PNG image",
                                            href: "none",
                                            iconCls: 'icon-blue-box',
                                            hidden: true,
                                            handler: function () {
                                                _this.trigger('savePNG:click', {a: this.getEl().child("a"), sender: _this});
                                            }
                                        },
                                        {
                                            text: "JPG image",
                                            href: "none",
                                            iconCls: 'icon-blue-box',
                                            hidden: true,
                                            handler: function () {
                                                _this.trigger('saveJPG:click', {a: this.getEl().child("a"), sender: _this});
                                            }
                                        }
                                    ]
                                }
                            }

                        ]
                    }
                },
                {

                    text: 'Network',
                    menu: this.getNetworkMenu()
                },
                {

                    text: 'Attributes',
                    menu: this.getAttributesMenu()
                },


                {
                    text: 'Plugins',
                    menu: this.getAnalysisMenu()
                },

                {
                    text: 'Examples',
                    cls: 'bootstrap',
                    menu: this.getExamplesMenu()
                },

                '->',
                {
                    tooltip: 'Configure',
                    text: '<span class="emph"> Configure</span>',
                    enableToggle: true,
                    iconCls: 'ocb-icon-gear',
                    pressed: true,
                    hidden: false,
                    toggleHandler: function () {
                        _this.trigger('configuration-button:change', {selected: this.pressed, sender: _this});
                    }
                },
                {
                    tooltip: 'Jobs',
                    text: '<span class="emph"> Jobs</span>',
                    margin: '0 5 0 0',
                    enableToggle: true,
//                    iconCls: 'ocb-icon-gear',
                    pressed: false,
                    hidden: true,
                    toggleHandler: function () {
                        _this.trigger('jobs-button:change', {selected: this.pressed, sender: _this});
                    }
                }

            ]
        });

        this.rendered = true;
    },


    getHeight: function () {
        return this.toolbar.getHeight();
    },


    getNetworkMenu: function () {
        var _this = this;

        var menu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: 'Edit network...',
                    handler: function () {
                        _this.trigger('click:editNetwork', {sender: _this});
                    }
                },
                {
                    text: 'Select',
                    menu: {
                        plain: true,
                        items: [
                            {
                                text: 'All nodes',
                                handler: function () {
                                    _this.trigger('click:selectAllNodes', {sender: _this});
                                }
                            },                            {
                                text: 'First neighbour nodes',
                                handler: function () {
                                    _this.trigger('click:selectNodesNeighbour', {sender: _this});
                                }
                            },                            {
                                text: 'Invert node selection',
                                handler: function () {
                                    _this.trigger('click:selectVerticesInvert', {sender: _this});
                                }
                            },

                            '-',
                            {
                                text: 'All edges',
                                handler: function () {
                                    _this.trigger('click:selectAllEdges', {sender: _this});
                                }
                            },
                            {
                                text: 'Adjacent edges',
                                handler: function () {
                                    _this.trigger('click:selectEdgesNeighbour', {sender: _this});
                                }
                            },
                            '-',
                            {
                                text: 'Everything',
                                handler: function () {
                                    _this.trigger('click:selectAll', {sender: _this});
                                }
                            }
                        ]
                    }
                }
            ]
        });

        return menu;
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
//                {
//                    text: 'Import...',
//                    handler: function () {
//                        _this.trigger('importNodeAttributes:click', {sender: _this});
//                    }
//                },
//                '-',
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
                    text: 'Edit nodes...',
                    handler: function () {
                        _this.trigger('editNodeAttributes:click', {sender: _this});
                    }
                },
                {
                    text: 'Edit edges...',
                    handler: function () {
                        _this.trigger('editEdgeAttributes:click', {sender: _this});
                    }
                },
                '-',
                {
                    text: 'Cellbase...',
                    handler: function () {
                        _this.trigger('click:cellbase', {sender: _this});
                    }
                }
            ]
        });

        return menu;
    },


    getAnalysisMenu: function () {
        var _this = this;

        var importMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: "Reactome...",
//		        	disabled: true,
                    handler: function () {
                        _this.trigger('click:reactome', {sender: _this});
                    }
                },
                {
                    text: "IntAct",
//                    disabled: true,
                    handler: function () {
                        _this.trigger('click:intact', {sender: _this});
                    }
                }
//                ,
//                {
//                    text: "Differential Expression Analysis",
//                    disabled: true,
//                    handler: function () {
//                    }
//                }
            ]
        });

        var networkMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: "Communities structure detection",
                    handler: function () {
                        _this.trigger('click:communitiesStructureDetection', {sender: _this});
                    }
                },
                {
                    text: "Topological study",
                    handler: function () {
                        _this.trigger('click:topologicalStudy', {sender: _this});
                    }
                }
//                {
//                    text: "Cellular localization network",
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Genome structure network",
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Shortestspath",
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Merge",
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Network generator",
//                    handler: function () {
//                    }
//                }
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
            plain: true,
            items: [

                {
                    text: 'Import Data',
                    menu: importMenu
                },
                {
                    text: 'Network analysis',
                    menu: networkMenu
                },
//                {
//                    text: 'Functional enrichment',
////					disabled: true,
//                    menu: functionalMenu
//                },
//                {
//                    text: 'Pathway based analysis',
//                    disabled: true,
//                    menu: pathwayMenu
//                }
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
    },
    getExamplesMenu: function () {
        var _this = this;
        var examplesMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: "PPIs related to histone exchange and removal during nucleosome assembly and disassembly",
                    handler: function () {
                        _this.trigger('example:click', {example: 1, sender: _this});
                    }
                },
                {
                    text: "Reactome pathway of Insulin Synthesis and Processing",
                    hidden: false,
                    handler: function () {
                        _this.trigger('example:click', {example: 2, sender: _this});
                    }
                },
                {
                    text: "PPI network with attributes",
                    hidden: false,
                    handler: function () {
                        _this.trigger('example:click', {example: 3, sender: _this});
                    }
                }
            ]
        });
        return examplesMenu;
    }
}
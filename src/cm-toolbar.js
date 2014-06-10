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
    this.height = 35;

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
    setWidth: function () {
        this.toolbar.setWidth();
    },
    render: function () {
        var _this = this;
        this.div = $('<div id="navigation-bar' + this.id + '" class="unselectable"></div>')[0];

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
                    text: 'Network from XLSX...',
                    handler: function () {
                        _this.trigger('click:openXLSX', {sender: _this});
                    }
                },
                {
                    text: 'Network from Text...',
                    handler: function () {
                        _this.trigger('click:openText', {sender: _this});
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
                        _this.trigger('importVertexAttributes:click', {sender: _this});
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
            cls: 'jso-white-background',
            region: "north",
            width: '100%',
            height: this.height,
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
                                handler: function () {
                                    _this.trigger('saveJSON:click', {sender: _this});
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
                                            text: 'Network as SIF',
//                                            cls: 'bootstrap',
                                            handler: function () {
                                                _this.trigger('saveSIF:click', {sender: _this});
                                            }
                                        },
                                        '-',
                                        {
                                            text: 'Network as SVG',
//                                            cls: 'bootstrap',
                                            handler: function () {
                                                _this.trigger('saveSVG:click', {sender: _this});
                                            }
                                        },
                                        {
                                            text: 'PNG image',
//                                            cls: 'bootstrap',
                                            handler: function () {
                                                _this.trigger('savePNG:click', {sender: _this});
                                            }
                                        },
                                        '-',
                                        {
                                            text: 'Node attributes as file',
//                                            cls: 'bootstrap',
                                            handler: function () {
                                                _this.trigger('click:exportVertexAttributes', {sender: _this});
                                            }
                                        },
                                        {
                                            text: 'Edge attributes as file',
//                                            cls: 'bootstrap',
                                            handler: function () {
                                                _this.trigger('click:exportEdgeAttributes', { sender: _this});
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
                    menu: this.getExamplesMenu()
                },

                '->',
                {
                    tooltip: 'Configure',
                    cls: 'bootstrap',
                    text: '<span class="glyphicon glyphicon-cog"></span> Visual settings',
                    enableToggle: true,
                    pressed: true,
                    hidden: false,
                    toggleHandler: function () {
                        _this.trigger('configuration-button:change', {selected: this.pressed, sender: _this});
                    }
                }
            ]
        });
        this.rendered = true;

    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (this.targetDiv === 'undefined') {
            console.log('target not found');
            return;
        }
        /**********/
        /**********/
        $(this.targetDiv).append(this.div);
        /**********/
        /**********/

        this.toolbar.render(this.div);
    },

    getJobsButton: function () {
        return Ext.getCmp('jobs' + this.id);
    },

    getHeight: function () {
        return this.height;
    },


    getNetworkMenu: function () {
        var _this = this;


        this.circleLayoutMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: []
        });

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
                                    _this.trigger('click:selectAllVertices', {sender: _this});
                                }
                            },
                            {
                                text: 'First neighbour nodes',
                                handler: function () {
                                    _this.trigger('click:selectVerticesNeighbour', {sender: _this});
                                }
                            },
                            {
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
                },
                {
                    text: 'Layout',
                    menu: {
                        plain: true,
                        items: [
                            {
                                text: 'Force directed',
                                menu: {
                                    plain: true,
                                    items: [
                                        {
                                            text: 'Default',
                                            handler: function () {
                                                _this.trigger('click:layout', {option: 'Force directed', sender: _this});
                                            }
                                        },
                                        {
                                            text: 'Configure',
                                            handler: function () {
                                                _this.trigger('click:configureLayout', {sender: _this});
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                text: 'Circle',
                                menu: this.circleLayoutMenu
                            },
                            {
                                text: 'Random',
                                handler: function () {
                                    _this.trigger('click:layout', {option: this.text, sender: _this});
                                }
                            },
                            ,
                            {
                                text: 'Attribute layout...',
                                handler: function () {
                                    _this.trigger('click:configureAttributeLayout', {option: this.text, sender: _this});
                                }
                            },
                        ]
                    }
                }
            ]
        });

        return menu;
    },


    getAttributesMenu: function () {
        var _this = this;

        var vertexFiltersMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            id: "filtersVertexAttrMenu",
            items: [
                {
                    text: "Edit...",
                    handler: function () {
                        _this.trigger('filterVertexAttributes:click', {sender: _this});
                    }
                },
                '-'
            ]
        });

        var vertexMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            margin: '0 0 10 0',
            floating: true,
            items: [
//                {
//                    text: 'Import...',
//                    handler: function () {
//                        _this.trigger('importVertexAttributes:click', {sender: _this});
//                    }
//                },
//                '-',
                {
                    text: 'Filters',
                    menu: vertexFiltersMenu,
                    handler: function () {
                        _this.trigger('filterVertexAttributes:click', {sender: _this});
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
                            _this.edgeAttributeFilterWidget.draw(_this.networkViewer.getSelectedVertices());
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
//		        		 var importAttributesFileWidget =  new ImportAttributesFileWidget({"numVertices": _this.networkViewer.getNumVertices()});
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
                            _this.edgeAttributeFilterWidget.draw(_this.networkViewer.getSelectedVertices());
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
                        _this.trigger('editVertexAttributes:click', {sender: _this});
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

        var expressionMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: "Reactome FI microarray",
                    handler: function () {
                        _this.trigger('click:reactimeFIMicroarray', {sender: _this});
                    }
                }
            ]
        });

        var functionalMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: "Network enrichment analysis - SNOW",
                    handler: function () {
                        _this.trigger('click:snow', {sender: _this});
                    }
                },
                {
                    text: "Network set enrichment analysis - Network Miner",
                    handler: function () {
                        _this.trigger('click:networkMiner', {sender: _this});
                    }
                },
                {
                    text: "Fatigo",
                    hidden: true,
                    handler: function () {
                        _this.trigger('click:fatigo', {sender: _this});
                    }
                },
//                {
//                    text: "FatiGO",
//                    disabled: true,
//                    id: this.id + "fatigoBtn",
//                    handler: function () {
//                        var fatigo = new FatigoPlugin(_this);
//                        var args = {
//                            type: "window",
//                            title: "Fatigo plugin",
//                            taskbar: Ext.getCmp(_this.networkViewer.id + 'uxTaskbar')
//                        };
//                        fatigo.draw(args);
//                    },
//                    listeners: {
//                        afterrender: function (me) {
//                            if ($.cookie("bioinfo_sid") != null) {
//                                me.enable()
//                            }
//                        }
//                    }
//                },
//                {
//                    text: "Gene set analysis",
//                    disabled: true,
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Functional network",
//                    disabled: true,
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Regulation network",
//                    disabled: true,
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Clustering network",
//                    disabled: true,
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Disease network",
//                    disabled: true,
//                    handler: function () {
//                    }
//                },
//                {
//                    text: "Interactome 3D",
//                    disabled: true,
//                    handler: function () {
//                    }
//                }
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
                {
                    text: 'Expression analysis',
                    menu: expressionMenu
                },
                {
                    text: 'Functional analysis',
                    menu: functionalMenu
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
    },


    setVertexAttributes: function (attributeManager) {
        this._setCircleLayoutMenu(attributeManager);
    },
    _setCircleLayoutMenu: function (attributeManager) {
        var _this = this;
        this.circleLayoutMenu.removeAll();

        this.circleLayoutMenu.add([
            {
                text: 'Unsorted',
                handler: function () {
                    _this.trigger('click:layout', {option: 'Circle', sender: _this});
                }
            },
            '-'
        ]);

        var attributes = attributeManager.attributes;
        for (var a in attributes) {
            var name = attributes[a].name;
            this.circleLayoutMenu.add({
                text: name,
                handler: function () {
                    _this.trigger('click:layout', {option: 'Circle', attributeName: name, sender: _this});
                }
            });
        }
    }
}
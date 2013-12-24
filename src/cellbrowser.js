/*
 * Copyright (c) 2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2013 Ignacio Medina (ICM-CIPF)
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

function CellBrowser(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("CellBrowser");

    //set default args
    this.suiteId = 10;
    this.title = 'Cell Browser';
    this.description = "System biology visualization";
    this.version = "2.0.0";
    this.border = true;
    this.resizable = true;
    this.targetId;
    this.width;
    this.height;


    //set instantiation args, must be last
    _.extend(this, args);

    this.accountData = null;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

CellBrowser.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }
        console.log("Initializing Cell Browser");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="cell-browser"></div>')[0];
        $(this.targetDiv).append(this.div);

        $(this.div).append('<div id="cb-header-widget"></div>');
        $(this.div).append('<div id="cb-tool-bar"></div>');
        $(this.div).append('<div id="cb-network-viewer" style="position:relative;"></div>');
        $(this.div).append('<div id="cb-status-bar"></div>');

        this.width = ($(this.div).width());

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }

        // Resize
        if (this.resizable) {
            $(window).resize(function (event) {
                if (event.target == window) {
                    if (!_this.resizing) {//avoid multiple resize events
                        _this.resizing = true;
                        _this.setWidth($(_this.div).width());
                        setTimeout(function () {
                            _this.resizing = false;
                        }, 400);
                    }
                }
            });
        }

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Genome Maps is not rendered yet');
            return;
        }

        /* Header Widget */
        this.headerWidget = this._createHeaderWidget('cb-header-widget');

        this.cbToolBar = this._createCbToolBar('cb-tool-bar');

        var centerHeight = $(window).height() - this.headerWidget.height - this.cbToolBar.getHeight() - $('#status').height() - 12;

        $('#cb-network-viewer').css({
            height: centerHeight
        });

        /* network Viewer  */
        this.networkViewer = this._createNetworkViewer('cb-network-viewer');

        /* status bar  */
        this.statusBar = this._createStatusBar('status');


//        //TEST SCROLL BAR


        var text = "Release Candidate";
        this.headerWidget.setDescription(text);

        //check login
        if ($.cookie('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }

    },
    _createHeaderWidget: function (targetId) {
        var _this = this;
        var headerWidget = new HeaderWidget({
            targetId: targetId,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            suiteId: this.suiteId,
            accountData: this.accountData,
            chunkedUpload: false,
            handlers: {
                'login': function (event) {
                    Ext.example.msg('Welcome', 'You logged in');
                    _this.sessionInitiated();
                },
                'logout': function (event) {
                    Ext.example.msg('Good bye', 'You logged out');
                    _this.sessionFinished();

                },
                'account:change': function (event) {
                    _this.setAccountData(event.response);

                }
            }
        });
        headerWidget.draw();

        return headerWidget;
    },
    _createCbToolBar: function (targetId) {
        var _this = this;
        var cbToolBar = new CbToolBar({
            targetId: targetId,
            autoRender:true
        });
        return cbToolBar;
    },
    _createNetworkViewer: function (targetId) {
        var _this = this;
        var networkViewer = new NetworkViewer({
            targetId: targetId,
            autoRender: true,
            sidePanel: false,
            border:false
        });
        networkViewer.draw();
        return networkViewer;
    },
    _createStatusBar: function (targetId) {
        var _this = this;
        var statusBar;
        return  statusBar;
    },
    sessionInitiated: function () {

    },
    sessionFinished: function () {

    },
    setAccountData: function (response) {
        this.accountData = response;
    }
}

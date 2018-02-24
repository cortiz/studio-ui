CStudioAuthoring.Module.requireModule(
    'ace',
    '/static-assets/components/cstudio-common/ace/ace.js', {}, {
        moduleLoaded: function () {
            CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/ace/ext-searchbox.js");
            CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/ace/ext-language_tools.js");
            CStudioAuthoring.Utils.addCss("/static-assets/themes/cstudioTheme/css/template-editor.css")
            CStudioAuthoring.Module.requireModule(
                "cstudio-forms-engine",
                '/static-assets/components/cstudio-forms/forms-engine.js',
                {  },
                {
                    moduleLoaded: function() {
                        CStudioForms.TemplateEditor = CStudioForms.TemplateEditor ||  function()  {
                            return this;
                        };
                        var CrafterUIMessages = CStudioAuthoring.Messages;
                        var contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);
                        CStudioForms.TemplateEditor.prototype = {
                            render: function(templatePath, channel, onSaveCb, contentType, mode) {

                                var getContentCb = {
                                    success: function(response) {
                                        this.context.renderTemplateEditor(templatePath, response, onSaveCb, contentType, mode);
                                    },
                                    failure: function() {
                                    },
                                    context: this
                                };

                                CStudioAuthoring.Service.getContent(templatePath, true, getContentCb, false);
                            },
                            renderTemplateEditor: function(templatePath, content, onSaveCb, contentType, isRead) {
                                var permsCallback = {
                                    success: function(response) {

                                        var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);
                                        // Builds Elements
                                        var modalEl = document.createElement("div");
                                        modalEl.id = "cstudio-template-editor-container-modal";
                                        document.body.appendChild(modalEl);

                                        var containerEl = document.createElement("div");
                                        containerEl.id = "cstudio-template-editor-container";
                                        YAHOO.util.Dom.addClass(containerEl, 'seethrough');
                                        modalEl.appendChild(containerEl);
                                        var formHTML = '';
                                        // Read Only
                                        if(isRead === "read"){
                                            formHTML +='<div id="cstudio-form-readonly-banner">READ ONLY</div>';

                                        }

                                        formHTML +=
                                            "<div id='template-editor-toolbar'><div id='template-editor-toolbar-variable'></div></div>" +
                                            "<div id='editor-container'>"+
                                            "</div>" +
                                            "<div id='template-editor-button-container'>";

                                        if(isWrite == true) {
                                            formHTML +=
                                                "<div class='edit-buttons-container'>" +
                                                "<div  id='template-editor-update-button' class='btn btn-primary cstudio-template-editor-button'>Update</div>" +
                                                "<div  id='template-editor-cancel-button' class='btn btn-default cstudio-template-editor-button'>Cancel</div>" +
                                                "<div/>";
                                        }
                                        else {
                                            formHTML +=
                                                "<div class='edit-buttons-container viewer'>" +
                                                "<div  id='template-editor-cancel-button' style='right: 120px;' class='btn btn-default cstudio-template-editor-button'>Close</div>";
                                            "<div/>";
                                        }

                                        formHTML +=
                                            "</div>";

                                        containerEl.innerHTML = formHTML;
                                        var editorContainerEl = document.getElementById("editor-container");
                                        var editorEl = document.createElement("pre");
                                        editorEl.id="editor"
                                        editorContainerEl.appendChild(editorEl);
                                        //End of Build Element
                                        var editor = ace.edit("editor");
                                        editor.setTheme("ace/theme/sqlserver");
                                        var mode = "ace/mode/";
                                        if(templatePath.indexOf(".css") != -1) {
                                            mode += "css";
                                        }
                                        else if(templatePath.indexOf(".js") != -1) {
                                            mode += "javascript";
                                        }else if(templatePath.indexOf(".groovy") != -1){
                                            mode += "groovy"
                                        }else if(templatePath.indexOf(".xml") != -1) {
                                            mode += "xml"
                                        }else if(templatePath.indexOf(".hbs") != -1) {
                                            mode += "handlebars"
                                        }else if(templatePath.indexOf(".ts") != -1) {
                                            mode += "typescript"
                                        }else if(templatePath.indexOf(".yaml") != -1 ||
                                            templatePath.indexOf(".yml") != -1 ){
                                                mode += "yaml"
                                        }else{
                                            mode += "ftl"
                                        }
                                        editor.session.setMode(mode);

                                        editor.setOptions({
                                            enableBasicAutocompletion: true,
                                            enableSnippets: true,
                                            enableLiveAutocompletion: false
                                        });
                                        editor.setReadOnly(!isWrite);
                                        editor.setValue(content, 1);// 1 cursor at the start
                                        editor.focus();
                                        var codeEditorEl = YAHOO.util.Dom.getElementsByClassName("ace_editor", null, editorContainerEl)[0];
                                        codeEditorEl.style.backgroundColor = "white";

                                        var codeEditorCanvasEl = YAHOO.util.Dom.getElementsByClassName("ace_text-input", null, editorContainerEl)[0];
                                        codeEditorCanvasEl.style.height = "100%";

                                        var codeEditorScrollEl = YAHOO.util.Dom.getElementsByClassName("ace_scroller", null, editorContainerEl)[0];
                                        codeEditorScrollEl.style.height = "100%";

                                        // Cancel BTN
                                        var cancelEl = document.getElementById('template-editor-cancel-button');
                                        cancelEl.onclick = function() {
                                            var cancelEditServiceUrl = "/api/1/services/api/1/content/unlock-content.json"
                                                + "?site=" + CStudioAuthoringContext.site
                                                + "&path=" + encodeURI(templatePath);

                                            var cancelEditCb = {
                                                success: function(response) {
                                                    modalEl.parentNode.removeChild(modalEl);
                                                },
                                                failure: function() {
                                                }
                                            };

                                            if (typeof CStudioAuthoring.editDisabled !== 'undefined') {
                                                for(var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++){
                                                    window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = "";
                                                }
                                                window.parent.CStudioAuthoring.editDisabled = [];
                                            }

                                            YAHOO.util.Connect.asyncRequest('GET', CStudioAuthoring.Service.createServiceUri(cancelEditServiceUrl), cancelEditCb);
                                        };
                                        //End of Cancel BTN
                                    },
                                    failure: function() {
                                        console.log("Nop :(")
                                    }
                                }// End of Permissions Callback

                                CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, templatePath,
                                    permsCallback);
                            }

                        };//end of CStudioForms.TemplateEditor.prototype

                        CStudioAuthoring.Module.moduleLoaded("cstudio-forms-template-editor",CStudioForms.TemplateEditor);
                }
                });//end of CStudioAuthoring.Module.requireModule
        }
    });//End of CStudioAuthoring.Module.requireModule
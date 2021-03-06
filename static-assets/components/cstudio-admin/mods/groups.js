CStudioAdminConsole.Tool.Groups = CStudioAdminConsole.Tool.Groups ||  function(config, el)  {
        this.containerEl = el;
        this.config = config;
        this.types = [];
        this.currMillis = new Date().getTime();
        return this;
    }

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.Groups, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        var workareaEl = document.getElementById("cstudio-admin-console-workarea"),
            auditUrl = '/studio/#/groups?iframe=true&site=' + CStudioAuthoringContext.siteId,
            actions = [];

        workareaEl.innerHTML =
            '<div class="iframe-container" style="position: relative; top: 50px; height: calc(100vh - 50px);">' +
            '<iframe src="'+ auditUrl +'" style="width: 100%; height: 100%;"></iframe>' +
            '</div>';

        CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
    }

});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-groups",CStudioAdminConsole.Tool.Groups);
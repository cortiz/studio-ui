ace.define("ace/snippets/ftl",["require","exports","module"], function(require, exports, module) {
    "use strict";

    exports.snippetText = "snippet cvar\
   ${contentModel.${1:variableName}}\
snippet rparm\
  ${RequestParameters[\"${1:paramName}\"]!\"${2:defaultValue}\"}\
  \
snippet ssup\
   <#import \"/templates/system/common/cstudio-support.ftl\" as studio />\
   \
snippet incNav\
  <#include \"/templates/web/navigation/navigation.ftl\">\
  \
snippet dnav\
    <@renderNavigation /site/website\", 1 />\
snippet ptourl\
    ${urlTransformationService.transform('storeUrlToRenderUrl', ${1:Store Url})}\
    \
snippet iedit\
   <@studio.iceAttr iceGroup=\"${1:iceGroup}\"/>\
   \
snippet dadz\
    <@studio.componentContainerAttr target=\"${1:target Id}\" objectId=contentModel.objectId />\
    \
snippet renderCompList\
    <#list contentModel.${1:Component Variable}.item as module>\
        <@renderComponent component=module />\
    </#list>\
    \
snippet loadComps\
   <#list contentModel.${1:Component Variable}.item as myItem>\
        <#assign ${2:component Item} =  siteItemService.getSiteItem(myItem.key) />\
        ${$2.variableName}\
    </#list>\
    \
snippet iter\
   <#list contentModel.${1:variableName}.item as row>\
    	${row.$1}\
    </#list>\
    \
snippet assign\
   <#assign imageSource = contentModel.${1:variableName}!\"${2:defaultValue}\" />\
   ";
    exports.scope = "ftl";

});
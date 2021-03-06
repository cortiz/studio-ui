(function(){tinymce.create("tinymce.plugins.BBCodePlugin",{init:function(f,e){var g=this,h=f.getParam("bbcode_dialect","punbb").toLowerCase();
f.onBeforeSetContent.add(function(b,a){a.content=g["_"+h+"_bbcode2html"](a.content)
});
f.onPostProcess.add(function(b,a){if(a.set){a.content=g["_"+h+"_bbcode2html"](a.content)
}if(a.get){a.content=g["_"+h+"_html2bbcode"](a.content)
}})
},getInfo:function(){return{longname:"BBCode Plugin",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/bbcode",version:tinymce.majorVersion+"."+tinymce.minorVersion}
},_punbb_html2bbcode:function(d){d=tinymce.trim(d);
function c(b,a){d=d.replace(b,a)
}c(/<a.*?href=\"(.*?)\".*?>(.*?)<\/a>/gi,"[url=$1]$2[/url]");
c(/<font.*?color=\"(.*?)\".*?class=\"codeStyle\".*?>(.*?)<\/font>/gi,"[code][color=$1]$2[/color][/code]");
c(/<font.*?color=\"(.*?)\".*?class=\"quoteStyle\".*?>(.*?)<\/font>/gi,"[quote][color=$1]$2[/color][/quote]");
c(/<font.*?class=\"codeStyle\".*?color=\"(.*?)\".*?>(.*?)<\/font>/gi,"[code][color=$1]$2[/color][/code]");
c(/<font.*?class=\"quoteStyle\".*?color=\"(.*?)\".*?>(.*?)<\/font>/gi,"[quote][color=$1]$2[/color][/quote]");
c(/<span style=\"color: ?(.*?);\">(.*?)<\/span>/gi,"[color=$1]$2[/color]");
c(/<font.*?color=\"(.*?)\".*?>(.*?)<\/font>/gi,"[color=$1]$2[/color]");
c(/<span style=\"font-size:(.*?);\">(.*?)<\/span>/gi,"[size=$1]$2[/size]");
c(/<font>(.*?)<\/font>/gi,"$1");
c(/<img.*?src=\"(.*?)\".*?\/>/gi,"[img]$1[/img]");
c(/<span class=\"codeStyle\">(.*?)<\/span>/gi,"[code]$1[/code]");
c(/<span class=\"quoteStyle\">(.*?)<\/span>/gi,"[quote]$1[/quote]");
c(/<strong class=\"codeStyle\">(.*?)<\/strong>/gi,"[code][b]$1[/b][/code]");
c(/<strong class=\"quoteStyle\">(.*?)<\/strong>/gi,"[quote][b]$1[/b][/quote]");
c(/<em class=\"codeStyle\">(.*?)<\/em>/gi,"[code][i]$1[/i][/code]");
c(/<em class=\"quoteStyle\">(.*?)<\/em>/gi,"[quote][i]$1[/i][/quote]");
c(/<u class=\"codeStyle\">(.*?)<\/u>/gi,"[code][u]$1[/u][/code]");
c(/<u class=\"quoteStyle\">(.*?)<\/u>/gi,"[quote][u]$1[/u][/quote]");
c(/<\/(strong|b)>/gi,"[/b]");
c(/<(strong|b)>/gi,"[b]");
c(/<\/(em|i)>/gi,"[/i]");
c(/<(em|i)>/gi,"[i]");
c(/<\/u>/gi,"[/u]");
c(/<span style=\"text-decoration: ?underline;\">(.*?)<\/span>/gi,"[u]$1[/u]");
c(/<u>/gi,"[u]");
c(/<blockquote[^>]*>/gi,"[quote]");
c(/<\/blockquote>/gi,"[/quote]");
c(/<br \/>/gi,"\n");
c(/<br\/>/gi,"\n");
c(/<br>/gi,"\n");
c(/<p>/gi,"");
c(/<\/p>/gi,"\n");
c(/&nbsp;|\u00a0/gi," ");
c(/&quot;/gi,'"');
c(/&lt;/gi,"<");
c(/&gt;/gi,">");
c(/&amp;/gi,"&");
return d
},_punbb_bbcode2html:function(d){d=tinymce.trim(d);
function c(b,a){d=d.replace(b,a)
}c(/\n/gi,"<br />");
c(/\[b\]/gi,"<strong>");
c(/\[\/b\]/gi,"</strong>");
c(/\[i\]/gi,"<em>");
c(/\[\/i\]/gi,"</em>");
c(/\[u\]/gi,"<u>");
c(/\[\/u\]/gi,"</u>");
c(/\[url=([^\]]+)\](.*?)\[\/url\]/gi,'<a href="$1">$2</a>');
c(/\[url\](.*?)\[\/url\]/gi,'<a href="$1">$1</a>');
c(/\[img\](.*?)\[\/img\]/gi,'<img src="$1" />');
c(/\[color=(.*?)\](.*?)\[\/color\]/gi,'<font color="$1">$2</font>');
c(/\[code\](.*?)\[\/code\]/gi,'<span class="codeStyle">$1</span>&nbsp;');
c(/\[quote.*?\](.*?)\[\/quote\]/gi,'<span class="quoteStyle">$1</span>&nbsp;');
return d
}});
tinymce.PluginManager.add("bbcode",tinymce.plugins.BBCodePlugin)
})();
(function(){tinymce.create("tinymce.plugins.AutolinkPlugin",{init:function(e,d){var f=this;
e.onKeyDown.addToTop(function(b,a){if(a.keyCode==13){return f.handleEnter(b)
}});
if(tinyMCE.isIE){return
}e.onKeyPress.add(function(b,a){if(a.which==41){return f.handleEclipse(b)
}});
e.onKeyUp.add(function(b,a){if(a.keyCode==32){return f.handleSpacebar(b)
}})
},handleEclipse:function(b){this.parseCurrentLine(b,-1,"(",true)
},handleSpacebar:function(b){this.parseCurrentLine(b,0,"",true)
},handleEnter:function(b){this.parseCurrentLine(b,-1,"",false)
},parseCurrentLine:function(t,y,A,v){var B,w,z,o,r,p,u,x,s;
B=t.selection.getRng(true).cloneRange();
if(B.startOffset<5){x=B.endContainer.previousSibling;
if(x==null){if(B.endContainer.firstChild==null||B.endContainer.firstChild.nextSibling==null){return
}x=B.endContainer.firstChild.nextSibling
}s=x.length;
B.setStart(x,s);
B.setEnd(x,s);
if(B.endOffset<5){return
}w=B.endOffset;
o=x
}else{o=B.endContainer;
if(o.nodeType!=3&&o.firstChild){while(o.nodeType!=3&&o.firstChild){o=o.firstChild
}if(o.nodeType==3){B.setStart(o,0);
B.setEnd(o,o.nodeValue.length)
}}if(B.endOffset==1){w=2
}else{w=B.endOffset-1-y
}}z=w;
do{B.setStart(o,w>=2?w-2:0);
B.setEnd(o,w>=1?w-1:0);
w-=1
}while(B.toString()!=" "&&B.toString()!=""&&B.toString().charCodeAt(0)!=160&&(w-2)>=0&&B.toString()!=A);
if(B.toString()==A||B.toString().charCodeAt(0)==160){B.setStart(o,w);
B.setEnd(o,z);
w+=1
}else{if(B.startOffset==0){B.setStart(o,0);
B.setEnd(o,z)
}else{B.setStart(o,w);
B.setEnd(o,z)
}}var p=B.toString();
if(p.charAt(p.length-1)=="."){B.setEnd(o,z-1)
}p=B.toString();
u=p.match(/^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.|(?:mailto:)?[A-Z0-9._%+-]+@)(.+)$/i);
if(u){if(u[1]=="www."){u[1]="http://www."
}else{if(/@$/.test(u[1])&&!/^mailto:/.test(u[1])){u[1]="mailto:"+u[1]
}}r=t.selection.getBookmark();
t.selection.setRng(B);
tinyMCE.execCommand("createlink",false,u[1]+u[2]);
t.selection.moveToBookmark(r);
t.nodeChanged();
if(tinyMCE.isWebKit){t.selection.collapse(false);
var q=Math.min(o.length,z+1);
B.setStart(o,q);
B.setEnd(o,q);
t.selection.setRng(B)
}}},getInfo:function(){return{longname:"Autolink",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autolink",version:tinymce.majorVersion+"."+tinymce.minorVersion}
}});
tinymce.PluginManager.add("autolink",tinymce.plugins.AutolinkPlugin)
})();
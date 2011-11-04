;(function($) {
  var jQuery = $;

  var DEBUG = true;

  debug = function(msg,obj) {

    if(!DEBUG)
      return false;

    if(window.location.href.indexOf("DEBUG") == -1 && !window.location.href.match(/localhost.storify.com/))
      return false;

    if(!obj)
      obj = '';

    if(window.console && console && console.log)
      console.log(msg,obj);

    return true;
  };
  
  error = function(msg,obj) {

    if(!DEBUG)
      return false;

    if(!obj)
      obj = '';

    if(window.console && console && console.error)
      console.error(msg,obj);

    return true;
  };

  require = function(jsfile,callback) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src", jsfile);
    if(typeof callback == 'function') {
      script_tag.onload = callback;
      script_tag.onreadystatechange = function () { // IE
      if (this.readyState == 'complete' || this.readyState == 'loaded') {
        callback();
        }
      };
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  };

  String.prototype.truncate = function(length, chr, wordonly){
    var str = this;
    chr = chr || '…';
    if (str.length <= length) return str;
    str = str.substr(0, length - chr.length);
    if (wordonly) {
      str = str.substr(0, str.lastIndexOf(' '));
    }
    return str + chr;
  };

  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  };

  String.prototype.inArray = function(array) {
    for (var i=0, len=array.length; i < len; i++) {
      if(array[i]==this)
        return true;
    };
    return false;
  };
  
  String.prototype.linkify = function() {
    var exp = /[^(href=")](\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return this.replace(exp," <a href='$1' target='_blank' rel='external'>$1</a>");
  }
  
  String.prototype.sanitizeTags = function(allowed) {
    // Strips HTML and PHP tags from a string
    allowed = (((allowed || "") + "")
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<![\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    // Removing <style>.*</style> and <script>.*</script>
    var result = this.replace(/\n/g,'\uffff').replace(/(<style.*?>)(.*)(<\/style>)/gi, '').replace(/(<script.*?>)(.*)(<\/script>)/gi, '').replace(/\uffff/g,'\n');

    result = result.replace(commentsAndPhpTags, '').replace(tags, function($0, $1){
      if ($0.toLowerCase().substring(0,2) == '<a'){
        var href=$0.match(/href=[\'"]?([^\'" >]+)/i)[1];
        $0 = $0.indexOf(' ') > -1 ? $0.substr(0,$0.indexOf(' '))+'>' : $0;
        $0 = $0.substring(0, $0.length-1) + ' href="' + href + '">';        
      } else {
        $0 = $0.indexOf(' ') > -1 ? $0.substr(0,$0.indexOf(' '))+'>' : $0;
      }
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
    
    return result;
  };

  if(typeof Storify!='object') {
    Storify = {};
  }
  if(typeof Storify.utils!='object') {
    Storify.utils = {};
  }
  
  /* MixPanel code */
  var MixpanelLib=function(q,r){var s={},super_props_loaded=false;s.config={cross_subdomain_cookie:true,cookie_name:"mp_super_properties",test:false,store_google:false,debug:false};s.super_properties={"all":{},"events":{},"funnels":{}};s.funnels={};s.send_request=function(a,b){var c=s.callback_fn;if(a.indexOf("?")>-1){a+="&callback="}else{a+="?callback="}a+=c+"&";if(b){a+=s.http_build_query(b)}if(s.config.test){a+='&test=1'}a+='&_='+new Date().getTime().toString();var d=document.createElement("script");d.setAttribute("src",a);d.setAttribute("type","text/javascript");var e=document.getElementsByTagName("head")[0]||document.documentElement;e.insertBefore(d,e.firstChild)};s.track_funnel=function(a,b,c,d,e){if(!d){d={}}d.funnel=a;d.step=parseInt(b,10);d.goal=c;s.track('mp_funnel',d,e,"funnels")};s.get_query_param=function(a,b){b=b.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var c="[\\?&]"+b+"=([^&#]*)";var d=new RegExp(c);var e=d.exec(a);if(e===null||(e&&typeof(e[1])!='string'&&e[1].length)){return''}else{return unescape(e[1]).replace(/\+/g,' ')}};s.track=function(a,b,c,d){s.load_super_once();if(!d){d="events"}if(!b){b={}}if(!b.token){b.token=s.token}if(c){s.callback=c}b.time=s.get_unixtime();s.save_campaign_params();s.save_search_keyword();var p;if(d!="all"){for(p in s.super_properties[d]){if(!b[p]){b[p]=s.super_properties[d][p]}}}if(s.super_properties.all){for(p in s.super_properties.all){if(!b[p]){b[p]=s.super_properties.all[p]}}}var e={'event':a,'properties':b};var f=s.base64_encode(s.json_encode(e));if(s.config.debug){if(window.console){console.log("-------------- REQUEST --------------");console.log(e)}}s.send_request(s.api_host+'/track/',{'data':f,'ip':1});s.track_predefined_funnels(a,b)};s.identify=function(a){s.register_once({'distinct_id':a},'all',null,30)};s.register_once=function(a,b,c,d){s.load_super_once();if(!b||!s.super_properties[b]){b="all"}if(!c){c="None"}if(!d){d=7}if(a){for(var p in a){if(a.hasOwnProperty(p)){if(!s.super_properties[b][p]||s.super_properties[b][p]==c){s.super_properties[b][p]=a[p]}}}}if(s.config.cross_subdomain_cookie){s.clear_old_cookie()}s.set_cookie(s.config.cookie_name,s.json_encode(s.super_properties),d,s.config.cross_subdomain_cookie)};s.register=function(a,b,c){s.load_super_once();if(!b||!s.super_properties[b]){b="all"}if(!c){c=7}if(a){for(var p in a){if(a.hasOwnProperty(p)){s.super_properties[b][p]=a[p]}}}if(s.config.cross_subdomain_cookie){s.clear_old_cookie()}s.set_cookie(s.config.cookie_name,s.json_encode(s.super_properties),c,s.config.cross_subdomain_cookie)};s.http_build_query=function(a,b){var c,use_val,use_key,i=0,tmp_arr=[];if(!b){b='&'}for(c in a){if(c){use_val=encodeURIComponent(a[c].toString());use_key=encodeURIComponent(c);tmp_arr[i++]=use_key+'='+use_val}}return tmp_arr.join(b)};s.get_unixtime=function(){return parseInt(new Date().getTime().toString().substring(0,10),10)};s.jsonp_callback=function(a){if(s.callback){s.callback(a);s.callback=false}};s.json_encode=function(j){var l;var m=j;var i;var n=function(b){var d=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;var e={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};d.lastIndex=0;return d.test(b)?'"'+b.replace(d,function(a){var c=e[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+b+'"'};var o=function(a,b){var c='';var d='    ';var i=0;var k='';var v='';var e=0;var f=c;var g=[];var h=b[a];if(h&&typeof h==='object'&&typeof h.toJSON==='function'){h=h.toJSON(a)}switch(typeof h){case'string':return n(h);case'number':return isFinite(h)?String(h):'null';case'boolean':case'null':return String(h);case'object':if(!h){return'null'}c+=d;g=[];if(Object.prototype.toString.apply(h)==='[object Array]'){e=h.length;for(i=0;i<e;i+=1){g[i]=o(i,h)||'null'}v=g.length===0?'[]':c?'[\n'+c+g.join(',\n'+c)+'\n'+f+']':'['+g.join(',')+']';c=f;return v}for(k in h){if(Object.hasOwnProperty.call(h,k)){v=o(k,h);if(v){g.push(n(k)+(c?': ':':')+v)}}}v=g.length===0?'{}':c?'{'+g.join(',')+''+f+'}':'{'+g.join(',')+'}';c=f;return v}};return o('',{'':m})};s.base64_encode=function(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var c,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!a){return a}a=s.utf8_encode(a+'');do{c=a.charCodeAt(i++);o2=a.charCodeAt(i++);o3=a.charCodeAt(i++);bits=c<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b.charAt(h1)+b.charAt(h2)+b.charAt(h3)+b.charAt(h4)}while(i<a.length);enc=tmp_arr.join('');switch(a.length%3){case 1:enc=enc.slice(0,-2)+'==';break;case 2:enc=enc.slice(0,-1)+'=';break}return enc};s.utf8_encode=function(a){a=(a+'').replace(/\r\n/g,"\n").replace(/\r/g,"\n");var b="";var c,end;var d=0;c=end=0;d=a.length;for(var n=0;n<d;n++){var e=a.charCodeAt(n);var f=null;if(e<128){end++}else if((e>127)&&(e<2048)){f=String.fromCharCode((e>>6)|192)+String.fromCharCode((e&63)|128)}else{f=String.fromCharCode((e>>12)|224)+String.fromCharCode(((e>>6)&63)|128)+String.fromCharCode((e&63)|128)}if(f!==null){if(end>c){b+=a.substring(c,end)}b+=f;c=end=n+1}}if(end>c){b+=a.substring(c,a.length)}return b};s.set_cookie=function(a,b,c,d){var e=new Date(),domain=((d)?s.parse_domain(document.location.hostname):""),cookiestring=a+"="+escape(b);e.setDate(e.getDate()+c);cookiestring+=((c===null)?"":";expires="+e.toGMTString());cookiestring+="; path=/";cookiestring+=((domain)?";domain=."+domain:"");document.cookie=cookiestring};s.get_cookie=function(a){var b,c_end;if(document.cookie.length>0){if(document.cookie.match('^'+a+'=')){b=0}else{b=document.cookie.search('; '+a+'=');if(b!=-1){b+=2}}if(b!=-1){b=b+a.length+1;c_end=document.cookie.indexOf(";",b);if(c_end==-1){c_end=document.cookie.length}return unescape(document.cookie.substring(b,c_end))}}return""};s.delete_cookie=function(a,b){s.set_cookie(a,'',-1,b)};s.parse_domain=function(a){var b=a.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i);return b?b[0]:''};s.get_super=function(){var a=eval('('+s.get_cookie(s.config.cookie_name)+')');if(a){for(var i in a){if(a.hasOwnProperty(i)){s.super_properties[i]=a[i]}}}return s.super_properties};s.load_super_once=function(){if(!super_props_loaded){try{s.get_super();super_props_loaded=true}catch(err){}}};s.register_funnel=function(a,b){s.funnels[a]=b};s.track_predefined_funnels=function(a,b){if(a&&s.funnels){for(var c in s.funnels){if(s.funnels.hasOwnProperty(c)){for(var i=0;i<s.funnels[c].length;++i){if(s.funnels[c][i]){if(s.funnels[c][i]==a){s.track_funnel(c,i+1,a,b)}}}}}}};s.save_campaign_params=function(){s.campaign_params_saved=s.campaign_params_saved||false;if(s.config.store_google&&!s.campaign_params_saved){var a=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'],kw='',params={};for(var b=0;b<a.length;b++){kw=s.get_query_param(document.URL,a[b]);if(kw.length){params[a[b]]=kw}}s.register_once(params);s.campaign_params_saved=true}};s.save_search_keyword=function(){if(document.referrer.search('http://(.*)google.com')===0){var a=s.get_query_param(document.referrer,'q');if(a.length){s.register({'mp_keyword':a},'all')}}};s.clear_old_cookie=function(){s.delete_cookie(s.config.cookie_name,false);s.set_cookie(s.config.cookie_name,s.json_encode(s.super_properties),7,true)};s.set_config=function(a){for(var c in a){if(a.hasOwnProperty(c)){s.config[c]=a[c]}}};var t=(("https:"==document.location.protocol)?"https://":"http://");s.token=q;s.api_host=t+'api.mixpanel.com';if(r){s.callback_fn=r+'.jsonp_callback'}else{s.callback_fn='mpmetrics.jsonp_callback'}return s};if(typeof mpq!='undefined'&&mpq&&mpq[0]&&mpq[0][0]=='init'){mpq.metrics=new MixpanelLib(mpq[0][1],"mpq.metrics");mpq.push=function(a){if(a){if(typeof a=='function'){a()}else if(a.constructor==Array){var f=mpq.metrics[a[0]];if(typeof f=='function'){f.apply(mpq.metrics,a.slice(1))}}}};for(var i=1;i<mpq.length;i++){mpq.push(mpq[i])}mpq.length=0}
  /* End of MixPanel code */

  Storify.events = new MixpanelLib('11de52e82b68346dc3d35f6eb817a45f', 'Storify.events');

  jQuery(window).unbind('storifyEvent'); // Avoiding conflict on storify.com/* pages where we already bind that event
  jQuery(window).bind('storifyEvent',function(event) {
    debug("storifyEvent> "+event.name,event.metadata);
    Storify.events.track(event.name,event.metadata);
  });

  Storify.recordEvent = function(event, value, metadata) {

    if(metadata) {
      metadata.value = value;
    }
    else {
      metadata = {
        view:window.location.href,
        value:value
        };
    }
    
    jQuery(window).trigger({
      type:'storifyEvent',
      name:event,
      metadata: metadata
      });
  } 
  
  Storify.getLinkToElement = function(elementPermalink) {
    if(!elementPermalink) return false;
    
    var linkUrl, element;

    // We make sure the elementPermalink exists:
    element = $("li.element[permalink='"+elementPermalink+"']");
    if(!element) return false;
    
    // If we are creating a new story, we use the permalink of the story dom object
    if(window.location.href.match(/\/story\/new$/))
      linkUrl = $("#story").attr("data-permalink");
    // If we are currently editing the story, we use the story url, otherwise we use current window url
    linkUrl = (window.location.href.match(/\/edit$/)) ? window.location.href.replace(/\/edit$/,'') : window.top.location.href;

    if(linkUrl.indexOf('#')>10)
      linkUrl = linkUrl.replace(/#.*/,'');
      
    linkUrl+='#storify/p'+element.attr("id").substr(5);
		debug("Linkurl: ",linkUrl);

    return linkUrl;
  }
  
  Storify.utils.queryStringToObject = function(queryString) {
    if(!queryString) return {};
    if(queryString.indexOf('=')===-1) return {};
    
    var paramsArray = queryString.split('&');
    var params = {};
    for (var i=0, len=paramsArray.length; i < len; i++) {
      var p = paramsArray[i];
      var r = p.split('=');
      if(r.length>1)
      params[r[0]] = r[1];
    };
    return params;
  }
  
  Storify.utils.alert = function(msg) {
    Storify.recordEvent("alert",msg);
    alert(msg);
  }
  
  Storify.utils.cloneObject = function(obj) {
    return $.extend(true, {}, obj);
  };
  
  /* Takes a date as a string and
   * returns the date as a (int) timestamp in epoch (in number of seconds, not ms)
   */
  Storify.utils.getDate = function(dateStr) {
    var d;
    dateStr = (typeof dateStr == 'undefined') ? '' : ''+dateStr; // Make sure it is a string
    if(dateStr.length > 3 && dateStr.substr(10,1)=="T") {
      dateStr = dateStr.substring(0,19).replace('T',' ').replace(/\-/g,'/');
      d   = new Date(dateStr);
      d   = Math.round((d.getTime() - (d.getTimezoneOffset()*60*1000)) /1000);
    }
    else {
      if(dateStr.length==10)
        return dateStr;
        
      d   = (dateStr.length > 0) ? new Date(dateStr) : new Date();
      // Math.round((new Date(tweet.created_at)).getTime()/1000);
      d   = Math.round((d.getTime()) /1000);
    }
    return d;
  };
  
  Storify.utils.displayNumber = function(number) {
    var number = parseInt(number), res='';
    if(number > 0) {
      if(number>1000000) 
        return Math.round(number/100)/10+"M";
      if(number>1000) 
        return Math.round(number/100)/10+"k";
      return number;
    }
    return false;
  };
  
  Storify.utils.displayDate = function(date, relative, showTime) {
    if (typeof showTime == 'undefined') var showTime = true;
    
    if(typeof date == 'undefined' || date == 'NaN' || isNaN(date))
      return '';

    var date = ''+date;

    if(parseInt(date,10) > 0) {
      if(date.length==10) {
        date = parseInt(date,10)*1000;
      }
    } else {
      // Date string are not as flexible on Webkit than Gecko...
      if(date.substr(10,1)=='T') {
        if(date.substr(date.length-1,1)=='Z') {
          date = Date.UTC(parseInt(date.substr(0,4),10),parseInt(date.substr(5,2),10)-1,parseInt(date.substr(8,2),10),parseInt(date.substr(11,2),10),parseInt(date.substr(14,2),10),parseInt(date.substr(17,2),10));
        } else {
          date = (date.substr(16,1)==':') ? date.substr(0,19) : date.substr(0,16);
          date = date.replace('T',' ').replace(/\-/g,'/');
        }
      }
    }
        
    var j=new Date();
    var f=new Date(date);

    //if(B.ie) { f = Date.parse(h.replace(/( \+)/," UTC$1")) }

    if(relative) {
      var i=j-f;
      var c=1000,d=c*60,e=d*60,g=e*24,b=g*7;

      if(isNaN(i)||i<0){return"";}
      if(i<c*7){return"right now";}
      if(i<d){return Math.floor(i/c)+" seconds ago";}
      if(i<d*2){return"about 1 minute ago";}
      if(i<e){return Math.floor(i/d)+" minutes ago";}
      if(i<e*2){return"about 1 hour ago";}
      if(i<g){return Math.floor(i/e)+" hours ago";}
      //if(i>g&&i<g*2){return"yesterday"}
      //if(i<g*365){return Math.floor(i/g)+" days ago"}
    }
  
    var m_names = new Array("January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December");

    var curr_date = f.getDate();
    var curr_month = f.getMonth();
    var curr_year = f.getFullYear();
    var curr_minutes = f.getMinutes();
    if(curr_minutes<10) curr_minutes = '0'+curr_minutes;

    var result = m_names[curr_month] + " "+curr_date+", " + curr_year;
    if (showTime) result += ' at '+f.getHours()+':'+curr_minutes;

    return result;
  };

  Storify.utils.getDomain = function(url) {
  
    var domain        = url.replace(/^(https?:\/\/)(www\.)?/i,'');
    domain          = domain.replace(/\/.*/g,'');
  
    return domain;
  
  };

  Storify.utils.getDomainName = function(url) {
  
    var domain = Storify.utils.getDomain(url);
  
    return domain.substr(0,domain.indexOf('.'));
  
  };
  
  Storify.utils.isiPad = function() {
    return (navigator.userAgent.match(/iPad/i));
  }

  var permalink = window.location.href, env='';
  if(permalink.indexOf('storify.com') > -1) {
    env = permalink.substr(7,permalink.indexOf('storify.com')-8);
  }
  
  if(typeof STORIFY_BASE_URL == 'undefined') {
    
    STORIFY_BASE_URL = '';

    switch(env) {
      case 'dvl':
        STORIFY_BASE_URL = 'http://dvl.storify.com';
        break;

      case 'localhost':
        STORIFY_BASE_URL = 'http://localhost.storify.com:3000';
        break;

      case "staging":
        STORIFY_BASE_URL = 'http://staging.storify.com';
        break;

      case "app1":
        STORIFY_BASE_URL = 'http://app1.storify.com';
        break;

      default:
        STORIFY_BASE_URL = 'http://storify.com';
        break;
    } 
  }

  Storify.utils.base_url = STORIFY_BASE_URL;
  
  Storify.utils.getExtension = function(u) {
     if(!u.match(/\.[a-z]{3,4}$/i))
       return false;

     return u.substr(u.lastIndexOf('.')+1).toLowerCase();
   };

  Storify.utils.getImage = function(u) {
    domain = u.replace(/^(https?:\/\/)(www\.)?/i,'');
    domain = domain.replace(/\/.*/g,'').toLowerCase();
    u = u.replace(/\/$/,'');
    var thumbnail_url=null;

    switch(domain) {
      case 'twitpic.com':
        hash = u.substr(u.lastIndexOf('/')+1);
        thumbnail_url = 'http://twitpic.com/show/large/'+hash;
        break;
        
      case 'instagr.am':
        thumbnail_url = u+'/media';
        break;
        
      case 'yfrog.com':
        thumbnail_url = u+':iphone';
        break;
        
      case 'moby.to':
      thumbnail_url = u+':view';
        break;
      
      case 'p.twimg.com':
        thumbnail_url = u;
        break;
        
      case 'plixi.com': case 'tweetphoto.com': case 'pic.gd': case 'lockerz.com':
        // thumbnail_url = 'http://TweetPhotoAPI.com/api/TPAPI.svc/imagefromurl?size=medium&url=' + u;
        thumbnail_url = 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url='+u;
        break;
    }

    return thumbnail_url;
  };
  
  Storify.utils.parseFirstURL = function(str) {
    var urlexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

    var matches = str.match(urlexp);

    if(!matches)
      return;

    return matches[0];
  };

  Storify.utils.require = function(jsfile,callback) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src", jsfile);
    if(typeof callback == 'function') {
      script_tag.onload = callback;
      script_tag.onreadystatechange = function () { // IE
      if (this.readyState == 'complete' || this.readyState == 'loaded') {
        callback();
        }
      };
    }
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  };

  Storify.utils.getUrls = function(str) {
    var urlexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    
    return str.match(urlexp);
  };

  Storify.utils.isURL = function(s) {
    var regexp = /http:\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}/;
      return regexp.test(s);
  };
  
  Storify.utils.getMetadata = function(u,elementClass,callback) {
  
    if(!callback && typeof elementClass == 'function') {
      callback = elementClass;
      elementClass = 'all';
    }
    
    if(elementClass=='image') {
      var image;
      if(image = Storify.utils.getImage(u))
        callback({shorturl: u,thumbnail_url:image,elementClass:'image'});
      else
        return false;
    }
    else {        
        debug('calling embedly for '+u);
        $.getJSON('http://pro.embed.ly/1/objectify?key=1e6a1a1efdb011df84894040444cdc60&callback=?',{url:u},function(json) {
          json.shorturl = u;
          debug('Embedly for '+u,json);
          callback(json);
      }); 
    }
    return true;
  };


  function awesm_share(channel, url, title, content) {
            
    /* You must specify a valid awe.sm API Key */
    var awesm_api_key = 'ee29be1333cc45d8c6545341be8df5a4ab9126f3566b6777ad98ab1a2863ac78';

    /* You can optionally specify a 'Source' value for LinkedIn (e.g.
           * the name of your site). If left blank, it will be user-defined.
     */
    var linkedin_source = '';
      
    /* This value corresponds to Tool/create_type on awe.sm. You can
     * optionally change it to something more specific to your site.
     * However, please use the recommended construction of {site}-{tool}.
     */
    var awesm_tool = 'awesm-share-js';
      
    /* This function is used to search for awe.sm Parent parameters in the
     * current page URL. You must have this feature enabled in your awe.sm
     * Account Settings for the awe.sm Parent parameters to be present.
     */
    var getUrlVars = function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    };
      
    /* If no URL is specified, use the current page address */
    if (typeof(url) == 'undefined' || url == '') {
      url = encodeURIComponent(location.href);
    } else {
      url=encodeURIComponent(url);
    }
    
    /* If no title is specified, use the current page title */
    if (typeof(title) == 'undefined' || title == '') {
      title = encodeURIComponent(document.title);
    } else {
      title=encodeURIComponent(title);
    }
      
    /* If no content is specified, use title */
    if (typeof(content) == 'undefined' || content == '') {
      content = title;
    } else {
      content=encodeURIComponent(content);
    }     
    
    /* Configure the channel-specific information */
    switch (channel) {
      case 'twitter':
          var awesm_channel = 'twitter';
        /* Make sure the content is <120 characters so there's room for the URL */
        if (decodeURIComponent(content).length > '120') {
          content = decodeURIComponent(content).substring(0,117) + '...'; 
          content = encodeURIComponent(content);
        }
        var awesm_destination = 'http://twitter.com/home?status=' + content + '+AWESM_TARGET';
        var window_specs = '';
          break;
      case 'facebook':
          var awesm_channel = 'facebook-post';
        var awesm_destination = 'http://www.facebook.com/sharer.php?u=AWESM_TARGET&t=' + title;
        var window_specs = 'toolbar=0, status=0, width=626, height=436';
          break;
      case 'myspace':
        var awesm_channel = 'myspace';
        var awesm_destination = 'http://www.myspace.com/index.cfm?fuseaction=postto&u=AWESM_TARGET&t=' + title + '&c=' + content;
        var window_specs = 'toolbar=0, status=0, width=825, height=725';
          break;
      case 'linkedin':
        var awesm_channel = 'linkedin';
        var awesm_destination = 'http://www.linkedin.com/shareArticle?mini=true&url=AWESM_TARGET&title=' + title + '&summary=' + content;
        if (linkedin_source !== '') {
          awesm_destination += '&source=' + encodeURIComponent(linkedin_source);
        }
        var window_specs = 'toolbar=0, status=0, width=550, height=570';
          break;
    }
      
    /* Construct the URL for the awe.sm Share API (see http://developers.awe.sm) */
    var awesm_shareit = 'http://create.awe.sm/url/share?version=1&api_key=' + awesm_api_key +
            '&target=' + url + 
            '&share_type=' + awesm_channel + 
            '&create_type=' + awesm_tool + 
            '&destination=' + encodeURIComponent(awesm_destination); 
      
    /* Check for an awe.sm Parent parameter in the current page URL, and
     * add it to the awe.sm Share API URL if present. You must have this
     * feature enabled in your awe.sm Account Settings for the awe.sm
     * Parent parameter to be present.
     */
    var pageParams = getUrlVars();
    if ( pageParams['awesm'] ) {
      awesm_shareit += '&awesm_parent=' + pageParams['awesm'];
    }
      
    /* Launch the share UI in a new window of the correct size*/
    window.open(awesm_shareit, '_blank', window_specs);
  }

  /* 
   * Auto Expanding Text Area (1.2.2)
   * by Chrys Bader (www.chrysbader.com)
   * chrysb@gmail.com
   *
   * Special thanks to:
   * Jake Chapa - jake@hybridstudio.com
   * John Resig - jeresig@gmail.com
   *
   * Copyright (c) 2008 Chrys Bader (www.chrysbader.com)
   * Licensed under the GPL (GPL-LICENSE.txt) license. 
   *
   *
   * NOTE: This script requires jQuery to work.  Download jQuery at www.jquery.com
   *
   */
 
  (function(jQuery) {
      
    var self = null;
 
    jQuery.fn.autogrow = function(o)
    { 
      return this.each(function() {
        new jQuery.autogrow(this, o);
      });
    };
  

      /**
       * The autogrow object.
       *
       * @constructor
       * @name jQuery.autogrow
       * @param Object e The textarea to create the autogrow for.
       * @param Hash o A set of key/value pairs to set as configuration properties.
       * @cat Plugins/autogrow
       */
  
    jQuery.autogrow = function (e, o)
    {
      this.options        = o || {};
      this.dummy          = null;
      this.interval       = null;
      this.line_height      = this.options.lineHeight || parseInt(jQuery(e).css('line-height'));
      this.min_height       = this.options.minHeight || parseInt(jQuery(e).css('min-height'));
      this.max_height       = this.options.maxHeight || parseInt(jQuery(e).css('max-height'));;
      this.textarea       = jQuery(e);
    
      if(this.line_height == NaN)
        this.line_height = 0;
    
      // Only one textarea activated at a time, the one being used
      this.init();
    };
  
    jQuery.autogrow.fn = jQuery.autogrow.prototype = {
      autogrow: '1.2.2'
    };
  
    jQuery.autogrow.fn.extend = jQuery.autogrow.extend = jQuery.extend;
  
    jQuery.autogrow.fn.extend({
             
      init: function() {      
        var self = this;      
        this.textarea.css({overflow: 'hidden', display: 'block'});
        this.textarea.bind('focus', function() { self.startExpand() } ).bind('blur', function() { self.stopExpand() });
        this.checkExpand(); 
      },
             
      startExpand: function() {       
        var self = this;
        this.interval = window.setInterval(function() {self.checkExpand()}, 400);
      },
    
      stopExpand: function() {
        clearInterval(this.interval); 
      },
    
      checkExpand: function() {
      
        if (this.dummy == null)
        {
          this.dummy = jQuery('<div></div>');
          this.dummy.css({
                          'font-size'  : this.textarea.css('font-size'),
                          'font-family': this.textarea.css('font-family'),
                          'width'      : this.textarea.css('width'),
                          'padding'    : this.textarea.css('padding'),
                          'line-height': this.line_height + 'px',
                          'overflow-x' : 'hidden',
                          'position'   : 'absolute',
                          'top'        : 0,
                          'left'     : -9999
                          }).appendTo('body');
        }
      
        // Strip HTML tags
        var html = this.textarea.val().replace(/(<|>)/g, '');
      
        // IE is different, as per usual
        if ($.browser.msie)
        {
          html = html.replace(/\n/g, '<BR>new');
        }
        else
        {
          html = html.replace(/\n/g, '<br>new');
        }
      
        if (this.dummy.html() != html)
        {
          this.dummy.html(html);  
        
          if (this.max_height > 0 && (this.dummy.height() + this.line_height > this.max_height))
          {
            this.textarea.css('overflow-y', 'auto');  
          }
          else
          {
            this.textarea.css('overflow-y', 'hidden');
            if (this.textarea.height() < this.dummy.height() + this.line_height || (this.dummy.height() < this.textarea.height()))
            { 
              this.textarea.animate({height: (this.dummy.height() + this.line_height) + 'px'}, 100);  
            }
          }
        }
      }
     });
  })(jQuery);
})(STORIFY_JQUERY);

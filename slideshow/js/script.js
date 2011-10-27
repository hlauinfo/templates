/*
PARSE URL, USERNAMES AND HASHTAGS FROM A TWEET 
http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript	
*/

if (!Object.keys) {
	Object.keys = function(o) {
		if (o !== Object(o)) {
			throw new TypeError('Object.keys called on non-object');
		}
		var ret=[], p;
		for (p in o) {
			if (Object.prototype.hasOwnProperty.call(o,p)) {
				ret.push(p);
			}
		}
		return ret;
	}
}

String.prototype.parseURL = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return '<a href="'+url+'" target="_blank">'+url+'</a>';
	});
};

String.prototype.parseUsername = function() {
	return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		var username = u.replace("@","")
		return '<a href="http://twitter.com/'+username+'" target="_blank">@'+username+'</a>';
	});
};

String.prototype.parseHashtag = function() {
	return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		var tag = t.replace("#","")
		return '<a href="http://search.twitter.com/search?q=%23'+tag+'" target="_blank">#'+tag+'</a>';
	});
};

/* Avoid cascading */

String.prototype.parseTweet = function() {
	return this.parseURL().parseUsername().parseHashtag();
}

/* SHARING */

function shareOnFacebook(url) {
	window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(url),'sharer','toolbar=0,status=0,resizable=1,width=626,height=436');
}
function shareOnTwitter(url, status) {
	window.open('http://twitter.com/intent/tweet?original_referer='+encodeURIComponent(url)+'&text='+encodeURIComponent(status)+'&url='+encodeURIComponent(url),'sharer','toolbar=0,status=0,resizable=1,width=626,height=436');
}

/* FUNCTIONS */

var total;

function centerItem(item, type) {
	var ml = item.outerWidth()/-2;
	var mt = item.outerHeight()/-2;
	var css = {};
	switch (type) {
		case 'verticalOnly' : css = { top: '50%', marginTop: mt }; break;
		case 'horizontalOnly' : css = { left: '50%', marginLeft: ml }; break;
		case 'both' : css = { left: '50%', top: '50%', marginLeft: ml, marginTop: mt };
	}
	item.css(css);
}

function onbefore(curr, next, opts, fwd) {
	$(next).show();
	centerItem($(next).find('.quote'), 'both');
	centerItem($(next).find('.textP'), 'verticalOnly');
}

function onafter(curr, next, opts) {
	var step = $(next).index()+1;
	updateStep(step);
}

function onPrevNextEvent(fwd, index) {
  if(index==0) return;
	(fwd) ? storify.record("next") : storify.record("prev");  
}

function replaySlideshow() {
	$('#toolbar .pause').hide();
	$('#toolbar .play').show();
	$("#twitterShow").cycle(0);
}

function resumeSlideshow() {
	$('#toolbar .pause').show();
	$('#toolbar .play').hide();
	$("#twitterShow").cycle("resume");
}

function pauseSlideshow() {
	$('#toolbar .pause').hide();
	$('#toolbar .play').show();
	$("#twitterShow").cycle("pause");
}

function toggleSlideshow() {
	$('#toolbar .pause').toggle();
	$('#toolbar .play').toggle();
	$("#twitterShow").cycle("toggle");
}

function showLoop() {
	$('.pager .total').text(total-1);
	$('#toolbar .pause, #toolbar .play, #toolbar .previous, #toolbar .next').hide();
	$('#toolbar .loop').show();
	$("#twitterShow").cycle("resume");
}

function hideLoop() {
	$('.pager .total').text(total);
	pauseSlideshow();
	$('#toolbar .loop').hide();
	$('#toolbar .previous, #toolbar .next').show();
	clearTimeout(back);
}

function penultimateLoop() {
	$('#twitterShow').cycle("pause");
	back = setTimeout(function() {
		$('#twitterShow').cycle(0);
		$('#twitterShow').cycle("resume");
	}, 5000);
}

var loop = false, back;

function toggleLoop() {
	var step = parseInt($('.current').text());
	if (loop) {
		hideLoop();
		if (step == 1) {
			$('#toolbar .previous').hide();
		}
	}
	else {
		if (step < total) {
			showLoop();
			if (step == total-1) {
				penultimateLoop();
			}
		}
	}
	loop = !loop;
}

function checkKey(e) {
	var key = (e.keyCode ? e.keyCode : e.which);

	if (loop && key != 76) {
		hideLoop();
		loop = !loop;
	}
	switch (key) {
		case 37: // left
			$("#twitterShow").cycle("prev");
			break;
		case 39: // right
			$("#twitterShow").cycle("next");
			break;
		case 76: // l
			toggleLoop();
			break;
		case 80: // p
			toggleSlideshow();
			break;
		
	}
}

$(document).keydown(checkKey);

$("#twitterShow").touchwipe({
	wipeLeft: function() {
		$("#twitterShow").cycle("next");
	},
	wipeRight: function() {
		$("#twitterShow").cycle("prev");
	}
});

var hash = window.location.hash;
var permalink_token = hash.split("#")[1];

$(".timeago").timeago();

var previous_id = '';
var previous_length = 0;

function getStoryElementHTML(element) {	  
	var layout = '<div class="slideWrapper '+element.elementClass+'Element">';
  	  
	switch (element.elementClass) {
		
		case "video":
			if (element.source == "youtube") {
				var youtubeVideoID = element.permalink.replace("http://www.youtube.com/watch?v=",'');
				layout += '<object width="100%" height="100%">\n\
				<param name="movie" value="http://www.youtube.com/v/'+youtubeVideoID+'?fs=1&autoplay=1&controls=0"</param>\n\
				<param name="allowFullScreen" value="true"></param>\n\
				<param name="allowScriptAccess" value="always"></param>\n\
				<embed src="http://www.youtube.com/v/'+youtubeVideoID+'?fs=1&autoplay=1&controls=0"\n\
					type="application/x-shockwave-flash"\n\
					allowfullscreen="true"\n\
					allowscriptaccess="always"\n\
					width="100%" height="100%">\n\
				</embed>\n\
				</object>';

				layout += '<iframe id="player" type="text/html" width="100%" height="100%"\n\
				src="http://www.youtube.com/embed/u1zgFlCw8Aw?enablejsapi=1&origin=storify.com"\n\
				frameborder="0">';
			}
			break;
			
		case "image":
			var imgUrl = element.image.src;
			layout += '<img class="photoSlide" src="' + imgUrl + '" /><aside class="attribution"><p class="' + element.source + '"><i></i>' + element.description + '<br /><span>Photo by <a href="' + imgUrl + '" target="_blank">' + element.author.name + '</a></span></p></aside>';
			break;
			
		case "text":
			layout += '<p class="textP"><span>'+element.description.sanitizeTags('<a>')+'</span></p>';		  
			break;
			
		case "website":
		case "quote":
			var title = (element.author.name) ? element.author.name : element.title;
			var template = '<div class="quote"><p>' + element.description + '</p><aside><div class="website"><img src="' + element.favicon + '" /><a href="' + element.permalink + '" target="_blank">' + title + '</a></div></aside></div>';
			layout += template + '</div>';
			break;
			
		case "fbpost":
			var template = '<div class="quote"><p>' + element.description + '</p><aside><div class="avatar_container"><a href="#"><img src="' + element.author.avatar + '" /></a></div><div class="username_container"><div class="username"><a href="' + element.permalink + '" target="_blank">' + element.author.name + '</a></div></div>';
			template += '<div class="date_actions"><div class="date"><a href="' + element.permalink + '" target="_blank">' + Storify.utils.displayDate(element.created_at) + '</a></aside></div></div>';
			layout += template + '</div>';
			break;
			
		case "tweet":
			element.metadata = element.metadata || {};
			element.metadata.user = element.metadata.user || {};
			element.metadata.user.name = element.metadata.user.name || '';

			var tweet_id = element.permalink.substr(element.permalink.lastIndexOf('/')+1);
			
			var urls, image_url;
			var imageShortURL = Storify.utils.parseFirstURL(element.description);
			var image_url = (imageShortURL) ? Storify.utils.getImage(imageShortURL) : null;

			var repeat = (element.metadata.user.profile_background_tile === "true") ? 'repeat' : 'no-repeat';
			var bg_image =  (element.metadata.user.profile_background_image_url) ? ' url('+element.metadata.user.profile_background_image_url+') '+repeat : '';
			var bg_color = (element.metadata.user.profile_background_color) ? '#'+element.metadata.user.profile_background_color : '#000';
			
			var background = 'background:'+bg_color+bg_image+';';
			var template = '<div class="quote_container" style="'+background+'"><div class="quote_container_inner">';
			
			if (image_url) {									
				template += '<img class="photoSlide" src="' + image_url + '" /><aside class="attribution"><a href="http://twitter.com/' + element.author.username + '" target="_blank" class="avatar"><img src="' + element.author.avatar + '" /></a><p class="' + element.source + '">' + element.description.parseTweet() + '<br /><span>Photo by <a href="' + element.permalink + '" target="_blank">' + element.author.username + '</a></span></p></aside>'
			}
			else {
				template += '<div class="quote"><p>' + element.description.parseTweet() + '<span class="arrow"></span></p><aside><div class="avatar_container"><a href="http://twitter.com/' + element.author.username + '" target="_blank"><img src="' + element.author.avatar + '" /></a></div><div class="username_container"><div class="username"><a href="http://twitter.com/' + element.author.username + '" target="_blank">' + element.author.username + '</a></div><div class="name">' + element.metadata.user.name + '</div></div>';
				template += '<div class="date_actions"><div class="date"><a href="' + element.permalink + '" target="_blank">' + Storify.utils.displayDate(element.created_at) + '</a></div><div class="actions"><a href="http://twitter.com/intent/tweet?in_reply_to=' + tweet_id + '&related=' + element.author.username + '" class="reply" target="_blank"><i></i><span>Reply</span></a><a href="http://twitter.com/intent/retweet?tweet_id=' + tweet_id + '&related=' + element.author.username + '" class="retweet" target="_blank"><i></i><span>Retweet</span></a><a href="http://twitter.com/intent/favorite?tweet_id=' + tweet_id + '&related=' + element.author.username + '" class="favorite" target="_blank"><i></i><span>Favorite</span></a></div></div></aside></div>';
			}
			
			template += '</div></div>';

			layout += template + '</div>';
			break;
			
		default:
			return false;
	}
	
	return layout+'</div>';
}

function getTitle(title, author) {
	var html = '<div><div class="user">';
	html += '<a class="avatar" href="' + author.permalink + '" target="_blank"><img src="' + author.avatar + '" /></a>';
	html += '<a class="permalink" href="' + author.permalink + '" target="_blank">' + author.username + '</a></div>';
	html += '<h1 class="title"><span>' + title + '</span></h1>';
	html += '</div>';

	return $(html);
}

function resizeShow() {
	var h = $(window).height();
	var w = $(window).width();
	
	$('#twitterShow, .slideWrapper').css({
		height: h - $('#title').height() - $('#bottom').height(),
		width: w
	});
}



function resizeTitle() {
	var w = $(window).width();
	
	$('#title .title').css('width', w - $('#title .user').width() - 2); // fix that. This 2 is ugly
}

function loading(action) {
	if (action == 'show') {
		$('body').append('<div id="loading">Loading...</div>');
	}
	else if (action == 'hide') {
		$('#loading').remove();
	}
}

function updateStep(step) {
	$('.replay').hide();
	if (!loop) {
		$('.previous, .next').show();
	}
	if (step == 1) {
		$('.previous').hide();
	}
	if (loop && step == total-1) {
		penultimateLoop();
	}
	if (step == total) {
		$('.next').hide();
		$('.lastElement .field a').zclip({
			path: 'swf/ZeroClipboard.swf',
			copy: $('.lastElement .field input').val(),
			afterCopy: function() {
				$('.lastElement .field .copied').show();
				setTimeout(function() {
					$('.lastElement .field .copied').fadeOut(500);
				}, 1000);
			}
		});
		$('#toolbar .replay').show();
		pauseSlideshow();
	}
	$('.pager .current').text(step);
	window.location.hash = step;
}

var storyurl;

function init() {

	storyurl = STORIFY_PERMALINK;
	
	resizeShow();
	
	loading('show');
	storify.loadStory(storyurl,{metadata:1}, function(data) {
		
		loading('hide');
		
		$('#title').append(getTitle(data.title, data.author));

		total = Object.keys(data.elements).length+1;
		$('.pager .total').text(total);
		
		var hash = parseInt(window.location.hash.substr(1));
		var start = (hash > 0 && hash <= total) ? hash : 1;
		
		updateStep(start);

		$('#title, #bottom').show();
		
		resizeTitle();

		document.title = data.title + ' — Storify [Slideshow]';
		
		if (window != window.top) { // in iframe?
			$('#toolbar .fullscreen').attr('href', storyurl + '/slideshow').show();
			$('#toolbar .replay').addClass('replay_embed');
		}

		if (previous_id != data.elements[0].permalink || previous_length != data.elements.length) {
			$("a.user").attr("href", "http://storify.com/" + data.author.username);
			$("a.user").text(data.author.username);
			$("#branding .userImage").remove();
			$("#branding h2").before("<img src=" + data.author.avatar + ' class="userImage" width="32" style="float: right;max-height:32px"/>');

			$.each(data.elements, function(index, element) {
				var html = getStoryElementHTML(element);
				if (html) $("#twitterShow").append(html);
			});
			
			var last = '<div class="slideWrapper lastElement"><div class="lastElementInner">';
			last += '<h2>Share this story</h2><div class="buttons"><a href="#" class="facebook"><span>Share on Facebook</span></a><a href="#" class="twitter"><span>Share on Twitter</span></a></div>';
			last += '<h2>Embed this slideshow</h2><div class="field"><input type="text" name="script" value="" readonly="readonly"/><a href="#" class="copy">Copy</a><div class="copied">Copied!</div></div>';
			last += '<h3>Create your own stories at <a href="http://www.storify.com" target="_blank">storify.com</a> &rarr;</h3>';
			last += '</div></div>';
			
			$("#twitterShow").append(last);
			
			$('.lastElement .field input').val('<script src="'+storyurl+'.js?template=slideshow"></script><noscript><a href="'+storyurl+'" target="_blank">View "'+data.title+'" on Storify</a></noscript>');
			$('.lastElement .field input').focus(function() {
				$(this).select();
			});
			
			$('.lastElement .facebook').click(function() {
				var shareurl = '';
				try {
					shareurl = window.top.location.href;
				}
				catch(e) {
					shareurl = storyurl + '/slideshow';
				}
				shareurl = shareurl || storyurl + '/slideshow';
				shareOnFacebook(shareurl);
				return false;
			});
			$('.lastElement .twitter').click(function() {
				var shareurl = '';
				try {
					shareurl = window.top.location.href;
				}
				catch(e) {
					shareurl = storyurl + '/slideshow';
				}
				shareurl = shareurl || storyurl + '/slideshow';
				shareOnTwitter(shareurl, data.title+', the @storify slideshow by @'+data.author.username);
				return false;
			});
			$('.slideWrapper.textElement p span a').click(function() {
				window.open($(this).attr('href'));
				return false;
			});
			
			// Create the slideshow again using the new tweets, and fade it back in
			$("#twitterShow").cycle({
				fx: 'scrollHorz',
				timeout: 5000,
				speed: 300,
				nowrap: 1,
				fit: 1,
				before: onbefore,
				after: onafter,
        		onPrevNextEvent: onPrevNextEvent,
				startingSlide: start-1
			});
		}
		
		$("#twitterShow").cycle("pause");

		previous_id = data.elements[0].permalink;
		previous_length = data.elements.length;
		
	});

}

// general events

$(document).ready(init);
$(window).resize(function() {
	resizeShow();
	resizeTitle();
	centerItem($('.quote:visible'), 'both');
	centerItem($('.textP:visible'), 'verticalOnly');
});

$('#toolbar .previous').click(function() {
	$("#twitterShow").cycle("prev");
	return false;
});
$('#toolbar .next').click(function() {
	$("#twitterShow").cycle("next");
	return false;
});
$('#toolbar .play').click(function() {
	resumeSlideshow();
	return false;
});
$('#toolbar .pause').click(function() {
	pauseSlideshow();
	return false;
});
$('#toolbar .replay').click(function() {
	replaySlideshow();
	return false;
});
$('#toolbar .loop').click(function() {
	hideLoop();
	return false;
});
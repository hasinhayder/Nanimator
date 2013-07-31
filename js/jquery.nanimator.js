(function($){
	var objs =0;
	var anims=[];
	var counters=[];
	var opts = {};
	var defaults = {
		cancel:false,
		reanimate:false, //set this param to true in cas eyou add a dynamic element in the container and want to regenerate the mapping
		delay:true,
		hide:false,//command,
		classname:"nanimate",
		noevent:false,
		transparent:true
	}
	var animationDictionary = {
		top:{
			axis:"y",
			factor:-1
		},
		bottom:{
			axis:"y",
			factor:1
		},
		left:{
			axis:"x",
			factor:-1
		},
		right:{
			axis:"x",
			factor:1
		},
		none:{
			axis:0,
			factor:0
		}
	}
	$.fn.nanimate = function(options){	
		opts = $.extend(defaults,options);
		
		//set the dummy id just for reference
		if($(this).attr("id")==""){
			//assign a temporary id
			objs+=1;
			id = "nanimated"+objs;
			$(this).attr("id",id);
		}
		else{
			id = $(this).attr("id");
		}

		if(opts.hide){
			$(this).find("."+opts.classname).transition({opacity:0});
			return true;
		}
		//initiate the container variables
		anims[id]=[];
		counters[id]=0;


		// Find the elements to animate. Add them in a list, but dont do it again if the list is already prepared
		if(anims[id].length==0 || opts.reanimate){
			//fire the custom event that traversing through elements is now started
			if(!opts.noevent) $(this).trigger("nanimation.calculating");


			$(this).find("."+opts.classname).each(function(){

				var distance = $(this).data("distance");
				if(!distance) distance="40";
				var direction = $(this).data("direction");
				if(!direction) direction = "top";
				var time = $(this).data("time");
				if(!time) time = "300";
				var fade = $(this).data("fade");
				if(!fade) fade=false
				var fadedelay = $(this).data("fadedelay");
				if(!fadedelay) fadedelay=1000;
				var release = $(this).data("release");
				if(!release) release=false;
				var ease = $(this).data("ease");
				if(!ease) ease="linear";

				anims[id].push({
					obj:$(this),
					distance:distance,
					direction:direction,
					time:time,
					fade:fade,
					fadedelay:fadedelay,
					release:release,
					ease:ease
				});
				if(opts.transparent) $(this).css({opacity:0});

			});
			if(!opts.noevent) $(this).trigger("nanimation.calculated");
		}
		// console.log(anims,counters);

		$(this).trigger("nanimation.started");
		$.fn.animationChain(id,counters[id]);

	}

	$.fn.animationChain = function(id, i){
		if(opts.cancel) return;
		if(!anims[id][i]){
			if(!opts.noevent) $("#"+id).trigger("nanimation.complete");
			//$(anims[i-1].p).find(".test").transition({opacity:0,delay:500});//reset
			// console.log("End");
			return;
		}

		var delay = 0;
		if(i==0 && opts.delay) delay=1000;

		var element = anims[id][counters[id]];
		var moveAmount = element.distance * animationDictionary[element.direction].factor;
		var moveAxis =  animationDictionary[element.direction].axis;
		var transitionTime = element.time;
		var fade = element.fade;
		var fadedelay = element.fadedelay;
		var release = element.release;
		var ease = element.ease;

		if(moveAxis!="none"){
			var anim = {};
			anim[moveAxis] = moveAmount*-1;
			// console.log(anim);
			counters[id]+=1;
			$(element.obj).transition(anim,0);
		}

		if(!opts.noevent) $(element.obj).trigger("nanimation.started");
		$(element.obj).transition({opacity:1,delay:delay,x:0,y:0},transitionTime,ease,function(){
			if(fade==true){
				if(release!=true){
					$(element.obj).transition({opacity:0,delay:fadedelay},function(){
						$.fn.animationChain(id,counters[id]);
					});
				}else{
					$(element.obj).transition({opacity:0,delay:fadedelay});
					$.fn.animationChain(id,counters[id]);
				}
			}else{
				$.fn.animationChain(id,counters[id]);
			}
			if(!opts.noevent) $(element.obj).trigger("nanimation.finished");
		});
	}
})(jQuery);
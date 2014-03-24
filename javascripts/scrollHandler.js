var ScrollHandler= function(){
  var self= this;

  this.initPosX= $(".hero").css("top");
  this.initPosX= window.parseInt(this.initPosX.replace(/[^0-9]*$/, ''), 10);
  
  $(window).on("scroll", function() {
    self.handlerFunction(); 
  });

  this.handlerFunction();
};

ScrollHandler.prototype.handlerFunction = function() {
  var posX = (document.documentElement.scrollLeft) ? document.documentElement.scrollLeft : window.pageXOffset;
    var posY = (document.documentElement.scrollTop) ? document.documentElement.scrollTop : window.pageYOffset;
    var $head = $(".hero");
    var headParallax = posY - Math.floor(posY / 3) + this.initPosX;

    if(posY > 0)
    $head.css("top", headParallax + "px");
  else
    $head.css("top", this.initPosX);
};

ScrollHandler.prototype.initPosX = 0;

var sh= new ScrollHandler();
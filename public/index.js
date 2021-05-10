$( document ).ready(function(){

  if (localStorage.getItem("user") === null) {
    $('#myModal').modal({
      backdrop: 'static',
      keyboard: false
    });
  } 
 

  var socket = io();
  var toggle = false;
  var user=localStorage.getItem("user");
  $("#chatUser").text( user );
  var searchBoxText= "Type here...";
  var fixIntv;
  var fixedBoxsize = $('#fixed').outerHeight()+'px';
  var Parent = $("#fixed"); // cache parent div
  var Header = $(".fixedHeader"); // cache header div
  var Chatbox = $(".userinput"); // cache header div
  Parent.css('height', '30px');
  $("#getName").click(function(){
    localStorage.setItem("user",$("#name").val());
    user = localStorage.getItem("user");
    $("#chatUser").text( user );
});

  Header.click(function(){           
      toggle = (!toggle) ? true : false;
      if(toggle)
      {
          Parent.animate({'height' : fixedBoxsize}, 300);                    
      }
      else
      {
          Parent.animate({'height' : '30px'}, 300); 
      }
      
  });

  Chatbox.focus(function(){
      $(this).val(($(this).val()==searchBoxText)? '' : $(this).val());
  }).blur(function(){
      $(this).val(($(this).val()=='')? searchBoxText : $(this).val());
  }).keyup(function(e){
      var code = (e.keyCode ? e.keyCode : e.which);       
      if(code==13 && $(this).val().trim().length>0){
          socket.emit("chat message from client", { user: user , msg : $(this).val() } );

          $('.fixedContent').append("<div class='userwrap'><span class='user'>"+user+"</span><span class='messages'>"+$(this).val()+"</span><div class='userwrap'></div>");
          event.preventDefault();
       
          $(".fixedContent").scrollTop( $(".fixedContent").prop("scrollHeight") );  // chat scroll to bottom
          $(this).val('');
      }
      
  });


  socket.on("chat message from server",function(data){
    $('.fixedContent').append("<div class='userwrap'><span class='user'>"+data["user"]+"</span><span class='messages'>"+data["msg"]+"</span></div>");
  });



  var myCanvas = document.getElementById("myCanvas");
  var curColor = $('#selectColor option:selected').val();
  var ctx = myCanvas.getContext("2d");
  ctx.lineWidth = 3;
  var canvasDataWidth=1;
  var canvasDataHeight=1;
  var canvasIsLocked = false

  socket.on("canvas data from server-mousedown",function(data){
    canvasIsLocked = true;
    imgd = ctx.createImageData(data["w"],data["h"]);
    imgd.data.set( data["imageDataBuffer"] );
    ctx.beginPath();
    ctx.moveTo(data["x"],data["y"]);
  });


  socket.on("canvas data from server-mousemove",function(data){
    imgd = ctx.createImageData(data["w"],data["h"]);
    imgd.data.set( data["imageDataBuffer"] );
    ctx.lineTo(data["x"],data["y"]);
    ctx.strokeStyle=data["color"];
    ctx.stroke();
  });

  socket.on("canvas data from server-mouseup",function(data){
    canvasIsLocked = false;
  });

  if(myCanvas){
                  var isDown = false;
                  var canvasX, canvasY;     
                  $(myCanvas)
                  .mousedown(function(e){
                      if( canvasIsLocked == false ){
                                    isDown = true;
                                    ctx.beginPath();
                                    canvasX = e.pageX - myCanvas.offsetLeft;
                                    canvasY = e.pageY - myCanvas.offsetTop;
                                    ctx.moveTo(canvasX, canvasY);
  
                                    var imgd=ctx.getImageData(canvasX,canvasY,canvasDataWidth,canvasDataHeight);
                                    socket.emit("canvas data from client-mousedown",{ 
                                      imageDataBuffer:imgd.data.buffer,
                                      x:canvasX,
                                      y:canvasY,
                                      w:canvasDataWidth,
                                      h:canvasDataHeight,
                                      color:curColor
                                    });
                      }
                  })
                  .mousemove(function(e){
                                  if(isDown != false && canvasIsLocked==false ) {
                                          canvasX = e.pageX - myCanvas.offsetLeft;
                                          canvasY = e.pageY - myCanvas.offsetTop;
                                          ctx.lineTo(canvasX, canvasY);
                                          ctx.strokeStyle = curColor;
                                          ctx.stroke();

                                          var imgd=ctx.getImageData(canvasX,canvasY,canvasDataWidth,canvasDataHeight);
                                          socket.emit("canvas data from client-mousemove",{ 
                                            imageDataBuffer:imgd.data.buffer,
                                            x:canvasX,
                                            y:canvasY,
                                            w:canvasDataWidth,
                                            h:canvasDataHeight,
                                            color:curColor
                                          });
                                  }
                  })
                  .mouseup(function(e){
                          if(canvasIsLocked==false){
                                        isDown = false;
                                        ctx.closePath();
      
                                        socket.emit("canvas data from client-mouseup",{});
                          }
                  });
  }
   
  $('#selectColor').change(function () {
                  curColor = $('#selectColor option:selected').val();
  });
            


}); // doc ready function end

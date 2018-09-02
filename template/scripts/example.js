var createExampleIframe = function(id){
  
  var wrapper = document.getElementById('WRAPPER');
  var iframe = document.createElement('iframe');
  iframe.src = "examples/"+id+".html";
  iframe.id = "IFRAME";
  wrapper.appendChild(iframe);
  document.body.classList.add('is-example');
  
};

var closeIframe = function(){
  
  var view = document.getElementById('VIEW');
  var wrapper = document.getElementById('WRAPPER');
  var iframe = document.getElementById('IFRAME');
  document.body.classList.remove('is-example');
  iframe.parentNode.removeChild(iframe);
  wrapper.setAttribute('data-width','');
  
};

var setIframeWidth = function(w){
  
  var wrapper = document.getElementById('WRAPPER');
  wrapper.setAttribute('data-width',w);
  
};
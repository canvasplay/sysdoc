
var onIframeReady = function(id){
  var view = document.getElementById('VIEW');
  var iframe = document.getElementById('IFRAME');
  var el = document.getElementById(id.substr(1));
  iframe.contentDocument.body.innerHTML = el.innerHTML;
  document.body.classList.add('is-example');
};

var createExampleIframe = function(id){
  
  var wrapper = document.getElementById('WRAPPER');
  var iframe = document.createElement('iframe');
  iframe.src = "iframe.html#"+id;
  iframe.id = "IFRAME";
  wrapper.appendChild(iframe);
  
};

var closeIframe = function(){
  
  var view = document.getElementById('VIEW');
  var iframe = document.getElementById('IFRAME');
  document.body.classList.remove('is-example');
  iframe.parentNode.removeChild(iframe);
  
};

var setIframeWidth = function(w){
  
  var wrapper = document.getElementById('WRAPPER');
  wrapper.setAttribute('data-width',w);
  
};
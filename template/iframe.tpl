<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta charset="utf-8" />
  <%
    var css = (config.css)? (config.css.push)? config.css : [config.css] : [];
    _.each(css, function(url){
  %>
    <link rel="stylesheet" href="<%= url %>" />
  <% }) %>
</head>
<body onload="(function(){window.parent.onIframeReady(window.location.hash)})();">
</body>
</html>

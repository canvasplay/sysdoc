<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <%
    var css = (config.css)? (config.css.push)? config.css : [config.css] : [];
    _.each(css, function(url){
  %>
    <link rel="stylesheet" href="<%= url %>" />
  <% }) %>
</head>
<body>

  <nav class="styl-nav">
    <a class="title" href="index.html#"><%= config.title %></a>
    <br />
    <small class="text-muted">v.<%= config.version %></small>
    <br />
    <br />
    <%= render('nav',{ items: sections, active: doc }) %>
    <br />
    <footer>
      Documentation generated on<br>
      <%= new Date() %>
    </footer>
  </nav>

  <content class="styl-content">
    <%= renderDoclet(doc, true, 1) %>
  </content>

  <%
    var js = (config.js)? (config.js.push)? config.js : [config.js] : [];
    _.each(js, function(url){
  %>
    <script src="<%= url %>"></script>
  <% }) %>

  <div id="VIEW">
    
    <div class="bar">
      SysDoc Responsive Playground
      <a href="javascript:closeIframe();"><i class="material-icons">close</i></a>
    </div>
    <div class="sizes">
      <a class="_full" href="javascript:setIframeWidth();"><span>100%</span></a>
      <a class="_1024" href="javascript:setIframeWidth(1024);"><span>1024px</span></a>
      <a class="_768" href="javascript:setIframeWidth(768);"><span>768px</span></a>
      <a class="_640" href="javascript:setIframeWidth(640);"><span>640px</span></a>
      <a class="_480" href="javascript:setIframeWidth(480);"><span>480px</span></a>
      <a class="_360" href="javascript:setIframeWidth(360);"><span>360px</span></a>
    </div>
    <div id="WRAPPER">
    </div>
  </div>
</body>
</html>
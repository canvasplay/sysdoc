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

</body>
</html>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <%
    var css = (config.css)? (config.css.push)? config.css : [config.css] : [];
    _.each(css, function(url){
      var preffix = (url.indexOf('http')===0)? '' : '../';
  %>
    <link rel="stylesheet" href="<%= preffix %><%= url %>" />
  <% }) %>
</head>
<body>
  
  <%
    source = utils.encodedStr(source);
    var lines = source.split('\n');
  %>
  <pre class="styl-doc__code"><% _.each(lines, function(line, index){ %><code id="L<%= index %>"><%= line %></code><% }) %></pre>

  <%
    var js = (config.js)? (config.js.push)? config.js : [config.js] : [];
    _.each(js, function(url){
      var preffix = (url.indexOf('http')===0)? '' : '../';
  %>
    <script src="<%= preffix %><%= url %>"></script>
  <% }) %>
  
</body>
</html>
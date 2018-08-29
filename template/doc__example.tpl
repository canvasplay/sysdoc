<% if(doc.example){ %>
  <% var exs = (doc.example.push)? doc.example : [doc.example] %>
  <% _.each(exs, function(ex, index){ %>
  
    <%
      var name = ex.name;
      var type = ex.type;
      var content = ex.content;
      var code = (plugins.beautify[type])? plugins.beautify[type](ex.code) : ex.code;
  
    %>
    
    <% if(name){ %>
      <small class="text-muted"><%= name %></small>
    <% } %>
  
    <% if(content && type === 'html'){ %>
      <% var exId = 'EX_'+doc.id+'_'+index; %>
      <a href="javascript:createExampleIframe('<%= exId %>')">open</a><br>
      <div class="styl-doc__example" id="<%= exId %>"><%= content %></div>
    <% } %>
    
    <% if(code!== ''){ %>
      <pre class="styl-doc__code"><code class="language-<%= type %>"><%- code %></code></pre>
    <% } %>
    
  <% }) %>

<% } %>
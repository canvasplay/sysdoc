<div class="styl-doc__header">
  <%= render('doc__pathname',{doc:doc}) %>
  <small class="text-muted">Source: <a target="_blank" href="sources/<%= utils.urlify(doc.metadata.file) %>.html#L<%= doc.metadata.line %>" style="color: inherit;"><%= doc.metadata.file %>:<%= doc.metadata.line %></a></small>
  <%
    //var depth = utils.getDocDepth(doc);
    //var x = (Math.min(depth+1,6));
    //x++; //start with h2
    var x = (depth)? depth : 1;
  %>
  <% if(doc.name){ %>
    <h<%= x %> class="styl-doc__title">
      <%= doc.name%>
      <a class="styl-doc__permalink" href="#<%= utils.getDocPathName(doc) %>">#</a>
    </h<%= x %>>
    <% if(doc.selector){ %><p class="styl-doc__selector"><code><%= doc.selector %></code></p><% } %>
  <% } %>
  
</div>
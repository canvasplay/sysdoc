<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">

  <h1 class="styl-doc__title">
    <%= doc.name %>
    <% if(config.version){ %>
      <small class="text-muted">v.<%= config.version %></small>
    <% } %>
  </h1>

  <% if(doc.description){ %>
    <div class="styl-doc__description lead"><%= doc.description %></div>
  <% } %>

  <%= render('doc__content', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>
  <%= render('doc__downloads', {doc:doc}) %>
  <%= render('doc__children', {doc:doc, depth: (depth)? depth+1 : 2 }) %>
  
</div>
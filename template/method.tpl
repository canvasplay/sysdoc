<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">
  
  
  <h3><code><%= doc.name %>(
  <% var params = (doc.param.push)? doc.param : [doc.param] %>
  <% var hasOptional = false; %>
  <% _.each(params, function(param, index, collection){ %>
    <% if(param.optional && !hasOptional){ hasOptional= true; %>[<% } %>
    <% if(index>0){ %>,<% } %>
    <%= param.name %>
    <% if(index==collection.length-1 && hasOptional){ %>]<% } %>
  <% }) %>
  )
  <% if(doc.return){ %>
    → <%= doc.return.type %>
  <% } %>
  </code></h3>
  
  <%= render('doc__description', {doc:doc}) %>
  <%= render('method__parameters', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__content', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>
  
</div>
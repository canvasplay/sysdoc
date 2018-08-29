<div class="styl-doc styl-doc--module" id="<%= utils.getDocPathName(doc) %>">
  
  <%= render('doc__header', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  <%= render('module_overview', {doc:doc}) %>
  <%= render('doc__content', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>
  <%= render('doc__downloads', {doc:doc}) %>
  <%= render('doc__children', {doc:doc, depth: (depth)? depth+1 : 2 }) %>
  
</div>
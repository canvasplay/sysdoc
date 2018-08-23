<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">
  
  
  
  <%= render('doc__header', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  <%= render('object__properties', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__content', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>

</div>
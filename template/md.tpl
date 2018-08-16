<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">
  <%= render('doc__pathname',{doc:doc}) %>
  <%= plugins.marked(doc.content) %>
</div>
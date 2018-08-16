<div class="styl-doc styl-doc--color" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__header', {doc:doc, depth: depth}) %>
  <%= render('doc__description', {doc:doc}) %>
  <div
    class="styl-doc__color"
    style="background-color: <%= doc.value.hex %>; color:<%= utils.color.contrast(doc.value.hex) %>;"
  >
    <span><%= doc.name %></span>
    <% _.each(doc.value, function(value, key){ %>
      <code><span style="text-transform: uppercase;"><%= key %></span> <%= value %></code>
    <% }) %>
  </div>

</div>
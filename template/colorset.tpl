<section class="styl-doc styl-doc--colorset" id="<%= utils.getDocPathName(doc) %>">
  
  <%= render('doc__header',{ doc: doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  <%= render('doc__example', {doc:doc}) %>
  
  <% var colors = _.filter(doc.children, function(d){ return d.type==='color' }) %>
  
  <div class="styl-doc__colors">
  <% _.each(colors, function(color){ %>
  
    <div
      class="styl-doc__color <%= (color.base)? 'styl-doc__color--base' : '' %>"
      style="background-color: <%= color.value.hex %>; color:<%= utils.color.contrast(color.value.hex) %>;"
    >
      <span><%= color.name %></span>
      <% _.each(color.value, function(value, key){ %>
        <code><span style="text-transform: uppercase;"><%= key %></span> <%= value %></code>
      <% }) %>
    </div>

  <% }) %>
  </div>
  
</section>
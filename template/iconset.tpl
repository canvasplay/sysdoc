<div class="styl-doc styl-doc--iconset" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__header',{ doc: doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>

  <div class="styl-doc__icons">
  <%
    var icons = _.filter(doc.children, function(d){ return d.type === 'icon' });
    _.each(icons, function(icon){ %>
    
    <div
      class="styl-doc__example styl-doc__example--sample"
    >
      <i class="material-icons"><%= icon.name %></i>
      <div class="styl-doc__details">
        <%= icon.name %>
      </div>
    </div>

  <% }) %>
  </div>

</div>
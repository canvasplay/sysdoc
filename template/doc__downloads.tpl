<% if(doc.download){ %>
<div class="styl__downloads">
  <% var downloads = (doc.download.length)? doc.download : [doc.download] %>
  <ul>
    <% _.each(downloads, function(d){ %>
      <li><a href="<%= d.description || d.name %>" target="_blank"><%= d.name || d.description %></a></li>
    <% }) %>
  </ul>

</div>
<% } %>
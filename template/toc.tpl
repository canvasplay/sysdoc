<% _.each(items, function(item){ %>
<li>
  <a href="<%= link %><%= item.slug %>"><%= item.name %></a>
  <% if(item.children){ %>
  <ul>
    <%= render('toc',{ items: item.children, link: link }) %>
  </ul>
  <% } %>
</li>
<% }) %>
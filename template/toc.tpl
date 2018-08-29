<% _.each(items, function(item){ %>
<% if(!doc.follow || doc.follow >= item.lvl){ %>
<li>
  <a href="<%= link %><%= item.slug %>"><%= item.name %></a>
  <% if(item.children){ %>
  <ul>
    <%= render('toc',{ items: item.children, link: link, doc: doc }) %>
  </ul>
  <% } %>
</li>
<% } %>
<% }) %>
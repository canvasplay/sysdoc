<% if(items && items.length){ %>
<ul>
  <% _.each(items, function(item){ %>
    <% if(item.toc){ %>
      <%= render('toc',{ items: item.toc, link: item.metadata.link }) %>
    <% }else{ %>
      <li>
        <a href="<%= item.metadata.link %>"><%= item.name %></a>
        <% if(item.children && !item.nofollow){ %>
          <%= render('nav',{ items: item.children }) %>
        <% } %>
      </li>
    <% } %>
  <% }) %>
</ul>
<% } %>
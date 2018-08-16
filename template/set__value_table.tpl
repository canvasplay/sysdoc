<%
  var items = (items.push)? items : [items];
  var keys = _.keys(items[0].value);
%>

<table class="table">
  <thead>
  <tr>
    <th>name</th>
  <% _.each(keys, function(key){ %>
    <th><%= key %></th>
  <% }) %>
  </tr>
  </thead>
  <tbody>
  <% _.each(items, function(item){ %>
    <tr>
      <td><%= item.name %></td>
    <% _.each(keys, function(key){ %>
      <td><code><%= item.value[key] %></code></td>
    <% }) %>
    </tr>
  
  <% }) %>
  </tbody>
</table>
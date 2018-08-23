<%
  var props = (doc.prop.push)? doc.prop : [doc.prop];
%>

<table class="table">
  <thead>
  <tr>
    <th>name</th>
    <th>type</th>
    <th>default</th>
    <th>description</th>
  </tr>
  </thead>
  <tbody>
  <% _.each(props, function(prop){ %>
    <tr>
      <td><code><%= (prop.optional)? '['+prop.name+']' : prop.name %></code></td>
      <td><code><%= prop.type %></code></td>
      <td><%= (prop.default)? prop.default : '' %></td>
      <td><%= prop.description %></td>
    </tr>
  <% }) %>
  </tbody>
</table>
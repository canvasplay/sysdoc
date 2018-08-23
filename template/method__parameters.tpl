<% var params = (doc.param.push)? doc.param : [doc.param] %>
<div class="styl-doc__parameters">
  <h4>Parameters</h4>
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
    <% _.each(params, function(param){ %>
      <tr>
        <td><code><%= (param.optional)? '['+param.name+']' : param.name %></code></td>
        <td><code><%= param.type %></code></td>
        <td><%= (param.default)? param.default : '' %></td>
        <td><%= param.description %></td>
      </tr>
    <% }) %>
    </tbody>
  </table>
</div>
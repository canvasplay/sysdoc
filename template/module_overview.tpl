<%
  var modifiers = (doc.children)? _.filter(doc.children,function(c){ return c.type === 'modifier' }): [];
  var elements = (doc.children)? _.filter(doc.children,function(c){ return c.type === 'element' }) : [];
%>
<div class="styl-doc__overview">
  <table class="table">
  <% if(modifiers.length){ %>
    <thead>
    <tr>
      <th colspan="2">Modifiers</th>
    </tr>
    </thead>
    <tbody>
    <% _.each(modifiers, function(mod){ %>
      <tr>
        <td><code><%= mod.selector %></code></td>
        <td><%= plugins.marked(mod.description) %></td>
      </tr>
    <% }) %>
    </tbody>
  <% } %>
  <% if(elements.length){ %>
    <thead>
    <tr>
      <th colspan="2">Elements</th>
    </tr>
    </thead>
    <tbody>
    <% _.each(elements, function(ele){ %>
      <tr>
        <td><code><%= ele.selector %></code></td>
        <td><%= plugins.marked(ele.description) %></td>
      </tr>
    <% }) %>
    </tbody>
  <% } %>
  </table>
</div>
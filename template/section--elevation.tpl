<div class="styl-doc" id="<%= utils.getDocPathName(doc) %>">
  
  <%= render('doc__header', {doc:doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  <%= render('doc__content', {doc:doc}) %>
  
  <%= render('doc__data', {items:doc.children}) %>
  
  <% _.each(doc.children, function(item){ %>

    <div class="" style="display:block; padding: 3rem 2rem 2rem; box-shadow:<%= item.data.shadow %>;">
      
      <strong><%= item.name %></strong><br>
      <div class="styl-doc__details">
        index: <%= item.data.zindex %><br>
        elevation: <%= item.data.distance %>
      </div>
      
    </div>
    <br>
  
  <% }) %>

  <%= render('doc__example', {doc:doc}) %>
  <%= render('doc__downloads', {doc:doc}) %>
  
</div>
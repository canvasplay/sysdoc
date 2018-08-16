<div class="" id="<%= utils.getDocPathName(doc) %>">
    
  <%= render('doc__header',{ doc: doc, depth: depth || 1 }) %>
  <%= render('doc__description', {doc:doc}) %>
  
  <% var src = (_.isArray(doc.src))? doc.src[0] : doc.src %>
  <% if(src){ %>
    <div class="styl-doc__example styl-doc__example--image">
      <img src="<%= src.value %>" />
    </div>
  <% } %>
  
  <%= render('doc__example', {doc:doc}) %>
  <%= render('doc__downloads', {doc:doc}) %>

</div>
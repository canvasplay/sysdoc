<div class="styl-doc styl-doc--space" id="<%= utils.getDocPathName(doc) %>">
    
  <% var size = doc.value.string; %>
  <div class="">
    <h3><%= size %> - <%= doc.name %></h3>
    <div class="styl-doc__space" style="<%= (doc.name==='none')? 'display: none;' : '' %> width: <%= size %>; height: <%= size %>;"></div>
  </div>


</div>
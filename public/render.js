import('/render-core.js')
  .then(function(){return import('/custom-blocks-render.js')})
  .then(function(){return import('/slideshow-polish.js')})
  .catch(function(error){console.error(error)});

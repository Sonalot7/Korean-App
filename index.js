// index helpers: placeholder for flashcards or other actions
document.addEventListener('click', function(e){
  if(e.target.matches('[data-flash]')){
    const cat = e.target.getAttribute('data-flash');
    alert('Flashcards for "'+cat+'" would open here. (Feature not implemented in this static demo)');
  }
});

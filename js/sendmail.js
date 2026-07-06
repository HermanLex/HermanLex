var form = $('#form'); //form id here
form.submit(function(event){
    
    event.preventDefault();
    var form_status = $('<div class="form_status"></div>');
    var $form = $(this);
    
    $.ajax({
        type: 'POST',
        url: "http://blankettheweb.com/sendmail.php",
        data:{
           Name:$form.find("input[name='name']").val(), 
           Email:$form.find("input[name='email']").val(), 
           Message:$form.find("textarea[name='message']").val()
            
            
        },
        
        beforeSend: function(){
            form.append(form_status.html('Email is sending...').fadeIn());
            
        }
       }).done(function(data){
           form_status.html('Email Sent!').delay(3210).fadeOut();
       });
    
  //delete messages when submit
  
  document.getElementById("name").value= "";
    document.getElementById("email").value= "";

  document.getElementById("message").value= "";



});
//this is where the front end javascript code goes
/////
window.onload = function() {
  const token = localStorage.getItem('token');
  console.log("window loaded");
  // $.ajax({
  //   type: 'GET',
  //   headers: {
  //     Authorization: `${token}`
  //   },
  //   url: '/posts',
  //   success:function(token){
  //     console.log(token)
  //   }
  // })
  var $posts = $('#posts');
  if (token===null){
    // $('h1').addClass('hidden')
    $('form').addClass('hidden')
    $('span').addClass('hidden')
    $('h2').removeClass('hidden')
  }

  const user =
    $.ajax({
      type:'GET',
      url:'/currentUser',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success:function(user){
        console.log(typeof user);
        return user;
      }
    })


  $.ajax({
    type: 'GET',

    url: '/posts',
    success: function(posts) {
      console.log(user.responseText);
      $.each(posts, function(index, post) {
        // console.log(post);
        // if (token===null){
        //   $('button').addClass('hidden')
        // }
        $posts.append(
          '<li> <button data-UUID="' +
            post._id +
            '" type="button" id="deleteButton"><i class=\'fa fa-trash fa-2x \' aria-hidden=\'true\'></i></button> ' +
            '<b>text:</b> <span class="noEdit text">' +
            post.text +
            " </span> <input class='edit text'/>" +
            "<br>  <b>  Posted by:</b> <span class='name'>" +
            post.name +
            '</span>' +
            '<b> at</b> ' +
            moment(post.created)
              .startOf('minutes')
              .fromNow() +
            ' <button type="button"  class="editPost noEdit">Edit</button>' +
            '<button data-UUID="' +
            post._id +
            '" type="button" class="saveEdit edit">Save</button>' +
            '<button class="cancelEdit edit">Cancel</button></li>'
        );
        if (token===null){
          $('button').addClass('hidden')
          $('input').addClass('hidden')
        }
      });
    },
    error: function() {
      alert("Couldn't load previous posts!");
    }
    // $('button').addClass('hidden')

  });
};


$(function() {
  const user =
    $.ajax({
      type:'GET',
      url:'/currentUser',
      headers: {
        Authorization: `Bearer ${token}`
      },
      success:function(user){
        console.log(typeof user);
        return user;
      }
    })
    
  var $posts = $('#posts');
  var $text = $('#text');
  var $name = user.responseText;


  /////////////////////////POST///////////////////////////
  $('#submit').on('click', function() {
    event.preventDefault();
    //what happens when submit is selected
    //$("#form-js").validate();
    console.log('you just clicked submit');
    var post = {
      text: $text.val(),
      userName: "ajaxUser",
      //userName: $name.val(),
      created: new Date()
    };
    //$('#posts').find('input:text').val('');

    $.ajax({
      type: 'POST',
      url: '/posts',
      data: post,
      success: function(newPost) {
        console.log(newPost);
        $text.val('');
        $posts.append(
          '<li> <button data-UUID="' +
            newPost._id +
            '" type="button" id="deleteButton"><i class=\'fa fa-trash fa-2x\' aria-hidden=\'true\'></i></button> ' +
            '<b>text:</b> <span class="noEdit text">' +
            newPost.text +
            " </span> <input class='edit text'/>" +
            "<br> <b>Posted by:</b> <span class='name'>" +
            newPost.userName +
            '</span>' +
            '<b> at</b> ' +
            moment(newPost.created)
              .startOf('minutes')
              .fromNow() +
            ' <button type="button"  class="editPost noEdit">Edit</button>' +
            '<button data-UUID="' +
            newPost._id +
            ' "type="button" class="saveEdit edit">Save</button>' +
            '<button class="cancelEdit edit">Cancel</button></li>'
        );
      },
      error: function() {
        alert("Couldn't load previous posts!");
      }
    });
    //$('#submit').on('click', function () {
    //});
  });

  /////////////////////DELETE///////////////////////
  $posts.delegate('#deleteButton', 'click', function() {
    //have to use delegate instead of on click to work, i forgot why.
    var $li = $(this).closest('li');
    console.log('Sending request to Ajax to delete post');
    console.log(ajaxUser + 'from delete!');
    console.log(
      $(this)
        .closest('li')
        .find('span.name')
        .val()
    );

    if (ajaxUser === $li.find('span.name').text()) {
      console.log('delete worked');

      $.ajax({
        type: 'DELETE',
        url: '/posts/' + $(this).attr('data-UUID'),
        success: function(posts) {
          console.log(posts);
          $posts.html(''); //this clears page
          $.each(posts, function(index, post) {
            $posts.append(
              '<li> <button data-UUID="' +
                post._id +
                '" type="button" id="deleteButton"><i class=\'fa fa-trash fa-2x\' aria-hidden=\'true\'></i></button> ' +
                '<b>text:</b> <span class="noEdit text">' +
                post.text +
                " </span> <input class='edit text'/>" +
                "<br> <b>Posted by: </b> <span class='name'>" +
                post.name +
                '</span>' +
                '<b> at</b> ' +
                moment(post.created)
                  .startOf('minutes')
                  .fromNow() +
                ' <button type="button"  class="editPost noEdit">Edit</button>' +
                '<button data-UUID="' +
                post._id +
                ' "type="button" class="saveEdit edit">Save</button>' +
                '<button class="cancelEdit edit">Cancel</button></li>'
            );
          });
        },
        error: function() {
          alert('error deleting');
        }
      });
    } else {
      alert('Only original poster can delete!');
    }
  });
  ////////////////////////////PUT//////////////////////////
  $posts.delegate('.editPost', 'click', function() {
    //have to use delegate instead of on click to work, i forgot why.
    var $li = $(this).closest('li');
    if (ajaxUser === $li.find('span.name').text()) {
      $li.find('input.text').val($li.find('span.text').html());
      //$li.find("input.name").val($li.find("span.name").html() );
      $li.addClass('edit');
    } else {
      alert('Only original poster can edit!');
    }
  });

  $posts.delegate('.cancelEdit', 'click', function() {
    $(this)
      .closest('li')
      .removeClass('edit');
  });

  $posts.delegate('.saveEdit', 'click', function() {
    var $li = $(this).closest('li');
    console.log(
      $(this)
        .closest('li')
        .val('data-UUID')
    );
    var post = {
      text: $li.find('input.text').val(),
      userName: $li.find('span.name').text(),
      created: new Date()
    };

    console.log(post);
    console.log(
      $(this)
        .closest('li')
        .find('.saveEdit')
        .attr('data-UUID')
    );
    $.ajax({
      type: 'PUT',
      url: '/posts/' + $li.find('.saveEdit').attr('data-UUID'),
      data: post,
      success: function(posts) {
        console.log('currently putting', posts, post);
        $posts.html('');
        $.each(posts, function(index, post) {
          $posts.append(
            '<li> <button data-UUID="' +
              post._id +
              '" type="button" id="deleteButton"><i class=\'fa fa-trash fa-2x \' aria-hidden=\'true\'></i></button> ' +
              '<b>text:</b> <span class="noEdit text">' +
              post.text +
              " </span> <input class='edit text'/>" +
              "<br>  <b>  Posted by:</b> <span class='name'>" +
              post.name +
              '</span>' +
              '<b> at</b> ' +
              moment(post.created)
                .startOf('minutes')
                .fromNow() +
              ' <button type="button"  class="editPost noEdit">Edit</button>' +
              '<button data-UUID="' +
              post._id +
              '" type="button" class="saveEdit edit">Save</button>' +
              '<button class="cancelEdit edit">Cancel</button></li>'
          );
        });
        $li.find('span.text').html(posts.text);
        //$li.find("span.name").html(posts.name);
        $li.removeClass('edit');
      },
      error: function() {
        alert("Couldn't load previous posts!");
      }
    });
  });
});

const $posts = $('#posts');
$posts.delegate('.cancelEdit', 'click', function() {
  $(this)
    .closest('li')
    .removeClass('edit');
});

$posts.delegate('.saveEdit', 'click', function() {
  var $li = $(this).closest('li');
  console.log(
    $(this)
      .closest('li')
      .val('data-UUID')
  );
  var post = {
    text: $li.find('input.text').val(),
    userName: $li.find('span.name').text(),
    created: new Date()
  };

  console.log(post);
  console.log(
    $(this)
      .closest('li')
      .find('.saveEdit')
      .attr('data-UUID')
  );
  $.ajax({
    type: 'PUT',
    url: '/posts/' + $li.find('.saveEdit').attr('data-UUID'),
    data: post,
    success: function(posts) {
      console.log('currently putting', posts, post);
      $posts.html('');
      $.each(posts, function(index, post) {
        $posts.append(
          '<li> <button data-UUID="' +
            post._id +
            '" type="button" id="deleteButton"><i class=\'fa fa-trash fa-2x \' aria-hidden=\'true\'></i></button> ' +
            '<b>text:</b> <span class="noEdit text">' +
            post.text +
            " </span> <input class='edit text'/>" +
            "<br>  <b>  Posted by:</b> <span class='name'>" +
            post.name +
            '</span>' +
            '<b> at</b> ' +
            moment(post.created)
              .startOf('minutes')
              .fromNow() +
            ' <button type="button"  class="editPost noEdit">Edit</button>' +
            '<button data-UUID="' +
            post._id +
            '" type="button" class="saveEdit edit">Save</button>' +
            '<button class="cancelEdit edit">Cancel</button></li>'
        );
      });
      $li.find('span.text').html(posts.text);
      //$li.find("span.name").html(posts.name);
      $li.removeClass('edit');
    },
    error: function() {
      alert("Couldn't load previous posts!");
    }
  });
});
// });

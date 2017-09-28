//this is where the front end javascript code goes



$(function(){
var $posts = $('#posts');
var $text = $("#text");
var $name = $("#name");
	$.ajax({
		type:'GET',
		url: '/posts',
		success: function(posts){
			$.each(posts, function(index, post){
				$posts.append('<li> <button data-UUID="'+ post.id +'" type="button" id="deleteButton"> Delete</button> <button type="button"  id="updateButton">Update</button> <b>text:</b> ' + post.text + " name: " + post.name + ' at ' + post.created + '</li>');
			});
		},
		error: function(){
			alert('Couldn\'t load previous posts!');
		}
	});

	$("#submit").on('click', function(){
		event.preventDefault();
		//what happens when submit is selected
		console.log("you just clicked submit");
		var post = {
			text: $text.val(),
			userName: $name.val(),
			created: new Date(),
		};
		$.ajax({
			type:'POST',
			url:'/posts',
			data: post,
			success: function(newPost) {
				console.log(newPost);
				$posts.append('<li> <button data-UUID="'+ newPost.id +'" type="button" id="deleteButton"> Delete</button> <button type="button" id="updateButton">Update</button> text: ' + newPost.text + " name: " + newPost.userName + '  at ' + Date(newPost.created) + ' </li>');
			},
			error: function(){
				alert('Couldn\'t load previous posts!');
			},
		})
	});

	
	$posts.delegate('#deleteButton','click', function(){ //have to use delegate instead of on click to work
		console.log('Sending request to Ajax to delete post'); 
		$.ajax({
			type:'DELETE',
			url:'/posts/' + $(this).attr('data-UUID'),
			success: function(posts) {
				console.log(posts);
				$posts.html(""); //this clears page
				
				$.each(posts, function(index, post){
					$posts.append('<li> <button data-UUID="'+ post.id +'" type="button" id="deleteButton"> Delete</button> <button type="button"  id="updateButton">Update</button> <b>text:</b> ' + post.text + " name: " + post.name + ' at ' + post.created + '</li>');
				});
			}
		});

	});
});








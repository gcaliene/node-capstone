const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const PetPost = require('./models');

const app = express();

const {PORT, DATABASE_URL}= require('./config');

mongoose.Promise =global.Promise;
mongoose.connect('mongodb://localhost:27017/fullstackcapstone')

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Hello nad welcome')
})

app.post('/posts', (req, res) => {
	const newPost = new PetPost()

	newPost.text = req.body.text
	newPost.userName = req.body.userName
	newPost.created = new Date()

	newPost.save((err, record) => {
		if(err) {
			res.send(err)
		}
		res.json(record)
	})
})



app.listen(process.env.PORT || 8080, () => {
	console.log("server is up and running")
}); //telling server what to listen


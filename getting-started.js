var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	// Yay!
	var kittySchema = mongoose.Schema({ 
		name : String 
	});
	
	var kitten = mongoose.model('kitten', kittySchema);

	var silence = new kitten({ name: "silence"});
	console.log(silence.name);

	var kittySchema.methods.speak = function() {
		var greeting = this.name
			? "Meow name is " + this.name
			: "I don't have a name"
		console.log(greeting);
	}

	var kitten = mongoose.model('kitten', kittySchema);
});
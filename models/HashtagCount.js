var mongoose = require('mongoose');

var HashtagCountSchema = mongoose.Schema({
	hashtag: {type: String, required: true},
	createdAt: {type: Date, expires: 10*60},
});

HashtagCountSchema.pre('save', true, function(next, done) {
	next();
	var date = new Date();
	if(!this.createdAt) {
		this.createdAt = date;
	}
	done();
});

module.exports = mongoose.model('HashtagCount', HashtagCountSchema);
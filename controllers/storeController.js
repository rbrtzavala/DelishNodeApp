// Import mongoose
const mongoose = require('mongoose');
// Import our Store from models
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: '💩 Add Store' });
};

// use es8 async/await
// When using async/await you need to use function composition to handle errors.
// Routes/index passes createStore to catchErrors() for this.
exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  // Fire off connection to mongodb db and come back with store or err.
  // Make use of mongodb Promises here to avoid callback-hell
  await store.save(); // await is waiting for a Promise to return
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`, '');
};

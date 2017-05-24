// Import mongoose
const mongoose = require('mongoose');
// Import our Store from models
const Store = mongoose.model('Store');
const jimp = require('jimp');
const uuid = require('uuid');
const multer = require('multer');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ messaeg: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: '💩 Add Store' });
};

// Middleware
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to next Middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resize here
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written photo to file system, keep going!
  next();
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
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores to display
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  // Find Store given the id
  const store = await Store.findOne({ _id: req.params.id });

  // confirm they are the owner of the store

  // render out the edit from so the user can update the store
  res.render('editStore', { title: `Edit ${store.name}`, store})
};

exports.updateStore = async (req, res) => {
  // set the location data to a Point
  req.body.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
  // redirect to new page to tell it worked
  res.redirect(`/stores/${store._id}/edit`);
};

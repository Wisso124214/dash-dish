import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  register_date: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

const userProfileSchema = new mongoose.Schema({
  id_user: {
    type: String,
    required: true,
  },
  id_profile: {
    type: String,
    required: true,
  },
});

const catgoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

const dishSchema = new mongoose.Schema(
  {
    id_api: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost_unit: {
      type: Number,
      required: true,
    },
    id_categories: {
      type: [String],
      required: true,
    },
    extras: {
      type: [Object],
    },
    preview_img: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('user', userSchema);
export const Profile = mongoose.model('profile', profileSchema);
export const User_Profile = mongoose.model('user_profile', userProfileSchema);

export const Dish = mongoose.model('dish', dishSchema);
export const Category = mongoose.model('category', catgoriesSchema);

export const models = { User, Dish, Profile, User_Profile, Category };

export const special_plurals = {
  dish: 'dishes',
  category: 'categories',
};

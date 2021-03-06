import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('pwg', { path: '/' });
  this.route('services');
  this.route('password', { path: '/password/:password_id' });
});

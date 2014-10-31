import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('pwg', { path: '/' });
  this.route('services');
});

export default Router;

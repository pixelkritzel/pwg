import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    console.log('Hallo');
    return this.get('store').find('service');
  }
});

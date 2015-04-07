import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {
    var model = this.get('store').find('password');
    return model;
  },

  deactivate: function() {
    this.currentModel.destroy();
  }
});

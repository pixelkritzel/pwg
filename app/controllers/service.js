import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    deleteService: function() {
      var service = this.get('model');
      service.deleteRecord();
      service.save();
    }
  }
});

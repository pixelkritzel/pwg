import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    deleteService: function() {
      var service = this.get('model');
      console.log(service);
      service.deleteRecord();
      service.save();
    }
  }
});

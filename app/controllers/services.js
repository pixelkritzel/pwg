import Ember from 'ember';

export default Ember.ArrayController.extend({
  actions: {
    addNewService: function() {
      var newServiceName = this.get('newServiceName');
      var newService = this.store.createRecord('service', {
        serviceName: newServiceName
      });

      this.set('newServiceName', '');

      newService.save();
    }
  }
});

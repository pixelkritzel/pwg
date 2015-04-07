import Ember from 'ember';

export default Ember.ArrayController.extend({
  actions: {
    setSelectedService: function(selectedService) {
      this.set('selectedService', selectedService);
    },

    generatePassword: function() {
      var selectedServiceName = this.get('selectedService');
      var salt = this.get('salt');
      var combinedPassword = selectedServiceName + salt;
      var password = btoa(CryptoJS.SHA1(combinedPassword)).substr(0,32);
      var newPasswordModel = this.store.createRecord('password', {
        password: password
      });
      this.transitionToRoute('password', newPasswordModel);
    },

    selectedServiceGainsFocus: function() {
      this.set('selectedServiceHasFocus', true);
    }


  },

  selectedService: null,
  selectedServiceHasFocus: false,

  filteredServices: function() {
    var selectedService = this.get('selectedService')
    if (selectedService) {
      return this.filter((serviceModel) => serviceModel.get('serviceName').indexOf(selectedService) !== -1)
    } else {
      return this.get('model')
    }

  }.property('selectedService')
});

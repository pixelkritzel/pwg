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
      this.set('password', password);
    }
  },
  selectedService: null
});

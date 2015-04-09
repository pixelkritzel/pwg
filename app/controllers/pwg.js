import Ember from 'ember';

export default Ember.ArrayController.extend({
  actions: {
    setSelectedService: function(selectedService) {
      this.set('selectedService', selectedService);
      this.set('showServiceList', false);
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
      if(this.get('model').get('length') > 0) { this.set('showServiceList', true); }
    },

    saveService: function() {
      var newServiceName = this.get('selectedService');
      var newService = this.store.createRecord('service', {
        serviceName: newServiceName
      });
      newService.save();
      this.set('showServiceList', false);
    }


  },

  selectedService: null,
  showServiceList: false,

  filteredServices: function() {
    var selectedService = this.get('selectedService')
    if (selectedService) {
      return this.filter((serviceModel) => serviceModel.get('serviceName').indexOf(selectedService) !== -1)
    } else {
      return this.get('model');
    }
  }.property('selectedService'),

  isSaveAble: function() {

    var selectedService = this.get('selectedService') || "";
    selectedService = selectedService.trim();

    var isNotTheSame = function () {
      var withTheSameName = this.filter(
        (serviceModel) => serviceModel.get('serviceName') === selectedService );
      return withTheSameName.length === 0;
    }.bind(this);

    return selectedService.length > 0 && isNotTheSame();
  }.property('selectedService')
});

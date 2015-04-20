import Ember from 'ember';

export default Ember.ArrayController.extend({
  actions: {
    setSelectedService: function(selectedService) {
      this.set('selectedService', selectedService);
      this.set('showServiceList', false);
      this.set('errorService', false);
    },

    removeService: function(service) {
      service.deleteRecord();
      service.save();
    },

    generatePassword: function() {
      var selectedServiceName = this.get('selectedService');
      if (!selectedServiceName) {
        this.set('errorService', true);
      }
      var salt = this.get('salt') || "";
      if (salt.length < 6) {
        this.set('errorSalt', true);
      }
      if(this.get('errorService') || this.get('errorSalt')) {
        return false;
      }
      var combinedPassword = selectedServiceName + salt;
      var password = btoa(CryptoJS.SHA1(combinedPassword)).substr(0, 32);
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
    },

    selectedServiceKeyUp: function(x, event) {
      if ((this.get('selectedService') || "").trim().length > 0) {
        this.set('errorService', false);
      }
      var keycode = event.which;
      if (keycode === 13) {
        this.set('showServiceList', false);
        this.set('focusSaltField', true);
      }
      if (keycode === 27) {
        this.set('showServiceList', false);
      }
    },

    saltKeyUp: function() {
      if ((this.get('salt') || "").trim().length > 5) {
        this.set('errorSalt', false);
      }
    }
  },

  selectedService: null,
  showServiceList: false,
  errorService: false,
  errorSalt: false,
  errorMessageService: "You must provide a service name",
  errorMessageSalt: "Your salt must be at least 6 characters long",

  filteredServices: function() {
    var selectedService = this.get('selectedService');
    if (selectedService) {
      return this.filter((serviceModel) => serviceModel.get('serviceName').indexOf(selectedService) !== -1);
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

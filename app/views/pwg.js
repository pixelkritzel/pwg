import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {

    var controller = this.get('controller');
    var $selectedServiceContainer = $('.pwg_selected-service-container');

    $(window).on('click.pwgFocusControlForSelectedService', function(event) {
      if ( !$selectedServiceContainer.is(event.target) && $selectedServiceContainer.has(event.target).length === 0 ) {
        controller.set('showServiceList', false);
      }
    });
  },

  willDestroyElement: function() {
    $(window).off('click.pwgFocusControlForSelectedService');
  }
});
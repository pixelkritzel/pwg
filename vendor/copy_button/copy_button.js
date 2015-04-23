console.log('Step');
window.PWGCopyAble = true;

$('body').on('click', '.pwg_password-copy-button', function(){
  var $passwortElement = $('.pwg_password');
  var range = document.createRange();
  range.selectNode($passwortElement[0]);
  window.getSelection().addRange(range);

  try {
    document.execCommand('copy');
  } catch(err) {
  }
  window.getSelection().removeAllRanges();
});
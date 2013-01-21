//Detecting Mobile Clients
//http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser

function isMobile(){
  // if we want a more complete list use this: http://detectmobilebrowsers.com/
  // str.test() is more efficent than str.match()
  // remember str.test is case sensitive
  var _isMobile = (/iphone|ipod|android|ie|blackberry|fennec/).test
       (navigator.userAgent.toLowerCase());
  //return false;
  return _isMobile;
}

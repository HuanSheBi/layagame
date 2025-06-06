/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_portrait";

//-----libs-begin-----
loadLib("libs/min/laya.core.min.js")
loadLib("libs/min/laya.ani.min.js")
loadLib("libs/min/laya.html.min.js")
loadLib("libs/min/laya.ui.min.js")
loadLib("libs/min/md5.min.js")
//-----libs-end-------
// loadLib("libs/min/vconsole.min.js")

// if(window.wx || window.tt){
//     loadLib("libs/min/runtime.min.js")
//     window.Parser = loadLib("libs/min/user/dom_parser.min.js");
// }

loadLib("js/bundle.js");

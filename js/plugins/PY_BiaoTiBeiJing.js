//=============================================================================
// PY_BiaoTiBeiJing.js
//=============================================================================
/*:
 * @plugindesc (v1.0)更改标题背景 
 * @author 破夜沙狼
 * @help 
使用说明：
这是一款自定义标题背景、菜单背景的插件。你也可以自定义一张标题界面的动态图片，
动态图片支持横向移动和纵向移动，可以选择动态图片的移动方式，且可以调整移动速度
1——10，以及透明度（1-255）。
图片使用说明：
位置：img/pictures/
默认图片名称：
标题图片：beijing
动态图片：beijing2
菜单图片：beijing3
图片可以任意选择，如果你未选择自己的图片直接使用插件，会提示以上三张图片不存在。



使用条款：本插件可免费用于非商业及商业用途。
请在游戏结尾名单中署名：破夜沙狼
	
	
 * @param 标题背景
 * @desc 请选择你的标题图片
 * @type file
 * @dir img/pictures/
 * @default beijing
 * 
 * @param 动态背景
 * @desc 请选择你的动态图片（云、雨等特效图片）
 * @type file
 * @dir img/pictures/
 * @default beijing2 
 
 * @param 菜单背景
 * @desc 请选择你的菜单背景图片
 * @type file
 * @dir img/pictures/
 * @default beijing3
 
 * @param 动态图片横纵向是否开启
 * @type select
 * @option 只开启横向移动
 * @value 0
 * @option 只开启纵向移动
 * @value 1
 * @option 都开启
 * @value 2
 * @desc 这个选项可以打开动态图片的运动模式
 * @default 1
 
 * @param 动态背景横向移动速度
 * @desc 移动速度1——10
 * @type number
 * @min 1
 * @max 10
 * @default 1
 
 * @param 动态背景纵向移动速度
 * @desc 移动速度1——10
 * @type number
 * @min 1
 * @max 10
 * @default 1
 
 * @param 动态背景透明度
 * @desc 透明度1-255
 * @type number
 * @min 1
 * @max 255
 * @default 100
 */
//=============================================================================
//加载标题背景动态图片
(function() {
//传入参数，并且将参数赋值
    var parameters = PluginManager.parameters('PY_BiaoTiBeiJing');
    
	var PY_biaoti = String(parameters['标题背景']);
    var PY_dongtai = String(parameters['动态背景']);
    var PY_caidan = String(parameters['菜单背景']);
	var PY_dongtaiX = Number(parameters['动态背景横向移动速度']);
	var PY_dongtaiY = Number(parameters['动态背景纵向移动速度']);
	var PY_dongtaiTm = Number(parameters['动态背景透明度']);
	var PY_dongtaiFs = parameters['动态图片横纵向是否开启'];
	
	
	Scene_Title.prototype.createBackground = function() {
//加载主页背景  
    this._backSprite1 = new Sprite(
ImageManager.loadPicture(PY_biaoti)
);
//加载动态背景
    this._backSprite2 = new TilingSprite(
ImageManager.loadPicture(PY_dongtai)
);
    this._backSprite2.move(0,0,Graphics.width,Graphics.height)
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
};
//设置背景2横向移动速度，透明度
	var new_Scene_Title_update = Scene_Title.prototype.update;
Scene_Title.prototype.update = function(){
new_Scene_Title_update.call(this);
//加入插件判断
    if(PY_dongtaiFs == 0){
		this._backSprite2.origin.x += PY_dongtaiX; //从右往左移动
	}
	if(PY_dongtaiFs == 1){
		this._backSprite2.origin.y -= PY_dongtaiY; //从上往下移动
	}
	if(PY_dongtaiFs == 2){
		this._backSprite2.origin.x += PY_dongtaiX; //从右往左移动
        this._backSprite2.origin.y -= PY_dongtaiY; //从上往下移动
	}
    // this._backSprite2.origin.x += PY_dongtaiX //从右往左移动
    // this._backSprite2.origin.y -= PY_dongtaiY //从上往下移动
    this._backSprite2.opacity = PY_dongtaiTm//传入参数，调整动态图片的透明度
};
//加载菜单背景
Scene_MenuBase.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    ImageManager.loadPicture(PY_caidan);
};
Scene_MenuBase.prototype.createBackground = function() {
     this._backgroundSprite = new Sprite();
     this._backgroundSprite.bitmap = ImageManager.loadPicture(PY_caidan);
     this.addChild(this._backgroundSprite);
};	
	
})();




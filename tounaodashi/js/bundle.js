(function () {
    'use strict';

    class ConfigBase {
    }

    class CfgLevel extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.type = data.type;
            this.sort = data.sort;
            this.show = data.show == 1;
            this.name = data.name;
            this.title = data.title;
            this.videoTip = data.videoTip.split("||");
            this.videoAnswer = data.videoAnswer;
            this.time = data.time;
            this.addTime = data.addTime;
            this.subTime = data.subTime;
            this.levelId = data.levelId;
            this.bgm = data.bgm;
            this.prologue = data.prologue;
            this.winTalk = data.winTalk;
            this.loseTalk = data.loseTalk;
            this.maxHeight = data.maxHeight;
            this.answertxt = data.answertxt;
            return this.id;
        }
        configName() {
            return "Level";
        }
    }

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["INFO"] = 1] = "INFO";
        LogLevel[LogLevel["WARN"] = 2] = "WARN";
        LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
        LogLevel[LogLevel["NOT"] = 4] = "NOT";
    })(LogLevel || (LogLevel = {}));
    class Log {
        static l(msg, tag = "") {
            if (this.isIgnoreTag(tag)) {
                return;
            }
            if (this.level > LogLevel.INFO && !this.isAlwayShowTag(tag)) {
                return;
            }
            console.log(`[${Laya.timer.currFrame}][${tag}] ${msg}`);
        }
        static w(msg, tag = "") {
            if (this.isIgnoreTag(tag)) {
                return;
            }
            if (this.level > LogLevel.WARN && !this.isAlwayShowTag(tag)) {
                return;
            }
            console.warn(`[${Laya.timer.currFrame}][${tag}] ${msg}`);
        }
        static e(msg, tag = "") {
            if (this.isIgnoreTag(tag)) {
                return;
            }
            if (this.level > LogLevel.ERROR && !this.isAlwayShowTag(tag)) {
                return;
            }
            console.error(`[${Laya.timer.currFrame}][${tag}] ${msg}`);
        }
        static setLevel(level) {
            let l = null;
            if (typeof level == "string") {
                let levellow = level.toLowerCase();
                if (levellow == "info") {
                    l = LogLevel.INFO;
                }
                else if (levellow == "warn") {
                    l = LogLevel.WARN;
                }
                else if (levellow == "error") {
                    l = LogLevel.ERROR;
                }
                else if (levellow == "not") {
                    l = LogLevel.NOT;
                }
                else {
                    this.e("日志等级" + level + "不存在");
                }
            }
            else {
                l = level;
            }
            this.l("日志等级  " + LogLevel[l], "Log");
            this.level = l;
        }
        static setIgnoreTag(tag) {
            if (typeof tag == "string") {
                this.ignoreTags.set(tag, true);
            }
            else {
                tag.forEach((t) => this.ignoreTags.set(t, true));
            }
        }
        static isIgnoreTag(tag) {
            return this.ignoreTags.has(tag);
        }
        static setAlwayShowTag(tag) {
            if (typeof tag == "string") {
                this.alwayShowTags.set(tag, true);
            }
            else {
                tag.forEach((t) => this.alwayShowTags.set(t, true));
            }
        }
        static isAlwayShowTag(tag) {
            return this.alwayShowTags.has(tag);
        }
    }
    Log.level = LogLevel.INFO;
    Log.ignoreTags = new Map();
    Log.alwayShowTags = new Map();

    class ConfigManager {
        static loadAllConfigFile(handler, progress = null) {
            let pathAllListConfig = this.getTablePathByName("Config");
            Laya.loader.load(pathAllListConfig, Laya.Handler.create(this, () => {
                let jsonObj = Laya.loader.getRes(pathAllListConfig);
                let list = [];
                for (let i = 0; i < jsonObj.all.length; i++) {
                    list.push(this.getTablePathByName(jsonObj.all[i]));
                }
                if (list.length == 0) {
                    handler.run();
                }
                else {
                    Laya.loader.load(list, handler, progress, Laya.Loader.JSON, 0, true, "config", true);
                }
            }), null, Laya.Loader.JSON);
        }
        static GetConfig(tType) {
            let configName = new tType().configName();
            if (this.allConfigMap[configName] == null) {
                this.allConfigMap[configName] = {};
                let path = this.getTablePathByName(configName);
                let objJson = Laya.loader.getRes(path);
                let map = new Map();
                console.log(objJson);
                if (objJson == null) {
                    Log.e(`获取配置${configName}失败，需要在loadAllConfigFile中加载文件`, "ConfigManager");
                }
                for (const key in objJson) {
                    let obj = new tType();
                    let key1 = obj.parse(objJson[key]);
                    if (map.has(key1)) {
                        Log.w(`配置表[${configName}]Key=${key1}重复`, "ConfigManager");
                    }
                    map.set(key1, obj);
                }
                this.allConfigMap[configName] = map;
            }
            return this.allConfigMap[configName];
        }
        static GetConfigByKey(tType, key) {
            return this.GetConfig(tType).get(key);
        }
        static getConfigFilePath(tType) {
            let configName = new tType().configName();
            return this.getTablePathByName(configName);
        }
        static getTablePathByName(configName) {
            return "res/config/" + configName + ".json";
        }
    }
    ConfigManager.allConfigMap = {};

    class Game {
    }
    Game.currentGameType = 0;
    Game.viewType = "";
    Game.currentGroupID = 0;
    Game.currentLevelID = 0;
    Game.currentLevelIndex = 0;
    Game.currnetLevelName = "";
    Game.debugUnlockAll = false;
    Game.hasTips = false;
    Game.hasAnswer = false;

    class MathUtil {
        static radianToDegree(radian) {
            return radian / Math.PI * 180;
        }
        static degreeToRadian(degree) {
            return degree * Math.PI / 180;
        }
        static abs(f) {
            return Math.abs(f);
        }
        static clamp(value, min, max) {
            if (value < min) {
                value = min;
            }
            else if (value > max) {
                value = max;
            }
            return value;
        }
        static clamp01(value) {
            if (value < 0) {
                return 0;
            }
            if (value > 1) {
                return 1;
            }
            return value;
        }
        static deltaAngle(current, target) {
            let num = MathUtil.repeat(target - current, 360);
            if (num > 180) {
                num -= 360;
            }
            return num;
        }
        static floor(f) {
            return Math.floor(f);
        }
        static lerp(a, b, t) {
            return a + (b - a) * MathUtil.clamp01(t);
        }
        static lerpAngle(a, b, t) {
            let num = MathUtil.repeat(b - a, 360);
            if (num > 180) {
                num -= 360;
            }
            return a + num * MathUtil.clamp01(t);
        }
        static max(a, b) {
            return (a <= b) ? b : a;
        }
        static moveTowards(current, target, maxDelta) {
            if (MathUtil.abs(target - current) <= maxDelta) {
                return target;
            }
            return current + MathUtil.sign(target - current) * maxDelta;
        }
        static moveTowardsAngle(current, target, maxDelta) {
            target = current + MathUtil.deltaAngle(current, target);
            return MathUtil.moveTowards(current, target, maxDelta);
        }
        static pingPong(t, length) {
            t = MathUtil.repeat(t, length * 2);
            return length - MathUtil.abs(t - length);
        }
        static repeat(t, length) {
            return t - MathUtil.floor(t / length) * length;
        }
        static sign(f) {
            return (f < 0) ? -1 : 1;
        }
        static smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed = Number.MAX_VALUE, deltaTime = Laya.timer.delta) {
            smoothTime = MathUtil.max(0.0001, smoothTime);
            let num = 2 / smoothTime;
            let num2 = num * deltaTime;
            let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
            let num4 = current - target;
            let num5 = target;
            let num6 = maxSpeed * smoothTime;
            num4 = MathUtil.clamp(num4, -num6, num6);
            target = current - num4;
            let num7 = (currentVelocity + num * num4) * deltaTime;
            currentVelocity = (currentVelocity - num * num7) * num3;
            let num8 = target + (num4 + num7) * num3;
            if (num5 - current > 0 == num8 > num5) {
                num8 = num5;
                currentVelocity = (num8 - num5) / deltaTime;
            }
            return [num8, currentVelocity];
        }
        static smoothDampAngle(current, target, currentVelocity, smoothTime, maxSpeed = Number.MAX_VALUE, deltaTime = Laya.timer.delta) {
            target = current + MathUtil.deltaAngle(current, target);
            return MathUtil.smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime);
        }
    }

    class LevelTouchBase extends Laya.Panel {
        constructor() {
            super();
            this.isLoading = false;
            this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            this.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            this.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseWheel);
            this.isMove = false;
            this.tempPos = new Laya.Point();
            this.isScale = false;
            this.lastDistance = 0;
        }
        init(sp) {
            Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
            Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
            this.levelSprite = sp;
            this.levelScale = 970 / this.levelSprite.height;
            this.levelSprite.x = 0;
            this.levelSprite.y = 0;
            this.cScale = 1;
            this.offsetX = this.offsetY = 0;
            this.updatePos(0, 0);
            this.updateScale(this.cScale);
        }
        onStageResize() {
            this.updatePos(0, 0);
        }
        updatePos(x, y) {
            let s = this.levelScale * this.cScale;
            let x1 = this.offsetX + x;
            let y1 = this.offsetY + y;
            let mw = Math.max(0, (this.levelSprite.width * s - this.width) / 2);
            let mh = Math.max(0, (this.levelSprite.height * s - this.height) / 2);
            this.offsetX = MathUtil.clamp(x1, -mw, mw);
            this.offsetY = MathUtil.clamp(y1, -mh, mh);
            this.setPosition(this.offsetX, this.offsetY);
        }
        updateScale(ns) {
            this.cScale = ns;
            let s = this.levelScale * this.cScale;
            this.levelSprite.scale(s, s);
            this.updatePos(0, 0);
        }
        setPosition(x, y) {
            let s = this.levelScale * this.cScale;
            let lw = this.levelSprite.width * s;
            let lh = this.levelSprite.height * s;
            this.levelSprite.pos((this.width - lw) / 2 + x, (this.height - lh) / 2 + y);
        }
        onMouseDown(e) {
            if (this.isLoading) {
                return;
            }
            this.isMove = true;
            if (e.touches && e.touches.length > 1) {
                this.lastDistance = this.getDistance(e.touches);
                this.isScale = true;
            }
            else {
                this.tempPos.setTo(e.stageX, e.stageY);
            }
        }
        onMouseMove(e) {
            if (this.isLoading) {
                return;
            }
            if (this.isScale && e.touches && e.touches.length > 1) {
                let distance = this.getDistance(e.touches);
                const factor = 0.01;
                let delta = (distance - this.lastDistance) * factor;
                let s = this.cScale + delta;
                let ns = MathUtil.clamp(s, 1, 2);
                this.lastDistance = distance;
                this.updateScale(ns);
            }
            if (this.isMove) {
                this.updatePos(e.stageX - this.tempPos.x, e.stageY - this.tempPos.y);
                this.tempPos.setTo(e.stageX, e.stageY);
            }
        }
        onMouseUp(e) {
            this.isMove = false;
            if (e.touches && e.touches.length < 2) {
                this.isScale = false;
            }
        }
        onMouseWheel(e) {
            if (this.isLoading) {
                return;
            }
            let s = this.cScale + e.delta * 0.01;
            let ns = MathUtil.clamp(s, 1, 2);
            this.updateScale(ns);
        }
        getDistance(points) {
            let distance = 0;
            if (points && points.length == 2) {
                let dx = points[0].stageX - points[1].stageX;
                let dy = points[0].stageY - points[1].stageY;
                distance = Math.sqrt(dx * dx + dy * dy);
            }
            return distance;
        }
    }

    class GameDispatcher extends Laya.EventDispatcher {
        constructor() {
            super();
        }
        static getInstance() {
            return this._instance;
        }
    }
    GameDispatcher._instance = new GameDispatcher();

    class EventName {
    }
    EventName.CORE_GAME_SHOW = "CORE_GAME_SHOW";
    EventName.MAIN_ON = "MAIN_ON";
    EventName.MAIN_OFF = "MAIN_OFF";
    EventName.GAME_WIN = "GAME_WIN";
    EventName.GAME_CLICK_TIP = "GAME_CLICK_TIP";
    EventName.GAME_SHOW_CORRECT = "GAME_SHOW_CORRECT";
    EventName.GAME_REMAKE = "GAME_REMAKE";
    EventName.LIFE = "LIFE";
    EventName.yuanbao = "yuanbao";
    EventName.status = "status";
    EventName.HOUSE = "HOUSE";
    EventName.GRADE = "GRADE";
    EventName.ADD_LIFE = "ADD_LIFE";
    EventName.USER_UPDATE = "USER_UPDATE";
    EventName.OPEN_CLOSE_AUDIO = "OPEN_CLOSE_AUDIO";
    EventName.MAIN_SHOW_NEW_CELEB = "MAIN_SHOW_NEW_CELEB";
    EventName.MAIN_REFRESH_CELEB = "MAIN_REFRESH_CELEB";

    class SoundHelper {
        static playSound(url, loops, complete, soundClass, startTime) {
            if (Laya.Render.isConchApp) {
                return;
            }
            return Laya.SoundManager.playSound(url, loops, complete, soundClass, startTime);
        }
        static playButton() {
            SoundHelper.playSound("res/sounds/eff_button.mp3");
        }
        static playFind() {
            SoundHelper.playSound("res/sounds/eff_find.mp3");
        }
        static playClickBg() {
            SoundHelper.playSound("res/sounds/eff_clickbg.mp3");
        }
        static clickClose() {
            SoundHelper.playSound("res/sounds/clickClose.mp3");
        }
        static playTalk(path, callback) {
            if (this.talkSoundChannel) {
                this.talkSoundChannel.completeHandler = null;
                this.talkSoundChannel.stop();
                this.talkSoundChannel = null;
            }
            this.talkSoundChannel = Laya.SoundManager.playSound(path, 1);
            Laya.timer.clearAll(this);
            Laya.timer.frameOnce(10, this, () => {
                let t = !!this.talkSoundChannel && this.talkSoundChannel.duration ? Math.floor(this.talkSoundChannel.duration * 1000) : 2000;
                console.log(t);
                Laya.timer.once(t, this, () => {
                    this.talkSoundChannel = null;
                    callback && callback();
                });
            });
        }
        static stopTalk() {
            if (this.talkSoundChannel) {
                this.talkSoundChannel.completeHandler = null;
                this.talkSoundChannel.stop();
                this.talkSoundChannel = null;
            }
        }
    }

    class LevelBase extends Laya.Script {
        constructor() {
            super(...arguments);
            this.bgm = "";
            this.isOpenClickSound = true;
            this.mouseStartPos = new Laya.Point();
        }
        get cfg() {
            return this.levelCfg;
        }
        onAwake() {
            this.findList = [];
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, (e) => this.mouseStartPos.setTo(e.stageX, e.stageY));
            this.owner.on(Laya.Event.CLICK, this, (e) => {
                if (this.isOpenClickSound && this.mouseStartPos.distance(e.stageX, e.stageY) < 5) {
                    SoundHelper.playClickBg();
                }
                this.mouseStartPos.setTo(-10000, -10000);
            });
            Laya.stage.on(Laya.Event.RESIZE, this, this.onAdapter);
        }
        onDestroy() {
            GameDispatcher.getInstance().offAllCaller(this);
            Laya.stage.offAllCaller(this);
            Laya.SoundManager.stopAllSound();
        }
        onEventClick(i, pos) {
            this.findList.push(i);
        }
        onInit() { }
        onAdapter() { }
        init(id) {
            this.levelCfg = ConfigManager.GetConfigByKey(CfgLevel, id);
            this.subUrl = `sub/${this.levelCfg.levelId}/`;
            this.onInit();
        }
        getTips() {
            return this.levelCfg.videoTip[0];
        }
        getAnswer() {
            return `sub/${this.levelCfg.levelId}/answer0.png`;
        }
        getFindNum() {
        }
        getIconByID(id) {
        }
        getBGM() {
            if (this.cfg.bgm == "") {
                return null;
            }
            else if (this.bgm != null && this.bgm != "") {
                return `sub/${this.levelCfg.levelId}/${this.bgm}.mp3`;
            }
            else {
                return `res/sounds/${this.cfg.bgm}.mp3`;
            }
        }
        showClickTip(num, pos) {
            let self = this.owner;
            !pos && (pos = new Laya.Point(375, 701));
            if (num == 0) {
                GameDispatcher.getInstance().event(EventName.GAME_CLICK_TIP, [0, pos]);
            }
            else {
                GameDispatcher.getInstance().event(EventName.GAME_CLICK_TIP, [1, pos]);
            }
        }
        showCorrect(X, Y) {
            if (!X) {
                GameDispatcher.getInstance().event(EventName.GAME_SHOW_CORRECT, [375, 701]);
            }
            else {
                GameDispatcher.getInstance().event(EventName.GAME_SHOW_CORRECT, [X, Y]);
            }
        }
        updateScale(s) {
        }
        enableClickSound(isOn) {
            this.isOpenClickSound = isOn;
        }
    }

    class HttpHelper {
        static async getAsync(url, para = null, headers = null) {
            return new Promise((resolve, reject) => {
                if (!!para && !url.includes("?")) {
                    let isFirst = true;
                    for (let key in para) {
                        if (isFirst) {
                            url += `?${key}=${para[key]}`;
                            isFirst = false;
                        }
                        else {
                            url += `&${key}=${para[key]}`;
                        }
                    }
                }
                let xhr = new Laya.HttpRequest();
                xhr.http.timeout = 3000;
                xhr.send(url, null, "get", "json", headers);
                xhr.once(Laya.Event.COMPLETE, this, (data) => {
                    resolve([true, data]);
                });
                xhr.once(Laya.Event.ERROR, this, (data) => {
                    resolve([false, data]);
                });
            });
        }
        static async postAsync(url, para = null, headers = null) {
            return new Promise((resolve, reject) => {
                let data = "";
                if (!!para && !url.includes("?")) {
                    let isFirst = true;
                    for (let key in para) {
                        if (isFirst) {
                            data += `${key}=${para[key]}`;
                            isFirst = false;
                        }
                        else {
                            data += `&${key}=${para[key]}`;
                        }
                    }
                }
                let xhr = new Laya.HttpRequest();
                xhr.http.timeout = 10000;
                xhr.send(url, data, "post", "json", headers);
                xhr.once(Laya.Event.COMPLETE, this, (data) => {
                    resolve([true, data]);
                });
                xhr.once(Laya.Event.ERROR, this, (data) => {
                    resolve([false, data]);
                });
            });
        }
    }

    class AppConfig {
        static async init() {
            if (!this.isLoadRemoteConfig) {
                Log.l("使用本地配置", "AppConfig");
            }
            else {
                let [isOk, data] = await HttpHelper.getAsync(this.remoteConfigPath);
                if (!isOk) {
                    console.log("加载远程配置失败", data);
                }
                else {
                    let config = JSON.parse(data);
                    for (let key in config) {
                        AppConfig[key] = config[key];
                    }
                    Log.l("使用远程游戏配置" + data, "AppConfig");
                }
            }
            Log.setLevel(AppConfig.logLevel);
            Log.setIgnoreTag(AppConfig.logIgnore.split(","));
            Log.setAlwayShowTag(AppConfig.logAlway.split(","));
            if (Laya.Browser.onMiniGame) {
                this.phpRoot = "https://gamezoo-admin.6899game.com/apiWx/";
                Laya.MiniAdpter.AutoCacheDownFile = true;
            }
            else if (Laya.Browser.onVVMiniGame) {
                this.phpRoot = "https://gamezoo-admin.6899game.com/apiVi/";
            }
            else if (Laya.Browser.onTTMiniGame) {
                this.phpRoot = "https://gamezoo-admin.6899game.com/apiTt/";
            }
        }
    }
    AppConfig.appName = "QMSN";
    AppConfig.isLoadRemoteConfig = false;
    AppConfig.remoteConfigPath = "http://racecar.6899game.com/release/phpApi/AppConfig.php";
    AppConfig.versionJson = "version.json";
    AppConfig.logLevel = "info";
    AppConfig.logIgnore = "ModelPool,Net:Msg";
    AppConfig.logAlway = "";
    AppConfig.phpRoot = "https://gamezoo-admin.6899game.com/apiWx/";
    AppConfig.remoteUrl = "";
    AppConfig.zipUrl = "https://yhhf-res.6899game.com/lnlzc/v2/";
    AppConfig.wxRewardedVideoAd = "adunit-eccfc17cbc7a257b";
    AppConfig.wxInterstitialAd = "adunit-d15b0db8ef57492e";
    AppConfig.wxBannerAdID = "adunit-d442b9586333cd61";
    AppConfig.lvList = [3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17, 21, 25, 26];
    AppConfig.ttRewardedVideoAd = "2cs64qugiq43i6n73g";
    AppConfig.ttInterstitialAd = "519ues0mq7e28e2ejg";
    AppConfig.shareTitle = "闯关游戏，领取红包";
    AppConfig.shareImage = "share.png";
    AppConfig.shareInviteCode = "";

    class LayerMgr {
        static getLayer(layer) {
            let l = this.layerMap.get(layer);
            if (l) {
                return l;
            }
            l = new Laya.Sprite();
            l.name = "LayerMgr_" + layer;
            Laya.stage.addChild(l);
            l.zOrder = layer;
            this.layerMap.set(layer, l);
            return l;
        }
    }
    LayerMgr.LAYER_BG = 0;
    LayerMgr.LAYER_GAMEVIEW = 50;
    LayerMgr.LAYER_MAIN = 100;
    LayerMgr.LAYER_DIALOG = 1000;
    LayerMgr.LAYER_TIPS = 2000;
    LayerMgr.LAYER_FLYCOIN = 3000;
    LayerMgr.layerMap = new Map();

    class UIShowOption {
    }
    class UIMgr {
        static show(uiname, argc, option) {
            Log.l("显示UI " + uiname + " " + argc, "UIMgr");
            let ctl = this.getCtlByName(uiname);
            this._currentWindow = ctl;
            ctl.show(argc);
        }
        static hide(uiname) {
            if (!this._uiBaseCtlMap.get(uiname)) {
                return;
            }
            let ctl = this.getCtlByName(uiname);
            if (ctl) {
                Log.l("隐藏UI " + uiname, "UIMgr");
                this._currentWindow = null;
                ctl.hide();
            }
        }
        static preloadingUI(list, complete = null, process = null) {
            let num = list.length;
            for (let i = 0; i < list.length; i++) {
                let name = list[i];
                Log.l("预加载UI " + name, "UIMgr");
                let ctl = this.getCtlByName(name);
                ctl.preloading(() => {
                    num--;
                    process && process.runWith((list.length - num) / list.length);
                    if (num == 0) {
                        complete && complete.run();
                    }
                });
            }
        }
        static registerUI(key, clazz, isLoad = false) {
            if (this._uiClassMap.has(key)) {
                Log.l("重复注册UI" + key);
            }
            else {
                this._uiClassMap.set(key, clazz);
            }
        }
        static showLoading(msg = "") {
        }
        static hideLoading() {
        }
        static showToast() { }
        static hideToast() { }
        static showMessageBox() { }
        static hideMessageBox() { }
        static loadBG(url) {
            let l_bg = LayerMgr.getLayer(LayerMgr.LAYER_BG);
            let bg = l_bg.getChildByName("bg");
            if (bg == null) {
                bg = new Laya.Image();
                l_bg.addChild(bg);
                bg.name = "bg";
                bg.width = Laya.stage.width;
                bg.height = Laya.stage.height;
                Laya.stage.on(Laya.Event.RESIZE, this, () => {
                    bg.width = Laya.stage.width;
                    bg.height = Laya.stage.height;
                });
            }
            bg.skin = url;
        }
        static getNextLayerZOrder(l) {
            let z = this._uiLayerZOrderMap.get(l);
            if (z) {
                this._uiLayerZOrderMap.set(l, ++z);
                return z;
            }
            else {
                this._uiLayerZOrderMap.set(l, 1);
                return 1;
            }
        }
        static getCtlByName(uiname) {
            let clazz = this._uiClassMap.get(uiname);
            if (clazz == null) {
                Log.l("UI--" + uiname + "未注册", "UIMgr");
                return;
            }
            let ctl = this._uiBaseCtlMap.get(uiname);
            if (!ctl) {
                ctl = new clazz();
                this._uiBaseCtlMap.set(uiname, ctl);
            }
            return ctl;
        }
    }
    UIMgr._uiClassMap = new Map();
    UIMgr._uiBaseCtlMap = new Map();
    UIMgr._uiLayerZOrderMap = new Map();
    UIMgr._currentWindow = null;
    UIMgr._dialogList = [];

    var View = Laya.View;
    var Dialog = Laya.Dialog;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var common;
        (function (common) {
            class MessageBoxUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("common/MessageBox");
                }
            }
            common.MessageBoxUI = MessageBoxUI;
            REG("ui.common.MessageBoxUI", MessageBoxUI);
        })(common = ui.common || (ui.common = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var collect;
            (function (collect) {
                class BtmCharacterItemUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/collect/BtmCharacterItem");
                    }
                }
                collect.BtmCharacterItemUI = BtmCharacterItemUI;
                REG("ui.view.collect.BtmCharacterItemUI", BtmCharacterItemUI);
                class CardSwitchItemUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/collect/CardSwitchItem");
                    }
                }
                collect.CardSwitchItemUI = CardSwitchItemUI;
                REG("ui.view.collect.CardSwitchItemUI", CardSwitchItemUI);
                class CelebItemUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/collect/CelebItem");
                    }
                }
                collect.CelebItemUI = CelebItemUI;
                REG("ui.view.collect.CelebItemUI", CelebItemUI);
            })(collect = view.collect || (view.collect = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var game;
            (function (game) {
                class GameUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/Game");
                    }
                }
                game.GameUI = GameUI;
                REG("ui.view.game.GameUI", GameUI);
                class GameSkipUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/GameSkip");
                    }
                }
                game.GameSkipUI = GameSkipUI;
                REG("ui.view.game.GameSkipUI", GameSkipUI);
                class GameStoreUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/GameStore");
                    }
                }
                game.GameStoreUI = GameStoreUI;
                REG("ui.view.game.GameStoreUI", GameStoreUI);
                class GameTipsUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/GameTips");
                    }
                }
                game.GameTipsUI = GameTipsUI;
                REG("ui.view.game.GameTipsUI", GameTipsUI);
            })(game = view.game || (view.game = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var level;
            (function (level) {
                class BigLvUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/level/BigLv");
                    }
                }
                level.BigLvUI = BigLvUI;
                REG("ui.view.level.BigLvUI", BigLvUI);
                class LvSelectUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/level/LvSelect");
                    }
                }
                level.LvSelectUI = LvSelectUI;
                REG("ui.view.level.LvSelectUI", LvSelectUI);
                class LvSelectTowUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/level/LvSelectTow");
                    }
                }
                level.LvSelectTowUI = LvSelectTowUI;
                REG("ui.view.level.LvSelectTowUI", LvSelectTowUI);
                class SmallLvUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/level/SmallLv");
                    }
                }
                level.SmallLvUI = SmallLvUI;
                REG("ui.view.level.SmallLvUI", SmallLvUI);
            })(level = view.level || (view.level = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            class LoadingUI extends Dialog {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("view/Loading");
                }
            }
            view.LoadingUI = LoadingUI;
            REG("ui.view.LoadingUI", LoadingUI);
            class LoginUI extends Dialog {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("view/Login");
                }
            }
            view.LoginUI = LoginUI;
            REG("ui.view.LoginUI", LoginUI);
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var main;
            (function (main) {
                class CelebrityUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/Celebrity");
                    }
                }
                main.CelebrityUI = CelebrityUI;
                REG("ui.view.main.CelebrityUI", CelebrityUI);
                class GameWinUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/GameWin");
                    }
                }
                main.GameWinUI = GameWinUI;
                REG("ui.view.main.GameWinUI", GameWinUI);
                class MainUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/Main");
                    }
                }
                main.MainUI = MainUI;
                REG("ui.view.main.MainUI", MainUI);
                class MainLifeUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/MainLife");
                    }
                }
                main.MainLifeUI = MainLifeUI;
                REG("ui.view.main.MainLifeUI", MainLifeUI);
                class MainStarUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/MainStar");
                    }
                }
                main.MainStarUI = MainStarUI;
                REG("ui.view.main.MainStarUI", MainStarUI);
                class MyDevUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/MyDev");
                    }
                }
                main.MyDevUI = MyDevUI;
                REG("ui.view.main.MyDevUI", MyDevUI);
                class MySchoolUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/MySchool");
                    }
                }
                main.MySchoolUI = MySchoolUI;
                REG("ui.view.main.MySchoolUI", MySchoolUI);
            })(main = view.main || (view.main = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var setting;
            (function (setting) {
                class GameSettingUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/setting/GameSetting");
                    }
                }
                setting.GameSettingUI = GameSettingUI;
                REG("ui.view.setting.GameSettingUI", GameSettingUI);
            })(setting = view.setting || (view.setting = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var turntable;
            (function (turntable) {
                class TurntableUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/turntable/Turntable");
                    }
                }
                turntable.TurntableUI = TurntableUI;
                REG("ui.view.turntable.TurntableUI", TurntableUI);
                class TurntableResultUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/turntable/TurntableResult");
                    }
                }
                turntable.TurntableResultUI = TurntableResultUI;
                REG("ui.view.turntable.TurntableResultUI", TurntableResultUI);
            })(turntable = view.turntable || (view.turntable = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));

    class MessageBox extends ui.common.MessageBoxUI {
        constructor(tips, txtBtn1 = null, callback1 = null, txtBtn2 = null, callback2 = null, align = "center") {
            super();
            if (txtBtn1 && txtBtn2) {
                this.btn1.x = 46;
                this.btn2.x = 242;
            }
            else if (txtBtn1) {
                this.btn1.x = 144;
            }
            else if (txtBtn2) {
                this.btn2.x = 144;
            }
            if (txtBtn1) {
                this.btn1.skin = this.getBtnImage(txtBtn1);
            }
            if (txtBtn2) {
                this.btn2.skin = this.getBtnImage(txtBtn2);
            }
            if (callback1) {
                this._callback1 = callback1;
            }
            if (callback2) {
                this._callback2 = callback1;
            }
            this.btn1.visible = !!txtBtn1;
            this.btn2.visible = !!txtBtn2;
            this.btn1.on(Laya.Event.CLICK, this, () => {
                this._callback1 && this._callback1.run();
                this.removeSelf();
            });
            this.btn2.on(Laya.Event.CLICK, this, () => {
                this._callback2 && this._callback2.run();
                this.removeSelf();
            });
            this.tips.text = tips;
            this.tips.align = align;
            this.content.x = Laya.stage.width / 2;
            this.content.y = Laya.stage.height / 2;
        }
        static show(tips, txtBtn1 = null, callback1 = null, txtBtn2 = null, callback2 = null, align = "center") {
            let box = new MessageBox(tips, txtBtn1, callback1, txtBtn2, callback2, align);
            let layer = LayerMgr.getLayer(LayerMgr.LAYER_TIPS);
            layer.addChild(box);
            box.width = Laya.stage.width;
            box.height = Laya.stage.height;
            box.zOrder = UIMgr.getNextLayerZOrder(LayerMgr.LAYER_TIPS);
        }
        getBtnImage(btnTxt) {
            switch (btnTxt) {
                case "确定": return "res/ui/messagebox/ok.png";
                case "取消": return "res/ui/messagebox/cancel.png";
                case "重试": return "res/ui/messagebox/retry.png";
            }
        }
    }

    class Serializable {
        constructor() {
        }
        getJson() {
            return JSON.stringify(this);
        }
        setJson(json) {
            if (json == null || json == "")
                return;
            let obj = JSON.parse(json);
            let thisobj = this;
            for (let key in obj) {
                thisobj[key] = obj[key];
            }
        }
        save() {
            localStorage.setItem(this.getSaveKey(), this.getJson());
        }
        load() {
            var str = localStorage.getItem(this.getSaveKey());
            console.log("读档[" + this.getSaveKey() + "]" + str);
            this.setJson(str);
        }
        getSaveKey() {
            return `SaveData.${AppConfig.appName}.${this["constructor"].name}`;
        }
    }

    class LevelCacheSerializable extends Serializable {
        constructor() {
            super(...arguments);
            this.map = {};
        }
        getSaveKey() {
            return `SaveData.${AppConfig.appName}.LevelCacheSerializable`;
        }
    }

    class CfgLevelGroup extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.isOpen = data.isOpen == 1;
            this.isShow = data.isShow == 1;
            this.roleNum = data.roleNum;
            this.unlockNum = data.unlockNum;
            this.sort = data.sort;
            this.level = data.level == "" ? [] : data.level.split(',').map(v => parseInt(v));
            return this.id;
        }
        configName() {
            return "LevelGroup";
        }
    }

    class UIDefine {
    }
    UIDefine.UILoginCtl = "UILoginCtl";
    UIDefine.UIMainCtl = "UIMainCtl";
    UIDefine.UIGameCtl = "UIGameCtl";
    UIDefine.UIGameWinCtl = "UIGameWinCtl";
    UIDefine.UIGameSettingCtl = "UIGameSettingCtl";
    UIDefine.UITurntableCtl = "UITurntableCtl";
    UIDefine.UIMainStarCtl = "UIMainStarCtl";
    UIDefine.UIMainLifeCtl = "UIMainLifeCtl";
    UIDefine.UITurntableResultCtl = "UITurntableResultCtl";
    UIDefine.UICelebrityCtl = "UICelebrityCtl";
    UIDefine.UILvSelectCtl = "UILvSelectCtl";
    UIDefine.UILvSelectTowCtl = "UILvSelectTowCtl";
    UIDefine.UIMySchoolCtl = "UIMySchoolCtl";
    UIDefine.UIMyDevCtl = "UIMyDevCtl";
    UIDefine.UIGameStoreCtl = "UIGameStoreCtl";
    UIDefine.UIGameTipsCtl = "UIGameTipsCtl";
    UIDefine.UIGameSkipCtl = "UIGameSkipCtl";

    class LevelHelp {
        static getLevelIndex(lv) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, Game.currentGroupID);
            if (cfg == null) {
                return 0;
            }
            else {
                return cfg.level.indexOf(lv) + 1;
            }
        }
        static getLeveListChunk(groupID) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, groupID);
            return LevelHelp.chunk(cfg.level, 6);
        }
        static getFirstUnlockID(groupID, passList) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, groupID);
            for (let i = 0; i < cfg.level.length; i++) {
                if (passList.indexOf(cfg.level[i]) == -1) {
                    return cfg.level[i];
                }
            }
            return -1;
        }
        static getNextLevel(id) {
            let list = ConfigManager.GetConfigByKey(CfgLevelGroup, 1).level;
            let index = list.indexOf(id);
            let next = Math.min(index + 1, list.length - 1);
            return list[next];
        }
        static chunk(array, size) {
            const result = [];
            let index = 0;
            while (index < array.length) {
                result.push(array.slice(index, index + size));
                index += size;
            }
            return result;
        }
        static openLevel(id) {
            UIMgr.show(UIDefine.UIGameCtl, id);
        }
        static closeLevel() {
            UIMgr.hide(UIDefine.UIGameCtl);
        }
    }

    class TTLevelLoader {
        init() {
            this.map = Laya.loader.getRes("res/file.json");
            this.data = new LevelCacheSerializable();
            this.data.load();
            Laya.URL.customFormat = (url) => {
                if (url.substring(0, 4) == "sub/") {
                    return "~ttfile://user/" + url;
                }
                else {
                    return url;
                }
            };
        }
        downlaod(level, handle, process) {
            if (this.hasCache(level)) {
                handle.run();
                return;
            }
            process && process.runWith(0);
            let task = Laya.Browser.window.tt.downloadFile({
                url: AppConfig.zipUrl + this.map[level] + ".zip",
                success: (res) => {
                    if (res.statusCode === 200) {
                        console.log("压缩包下在成功 => " + `${res.tempFilePath}`);
                        this.unzip(res.tempFilePath, level, handle);
                    }
                },
                fail: (res) => {
                    console.log(`downloadFile调用失败`, res);
                    MessageBox.show("关卡加载失败，是否重试", "重试", Laya.Handler.create(this, () => {
                        this.downlaod(level, handle, process);
                    }), "取消", Laya.Handler.create(this, () => {
                        LevelHelp.closeLevel();
                        UIMgr.show(UIDefine.UILvSelectCtl);
                    }));
                },
            });
            task.onProgressUpdate((res) => {
                process && process.runWith(res.progress / 100);
            });
        }
        unzip(path, levelID, handle) {
            let fileSystemManager = Laya.Browser.window.tt.getFileSystemManager();
            fileSystemManager.unzip({
                zipFilePath: path,
                targetPath: "ttfile://user/sub/" + levelID,
                success: (_res) => {
                    console.log("解压成功 => " + "ttfile://user/sub/" + levelID);
                    this.data.map[levelID] = this.map[levelID];
                    this.data.save();
                    handle.run();
                },
                fail: (res) => {
                    console.error("解压失败 => ", res.errMsg);
                    MessageBox.show("解压失败，是否重试", "重试", Laya.Handler.create(this, () => {
                        this.unzip(path, levelID, handle);
                    }), "取消", Laya.Handler.create(this, () => {
                        LevelHelp.closeLevel();
                        UIMgr.show(UIDefine.UILvSelectCtl);
                    }));
                },
            });
        }
        hasCache(level) {
            if (this.data.map[level] != this.map[level]) {
                console.log(`资源版本不一致，缓存失效 ${this.data.map[level]} == ${this.map[level]}`);
                return false;
            }
            const fileSystemManager = Laya.Browser.window.tt.getFileSystemManager();
            let all = Laya.loader.getRes("res/subRes.json");
            let list = all[level];
            for (let i = 0; i < list.length; i++) {
                const path = `ttfile://user/`;
                try {
                    fileSystemManager.accessSync(path + list[i]);
                }
                catch (err) {
                    console.log("文件缺失缓存失效 => " + path + list[i]);
                    return false;
                }
            }
            console.log("找到文件缓存 => " + this.data.map[level]);
            return true;
        }
    }

    class WXLevelLoader {
        init() {
            this.map = Laya.loader.getRes("res/file.json");
            this.data = new LevelCacheSerializable();
            this.data.load();
            Laya.URL.customFormat = (url) => {
                if (url.substring(0, 4) == "sub/") {
                    return `~${Laya.Browser.window.wx.env.USER_DATA_PATH}/` + url;
                }
                else {
                    return url;
                }
            };
        }
        downlaod(level, handle, process) {
            if (this.hasCache(level)) {
                handle.run();
                return;
            }
            process && process.runWith(0);
            let task = Laya.Browser.window.wx.downloadFile({
                url: AppConfig.zipUrl + this.map[level] + ".zip",
                success: (res) => {
                    if (res.statusCode === 200) {
                        console.log("压缩包下在成功 => " + `${res.tempFilePath}`);
                        this.unzip(res.tempFilePath, level, handle);
                    }
                },
                fail: (res) => {
                    console.log(`downloadFile调用失败`, res);
                    MessageBox.show("关卡加载失败，是否重试", "重试", Laya.Handler.create(this, () => {
                        this.downlaod(level, handle, process);
                    }), "取消", Laya.Handler.create(this, () => {
                        LevelHelp.closeLevel();
                        UIMgr.show(UIDefine.UILvSelectCtl);
                    }));
                },
            });
            task.onProgressUpdate((res) => {
                process && process.runWith(res.progress / 100);
            });
        }
        unzip(path, levelID, handle) {
            let fileSystemManager = Laya.Browser.window.wx.getFileSystemManager();
            let targetPath = `${Laya.Browser.window.wx.env.USER_DATA_PATH}/sub/` + levelID;
            try {
                fileSystemManager.mkdirSync(targetPath, true);
            }
            catch (error) {
                MessageBox.show("创建解压文件夹失败" + error, "重试", Laya.Handler.create(this, () => {
                    this.unzip(path, levelID, handle);
                }), "取消", Laya.Handler.create(this, () => {
                    LevelHelp.closeLevel();
                    UIMgr.show(UIDefine.UILvSelectCtl);
                }));
            }
            fileSystemManager.unzip({
                zipFilePath: path,
                targetPath: targetPath,
                success: (_res) => {
                    console.log("解压成功 => " + targetPath);
                    this.data.map[levelID] = this.map[levelID];
                    this.data.save();
                    handle.run();
                },
                fail: (res) => {
                    console.error("解压失败 => ", res.errMsg);
                    MessageBox.show("解压失败，是否重试", "重试", Laya.Handler.create(this, () => {
                        this.unzip(path, levelID, handle);
                    }), "取消", Laya.Handler.create(this, () => {
                        LevelHelp.closeLevel();
                        UIMgr.show(UIDefine.UILvSelectCtl);
                    }));
                },
            });
        }
        hasCache(level) {
            if (this.data.map[level] != this.map[level]) {
                console.log(`资源版本不一致，缓存失效 ${this.data.map[level]} == ${this.map[level]}`);
                return false;
            }
            const fileSystemManager = Laya.Browser.window.wx.getFileSystemManager();
            let all = Laya.loader.getRes("res/subRes.json");
            let list = all[level];
            for (let i = 0; i < list.length; i++) {
                const path = `${Laya.Browser.window.wx.env.USER_DATA_PATH}/`;
                try {
                    fileSystemManager.accessSync(path + list[i]);
                }
                catch (err) {
                    console.log("文件缺失缓存失效 => " + path + list[i]);
                    return false;
                }
            }
            console.log("找到文件缓存 => " + this.data.map[level]);
            return true;
        }
    }

    class LevelLoaderAdapter {
        static init() {
            if (Laya.Browser.onMiniGame) {
                this.loader = new WXLevelLoader();
            }
            else if (Laya.Browser.onTTMiniGame) {
                this.loader = new TTLevelLoader();
            }
            else {
                this.loader = new DefaultLoader();
            }
            this.loader.init();
        }
        static downlaod(level, handle, process = null) {
            this.loader.downlaod(level, handle, process);
        }
    }
    class DefaultLoader {
        init() { }
        downlaod(level, handle, process) {
            handle && handle.run();
        }
    }

    class LevelView extends LevelTouchBase {
        loadLevel(id) {
            this.isLoading = true;
            this.id = id;
            this.cfg = ConfigManager.GetConfigByKey(CfgLevel, id);
            LevelLoaderAdapter.downlaod(this.cfg.levelId, new Laya.Handler(this, this.preloadRes), new Laya.Handler(this, this.downloadProcess));
        }
        preloadRes() {
            let all = Laya.loader.getRes("res/subRes.json");
            let list = all[this.cfg.levelId];
            console.log("预加载资源", list);
            if (!list) {
                this.loadResFinish();
            }
            else {
                Laya.loader.load(list, Laya.Handler.create(this, this.loadResFinish), new Laya.Handler(this, this.loadResProcess));
            }
        }
        downloadProcess(p) {
        }
        loadResProcess(p) {
        }
        loadResFinish() {
            console.log("开始加载预制体");
            let cfg = ConfigManager.GetConfigByKey(CfgLevel, this.id);
            let name = cfg.levelId;
            let path = "sub/" + name + "/" + name + ".json";
            Laya.loader.load(path, Laya.Handler.create(this, this.loadPrefabFinish), null, Laya.Loader.PREFAB);
        }
        loadPrefabFinish(prefab) {
            let obj = prefab.create();
            this.addChild(obj);
            this.init(obj);
            let level = obj.getComponent(LevelBase);
            Game.currentLevel = level;
            level.init(this.id);
            this.isLoading = false;
        }
        uninstallLevel() {
            this.removeChildren();
            if (Game.currentLevel) {
                Game.currentLevel.owner.destroy();
            }
            Game.currentLevel = null;
        }
        showIamge(path, scale, time = 0) {
            let img = new Laya.Image();
            img.centerX = 0;
            img.centerY = 0;
            img.scale(scale, scale);
            img.skin = path;
            this.addChild(img);
            if (time != 0) {
                Laya.timer.once(time, img, function () { this.destroy(); });
                img.on(Laya.Event.CLICK, img, function () { });
            }
            else {
                img.on(Laya.Event.CLICK, img, function () { this.destroy(); });
            }
        }
        scaleBig() {
            this.updateScale(2);
        }
        scaleSmall() {
            this.updateScale(1);
        }
    }

    class LevelFault1 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.chair_1 = this.sp.getChildByName("chair_1");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.startHit = this.sp.getChildByName("startHit");
            this.endHit = this.sp.getChildByName("endHit");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.chair_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isEnd = false;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (!this.isStart || !this.isRange || !this.isEnd) {
                this.showClickTip(1);
            }
            else {
                this.showCorrect();
                Laya.Tween.to(this.chair_1, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.onWin));
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class UIUtils {
        static intToRoman(num) {
            const thousands = ["", "M", "MM", "MMM"];
            const hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
            const tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
            const ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
            const roman = [];
            roman.push(thousands[Math.floor(num / 1000)]);
            roman.push(hundreds[Math.floor(num % 1000 / 100)]);
            roman.push(tens[Math.floor(num % 100 / 10)]);
            roman.push(ones[num % 10]);
            return roman.join('');
        }
        static getChildByPath(node, path) {
            let arr = path.split("/");
            arr.forEach(v => node = node.getChildByName(v));
            return node;
        }
    }

    class LevelFault10 extends LevelBase {
        constructor() {
            super(...arguments);
            this.maskArr = [];
            this.clickDownY = 0;
            this.clickMoveY = 0;
            this.countY = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let zhuahen = UIUtils.getChildByPath(this.sp, `zhuahen_${i}`);
                let mask = UIUtils.getChildByPath(zhuahen, `mask_${i}`);
                mask.visible = false;
                zhuahen.mask = mask;
                this.maskArr.push(mask);
            }
            UIUtils.getChildByPath(this.sp, "cat_1").visible = false;
            this.cat_0 = this.sp.getChildByName("cat_0");
            this.cat_0.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCat);
        }
        onMouseDownCat(e) {
            this.clickDownY = e.stageY;
            console.log(this.clickDownY);
            this.clickMoveY = 0;
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveCat);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpCat);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpCat);
            this.posCount();
        }
        onMouseMoveCat(e) {
            this.clickMoveY = e.stageY;
        }
        posCount() {
            this.posCountTimer = new Laya.Timer();
            this.posCountTimer.frameLoop(1, this, () => {
                this.countY = this.clickMoveY - this.clickDownY;
                if (this.countY > 0) {
                    this.clickDownY = this.clickMoveY;
                    if (this.cat_0.y < -54) {
                        for (let i = 0; i < this.maskArr.length; i++) {
                            this.maskArr[i].y += this.countY / 6;
                        }
                        this.cat_0.y += this.countY / 6;
                    }
                    else {
                        this.posCountTimer.clearAll(this);
                        this.cat_0.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCat);
                        this.showCat();
                    }
                }
            });
        }
        showCat() {
            this.cat_0.visible = false;
            UIUtils.getChildByPath(this.sp, "cat_1").visible = true;
            let curtain_0 = UIUtils.getChildByPath(this.sp, "curtain_0");
            curtain_0.skin = "sub/level_fault_10/curtain_1.png";
            for (let i = 0; i < 4; i++) {
                let zhuahen = UIUtils.getChildByPath(this.sp, `zhuahen_${i}`);
                zhuahen.visible = false;
            }
            this.onWin();
        }
        onMouseUpCat() {
            this.posCountTimer.clearAll(this);
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveCat);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpCat);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpCat);
        }
        onWin() {
            this.showCorrect(375, 1008);
            Laya.timer.once(1000, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault100 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.confirmHitArr = [];
            this.winNum = 0;
            this.addNumArr = [[0], [0]];
            this.startClick = false;
            this.tracks = [[0, 2], [0, 3], [2, 3], [2, 4], [2, 1], [1, 4], [4, 3]];
            this.isPass = [false, false, false, false, false, false, false];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.btnRemake = this.sp.getChildByName("btnRemake");
            this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
            for (let i = 0; i < 5; i++) {
                let confirmHit = this.sp.getChildByName(`confirmHit_${i}`);
                this.confirmHitArr.push(confirmHit);
                let round = this.sp.getChildByName(`round_${i}`);
                round.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.roundArr.push(round);
            }
        }
        onClickRemake() {
            this.btnRemake.off(Laya.Event.CLICK, this, this.onClickRemake);
            Laya.Tween.to(this.btnRemake, { scaleX: 1.2, scaleY: 1.2 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.btnRemake, { scaleX: 1, scaleY: 1 }, 200, null, Laya.Handler.create(this, () => {
                    this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
                    GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                }));
            });
        }
        onMouseDownSelf(e) {
            if (this.startClick) {
                this.openLayaStageEvent();
                return;
            }
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && this.delRoundArr.length <= 1) {
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(this.startPos);
                    this.nowClickImg = i;
                    if (i == 1 || i == 2) {
                        if (this.addNumArr[i - 1].length !== 0) {
                            this.addNumArr[i - 1].splice(0, 1);
                        }
                        else {
                            this.delRoundArr.push(this.roundArr[i]);
                        }
                    }
                    this.openLayaStageEvent();
                    this.lastTimeNum = i;
                    break;
                }
            }
        }
        HasItGoneThrough(oldDrop, nowDrop) {
            for (let i = 0; i < this.tracks.length; i++) {
                let oldFind = this.tracks[i].find(num => num === oldDrop);
                if (oldFind !== undefined) {
                    let nowFind = this.tracks[i].find(num => num === nowDrop);
                    if (nowFind !== undefined) {
                        if (this.isPass[i]) {
                            return false;
                        }
                        else {
                            this.isPass[i] = true;
                            return true;
                        }
                    }
                    else {
                        continue;
                    }
                }
            }
            return false;
        }
        onMouseMoveSelf(e) {
            if (this.startPos == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            let redArr = [
                (this.nowClickImg == 0 && !this.confirmHitArr[0].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 1 && !this.confirmHitArr[1].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 2 && !this.confirmHitArr[2].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 3 && !this.confirmHitArr[3].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 4 && !this.confirmHitArr[4].hitTestPoint(e.stageX, e.stageY)),
            ];
            if (redArr[0] || redArr[1] || redArr[2] || redArr[3] || redArr[4]) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#6f5ad8", 30);
            }
            let canConnect = [[2, 3], [2, 4], [0, 1, 3, 4], [0, 2, 4], [1, 2, 3]];
            for (let i = 0; i < this.roundArr.length; i++) {
                let notNum = (this.nowClickImg !== i && this.lastTimeNum !== i);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && canConnect[this.nowClickImg].includes(i) && notNum) {
                    let isPass = this.HasItGoneThrough(this.nowClickImg, i);
                    if (!isPass) {
                        return;
                    }
                    this.startClick = true;
                    Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                    this.lastTimeNum = this.nowClickImg;
                    this.nowClickImg = i;
                    this.winNum++;
                    if (i == 1 || i == 2) {
                        if (this.addNumArr[i - 1].length !== 0) {
                            this.addNumArr[i - 1].splice(0, 1);
                        }
                        else {
                            this.delRoundArr.push(this.roundArr[i]);
                        }
                    }
                    else {
                        this.delRoundArr.push(this.roundArr[i]);
                    }
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#6f5ad8", 30);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#6f5ad8", 30);
                    this.startPos.x = endPox.x;
                    this.startPos.y = endPox.y;
                    this.onWin();
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.offLayaStageEvent();
            let arrLength = (this.addNumArr[0].length == 1 && this.addNumArr[1].length == 1);
            if (this.delRoundArr.length == 1 && arrLength) {
                this.delRoundArr = [];
            }
        }
        onWin() {
            if (this.winNum == 7) {
                this.self.mouseEnabled = false;
                this.offLayaStageEvent();
                this.line.graphics.clear();
                this.showCorrect();
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
        offLayaStageEvent() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        openLayaStageEvent() {
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
    }

    class LevelFault11 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dieC = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let btn = UIUtils.getChildByPath(this.sp, `btn_${i}`);
                btn.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownBtn, [i]);
                let c_0 = UIUtils.getChildByPath(this.sp, `cz_${i}/c_${i}`);
                c_0.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownC, [i]);
                UIUtils.getChildByPath(this.sp, `cz_${i}/delC`).visible = false;
                UIUtils.getChildByPath(this.sp, `cz_${i}/tx`).visible = false;
            }
        }
        onMouseDownBtn(i) {
            let btn = UIUtils.getChildByPath(this.sp, `btn_${i}`);
            Laya.Tween.to(btn, { scaleX: 1.3, scaleY: 1.3 }, 50);
            btn.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpBtn, [i]);
            btn.on(Laya.Event.MOUSE_UP, this, this.onMouseUpBtn, [i]);
        }
        onMouseUpBtn(i, e) {
            let btn = UIUtils.getChildByPath(this.sp, `btn_${i}`);
            btn.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpBtn);
            btn.off(Laya.Event.MOUSE_UP, this, this.onMouseUpBtn);
            Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            if (this.dieC >= 4 && i == 0) {
                this.onWin();
            }
            else {
                let p = new Laya.Point(e.stageX, e.stageY);
                this.showClickTip(1, p);
            }
        }
        onMouseDownC(i) {
            let c_0 = UIUtils.getChildByPath(this.sp, `cz_${i}/c_${i}`);
            c_0.on(Laya.Event.MOUSE_OUT, this, this.onMouseOutC, [i]);
            c_0.on(Laya.Event.MOUSE_UP, this, this.onMouseUpC, [i]);
        }
        onMouseUpC(i) {
            let c_0 = UIUtils.getChildByPath(this.sp, `cz_${i}/c_${i}`);
            c_0.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownC);
            c_0.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutC);
            c_0.off(Laya.Event.MOUSE_UP, this, this.onMouseUpC);
            c_0.visible = false;
            UIUtils.getChildByPath(this.sp, `cz_${i}/delC`).visible = true;
            let tx = UIUtils.getChildByPath(this.sp, `cz_${i}/tx`);
            tx.visible = true;
            Laya.Tween.to(tx, { y: tx.y - 150, alpha: 0 }, 1000);
            this.dieC++;
        }
        onMouseOutC(i) {
            let c_0 = UIUtils.getChildByPath(this.sp, `cz_${i}/c_${i}`);
            c_0.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutC);
            c_0.off(Laya.Event.MOUSE_UP, this, this.onMouseUpC);
        }
        onWin() {
            Laya.timer.once(1000, this, () => {
                this.showCorrect(375, 701);
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault12 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.star_0 = this.sp.getChildByName("star_0");
            this.star_1 = this.sp.getChildByName("star_1");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.star_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isEnd = false;
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            if (!this.isStart || !this.isRange || !this.isEnd) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.star_0, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.onWin));
                Laya.Tween.to(this.star_1, { alpha: 1 }, 500);
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault13 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
            this.isStartPosImg = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.surf_0 = this.sp.getChildByName("surf_0");
            this.surf_1 = this.sp.getChildByName("surf_1");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.surf_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isEnd = false;
            this.isStart = false;
            this.isEnd = false;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            this.addNewPosImg(e);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        addNewPosImg(e) {
            this.isStartPosImg = false;
            if (this.startPosImg) {
                this.startPosImg.destroy();
            }
            this.startPosImg = new Laya.Image;
            this.startPosImg.anchorX = 0.5;
            this.startPosImg.anchorY = 0.5;
            this.startPosImg.width = 100;
            this.startPosImg.height = 100;
            let hitPos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.startPosImg.pos(hitPos.x, hitPos.y);
            this.sp.addChild(this.startPosImg);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (this.startPosImg.hitTestPoint(e.stageX, e.stageY)) {
                this.isStartPosImg = true;
            }
            console.log(this.isStart, this.isRange, this.isEnd, this.isStartPosImg);
            if (!this.isStart || !this.isRange || !this.isEnd || !this.isStartPosImg) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.surf_0, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.onWin));
                Laya.Tween.to(this.surf_1, { alpha: 1 }, 500);
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault14 extends LevelBase {
        constructor() {
            super(...arguments);
            this.startPos = 0;
            this.movePos = 0;
            this.countPos = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.tongue = this.sp.getChildByName("tongue");
            this.tongue.on(Laya.Event.MOUSE_DOWN, this, this.onMuseDownTongue);
        }
        onMuseDownTongue(e) {
            this.startPos = e.stageY;
            this.movePos = 0;
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveTongue);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.tongue.on(Laya.Event.MOUSE_UP, this, this.onMouseUpTongue);
            this.tongue.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpTongue);
            this.posCount();
        }
        onMouseMoveTongue(e) {
            this.movePos = e.stageY;
        }
        onMouseUpTongue() {
            if (this.newTimer) {
                this.newTimer.clearAll(this);
            }
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveTongue);
            this.tongue.off(Laya.Event.MOUSE_UP, this, this.onMouseUpTongue);
            this.tongue.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpTongue);
        }
        posCount() {
            this.newTimer = new Laya.Timer();
            this.newTimer.frameLoop(1, this, () => {
                this.countPos = this.movePos - this.startPos;
                console.log(this.countPos);
                if (this.countPos > 0) {
                    this.startPos = this.movePos;
                    if (this.tongue.y < 83) {
                        this.tongue.y += this.countPos;
                    }
                    else {
                        this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                        this.tongue.off(Laya.Event.MOUSE_DOWN, this, this.onMuseDownTongue);
                        this.onMouseUpTongue();
                        this.tongue.y = 83;
                        this.onWin();
                    }
                }
            });
        }
        onMouseUpSelf(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class DragUtil {
        static create(node) {
            return new DragItme(node);
        }
    }
    class DragItme {
        constructor(node) {
            this.isCanDrag = true;
            this.node = node;
            this.node.on(Laya.Event.MOUSE_DOWN, this, this.onDrag);
            this.startX = this.node.x;
            this.startY = this.node.y;
        }
        setDragStartCallback(callback) {
            this.startCallback = callback;
            return this;
        }
        setDragEndCallback(callback) {
            this.endCallback = callback;
            return this;
        }
        setDragMouseDownCallback(callback) {
            this.mouseDownCallback = callback;
            return this;
        }
        onDrag(e) {
            if (!this.isCanDrag) {
                return;
            }
            e.stopPropagation();
            this.offset = this.node.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.node.startDrag();
            this.node.zOrder = 100;
            if (this.startCallback) {
                this.startCallback(this.getMousePos(), this);
            }
            if (this.mouseDownCallback) {
                this.mouseDownCallback(this.getMousePos(), this);
            }
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onDragEnd);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onDragEnd);
        }
        onDragEnd(e) {
            if (this.endCallback) {
                this.endCallback(this.getMousePos(), this);
            }
            this.node.zOrder = 10;
            Laya.stage.offAllCaller(this);
        }
        reset() {
            this.node.pos(this.startX, this.startY);
        }
        hide() {
            this.node.visible = false;
        }
        show() {
            this.node.visible = true;
        }
        setID(id) {
            this.id = id;
        }
        setImage(skin) {
            this.node.skin = skin;
        }
        getMousePos() {
            return this.node.localToGlobal(new Laya.Point(this.offset.x, this.offset.y));
        }
        setPos(x, y) {
            this.node.pos(x, y);
            this.startX = x;
            this.startY = y;
        }
        getRoot() {
            return this.node;
        }
    }

    class LevelFault15 extends LevelBase {
        constructor() {
            super(...arguments);
            this.OK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            console.log(UIUtils.getChildByPath(this.sp, "baby/showNewUnderpants"));
            UIUtils.getChildByPath(this.sp, "baby/showNewUnderpants").visible = false;
            UIUtils.getChildByPath(this.sp, "baby").visible = true;
            DragUtil.create(UIUtils.getChildByPath(this.sp, "baby/drag_2")).setDragEndCallback(this.drag_2DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_0")).setDragEndCallback(this.drag_0DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_1")).setDragEndCallback(this.drag_1DragEnd.bind(this));
            UIUtils.getChildByPath(this.sp, "baby").on(Laya.Event.MOUSE_UP, this, this.onMouseUpBaby);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
        drag_0DragEnd(pos, item) {
            item.reset();
            this.showClickTip(1, pos);
        }
        drag_1DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "baby").hitTestPoint(pos.x, pos.y) && this.OK) {
                item.hide();
                this.playAnim();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        drag_2DragEnd(pos, item) {
            item.reset();
            if (!UIUtils.getChildByPath(this.sp, "baby").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                this.OK = true;
            }
        }
        onMouseUpBaby(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        playAnim() {
            UIUtils.getChildByPath(this.sp, "baby/expression").skin = "sub/level_fault_15/biaoqing_1.png";
            UIUtils.getChildByPath(this.sp, "baby/showNewUnderpants").visible = true;
            Laya.timer.once(1000, this, () => {
                this.showCorrect(375, 701);
            });
            this.onWin();
        }
    }

    class LevelFault16 extends LevelBase {
        constructor() {
            super(...arguments);
            this.clickCount = 4;
            this.clickCount2 = 1;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.Einstein = this.sp.getChildByName("Einstein");
            this.Einstein.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownEinstein);
            UIUtils.getChildByPath(this.self, "topTitle/Einstein_1").on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownEinstein_1);
            this.CountTxt = UIUtils.getChildByPath(this.self, "topTitle/CountTxt");
        }
        getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        onMouseDownEinstein() {
            Laya.Tween.to(this.Einstein, { scaleX: 0.45, scaleY: 0.45 }, 150);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onClickEinstein);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onClickEinstein);
        }
        onClickEinstein() {
            this.self.off(Laya.Event.MOUSE_UP, this, this.onClickEinstein);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onClickEinstein);
            Laya.Tween.to(this.Einstein, { scaleX: 0.5, scaleY: 0.5 }, 150);
            this.Einstein.pos(this.getRandomInt(0, 477), this.getRandomInt(50, 700));
            console.log(this.Einstein.x, this.Einstein.y);
            this.clickCount--;
            this.CountTxt.text = (this.clickCount + this.clickCount2) + "次";
            if (this.clickCount === 0) {
                this.Einstein.visible = false;
            }
            this.onWin();
        }
        onMouseDownEinstein_1() {
            let E1 = UIUtils.getChildByPath(this.self, "topTitle/Einstein_1");
            Laya.Tween.to(E1, { scaleX: 0.15, scaleY: 0.15 }, 200);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onClickEinstein_1);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onClickEinstein_1);
        }
        onClickEinstein_1() {
            UIUtils.getChildByPath(this.self, "topTitle/Einstein_1").off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownEinstein_1);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onClickEinstein_1);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onClickEinstein_1);
            UIUtils.getChildByPath(this.self, "topTitle/Einstein_1").off(Laya.Event.CLICK, this, this.onClickEinstein_1);
            let e_1 = UIUtils.getChildByPath(this.self, "topTitle/Einstein_1");
            Laya.Tween.to(e_1, { scaleX: 0.2, scaleY: 0.2 }, 200);
            this.clickCount2--;
            this.CountTxt.text = (this.clickCount + this.clickCount2) + "次";
            this.onWin();
        }
        onWin() {
            if (this.clickCount === 0 && this.clickCount2 === 0) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault17 extends LevelBase {
        constructor() {
            super(...arguments);
            this.wenziArr = [];
            this.wenziPosArr = [];
            this.newTweenArr = [];
            this.isOK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let wenzi = UIUtils.getChildByPath(this.sp, `wenzi_${i}`);
                this.wenziArr.push(wenzi);
                this.wenziPosArr[i] = new Laya.Point(wenzi.x, wenzi.y);
            }
            this.red_0 = this.wenziArr[0].getChildByName("red_0");
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
        }
        onMouseDownSelf(e) {
            this.playWenziAnim(e);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseUpSelf() {
            if (this.isOK) {
                this.onWin();
                this.self.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            }
            if (this.newTimer) {
                this.newTimer.clearAll(this);
            }
            for (let i = 0; i < 4; i++) {
                if (this.newTweenArr[i]) {
                    this.newTweenArr[i].clear();
                }
                this.newTweenArr[i] = new Laya.Tween();
                this.newTweenArr[i].to(this.wenziArr[i], { x: this.wenziPosArr[i].x, y: this.wenziPosArr[i].y, rotation: 0 }, 500);
            }
        }
        playWenziAnim(pos) {
            this.countTime();
            for (let i = 0; i < 4; i++) {
                if (this.newTweenArr[i]) {
                    this.newTweenArr[i].clear();
                }
                this.mouseDownPos = this.self.globalToLocal(new Laya.Point(pos.stageX, pos.stageY));
                this.newTweenArr[i] = new Laya.Tween();
                let rotationArr = [30, -38, -32, 44];
                this.newTweenArr[i].to(this.wenziArr[i], { x: this.mouseDownPos.x, y: this.mouseDownPos.y, rotation: rotationArr[i] }, 500);
            }
        }
        countTime() {
            if (this.newTimer) {
                this.newTimer.clearAll(this);
            }
            this.newTimer = new Laya.Timer();
            this.newTimer.once(1000, this, () => {
                this.creteRedFilter();
                this.isOK = true;
            });
        }
        creteRedFilter() {
            var colorMatrix = [
                1.3, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 1, 0,
            ];
            var redFilter = new Laya.ColorFilter(colorMatrix);
            this.red_0.filters = [redFilter];
        }
        onWin() {
            this.showCorrect();
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault18 extends LevelBase {
        constructor() {
            super(...arguments);
            this.isRun = false;
            this.posNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.door = this.sp.getChildByName("door");
            this.sheep = this.sp.getChildByName("sheep");
            this.door.on(Laya.Event.CLICK, this, this.onClickDoor);
            this.sheep.on(Laya.Event.CLICK, this, this.onClickSheep);
        }
        onClickDoor() {
            this.door.skin = "sub/level_fault_18/door_1.png";
            this.door.width = 139;
            this.door.height = 127;
            this.door.pos(416, 172);
            this.isRun = true;
        }
        onClickSheep() {
            this.sheep.off(Laya.Event.CLICK, this, this.onClickSheep);
            if (this.posNum !== 3) {
                this.posNum++;
            }
            else {
                this.posNum = 0;
            }
            let posArr = [
                { 0: [532, 603], 1: "left" },
                { 0: [239.5, 591], 1: "left" },
                { 0: [336.5, 445], 1: "right" },
                { 0: [601, 380.5], 1: "right" }
            ];
            if (this.isRun) {
                Laya.Tween.to(this.sheep, { x: 424, y: 317 }, 1000, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.sheep, { x: 239.5, y: 132 }, 700, null, Laya.Handler.create(this, () => {
                        this.door.pos(311, 169);
                        this.door.skin = "sub/level_fault_18/door_0.png";
                        this.door.width = 113;
                        this.door.height = 162;
                        this.showCorrect();
                        this.onWin();
                    }));
                }));
            }
            else {
                if (posArr[this.posNum][1] == "left") {
                    this.sheep.scaleX = 1;
                }
                else {
                    this.sheep.scaleX = -1;
                }
                Laya.Tween.to(this.sheep, { x: posArr[this.posNum][0][0], y: posArr[this.posNum][0][1] }, 700, null, Laya.Handler.create(this, () => {
                    this.sheep.on(Laya.Event.CLICK, this, this.onClickSheep);
                }));
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault19 extends LevelBase {
        constructor() {
            super(...arguments);
            this.isOK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.dog_0 = this.sp.getChildByName("dog_0");
            this.dog_1 = this.sp.getChildByName("dog_1");
            this.drag = this.sp.getChildByName("drag");
            this.hit = this.sp.getChildByName("hit");
            DragUtil.create(this.drag).setDragMouseDownCallback(this.onMouseDownCallback.bind(this));
            DragUtil.create(this.drag).setDragEndCallback(this.dragEndCallback.bind(this));
            this.playTowDogAnim();
            this.playSound();
        }
        onMouseDownCallback(pos, item) {
            this.sp.on(Laya.Event.MOUSE_MOVE, this, this.isHit);
        }
        dragEndCallback(pos, item) {
            if (!this.isOK) {
                item.reset();
            }
        }
        isHit(e) {
            if (this.hit.hitTestPoint(e.stageX, e.stageY)) {
                this.isOK = true;
                this.sp.off(Laya.Event.MOUSE_MOVE, this, this.isHit);
                this.sp.removeChild(this.drag);
                Laya.timer.clearAll(this);
                Laya.Tween.clearAll(this.dog_0);
                Laya.Tween.clearAll(this.dog_1);
                this.dog_0.skin = "sub/level_fault_19/gou0_1.png";
                this.dog_1.skin = "sub/level_fault_19/gou1_1.png";
                this.stopPlaySound();
                Laya.timer.once(1000, this, () => {
                    this.showCorrect();
                    this.onWin();
                });
            }
        }
        playTowDogAnim() {
            Laya.timer.loop(200, this, () => {
                Laya.Tween.to(this.dog_0, { x: 545 }, 100, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.dog_0, { x: 521.45 }, 100);
                }));
                Laya.Tween.to(this.dog_1, { x: 162 }, 100, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.dog_1, { x: 147.45 }, 100);
                }));
            });
        }
        playSound() {
            Laya.SoundManager.playSound("sub/level_fault_19/dogSound.mp3", 0);
        }
        stopPlaySound() {
            Laya.SoundManager.stopSound("sub/level_fault_19/dogSound.mp3");
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault2 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.bicycle = this.sp.getChildByName("bicycle");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.startHit = this.sp.getChildByName("startHit");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.bicycle.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            this.isEnd = false;
            this.startHitImg = new Laya.Image;
            this.startHitImg.anchorX = 0.5;
            this.startHitImg.anchorY = 0.5;
            this.startHitImg.width = 100;
            this.startHitImg.height = 100;
            let hitPos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.startHitImg.pos(hitPos.x, hitPos.y);
            this.sp.addChild(this.startHitImg);
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            console.log(this.startHitImg.x, this.startHitImg.y, "点击位置=>", e.stageX, e.stageY);
            console.log(this.startHitImg.hitTestPoint(e.stageX, e.stageY));
            if (this.startHitImg.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            if (!this.isStart || !this.isRange || !this.isEnd) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.bicycle, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.onWin));
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault20 extends LevelBase {
        constructor() {
            super(...arguments);
            this.nailArr = [];
            this.newNailArr = [];
            this.isVisible = [0, 0, 0, 0];
            this.isFind = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.paw = this.sp.getChildByName("paw");
            this.drag = this.sp.getChildByName("drag");
            this.thx = this.sp.getChildByName("thx");
            this.winPaw = this.sp.getChildByName("winPaw");
            this.winPaw.visible = false;
            this.thx.visible = false;
            for (let i = 0; i < 4; i++) {
                let nail = this.sp.getChildByName(`nail_${i}`);
                let newNail = this.sp.getChildByName(`newNail_${i}`);
                newNail.visible = false;
                nail.visible = false;
                this.nailArr.push(nail);
                this.newNailArr.push(newNail);
            }
            this.paw.y = 2000;
            Laya.timer.once(1000, this, this.playStartAnim);
        }
        playStartAnim() {
            let arr = [[160, 323], [266, 211], [394, 226], [484, 322]];
            Laya.Tween.to(this.paw, { x: 80, y: 165 }, 1000, Laya.Ease.bounceOut, Laya.Handler.create(this, () => {
                for (let i = 0; i < this.nailArr.length; i++) {
                    this.nailArr[i].visible = true;
                    Laya.Tween.from(this.nailArr[i], { x: arr[i][0], y: arr[i][1] }, 500);
                }
            }));
            Laya.timer.once(1500, this, () => {
                DragUtil.create(this.drag).setDragMouseDownCallback(this.dragMouseDown.bind(this));
            });
        }
        dragMouseDown(pos, item) {
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.timeLoop);
        }
        timeLoop() {
            if (this.isFind) {
                return;
            }
            let Dragbounds = this.drag.getBounds();
            for (let i = 0; i < this.nailArr.length; i++) {
                let bounds = this.nailArr[i].getBounds();
                if (bounds.intersects(Dragbounds)) {
                    this.nailArr[i].visible = false;
                    this.newNailArr[i].visible = true;
                    if (this.isVisible[i] == 0) {
                        Laya.SoundManager.playSound("sub/level_fault_20/zhijiaSound.mp3", 1);
                    }
                    this.isVisible[i] = 1;
                }
            }
            let find = this.isVisible.find(bool => bool === 0);
            if (find == undefined && !this.isFind) {
                this.isFind = true;
                this.self.offAllCaller(this);
                this.playWinAnim();
            }
        }
        playWinAnim() {
            for (let i = 0; i < this.newNailArr.length; i++) {
                this.newNailArr[i].visible = false;
            }
            Laya.Tween.to(this.paw, { y: 2000 }, 500, Laya.Ease.backIn, Laya.Handler.create(this, () => {
                this.paw.visible = false;
                this.winPaw.visible = true;
                Laya.Tween.from(this.winPaw, { y: 2000 }, 500, Laya.Ease.bounceOut, Laya.Handler.create(this, () => {
                    this.thx.visible = true;
                    Laya.Tween.from(this.thx, { scaleX: 0, scaleY: 0 }, 500, Laya.Ease.quartIn);
                    this.onWin();
                }));
            }));
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault21 extends LevelBase {
        constructor() {
            super(...arguments);
            this.isOK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_0")).setDragEndCallback(this.drag_0DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_1")).setDragEndCallback(this.drag_1DragEnd.bind(this));
            for (let i = 2; i <= 4; i++) {
                DragUtil.create(UIUtils.getChildByPath(this.sp, `drag_${i}`)).setDragEndCallback(this.drag_234DragEnd.bind(this));
            }
        }
        drag_0DragEnd(pos, item) {
            item.reset();
            if (this.self.hitTestPoint(pos.x, pos.y) && !UIUtils.getChildByPath(this.sp, "woman").hitTestPoint(pos.x, pos.y)) {
                this.isOK = true;
                item.hide();
            }
        }
        drag_234DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "woman").hitTestPoint(pos.x, pos.y)) {
                this.showClickTip(1, pos);
            }
        }
        drag_1DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "foot").hitTestPoint(pos.x, pos.y) && this.isOK) {
                item.hide();
                this.womanAnim();
                this.onWin();
            }
            else if (UIUtils.getChildByPath(this.sp, "woman").hitTestPoint(pos.x, pos.y)) {
                this.showClickTip(1, pos);
            }
        }
        womanAnim() {
            UIUtils.getChildByPath(this.sp, "face").visible = false;
            let winAnim = UIUtils.getChildByPath(this.sp, "winAnim");
            winAnim.pos(430, 556);
            winAnim.visible = true;
            Laya.Tween.to(winAnim, { x: 485, y: 580 }, 300);
            Laya.timer.once(300, this, () => {
                Laya.Tween.to(winAnim, { x: 430, y: 556 }, 300);
                Laya.timer.once(300, this, () => {
                    Laya.Tween.to(winAnim, { x: 485, y: 580 }, 300);
                    Laya.timer.once(300, this, () => {
                        Laya.Tween.to(winAnim, { x: 430, y: 556 }, 300);
                        Laya.timer.once(300, this, () => {
                            Laya.Tween.to(winAnim, { x: 485, y: 580 }, 300);
                        });
                    });
                });
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault22 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
            this.isHit_3 = false;
            this.isStartPosImg = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.cat_0 = this.sp.getChildByName("cat_0");
            this.cat_1 = this.sp.getChildByName("cat_1");
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
            this.hit_2 = this.sp.getChildByName("hit_2");
            this.hit_3 = this.sp.getChildByName("hit_3");
            this.range = this.sp.getChildByName("range");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.cat_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
            this.isHit_3 = false;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            this.addNewPosImg(e);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        addNewPosImg(e) {
            this.isStartPosImg = false;
            if (this.startPosImg) {
                this.startPosImg.destroy();
            }
            this.startPosImg = new Laya.Image;
            this.startPosImg.anchorX = 0.5;
            this.startPosImg.anchorY = 0.5;
            this.startPosImg.width = 100;
            this.startPosImg.height = 100;
            let hitPos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.startPosImg.pos(hitPos.x, hitPos.y);
            this.sp.addChild(this.startPosImg);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_0 = true;
            }
            if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_1 = true;
            }
            if (this.hit_2.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_2 = true;
            }
            if (this.hit_3.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_3 = true;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (this.startPosImg.hitTestPoint(e.stageX, e.stageY)) {
                this.isStartPosImg = true;
            }
            console.log(this.isRange, this.isStartPosImg, this.isHit_0, this.isHit_1, this.isHit_2, this.isHit_3);
            if (!this.isRange || !this.isHit_0 || !this.isStartPosImg || !this.isHit_1 || !this.isHit_2 || !this.isHit_3) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.cat_0, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.onWin));
                Laya.Tween.to(this.cat_1, { alpha: 1 }, 500);
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault23 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
            this.isHit_3 = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img_0 = this.sp.getChildByName("img_0");
            this.img_1 = this.sp.getChildByName("img_1");
            this.cat = this.sp.getChildByName("cat");
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
            this.hit_2 = this.sp.getChildByName("hit_2");
            this.hit_3 = this.sp.getChildByName("hit_3");
            this.range = this.sp.getChildByName("range");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.img_1.alpha = 0;
            this.cat.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
            this.isHit_3 = false;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_0 = true;
            }
            if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_1 = true;
            }
            if (this.hit_2.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_2 = true;
            }
            if (this.hit_3.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_3 = true;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            console.log(this.isRange, this.isHit_0, this.isHit_1, this.isHit_2, this.isHit_3);
            if (!this.isRange || !this.isHit_0 || !this.isHit_1 || !this.isHit_2 || !this.isHit_3) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.img_1, { alpha: 1 }, 500, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.cat, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.onWin));
                }));
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault24 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img_0 = this.sp.getChildByName("img_0");
            this.img_1 = this.sp.getChildByName("img_1");
            this.cat = this.sp.getChildByName("cat");
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
            this.hit_2 = this.sp.getChildByName("hit_2");
            this.range = this.sp.getChildByName("range");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.img_1.alpha = 0;
            this.cat.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isHit_0 = false;
            this.isHit_1 = false;
            this.isHit_2 = false;
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            if (this.hit_0.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_0 = true;
            }
            if (this.hit_1.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_1 = true;
            }
            if (this.hit_2.hitTestPoint(e.stageX, e.stageY)) {
                this.isHit_2 = true;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            console.log(this.isRange, this.isHit_0, this.isHit_1, this.isHit_2);
            if (!this.isRange || !this.isHit_0 || !this.isHit_1 || !this.isHit_2) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.img_1, { alpha: 1 }, 500, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.cat, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.onWin));
                }));
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault25 extends LevelBase {
        constructor() {
            super(...arguments);
            this.snailArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                this.snailArr.push(UIUtils.getChildByPath(this.sp, `snail_${i}`));
                this.snailArr[i].on(Laya.Event.MOUSE_UP, this, this.onMouseUpSnail);
            }
            this.playSnailAnim();
            UIUtils.getChildByPath(this.sp, 'topTitle/snail').on(Laya.Event.MOUSE_UP, this, this.onMouseUpWin);
        }
        onMouseUpSnail(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onMouseUpWin(e) {
            this.showCorrect(532, 633);
            this.onWin();
        }
        playSnailAnim() {
            Laya.Tween.to(this.snailArr[0], { x: -55 }, 15000, null, Laya.Handler.create(this, () => {
                this.snailArr[0].scaleX = -1;
                Laya.Tween.to(this.snailArr[0], { x: 781 }, 15000);
                Laya.timer.once(15000, this, () => {
                    this.snailArr[0].scaleX = 1;
                    Laya.Tween.to(this.snailArr[0], { x: -55 }, 15000);
                });
                Laya.timer.loop(30000, this, () => {
                    this.snailArr[0].scaleX = -1;
                    Laya.Tween.to(this.snailArr[0], { x: 781 }, 15000);
                    Laya.timer.once(15000, this, () => {
                        this.snailArr[0].scaleX = 1;
                        Laya.Tween.to(this.snailArr[0], { x: -55 }, 15000);
                    });
                });
            }));
            Laya.Tween.to(this.snailArr[1], { x: -55 }, 10000, null, Laya.Handler.create(this, () => {
                this.snailArr[1].scaleX = -1;
                Laya.Tween.to(this.snailArr[1], { x: 781 }, 10000);
                Laya.timer.once(10000, this, () => {
                    this.snailArr[1].scaleX = 1;
                    Laya.Tween.to(this.snailArr[1], { x: -55 }, 10000);
                });
                Laya.timer.loop(20000, this, () => {
                    this.snailArr[1].scaleX = -1;
                    Laya.Tween.to(this.snailArr[1], { x: 781 }, 10000);
                    Laya.timer.once(10000, this, () => {
                        this.snailArr[1].scaleX = 1;
                        Laya.Tween.to(this.snailArr[1], { x: -55 }, 10000);
                    });
                });
            }));
            Laya.Tween.to(this.snailArr[2], { x: -55 }, 13000, null, Laya.Handler.create(this, () => {
                this.snailArr[2].scaleX = -1;
                Laya.Tween.to(this.snailArr[2], { x: 781 }, 13000);
                Laya.timer.once(13000, this, () => {
                    this.snailArr[2].scaleX = 1;
                    Laya.Tween.to(this.snailArr[2], { x: -55 }, 13000);
                });
                Laya.timer.loop(26000, this, () => {
                    this.snailArr[2].scaleX = -1;
                    Laya.Tween.to(this.snailArr[2], { x: 781 }, 13000);
                    Laya.timer.once(13000, this, () => {
                        this.snailArr[2].scaleX = 1;
                        Laya.Tween.to(this.snailArr[2], { x: -55 }, 13000);
                    });
                });
            }));
            Laya.Tween.to(this.snailArr[3], { x: -55 }, 20000, null, Laya.Handler.create(this, () => {
                this.snailArr[3].scaleX = -1;
                Laya.Tween.to(this.snailArr[3], { x: 781 }, 20000);
                Laya.timer.once(20000, this, () => {
                    this.snailArr[3].scaleX = 1;
                    Laya.Tween.to(this.snailArr[3], { x: -55 }, 20000);
                });
                Laya.timer.loop(40000, this, () => {
                    this.snailArr[3].scaleX = -1;
                    Laya.Tween.to(this.snailArr[3], { x: 781 }, 20000);
                    Laya.timer.once(20000, this, () => {
                        this.snailArr[3].scaleX = 1;
                        Laya.Tween.to(this.snailArr[3], { x: -55 }, 20000);
                    });
                });
            }));
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault26 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 5; i++) {
                UIUtils.getChildByPath(this.sp, `click_${i}`).on(Laya.Event.MOUSE_UP, this, this.onClickError);
            }
            UIUtils.getChildByPath(this.sp, `correct`).on(Laya.Event.MOUSE_UP, this, this.onClickCorrect);
        }
        onClickError(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onClickCorrect() {
            this.self.mouseEnabled = false;
            this.playWinAnim();
        }
        playWinAnim() {
            UIUtils.getChildByPath(this.sp, `titleImg/showRed`).visible = true;
            Laya.timer.once(400, this, () => {
                UIUtils.getChildByPath(this.sp, `titleImg/arrow_0`).visible = true;
                Laya.timer.once(400, this, () => {
                    UIUtils.getChildByPath(this.sp, `titleImg/arrow_1`).visible = true;
                    Laya.timer.once(400, this, () => {
                        UIUtils.getChildByPath(this.sp, `titleImg/arrow_2`).visible = true;
                        Laya.timer.once(400, this, () => {
                            UIUtils.getChildByPath(this.sp, `titleImg/arrow_3`).visible = true;
                            Laya.timer.once(400, this, () => {
                                UIUtils.getChildByPath(this.sp, `titleImg/arrow_4`).visible = true;
                                Laya.timer.once(400, this, () => {
                                    UIUtils.getChildByPath(this.sp, `titleImg/arrow_5`).visible = true;
                                    this.onWin();
                                });
                            });
                        });
                    });
                });
            });
        }
        onWin() {
            this.showCorrect();
            Laya.timer.once(1500, this, () => {
                this.self.mouseEnabled = true;
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault27 extends LevelBase {
        constructor() {
            super(...arguments);
            this.startX = 0;
            this.cound = 0;
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.catBox = this.sp.getChildByName("catBox");
            this.cat = this.catBox.getChildByName("cat");
            this.Mask = this.catBox.getChildByName("Mask");
            this.txt = this.sp.getChildByName("txt");
            this.txt.alpha = 0;
            this.Mask.visible = false;
            this.catBox.mask = this.Mask;
            this.cat.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCat);
        }
        onMouseDownCat(e) {
            let pos = this.catBox.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.startX = pos.x;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpStage);
        }
        onMouseMoveStage(e) {
            let pos = this.catBox.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.cound = (pos.x - this.startX);
            if ((this.cat.x + this.cound) <= 0 && (this.cat.x + this.cound) > -390) {
                this.cat.x += this.cound;
            }
            console.log(this.cat.x);
            if (this.cat.x > -10 && !this.isWin) {
                this.isWin = true;
                this.onWin();
            }
            this.startX = pos.x;
        }
        onMouseUpStage() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpStage);
        }
        onWin() {
            Laya.Tween.to(this.txt, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.showCorrect));
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault28 extends LevelBase {
        constructor() {
            super(...arguments);
            this.penguinArr = [];
            this.startX = 0;
            this.count = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.penguinBox = this.sp.getChildByName("penguinBox");
            this.penguinBox.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownBox);
            for (let i = 0; i < 5; i++) {
                let penguin = this.penguinBox.getChildByName(`penguin_${i}`);
                this.penguinArr.push(penguin);
                if (i !== 4) {
                    penguin.on(Laya.Event.CLICK, this, this.onClickPenguin);
                }
                else {
                    penguin.on(Laya.Event.CLICK, this, this.onClickWin);
                }
            }
        }
        onClickPenguin(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onClickWin(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showCorrect();
            this.onWin();
        }
        onMouseDownBox(e) {
            let pos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.startX = pos.x;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
        }
        onMouseMoveStage(e) {
            let pos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.count = pos.x - this.startX;
            if ((this.penguinBox.x + this.count) <= this.penguinBox.x || (this.penguinBox.x + this.count) >= 0) {
                return;
            }
            this.penguinBox.x += this.count;
            this.startX = pos.x;
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault29 extends LevelBase {
        constructor() {
            super(...arguments);
            this.isOK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.cakeError = this.sp.getChildByName("cakeError");
            this.cakeError.on(Laya.Event.CLICK, this, this.onClickCakeError);
            this.cake = this.sp.getChildByName("cake");
            DragUtil.create(this.cake).setDragMouseDownCallback(this.DragStart.bind(this));
            DragUtil.create(this.cake).setDragEndCallback(this.dragEnd.bind(this));
        }
        onClickCakeError(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        DragStart(pos, item) {
            if (!this.startPos) {
                let stagePos = Laya.stage.localToGlobal(new Laya.Point(pos.x, pos.y));
                this.startPos = new Laya.Point(stagePos.x, stagePos.y);
            }
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseDownStage);
        }
        dragEnd(pos, item) {
            if (this.isOK) {
                Laya.Tween.to(this.cake, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.showCorrect));
                this.onWin();
            }
        }
        onMouseDownStage(e) {
            this.endPos = new Laya.Point(e.stageX, e.stageY);
            let countX = this.endPos.x - this.startPos.x;
            let countY = this.endPos.y - this.startPos.y;
            if (countX > 300 || countX < -300 || countY > 300 || countY < -300) {
                Laya.stage.offAllCaller(this);
                Laya.stage.mouseEnabled = false;
                this.isOK = true;
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault3 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            console.log("加载完成");
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_0")).setDragEndCallback(this.drag_0DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_1")).setDragEndCallback(this.drag_1DragEnd.bind(this));
        }
        drag_0DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "baby").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                UIUtils.getChildByPath(this.sp, "baby/emote_0").visible = false;
                UIUtils.getChildByPath(this.sp, "baby/emote_1").visible = true;
                this.showCorrect(128, 690);
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        drag_1DragEnd(pos, item) {
            item.reset();
            this.showClickTip(1, pos);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault30 extends LevelBase {
        constructor() {
            super(...arguments);
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, "drag_4")).setDragEndCallback(this.drag_4DragEnd.bind(this));
            for (let i = 0; i < 4; i++) {
                DragUtil.create(UIUtils.getChildByPath(this.sp, `drag_${i}`)).setDragEndCallback(this.drag_4DragEnd.bind(this));
            }
        }
        drag_4DragEnd(pos, item) {
            if (UIUtils.getChildByPath(this.sp, "box").hitTestPoint(pos.x, pos.y)) {
                this.playRotateAnim(UIUtils.getChildByPath(this.sp, item.node.name));
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        playRotateAnim(item) {
            Laya.Tween.to(item, { rotation: 720, scaleX: 0, scaleY: 0, x: 375, y: 441 }, 1000);
        }
        onWin() {
            this.winNum++;
            if (this.winNum === 5) {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault31 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hit = this.sp.getChildByName("hit");
            this.drag = this.sp.getChildByName("drag");
            this.men = this.sp.getChildByName("men");
            DragUtil.create(this.drag).setDragEndCallback(this.dragEnd.bind(this));
        }
        dragEnd(pos, item) {
            if (!this.hit.hitTestPoint(pos.x, pos.y)) {
                item.hide();
                this.playWinAnim();
            }
            else {
                this.showClickTip(1, pos);
                item.reset();
            }
        }
        playWinAnim() {
            this.men.skin = "sub/level_fault_31/men_1.png";
            Laya.Tween.to(this.men, { x: this.men.x - 20 }, 100, Laya.Ease.backIn);
            Laya.timer.once(100, this, () => {
                Laya.Tween.to(this.men, { x: this.men.x + 20 }, 100);
            });
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.men, { x: this.men.x - 20 }, 100);
            });
            Laya.timer.once(300, this, () => {
                Laya.Tween.to(this.men, { x: this.men.x + 20 }, 100);
            });
            Laya.timer.once(400, this, () => {
                Laya.Tween.to(this.men, { x: this.men.x - 20 }, 100);
                this.onWin();
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault32 extends LevelBase {
        constructor() {
            super(...arguments);
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            UIUtils.getChildByPath(this.sp, 'title/click_0').on(Laya.Event.MOUSE_UP, this, this.onMouseUpClick, [0]);
            for (let i = 1; i <= 5; i++) {
                UIUtils.getChildByPath(this.sp, `click_${i}`).on(Laya.Event.MOUSE_UP, this, this.onMouseUpClick, [i]);
            }
            UIUtils.getChildByPath(this.sp, 'redBalloon').mouseEnabled = true;
            DragUtil.create(UIUtils.getChildByPath(this.sp, "redBalloon")).setDragEndCallback(this.redBalloonDragEnd.bind(this));
            UIUtils.getChildByPath(this.sp, `errClick_0`).on(Laya.Event.MOUSE_UP, this, this.onMouseUpErrClick);
            UIUtils.getChildByPath(this.sp, `errClick_1`).on(Laya.Event.MOUSE_UP, this, this.onMouseUpErrClick);
        }
        onMouseUpClick(i) {
            if (i === 0) {
                UIUtils.getChildByPath(this.sp, 'title/click_0').visible = false;
            }
            else {
                UIUtils.getChildByPath(this.sp, `click_${i}`).visible = false;
            }
            this.onWin();
        }
        onMouseUpErrClick(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        redBalloonDragEnd(pos, item) {
        }
        onWin() {
            this.winNum++;
            console.log(this.winNum);
            if (this.winNum === 6) {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault33 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.hitArr = [];
            this.isHitArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.dragon = this.sp.getChildByName("dragon");
            this.men = this.sp.getChildByName("men");
            this.caslte = this.sp.getChildByName("caslte");
            this.showCaslte = this.caslte.getChildByName("showCaslte");
            for (let i = 0; i < 6; i++) {
                if (i < 2) {
                    let drag = this.sp.getChildByName(`drag_${i}`);
                    DragUtil.create(drag).setDragEndCallback(this.towDragEnd.bind(this));
                    this.dragArr.push(drag);
                }
                let hit = this.sp.getChildByName(`hit_${i}`);
                this.hitArr.push(hit);
                this.isHitArr.push(false);
            }
            this.caslte.mask = this.showCaslte;
            this.showCaslte.visible = false;
            this.drag = this.sp.getChildByName("drag");
            this.drag.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownDrag);
        }
        onMouseDownDrag(e) {
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onMouseMoveStage(e) {
            let dragPos = this.sp.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.drag.pos(dragPos.x, dragPos.y);
            let pos = this.showCaslte.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            let newMaskImg = new Laya.Image;
            newMaskImg.anchorX = 0.5;
            newMaskImg.anchorY = 0.5;
            newMaskImg.skin = "res/ui/game/black.png";
            newMaskImg.pos(pos.x, pos.y);
            this.showCaslte.addChild(newMaskImg);
            for (let i = 0; i < this.hitArr.length; i++) {
                if (this.hitArr[i].hitTestPoint(e.stageX, e.stageY)) {
                    this.isHitArr[i] = true;
                }
            }
        }
        onMouseUpStage(e) {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
            let find = this.isHitArr.find(bool => bool === false);
            if (find == undefined) {
                this.hideDragon();
            }
        }
        towDragEnd(pos, item) {
            if (this.dragon.hitTestPoint(pos.x, pos.y) && item.node.name == "drag_1") {
                this.playDragonAnim();
                item.hide();
                return;
            }
            else if (this.men.hitTestPoint(pos.x, pos.y) && item.node.name == "drag_0") {
                this.playMenAnim();
                item.hide();
                return;
            }
            item.reset();
            this.showClickTip(1, pos);
        }
        playMenAnim() {
            this.self.mouseEnabled = false;
            this.men.skin = "sub/level_fault_33/men_1.png";
            this.men.pos(216, 694.5);
            Laya.timer.once(300, this, () => {
                Laya.Tween.to(this.men, { x: 414.5, y: 494 }, 500, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.dragon, { scaleX: 1.2, scaleY: 1.2 }, 300, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(this.men, { rotation: -90, x: 110.5, y: 677 }, 300, null, Laya.Handler.create(this, () => {
                            this.showClickTip(1);
                            this.reMake();
                            Laya.Tween.to(this.dragon, { scaleX: 1, scaleY: 1 }, 300, null);
                            Laya.timer.once(300, this, () => { this.men.visible = false; });
                        }));
                    }));
                }));
            });
        }
        playDragonAnim() {
            this.self.mouseEnabled = false;
            Laya.Tween.to(this.dragon, { scaleX: 1.2, scaleY: 1.2 }, 300, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.dragon, { scaleX: 1, scaleY: 1 }, 300, null);
                Laya.timer.once(300, this, () => { this.self.mouseEnabled = true; });
            }));
        }
        hideDragon() {
            this.dragon.visible = false;
            this.caslte.visible = false;
            this.self.mouseEnabled = false;
            this.drag.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownDrag);
            this.showCorrect();
            this.onWin();
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
        reMake() {
            Laya.timer.once(500, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
            });
        }
    }

    class LevelFault34 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.earth = UIUtils.getChildByPath(this.sp, "earth");
            this.earth.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownEarth);
            this.title = UIUtils.getChildByPath(this.sp, "titleImg/title");
            this.title.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownTitle);
        }
        onMouseDownEarth() {
            this.earth.on(Laya.Event.MOUSE_OUT, this, this.onMouseOutEarth);
            this.earth.on(Laya.Event.MOUSE_UP, this, this.onMouseUpEarth);
            Laya.Tween.to(this.earth, { scaleX: 1.2, scaleY: 1.2 }, 100);
        }
        onMouseOutEarth() {
            this.earth.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutEarth);
            this.earth.off(Laya.Event.MOUSE_UP, this, this.onMouseUpEarth);
            Laya.Tween.to(this.earth, { scaleX: 1, scaleY: 1 }, 100);
        }
        onMouseUpEarth(e) {
            this.earth.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutEarth);
            this.earth.off(Laya.Event.MOUSE_UP, this, this.onMouseUpEarth);
            Laya.Tween.to(this.earth, { scaleX: 1, scaleY: 1 }, 100);
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onMouseDownTitle() {
            this.title.on(Laya.Event.MOUSE_UP, this, this.onMouseUpTitle);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onMouseUpSelf() {
            console.log("触发");
            this.title.off(Laya.Event.MOUSE_UP, this, this.onMouseUpTitle);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onMouseUpTitle(e) {
            this.title.off(Laya.Event.MOUSE_UP, this, this.onMouseUpTitle);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            UIUtils.getChildByPath(this.sp, "titleImg/redFrame").visible = true;
            this.onWin();
        }
        onWin() {
            Laya.timer.once(700, this, () => {
                this.showCorrect(374, 455);
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault35 extends LevelBase {
        constructor() {
            super(...arguments);
            this.scaleArr = [];
            this.fireLv = [];
            this.fireArr = [];
            this.delFireLv = 0;
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.scaleArr = [1, 1.2, 1.3, 1.4];
            this.fireLv = [1, 1, 1, 1];
            for (let i = 0; i < 4; i++) {
                this.fireArr.push(UIUtils.getChildByPath(this.sp, `fire_${i}`));
                DragUtil.create(this.fireArr[i]).setDragEndCallback(this.fireDragEnd.bind(this));
            }
        }
        fireDragEnd(pos, item) {
            console.log(item.node.name);
            item.reset();
            for (let i = 0; i < this.fireArr.length; i++) {
                if (item.node.name == this.fireArr[i].name) {
                    continue;
                }
                if (this.fireArr[i].hitTestPoint(pos.x, pos.y)) {
                    let findIndex = this.fireArr.findIndex(item2 => item2.name === item.node.name);
                    if (findIndex !== -1) {
                        this.delFireLv = this.fireLv[findIndex];
                        this.fireArr.splice(findIndex, 1);
                        this.fireLv.splice(findIndex, 1);
                        if (findIndex > i) {
                            this.GrowUp(i);
                        }
                        else {
                            this.GrowUp(i - 1);
                        }
                        item.hide();
                    }
                    return;
                }
            }
        }
        GrowUp(num) {
            this.fireLv[num] += this.delFireLv;
            this.bigFire();
        }
        bigFire() {
            for (let i = 0; i < this.fireLv.length; i++) {
                Laya.Tween.to(this.fireArr[i], { scaleX: this.scaleArr[this.fireLv[i] - 1], scaleY: this.scaleArr[this.fireLv[i] - 1] }, 200);
            }
            this.onWin();
        }
        onWin() {
            this.winNum++;
            if (this.winNum === 3) {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault36 extends LevelBase {
        constructor() {
            super(...arguments);
            this.catArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let cat = this.sp.getChildByName(`cat_${i}`);
                DragUtil.create(cat).setDragEndCallback(this.catDragEnd.bind(this));
                this.catArr.push(cat);
            }
            this.titleCat = UIUtils.getChildByPath(this.sp, "titleImg/titleCat");
            this.titleCat.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownTitleCat);
        }
        onMouseDownTitleCat() {
            this.titleCat.on(Laya.Event.MOUSE_UP, this, this.onMouseUpTitleCat);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseOutSelf);
        }
        onMouseOutSelf() {
            this.titleCat.off(Laya.Event.MOUSE_UP, this, this.onMouseUpTitleCat);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutSelf);
        }
        onMouseUpTitleCat() {
            UIUtils.getChildByPath(this.sp, "titleImg/titleCat/redFrame").visible = true;
            this.showCorrect();
            this.onWin();
            this.titleCat.off(Laya.Event.MOUSE_UP, this, this.onMouseUpTitleCat);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseOutSelf);
        }
        catDragEnd(pos, self) {
            self.reset();
            this.showClickTip(1, pos);
            let num = Math.floor(Math.random() * 2) + 1;
            SoundHelper.playSound(num == 1 ? "sub/level_fault_36/cat_0.mp3" : "sub/level_fault_36/cat_1.mp3");
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault37 extends LevelBase {
        constructor() {
            super(...arguments);
            this.puzzleArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 7; i++) {
                let p = this.sp.getChildByName(`p_${i}`);
                this.puzzleArr.push(p);
                DragUtil.create(p).setDragEndCallback(this.pDragEnd.bind(this));
            }
        }
        pDragEnd(pos, self) {
            self.reset();
            const matches = self.node.name.match(/_([^_]*)/g);
            let newArr = matches.map(match => match.slice(1));
            let index = Number(newArr);
            let hit = UIUtils.getChildByPath(this.sp, `cat/hit_${index}`);
            if (hit.hitTestPoint(pos.x, pos.y)) {
                UIUtils.getChildByPath(this.sp, `cat/show_${index}`).visible = true;
                self.hide();
                this.onWin();
            }
        }
        onWin() {
            this.winNum++;
            if (this.winNum === 7) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault38 extends LevelBase {
        constructor() {
            super(...arguments);
            this.puzzleArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 7; i++) {
                let p = this.sp.getChildByName(`p_${i}`);
                this.puzzleArr.push(p);
                DragUtil.create(p).setDragEndCallback(this.pDragEnd.bind(this));
            }
        }
        pDragEnd(pos, self) {
            self.reset();
            const matches = self.node.name.match(/_([^_]*)/g);
            let newArr = matches.map(match => match.slice(1));
            let index = Number(newArr);
            let hit = UIUtils.getChildByPath(this.sp, `duck/hit_${index}`);
            if (hit.hitTestPoint(pos.x, pos.y)) {
                UIUtils.getChildByPath(this.sp, `duck/show_${index}`).visible = true;
                self.hide();
                this.onWin();
            }
        }
        onWin() {
            this.winNum++;
            if (this.winNum === 7) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault39 extends LevelBase {
        constructor() {
            super(...arguments);
            this.flyArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.winNum = 0;
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 3; i++) {
                let fly = this.sp.getChildByName(`fly_${i}`);
                Laya.Tween.to(fly, { y: fly.y - 20 }, 450);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(fly, { y: fly.y + 20 }, 500);
                });
                Laya.timer.loop(1000, this, () => {
                    Laya.Tween.to(fly, { y: fly.y - 20 }, 450);
                    Laya.timer.once(500, this, () => {
                        Laya.Tween.to(fly, { y: fly.y + 20 }, 500);
                    });
                });
                this.flyArr.push(fly);
            }
            this.shit = this.sp.getChildByName("shit");
            this.shitHide = this.sp.getChildByName("shitHide");
            this.hideMask = UIUtils.getChildByPath(this.sp, "shitHide/hideMask");
            this.hideMask.visible = false;
            this.shitHide.mask = this.hideMask;
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
        }
        onMouseDownSelf(e) {
            this.shitHide.visible = true;
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.showMask(e.stageX, e.stageY);
        }
        onMouseMoveSelf(e) {
            if (this.shit.hitTestPoint(e.stageX, e.stageY)) {
                this.winNum++;
            }
            this.showMask(e.stageX, e.stageY);
        }
        onMouseUpSelf(e) {
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            if (this.shit.hitTestPoint(e.stageX, e.stageY)) {
                this.winNum++;
            }
            let pos = new Laya.Point(e.stageX, e.stageY);
            console.log(this.winNum);
            if (this.winNum < 10) {
                this.showClickTip(1, pos);
                this.winNum = 0;
                this.hideMask.destroyChildren();
                console.log(this.hideMask);
                this.shitHide.visible = false;
            }
            this.onWin();
        }
        showMask(X, Y) {
            let pos3 = this.shitHide.globalToLocal(new Laya.Point(X, Y));
            let img = new Laya.Image;
            img.skin = "res/ui/game/black.png";
            img.anchorX = 0.5;
            img.anchorY = 0.5;
            img.pos(pos3.x, pos3.y);
            this.hideMask.addChild(img);
        }
        onWin() {
            if (this.winNum >= 10) {
                this.self.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                Laya.timer.clearAll(this);
                Laya.Tween.clearAll(this);
                for (let i = 0; i < this.flyArr.length; i++) {
                    this.flyArr[i].visible = false;
                }
                this.shitHide.visible = false;
                this.shit.visible = false;
                let shoe = this.sp.getChildByName("shoe");
                Laya.timer.once(200, this, () => {
                    Laya.Tween.to(shoe, { rotation: 18, x: 242, y: 202 }, 300);
                    Laya.timer.once(300, this, () => {
                        this.showCorrect(375, 900);
                    });
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault4 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, "squirrel_0")).setDragEndCallback(this.squirrel_DragEnd.bind(this));
            UIUtils.getChildByPath(this.sp, "halo_0").visible = false;
            UIUtils.getChildByPath(this.sp, "halo_1").visible = false;
            UIUtils.getChildByPath(this.sp, "halo_2").visible = false;
            UIUtils.getChildByPath(this.sp, "songShu").visible = false;
        }
        squirrel_DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "roller").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                this.playAnim();
                this.playSongShuAnim();
                this.onWin();
                this.showCorrect(375, 948);
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        playSongShuAnim() {
            let songShu = UIUtils.getChildByPath(this.sp, "songShu");
            let effects = UIUtils.getChildByPath(songShu, "effects");
            let squirrel_2 = UIUtils.getChildByPath(songShu, "squirrel_2");
            let foot_0 = UIUtils.getChildByPath(songShu, "foot_0");
            let foot_1 = UIUtils.getChildByPath(songShu, "foot_1");
            Laya.Tween.to(songShu, { x: 25 }, 250);
            Laya.timer.once(250, this, () => {
                Laya.Tween.to(songShu, { x: 40 }, 250);
            });
            Laya.timer.loop(500, this, () => {
                Laya.Tween.to(songShu, { x: 25 }, 250);
                Laya.timer.once(250, this, () => {
                    Laya.Tween.to(songShu, { x: 40 }, 250);
                });
            });
            Laya.Tween.to(foot_0, { rotation: 16 }, 100);
            Laya.Tween.to(foot_1, { rotation: -30 }, 100);
            Laya.timer.once(100, this, () => {
                Laya.Tween.to(foot_0, { rotation: -25 }, 100);
                Laya.Tween.to(foot_1, { rotation: 15 }, 100);
            });
            Laya.timer.loop(200, this, () => {
                Laya.Tween.to(foot_0, { rotation: 16 }, 100);
                Laya.Tween.to(foot_1, { rotation: -30 }, 100);
                Laya.timer.once(100, this, () => {
                    Laya.Tween.to(foot_0, { rotation: -25 }, 100);
                    Laya.Tween.to(foot_1, { rotation: 15 }, 100);
                });
            });
            Laya.Tween.to(squirrel_2, { scaleX: 1.2 }, 500);
            Laya.timer.once(500, this, () => {
                Laya.Tween.to(squirrel_2, { scaleX: 1 }, 500);
            });
            Laya.timer.loop(1000, this, () => {
                Laya.Tween.to(squirrel_2, { scaleX: 1.2 }, 500);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(squirrel_2, { scaleX: 1 }, 500);
                });
            });
            Laya.timer.loop(200, this, () => {
                effects.alpha = 0;
                Laya.timer.once(100, this, () => {
                    effects.alpha = 1;
                });
            });
            songShu.visible = true;
        }
        playAnim() {
            let roller = UIUtils.getChildByPath(this.sp, "roller");
            let halo_0 = UIUtils.getChildByPath(this.sp, "halo_0");
            let halo_1 = UIUtils.getChildByPath(this.sp, "halo_1");
            let halo_2 = UIUtils.getChildByPath(this.sp, "halo_2");
            halo_0.visible = true;
            halo_1.visible = true;
            halo_2.visible = true;
            halo_1.alpha = 0;
            halo_2.alpha = 0;
            roller.rotation = 0;
            Laya.Tween.to(roller, { rotation: -360 }, 500);
            Laya.timer.loop(500, this, () => {
                roller.rotation = 0;
                Laya.Tween.to(roller, { rotation: -360 }, 500);
            });
            Laya.Tween.to(halo_1, { alpha: 1 }, 500);
            Laya.Tween.to(halo_2, { alpha: 1 }, 1000);
            Laya.timer.loop(2000, this, () => {
                Laya.Tween.to(halo_1, { alpha: 0 }, 1000);
                Laya.Tween.to(halo_2, { alpha: 0 }, 1000);
                Laya.timer.once(1000, this, () => {
                    Laya.Tween.to(halo_1, { alpha: 1 }, 500);
                    Laya.Tween.to(halo_2, { alpha: 1 }, 1000);
                });
            });
        }
        onWin() {
            Laya.timer.once(2000, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault40 extends LevelBase {
        constructor() {
            super(...arguments);
            this.posList = [];
            this.isPosList = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.isPosList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.winNum = 0;
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.show = this.sp.getChildByName("show");
            this.hide = this.sp.getChildByName("hide");
            this.hideMask = this.hide.getChildByName("hideMask");
            this.hideMask.visible = false;
            this.hide.mask = this.hideMask;
            let posList = this.sp.getChildByName("posList");
            for (let i = 0; i < 8; i++) {
                let pos = posList.getChildByName(`pos_${i}`);
                this.posList.push(pos);
            }
            this.posList;
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
        }
        onMouseDownSelf(e) {
            this.hide.visible = true;
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.showMask(e.stageX, e.stageY);
        }
        onMouseMoveSelf(e) {
            for (let i = 0; i < this.posList.length; i++) {
                if (this.posList[i].hitTestPoint(e.stageX, e.stageY)) {
                    this.isPosList[i] = 1;
                }
            }
            this.showMask(e.stageX, e.stageY);
        }
        onMouseUpSelf(e) {
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            for (let i = 0; i < this.isPosList.length; i++) {
                if (this.isPosList[i] === 1) {
                    this.winNum++;
                }
            }
            console.log(this.winNum);
            if (this.winNum !== 8) {
                let pos = new Laya.Point(e.stageX, e.stageY);
                this.showClickTip(1, pos);
                this.hideMask.destroyChildren();
                this.hide.visible = false;
                this.winNum = 0;
                for (let i = 0; i < this.isPosList.length; i++) {
                    this.isPosList[i] = 0;
                }
            }
            else {
                this.self.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.hide.mask = null;
                this.show.visible = false;
                this.hide.visible = false;
                this.sp.getChildByName("winImg").visible = true;
                this.onWin();
            }
        }
        showMask(X, Y) {
            let pos3 = this.hide.globalToLocal(new Laya.Point(X, Y));
            let img = new Laya.Image;
            img.skin = "res/ui/game/black.png";
            img.anchorX = 0.5;
            img.anchorY = 0.5;
            img.pos(pos3.x, pos3.y);
            this.hideMask.addChild(img);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault41 extends LevelBase {
        constructor() {
            super(...arguments);
            this.posList = [];
            this.isHit = [0, 0, 0];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            let posList = this.sp.getChildByName("posList");
            for (let i = 0; i < 3; i++) {
                let pos = posList.getChildByName(`pos_${i}`);
                this.posList.push(pos);
            }
            let iceCake_0 = this.sp.getChildByName("iceCake_0");
            let iceCake_1 = this.sp.getChildByName("iceCake_1");
            iceCake_0.visible = false;
            iceCake_1.visible = false;
            this.water = this.sp.getChildByName("water");
            this.hideWater = this.water.getChildByName("hideWater");
            this.water.mask = this.hideWater;
            this.hideWater.visible = false;
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
        }
        onMouseDownSelf(e) {
            this.water.visible = true;
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.showMask(e.stageX, e.stageY);
            for (let i = 0; i < this.posList.length; i++) {
                if (this.posList[i].hitTestPoint(e.stageX, e.stageY)) {
                    this.isHit[i] = 1;
                }
            }
        }
        onMouseMoveSelf(e) {
            this.showMask(e.stageX, e.stageY);
            for (let i = 0; i < this.posList.length; i++) {
                if (this.posList[i].hitTestPoint(e.stageX, e.stageY)) {
                    this.isHit[i] = 1;
                }
            }
        }
        onMouseUpSelf(e) {
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            for (let i = 0; i < this.isHit.length; i++) {
                if (this.isHit[i] === 1) {
                    this.winNum++;
                }
            }
            if (this.winNum === 3) {
                this.playWinAnim();
            }
            else {
                this.winNum = 0;
                this.isHit = [0, 0, 0];
                this.hideWater.destroyChildren();
                this.water.visible = false;
                let pos = new Laya.Point(e.stageX, e.stageY);
                this.showClickTip(1, pos);
            }
        }
        showMask(X, Y) {
            let pos = this.hideWater.globalToLocal(new Laya.Point(X, Y));
            let img = new Laya.Image;
            img.skin = "res/ui/game/black.png";
            img.anchorX = 0.5;
            img.anchorY = 0.5;
            img.scale(1.1, 1.1);
            img.pos(pos.x, pos.y);
            this.hideWater.addChild(img);
        }
        playWinAnim() {
            this.sp.getChildByName("bigIceCake_1").visible = false;
            this.sp.getChildByName("bigIceCake_0").visible = false;
            let iceCake_0 = this.sp.getChildByName("iceCake_0");
            let iceCake_1 = this.sp.getChildByName("iceCake_1");
            let bear = this.sp.getChildByName("bear");
            let penguin = this.sp.getChildByName("penguin");
            this.self.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            iceCake_0.visible = true;
            iceCake_1.visible = true;
            penguin.skin = "sub/level_fault_41/penguin_1.png";
            penguin.pos(413.5, 353);
            bear.skin = "sub/level_fault_41/bear_0.png";
            bear.pos(115, 193.5);
            Laya.Tween.to(iceCake_0, { x: iceCake_0.x - 100 }, 1000);
            Laya.Tween.to(iceCake_1, { x: iceCake_1.x + 100 }, 1000);
            Laya.Tween.to(bear, { x: bear.x - 100 }, 1000);
            Laya.Tween.to(penguin, { x: penguin.x + 100 }, 1000);
            Laya.timer.once(1000, this, () => {
                this.showCorrect();
                this.onWin();
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault42 extends LevelBase {
        constructor() {
            super(...arguments);
            this.sunflowerArr = [];
            this.isCorrect = false;
            this.isCorrectClick = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 3; i++) {
                let flower = this.sp.getChildByName(`sunflower_${i}`);
                flower.on(Laya.Event.CLICK, this, this.onClickFlower, [i]);
                this.sunflowerArr.push(flower);
            }
            this.sun = this.sp.getChildByName("sun");
            this.sunflower = this.sunflowerArr[1].getChildByName("sunflower");
            this.sun.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSun);
        }
        onMouseDownSun() {
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
        }
        onMouseUpSelf() {
            this.self.offAllCaller(this);
        }
        onMouseMoveSelf(e) {
            this.sun.x = e.stageX;
            this.sunflower.rotation = (this.sun.x - 117) * (1 / 15);
            if (this.sun.x >= 257) {
                this.isCorrectClick = true;
            }
            if (e.stageX >= 600 && !this.isCorrect) {
                let pos = this.self.localToGlobal(new Laya.Point(this.sunflowerArr[1].x, this.sunflowerArr[1].y));
                this.isCorrect = true;
                this.showCorrect(pos.x, pos.y);
                this.onWin();
            }
        }
        onClickFlower(i, e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            if (this.isCorrectClick && i == 1) {
                this.self.mouseEnabled = false;
                this.showCorrect(pos.x, pos.y);
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault43 extends LevelBase {
        constructor() {
            super(...arguments);
            this.eggArr = [];
            this.clickArr = [0, 0, 0, 0];
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let egg = this.sp.getChildByName(`egg_${i}`);
                egg.on(Laya.Event.CLICK, this, this.onCLickEgg, [i]);
                this.eggArr.push(egg);
            }
        }
        onCLickEgg(num) {
            this.eggArr[num].off(Laya.Event.CLICK, this, this.onCLickEgg);
            let selfNum = (this.clickArr[num] < 2);
            if (this.clickArr[num] < 2) {
                this.clickArr[num]++;
            }
            else {
                return;
            }
            let find = this.clickArr.find(number => number < 2);
            if (find == undefined && selfNum) {
                this.endClickNum = num;
            }
            for (let j = 0; j < 5; j++) {
                let rotation = 5;
                if ((j % 2) !== 0) {
                    rotation = -5;
                }
                if (j !== 4) {
                    Laya.timer.once(100 * j, this, () => {
                        Laya.Tween.to(this.eggArr[num], { rotation: rotation }, 100);
                    });
                }
                else {
                    Laya.timer.once(100 * j, this, () => {
                        Laya.Tween.to(this.eggArr[num], { rotation: 0 }, 100);
                        this.showNewEgg();
                        this.eggArr[num].on(Laya.Event.CLICK, this, this.onCLickEgg, [num]);
                    });
                }
            }
        }
        showNewEgg() {
            if (this.isWin) {
                return;
            }
            for (let i = 0; i < this.eggArr.length; i++) {
                if (this.endClickNum !== undefined && i == this.endClickNum && !this.isWin) {
                    this.isWin = true;
                    this.eggArr[i].skin = `sub/level_fault_43/egg_3.png`;
                    let eggPos = new Laya.Point(this.eggArr[i].x, this.eggArr[i].y);
                    let spPos = this.sp.localToGlobal(new Laya.Point(eggPos.x, eggPos.y));
                    this.showCorrect(spPos.x, spPos.y);
                    this.onWin();
                }
                else {
                    this.eggArr[i].skin = `sub/level_fault_43/egg_${this.clickArr[i]}.png`;
                }
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault44 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.men = this.sp.getChildByName("men");
            this.showAnswer = this.sp.getChildByName("showAnswer");
            this.showAnswer.visible = false;
            for (let i = 0; i < 4; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                this.dragArr.push(drag);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
            }
        }
        dragEnd(pos, item) {
            if (item.node.name == "drag_0" && this.men.hitTestPoint(pos.x, pos.y)) {
                item.hide();
                this.showCorrect();
                this.onWin();
                this.showAnswer.visible = true;
            }
            else {
                this.showClickTip(1, pos);
                item.reset();
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault45 extends LevelBase {
        constructor() {
            super(...arguments);
            this.clickList = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.drag = UIUtils.getChildByPath(this.sp, "drag");
            DragUtil.create(this.drag).setDragEndCallback(this.dragOut.bind(this));
            for (let i = 0; i < 3; i++) {
                let click = this.sp.getChildByName(`click_${i}`);
                this.clickList.push(click);
                this.clickList[i].on(Laya.Event.CLICK, this, this.onClick_i, [i]);
            }
            console.log(this.clickList);
        }
        onClick_i(i, e) {
            console.log("点击", e, i);
            Laya.Tween.to(this.clickList[i], { scaleX: 1.1, scaleY: 1.1 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.clickList[i], { scaleX: 1, scaleY: 1 }, 200);
            });
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        dragOut(pos, self) {
            let her = this.sp.getChildByName("her");
            if (her.hitTestPoint(pos.x, pos.y)) {
                this.drag.scale(0.75, 0.75);
                this.drag.pos(407, 441);
                this.self.mouseEnabled = false;
                this.showCorrect();
                this.onWin();
            }
            else {
                self.reset();
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault46 extends LevelBase {
        constructor() {
            super(...arguments);
            this.clickList = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 5; i++) {
                let click = this.sp.getChildByName(`click_${i}`);
                this.clickList.push(click);
                this.clickList[i].on(Laya.Event.CLICK, this, this.onClick_i, [i]);
            }
        }
        onClick_i(i, e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            Laya.Tween.to(this.clickList[i], { scaleX: 1.15, scaleY: 1.15 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.clickList[i], { scaleX: 1, scaleY: 1 }, 200);
            });
            if (i !== 4) {
                this.showClickTip(1, pos);
            }
            else {
                this.showCorrect();
                this.onWin();
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault47 extends LevelBase {
        constructor() {
            super(...arguments);
            this.intList = [];
            this.posList = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.police = this.sp.getChildByName("police");
            this.thief = this.sp.getChildByName("thief");
            this.newPolie = new police(this.police, 0);
            this.newThief = new thief(this.thief, 5);
            for (let i = 0; i < 6; i++) {
                let intersection = this.sp.getChildByName(`int_${i}`);
                this.intList.push(intersection);
                this.intList[i].on(Laya.Event.CLICK, this, this.runInt, [i]);
            }
            this.intList[this.newPolie.num].off(Laya.Event.CLICK, this, this.runInt);
            this.posList = [
                { pos: [375, 541], num: 0, run: [1, 2, 3] },
                { pos: [228, 730], num: 1, run: [0, 2, 4] },
                { pos: [508, 730], num: 2, run: [0, 1, 5] },
                { pos: [375, 301], num: 3, run: [0, 4, 5] },
                { pos: [139, 464], num: 4, run: [1, 3] },
                { pos: [607, 464], num: 5, run: [2, 3] }
            ];
        }
        runInt(clickNum) {
            this.self.mouseEnabled = false;
            let find = this.posList.find(item => item.num === this.newPolie.num);
            if (find !== -1) {
                if (find.run.includes(clickNum)) {
                    this.newPolie.num = clickNum;
                    console.log(this.newPolie.num, this.newThief.num);
                    if (this.newPolie.num === this.newThief.num) {
                        Laya.Tween.to(this.police, { x: this.posList[clickNum].pos[0], y: this.posList[clickNum].pos[1] }, 500, Laya.Ease.quadInOut);
                        this.onWin();
                        return;
                    }
                    let notRunList = [this.newPolie.num];
                    for (let i = 0; i < this.posList[clickNum].run.length; i++) {
                        notRunList.push(this.posList[clickNum].run[i]);
                    }
                    let runNumList = this.posList[this.newThief.num].run.filter(item => !notRunList.includes(item));
                    if (runNumList.length == 0) {
                        runNumList = [this.posList[this.newThief.num].run[0]];
                    }
                    this.newThief.num = runNumList[0];
                    Laya.Tween.to(this.police, { x: this.posList[clickNum].pos[0], y: this.posList[clickNum].pos[1] }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, () => {
                        Laya.Tween.to(this.thief, { x: this.posList[runNumList[0]].pos[0], y: this.posList[runNumList[0]].pos[1] }, 500);
                        Laya.timer.once(500, this, () => {
                            for (let i = 0; i < 6; i++) {
                                let intersection = this.sp.getChildByName(`int_${i}`);
                                this.intList.push(intersection);
                                this.intList[i].on(Laya.Event.CLICK, this, this.runInt, [i]);
                            }
                            this.intList[clickNum].off(Laya.Event.CLICK, this, this.runInt);
                            this.self.mouseEnabled = true;
                        });
                    }));
                }
                else {
                }
            }
        }
        onWin() {
            this.self.mouseEnabled = false;
            Laya.timer.once(1000, this, () => {
                this.showCorrect();
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }
    class police extends Laya.EventDispatcher {
        constructor(img, num) {
            super();
            this.img = img;
            this.num = num;
        }
    }
    class thief extends Laya.EventDispatcher {
        constructor(img, num) {
            super();
            this.img = img;
            this.num = num;
        }
    }

    class LevelFault48 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragList = [];
            this.regionList = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 3; i++) {
                let drag = UIUtils.getChildByPath(this.sp, `drag_${i}`);
                this.dragList.push(drag);
                DragUtil.create(drag).setDragEndCallback(this.dragEndCallback.bind(this));
                let region = this.sp.getChildByName(`region_${i}`);
                this.regionList.push(region);
            }
        }
        dragEndCallback(pos, self) {
            if (self.node.name === "drag_0" && this.regionList[1].hitTestPoint(pos.x, pos.y)) {
                Laya.Tween.to(this.dragList[0], { x: 324.5, y: 194.5 }, 500);
                this.dragList[0].mouseEnabled = false;
                this.onWin();
            }
            else if (self.node.name === "drag_1" && this.regionList[2].hitTestPoint(pos.x, pos.y)) {
                Laya.Tween.to(this.dragList[1], { x: 151.5, y: 101 }, 500);
                this.dragList[1].mouseEnabled = false;
                this.onWin();
            }
            else if (self.node.name === "drag_2" && this.regionList[0].hitTestPoint(pos.x, pos.y)) {
                Laya.Tween.to(this.dragList[2], { x: 128, y: 98.5 }, 500);
                this.dragList[2].mouseEnabled = false;
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
                self.reset();
            }
        }
        onWin() {
            this.winNum++;
            if (this.winNum === 3) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault49 extends LevelBase {
        constructor() {
            super(...arguments);
            this.StartX_Box = 0;
            this.startY_Drag = 0;
            this.clickStartY_Drag = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.box = this.sp.getChildByName("box");
            this.drag = this.box.getChildByName("drag");
            this.hit = this.box.getChildByName("hit");
            this.startY_Drag = this.drag.y;
            this.box.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownBox);
        }
        onMouseDownBox(e) {
            this.StartX_Box = e.stageX;
            this.box.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveBox);
            this.box.on(Laya.Event.MOUSE_UP, this, this.onMouseUpBox);
            this.box.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpBox);
        }
        onMouseMoveBox(e) {
            if ((e.stageX - this.StartX_Box) <= 0 && this.box.x > -748) {
                this.box.x += (e.stageX - this.StartX_Box);
            }
            if (this.box.x <= -679) {
                this.drag.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownDrag);
            }
            this.StartX_Box = e.stageX;
        }
        onMouseUpBox() {
            this.box.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveBox);
            this.box.off(Laya.Event.MOUSE_UP, this, this.onMouseUpBox);
        }
        onMouseDownDrag(e) {
            this.clickStartY_Drag = e.stageY;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveDrag);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpDrag);
        }
        onMouseMoveDrag(e) {
            this.drag.y += (e.stageY - this.clickStartY_Drag);
            this.clickStartY_Drag = e.stageY;
        }
        onMouseUpDrag(e) {
            let hitBounds = this.hit.getBounds();
            let dragBounds = this.drag.getBounds();
            if (hitBounds.intersects(dragBounds)) {
                this.playWinAnim();
            }
            else {
                let pos = new Laya.Point(e.stageX, e.stageY);
                this.showClickTip(1, pos);
                this.drag.y = this.startY_Drag;
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveDrag);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpDrag);
        }
        playWinAnim() {
            this.box.offAllCaller(this);
            this.drag.offAllCaller(this);
            let tree_1 = this.box.getChildByName("tree_1");
            Laya.Tween.to(this.box, { x: 0 }, 500, Laya.Ease.bounceOut, Laya.Handler.create(this, () => {
                Laya.Tween.to(tree_1, { alpha: 1 }, 500);
            }));
            Laya.timer.once(1500, this, () => {
                this.showCorrect();
                this.onWin();
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault5 extends LevelBase {
        constructor() {
            super(...arguments);
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, "tai/drag_1")).setDragEndCallback(this.drag_1DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "tai/drag_2")).setDragEndCallback(this.drag_2DragEnd.bind(this));
            DragUtil.create(UIUtils.getChildByPath(this.sp, "tai/drag_3")).setDragEndCallback(this.drag_3DragEnd.bind(this));
        }
        drag_1DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "tai/p1_0").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                UIUtils.getChildByPath(this.sp, "tai/p1_0").visible = false;
                UIUtils.getChildByPath(this.sp, "tai/p1_1").visible = true;
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        drag_2DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "tai/p2_0").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                UIUtils.getChildByPath(this.sp, "tai/p2_0").visible = false;
                UIUtils.getChildByPath(this.sp, "tai/p2_1").visible = true;
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        drag_3DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "tai/p3_0").hitTestPoint(pos.x, pos.y)) {
                item.hide();
                UIUtils.getChildByPath(this.sp, "tai/p3_0").visible = false;
                UIUtils.getChildByPath(this.sp, "tai/p3_1").visible = true;
                this.onWin();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        onWin() {
            this.winNum++;
            if (this.winNum == 3) {
                this.showCorrect(374, 894);
                Laya.timer.once(500, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault50 extends LevelBase {
        constructor() {
            super(...arguments);
            this.clickStartX = 0;
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img = this.sp.getChildByName("img");
            this.correct = this.img.getChildByName("correct");
            this.img.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownImg);
        }
        onMouseDownImg(e) {
            this.clickStartX = e.stageX;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
        }
        onMouseMoveStage(e) {
            let pos = this.self.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            if (this.img.x + (pos.x - this.clickStartX) < this.img.x && this.img.x > -142) {
                this.img.x = (pos.x - this.clickStartX);
            }
            if (this.img.x < -100 && !this.isWin) {
                this.isWin = true;
                let pos = this.img.localToGlobal(new Laya.Point(this.correct.x, this.correct.y));
                this.showCorrect(pos.x, pos.y);
                this.onWin();
            }
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onMouseUpStage(e) {
            Laya.stage.offAllCaller(this);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault51 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.hitArr = [];
            this.isHit = [];
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hideImg = this.sp.getChildByName("hideImg");
            this.Mask = this.hideImg.getChildByName("Mask");
            this.drag = this.sp.getChildByName("drag");
            DragUtil.create(this.drag).setDragMouseDownCallback(this.dragStart.bind(this));
            DragUtil.create(this.drag).setDragEndCallback(this.dragEnd.bind(this));
            for (let i = 0; i < 5; i++) {
                if (i < 2) {
                    let drag = this.sp.getChildByName(`drag_${i}`);
                    DragUtil.create(drag).setDragEndCallback(this.dragEnd_err.bind(this));
                    this.dragArr.push(drag);
                }
                let hit = this.sp.getChildByName(`hit_${i}`);
                hit.visible = false;
                this.isHit.push(0);
                this.hitArr.push(hit);
            }
            this.Mask.visible = false;
            this.hideImg.mask = this.Mask;
        }
        dragStart(pos, item) {
            this.startPos = pos;
            this.drag.scale(0.7, 0.7);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        dragEnd_err(pos, item) {
            item.reset();
            this.showClickTip(1, pos);
        }
        dragEnd(pos, item) {
            item.reset();
            this.drag.scale(0.5, 0.5);
        }
        onMouseMoveStage(e) {
            let X = (e.stageX - this.startPos.x) < -10 || (e.stageX - this.startPos.x) > 10;
            let Y = (e.stageY - this.startPos.y) < -10 || (e.stageY - this.startPos.y) > 10;
            if (Y || X) {
                console.log(e);
                let maskImg = new Laya.Image;
                maskImg.anchorX = 0.5;
                maskImg.anchorY = 0.5;
                maskImg.skin = "res/ui/game/black.png";
                maskImg.width = 200;
                maskImg.height = 200;
                let pos = this.hideImg.globalToLocal(new Laya.Point(e.stageX, e.stageY));
                maskImg.pos(pos.x, pos.y);
                this.Mask.addChild(maskImg);
                this.startPos = new Laya.Point(e.stageX, e.stageY);
            }
            for (let i = 0; i < this.hitArr.length; i++) {
                let hitBounds = this.hitArr[i].getBounds();
                let dragBounds = this.drag.getBounds();
                if (hitBounds.intersects(dragBounds)) {
                    this.isHit[i] = 1;
                }
            }
            let find = this.isHit.find(number => number === 0);
            if (find == undefined && !this.isWin) {
                this.isWin = true;
                Laya.stage.offAllCaller(this);
                this.hideImg.mask = null;
                Laya.stage.mouseEnabled = false;
                this.showCorrect();
                this.onWin();
            }
        }
        onMouseUpStage(e) {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault52 extends LevelBase {
        constructor() {
            super(...arguments);
            this.hitArr = [];
            this.isHit = [];
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img = this.sp.getChildByName("img");
            this.Mask = this.img.getChildByName("Mask");
            this.drag = this.sp.getChildByName("drag");
            this.showMaskImg = this.drag.getChildByName("showMaskImg");
            for (let i = 0; i < 4; i++) {
                let hit = this.sp.getChildByName(`hit_${i}`);
                hit.visible = false;
                this.hitArr.push(hit);
                this.isHit.push(0);
            }
            this.Mask.visible = false;
            this.img.mask = this.Mask;
            DragUtil.create(this.drag).setDragMouseDownCallback(this.dragStart.bind(this));
        }
        dragStart(pos, item) {
            this.clickStartPos = pos;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onMouseMoveStage(e) {
            let ifPos = new Laya.Point(e.stageX, e.stageY);
            let X = (ifPos.x - this.clickStartPos.x) > 5 || (ifPos.x - this.clickStartPos.x) < -5;
            let Y = (ifPos.y - this.clickStartPos.y) > 5 || (ifPos.y - this.clickStartPos.y) < -5;
            if (X || Y) {
                let maskImg = new Laya.Image;
                maskImg.anchorX = 0.5;
                maskImg.anchorY = 0.5;
                maskImg.skin = "res/ui/comm/blackMask.png";
                maskImg.width = 107;
                maskImg.height = 69;
                let pos = this.showMaskImg.localToGlobal(new Laya.Point(this.showMaskImg.x, this.showMaskImg.y));
                let pos2 = this.Mask.globalToLocal(new Laya.Point(pos.x, pos.y));
                maskImg.pos(pos2.x, pos2.y);
                this.Mask.addChild(maskImg);
                this.clickStartPos = ifPos;
            }
            for (let i = 0; i < this.hitArr.length; i++) {
                let hitBounds = this.hitArr[i].getBounds();
                let dragBounds = this.drag.getBounds();
                if (hitBounds.intersects(dragBounds)) {
                    this.isHit[i] = 1;
                }
            }
            let find = this.isHit.find(number => number === 0);
            if (find == undefined && !this.isWin) {
                this.isWin = true;
                this.img.mask = null;
                this.showCorrect();
                this.onWin();
            }
        }
        onMouseUpStage() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault53 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.notHit = UIUtils.getChildByPath(this.sp, "robot/notHit");
            let power_0 = UIUtils.getChildByPath(this.sp, "robot/power_0");
            this.power_1 = UIUtils.getChildByPath(this.sp, "robot/power_1");
            power_0.on(Laya.Event.CLICK, this, () => {
                Laya.Tween.to(power_0, { x: power_0.x - 80 }, 500);
                Laya.timer.once(300, this, () => {
                    Laya.Tween.to(power_0, { alpha: 0 }, 400, Laya.Ease.quadInOut, Laya.Handler.create(this, () => {
                        DragUtil.create(this.power_1).setDragEndCallback(this.dragEnd.bind(this));
                    }));
                });
            });
        }
        dragEnd(pos, self) {
            if (!this.notHit.hitTestPoint(pos.x, pos.y)) {
                let robot = this.sp.getChildByName("robot");
                let men = this.sp.getChildByName("men");
                this.self.mouseEnabled = false;
                Laya.Tween.to(this.power_1, { alpha: 0 }, 500, null, Laya.Handler.create(this, () => {
                    robot.visible = false;
                    Laya.timer.once(500, this, () => { men.skin = "sub/level_fault_53/men_1.png"; this.showCorrect(); });
                    this.onWin();
                }));
            }
            else {
                this.showClickTip(1, pos);
                self.reset();
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault54 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.win = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.treeHit = this.sp.getChildByName("treeHit");
            this.leopard = this.sp.getChildByName("leopard");
            this.men = this.sp.getChildByName("men");
            this.leaf = UIUtils.getChildByPath(this.sp, "leaf");
            this.leaf.visible = false;
            UIUtils.getChildByPath(this.sp, "wow").visible = false;
            for (let i = 0; i < 2; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                this.dragArr.push(drag);
            }
            this.boom = this.sp.getChildByName("boom");
            this.boom.visible = false;
        }
        dragEnd(pos, item) {
            item.reset();
            if (item.node.name == "drag_1" && this.men.hitTestPoint(pos.x, pos.y)) {
                item.hide();
                this.sp.getChildByName("wenHao").visible = false;
                if (!this.win) {
                    console.log("游戏失败");
                    this.playFailAnim();
                }
                else {
                    console.log("游戏胜利");
                    this.playWinAnim();
                }
            }
            else if (item.node.name == "drag_0" && this.treeHit.hitTestPoint(pos.x, pos.y)) {
                this.leaf.visible = true;
                this.men.visible = false;
                UIUtils.getChildByPath(this.sp, "wenHao").visible = false;
                this.win = true;
                console.log("win = true");
                item.hide();
            }
            else if (item.node.name == "drag_1" && this.win && this.leaf.hitTestPoint(pos.x, pos.y) && this.leaf.visible) {
                item.hide();
                console.log("游戏胜利");
                this.playWinAnim();
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        playFailAnim() {
            this.men.skin = "sub/level_fault_54/men_1.png";
            this.men.pos(0, 418);
            Laya.timer.once(500, this, () => {
                UIUtils.getChildByPath(this.sp, "wow").visible = true;
                this.leopard.skin = "sub/level_fault_54/leopard_1.png";
                this.leopard.pos(316, 301);
                Laya.timer.once(1000, this, () => {
                    this.leopard.skin = "sub/level_fault_54/leopard_3.png";
                    UIUtils.getChildByPath(this.sp, "wow").visible = false;
                    this.leopard.pos(254.5, 365);
                    Laya.Tween.to(this.leopard, { x: 100, y: 490 }, 700);
                    Laya.timer.once(700, this, () => {
                        this.leopard.visible = false;
                        this.men.visible = false;
                        this.boom.visible = true;
                        this.boom.play();
                        Laya.timer.once(1000, this, () => {
                            this.showClickTip(1);
                            Laya.timer.once(1000, this, () => {
                                GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                            });
                        });
                    });
                });
            });
        }
        playWinAnim() {
            UIUtils.getChildByPath(this.sp, "wow").visible = true;
            this.leopard.skin = "sub/level_fault_54/leopard_1.png";
            this.leopard.pos(316, 301);
            Laya.timer.once(700, this, () => {
                this.leopard.skin = "sub/level_fault_54/leopard_2.png";
                this.leopard.pos(327, 300);
                Laya.timer.once(500, this, () => {
                    this.leopard.skin = "sub/level_fault_54/leopard_1.png";
                    this.leopard.pos(316, 301);
                    Laya.timer.once(500, this, () => {
                        this.leopard.skin = "sub/level_fault_54/leopard_2.png";
                        this.leopard.pos(327, 300);
                        Laya.timer.once(700, this, () => {
                            this.leopard.skin = "sub/level_fault_54/leopard_3.png";
                            this.leopard.scaleX = -1;
                            this.leopard.pos(723, 346);
                            UIUtils.getChildByPath(this.sp, "wow").visible = false;
                            Laya.Tween.to(this.leopard, { x: 1106, y: 549 }, 1500, null, Laya.Handler.create(this, () => {
                                this.leopard.visible = false;
                                this.onWin();
                            }));
                        });
                    });
                });
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault55 extends LevelBase {
        constructor() {
            super(...arguments);
            this.click_0 = false;
            this.click_1 = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.palm_0 = this.sp.getChildByName("palm_0");
            this.palm_1 = this.sp.getChildByName("palm_1");
            this.palm_0.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownPalm, [0]);
            this.palm_1.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownPalm, [1]);
        }
        onMouseDownPalm(i, e) {
            if (i == 0) {
                this.palm_0.on(Laya.Event.MOUSE_UP, this, this.onMouseUpPalm, [0]);
                this.palm_0.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpPalm, [0]);
                this.click_0 = true;
                Laya.Tween.to(this.palm_0, { scaleX: 1.2, scaleY: 1.2 }, 300);
            }
            else {
                this.palm_1.on(Laya.Event.MOUSE_UP, this, this.onMouseUpPalm, [1]);
                this.palm_1.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpPalm, [1]);
                Laya.Tween.to(this.palm_1, { scaleX: -1.2, scaleY: 1.2 }, 300);
                this.click_1 = true;
            }
            if (this.click_0 && this.click_1) {
                this.self.mouseEnabled = false;
                this.showCorrect();
                this.onWin();
            }
        }
        onMouseUpPalm(i, e) {
            if (i == 0) {
                this.palm_0.off(Laya.Event.MOUSE_UP, this, this.onMouseUpPalm);
                this.palm_0.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpPalm);
                this.click_0 = false;
                Laya.Tween.to(this.palm_0, { scaleX: 1, scaleY: 1 }, 300);
            }
            else {
                this.palm_1.off(Laya.Event.MOUSE_UP, this, this.onMouseUpPalm);
                this.palm_1.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpPalm);
                Laya.Tween.to(this.palm_1, { scaleX: -1, scaleY: 1 }, 300);
                this.click_1 = false;
            }
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault56 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragList = [];
            this.hitList = [];
            this.isHitArr = [false, false, false];
            this.dragCount = 3;
            this.needItemArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 10; i++) {
                if (i < 3) {
                    let hit = this.sp.getChildByName(`hit_${i}`);
                    this.hitList.push(hit);
                }
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                this.dragList.push(drag);
            }
        }
        dragEnd(pos, self) {
            let isHit = false;
            for (let i = 0; i < this.hitList.length; i++) {
                if (this.hitList[i].hitTestPoint(pos.x, pos.y)) {
                    this.isHitArr[i] = true;
                    this.dragCount--;
                    let item = this.dragList.find(value => value.name === self.node.name);
                    isHit = true;
                    if (item) {
                        this.needItemArr.push(item);
                        Laya.Tween.to(item, { x: this.hitList[i].x, y: this.hitList[i].y }, 300);
                    }
                    break;
                }
            }
            if (!isHit) {
                self.reset();
            }
            if (this.dragCount === 0) {
                this.self.mouseEnabled = false;
                let isHitKey = false;
                let dragNameArr = ["drag_0", "drag_6", "drag_9"];
                let winCondition = 0;
                for (const key in this.isHitArr) {
                    if (!this.isHitArr[key]) {
                        isHitKey = true;
                        break;
                    }
                }
                for (let i = 0; i < this.needItemArr.length; i++) {
                    let find = this.needItemArr.find(dragName => dragName.name === dragNameArr[i]);
                    if (find) {
                        winCondition++;
                    }
                }
                if (isHitKey || winCondition !== 3) {
                    this.showClickTip(1, pos);
                    Laya.timer.once(1000, this, () => {
                        GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                    });
                }
                else {
                    this.onWin();
                    Laya.timer.once(500, this, () => {
                        this.showCorrect();
                    });
                }
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault57 extends LevelBase {
        constructor() {
            super(...arguments);
            this.appleArr = [];
            this.oldPos = [];
            this.delAppleArr = [];
            this.allowAppleArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.appleBox = this.sp.getChildByName("appleBox");
            this.btnSubmit = this.sp.getChildByName("btnSubmit");
            this.addApple();
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.btnSubmit.on(Laya.Event.CLICK, this, this.onClickBtnSubmit);
        }
        onClickBtnSubmit() {
            this.self.mouseEnabled = false;
            if (this.winNum === 30) {
                this.showCorrect();
                this.onWin();
            }
            else {
                this.showClickTip(1);
                Laya.timer.once(700, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                });
            }
        }
        addApple() {
            let index = 0;
            for (let i = 0; i < 6; i++) {
                let Y = i * 110;
                for (let j = 0; j < 5; j++) {
                    let X = j * 130;
                    let apple = new Laya.Image;
                    apple.skin = "sub/level_fault_57/apple_0.png";
                    apple.pos(X, Y);
                    apple.name = `apple_${index}`;
                    apple.anchorX = 0.5;
                    apple.anchorY = 0.5;
                    index++;
                    this.appleBox.addChild(apple);
                    this.appleArr.push(apple);
                }
            }
            this.appleArr[1].skin = "sub/level_fault_57/apple_1.png";
            this.appleArr[1].on(Laya.Event.CLICK, this, this.onClickRedApple);
        }
        onClickRedApple(e) {
            e.stopPropagation();
            this.appleArr[1].skin = "sub/level_fault_57/apple_0.png";
        }
        allowApples(item) {
            this.allowAppleArr = [];
            let allowApple = [];
            const regex = /_(.*)$/;
            const match = item.name.match(regex);
            let num;
            match ? num = parseInt(match[1]) : null;
            num + 1 <= 29 ? (allowApple[allowApple.length] = num + 1) : null;
            num - 1 >= 0 ? (allowApple[allowApple.length] = num - 1) : null;
            num + 5 <= 29 ? (allowApple[allowApple.length] = num + 5) : null;
            num - 5 >= 0 ? (allowApple[allowApple.length] = num - 5) : null;
            for (let i = 0; i < allowApple.length; i++) {
                this.allowAppleArr.push(this.appleArr[allowApple[i]]);
            }
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.appleArr.length; i++) {
                if (this.appleArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delAppleArr.includes(this.appleArr[i])) {
                    if (this.appleArr[i].skin === "sub/level_fault_57/apple_1.png") {
                        return;
                    }
                    if (this.allowAppleArr.length == 0) {
                        this.allowApples(this.appleArr[i]);
                    }
                    let appleBoxPos = this.appleBox.localToGlobal(new Laya.Point(this.appleArr[i].x, this.appleArr[i].y));
                    if (!this.start) {
                        this.delAppleArr.push(this.appleArr[i]);
                        this.start = this.line.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                        this.winNum++;
                    }
                    this.oldPos.push(this.start);
                    this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                    this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                    this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                    break;
                }
            }
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.start == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.start.x, this.start.y, pos.x, pos.y, "#ff0000", 10);
            for (let i = 0; i < this.appleArr.length; i++) {
                if (this.appleArr[i].skin === "sub/level_fault_57/apple_0.png" && this.appleArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delAppleArr.includes(this.appleArr[i]) && this.allowAppleArr.includes(this.appleArr[i])) {
                    this.delAppleArr.push(this.appleArr[i]);
                    let appleBoxPos = this.appleBox.localToGlobal(new Laya.Point(this.appleArr[i].x, this.appleArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.start.x, this.start.y, endPox.x, endPox.y, "#ff0000", 10);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#ff0000", 10);
                    this.start.x = endPox.x;
                    this.start.y = endPox.y;
                    this.allowApples(this.appleArr[i]);
                    this.winNum++;
                    console.log(this.winNum);
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault58 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.men = this.sp.getChildByName("men");
            this.hit = this.sp.getChildByName("hit");
            this.hit.visible = false;
            for (let i = 0; i < 2; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                this.dragArr.push(drag);
            }
        }
        dragEnd(pos, item) {
            let hitBounds = this.hit.getBounds();
            if (item.node.name == "drag_0") {
                let dragBounds = this.dragArr[0].getBounds();
                if (hitBounds.intersects(dragBounds)) {
                    this.showClickTip(1, pos);
                    item.reset();
                }
                else {
                    this.winNum++;
                    item.hide();
                }
            }
            else {
                let dragBounds = this.dragArr[1].getBounds();
                if (hitBounds.intersects(dragBounds)) {
                    this.showClickTip(1, pos);
                    item.reset();
                }
                else {
                    this.winNum++;
                    item.hide();
                }
            }
            if (this.winNum == 2) {
                this.onWin();
            }
        }
        onWin() {
            this.men.skin = "sub/level_fault_58/men_1.png";
            this.men.pos(386.5, 521.5);
            Laya.Tween.to(this.men, { scaleX: 1, scaleY: 1 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.men, { scaleX: 0.7, scaleY: 0.7 }, 200);
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault59 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.answer = this.sp.getChildByName("answer");
            this.answer.on(Laya.Event.CLICK, this, this.onClickAnswer);
            for (let i = 0; i < 6; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag);
                drag.on(Laya.Event.CLICK, this, this.onClickDrag);
                this.dragArr.push(drag);
            }
        }
        onClickDrag(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        onClickAnswer(e) {
            this.self.mouseEnabled = false;
            this.showCorrect(e.stageX, e.stageY);
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault6 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.watchTV_0 = this.sp.getChildByName("watchTV_0");
            this.watchTV_1 = this.sp.getChildByName("watchTV_1");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.startHit = this.sp.getChildByName("startHit");
            this.endHit = this.sp.getChildByName("endHit");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.watchTV_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isEnd = false;
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            if (!this.isStart || !this.isRange || !this.isEnd) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.watchTV_0, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.onWin));
                Laya.Tween.to(this.watchTV_1, { alpha: 1 }, 500);
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault60 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
            this.isWin = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnReduce = this.sp.getChildByName("btnReduce");
            this.btnCorrect = this.sp.getChildByName("btnCorrect");
            this.btnClear = this.sp.getChildByName("btnClear");
            this.showCount = this.sp.getChildByName("showCount");
            this.img_0 = this.sp.getChildByName("img_0");
            this.img_1 = this.sp.getChildByName("img_1");
            this.btnAdd.on(Laya.Event.CLICK, this, this.onClickBtnAdd);
            this.btnReduce.on(Laya.Event.CLICK, this, this.onClickBtnReduce);
            this.btnClear.on(Laya.Event.CLICK, this, this.onClickBtnClear);
            this.btnCorrect.on(Laya.Event.CLICK, this, this.onClickBtnCorrect);
        }
        onClickBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCountNum();
        }
        onClickBtnReduce() {
            this.playBtnAnim(this.btnReduce);
            if (this.count > 0) {
                this.count--;
                this.showCountNum();
            }
        }
        onClickBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCountNum();
        }
        onClickBtnCorrect() {
            this.playBtnAnim(this.btnCorrect);
            let pos = this.sp.localToGlobal(new Laya.Point(this.showCount.x, this.showCount.y));
            if (this.count === 9) {
                if (!this.isWin) {
                    this.isWin = true;
                    this.playWinAnim();
                    this.showClickTip(0, pos);
                }
                return;
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        showCountNum() {
            this.showCount.text = this.count.toString();
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 0.8, scaleY: 0.8 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(btn, { scaleX: 0.7, scaleY: 0.7 }, 100);
            }));
        }
        playWinAnim() {
            Laya.Tween.to(this.img_0, { y: this.img_0.y + 100 }, 500, Laya.Ease.backInOut);
            Laya.Tween.to(this.img_1, { y: this.img_0.y - 100 }, 500, Laya.Ease.backInOut);
            Laya.timer.once(1500, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault61 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.pit = this.sp.getChildByName("pit");
            this.mound = this.sp.getChildByName("mound");
            this.drag_chan = this.sp.getChildByName("drag_chan");
            this.guTou = this.sp.getChildByName("guTou");
            this.dog = this.sp.getChildByName("dog");
            this.girl = this.sp.getChildByName("girl");
            this.sound_0 = this.sp.getChildByName("sound_0");
            this.sound_1 = this.sp.getChildByName("sound_1");
            DragUtil.create(this.drag_chan).setDragEndCallback(this.dragEndChan.bind(this));
            this.sound_0.visible = false;
            this.sound_1.visible = false;
            this.pit.visible = false;
            this.guTou.visible = false;
            this.playSoundAnim();
        }
        playSoundAnim() {
            Laya.timer.loop(1200, this, () => {
                this.sound_0.visible = true;
                this.sound_1.visible = true;
                this.sound_0.pos(449, 806.5);
                this.sound_1.pos(456, 870);
                Laya.Tween.to(this.sound_0, { x: 565, y: 766 }, 900, null, Laya.Handler.create(this, () => {
                    this.sound_0.visible = false;
                }));
                Laya.Tween.to(this.sound_1, { x: 521.5, y: 899 }, 700, null, Laya.Handler.create(this, () => {
                    this.sound_1.visible = false;
                }));
            });
        }
        dragEndChan(pos, item) {
            let moundBounds = this.mound.getBounds();
            let chanBounds = this.drag_chan.getBounds();
            if (moundBounds.intersects(chanBounds)) {
                item.hide();
                this.playShowGutouAnim();
            }
        }
        playShowGutouAnim() {
            this.mound.visible = false;
            this.pit.visible = true;
            this.guTou.pos(201, 595.5);
            this.guTou.visible = true;
            Laya.Tween.to(this.guTou, { x: 275, y: 551, rotation: 720 }, 200, null, Laya.Handler.create(this, () => {
                this.guTou.rotation = 0;
                Laya.Tween.to(this.guTou, { x: 396, y: 607, rotation: 810 }, 200);
            }));
            Laya.timer.once(400, this, () => {
                DragUtil.create(this.guTou).setDragEndCallback(this.dragEndGuTou.bind(this));
            });
        }
        dragEndGuTou(pos, item) {
            let dogBounds = this.dog.getBounds();
            let guTouBounds = this.guTou.getBounds();
            if (dogBounds.intersects(guTouBounds)) {
                item.hide();
                this.playWinAnim();
            }
        }
        playWinAnim() {
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.sound_0.visible = false;
            this.sound_1.visible = false;
            this.dog.pos(358, 812);
            this.dog.skin = "sub/level_fault_61/dog_1.png";
            this.girl.skin = "sub/level_fault_61/girl_1.png";
            this.showCorrect();
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault62 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.startY = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.box = this.sp.getChildByName("box");
            for (let i = 0; i < 3; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                this.dragArr.push(drag);
            }
            this.box.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownBox);
        }
        dragEnd(pos, item) {
            this.showClickTip(1, pos);
            item.reset();
        }
        onMouseDownBox(e) {
            this.startY = e.stageY;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpStage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpStage);
        }
        onMouseMoveStage(e) {
            let Y = e.stageY;
            if ((Y - this.startY) > 250) {
                Laya.stage.offAllCaller(this);
                this.box.offAllCaller(this);
                this.box.skin = "sub/level_fault_62/box_1.png";
                this.box.pos(471, 447);
                this.showCorrect(e.stageX, e.stageY);
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
        onMouseUpStage() {
            Laya.stage.offAllCaller(this);
        }
    }

    class LevelFault63 extends LevelBase {
        constructor() {
            super(...arguments);
            this.isHit = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.box = this.sp.getChildByName("box");
            this.rabbit = this.sp.getChildByName("rabbit");
            this.drag = this.sp.getChildByName("drag");
            this.hit = this.sp.getChildByName("hit");
            this.hit.visible = false;
            DragUtil.create(this.drag).setDragEndCallback(this.dragEnd.bind(this));
            this.box.on(Laya.Event.CLICK, this, this.onClickBox);
            this.rabbit.on(Laya.Event.CLICK, this, this.onClickRabbit);
        }
        dragEnd(pos, item) {
            let hitBounds = this.hit.getBounds();
            let dragBounds = this.drag.getBounds();
            if (hitBounds.intersects(dragBounds)) {
                this.isHit = true;
            }
            else {
                this.isHit = false;
            }
        }
        onClickBox(e) {
            this.box.offAllCaller(this);
            this.box.skin = "sub/level_fault_63/box_1.png";
            this.box.pos(812, 127);
            for (let i = 0; i < 10; i++) {
                Laya.timer.once(i * 200, this, () => {
                    Laya.Tween.to(this.rabbit, { x: this.rabbit.x + 70, y: this.rabbit.y - 50 }, 100);
                    Laya.timer.once(100, this, () => {
                        Laya.Tween.to(this.rabbit, { y: this.rabbit.y + 20 }, 100);
                    });
                });
            }
            Laya.timer.once(1800, this, () => {
                this.rabbit.visible = false;
                let pos = new Laya.Point(e.stageX, e.stageY);
                if (this.isHit) {
                    this.drag.skin = "sub/level_fault_63/trap_1.png";
                    this.drag.y += 31;
                    this.showClickTip(0, pos);
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                }
                else {
                    this.showClickTip(1);
                    Laya.timer.once(700, this, () => {
                        GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                    });
                }
            });
        }
        onClickRabbit(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
    }

    class LevelFault65 extends LevelBase {
        constructor() {
            super(...arguments);
            this.boxArr = [];
            this.keyArr = [];
            this.openedBox = [];
            this.bgArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hammer = this.sp.getChildByName("hammer");
            for (let i = 0; i < 3; i++) {
                if (i < 2) {
                    let key = this.sp.getChildByName(`key_${i}`);
                    DragUtil.create(key).setDragEndCallback(this.dragEnd.bind(this));
                    this.keyArr.push(key);
                }
                let bg = this.sp.getChildByName(`bg_${i}`);
                Laya.Tween.to(bg, { rotation: -360 }, 5000);
                Laya.timer.loop(5000, this, () => {
                    bg.rotation = 0;
                    Laya.Tween.to(bg, { rotation: -360 }, 5000);
                });
                this.bgArr.push(bg);
                let box = this.sp.getChildByName(`box_${i}`);
                this.boxArr.push(box);
            }
            DragUtil.create(this.hammer).setDragEndCallback(this.dragEnd.bind(this));
        }
        dragEnd(pos, item) {
            let isHit = false;
            item.node.rotation = 0;
            for (let i = 0; i < this.boxArr.length; i++) {
                if (this.boxArr[i].hitTestPoint(pos.x, pos.y) && !this.openedBox.includes(this.boxArr[i])) {
                    if (item.node.name !== "hammer") {
                        this.onWin();
                        this.openedBox.push(this.boxArr[i]);
                        isHit = true;
                        if (i == 0) {
                            Laya.Tween.to(item.node, { x: 203, y: 318, rotation: 49 }, 500);
                            Laya.timer.once(500, this, () => {
                                Laya.Tween.to(item.node, { x: 261 }, 500);
                                Laya.timer.once(500, this, () => {
                                    Laya.SoundManager.playSound("sub/level_fault_65/openBoxSound.mp3", 1);
                                    this.boxArr[i].skin = "sub/level_fault_65/openBox.png";
                                    this.bgArr[i].visible = true;
                                    this.boxArr[i].pos(236, 126);
                                });
                            });
                        }
                        else if (i == 1) {
                            Laya.Tween.to(item.node, { x: 30, y: 614, rotation: 49 }, 500);
                            Laya.timer.once(500, this, () => {
                                Laya.Tween.to(item.node, { x: 60 }, 500);
                                Laya.timer.once(500, this, () => {
                                    Laya.SoundManager.playSound("sub/level_fault_65/openBoxSound.mp3", 1);
                                    this.boxArr[i].skin = "sub/level_fault_65/openBox.png";
                                    this.bgArr[i].visible = true;
                                    this.boxArr[i].pos(38, 422);
                                });
                            });
                        }
                        else {
                            Laya.Tween.to(item.node, { x: 425, y: 612, rotation: 49 }, 500);
                            Laya.timer.once(500, this, () => {
                                Laya.Tween.to(item.node, { x: 465 }, 500);
                                Laya.timer.once(500, this, () => {
                                    Laya.SoundManager.playSound("sub/level_fault_65/openBoxSound.mp3", 1);
                                    this.boxArr[i].skin = "sub/level_fault_65/openBox.png";
                                    this.bgArr[i].visible = true;
                                    this.boxArr[i].pos(441, 416);
                                });
                            });
                        }
                    }
                    else {
                        this.showClickTip(1, pos);
                    }
                }
            }
            if (!isHit) {
                item.reset();
            }
        }
        onWin() {
            this.winNum++;
            if (this.winNum == 3) {
                Laya.timer.once(1000, this, () => {
                    this.self.mouseEnabled = false;
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault66 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.showCount = this.sp.getChildByName("showCount");
            this.showCount.text = String(this.count);
            this.btnClear = this.sp.getChildByName("btnClear");
            this.btnMinus = this.sp.getChildByName("btnMinus");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnClear.on(Laya.Event.CLICK, this, this.onBtnClear);
            this.btnConfirm.on(Laya.Event.CLICK, this, this.onBtnConfirm);
            this.btnAdd.on(Laya.Event.CLICK, this, this.onBtnAdd);
            this.btnMinus.on(Laya.Event.CLICK, this, this.onBtnMinus);
        }
        onBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCount.text = String(this.count);
        }
        onBtnConfirm() {
            this.playBtnAnim(this.btnConfirm);
            if (this.count === 12) {
                this.showCorrect();
                this.onWin();
            }
            else {
                this.showClickTip(1);
            }
        }
        onBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCount.text = String(this.count);
        }
        onBtnMinus() {
            this.playBtnAnim(this.btnMinus);
            if (this.count > 0) {
                this.count--;
            }
            this.showCount.text = String(this.count);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
    }

    class LevelFault67 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.hitList = [0, 0, 0, 0];
            this.hit1AnswerList = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hit = this.sp.getChildByName("hit");
            for (let i = 0; i < 4; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                DragUtil.create(drag).setDragMouseDownCallback(this.dragMouseDown.bind(this));
                this.dragArr.push(drag);
                let hitAnswer = this.sp.getChildByName(`hit_${i}`);
                this.hit1AnswerList.push(hitAnswer);
            }
        }
        dragEnd(pos, item) {
            let regex = /_(.*)$/;
            let index = item.node.name.match(regex);
            let intIndex = parseInt(index[1]);
            if (!this.hit.hitTestPoint(pos.x, pos.y)) {
                this.hitList[intIndex] = 0;
                item.reset();
                item.node.skin = `sub/level_fault_67/smallDrag_${intIndex}.png`;
                return;
            }
            let hitCount = false;
            if (this.hit1AnswerList[intIndex].hitTestPoint(pos.x, pos.y)) {
                hitCount = true;
            }
            if (hitCount) {
                this.hitList[intIndex] = 1;
                this.onWin();
            }
            else {
                this.hitList[intIndex] = 0;
            }
        }
        dragMouseDown(pos, item) {
            let regex = /_(.*)$/;
            let index = item.node.name.match(regex);
            let intIndex = parseInt(index[1]);
            console.log(intIndex);
            item.node.skin = `sub/level_fault_67/bigDrag_${intIndex}.png`;
        }
        playWinTween() {
            let posArr = [[122, 172], [123, 232], [378, 173], [345, 209]];
            for (let i = 0; i < this.dragArr.length; i++) {
                Laya.Tween.to(this.dragArr[i], { x: posArr[i][0], y: posArr[i][1] }, 1000, Laya.Ease.bounceOut);
            }
        }
        onWin() {
            let isWin = 0;
            for (const key in this.hitList) {
                if (this.hitList[key] == 1) {
                    isWin++;
                }
            }
            if (isWin === 4) {
                this.playWinTween();
                this.self.mouseEnabled = false;
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault68 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnMinus = this.sp.getChildByName("btnMinus");
            this.showCount = this.sp.getChildByName("showCount");
            this.btnClear = this.sp.getChildByName("btnClear");
            this.showCount.text = String(this.count);
            this.btnConfirm.on(Laya.Event.CLICK, this, this.onBtnConfirm);
            this.btnAdd.on(Laya.Event.CLICK, this, this.onBtnAdd);
            this.btnMinus.on(Laya.Event.CLICK, this, this.onBtnMinus);
            this.btnClear.on(Laya.Event.CLICK, this, this.onBtnClear);
        }
        onBtnConfirm() {
            this.playBtnAnim(this.btnConfirm);
            if (this.count === 0) {
                this.showCorrect();
                this.onWin();
            }
            else {
                this.showClickTip(1);
            }
        }
        onBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCount.text = String(this.count);
        }
        onBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCount.text = String(this.count);
        }
        onBtnMinus() {
            this.playBtnAnim(this.btnMinus);
            if (this.count > 0) {
                this.count--;
            }
            this.showCount.text = String(this.count);
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault69 extends LevelBase {
        constructor() {
            super(...arguments);
            this.btnList = [];
            this.winImgArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 6; i++) {
                let btn = this.sp.getChildByName(`btn_${i}`);
                btn.on(Laya.Event.CLICK, this, this.onBtn, [i, btn]);
                this.btnList.push(btn);
                if (i < 2) {
                    let winImg = this.sp.getChildByName(`winImg_${i}`);
                    winImg.visible = false;
                    this.winImgArr.push(winImg);
                }
            }
        }
        onBtn(i, item, e) {
            if (i !== 4) {
                let pos = new Laya.Point(e.stageX, e.stageY);
                this.showClickTip(1, pos);
            }
            else {
                this.onWin();
            }
            Laya.Tween.to(item, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(item, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
        onWin() {
            for (let i = 0; i < this.winImgArr.length; i++) {
                Laya.timer.once(250, this, () => {
                    this.winImgArr[i].visible = true;
                    Laya.timer.once(250, this, () => {
                        this.winImgArr[i].visible = false;
                        Laya.timer.once(250, this, () => {
                            this.winImgArr[i].visible = true;
                            Laya.timer.once(250, this, () => {
                                this.winImgArr[i].visible = false;
                                Laya.timer.once(250, this, () => {
                                    this.winImgArr[i].visible = true;
                                    this.showCorrect();
                                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                                });
                            });
                        });
                    });
                });
            }
        }
    }

    class LevelFault7 extends LevelBase {
        constructor() {
            super(...arguments);
            this.oldPos = [];
            this.isStart = false;
            this.isRange = true;
            this.isEnd = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.monsters_0 = this.sp.getChildByName("monsters_0");
            this.monsters_1 = this.sp.getChildByName("monsters_1");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.startHit = this.sp.getChildByName("startHit");
            this.endHit = this.sp.getChildByName("endHit");
            this.range = this.sp.getChildByName("range");
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.monsters_1.alpha = 0;
        }
        onMouseDownSelf(e) {
            this.isRange = true;
            this.isEnd = false;
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            let spPos = new Laya.Point(e.stageX, e.stageY);
            this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(this.startPos);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.line) {
                this.line.graphics.clear();
            }
            if (!(this.range.hitTestPoint(e.stageX, e.stageY))) {
                this.isRange = false;
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#000", 13);
            let spPos = new Laya.Point(e.stageX, e.stageY);
            let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
            this.oldPos.push(endPox);
            this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#000", 13);
            this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#000", 13);
            this.startPos.x = endPox.x;
            this.startPos.y = endPox.y;
        }
        onMouseUpSelf(e) {
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            if (this.startHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isStart = true;
            }
            else if (this.endHit.hitTestPoint(e.stageX, e.stageY)) {
                this.isEnd = true;
            }
            if (!this.isStart || !this.isRange || !this.isEnd) {
                this.showClickTip(1);
            }
            else {
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                Laya.Tween.to(this.monsters_0, { alpha: 0 }, 500, null, Laya.Handler.create(this, this.onWin));
                Laya.Tween.to(this.monsters_1, { alpha: 1 }, 500);
            }
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault70 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnMinus = this.sp.getChildByName("btnMinus");
            this.showCount = this.sp.getChildByName("showCount");
            this.btnClear = this.sp.getChildByName("btnClear");
            this.showCount.text = String(this.count);
            this.btnConfirm.on(Laya.Event.CLICK, this, this.onBtnConfirm);
            this.btnAdd.on(Laya.Event.CLICK, this, this.onBtnAdd);
            this.btnMinus.on(Laya.Event.CLICK, this, this.onBtnMinus);
            this.btnClear.on(Laya.Event.CLICK, this, this.onBtnClear);
        }
        onBtnConfirm() {
            this.playBtnAnim(this.btnConfirm);
            if (this.count === 1) {
                this.sp.getChildByName("showImg").visible = true;
                Laya.timer.once(1000, this, () => {
                    this.showCorrect();
                    this.onWin();
                });
            }
            else {
                this.showClickTip(1);
            }
        }
        onBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCount.text = String(this.count);
        }
        onBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCount.text = String(this.count);
        }
        onBtnMinus() {
            this.playBtnAnim(this.btnMinus);
            if (this.count > 0) {
                this.count--;
            }
            this.showCount.text = String(this.count);
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault71 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hit_0 = UIUtils.getChildByPath(this.sp, "drag_3/hit_0");
            this.hit_1 = UIUtils.getChildByPath(this.sp, "drag_1/hit_1");
            for (let i = 0; i < 5; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                this.dragArr.push(drag);
            }
        }
        dragEnd(pos, item) {
            if (item.node.name == "drag_1" && this.hit_0.hitTestPoint(pos.x, pos.y)) {
                console.log("三角形在正方形上方");
                this.self.mouseEnabled = false;
                this.playAnim(0);
            }
            else if (item.node.name == "drag_3" && this.hit_1.hitTestPoint(pos.x, pos.y)) {
                console.log("正方形在三角形下方");
                this.self.mouseEnabled = false;
                this.playAnim(1);
            }
        }
        playAnim(i) {
            let squarePos = new Laya.Point(this.dragArr[3].x, this.dragArr[3].y);
            let trianglePos = new Laya.Point(this.dragArr[1].x, this.dragArr[1].y);
            if (i == 0) {
                let pos = new Laya.Point(squarePos.x + 1, squarePos.y - 180);
                Laya.Tween.to(this.dragArr[1], { x: pos.x, y: pos.y }, 300);
            }
            else {
                let pos = new Laya.Point(trianglePos.x - 1, trianglePos.y + 180);
                Laya.Tween.to(this.dragArr[3], { x: pos.x, y: pos.y }, 300);
            }
            Laya.timer.once(500, this, () => {
                this.showCorrect();
                this.onWin();
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault75 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.hitArr = [];
            this.allHit = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.bg = this.sp.getChildByName("bg");
            for (let i = 0; i < 6; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragMouseDownCallback(this.onMouseDownDrag.bind(this));
                DragUtil.create(drag).setDragEndCallback(this.onDragEnd.bind(this));
                this.dragArr.push(drag);
                let hit = this.sp.getChildByName(`hit_${i}`);
                this.hitArr.push(hit);
                this.allHit.push(false);
            }
        }
        onMouseDownDrag(pos, self) {
            self.node.scale(1, 1);
        }
        onDragEnd(pos, self) {
            let regex = /_(.*)$/;
            let index = self.node.name.match(regex);
            let intIndex = parseInt(index[1]);
            if (!this.bg.hitTestPoint(pos.x, pos.y)) {
                this.allHit[intIndex] = false;
                self.node.scale(0.5, 0.5);
                self.reset();
            }
            else if (this.hitArr[intIndex].hitTestPoint(pos.x, pos.y)) {
                this.allHit[intIndex] = true;
                this.allIsHit();
                console.log("成功一个", intIndex, this.allHit[intIndex]);
            }
        }
        allIsHit() {
            let num = 0;
            for (let i = 0; i < this.allHit.length; i++) {
                if (!this.allHit[i]) {
                    return;
                }
                else {
                    num++;
                }
            }
            console.log(num);
            if (num == 6) {
                this.onWin();
            }
        }
        onWin() {
            this.self.mouseEnabled = false;
            let posArr = [[312.5, 189], [466, 212], [448.5, 317.5], [279, 288], [242, 370], [548, 342]];
            for (let i = 0; i < this.dragArr.length; i++) {
                Laya.Tween.to(this.dragArr[i], { x: posArr[i][0], y: posArr[i][1] }, 500, null, Laya.Handler.create(this, () => {
                    this.showCorrect();
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                }));
            }
        }
    }

    class LevelFault8 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 5; i++) {
                DragUtil.create(UIUtils.getChildByPath(this.sp, `gezi/m${i}`)).setDragEndCallback(this.mDragEnd.bind(this));
            }
            DragUtil.create(UIUtils.getChildByPath(this.sp, `gezi/m5`)).setDragEndCallback(this.m5DragEnd.bind(this));
            UIUtils.getChildByPath(this.sp, 'gezi/winM').visible = false;
        }
        mDragEnd(pos, item) {
            item.reset();
            this.showClickTip(1, pos);
        }
        m5DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "gezi/m3").hitTestPoint(pos.x, pos.y)) {
                UIUtils.getChildByPath(this.sp, 'gezi/winM').visible = true;
                item.hide();
                this.onWin();
                this.showCorrect(375, 1062);
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault81 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
            this.numArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnMinus = this.sp.getChildByName("btnMinus");
            this.showCount = this.sp.getChildByName("showCount");
            this.btnClear = this.sp.getChildByName("btnClear");
            let numList = this.sp.getChildByName("numList");
            numList.visible = false;
            for (let i = 0; i < 7; i++) {
                let num = numList.getChildByName(`num_${i}`);
                num.visible = false;
                this.numArr.push(num);
            }
            this.showCount.text = String(this.count);
            this.btnConfirm.on(Laya.Event.CLICK, this, this.onBtnConfirm);
            this.btnAdd.on(Laya.Event.CLICK, this, this.onBtnAdd);
            this.btnMinus.on(Laya.Event.CLICK, this, this.onBtnMinus);
            this.btnClear.on(Laya.Event.CLICK, this, this.onBtnClear);
        }
        onBtnConfirm() {
            this.playBtnAnim(this.btnConfirm);
            if (this.count === 7) {
                this.onWin();
            }
            else {
                this.showClickTip(1);
            }
        }
        onBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCount.text = String(this.count);
        }
        onBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCount.text = String(this.count);
        }
        onBtnMinus() {
            this.playBtnAnim(this.btnMinus);
            if (this.count > 0) {
                this.count--;
            }
            this.showCount.text = String(this.count);
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
        onWin() {
            this.self.mouseEnabled = false;
            this.sp.getChildByName("numList").visible = true;
            for (let i = 0; i < this.numArr.length; i++) {
                Laya.timer.once(500 * i, this, () => {
                    this.numArr[i].visible = true;
                });
            }
            Laya.timer.once(5000, this, () => {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault82 extends LevelBase {
        constructor() {
            super(...arguments);
            this.count = 0;
            this.dragArr = [];
            this.numArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnAdd = this.sp.getChildByName("btnAdd");
            this.btnConfirm = this.sp.getChildByName("btnConfirm");
            this.btnMinus = this.sp.getChildByName("btnMinus");
            this.showCount = this.sp.getChildByName("showCount");
            this.btnClear = this.sp.getChildByName("btnClear");
            for (let i = 0; i < 10; i++) {
                let drag = UIUtils.getChildByPath(this.sp, `dragList/d_${i}`);
                let num = UIUtils.getChildByPath(this.sp, `numList/num_${i}`);
                num.visible = false;
                this.dragArr.push(drag);
                this.numArr.push(num);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
            }
            this.showCount.text = String(this.count);
            this.btnConfirm.on(Laya.Event.CLICK, this, this.onBtnConfirm);
            this.btnAdd.on(Laya.Event.CLICK, this, this.onBtnAdd);
            this.btnMinus.on(Laya.Event.CLICK, this, this.onBtnMinus);
            this.btnClear.on(Laya.Event.CLICK, this, this.onBtnClear);
        }
        dragEnd(pos, item) {
        }
        onBtnConfirm() {
            this.playBtnAnim(this.btnConfirm);
            if (this.count === 10) {
                this.onWin();
            }
            else {
                this.showClickTip(1);
            }
        }
        onBtnClear() {
            this.playBtnAnim(this.btnClear);
            this.count = 0;
            this.showCount.text = String(this.count);
        }
        onBtnAdd() {
            this.playBtnAnim(this.btnAdd);
            this.count++;
            this.showCount.text = String(this.count);
        }
        onBtnMinus() {
            this.playBtnAnim(this.btnMinus);
            if (this.count > 0) {
                this.count--;
            }
            this.showCount.text = String(this.count);
        }
        playBtnAnim(btn) {
            Laya.Tween.to(btn, { scaleX: 1.2, scaleY: 1.2 }, 50);
            Laya.timer.once(50, this, () => {
                Laya.Tween.to(btn, { scaleX: 1, scaleY: 1 }, 50);
            });
        }
        onWin() {
            this.self.mouseEnabled = false;
            let posArr = [[0, 115], [151, 109], [286, 109], [429, 115], [540, 119], [4, 351], [169, 359], [277, 351], [429, 366], [569, 359]];
            for (let i = 0; i < this.dragArr.length; i++) {
                Laya.timer.once(150 * i, this, () => {
                    this.numArr[i].visible = true;
                    Laya.Tween.to(this.dragArr[i], { x: posArr[i][0], y: posArr[i][1] }, 150);
                });
            }
            Laya.timer.once(3000, this, () => {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault83 extends LevelBase {
        constructor() {
            super(...arguments);
            this.imgPos = "left";
            this.leftArr = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.leftImgArr = [];
            this.rightArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
            this.rightImgArr = [];
            this.round_img_arr = [];
            this.roundArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img = this.sp.getChildByName("img");
            this.btnUp = this.sp.getChildByName("btnUp");
            this.btnDown = this.sp.getChildByName("btnDown");
            this.box_left = this.sp.getChildByName("box_left");
            this.box_right = this.sp.getChildByName("box_right");
            this.btnUp.on(Laya.Event.CLICK, this, this.onBtnUp);
            this.btnDown.on(Laya.Event.CLICK, this, this.onBtnDown);
            this.img.on(Laya.Event.CLICK, this, this.onClickImg);
            for (let i = 0; i < 12; i++) {
                if (i < 3) {
                    let round_img = this.img.getChildByName(`round_${i}`);
                    this.round_img_arr.push(round_img);
                    if (this.imgPos === 'left') {
                        this.roundArr[i] = this.leftArr[i];
                    }
                    else {
                        this.roundArr[i] = this.rightArr[i];
                    }
                }
                let round_left = this.box_left.getChildByName(`left_${i}`);
                let round_right = this.box_right.getChildByName(`right_${i}`);
                if (this.rightArr[i] === 0) {
                    round_right.skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    round_right.skin = "sub/level_fault_83/round_1.png";
                }
                if (this.leftArr[i] === 0) {
                    round_left.skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    round_left.skin = "sub/level_fault_83/round_1.png";
                }
                this.leftImgArr.push(round_left);
                this.rightImgArr.push(round_right);
            }
            this.initHideRound();
            this.roundImgSkin();
        }
        onClickImg() {
            let leftPos = [164, 271];
            let rightPos = [303, 271];
            this.img.off(Laya.Event.CLICK, this, this.onClickImg);
            this.hideRound();
            if (this.imgPos === "left") {
                this.imgPos = "right";
                Laya.Tween.to(this.img, { x: rightPos[0], y: rightPos[1] }, 300);
                for (let i = 0; i < this.roundArr.length; i++) {
                    this.rightArr[i] = this.roundArr[i];
                    if (this.rightArr[i] == 0) {
                        this.rightImgArr[i].skin = "sub/level_fault_83/round_0.png";
                    }
                    else {
                        this.rightImgArr[i].skin = "sub/level_fault_83/round_1.png";
                    }
                }
            }
            else {
                this.imgPos = "left";
                Laya.Tween.to(this.img, { x: leftPos[0], y: leftPos[1] }, 300);
                for (let i = 0; i < this.roundArr.length; i++) {
                    this.leftArr[i] = this.roundArr[i];
                    if (this.leftArr[i] == 0) {
                        this.leftImgArr[i].skin = "sub/level_fault_83/round_0.png";
                    }
                    else {
                        this.leftImgArr[i].skin = "sub/level_fault_83/round_1.png";
                    }
                }
            }
            Laya.timer.once(300, this, () => {
                this.img.on(Laya.Event.CLICK, this, this.onClickImg);
                Laya.timer.once(50, this, this.showRound);
                this.isWin();
            });
        }
        onBtnUp() {
            this.hideImgRound();
            Laya.Tween.to(this.btnUp, { scaleX: 1.25, scaleY: 1.25 }, 50, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.btnUp, { scaleX: 1, scaleY: 1 }, 50);
            }));
            if (this.imgPos === "left") {
                for (let i = 0; i < this.leftImgArr.length; i++) {
                    if (i == 0) {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[this.leftImgArr.length - 1].x, y: this.leftImgArr[this.leftImgArr.length - 1].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[i - 1].x, y: this.leftImgArr[i - 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = 0; i < this.leftImgArr.length; i++) {
                        if (i == 0) {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i + 1];
                            this.leftArr[i] = this.leftArr[i + 1];
                            endIndex = this.leftImgArr[this.leftImgArr.length - 1];
                            endIndex_number = this.leftArr[this.leftImgArr.length - 1];
                            this.leftImgArr[this.leftImgArr.length - 1] = index;
                            this.leftArr[this.leftArr.length - 1] = index_number;
                        }
                        else if (i == this.leftImgArr.length - 2) {
                            this.leftImgArr[this.leftImgArr.length - 2] = endIndex;
                            this.leftArr[this.leftArr.length - 2] = endIndex_number;
                        }
                        else if (i == this.leftImgArr.length - 1) {
                            continue;
                        }
                        else {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i + 1];
                            this.leftArr[i] = this.leftArr[i + 1];
                            this.leftImgArr[i - 1] = index;
                            this.leftArr[i - 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
            else {
                for (let i = 0; i < this.rightImgArr.length; i++) {
                    if (i == 0) {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[this.rightImgArr.length - 1].x, y: this.rightImgArr[this.rightImgArr.length - 1].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[i - 1].x, y: this.rightImgArr[i - 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = 0; i < this.rightImgArr.length; i++) {
                        if (i == 0) {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i + 1];
                            this.rightArr[i] = this.rightArr[i + 1];
                            endIndex = this.rightImgArr[this.rightImgArr.length - 1];
                            endIndex_number = this.rightArr[this.rightImgArr.length - 1];
                            this.rightImgArr[this.rightImgArr.length - 1] = index;
                            this.rightArr[this.rightArr.length - 1] = index_number;
                        }
                        else if (i == this.rightImgArr.length - 2) {
                            this.rightImgArr[this.rightImgArr.length - 2] = endIndex;
                            this.rightArr[this.rightArr.length - 2] = endIndex_number;
                        }
                        else if (i == this.rightImgArr.length - 1) {
                            continue;
                        }
                        else {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i + 1];
                            this.rightArr[i] = this.rightArr[i + 1];
                            this.rightImgArr[i - 1] = index;
                            this.rightArr[i - 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
        }
        onBtnDown() {
            this.hideImgRound();
            Laya.Tween.to(this.btnDown, { scaleX: 1.25, scaleY: 1.25 }, 50, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.btnDown, { scaleX: 1, scaleY: 1 }, 50);
            }));
            if (this.imgPos === "left") {
                for (let i = 0; i < this.leftImgArr.length; i++) {
                    if (i == this.leftImgArr.length - 1) {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[0].x, y: this.leftImgArr[0].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[i + 1].x, y: this.leftImgArr[i + 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = this.leftImgArr.length - 1; i >= 0; i--) {
                        if (i == this.leftImgArr.length - 1) {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i - 1];
                            this.leftArr[i] = this.leftArr[i - 1];
                            endIndex = this.leftImgArr[0];
                            endIndex_number = this.leftArr[0];
                            this.leftImgArr[0] = index;
                            this.leftArr[0] = index_number;
                        }
                        else if (i == 0) {
                            continue;
                        }
                        else if (i == 1) {
                            this.leftImgArr[1] = endIndex;
                            this.leftArr[1] = endIndex_number;
                        }
                        else {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i - 1];
                            this.leftArr[i] = this.leftArr[i - 1];
                            this.leftImgArr[i + 1] = index;
                            this.leftArr[i + 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
            else {
                for (let i = 0; i < this.rightImgArr.length; i++) {
                    if (i == this.rightImgArr.length - 1) {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[0].x, y: this.rightImgArr[0].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[i + 1].x, y: this.rightImgArr[i + 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = this.rightImgArr.length - 1; i >= 0; i--) {
                        if (i == this.rightImgArr.length - 1) {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i - 1];
                            this.rightArr[i] = this.rightArr[i - 1];
                            endIndex = this.rightImgArr[0];
                            endIndex_number = this.rightArr[0];
                            this.rightImgArr[0] = index;
                            this.rightArr[0] = index_number;
                        }
                        else if (i == 0) {
                            continue;
                        }
                        else if (i == 1) {
                            this.rightImgArr[1] = endIndex;
                            this.rightArr[1] = endIndex_number;
                        }
                        else {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i - 1];
                            this.rightArr[i] = this.rightArr[i - 1];
                            this.rightImgArr[i + 1] = index;
                            this.rightArr[i + 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
        }
        hideRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.leftImgArr[i].visible = false;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                }
            }
        }
        showRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.leftImgArr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = true;
                }
            }
        }
        initHideRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                    this.leftImgArr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                    this.rightImgArr[i].visible = true;
                }
            }
        }
        hideImgRound() {
            for (let i = 0; i < 3; i++) {
                this.round_img_arr[i].visible = false;
            }
        }
        showImgRound() {
            if (this.imgPos === 'left') {
                for (let i = 0; i < 3; i++) {
                    this.roundArr[i] = this.leftArr[i];
                    this.round_img_arr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.roundArr[i] = this.rightArr[i];
                    this.round_img_arr[i].visible = true;
                }
            }
            this.roundImgSkin();
        }
        roundImgSkin() {
            for (let i = 0; i < this.round_img_arr.length; i++) {
                if (this.roundArr[i] === 0) {
                    this.round_img_arr[i].skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    this.round_img_arr[i].skin = "sub/level_fault_83/round_1.png";
                }
            }
        }
        isWin() {
            let find = this.leftArr.find(num => num === 1);
            if (find == undefined) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault84 extends LevelBase {
        constructor() {
            super(...arguments);
            this.imgPos = "left";
            this.leftArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0];
            this.leftImgArr = [];
            this.rightArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
            this.rightImgArr = [];
            this.round_img_arr = [];
            this.roundArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.img = this.sp.getChildByName("img");
            this.btnUp = this.sp.getChildByName("btnUp");
            this.btnDown = this.sp.getChildByName("btnDown");
            this.box_left = this.sp.getChildByName("box_left");
            this.box_right = this.sp.getChildByName("box_right");
            this.btnUp.on(Laya.Event.CLICK, this, this.onBtnUp);
            this.btnDown.on(Laya.Event.CLICK, this, this.onBtnDown);
            this.img.on(Laya.Event.CLICK, this, this.onClickImg);
            for (let i = 0; i < 12; i++) {
                if (i < 3) {
                    let round_img = this.img.getChildByName(`round_${i}`);
                    this.round_img_arr.push(round_img);
                    if (this.imgPos === 'left') {
                        this.roundArr[i] = this.leftArr[i];
                    }
                    else {
                        this.roundArr[i] = this.rightArr[i];
                    }
                }
                let round_left = this.box_left.getChildByName(`left_${i}`);
                let round_right = this.box_right.getChildByName(`right_${i}`);
                if (this.rightArr[i] === 0) {
                    round_right.skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    round_right.skin = "sub/level_fault_83/round_1.png";
                }
                if (this.leftArr[i] === 0) {
                    round_left.skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    round_left.skin = "sub/level_fault_83/round_1.png";
                }
                this.leftImgArr.push(round_left);
                this.rightImgArr.push(round_right);
            }
            this.initHideRound();
            this.roundImgSkin();
        }
        onClickImg() {
            let leftPos = [164, 271];
            let rightPos = [303, 271];
            this.img.off(Laya.Event.CLICK, this, this.onClickImg);
            this.hideRound();
            if (this.imgPos === "left") {
                this.imgPos = "right";
                Laya.Tween.to(this.img, { x: rightPos[0], y: rightPos[1] }, 300);
                for (let i = 0; i < this.roundArr.length; i++) {
                    this.rightArr[i] = this.roundArr[i];
                    if (this.rightArr[i] == 0) {
                        this.rightImgArr[i].skin = "sub/level_fault_83/round_0.png";
                    }
                    else {
                        this.rightImgArr[i].skin = "sub/level_fault_83/round_1.png";
                    }
                }
            }
            else {
                this.imgPos = "left";
                Laya.Tween.to(this.img, { x: leftPos[0], y: leftPos[1] }, 300);
                for (let i = 0; i < this.roundArr.length; i++) {
                    this.leftArr[i] = this.roundArr[i];
                    if (this.leftArr[i] == 0) {
                        this.leftImgArr[i].skin = "sub/level_fault_83/round_0.png";
                    }
                    else {
                        this.leftImgArr[i].skin = "sub/level_fault_83/round_1.png";
                    }
                }
            }
            Laya.timer.once(300, this, () => {
                this.img.on(Laya.Event.CLICK, this, this.onClickImg);
                Laya.timer.once(50, this, this.showRound);
                this.isWin();
            });
        }
        onBtnUp() {
            this.hideImgRound();
            Laya.Tween.to(this.btnUp, { scaleX: 1.25, scaleY: 1.25 }, 50, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.btnUp, { scaleX: 1, scaleY: 1 }, 50);
            }));
            if (this.imgPos === "left") {
                for (let i = 0; i < this.leftImgArr.length; i++) {
                    if (i == 0) {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[this.leftImgArr.length - 1].x, y: this.leftImgArr[this.leftImgArr.length - 1].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[i - 1].x, y: this.leftImgArr[i - 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = 0; i < this.leftImgArr.length; i++) {
                        if (i == 0) {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i + 1];
                            this.leftArr[i] = this.leftArr[i + 1];
                            endIndex = this.leftImgArr[this.leftImgArr.length - 1];
                            endIndex_number = this.leftArr[this.leftImgArr.length - 1];
                            this.leftImgArr[this.leftImgArr.length - 1] = index;
                            this.leftArr[this.leftArr.length - 1] = index_number;
                        }
                        else if (i == this.leftImgArr.length - 2) {
                            this.leftImgArr[this.leftImgArr.length - 2] = endIndex;
                            this.leftArr[this.leftArr.length - 2] = endIndex_number;
                        }
                        else if (i == this.leftImgArr.length - 1) {
                            continue;
                        }
                        else {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i + 1];
                            this.leftArr[i] = this.leftArr[i + 1];
                            this.leftImgArr[i - 1] = index;
                            this.leftArr[i - 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
            else {
                for (let i = 0; i < this.rightImgArr.length; i++) {
                    if (i == 0) {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[this.rightImgArr.length - 1].x, y: this.rightImgArr[this.rightImgArr.length - 1].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[i - 1].x, y: this.rightImgArr[i - 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = 0; i < this.rightImgArr.length; i++) {
                        if (i == 0) {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i + 1];
                            this.rightArr[i] = this.rightArr[i + 1];
                            endIndex = this.rightImgArr[this.rightImgArr.length - 1];
                            endIndex_number = this.rightArr[this.rightImgArr.length - 1];
                            this.rightImgArr[this.rightImgArr.length - 1] = index;
                            this.rightArr[this.rightArr.length - 1] = index_number;
                        }
                        else if (i == this.rightImgArr.length - 2) {
                            this.rightImgArr[this.rightImgArr.length - 2] = endIndex;
                            this.rightArr[this.rightArr.length - 2] = endIndex_number;
                        }
                        else if (i == this.rightImgArr.length - 1) {
                            continue;
                        }
                        else {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i + 1];
                            this.rightArr[i] = this.rightArr[i + 1];
                            this.rightImgArr[i - 1] = index;
                            this.rightArr[i - 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
        }
        onBtnDown() {
            this.hideImgRound();
            Laya.Tween.to(this.btnDown, { scaleX: 1.25, scaleY: 1.25 }, 50, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.btnDown, { scaleX: 1, scaleY: 1 }, 50);
            }));
            if (this.imgPos === "left") {
                for (let i = 0; i < this.leftImgArr.length; i++) {
                    if (i == this.leftImgArr.length - 1) {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[0].x, y: this.leftImgArr[0].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.leftImgArr[i], { x: this.leftImgArr[i + 1].x, y: this.leftImgArr[i + 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = this.leftImgArr.length - 1; i >= 0; i--) {
                        if (i == this.leftImgArr.length - 1) {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i - 1];
                            this.leftArr[i] = this.leftArr[i - 1];
                            endIndex = this.leftImgArr[0];
                            endIndex_number = this.leftArr[0];
                            this.leftImgArr[0] = index;
                            this.leftArr[0] = index_number;
                        }
                        else if (i == 0) {
                            continue;
                        }
                        else if (i == 1) {
                            this.leftImgArr[1] = endIndex;
                            this.leftArr[1] = endIndex_number;
                        }
                        else {
                            index = this.leftImgArr[i];
                            index_number = this.leftArr[i];
                            this.leftImgArr[i] = this.leftImgArr[i - 1];
                            this.leftArr[i] = this.leftArr[i - 1];
                            this.leftImgArr[i + 1] = index;
                            this.leftArr[i + 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
            else {
                for (let i = 0; i < this.rightImgArr.length; i++) {
                    if (i == this.rightImgArr.length - 1) {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[0].x, y: this.rightImgArr[0].y }, 100);
                    }
                    else {
                        Laya.Tween.to(this.rightImgArr[i], { x: this.rightImgArr[i + 1].x, y: this.rightImgArr[i + 1].y }, 100);
                    }
                }
                let index;
                let endIndex;
                let index_number;
                let endIndex_number;
                Laya.timer.once(100, this, () => {
                    for (let i = this.rightImgArr.length - 1; i >= 0; i--) {
                        if (i == this.rightImgArr.length - 1) {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i - 1];
                            this.rightArr[i] = this.rightArr[i - 1];
                            endIndex = this.rightImgArr[0];
                            endIndex_number = this.rightArr[0];
                            this.rightImgArr[0] = index;
                            this.rightArr[0] = index_number;
                        }
                        else if (i == 0) {
                            continue;
                        }
                        else if (i == 1) {
                            this.rightImgArr[1] = endIndex;
                            this.rightArr[1] = endIndex_number;
                        }
                        else {
                            index = this.rightImgArr[i];
                            index_number = this.rightArr[i];
                            this.rightImgArr[i] = this.rightImgArr[i - 1];
                            this.rightArr[i] = this.rightArr[i - 1];
                            this.rightImgArr[i + 1] = index;
                            this.rightArr[i + 1] = index_number;
                        }
                    }
                    this.showImgRound();
                });
            }
        }
        hideRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.leftImgArr[i].visible = false;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                }
            }
        }
        showRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.leftImgArr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = true;
                }
            }
        }
        initHideRound() {
            if (this.imgPos === "left") {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                    this.leftImgArr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.rightImgArr[i].visible = false;
                    this.rightImgArr[i].visible = true;
                }
            }
        }
        hideImgRound() {
            for (let i = 0; i < 3; i++) {
                this.round_img_arr[i].visible = false;
            }
        }
        showImgRound() {
            if (this.imgPos === 'left') {
                for (let i = 0; i < 3; i++) {
                    this.roundArr[i] = this.leftArr[i];
                    this.round_img_arr[i].visible = true;
                }
            }
            else {
                for (let i = 0; i < 3; i++) {
                    this.roundArr[i] = this.rightArr[i];
                    this.round_img_arr[i].visible = true;
                }
            }
            this.roundImgSkin();
        }
        roundImgSkin() {
            for (let i = 0; i < this.round_img_arr.length; i++) {
                if (this.roundArr[i] === 0) {
                    this.round_img_arr[i].skin = "sub/level_fault_83/round_0.png";
                }
                else {
                    this.round_img_arr[i].skin = "sub/level_fault_83/round_1.png";
                }
            }
        }
        isWin() {
            let find = this.leftArr.find(num => num === 1);
            if (find == undefined) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class TimeUtil {
        constructor() {
        }
        static get UTC() {
            return Math.floor((new Date()).getTime() / 1000);
        }
        static getTime(time) {
            let timeStr = "";
            let second = time % 60;
            let minute = Math.floor(time / 60);
            if (minute >= 60) {
                time = Math.floor(minute / 60);
                timeStr += time > 9 ? time : "0" + time;
                timeStr = timeStr.concat(":");
                minute = minute % 60;
                timeStr += minute > 9 ? minute : "0" + minute;
                timeStr = timeStr.concat(":");
                timeStr += second > 9 ? second : "0" + second;
            }
            else {
                timeStr = timeStr.concat("00:");
                timeStr += minute > 9 ? minute : "0" + minute;
                timeStr = timeStr.concat(":");
                timeStr += second > 9 ? second : "0" + second;
            }
            return timeStr;
        }
        static getTime2(time) {
            let timeStr = "";
            let second = time % 60;
            let minute = Math.floor(time / 60);
            timeStr += minute > 9 ? minute : "0" + minute;
            timeStr = timeStr.concat(":");
            timeStr += second > 9 ? second : "0" + second;
            return timeStr;
        }
        static convertTime(time, format = "DD hh:mm:ss") {
            let d = Math.floor(time / 86400000);
            let hor = Math.floor(time % 86400000 / 3600000);
            let min = Math.floor(time % 86400000 % 3600000 / 60000);
            let sec = Math.floor(time % 86400000 % 3600000 % 60000 / 1000);
            let DD = d + "";
            if (DD == "0")
                DD = "";
            let hh = hor >= 10 ? "" + hor : "0" + hor;
            let mm = min >= 10 ? "" + min : "0" + min;
            let ss = sec >= 10 ? "" + sec : "0" + sec;
            format = format.replace("DD", DD);
            format = format.replace("hh", hh);
            format = format.replace("mm", mm);
            format = format.replace("ss", ss);
            return format;
        }
        static isSameDay(timeStamp1, timeStamp2) {
            let date1 = new Date(timeStamp1 * 1000);
            let date2 = new Date(timeStamp2 * 1000);
            let y1 = date1.getFullYear();
            let y2 = date2.getFullYear();
            let m1 = date1.getMonth();
            let m2 = date2.getMonth();
            let d1 = date1.getDate();
            let d2 = date2.getDate();
            if (y1 == y2 && m1 == m2 && d1 == d2) {
                return true;
            }
            return false;
        }
        static todayStart() {
            return new Date(new Date().toLocaleDateString()).getTime();
        }
        static todayEnd() {
            return new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1;
        }
    }

    class LevelFault85 extends LevelBase {
        constructor() {
            super(...arguments);
            this.ballArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.hit = this.sp.getChildByName("hit");
            this.hit.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownHit);
            for (let i = 0; i < 3; i++) {
                let ball = this.sp.getChildByName(`ball_${i}`);
                this.ballArr.push(ball);
            }
            this.playBallAnim();
        }
        onMouseDownHit() {
            if (this.newTimer) {
                this.newTimer.clearAll(this);
            }
            this.newTimer = new Laya.Timer();
            this.oldTime = TimeUtil.UTC;
            this.newTimer.loop(100, this, () => {
                this.timeCount();
            });
            this.hit.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpHit);
            this.hit.on(Laya.Event.MOUSE_UP, this, this.onMouseUpHit);
        }
        timeCount() {
            let newTime = TimeUtil.UTC;
            let timeMinusEnd = newTime - this.oldTime;
            if (timeMinusEnd > 2) {
                this.self.mouseEnabled = false;
                this.newTimer.clearAll(this);
                Laya.timer.clearAll(this);
                this.showCorrect();
                this.onWin();
            }
        }
        onMouseUpHit() {
            this.oldTime = 0;
            this.newTimer.clearAll(this);
            this.hit.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpHit);
            this.hit.off(Laya.Event.MOUSE_UP, this, this.onMouseUpHit);
        }
        playBallAnim() {
            Laya.Tween.to(this.ballArr[0], { rotation: 15 }, 500, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.ballArr[0], { rotation: 0 }, 300, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.ballArr[2], { rotation: -15 }, 500, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                        Laya.Tween.to(this.ballArr[2], { rotation: 0 }, 300, null, Laya.Handler.create(this, () => {
                        }));
                    }));
                }));
            }));
            Laya.timer.loop(1600, this, () => {
                Laya.Tween.to(this.ballArr[0], { rotation: 15 }, 500, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this.ballArr[0], { rotation: 0 }, 300, null, Laya.Handler.create(this, () => {
                        Laya.Tween.to(this.ballArr[2], { rotation: -15 }, 500, Laya.Ease.circOut, Laya.Handler.create(this, () => {
                            Laya.Tween.to(this.ballArr[2], { rotation: 0 }, 300, null, Laya.Handler.create(this, () => {
                            }));
                        }));
                    }));
                }));
            });
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault86 extends LevelBase {
        constructor() {
            super(...arguments);
            this.hitArr = [];
            this.ballArr = [];
            this.hit0Arr = [];
            this.hit1Arr = [];
            this.hit2Arr = [];
            this.hit3Arr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.ball = this.sp.getChildByName("ball");
            this.ballHit = this.sp.getChildByName("ballHit");
            this.ballHit.visible = false;
            for (let i = 0; i < 4; i++) {
                let hit = this.sp.getChildByName(`hit_${i}`);
                let ball = this.sp.getChildByName(`ball_${i}`);
                this.hitArr.push(hit);
                this.ballArr.push(ball);
                if (i < 3) {
                    let hit0 = this.sp.getChildByName(`hit0_${i}`);
                    let hit1 = this.sp.getChildByName(`hit1_${i}`);
                    let hit2 = this.sp.getChildByName(`hit2_${i}`);
                    let hit3 = this.sp.getChildByName(`hit3_${i}`);
                    hit0.visible = false;
                    hit1.visible = false;
                    hit2.visible = false;
                    hit3.visible = false;
                    this.hit0Arr.push(hit0);
                    this.hit1Arr.push(hit1);
                    this.hit2Arr.push(hit2);
                    this.hit3Arr.push(hit3);
                }
            }
            this.self.on(Laya.Event.CLICK, this, this.onClickSelf);
            this.playBallAnim();
        }
        playBallAnim() {
            Laya.Tween.to(this.ball, { rotation: -360 }, 2000);
            Laya.timer.loop(2000, this, () => {
                this.ball.rotation = 0;
                Laya.Tween.to(this.ball, { rotation: -360 }, 2000);
            });
            for (let i = 0; i < this.hitArr.length; i++) {
                Laya.Tween.to(this.hitArr[i], { rotation: -360 }, 2000);
            }
            for (let i = 0; i < this.hitArr.length; i++) {
                Laya.timer.loop(2000, this, () => {
                    if (this.hitArr[i]) {
                        this.hitArr[i].rotation = 0;
                        Laya.Tween.to(this.hitArr[i], { rotation: -360 }, 2000);
                    }
                });
            }
            for (let i = 0; i < 3; i++) {
                Laya.Tween.to(this.hit0Arr[i], { rotation: this.hit0Arr[i].rotation - 360 }, 2000);
                Laya.Tween.to(this.hit1Arr[i], { rotation: this.hit1Arr[i].rotation - 360 }, 2000);
                Laya.Tween.to(this.hit2Arr[i], { rotation: this.hit2Arr[i].rotation - 360 }, 2000);
                Laya.Tween.to(this.hit3Arr[i], { rotation: this.hit3Arr[i].rotation - 360 }, 2000);
                Laya.timer.loop(2000, this, () => {
                    Laya.Tween.to(this.hit0Arr[i], { rotation: this.hit0Arr[i].rotation - 360 }, 2000);
                    Laya.Tween.to(this.hit1Arr[i], { rotation: this.hit1Arr[i].rotation - 360 }, 2000);
                    Laya.Tween.to(this.hit2Arr[i], { rotation: this.hit2Arr[i].rotation - 360 }, 2000);
                    Laya.Tween.to(this.hit3Arr[i], { rotation: this.hit3Arr[i].rotation - 360 }, 2000);
                });
            }
        }
        onClickSelf() {
            this.self.off(Laya.Event.CLICK, this, this.onClickSelf);
            for (let i = 0; i < this.ballArr.length; i++) {
                if (!(i == this.ballArr.length - 1)) {
                    this.ballArr[i].pos(this.ballArr[i + 1].x, this.ballArr[i + 1].y);
                }
            }
            for (let i = this.ballArr.length - 1; i >= 0; i--) {
                Laya.Tween.to(this.ballArr[i], { y: 237 }, 500);
                if (this.newRunTime) {
                    this.newRunTime.clearAll(this);
                }
                this.newRunTime = new Laya.Timer();
                this.runTime(this.ballArr[i]);
                return;
            }
        }
        runTime(img) {
            this.newRunTime.frameLoop(1, this, () => {
                this.updateImg(img);
            });
        }
        updateImg(img) {
            let imgBound = this.ballArr[this.ballArr.length - 1].getBounds();
            let hitBall = this.ballHit.getBounds();
            for (let i = 0; i < 3; i++) {
                let hit0 = this.hit0Arr[i];
                let hit1 = this.hit1Arr[i];
                let hit2 = this.hit2Arr[i];
                let hit3 = this.hit3Arr[i];
                let hitBound_0 = hit0.getBounds();
                let hitBound_1 = hit1.getBounds();
                let hitBound_2 = hit2.getBounds();
                let hitBound_3 = hit3.getBounds();
                if (hitBound_0.intersects(imgBound)) {
                    this.clearTweenAndBall(img);
                    if (img.name !== "ball_0") {
                        this.gameOver();
                        return;
                    }
                    else {
                        this.delHit(this.hit0Arr, 0);
                    }
                    console.log("浅橙色");
                    return;
                }
                else if (hitBound_1.intersects(imgBound)) {
                    this.clearTweenAndBall(img);
                    if (img.name !== "ball_1") {
                        this.gameOver();
                        return;
                    }
                    else {
                        this.delHit(this.hit1Arr, 1);
                    }
                    console.log("深橘色");
                    return;
                }
                else if (hitBound_2.intersects(imgBound)) {
                    this.clearTweenAndBall(img);
                    if (img.name !== "ball_2") {
                        this.gameOver();
                        return;
                    }
                    else {
                        this.delHit(this.hit2Arr, 2);
                    }
                    console.log("绿色");
                    return;
                }
                else if (hitBound_3.intersects(imgBound)) {
                    this.clearTweenAndBall(img);
                    if (img.name !== "ball_3") {
                        this.gameOver();
                        return;
                    }
                    else {
                        this.delHit(this.hit3Arr, 3);
                    }
                    console.log("蓝色");
                    return;
                }
            }
            if (imgBound.intersects(hitBall)) {
                Laya.timer.clearAll(img);
                Laya.Tween.clearAll(img);
                console.log("触碰到球，失败!");
                this.newRunTime.clearAll(this);
                this.gameOver();
            }
        }
        delRound(item) {
            let filter = this.ballArr.filter(img => img.name !== item.name);
            this.ballArr = filter;
            console.log(this.ballArr);
            this.sp.removeChild(item);
        }
        clearTweenAndBall(item) {
            Laya.timer.clearAll(item);
            Laya.Tween.clearAll(item);
            this.newRunTime.clearAll(this);
            this.delRound(item);
        }
        gameOver() {
            Laya.stage.mouseEnabled = false;
            this.showClickTip(1);
            Laya.timer.once(500, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
            });
        }
        delHit(Array, i) {
            console.log("开始删除");
            this.self.on(Laya.Event.CLICK, this, this.onClickSelf);
            for (let i = 0; i < Array.length; i++) {
                let hit = Array[i];
                this.sp.removeChild(hit);
                console.log(hit);
            }
            Array = [];
            let hitName = "hit_" + i;
            let find = this.hitArr.find(img => img.name === hitName);
            let filter = this.hitArr.filter(img => img.name !== hitName);
            if (find) {
                this.sp.removeChild(find);
            }
            this.hitArr = filter;
            this.winNum++;
            this.onWin();
        }
        onWin() {
            if (this.winNum === 4) {
                this.showCorrect();
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            }
        }
    }

    class LevelFault89 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.allowRoundArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.roundBox = this.sp.getChildByName("appleBox");
            this.btnSubmit = this.sp.getChildByName("btnSubmit");
            this.addRound();
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.btnSubmit.on(Laya.Event.CLICK, this, this.onClickBtnSubmit);
        }
        onClickBtnSubmit() {
            this.self.mouseEnabled = false;
            if (this.winNum === 36) {
                this.showCorrect();
                this.onWin();
            }
            else {
                this.showClickTip(1);
                Laya.timer.once(700, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                });
            }
        }
        addRound() {
            let index = 0;
            for (let i = 0; i < 6; i++) {
                let Y = i * 100;
                for (let j = 0; j < 6; j++) {
                    let X = j * 100;
                    let apple = new Laya.Image;
                    apple.skin = "sub/level_fault_89/round_0.png";
                    apple.pos(X, Y);
                    apple.name = `round_${index}`;
                    apple.anchorX = 0.5;
                    apple.anchorY = 0.5;
                    index++;
                    this.roundBox.addChild(apple);
                    this.roundArr.push(apple);
                }
            }
            this.roundArr[11].skin = "sub/level_fault_89/round_1.png";
            this.roundArr[24].skin = "sub/level_fault_89/round_1.png";
            this.roundArr[11].on(Laya.Event.CLICK, this, this.onClickRedRound, [11]);
            this.roundArr[24].on(Laya.Event.CLICK, this, this.onClickRedRound, [24]);
        }
        onClickRedRound(i) {
            if (i == 11) {
                this.roundArr[11].skin = "sub/level_fault_89/round_0.png";
            }
            else {
                this.roundArr[24].skin = "sub/level_fault_89/round_0.png";
            }
        }
        allowApples(item) {
            this.allowRoundArr = [];
            let allowApple = [];
            const regex = /_(.*)$/;
            const match = item.name.match(regex);
            let num;
            match ? num = parseInt(match[1]) : null;
            num + 1 <= 35 ? (allowApple[allowApple.length] = num + 1) : null;
            num - 1 >= 0 ? (allowApple[allowApple.length] = num - 1) : null;
            num + 6 <= 35 ? (allowApple[allowApple.length] = num + 6) : null;
            num - 6 >= 0 ? (allowApple[allowApple.length] = num - 6) : null;
            for (let i = 0; i < allowApple.length; i++) {
                this.allowRoundArr.push(this.roundArr[allowApple[i]]);
            }
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.roundArr.length; i++) {
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delRoundArr.includes(this.roundArr[i])) {
                    if (this.roundArr[i].skin === "sub/level_fault_89/round_1.png") {
                        return;
                    }
                    if (this.allowRoundArr.length == 0) {
                        this.roundArr[i].skin = "sub/level_fault_89/round_2.png";
                        this.allowApples(this.roundArr[i]);
                    }
                    let appleBoxPos = this.roundBox.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    if (!this.start) {
                        this.delRoundArr.push(this.roundArr[i]);
                        this.start = this.line.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                        this.winNum++;
                    }
                    this.oldPos.push(this.start);
                    this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                    this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                    this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                    break;
                }
            }
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.start == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.start.x, this.start.y, pos.x, pos.y, "#00fe15", 20);
            for (let i = 0; i < this.roundArr.length; i++) {
                if (this.roundArr[i].skin === "sub/level_fault_89/round_0.png" && this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delRoundArr.includes(this.roundArr[i]) && this.allowRoundArr.includes(this.roundArr[i])) {
                    this.roundArr[i].skin = "sub/level_fault_89/round_2.png";
                    this.delRoundArr.push(this.roundArr[i]);
                    let appleBoxPos = this.roundBox.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.start.x, this.start.y, endPox.x, endPox.y, "#00fe15", 20);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#23cb30", 20);
                    this.start.x = endPox.x;
                    this.start.y = endPox.y;
                    this.allowApples(this.roundArr[i]);
                    this.winNum++;
                    console.log(this.winNum);
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault9 extends LevelBase {
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            DragUtil.create(UIUtils.getChildByPath(this.sp, `g_2`)).setDragEndCallback(this.g2DragEnd.bind(this));
            UIUtils.getChildByPath(this.sp, 'g_3').visible = false;
            this.playG_0Anim();
        }
        playG_0Anim() {
            let g0 = UIUtils.getChildByPath(this.sp, 'g_0');
            g0.rotation = 0;
            Laya.Tween.to(g0, { rotation: 360 }, 3000);
            Laya.timer.loop(3000, this, () => {
                g0.rotation = 0;
                Laya.Tween.to(g0, { rotation: 360 }, 3000);
            });
        }
        g2DragEnd(pos, item) {
            item.reset();
            if (UIUtils.getChildByPath(this.sp, "g_3").hitTestPoint(pos.x, pos.y)) {
                console.log("OK!");
                this.playAnim();
                item.hide();
                this.onWin();
                this.showCorrect(375, 927);
            }
            else {
                this.showClickTip(1, pos);
            }
        }
        playAnim() {
            let g3 = UIUtils.getChildByPath(this.sp, 'g_3');
            g3.visible = true;
            let g1 = UIUtils.getChildByPath(this.sp, 'g_1');
            Laya.Tween.to(g1, { rotation: 360 }, 3000);
            Laya.timer.loop(3000, this, () => {
                g1.rotation = 0;
                Laya.Tween.to(g1, { rotation: 360 }, 3000);
            });
            Laya.Tween.to(g3, { rotation: -360 }, 1500);
            Laya.timer.loop(1500, this, () => {
                g3.rotation = 0;
                Laya.Tween.to(g3, { rotation: -360 }, 1500);
            });
        }
        onWin() {
            Laya.timer.once(1000, this, () => {
                GameDispatcher.getInstance().event(EventName.GAME_WIN);
            });
        }
    }

    class LevelFault91 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.hitArr = [];
            this.allHit = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.bg = this.sp.getChildByName("bg");
            for (let i = 0; i < 6; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragMouseDownCallback(this.onMouseDownDrag.bind(this));
                DragUtil.create(drag).setDragEndCallback(this.onDragEnd.bind(this));
                this.dragArr.push(drag);
                let hit = this.sp.getChildByName(`hit_${i}`);
                hit.visible = false;
                this.hitArr.push(hit);
                this.allHit.push(false);
            }
        }
        onMouseDownDrag(pos, self) {
            self.node.scale(1, 1);
        }
        onDragEnd(pos, self) {
            let regex = /_(.*)$/;
            let index = self.node.name.match(regex);
            let intIndex = parseInt(index[1]);
            if (!this.bg.hitTestPoint(pos.x, pos.y)) {
                this.allHit[intIndex] = false;
                self.node.scale(0.5, 0.5);
                self.reset();
            }
            else if (this.hitArr[intIndex].hitTestPoint(pos.x, pos.y)) {
                this.allHit[intIndex] = true;
                this.allIsHit();
                console.log("成功一个", intIndex, this.allHit[intIndex]);
            }
        }
        allIsHit() {
            let num = 0;
            for (let i = 0; i < this.allHit.length; i++) {
                if (!this.allHit[i]) {
                    return;
                }
                else {
                    num++;
                }
            }
            console.log(num);
            if (num == 6) {
                this.onWin();
            }
        }
        onWin() {
            this.self.mouseEnabled = false;
            let posArr = [[213, 205], [333, 203], [523, 185], [206, 354.5], [306.5, 295], [523.5, 335]];
            for (let i = 0; i < this.dragArr.length; i++) {
                Laya.Tween.to(this.dragArr[i], { x: posArr[i][0], y: posArr[i][1] }, 500, null, Laya.Handler.create(this, () => {
                    this.showCorrect();
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                }));
            }
        }
    }

    class LevelFault92 extends LevelBase {
        constructor() {
            super(...arguments);
            this.intList = [];
            this.posList = [];
            this.intArr = [];
            this.runIntArr = [];
            this.polieNumArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.police = this.sp.getChildByName("police");
            this.thief = this.sp.getChildByName("thief");
            this.newPolie = new police$1(this.police, 7);
            this.newThief = new thief$1(this.thief, 0);
            for (let i = 0; i < 15; i++) {
                let int = this.sp.getChildByName(`int_${i}`);
                int.on(Laya.Event.CLICK, this, this.onClickInt, [int]);
                this.intArr.push(int);
            }
            this.initRunNum();
        }
        initRunNum() {
            this.allowApples(this.intArr[7], 0);
        }
        onClickInt(item) {
            this.allowApples(item, 0);
            this.runInt(item);
        }
        allowApples(item, who) {
            this.runIntArr = [];
            let allowApple = [];
            let num;
            let clickIndex;
            const regex = /_(.*)$/;
            const match = item.name.match(regex);
            match ? clickIndex = parseInt(match[1]) : null;
            let notRunNum = [[3, 7, 11], [4, 8, 12]];
            if (who === 0) {
                this.polieNumArr = [];
                num = this.newPolie.num;
                num + 1 <= 14 && !notRunNum[0].includes(num) ? (allowApple[allowApple.length] = num + 1) : null;
                num - 1 >= 0 && !notRunNum[1].includes(num) ? (allowApple[allowApple.length] = num - 1) : null;
                num + 4 <= 14 ? (allowApple[allowApple.length] = num + 4) : null;
                num - 4 >= 0 ? (allowApple[allowApple.length] = num - 4) : null;
                if (num == 11 || num == 10 || num == 13) {
                    allowApple[allowApple.length] = 14;
                    this.polieNumArr[this.polieNumArr.length] = 14;
                }
                if (num == 14) {
                    allowApple[allowApple.length] = 11;
                    allowApple[allowApple.length] = 10;
                    allowApple[allowApple.length] = 13;
                    this.polieNumArr[this.polieNumArr.length] = 11;
                    this.polieNumArr[this.polieNumArr.length] = 10;
                    this.polieNumArr[this.polieNumArr.length] = 13;
                }
                clickIndex + 1 <= 14 && !notRunNum[0].includes(clickIndex) ? (this.polieNumArr[this.polieNumArr.length] = clickIndex + 1) : null;
                clickIndex - 1 >= 0 && !notRunNum[1].includes(clickIndex) ? (this.polieNumArr[this.polieNumArr.length] = clickIndex - 1) : null;
                clickIndex + 4 <= 14 ? (this.polieNumArr[this.polieNumArr.length] = clickIndex + 4) : null;
                clickIndex - 4 >= 0 ? (this.polieNumArr[this.polieNumArr.length] = clickIndex - 4) : null;
            }
            else {
                num = this.newThief.num;
                num + 1 <= 14 && !notRunNum[0].includes(num) && this.includesPolie(num + 1) && (num + 1) !== this.newPolie.num ? (allowApple[allowApple.length] = num + 1) : null;
                num - 1 >= 0 && !notRunNum[1].includes(num) && this.includesPolie(num - 1) && (num - 1) !== this.newPolie.num ? (allowApple[allowApple.length] = num - 1) : null;
                num + 4 <= 14 && this.includesPolie(num + 4) && (num + 4) !== this.newPolie.num ? (allowApple[allowApple.length] = num + 4) : null;
                num - 4 >= 0 && this.includesPolie(num - 4) && (num - 4) !== this.newPolie.num ? (allowApple[allowApple.length] = num - 4) : null;
                if ((num == 11 || num == 10 || num == 13) && this.includesPolie(num - 1) && (num - 1) !== this.newPolie.num) {
                    allowApple[allowApple.length] = 14;
                    this.polieNumArr[this.polieNumArr.length] = 14;
                }
                if (num == 14 && this.includesPolie(num - 1) && (num - 1) !== this.newPolie.num) {
                    allowApple[allowApple.length] = 11;
                    allowApple[allowApple.length] = 10;
                    allowApple[allowApple.length] = 13;
                    this.polieNumArr[this.polieNumArr.length] = 11;
                    this.polieNumArr[this.polieNumArr.length] = 10;
                    this.polieNumArr[this.polieNumArr.length] = 13;
                }
                if (allowApple.length == 0) {
                    num + 1 <= 14 && !notRunNum[0].includes(num) ? (allowApple[allowApple.length] = num + 1) : null;
                    num - 1 >= 0 && !notRunNum[1].includes(num) ? (allowApple[allowApple.length] = num - 1) : null;
                    num + 4 <= 14 ? (allowApple[allowApple.length] = num + 4) : null;
                    num - 4 >= 0 ? (allowApple[allowApple.length] = num - 4) : null;
                    if (num == 11 || num == 10 || num == 13) {
                        allowApple[allowApple.length] = 14;
                        this.polieNumArr[this.polieNumArr.length] = 14;
                    }
                    if (num == 14) {
                        allowApple[allowApple.length] = 11;
                        allowApple[allowApple.length] = 10;
                        allowApple[allowApple.length] = 13;
                        this.polieNumArr[this.polieNumArr.length] = 11;
                        this.polieNumArr[this.polieNumArr.length] = 10;
                        this.polieNumArr[this.polieNumArr.length] = 13;
                    }
                }
            }
            for (let i = 0; i < allowApple.length; i++) {
                this.runIntArr.push(this.intArr[allowApple[i]]);
            }
        }
        includesPolie(num) {
            for (let i = 0; i < this.polieNumArr.length; i++) {
                if (this.polieNumArr.includes(num)) {
                    return false;
                }
            }
            return true;
        }
        runInt(item) {
            let find = this.runIntArr.find(item2 => item2.name === item.name);
            if (!find) {
                return;
            }
            this.self.mouseEnabled = false;
            let polieIndex;
            const regex = /_(.*)$/;
            const match = item.name.match(regex);
            match ? polieIndex = parseInt(match[1]) : null;
            this.newPolie.num = polieIndex;
            console.log(`警察下标==${this.newThief.num}`);
            Laya.Tween.to(this.newPolie.img, { x: item.x, y: item.y }, 500, null, Laya.Handler.create(this, () => {
                if (this.newPolie.num == this.newThief.num) {
                    this.onWin();
                    return;
                }
                this.allowApples(item, 1);
                console.log(this.runIntArr);
                console.log(`警察可以走的格子==${this.polieNumArr}`);
                let img = this.runIntArr[Math.floor(Math.random() * this.runIntArr.length)];
                Laya.Tween.to(this.newThief.img, { x: img.x, y: img.y }, 500, null, Laya.Handler.create(this, () => {
                    let clickIndex;
                    const regex = /_(.*)$/;
                    const match = img.name.match(regex);
                    match ? clickIndex = parseInt(match[1]) : null;
                    this.newThief.num = clickIndex;
                    console.log(`小偷下标==${this.newThief.num}`);
                    this.self.mouseEnabled = true;
                }));
            }));
        }
        onWin() {
            Laya.timer.once(1000, this, () => {
                this.showCorrect();
            });
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }
    class police$1 extends Laya.EventDispatcher {
        constructor(img, num) {
            super();
            this.img = img;
            this.num = num;
        }
    }
    class thief$1 extends Laya.EventDispatcher {
        constructor(img, num) {
            super();
            this.img = img;
            this.num = num;
        }
    }

    class LevelFault93 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.allowRoundArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.roundBox = this.sp.getChildByName("appleBox");
            this.btnSubmit = this.sp.getChildByName("btnSubmit");
            this.addRound();
            this.self.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
            this.btnSubmit.on(Laya.Event.CLICK, this, this.onClickBtnSubmit);
        }
        onClickBtnSubmit() {
            this.self.mouseEnabled = false;
            if (this.winNum === 38) {
                this.showCorrect();
                this.onWin();
            }
            else {
                this.showClickTip(1);
                Laya.timer.once(700, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                });
            }
        }
        addRound() {
            let index = 0;
            for (let i = 0; i < 7; i++) {
                let Y = i * 90;
                for (let j = 0; j < 6; j++) {
                    let X = j * 90;
                    let apple = new Laya.Image;
                    apple.skin = "sub/level_fault_93/round_0.png";
                    apple.pos(X, Y);
                    apple.name = `round_${index}`;
                    apple.anchorX = 0.5;
                    apple.anchorY = 0.5;
                    index++;
                    this.roundBox.addChild(apple);
                    this.roundArr.push(apple);
                }
            }
            this.roundArr[0].visible = false;
            this.roundArr[5].visible = false;
            this.roundArr[41].visible = false;
            this.roundArr[36].visible = false;
            this.roundArr[14].skin = "sub/level_fault_93/round_1.png";
            this.roundArr[27].skin = "sub/level_fault_93/round_1.png";
            this.roundArr[14].on(Laya.Event.CLICK, this, this.onClickRedRound, [14]);
            this.roundArr[27].on(Laya.Event.CLICK, this, this.onClickRedRound, [27]);
        }
        onClickRedRound(i) {
            if (i == 14) {
                this.roundArr[14].skin = "sub/level_fault_93/round_0.png";
            }
            else {
                this.roundArr[27].skin = "sub/level_fault_93/round_0.png";
            }
        }
        allowApples(item) {
            this.allowRoundArr = [];
            let allowApple = [];
            const regex = /_(.*)$/;
            const match = item.name.match(regex);
            let num;
            match ? num = parseInt(match[1]) : null;
            let notNum = [0, 5, 36, 41];
            let edgeNumArr = [[6, 12, 18, 24, 30], [11, 17, 23, 29, 35]];
            num + 1 <= 40 && !notNum.includes((num + 1)) && edgeExecute(num, 1) ? (allowApple[allowApple.length] = num + 1) : null;
            num - 1 >= 1 && !notNum.includes((num - 1)) && edgeExecute(num, 0) ? (allowApple[allowApple.length] = num - 1) : null;
            num + 6 <= 40 && !notNum.includes((num + 6)) ? (allowApple[allowApple.length] = num + 6) : null;
            num - 6 >= 1 && !notNum.includes((num - 6)) ? (allowApple[allowApple.length] = num - 6) : null;
            function edgeExecute(num, i) {
                if (i == 0) {
                    if (edgeNumArr[0].includes(num)) {
                        return false;
                    }
                }
                else {
                    if (edgeNumArr[1].includes(num)) {
                        return false;
                    }
                }
                return true;
            }
            for (let i = 0; i < allowApple.length; i++) {
                this.allowRoundArr.push(this.roundArr[allowApple[i]]);
            }
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.roundArr.length; i++) {
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delRoundArr.includes(this.roundArr[i])) {
                    if (this.roundArr[i].skin === "sub/level_fault_93/round_1.png") {
                        return;
                    }
                    if (this.allowRoundArr.length == 0) {
                        this.roundArr[i].skin = "sub/level_fault_93/round_2.png";
                        this.allowApples(this.roundArr[i]);
                    }
                    let appleBoxPos = this.roundBox.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    if (!this.start) {
                        this.delRoundArr.push(this.roundArr[i]);
                        this.start = this.line.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                        this.winNum++;
                    }
                    this.oldPos.push(this.start);
                    this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                    this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                    this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                    break;
                }
            }
            this.self.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            this.self.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.start == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            this.line.graphics.drawLine(this.start.x, this.start.y, pos.x, pos.y, "#00fe15", 20);
            for (let i = 0; i < this.roundArr.length; i++) {
                if (this.roundArr[i].skin === "sub/level_fault_93/round_0.png" && this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !this.delRoundArr.includes(this.roundArr[i]) && this.allowRoundArr.includes(this.roundArr[i])) {
                    this.roundArr[i].skin = "sub/level_fault_93/round_2.png";
                    this.delRoundArr.push(this.roundArr[i]);
                    let appleBoxPos = this.roundBox.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(appleBoxPos.x, appleBoxPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.start.x, this.start.y, endPox.x, endPox.y, "#00fe15", 20);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#23cb30", 20);
                    this.start.x = endPox.x;
                    this.start.y = endPox.y;
                    this.allowApples(this.roundArr[i]);
                    this.winNum++;
                    console.log(this.winNum);
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            this.self.off(Laya.Event.MOUSE_MOVE, this, this.onMouseUpSelf);
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault94 extends LevelBase {
        constructor() {
            super(...arguments);
            this.dragArr = [];
            this.isOK = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 4; i++) {
                let drag = this.sp.getChildByName(`drag_${i}`);
                DragUtil.create(drag).setDragEndCallback(this.dragEnd.bind(this));
                DragUtil.create(drag).setDragMouseDownCallback(this.dragMouseDown.bind(this));
                this.dragArr.push(drag);
            }
            this.hit_0 = this.sp.getChildByName("hit_0");
            this.hit_1 = this.sp.getChildByName("hit_1");
        }
        updateImg() {
            let bounds0 = this.hit_0.getBounds();
            let bounds1 = this.hit_1.getBounds();
            let bounds2 = this.dragArr[1].getBounds();
            if (bounds1.intersects(bounds2) || bounds0.intersects(bounds2)) {
                Laya.timer.clearAll(this);
                this.isOK = true;
                this.self.mouseEnabled = false;
                this.item.node.stopDrag();
                this.showCorrect();
                this.onWin();
            }
        }
        dragMouseDown(pos, item) {
            this.item = item;
            item.node.scale(1.2, 1.2);
            Laya.timer.frameLoop(1, this, this.updateImg);
        }
        dragEnd(pos, item) {
            item.node.scale(1, 1);
            if (!this.isOK) {
                item.reset();
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault95 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.confirmHitArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.btnRemake = this.sp.getChildByName("btnRemake");
            this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
            for (let i = 0; i < 3; i++) {
                if (i < 2) {
                    let confirmHit = this.sp.getChildByName(`confirmHit_${i}`);
                    this.confirmHitArr.push(confirmHit);
                }
                let round = this.sp.getChildByName(`round_${i}`);
                round.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.roundArr.push(round);
            }
        }
        onClickRemake() {
            this.btnRemake.off(Laya.Event.CLICK, this, this.onClickRemake);
            Laya.Tween.to(this.btnRemake, { scaleX: 1.2, scaleY: 1.2 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.btnRemake, { scaleX: 1, scaleY: 1 }, 200, null, Laya.Handler.create(this, () => {
                    this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
                }));
            });
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            this.delRoundArr = [];
            this.nowClickImg = null;
            this.startPos = null;
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && this.delRoundArr.length <= 1) {
                    this.delRoundArr.push(this.roundArr[i]);
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(this.startPos);
                    this.nowClickImg = i;
                    Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                    Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                    break;
                }
            }
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            console.log(this.startPos);
            if (this.startPos == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            if (this.nowClickImg == 0 && !this.confirmHitArr[0].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else if (this.nowClickImg == 2 && !this.confirmHitArr[1].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#e459f4", 30);
            }
            let errHit = [0, 2];
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && (!errHit.includes(this.nowClickImg) || !errHit.includes(i)) && !find) {
                    this.nowClickImg = i;
                    this.delRoundArr.push(this.roundArr[i]);
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#e459f4", 30);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#e459f4", 30);
                    this.startPos.x = endPox.x;
                    this.startPos.y = endPox.y;
                    this.onWin();
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            if (this.delRoundArr.length == 1) {
                this.delRoundArr = [];
                console.log("删除一个", this.delRoundArr);
            }
        }
        onWin() {
            console.log(this.delRoundArr);
            if (this.delRoundArr.length == 3) {
                this.self.mouseEnabled = false;
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                this.line.graphics.clear();
                this.showCorrect();
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault96 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.confirmHitArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.btnRemake = this.sp.getChildByName("btnRemake");
            this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
            for (let i = 0; i < 4; i++) {
                let confirmHit = this.sp.getChildByName(`confirmHit_${i}`);
                this.confirmHitArr.push(confirmHit);
                let round = this.sp.getChildByName(`round_${i}`);
                round.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.roundArr.push(round);
            }
        }
        onClickRemake() {
            this.btnRemake.off(Laya.Event.CLICK, this, this.onClickRemake);
            Laya.Tween.to(this.btnRemake, { scaleX: 1.2, scaleY: 1.2 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.btnRemake, { scaleX: 1, scaleY: 1 }, 200, null, Laya.Handler.create(this, () => {
                    this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
                }));
            });
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            this.delRoundArr = [];
            this.nowClickImg = null;
            this.startPos = null;
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && this.delRoundArr.length <= 1) {
                    this.delRoundArr.push(this.roundArr[i]);
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(this.startPos);
                    this.nowClickImg = i;
                    Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                    Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                    break;
                }
            }
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        onMouseMoveSelf(e) {
            if (this.startPos == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            if (this.nowClickImg == 0 && !this.confirmHitArr[0].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else if (this.nowClickImg == 1 && !this.confirmHitArr[1].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else if (this.nowClickImg == 2 && !this.confirmHitArr[2].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else if (this.nowClickImg == 3 && !this.confirmHitArr[3].hitTestPoint(e.stageX, e.stageY)) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#e459f4", 30);
            }
            let canConnect = [[1], [0, 2], [1, 3], [2]];
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && canConnect[this.nowClickImg].includes(i)) {
                    this.nowClickImg = i;
                    this.delRoundArr.push(this.roundArr[i]);
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#e459f4", 30);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#e459f4", 30);
                    this.startPos.x = endPox.x;
                    this.startPos.y = endPox.y;
                    this.onWin();
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
            if (this.delRoundArr.length == 1) {
                this.delRoundArr = [];
            }
        }
        onWin() {
            if (this.delRoundArr.length == 4) {
                this.self.mouseEnabled = false;
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
                Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
                this.line.graphics.clear();
                this.showCorrect();
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
    }

    class LevelFault97 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.confirmHitArr = [];
            this.winNum = 0;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.btnRemake = this.sp.getChildByName("btnRemake");
            this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
            for (let i = 0; i < 5; i++) {
                let confirmHit = this.sp.getChildByName(`confirmHit_${i}`);
                this.confirmHitArr.push(confirmHit);
                let round = this.sp.getChildByName(`round_${i}`);
                round.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.roundArr.push(round);
            }
        }
        onClickRemake() {
            this.btnRemake.off(Laya.Event.CLICK, this, this.onClickRemake);
            Laya.Tween.to(this.btnRemake, { scaleX: 1.2, scaleY: 1.2 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.btnRemake, { scaleX: 1, scaleY: 1 }, 200, null, Laya.Handler.create(this, () => {
                    this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
                }));
            });
            this.winNum = 0;
            this.line.graphics.clear();
            this.oldLine.graphics.clear();
            this.delRoundArr = [];
            this.nowClickImg = null;
            this.startPos = null;
        }
        onMouseDownSelf(e) {
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && this.delRoundArr.length <= 1) {
                    if (i == 4) {
                        this.delRoundArr.push(this.roundArr[i]);
                    }
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(this.startPos);
                    this.nowClickImg = i;
                    this.openLayaStageEvent();
                    break;
                }
            }
            this.openLayaStageEvent();
        }
        onMouseMoveSelf(e) {
            if (this.startPos == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            let redArr = [
                (this.nowClickImg == 0 && !this.confirmHitArr[0].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 1 && !this.confirmHitArr[1].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 2 && !this.confirmHitArr[2].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 3 && !this.confirmHitArr[3].hitTestPoint(e.stageX, e.stageY)),
            ];
            if (redArr[0] || redArr[1] || redArr[2] || redArr[3]) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#e459f4", 30);
            }
            let canConnect = [[1, 2], [0, 3], [0, 3, 4], [1, 2], [2]];
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && canConnect[this.nowClickImg].includes(i)) {
                    this.nowClickImg = i;
                    this.winNum++;
                    if (this.delRoundArr.length !== 0) {
                        if (!(this.delRoundArr[this.delRoundArr.length - 1].name == "round_4")) {
                            this.delRoundArr.push(this.roundArr[i]);
                        }
                    }
                    else {
                        this.delRoundArr.push(this.roundArr[i]);
                    }
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#e459f4", 30);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#e459f4", 30);
                    this.startPos.x = endPox.x;
                    this.startPos.y = endPox.y;
                    this.onWin();
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.offLayaStageEvent();
            if (this.delRoundArr.length == 1) {
                this.delRoundArr = [];
            }
        }
        onWin() {
            if (this.winNum == 5) {
                this.self.mouseEnabled = false;
                this.offLayaStageEvent();
                this.line.graphics.clear();
                this.showCorrect();
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
        offLayaStageEvent() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        openLayaStageEvent() {
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
    }

    class LevelFault98 extends LevelBase {
        constructor() {
            super(...arguments);
            this.peopleArr = [];
            this.hitArr = [];
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            for (let i = 0; i < 3; i++) {
                if (i < 2) {
                    let hit = this.sp.getChildByName(`hit_${i}`);
                    hit.visible = false;
                    this.hitArr.push(hit);
                }
                let people = this.sp.getChildByName(`people_${i}`);
                people.on(Laya.Event.CLICK, this, this.onClickPeople);
                this.peopleArr.push(people);
            }
            this.drag = this.sp.getChildByName("drag");
            this.drag.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownDrag);
            console.log(this.drag.x);
        }
        onMouseDownDrag(e) {
            let downPos = (new Laya.Point(e.stageX, e.stageY));
            this.mouseDownX = downPos.x;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveStage);
            this.drag.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpDrag);
            this.drag.on(Laya.Event.MOUSE_UP, this, this.onMouseUpDrag);
        }
        onMouseMoveStage(e) {
            let movePos = new Laya.Point(e.stageX, e.stageY);
            this.moveX = movePos.x;
            this.drag.x += (this.moveX - this.mouseDownX);
            this.mouseDownX = this.moveX;
            this.updateImg();
        }
        onMouseUpDrag() {
            Laya.timer.clearAll(this);
        }
        onClickPeople(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            this.showClickTip(1, pos);
        }
        updateImg() {
            let bounds0 = this.hitArr[0].getBounds();
            let bounds1 = this.hitArr[1].getBounds();
            let bounds2 = this.drag.getBounds();
            if (bounds1.intersects(bounds2) || bounds0.intersects(bounds2)) {
                Laya.timer.clearAll(this);
                this.self.mouseEnabled = false;
                Laya.stage.offAllCaller(this);
                this.showCorrect();
                this.onWin();
                Laya.Tween.to(this.drag, { x: 423.5, y: 493.5 }, 500);
            }
        }
        onWin() {
            GameDispatcher.getInstance().event(EventName.GAME_WIN);
        }
    }

    class LevelFault99 extends LevelBase {
        constructor() {
            super(...arguments);
            this.roundArr = [];
            this.oldPos = [];
            this.delRoundArr = [];
            this.confirmHitArr = [];
            this.winNum = 0;
            this.addNumArr = [[0], [0]];
            this.startClick = false;
        }
        onInit() {
        }
        onAdapter() {
        }
        onAwake() {
            super.onAwake();
            this.onLoad();
        }
        onLoad() {
            this.self = this.owner;
            this.sp = this.self.getChildByName("sp");
            this.line = this.sp.getChildByName("line");
            this.oldLine = this.sp.getChildByName("oldLine");
            this.btnRemake = this.sp.getChildByName("btnRemake");
            this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
            for (let i = 0; i < 5; i++) {
                let confirmHit = this.sp.getChildByName(`confirmHit_${i}`);
                this.confirmHitArr.push(confirmHit);
                let round = this.sp.getChildByName(`round_${i}`);
                round.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                this.roundArr.push(round);
            }
        }
        onClickRemake() {
            this.btnRemake.off(Laya.Event.CLICK, this, this.onClickRemake);
            Laya.Tween.to(this.btnRemake, { scaleX: 1.2, scaleY: 1.2 }, 200);
            Laya.timer.once(200, this, () => {
                Laya.Tween.to(this.btnRemake, { scaleX: 1, scaleY: 1 }, 200, null, Laya.Handler.create(this, () => {
                    this.btnRemake.on(Laya.Event.CLICK, this, this.onClickRemake);
                    GameDispatcher.getInstance().event(EventName.GAME_REMAKE);
                }));
            });
        }
        onMouseDownSelf(e) {
            if (this.startClick) {
                this.openLayaStageEvent();
                return;
            }
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && this.delRoundArr.length <= 1) {
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    this.startPos = this.line.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(this.startPos);
                    this.nowClickImg = i;
                    if (i == 1 || i == 2) {
                        if (this.addNumArr[i - 1].length !== 0) {
                            this.addNumArr[i - 1].splice(0, 1);
                        }
                        else {
                            this.delRoundArr.push(this.roundArr[i]);
                        }
                    }
                    this.openLayaStageEvent();
                    this.lastTimeNum = i;
                    break;
                }
            }
        }
        someBug(i) {
            let length = this.delRoundArr.length;
            let addNumArr_length = (this.addNumArr[0].length == 0 && this.addNumArr[1].length == 0);
            if (addNumArr_length && this.nowClickImg == 0 && length <= 1) {
                return false;
            }
            if (addNumArr_length && length == 3 && i == 2) {
                return false;
            }
            if (addNumArr_length && length == 3 && i == 1) {
                return false;
            }
            return true;
        }
        onMouseMoveSelf(e) {
            if (this.startPos == null) {
                this.onMouseUpSelf();
                return;
            }
            if (this.line) {
                this.line.graphics.clear();
            }
            let pos = this.line.globalToLocal(new Laya.Point(e.stageX, e.stageY));
            let redArr = [
                (this.nowClickImg == 0 && !this.confirmHitArr[0].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 1 && !this.confirmHitArr[1].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 2 && !this.confirmHitArr[2].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 3 && !this.confirmHitArr[3].hitTestPoint(e.stageX, e.stageY)),
                (this.nowClickImg == 4 && !this.confirmHitArr[4].hitTestPoint(e.stageX, e.stageY)),
            ];
            if (redArr[0] || redArr[1] || redArr[2] || redArr[3] || redArr[4]) {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#fd0000", 30);
            }
            else {
                this.line.graphics.drawLine(this.startPos.x, this.startPos.y, pos.x, pos.y, "#6f5ad8", 30);
            }
            let canConnect = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4], [2, 3]];
            for (let i = 0; i < this.roundArr.length; i++) {
                let find = this.delRoundArr.find(img => img.name === this.roundArr[i].name);
                let notNum = (this.nowClickImg !== i && this.lastTimeNum !== i);
                if (this.roundArr[i].hitTestPoint(e.stageX, e.stageY) && !find && canConnect[this.nowClickImg].includes(i) && notNum && this.someBug(i)) {
                    this.startClick = true;
                    Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownSelf);
                    this.lastTimeNum = this.nowClickImg;
                    this.nowClickImg = i;
                    this.winNum++;
                    if (i == 1 || i == 2) {
                        if (this.addNumArr[i - 1].length !== 0) {
                            this.addNumArr[i - 1].splice(0, 1);
                        }
                        else {
                            this.delRoundArr.push(this.roundArr[i]);
                        }
                    }
                    else {
                        this.delRoundArr.push(this.roundArr[i]);
                    }
                    let spPos = this.sp.localToGlobal(new Laya.Point(this.roundArr[i].x, this.roundArr[i].y));
                    let endPox = this.oldLine.globalToLocal(new Laya.Point(spPos.x, spPos.y));
                    this.oldPos.push(endPox);
                    this.line.graphics.drawLine(this.startPos.x, this.startPos.y, endPox.x, endPox.y, "#6f5ad8", 30);
                    this.oldLine.graphics.drawLine(this.oldPos[this.oldPos.length - 2].x, this.oldPos[this.oldPos.length - 2].y, this.oldPos[this.oldPos.length - 1].x, this.oldPos[this.oldPos.length - 1].y, "#6f5ad8", 30);
                    this.startPos.x = endPox.x;
                    this.startPos.y = endPox.y;
                    this.onWin();
                    break;
                }
            }
        }
        onMouseUpSelf() {
            this.line.graphics.clear();
            this.offLayaStageEvent();
            let arrLength = (this.addNumArr[0].length == 1 && this.addNumArr[1].length == 1);
            if (this.delRoundArr.length == 1 && arrLength) {
                this.delRoundArr = [];
            }
        }
        onWin() {
            if (this.winNum == 6) {
                this.self.mouseEnabled = false;
                this.offLayaStageEvent();
                this.line.graphics.clear();
                this.showCorrect();
                Laya.timer.once(1000, this, () => {
                    GameDispatcher.getInstance().event(EventName.GAME_WIN);
                });
            }
        }
        offLayaStageEvent() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
        openLayaStageEvent() {
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMoveSelf);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUpSelf);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUpSelf);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("logic/LevelView.ts", LevelView);
            reg("logic/level/LevelFault1.ts", LevelFault1);
            reg("logic/level/LevelFault10.ts", LevelFault10);
            reg("logic/level/LevelFault100.ts", LevelFault100);
            reg("logic/level/LevelFault11.ts", LevelFault11);
            reg("logic/level/LevelFault12.ts", LevelFault12);
            reg("logic/level/LevelFault13.ts", LevelFault13);
            reg("logic/level/LevelFault14.ts", LevelFault14);
            reg("logic/level/LevelFault15.ts", LevelFault15);
            reg("logic/level/LevelFault16.ts", LevelFault16);
            reg("logic/level/LevelFault17.ts", LevelFault17);
            reg("logic/level/LevelFault18.ts", LevelFault18);
            reg("logic/level/LevelFault19.ts", LevelFault19);
            reg("logic/level/LevelFault2.ts", LevelFault2);
            reg("logic/level/LevelFault20.ts", LevelFault20);
            reg("logic/level/LevelFault21.ts", LevelFault21);
            reg("logic/level/LevelFault22.ts", LevelFault22);
            reg("logic/level/LevelFault23.ts", LevelFault23);
            reg("logic/level/LevelFault24.ts", LevelFault24);
            reg("logic/level/LevelFault25.ts", LevelFault25);
            reg("logic/level/LevelFault26.ts", LevelFault26);
            reg("logic/level/LevelFault27.ts", LevelFault27);
            reg("logic/level/LevelFault28.ts", LevelFault28);
            reg("logic/level/LevelFault29.ts", LevelFault29);
            reg("logic/level/LevelFault3.ts", LevelFault3);
            reg("logic/level/LevelFault30.ts", LevelFault30);
            reg("logic/level/LevelFault31.ts", LevelFault31);
            reg("logic/level/LevelFault32.ts", LevelFault32);
            reg("logic/level/LevelFault33.ts", LevelFault33);
            reg("logic/level/LevelFault34.ts", LevelFault34);
            reg("logic/level/LevelFault35.ts", LevelFault35);
            reg("logic/level/LevelFault36.ts", LevelFault36);
            reg("logic/level/LevelFault37.ts", LevelFault37);
            reg("logic/level/LevelFault38.ts", LevelFault38);
            reg("logic/level/LevelFault39.ts", LevelFault39);
            reg("logic/level/LevelFault4.ts", LevelFault4);
            reg("logic/level/LevelFault40.ts", LevelFault40);
            reg("logic/level/LevelFault41.ts", LevelFault41);
            reg("logic/level/LevelFault42.ts", LevelFault42);
            reg("logic/level/LevelFault43.ts", LevelFault43);
            reg("logic/level/LevelFault44.ts", LevelFault44);
            reg("logic/level/LevelFault45.ts", LevelFault45);
            reg("logic/level/LevelFault46.ts", LevelFault46);
            reg("logic/level/LevelFault47.ts", LevelFault47);
            reg("logic/level/LevelFault48.ts", LevelFault48);
            reg("logic/level/LevelFault49.ts", LevelFault49);
            reg("logic/level/LevelFault5.ts", LevelFault5);
            reg("logic/level/LevelFault50.ts", LevelFault50);
            reg("logic/level/LevelFault51.ts", LevelFault51);
            reg("logic/level/LevelFault52.ts", LevelFault52);
            reg("logic/level/LevelFault53.ts", LevelFault53);
            reg("logic/level/LevelFault54.ts", LevelFault54);
            reg("logic/level/LevelFault55.ts", LevelFault55);
            reg("logic/level/LevelFault56.ts", LevelFault56);
            reg("logic/level/LevelFault57.ts", LevelFault57);
            reg("logic/level/LevelFault58.ts", LevelFault58);
            reg("logic/level/LevelFault59.ts", LevelFault59);
            reg("logic/level/LevelFault6.ts", LevelFault6);
            reg("logic/level/LevelFault60.ts", LevelFault60);
            reg("logic/level/LevelFault61.ts", LevelFault61);
            reg("logic/level/LevelFault62.ts", LevelFault62);
            reg("logic/level/LevelFault63.ts", LevelFault63);
            reg("logic/level/LevelFault65.ts", LevelFault65);
            reg("logic/level/LevelFault66.ts", LevelFault66);
            reg("logic/level/LevelFault67.ts", LevelFault67);
            reg("logic/level/LevelFault68.ts", LevelFault68);
            reg("logic/level/LevelFault69.ts", LevelFault69);
            reg("logic/level/LevelFault7.ts", LevelFault7);
            reg("logic/level/LevelFault70.ts", LevelFault70);
            reg("logic/level/LevelFault71.ts", LevelFault71);
            reg("logic/level/LevelFault75.ts", LevelFault75);
            reg("logic/level/LevelFault8.ts", LevelFault8);
            reg("logic/level/LevelFault81.ts", LevelFault81);
            reg("logic/level/LevelFault82.ts", LevelFault82);
            reg("logic/level/LevelFault83.ts", LevelFault83);
            reg("logic/level/LevelFault84.ts", LevelFault84);
            reg("logic/level/LevelFault85.ts", LevelFault85);
            reg("logic/level/LevelFault86.ts", LevelFault86);
            reg("logic/level/LevelFault89.ts", LevelFault89);
            reg("logic/level/LevelFault9.ts", LevelFault9);
            reg("logic/level/LevelFault91.ts", LevelFault91);
            reg("logic/level/LevelFault92.ts", LevelFault92);
            reg("logic/level/LevelFault93.ts", LevelFault93);
            reg("logic/level/LevelFault94.ts", LevelFault94);
            reg("logic/level/LevelFault95.ts", LevelFault95);
            reg("logic/level/LevelFault96.ts", LevelFault96);
            reg("logic/level/LevelFault97.ts", LevelFault97);
            reg("logic/level/LevelFault98.ts", LevelFault98);
            reg("logic/level/LevelFault99.ts", LevelFault99);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "common/MessageBox.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Singleton {
        static getInstance() {
            if (!this.instance) {
                this.instance = new this();
            }
            return this.instance;
        }
    }

    class UserSerializable extends Serializable {
        constructor() {
            super(...arguments);
            this.life = 9999;
            this.key = 999;
            this.lv = 1;
            this.status = [{ lvNum: 1, myName: "小宝宝", level: 0 }];
            this.house = [{ lvNum: 1, schoolName: "幼儿园", level: 0 }];
            this.grade = 1;
            this.unlockLevel = 1;
            this.turntableNums = 4;
            this.unlockLevelList = [];
            this.audio = true;
            this.answerList = [];
            this.tipsList = [];
            this.lastOpenLv = 0;
            this.celeb = [0, 0, 0, 0, 0, 0, 0];
            this.showCelebList = [];
        }
    }

    class UserModel extends Singleton {
        constructor() {
            super();
            this._uid = "";
            this._unionid = "";
            this._nickname = "wwwqqqqqqqqqqqqqqqqqq超级长昵称";
            this._avatar = "res/ui/comm/avatar.png";
            this._pro = "广东";
            this.register_time = "";
            this._life = 999;
            this._status = [{ lvNum: 1, myName: "小宝宝", level: 0 }];
            this._house = [{ lvNum: 1, schoolName: "幼儿园", level: 0 }];
            this._grade = 1;
            this._level = 1;
        }
        init() {
            this.data = new UserSerializable();
            this.data.load();
        }
        get unionid() {
            return this._unionid;
        }
        set unionid(value) {
            this._unionid = value;
        }
        get uid() {
            return this._uid;
        }
        set uid(value) {
            this._uid = value;
        }
        get nickname() {
            return this._nickname;
        }
        set nickname(value) {
            this._nickname = value;
        }
        get avatar() {
            return this._avatar;
        }
        set avatar(value) {
            this._avatar = value;
        }
        get pro() {
            return this._pro;
        }
        set pro(value) {
            this._pro = value;
        }
        loginSuccess(openId, avatar, nickname) {
            this._uid = openId;
            this._avatar = avatar;
            this._nickname = nickname;
        }
        get life() {
            return this._life;
        }
        set life(value) {
            this.data.life = value;
            this._life = this.data.life;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.LIFE);
        }
        get status() {
            return this.data.status;
        }
        set status(value) {
            this.data.status = value;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.yuanbao);
        }
        get house() {
            return this.data.house;
        }
        set house(value) {
            console.log(value);
            this.data.house = value;
            this._house = this.data.house;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.HOUSE);
        }
        get unlockLevel() {
            return this.data.unlockLevel;
        }
        set unlockLevel(value) {
            this.data.unlockLevel = value;
            this.data.save();
        }
        get unlockLevelList() {
            return this.data.unlockLevelList;
        }
        set unlockLevelList(value) {
            this.data.unlockLevelList.push(value);
            this.data.save();
        }
        get turntableNum() {
            return this.data.turntableNums;
        }
        set turntableNum(value) {
            this.data.turntableNums = value;
            this.data.save();
        }
        get key() {
            return this.data.key;
        }
        set key(value) {
            this.data.key = value;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_UPDATE);
        }
        get lv() {
            return this.data.lv;
        }
        set lv(value) {
            this.data.lv = value;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_UPDATE);
        }
        get celeb() {
            return this.data.celeb;
        }
        set celeb(value) {
            this.data.celeb = value;
            this.data.save();
        }
        get showCelebList() {
            return this.data.showCelebList;
        }
        set showCelebList(value) {
            this.data.showCelebList = value;
            this.data.save();
        }
        pass(lv) {
            if (this.data.unlockLevelList.indexOf(lv) == -1) {
                this.data.unlockLevelList.push(lv);
                this.data.save();
            }
        }
        get audio() {
            return this.data.audio;
        }
        set audio(value) {
            this.data.audio = value;
            this.data.save();
        }
        set answerList(value) {
            this.data.answerList = value;
            this.data.save();
        }
        get answerList() {
            return this.data.answerList;
        }
        set tipsList(value) {
            this.data.tipsList = value;
            this.data.save();
        }
        get tipsList() {
            return this.data.tipsList;
        }
        get lastOpenLv() {
            return this.data.lastOpenLv;
        }
        set lastOpenLv(value) {
            this.data.lastOpenLv = value;
            this.data.save();
        }
        onShowSave() {
            this._grade = this.data.grade;
            this._house = this.data.house;
            this._status = this.data.status;
            this._life = this.data.life;
            return;
        }
    }

    class CmdHelper {
        static init() {
            let window = Laya.Browser.window;
            window.UIMgr = UIMgr;
            window.UIDefine = UIDefine;
            window.AppConfig = AppConfig;
            window.UserModel = UserModel;
        }
    }

    class AudioMgr {
        static get isOpenAll() { return this.state[0] == 1 && this.state[1] == 1; }
        ;
        static get isOpenMusic() { return this._isOpenMusic; }
        ;
        static get isOpenSound() { return this._isOpenSound; }
        ;
        static init() {
            let v = Laya.LocalStorage.getJSON(this.key);
            if (!v) {
                v = [1, 1];
            }
            this.state = v;
            this.updateState();
        }
        static set isOpenAll(v) {
            this.state = v ? [1, 1] : [0, 0];
            UserModel.getInstance().audio = v;
            Laya.LocalStorage.setJSON(this.key, this.state);
            this.updateState();
        }
        static set isOpenMusic(v) {
            this.state[0] = v ? 1 : 0;
            Laya.LocalStorage.setJSON(this.key, this.state);
            this.updateState();
        }
        static set isOpenSound(v) {
            this.state[1] = v ? 1 : 0;
            Laya.LocalStorage.setJSON(this.key, this.state);
            this.updateState();
        }
        static updateState() {
            this._isOpenMusic = this.state[0] == 1;
            this._isOpenSound = this.state[1] == 1;
            Laya.SoundManager.musicMuted = !this._isOpenMusic;
            Laya.SoundManager.soundMuted = !this._isOpenSound;
        }
    }
    AudioMgr.key = `SaveData.${AppConfig.appName}.AudioMgr`;

    class VibrationMgr {
        static init() {
            let v = Laya.LocalStorage.getJSON(this.key);
            if (!v) {
                v = [1];
            }
            this.state = v;
        }
        static get isOpen() {
            return this.state[0] == 1;
        }
        static set isOpen(v) {
            this.state[0] = v ? 1 : 0;
            Laya.LocalStorage.setJSON(this.key, this.state);
        }
        static play(time = 1000) {
            if (!this.isOpen) {
                return;
            }
            if (Laya.Browser.onMiniGame || Laya.Browser.onQQMiniGame) {
                wx.vibrateLong({ success: null, fail: null, complete: null });
            }
            else if (Laya.Browser.onTTMiniGame) {
                window["tt"].vibrateLong({ success: null, fail: null, complete: null });
            }
            else {
                let supportsVibrate = "vibrate" in navigator;
                if (supportsVibrate) {
                    window.navigator.vibrate(time);
                }
            }
        }
    }
    VibrationMgr.key = `SaveData.${AppConfig.appName}.VibrationMgr`;

    class ClickUtil {
        static isFastClick() {
            let lastTime = ClickUtil.lastTime;
            let nowTime = new Date().getTime();
            if (nowTime - lastTime < 500) {
                return true;
            }
            ClickUtil.lastTime = nowTime;
            return false;
        }
    }
    ClickUtil.lastTime = 0;

    class MessageItem extends Laya.Sprite {
        constructor() {
            super();
        }
        updateUI(wordStr, fontColor, fontSize = 30, fontFamily = "SimHei", isBold = false) {
            this.wordStr = wordStr;
            this.fontColor = fontColor;
            this.fontSize = fontSize;
            this.fontFamily = fontFamily;
            this.isBold = isBold;
            if (this.bgImg == null) {
                this.bgImg = new Laya.Image("res/ui/comm/bg.png");
                this.bgImg.anchorX = 0.5;
                this.bgImg.anchorY = 0.5;
            }
            this.addChild(this.bgImg);
            if (this.txt == null) {
                this.txt = new Laya.Text();
            }
            this.txt.wordWrap = false;
            this.txt.text = this.wordStr;
            this.txt.fontSize = this.fontSize;
            this.txt.color = fontColor;
            this.txt.align = "center";
            if (this.txt.textWidth > 620) {
                this.txt.width = 620;
                this.txt.wordWrap = true;
            }
            this.txt.width = this.txt.textWidth;
            this.bgImg.width = this.txt.textWidth + 80;
            if (this.bgImg.width > 680) {
                this.bgImg.width = 680;
            }
            this.txt.height = this.txt.height;
            this.bgImg.height = this.txt.textHeight + 50;
            this.bgImg.addChild(this.txt);
            this.txt.pos((this.bgImg.width - this.txt.textWidth) / 2, (this.bgImg.height - this.txt.textHeight) / 2);
        }
        remove() {
            this.removeSelf();
            this.reset();
        }
        reset() {
            this.alpha = 1;
        }
    }

    class Message {
        static show(wordStr, fontColor = "#ffffff", time = 2000, fontSize = 30, fontFamily = "SimHei", isBold = false) {
            let messageItem = null;
            if (Message.messageItemArr.length <= 0) {
                messageItem = new MessageItem();
            }
            else {
                messageItem = this.messageItemArr.shift();
            }
            messageItem.updateUI(wordStr, fontColor, fontSize, fontFamily, isBold);
            LayerMgr.getLayer(LayerMgr.LAYER_TIPS).addChild(messageItem);
            messageItem.pos(Laya.stage.width / 2, Laya.stage.height / 2 + 100);
            Laya.Tween.to(messageItem, { y: Laya.stage.height / 2 - 100, alpha: 0.6 }, time, null, new Laya.Handler(this, function () {
                messageItem.remove();
                Message.returnToMessageItemPool(messageItem);
            }));
        }
        static returnToMessageItemPool(item) {
            this.messageItemArr.push(item);
        }
    }
    Message.messageItemArr = [];

    class QQMiniSDK {
        constructor() {
            this.isOnShare = false;
            this.shareCallback = null;
            this.shareStartTime = 0;
            this._isLogin = false;
            this.videoAd = null;
            this.videoAdCallback = null;
            this.bannerAd = null;
            this.interstitialAd = null;
            this.blockAd = null;
            this.boxAd = null;
            this.gamePortal = null;
            this.gameIconID = null;
            this.gameBanner = null;
            this.lastInterstitialAdTime = 0;
        }
        async init() {
            wx["onShow"](() => {
                Laya.timer.scale = 1;
            });
            wx["onHide"](() => {
                Laya.timer.scale = 0;
            });
        }
        showBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.show().catch((err) => {
                    console.error(err);
                });
            }
        }
        hideBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.hide();
            }
        }
        showGameIcon() {
            if (this.gameIconID) {
                this.gameIconID.load().then(() => {
                    this.gameIconID.show();
                }).catch((err) => {
                    console.error(err);
                });
            }
        }
        hideGameIcon() {
            if (this.gameIconID) {
                this.gameIconID.hide();
            }
        }
        showGamePortal() {
            if (this.gamePortal) {
                this.gamePortal.load().then(() => {
                    this.gamePortal.show();
                }).catch((err) => {
                    console.error(err);
                });
            }
        }
        async loginAsync() {
            return new Promise((resolve, reject) => {
                this.login((res) => {
                    resolve(res);
                });
            });
        }
        async getUserInfoAsync() {
            return new Promise((resolve, reject) => {
                this.checkUserInfo((res) => {
                    resolve(res);
                });
            });
        }
        async shareAsync() {
            return new Promise((resolve, reject) => {
                this.share((isOk) => {
                    resolve(isOk);
                });
            });
        }
        share(callback) {
            this.isOnShare = true;
            this.shareCallback = callback;
            this.shareStartTime = Date.now();
            var object = {
                title: AppConfig.shareTitle,
                imageUrl: AppConfig.shareImage,
            };
            wx["shareAppMessage"](object);
        }
        postMessage(message) {
            wx["getOpenDataContext"]().postMessage(message);
        }
        login(callback) {
            let obj = {};
            obj.success = (res) => {
                if (res.code) {
                    Log.l('获取Code成功 Code = ' + res.code, "QQMiniSDK");
                    let url = AppConfig.phpRoot + "api.php?cmd=10000&code=" + res.code;
                    let xhr = new Laya.HttpRequest();
                    xhr.http.timeout = 10000;
                    xhr.send(url, null, "get");
                    xhr.once(Laya.Event.COMPLETE, this, (json) => {
                        let data = JSON.parse(json);
                        console.log(json);
                        if (data.code == 0) {
                            let openid = data.data.openid;
                            Log.l('OpenID获取成功:' + openid, "QQMiniSDK");
                            this._isLogin = true;
                            callback(openid);
                        }
                        else {
                            Log.l('登录失败:' + data.msg, "QQMiniSDK");
                            Message.show('登录失败:' + data.msg);
                            this._isLogin = false;
                            callback(null);
                        }
                    });
                }
                else {
                    Log.l('登录失败:' + res.msg, "QQMiniSDK");
                    this._isLogin = false;
                    Message.show('登录失败:' + res.errMsg);
                    callback(null);
                }
            };
            wx.login(obj);
        }
        async checkUserInfo(callback) {
            let paramO = {};
            paramO.withSubscriptions = true;
            paramO.success = (res) => {
                if (res.authSetting['scope.userInfo']) {
                    this.getUserInfo(callback);
                }
                else {
                    this.createLoginButtom(callback);
                }
            };
            wx.getSetting(paramO);
        }
        async getUserInfo(callback) {
            let param1 = {};
            param1.success = (res) => {
                Log.l("调用QQ接口getUserInfog成功,nickname=" + res, "QQMiniSDK");
                callback(res);
            };
            param1.fail = (res) => {
                Log.l("调用QQ接口getUserInfo失败=" + res, "QQMiniSDK");
                callback(res);
            };
            wx.getUserInfo(param1);
        }
        createLoginButtom(callback) {
            let sysInfo = wx.getSystemInfoSync();
            let wxVersion = sysInfo.SDKVersion;
            let wWidth = sysInfo.screenWidth;
            let wHeight = sysInfo.screenHeight;
            const button = wx["createUserInfoButton"]({
                type: 'text',
                text: '微信登陆',
                style: {
                    left: 0,
                    top: 0,
                    width: wWidth,
                    height: wHeight,
                    lineHeight: 40,
                    backgroundColor: '#00000000',
                    color: '#ffffff00',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });
            button.onTap((res) => {
                Log.l("授权成功=" + res.nickname, "QQMiniSDK");
                button.destroy();
                callback(res);
            });
        }
        showVideoAd(callback) {
            this.videoAdCallback = callback;
            this.videoAd.show().then(() => {
                console.log("广告显示成功");
            }).catch((err) => {
                console.log("广告组件出现问题", err);
                this.videoAd.load().then(() => {
                    console.log("手动加载成功");
                    return this.videoAd.show();
                });
            });
        }
        showInterstitialAd() {
        }
        showBoxAd() {
        }
        showBlockAd() {
        }
        isLogin() {
            return this._isLogin;
        }
    }

    var Browser = Laya.Browser;
    class TTMiniSDK {
        constructor() {
            this.isOnShare = false;
            this.shareCallback = null;
            this.shareStartTime = 0;
            this._isLogin = false;
            this._isGetUserInfo = false;
            this.videoAd = null;
            this.videoAdCallback = null;
            this.interstitialAd = null;
            this.lastInterstitialAdTime = 0;
            this.bannerAd = null;
        }
        async init() {
            wx["onShow"](() => {
                Laya.timer.scale = 1;
            });
            wx["onHide"](() => {
                Laya.timer.scale = 0;
            });
            var sys = window["tt"].getSystemInfoSync();
            if (wx["createRewardedVideoAd"]) {
                this.videoAd = wx["createRewardedVideoAd"]({ adUnitId: AppConfig.ttRewardedVideoAd });
                console.log("广告实例", this.videoAd);
                this.videoAd.onClose((res) => {
                    this.videoAdCallback(res.isEnded);
                });
                this.videoAd.onError((res) => {
                    console.error("广告加载失败", res);
                    this.videoAdCallback(false);
                });
            }
            this.interstitialAd = window["tt"].createInterstitialAd({
                adUnitId: AppConfig.ttInterstitialAd,
            });
            this.interstitialAd.onError((err) => {
                console.log(err);
            });
        }
        async loginAsync() {
            return new Promise((resolve, _) => {
                this.login((res) => {
                    resolve(res);
                });
            });
        }
        async getUserInfoAsync() {
            return new Promise((resolve, _) => {
                this.getUserInfo((res) => {
                    resolve(res);
                });
            });
        }
        async shareAsync() {
            return new Promise((resolve, _) => {
                this.share((isOk) => {
                    resolve(isOk);
                });
            });
        }
        share(callback) {
            this.isOnShare = true;
            this.shareCallback = callback;
            this.shareStartTime = Date.now();
            let object = {
                title: AppConfig.shareTitle,
                imageUrl: AppConfig.shareImage,
            };
            wx["shareAppMessage"](object);
        }
        postMessage(message) {
            wx["getOpenDataContext"]().postMessage(message);
        }
        login(callback) {
            let obj = {};
            obj.force = false;
            obj.success = (res) => {
                if (res.code) {
                    Log.l('登录成功 Code = ' + res.code, "TTMiniSDK");
                    let url = AppConfig.phpRoot + "login/TtLogin?code=" + res.code;
                    let xhr = new Laya.HttpRequest();
                    xhr.http.timeout = 10000;
                    xhr.send(url, null, "get");
                    xhr.once(Laya.Event.COMPLETE, this, (json) => {
                        let data = JSON.parse(json);
                        if (data.result == 0) {
                            let openid = data.reData.openId;
                            UserModel.getInstance().uid = openid;
                            Log.l('OpenID获取成功:' + openid, "TTMiniSDK");
                            this._isLogin = true;
                            callback(openid);
                        }
                        else {
                            Log.l('登录失败:' + data.msg, "TTMiniSDK");
                            Message.show('登录失败:' + data.msg);
                            this._isLogin = false;
                            callback(null);
                        }
                    });
                }
                else {
                    Log.l('登录失败:' + res.msg, "TTMiniSDK");
                    this._isLogin = false;
                    Message.show('登录失败:' + res.errMsg);
                    callback(null);
                }
            };
            wx.login(obj);
        }
        login2(callback) {
            let obj = {};
            obj.success = (res) => {
                if (res.code) {
                    Log.l('获取Code成功 Code = ' + res.code, "TTMiniSDK");
                    let url = AppConfig.phpRoot + "api.php?cmd=10000&code=" + res.code;
                    let xhr = new Laya.HttpRequest();
                    xhr.http.timeout = 10000;
                    xhr.send(url, null, "get");
                    xhr.once(Laya.Event.COMPLETE, this, (json) => {
                        let data = JSON.parse(json);
                        if (data.code == 0) {
                            let openid = data.data.openid;
                            Log.l('OpenID获取成功:' + openid, "TTMiniSDK");
                            this._isLogin = true;
                            callback(openid);
                        }
                        else {
                            Log.l('登录失败:' + res.msg, "TTMiniSDK");
                            Message.show('登录失败:' + res.msg);
                            this._isLogin = false;
                            callback(null);
                        }
                    });
                }
                else {
                    Log.l('登录失败:' + res.msg, "TTMiniSDK");
                    this._isLogin = false;
                    callback(null);
                }
            };
            wx.login(obj);
        }
        getUserSetting(callback) {
            Laya.Browser.window["tt"].getSetting({
                success: (res) => {
                    console.log("信息===", res);
                    this.getAuthorize(callback);
                }
            });
        }
        getAuthorize(callback) {
            Laya.Browser.window["tt"].getUserInfo({
                success: (res) => {
                    callback(res);
                },
                fail: (res) => {
                    console.log("授权信息失败", res);
                }
            });
        }
        async getUserInfo(callback) {
            let param1 = {};
            param1.success = (res) => {
                Log.l("调用微信接口getUserInfo成功,nickname=" + res, "WXMiniSDK");
                this._isGetUserInfo = true;
                callback(res);
            };
            param1.fail = (res) => {
                Log.l("调用微信接口getUserInfo失败=" + res, "WXMiniSDK");
                callback(false);
            };
            wx.getUserInfo(param1);
        }
        showVideoAd(callback) {
            this.videoAdCallback = callback;
            this.videoAd.show().then(() => {
                console.log("广告显示成功");
            }).catch((err) => {
                console.log("广告组件出现问题", err);
                this.videoAd.load().then(() => {
                    console.log("手动加载成功");
                    return this.videoAd.show();
                });
            });
        }
        showBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.show();
            }
        }
        hideBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.hide();
            }
        }
        showInterstitialAd() {
            if (Browser.now() - this.lastInterstitialAdTime < 30000) {
                console.log("插屏广告CD--", Browser.now() - this.lastInterstitialAdTime);
                return;
            }
            this.lastInterstitialAdTime = Browser.now();
            this.interstitialAd && this.interstitialAd.destory && this.interstitialAd.destory();
            this.interstitialAd = window["tt"].createInterstitialAd({
                adUnitId: AppConfig.ttInterstitialAd,
            });
            this.interstitialAd && this.interstitialAd
                .load()
                .then(() => {
                this.interstitialAd.show();
            })
                .catch((err) => {
                console.log(err);
            });
        }
        startRecorder(callback) {
            this.gameRecorderManager.start({
                duration: 300,
                isMarkOpen: true,
                locLeft: 0,
                locTop: 600,
            });
            this.gameRecorderManager.onStart((res) => {
                console.log("开始录制");
                if (callback) {
                    callback(res);
                }
            });
        }
        stopRecorder(callback) {
            this.gameRecorderManager.onStop((res) => {
                console.log("停止录制" + res.videoPath);
                this.videoPath = res.videoPath;
                if (callback) {
                    callback(res);
                }
            });
            this.gameRecorderManager.stop();
        }
        shareRecorder(callback) {
            window["tt"].shareAppMessage({
                channel: "video",
                title: AppConfig.shareTitle,
                description: "",
                extra: {
                    videoPath: this.videoPath
                },
                success: function () {
                    console.log("录屏分享成功------------------------");
                    if (callback)
                        callback(true);
                },
                fail: function () {
                    console.log("录屏分享  失败------------------------");
                    if (callback)
                        callback(false);
                }
            });
        }
        screenShot(callback) {
            window["canvas"].toTempFilePath({
                quality: 0.7,
                fileType: "png",
                destWidth: Laya.stage.width * 0.5,
                destHeight: Laya.stage.height * 0.5,
                success: function (t) {
                    if (callback) {
                        callback(t.tempFilePath);
                    }
                },
                complete: function (_) {
                }
            });
        }
        isLogin() {
            return this._isLogin;
        }
        isGetUserInfo() {
            return this._isGetUserInfo;
        }
    }

    class VVMiniSDK {
        constructor() {
            this._isLogin = false;
            this.token = "";
            this.bannerActive = false;
        }
        async init() {
            console.log("VVMiniSDK 初始化");
        }
        loginAsync() {
            return new Promise((resolve, reject) => {
                this.login((res) => {
                    resolve(res);
                });
            });
        }
        getUserInfoAsync() {
            throw new Error("Method not implemented.");
        }
        shareAsync() {
            throw new Error("Method not implemented.");
        }
        share(callback) {
            throw new Error("Method not implemented.");
        }
        showVideoAd(callback) {
        }
        login(callback) {
        }
        isLogin() {
            return this._isLogin;
        }
        showBannerAD() {
        }
        hideBannerAD() {
            this.bannerActive = false;
            this.bannerAd && this.bannerAd.hide();
        }
        showGameBannerAD() {
            if (this.gameBannerAd) {
                this.gameBannerAd.show().catch((err) => {
                    console.error(err);
                });
            }
        }
        hideGameBannerAD() {
            if (this.gameBannerAd) {
                try {
                    this.gameBannerAd.hide();
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        getToken() {
            return this.token;
        }
    }

    class WXMiniSDK {
        constructor() {
            this.isOnShare = false;
            this.shareCallback = null;
            this.shareStartTime = 0;
            this._isLogin = false;
            this.interstitialAd = null;
            this.videoAd = null;
            this.videoAdCallback = null;
            this.bannerAd = null;
            this.gridAd = null;
            this.gamePortal = null;
            this.gameIconID = null;
            this.gameBanner = null;
            this.lastInterstitialAdTime = 0;
        }
        async init() {
            wx["onShow"](() => {
                Laya.SoundManager.playMusic("res/sounds/bgm.mp3");
                Laya.timer.scale = 1;
            });
            wx["onHide"](() => {
                Laya.timer.scale = 0;
            });
            var sys = wx.getSystemInfoSync();
        }
        showGridAD() {
            this.gridAd.hide();
            this.gridAd.show().catch((err) => {
                console.error(err);
            });
        }
        hideGridAD() {
            this.gridAd.hide();
        }
        showBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.show().catch((err) => {
                    console.error(err);
                });
            }
        }
        hideBannerAD() {
            if (this.bannerAd) {
                this.bannerAd.hide().catch((err) => {
                    console.error(err);
                });
            }
        }
        showInterstitialAd() {
            if (Laya.Browser.now() - this.lastInterstitialAdTime < 30000) {
                console.log("插屏广告CD--", Laya.Browser.now() - this.lastInterstitialAdTime);
                return;
            }
            this.lastInterstitialAdTime = Laya.Browser.now() - this.lastInterstitialAdTime;
            this.interstitialAd && this.interstitialAd.destory && this.interstitialAd.destory();
            this.interstitialAd = wx['createInterstitialAd']({
                adUnitId: AppConfig.wxInterstitialAd,
            });
            this.interstitialAd && this.interstitialAd
                .load()
                .then(() => {
                this.interstitialAd.show();
            })
                .catch((err) => {
                console.log(err);
            });
        }
        async loginAsync() {
            return new Promise((resolve, reject) => {
                this.login((res) => {
                    resolve(res);
                });
            });
        }
        async getUserInfoAsync() {
            return new Promise((resolve, reject) => {
                this.checkUserInfo((res) => {
                    resolve(res);
                });
            });
        }
        async shareAsync() {
            return new Promise((resolve, reject) => {
                this.share((isOk) => {
                    resolve(isOk);
                });
            });
        }
        share(callback) {
            this.isOnShare = true;
            this.shareCallback = callback;
            this.shareStartTime = Date.now();
            var object = {
                title: AppConfig.shareTitle,
                imageUrl: AppConfig.shareImage,
                query: `inviteCode=${AppConfig.shareInviteCode}`,
            };
            wx["shareAppMessage"](object);
        }
        postMessage(message) {
            wx["getOpenDataContext"]().postMessage(message);
        }
        login(callback) {
            let obj = {};
            obj.success = (res) => {
                if (res.code) {
                    Log.l('获取Code成功 Code = ' + res.code, "WXMiniSDK");
                    let url = AppConfig.phpRoot + "login/WxLogin?code=" + res.code;
                    let xhr = new Laya.HttpRequest();
                    xhr.http.timeout = 10000;
                    xhr.send(url, null, "get");
                    xhr.once(Laya.Event.COMPLETE, this, (json) => {
                        let data = JSON.parse(json);
                        if (data.result == 0) {
                            let openid = data.reData.openId;
                            UserModel.getInstance().uid = openid;
                            Log.l('OpenID获取成功:' + openid, "WXMiniSDK");
                            this._isLogin = true;
                            callback(openid);
                        }
                        else {
                            Log.l('登录失败:' + data.msg, "WXMiniSDK");
                            Message.show('登录失败:' + data.msg);
                            this._isLogin = false;
                            callback(null);
                        }
                    });
                }
                else {
                    Log.l('登录失败:' + res.msg, "WXMiniSDK");
                    this._isLogin = false;
                    Message.show('登录失败:' + res.errMsg);
                    callback(null);
                }
            };
            wx.login(obj);
        }
        async checkUserInfo(callback) {
            let paramO = {};
            paramO.withSubscriptions = true;
            paramO.success = (res) => {
                console.log("调用微信接口getSetting成功=" + res, ",userinfo=" + res.authSetting['scope.userInfo']);
                if (res.authSetting['scope.userInfo']) {
                    this.getUserInfo(callback);
                }
                else {
                    this.createLoginButtom(callback);
                }
            };
            wx.getSetting(paramO);
        }
        async getUserInfo(callback) {
            let param1 = {};
            param1.withCredentials = true;
            param1.lang = "zh_CN";
            param1.success = (res) => {
                Log.l("调用微信接口getUserInfog成功,nickname=" + res, "WXMiniSDK");
                callback(res);
            };
            param1.fail = (res) => {
                Log.l("调用微信接口getUserInfo失败=" + res, "WXMiniSDK");
                callback(res);
            };
            wx.getUserInfo(param1);
        }
        createLoginButtom(callback) {
            let sysInfo = wx.getSystemInfoSync();
            let wxVersion = sysInfo.SDKVersion;
            let wWidth = sysInfo.screenWidth;
            let wHeight = sysInfo.screenHeight;
            const button = wx["createUserInfoButton"]({
                type: 'text',
                text: '微信登陆',
                style: {
                    left: 0,
                    top: 0,
                    width: wWidth,
                    height: wHeight,
                    lineHeight: 40,
                    backgroundColor: '#00000000',
                    color: '#ffffff00',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });
            button.onTap((res) => {
                Log.l("授权成功=" + res.nickname, "WXMiniSDK");
                button.destroy();
                callback(res);
            });
        }
        showVideoAd(callback) {
            this.videoAdCallback = callback;
            this.videoAd.show().then(() => {
                console.log("广告显示成功");
            }).catch((err) => {
                console.log("广告组件出现问题", err);
                this.videoAd.load().then(() => {
                    console.log("手动加载成功");
                    return this.videoAd.show();
                });
            });
        }
        isLogin() {
            return this._isLogin;
        }
    }

    class PlatformAdapter extends Singleton {
        constructor() {
            super();
            this.platform = null;
        }
        init() {
            Log.l("PlatformAdapter初始化...", "PlatformAdapter");
            if (Laya.Browser.onMiniGame || Laya.Browser.onTTMiniGame || Laya.Browser.onQQMiniGame) {
                if (Laya.Browser.onTTMiniGame) {
                    Log.l("当前平台为抖音小游戏");
                    window['wx'] = window['tt'];
                    this.platform = new TTMiniSDK();
                }
                else if (Laya.Browser.onMiniGame) {
                    Log.l("当前平台为微信小游戏");
                    this.platform = new WXMiniSDK();
                }
                else if (Laya.Browser.onQQMiniGame) {
                    Log.l("当前平台为QQ小游戏");
                    window['wx'] = window["qq"];
                    this.platform = new QQMiniSDK();
                }
                this.platform.init();
                if (Laya.Browser.onMiniGame) {
                }
                var sys = wx.getSystemInfoSync();
                PlatformAdapter._liuHaiHeight = Laya.stage.height / sys.windowHeight * sys.statusBarHeight + (Laya.Browser.onTTMiniGame ? 40 : 0);
                let showShareMenuObject = {
                    withShareTicket: false,
                    success: null,
                    fail: null,
                    complete: null
                };
                wx.showShareMenu(showShareMenuObject);
                wx["onShareAppMessage"](function () {
                    var myInviteId = "myInviteId=" + 0;
                    return {
                        title: AppConfig.shareTitle,
                        query: myInviteId,
                        imageUrl: AppConfig.shareImage,
                        success: function () { }
                    };
                });
            }
            else if (Laya.Browser.onVVMiniGame) {
                this.platform = new VVMiniSDK();
                this.platform.init();
            }
        }
        getCode(callback) {
            if (Laya.Browser.onMiniGame || Laya.Browser.onQQMiniGame) {
                let obj = {};
                obj.success = (res) => {
                    if (res.code) {
                        callback(res.code);
                    }
                    else {
                        MessageBox.show('登录失败:' + res.errMsg, "确定");
                    }
                };
                wx.login(obj);
            }
            else {
                callback(0);
            }
        }
        async login() {
            if (Laya.Browser.onQGMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onTTMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                let openid = await this.platform.loginAsync();
                let nickname = await this.platform.loginAsync();
                let avatar = await this.platform.loginAsync();
            }
            else {
            }
        }
        async loginInGame(callback = null) {
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                sdk.login2((openid) => {
                    if (openid == null || openid == "" || openid == undefined) {
                        if (callback)
                            callback(false);
                        return;
                    }
                    callback(true);
                });
            }
        }
        checkSession(callback) {
            var obj = {};
            obj.success = function () {
                callback(true);
            };
            obj.fail = function () {
                callback(false);
            };
            wx.checkSession(obj);
        }
        getUserInfo(callback = null) {
            if (Laya.Browser.onMiniGame) {
                this.platform.checkUserInfo((info) => {
                    callback(info);
                });
            }
            else if (Laya.Browser.onTTMiniGame) {
                this.platform.getUserSetting((info) => {
                    callback(info);
                });
            }
        }
        updateInfiniteModeScore(num) {
            if (Laya.Browser.onMiniGame) {
                wx["getOpenDataContext"]().postMessage({
                    type: "InfiniteMode1",
                    value: num
                });
            }
        }
        openOpenDataView() {
            if (Laya.Browser.onMiniGame) {
                wx["getOpenDataContext"]().postMessage({
                    type: "Open",
                });
            }
        }
        shareAppMessage(callback) {
            if (Laya.Browser.onMiniGame || Laya.Browser.onTTMiniGame) {
                this.platform.share((isOk) => {
                    if (isOk) {
                        callback(true);
                        console.log("分享成功");
                    }
                    else {
                        console.log("分享失败");
                        PlatformAdapter.ShowDialog("提示", "分享失败，无法获取奖励!", () => {
                            PlatformAdapter.getInstance().shareAppMessage(callback);
                        }, () => {
                            callback(false);
                            console.log("分享失败3");
                        }, "再次分享", "残忍拒绝", true);
                    }
                });
            }
            else {
                console.log("分享失败2");
                callback(true);
            }
        }
        getLaunchOptionsSync() {
            if (Laya.Browser.onMiniGame) {
                return wx["getLaunchOptionsSync"]();
            }
            else {
                return null;
            }
        }
        static getLiuHaiHeight() {
            return this._liuHaiHeight;
        }
        static ShowDialog(title, content, confirm, cancel, confirmText = "确定", cancelText = "取消", showCancel = true) {
            if (Laya.Browser.onMiniGame || Laya.Browser.onTTMiniGame) {
                var obj = {
                    title: title,
                    content: content,
                    confirmText: confirmText,
                    cancelText: cancelText,
                    showCancel: showCancel,
                    success(res) {
                        if (res.confirm) {
                            confirm();
                        }
                        else if (res.cancel) {
                            cancel();
                        }
                    }
                };
                wx.showModal(obj);
            }
        }
        showVideoAd(callback) {
            if (ClickUtil.isFastClick()) {
                return;
            }
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                this.platform.showVideoAd(callback);
            }
            else {
                Message.show("当前平台不支持广告");
                callback(true);
                console.log("当前平台不支持广告");
            }
        }
        showGridAd() {
            if (Laya.Browser.onMiniGame) {
                let p = this.platform;
                p.showGridAD();
            }
            else {
                console.log("当前平台不支持广告");
            }
        }
        hideGridAd() {
            if (Laya.Browser.onMiniGame) {
                let p = this.platform;
                p.hideGridAD();
            }
            else {
                console.log("当前平台不支持广告");
            }
        }
        showBanner() {
            if (Laya.Browser.onVVMiniGame || Laya.Browser.onKGMiniGame || Laya.Browser.onMiniGame) {
                let pt = this.platform;
                pt.showBannerAD();
            }
            else {
                console.log("当前平台不支持广告");
            }
        }
        hideBanner() {
            if (Laya.Browser.onVVMiniGame || Laya.Browser.onKGMiniGame || Laya.Browser.onMiniGame) {
                let pt = this.platform;
                pt.hideBannerAD();
            }
            else {
                console.log("当前平台不支持广告");
            }
        }
        showGameBannerAD() {
            if (Laya.Browser.onQGMiniGame) {
                let pt = this.platform;
                pt.showGameBannerAD();
            }
            else {
                console.log("当前平台不支持互推广告");
            }
        }
        hideGameBannerAD() {
            if (Laya.Browser.onQGMiniGame) {
                let pt = this.platform;
                pt.hideGameBannerAD();
            }
            else {
                console.log("当前平台不支持互推广告");
            }
        }
        showInterstitial() {
            if (Laya.Browser.onTTMiniGame) {
                this.platform["showInterstitialAd"]();
            }
            else if (Laya.Browser.onMiniGame) {
                let pt = this.platform;
                pt.showInterstitialAd();
            }
            else if (Laya.Browser.onQQMiniGame) {
                this.platform["showInterstitialAd"]();
            }
            else if (Laya.Browser.onTTMiniGame) {
                let pt = this.platform;
                pt.showInterstitialAd();
            }
            else {
                console.log("当前平台不支持插屏广告");
            }
        }
        showGamePortal() {
            if (Laya.Browser.onMiniGame) {
                this.platform["showGamePortal"]();
            }
            else {
                console.log("当前平台不支持浮层样式广告");
            }
        }
        startRecorder(callback) {
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                sdk.startRecorder(callback);
            }
            else {
                Log.w("该平台不支持录制", "PlatformAdapter");
            }
        }
        stopRecorder(callback) {
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                sdk.stopRecorder(callback);
            }
            else {
                Log.w("该平台不支持录制", "PlatformAdapter");
            }
        }
        shareRecorder(callback) {
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                sdk.shareRecorder(callback);
            }
            else {
                Log.w("该平台不支持录制", "PlatformAdapter");
            }
        }
        screenShot(callback) {
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                sdk.screenShot(callback);
            }
            else {
                Log.w("该平台不支持截屏", "PlatformAdapter");
            }
        }
        isLogin() {
            let isLogin;
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                isLogin = sdk.isLogin();
            }
            else {
                isLogin = true;
            }
            console.log("获取登录状态", isLogin);
            return isLogin;
        }
        isGetUserInfo() {
            let isGetUserInfo;
            if (Laya.Browser.onTTMiniGame) {
                let sdk = this.platform;
                isGetUserInfo = sdk.isGetUserInfo();
            }
            else {
                isGetUserInfo = true;
            }
            console.log("获取用户信息状态", isGetUserInfo);
            return isGetUserInfo;
        }
        canvasToPhotosAlbum(caller = null, success = null) {
            if (Laya.Browser.onQGMiniGame) {
                let qg = Laya.Browser.window.qg;
                if (qg) {
                    let c = Laya.Browser.window.__canvas;
                    c.toTempFilePath({
                        success: function (res) {
                            if (!res) {
                                return;
                            }
                            if (!res.tempFilePath) {
                                return;
                            }
                            if (res.tempFilePath.length < 5) {
                                return;
                            }
                            qg.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: function () {
                                    if (success) {
                                        success.call(caller);
                                    }
                                },
                                fail: function () {
                                }
                            });
                        }
                    });
                }
            }
            else if (Laya.Browser.onTTMiniGame) {
                let tt = Laya.Browser.window.tt;
                Laya.Browser.window.canvas.toTempFilePath({
                    success: function (res) {
                        if (!res) {
                            return;
                        }
                        if (!res.tempFilePath) {
                            return;
                        }
                        if (res.tempFilePath.length < 5) {
                            return;
                        }
                        tt.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: function () {
                                if (success) {
                                    success.call(caller);
                                    console.log("保存成功");
                                }
                            },
                            fail: function () {
                            }
                        });
                    }
                });
            }
            else {
                return;
            }
        }
        installShortcut(callback = null) {
            if (Laya.Browser.onQGMiniGame) {
                let qg = Laya.Browser.window.qg;
                qg.hasShortcutInstalled({
                    success: function (res) {
                        if (res == false) {
                            qg.installShortcut({
                                success: function () {
                                    callback(true);
                                },
                                fail: function (err) {
                                    Message.show("创建图标失败");
                                    callback(false);
                                },
                                complete: function () { }
                            });
                        }
                        else {
                            Message.show("桌面图标已存在");
                            callback(false);
                        }
                    },
                    fail: function (err) { },
                    complete: function () { }
                });
            }
        }
        getToken() {
            if (Laya.Browser.onQGMiniGame) {
                let token = this.platform.getToken();
                return token;
            }
            else {
                Message.show("当前平台不支持 token");
            }
        }
        showGamePortalAd() {
            if (Laya.Browser.onQGMiniGame) {
                let sdk = this.platform;
                sdk.showGamePortalAd();
            }
        }
        spendYuanbao(callback) {
            if (ClickUtil.isFastClick()) {
                return;
            }
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                return;
            }
            else {
            }
        }
    }
    PlatformAdapter._liuHaiHeight = 0;

    class TweenUtil {
        static async toAsync(target, props, duration, ease = null, delay = 0, coverBefore = false, autoRecover = true) {
            return new Promise((resolve, reject) => {
                Laya.Tween.to(target, props, duration, ease, Laya.Handler.create(this, function () {
                    resolve(null);
                }), delay, coverBefore, autoRecover);
            });
        }
        static async fromAsync(target, props, duration, ease = null, delay = 0, coverBefore = false, autoRecover = true) {
            return new Promise((resolve, reject) => {
                Laya.Tween.from(target, props, duration, ease, Laya.Handler.create(this, function () {
                    resolve(null);
                }), delay, coverBefore, autoRecover);
            });
        }
        static async delay(target, time) {
            return new Promise((resolve, reject) => {
                Laya.timer.once(time, target, () => resolve(null));
            });
        }
        static easeJump(start, end, current, t) {
        }
        static async moveAsync(target, props, duration = 400, ease = null, delay = 0, coverBefore = false, autoRecover = true) {
            return new Promise((resolve, reject) => {
                Laya.Tween.to(target, props, duration, ease, Laya.Handler.create(this, function () {
                    resolve(null);
                }), delay, coverBefore, autoRecover);
            });
        }
    }

    class UIBaseCtl {
        constructor() {
            this._isLoadFinish = false;
            this._isLoading = false;
            this._uiLayer = LayerMgr.LAYER_DIALOG;
            this.gameDispatcher = GameDispatcher.getInstance();
        }
        get view() {
            return this._view;
        }
        onPreLoad() { }
        onLoad() { }
        onShow(argc) { }
        onHide() { }
        onAdapter(w, h) { }
        preloading(callback) {
            this._preloadingCallback = callback;
            this.load(false, null);
        }
        show(argc = null) {
            if (this._isLoadFinish == false) {
                if (this._isLoading) {
                    return;
                }
                this.load(true, argc);
                this._isLoading = true;
            }
            else {
                this.view.zOrder = UIMgr.getNextLayerZOrder(this._uiLayer);
                this.view.visible = true;
                this.onSizeChange();
                this.onUIEvent();
                this.onShow(argc);
            }
        }
        hide() {
            this.view.visible = false;
            this.offUIEvent();
            this.onHide();
        }
        destroy() {
            this.offUIEvent();
            this.destroy();
        }
        load(isShowView = false, argc) {
            this.onPreLoad();
            let urls = this.uiResList();
            if (urls.length == 0) {
                this.loadComplete(isShowView, argc);
            }
            else {
                Laya.loader.load(this.uiResList(), Laya.Handler.create(this, this.loadComplete, [isShowView, argc]));
            }
        }
        loadComplete(isShowView, argc) {
            let layer = LayerMgr.getLayer(this._uiLayer);
            let clazz = this.uiView();
            this._view = new clazz();
            layer.addChild(this._view);
            this._isLoadFinish = true;
            this.onLoad();
            this.onSizeChange();
            if (isShowView) {
                this.show(argc);
            }
            else {
                this._view.zOrder = 0;
                this._view.visible = false;
            }
            if (this._preloadingCallback) {
                this._preloadingCallback();
            }
        }
        openUI(name, argc = null) {
            UIMgr.show(name, argc);
        }
        jumpToUI(name, argc = null) {
            this.hide();
            UIMgr.show(name, argc);
        }
        onUIEvent() {
            Laya.stage.on(Laya.Event.RESIZE, this, this.onSizeChange);
            let list = this.uiEventList();
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                item[0].on(item[1], this, item[2], item[3]);
            }
        }
        offUIEvent() {
            Laya.stage.off(Laya.Event.RESIZE, this, this.onSizeChange);
            let list = this.uiEventList();
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                item[0].off(item[1], this, item[2]);
            }
        }
        onSizeChange() {
            let width = Laya.stage.width;
            let height = Laya.stage.height;
            this.view.width = width;
            this.view.height = height;
            this.onAdapter(width, height);
        }
        async playAnimationOpen() {
            this.view.x = 720;
            Laya.Tween.clearAll(this.view);
            TweenUtil.moveAsync(this.view, { x: 0 });
        }
        async playAnimationClose() {
            Laya.Tween.clearAll(this.view);
            await TweenUtil.moveAsync(this.view, { x: 720 });
            this.hide();
        }
        setUILayer(layer) {
            this._uiLayer = layer;
        }
        enableBlur(enable = true) {
            return;
        }
    }

    class BGMHelper {
        static play(path) {
            if (path == this.current) {
                return;
            }
            if (!path || path == "") {
                this.stop();
            }
            else {
                this.current = path;
                Laya.SoundManager.playMusic(path, 0);
            }
        }
        static stop() {
            this.current = "";
            Laya.SoundManager.stopMusic();
        }
        static playHomeBgm() {
            this.play("res/sounds/bgm_home.mp3");
        }
    }
    BGMHelper.current = "";

    class UIAdapterUtil {
        static getScaleFix() {
            let w = Laya.stage.width;
            let h = Laya.stage.height;
            if (w / h > 750 / 1334) {
                return (750 / 1334) / (w / h);
            }
            else {
                return 1;
            }
        }
        static levelFullFix(sp) {
            let s = this.getScaleFix();
            sp.scale(s, s);
            let x = Laya.stage.width / 2 - (sp.width / 2 * s);
            let y = Laya.stage.height / 2 - (sp.height / 2 * s);
            sp.pos(x, y);
        }
    }

    class UIGameCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnReturn, Laya.Event.CLICK, this.onBtnReturn, null],
                [this.view.btnTips, Laya.Event.CLICK, this.onBtnTips, null],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onBtnAddKey, null],
                [this.view.btnSkip, Laya.Event.CLICK, this.onBtnSkip, null],
                [this.view.btnRemake, Laya.Event.CLICK, this.onBtnRemake, null],
                [GameDispatcher.getInstance(), EventName.USER_UPDATE, this.upData, null],
                [GameDispatcher.getInstance(), EventName.GAME_WIN, this.onGameWin, null],
                [GameDispatcher.getInstance(), EventName.GAME_CLICK_TIP, this.showErrorTip, null],
                [GameDispatcher.getInstance(), EventName.GAME_SHOW_CORRECT, this.showCorrect, null],
                [GameDispatcher.getInstance(), EventName.GAME_REMAKE, this.onBtnRemake, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/comm.atlas",
                "res/atlas/res/ui/game.atlas",
            ];
        }
        uiView() {
            return ui.view.game.GameUI;
        }
        onPreLoad() {
            this.setUILayer(LayerMgr.LAYER_MAIN);
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.level.scale(s, s);
            this.level.pos(w / 2, h * 0.51);
            this.view.topbtn.scale(s, s);
            this.view.topbtn.pos(w / 2, h * 0.072);
        }
        onLoad() {
            this.level = this.view.level;
        }
        onShow(lv = null) {
            console.log(this.level.width, this.level.height);
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.view.correct.visible = false;
            this.view.error.visible = false;
            this.view.clickTips.visible = false;
            lv && console.log(`目前为第${lv}关`);
            this.view.keyNum.text = UserModel.getInstance().key + "";
            this.view.levelNumber.text = `关卡${lv}`;
            if (lv > UserModel.getInstance().unlockLevel) {
                UserModel.getInstance().unlockLevel = lv;
            }
            this.upData();
            this.playBtnAddKeyAnim();
            this.cfg = ConfigManager.GetConfigByKey(CfgLevel, lv);
            this.view.txtDesc.text = this.cfg.title;
            Game.currnetLevelName = this.cfg.name;
            Game.currentLevelIndex = LevelHelp.getLevelIndex(lv);
            UserModel.getInstance().lastOpenLv = lv;
            Game.currentGameType = 1;
            Game.currentLevelID = lv;
            Game.hasAnswer = UserModel.getInstance().answerList.includes(lv);
            Game.hasTips = UserModel.getInstance().tipsList.includes(lv);
            Laya.SoundManager.playMusic("res/sounds/gamebgm.mp3");
            this.level.uninstallLevel();
            this.level.loadLevel(lv);
        }
        onHide() {
            this.level.uninstallLevel();
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.animTimer.clearAll(this);
            this.animTween.clear();
            this.view.btnTips.scale(1, 1);
            this.view.clickTips.visible = false;
        }
        onBtnReturn() {
            console.log("返回");
            this.hide();
            SoundHelper.clickClose();
            UIMgr.show(UIDefine.UILvSelectCtl);
        }
        upData() {
            let statusLv = UserModel.getInstance().lv;
            this.view.keyNum.text = UserModel.getInstance().key + "";
            this.view.lv.text = "Lv" + UserModel.getInstance().lv;
            this.view.avatar.skin = `res/ui/game/avatar/avatar${statusLv}.png`;
        }
        onBtnTips() {
            SoundHelper.clickClose();
            let key = UserModel.getInstance().key;
            console.log(key);
            if (key >= 1) {
                UserModel.getInstance().key -= 1;
                UIMgr.show(UIDefine.UIGameTipsCtl);
            }
            else {
                Message.show("钥匙不足，无法查看提示");
            }
        }
        showErrorTip(num, pos) {
            if (this.newTween) {
                this.newTween.clear();
            }
            if (this.newTimer) {
                this.newTimer.clearAll(this);
            }
            this.newTween = new Laya.Tween();
            this.newTimer = new Laya.Timer();
            if (num == 0) {
                Laya.SoundManager.playSound("res/sounds/correct.mp3");
                this.view.correct.scale(0, 0);
                this.view.correct.visible = true;
                this.view.correct.pos(pos.x, pos.y);
                this.newTween.to(this.view.correct, { scaleX: 1, scaleY: 1 }, 200);
            }
            else {
                Laya.SoundManager.playSound("res/sounds/error.mp3");
                this.view.error.scale(0, 0);
                this.view.error.visible = true;
                this.view.error.pos(pos.x, pos.y);
                this.newTween.to(this.view.error, { scaleX: 1, scaleY: 1 }, 200);
                this.newTimer.once(200, this, () => {
                    this.newTween.to(this.view.error, { scaleX: 0, scaleY: 0 }, 200);
                });
            }
        }
        showCorrect(X, Y) {
            if (this.newTween) {
                this.newTween.clear();
            }
            Laya.SoundManager.playSound("res/sounds/correct.mp3");
            this.newTween = new Laya.Tween();
            this.view.correct.scale(0, 0);
            this.view.correct.pos(X, Y);
            this.view.correct.visible = true;
            this.newTween.to(this.view.correct, { scaleX: 1, scaleY: 1 }, 200);
        }
        onBtnAddKey() {
            SoundHelper.clickClose();
            this.view.btnAddKey.scale(1, 1);
            UIMgr.show(UIDefine.UIGameStoreCtl);
        }
        onBtnSkip() {
            SoundHelper.clickClose();
            UIMgr.show(UIDefine.UIGameSkipCtl);
        }
        onShowImage(path, scale, time = 0) {
            this.level.showIamge(path, scale, time);
        }
        onLevelLoadFinish(levelBase) {
            BGMHelper.play(levelBase.getBGM());
        }
        onGameWin() {
            console.log(Game.currentLevel.cfg.id);
            UserModel.getInstance().pass(Game.currentLevel.cfg.id);
            Laya.timer.once(2000, this, () => {
                UIMgr.show(UIDefine.UIGameWinCtl);
            });
        }
        onBtnRemake() {
            this.hide();
            SoundHelper.clickClose();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIGameCtl, Game.currentLevelID);
        }
        playBtnAddKeyAnim() {
            this.animCount = 0;
            this.view.btnTips.scale(1, 1);
            if (this.animTween) {
                this.animTween.clear();
            }
            if (this.animTimer) {
                this.animTimer.clearAll(this);
            }
            this.animTween = new Laya.Tween();
            this.animTimer = new Laya.Timer();
            this.animTimer.loop(400, this, () => {
                this.view.btnAddKey.scale(1, 1);
                this.animTween.to(this.view.btnAddKey, { scaleX: 0.85, scaleY: 0.85 }, 200);
                this.animTimer.once(200, this, () => {
                    this.animTween.to(this.view.btnAddKey, { scaleX: 1, scaleY: 1 }, 200);
                });
            });
            Laya.timer.loop(1000, this, () => {
                this.view.btnTips.scale(1, 1);
                Laya.Tween.to(this.view.btnTips, { scaleX: 1.2, scaleY: 1.2 }, 500);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(this.view.btnTips, { scaleX: 1, scaleY: 1 }, 500);
                    this.animCount++;
                    if (this.animCount === 10) {
                        this.showClickTips();
                    }
                });
            });
        }
        showClickTips() {
            this.view.clickTips.visible = true;
            Laya.Tween.to(this.view.clickTips, { scaleX: 1.2, scaleY: 1.2 }, 500);
            Laya.timer.once(500, this, () => {
                Laya.Tween.to(this.view.clickTips, { scaleX: 1, scaleY: 1 }, 500);
            });
            Laya.timer.loop(1000, this, () => {
                this.view.clickTips.scale(1, 1);
                Laya.Tween.to(this.view.clickTips, { scaleX: 1.2, scaleY: 1.2 }, 500);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(this.view.clickTips, { scaleX: 1, scaleY: 1 }, 500);
                });
            });
        }
    }

    class LoadingView extends ui.view.LoadingUI {
        constructor() {
            super();
            this.isOpen = false;
            this.init();
        }
        static progress(p, msg = "") {
            if (this.view == null) {
                this.view = new LoadingView();
                LayerMgr.getLayer(LayerMgr.LAYER_TIPS).addChild(this.view);
            }
            this.view.setProgress(p, msg);
        }
        init() {
            this.resize();
            Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
        }
        setProgress(p, msg = "") {
            if (p == 100) {
                this.isOpen = false;
                Laya.Dialog.lock(false);
                LoadingView.view.close();
            }
            else {
                if (this.isOpen == false) {
                    this.isOpen = true;
                    Laya.Dialog.lock(true);
                    LoadingView.view.show(false, false);
                }
                let pw = this.bar.width * p / 100;
                this.progressMask.width = pw;
                this.txtDesc.text = `${p}%`;
            }
        }
        resize() {
            this.height = Laya.stage.height;
            this.width = Laya.stage.width;
        }
    }
    LoadingView.view = null;

    class UILoginCtl extends UIBaseCtl {
        uiEventList() {
            return [];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/login.atlas"
            ];
        }
        uiView() {
            return ui.view.LoginUI;
        }
        onLoad() {
        }
        onShow(args) {
        }
    }

    class HouseModel extends Singleton {
        constructor() {
            super();
            this.House = {
                1: ["res/ui/main/house/house_1.png"],
                2: ["res/ui/main/house/house_2.png"],
                3: ["res/ui/main/house/house_3.png"],
                4: ["res/ui/main/house/house_4.png"],
                5: ["res/ui/main/house/house_5.png"]
            };
            this.mySchool = [
                { lvNum: 1, schoolName: "幼儿园", level: 0 },
                { lvNum: 2, schoolName: "学前班", level: 8 },
                { lvNum: 3, schoolName: "阳光小学", level: 28 },
                { lvNum: 4, schoolName: "活力初中", level: 58 },
                { lvNum: 5, schoolName: "青春高中", level: 88 }
            ];
            this.status = {
                1: ["小宝宝"],
                2: ["小鬼头"],
                3: ["呆萌小弟弟"],
                4: ["开窍小学生"],
                5: ["机灵初中生"]
            };
            this.myDev = [
                { lvNum: 1, myName: "小宝宝", level: 0 },
                { lvNum: 2, myName: "小鬼头", level: 5 },
                { lvNum: 3, myName: "呆萌小弟弟", level: 15 },
                { lvNum: 4, myName: "开窍小学生", level: 45 },
                { lvNum: 5, myName: "机灵初中生", level: 75 }
            ];
            this.FamedMen = [
                { name: "牛顿", level: 0, watchAd: true, imgName: "001" },
                { name: "爱因斯坦", level: 13, watchAd: false, imgName: "002" },
                { name: "霍金", level: 33, watchAd: false, imgName: "003" },
                { name: "李白", level: 0, watchAd: true, imgName: "004" },
                { name: "武松", level: 53, watchAd: false, imgName: "005" },
                { name: "成吉思汗", level: 0, watchAd: true, imgName: "006" },
                { name: "拿破仑", level: 63, watchAd: false, imgName: "007" }
            ];
        }
        init() {
        }
        getLv(num) {
            let houseLvList = [0, 8, 28, 58, 88];
            let statusLvList = [0, 5, 15, 45, 75];
            let unlockList = UserModel.getInstance().unlockLevelList.length;
            if (num == 0) {
                if (unlockList !== 0 && unlockList !== 1) {
                    for (let i = 0; i < houseLvList.length; i++) {
                        if (UserModel.getInstance().unlockLevelList.length < houseLvList[i] && i !== 0) {
                            let nextLv = houseLvList[i];
                            return [nextLv, i + 1];
                        }
                    }
                }
                else {
                    return [this.mySchool[1].level, 2];
                }
            }
            else {
                if (unlockList !== 0 && unlockList !== 1) {
                    for (let i = 0; i < statusLvList.length; i++) {
                        if (unlockList < statusLvList[i] && i !== 0) {
                            let nextLv = statusLvList[i];
                            return [nextLv, i + 1];
                        }
                    }
                    return [statusLvList[statusLvList.length - 1], statusLvList.length];
                }
                else {
                    return [this.myDev[1].level, 2];
                }
            }
        }
    }
    HouseModel.lvList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71, 75, 81, 82, 83, 84, 85, 86, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];

    class celebHelp {
        static showCeleb(name) {
            let FamedMen = HouseModel.getInstance().FamedMen;
            let foundHouse = FamedMen.find(item => item.name === name);
            if (foundHouse !== -1) {
                console.log(foundHouse);
                UserModel.getInstance().showCelebList.push(foundHouse);
                UserModel.getInstance().showCelebList = UserModel.getInstance().showCelebList;
                GameDispatcher.getInstance().event(EventName.MAIN_SHOW_NEW_CELEB, [foundHouse]);
            }
            else {
                console.log("未找到对应人物名字");
            }
        }
    }

    class UIMainCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.LastGushi = 0;
        }
        uiEventList() {
            return [
                [this.view.btnStart, Laya.Event.CLICK, this.onBtnStart, null],
                [this.view.btnReceive, Laya.Event.CLICK, this.turnTable, null],
                [this.view.btnCeleb, Laya.Event.CLICK, this.onBtnCeleb, null],
                [this.view.btnLvSelect, Laya.Event.CLICK, this.onBtnLvSelect, null],
                [this.view.btnHouseName, Laya.Event.CLICK, this.onBtnHouseName, null],
                [this.view.btnStatus, Laya.Event.CLICK, this.onBtnStatus, null],
                [this.view.btnLv, Laya.Event.CLICK, this.onBtnStatus, null],
                [this.view.btnSound, Laya.Event.CLICK, this.onBtnSound, null],
                [this.view.btnCecruit, Laya.Event.CLICK, this.onClickBtnCecruit, null],
                [this.view.btnUpHouse, Laya.Event.CLICK, this.onClickBtnUpHouse, null],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onBtnAddKey, null],
                [GameDispatcher.getInstance(), EventName.LIFE, this.updateUserInfo, null],
                [GameDispatcher.getInstance(), EventName.yuanbao, this.updateUserInfo, null],
                [GameDispatcher.getInstance(), EventName.status, this.updateUserInfo, null],
                [GameDispatcher.getInstance(), EventName.HOUSE, this.updateUserInfo, null],
                [GameDispatcher.getInstance(), EventName.MAIN_SHOW_NEW_CELEB, this.showNewCeleb, null],
                [GameDispatcher.getInstance(), EventName.MAIN_REFRESH_CELEB, this.refreshShowCeleb, null],
                [GameDispatcher.getInstance(), EventName.USER_UPDATE, this.upData, null],
            ];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.MainUI;
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.view.content.scale(s, s);
        }
        onLoad() {
            this.timer2 = new Laya.Timer();
            this.timeline = new Laya.TimeLine();
            this.timeline2 = new Laya.TimeLine();
            this.showAncientPoetry();
            Laya.timer.frameOnce(30, this, () => {
                this.statusHeight = this.view.status.height;
            });
        }
        onShow() {
            this.view.keyNum.text = UserModel.getInstance().key + "";
            this.showBtnSoundSkin(UserModel.getInstance().audio);
            this.guShiTimer = new Laya.Timer();
            UserModel.getInstance().onShowSave();
            this.view.House.skin = HouseModel.getInstance().House[UserModel.getInstance().house[0]["lvNum"]] + "";
            this.view.House.visible = false;
            Laya.SoundManager.playMusic("res/sounds/bgm.mp3");
            Laya.timer.frameOnce(5, this, () => {
                this.view.House.visible = true;
            });
            Laya.timer.frameOnce(30, this, () => {
                this.trendsMan();
            });
            let nowName = HouseModel.getInstance().status[(HouseModel.getInstance().getLv(1)[1] - 1)];
            let nextName = HouseModel.getInstance().status[HouseModel.getInstance().getLv(1)[1]];
            let nextNeedLv = HouseModel.getInstance().getLv(1)[0] - UserModel.getInstance().unlockLevelList.length;
            this.view.upLvTips.text = `再过${nextNeedLv}关，可升级【${nextName}】`;
            this.view.statusName.text = nowName + "";
            this.view.prompt.visible = true;
            this.view.prompt2.visible = false;
            this.celebVisibleFalse();
            this.showBtnUpLvHouse();
            this.updateUserInfo();
            this.showBtnCecruit();
            this.upData();
            this.showStatus();
            this.showCelebBlack();
            this.onShowCelebList();
            this.ReplaceBlackCeleb();
        }
        onHide() {
            if (this.timerTip) {
                this.timerTip.clearAll(this);
                this.timerupLv.clearAll(this);
                Laya.timer.clearAll(this);
                Laya.Tween.clearAll(this);
                if (this.statusAniTimer) {
                    this.statusAniTimer.clearAll(this);
                }
                this.view.status.height = this.statusHeight;
            }
        }
        onBtnStart() {
            SoundHelper.clickClose();
            let lvList = HouseModel.lvList;
            let newLv;
            newLv = lvList[UserModel.getInstance().unlockLevelList.length];
            let nextLv = UserModel.getInstance().unlockLevel;
            this.updateUserInfo();
            this.hide();
            if (lvList[UserModel.getInstance().unlockLevelList.length]) {
                UIMgr.show(UIDefine.UIGameCtl, newLv);
            }
            else {
                UIMgr.show(UIDefine.UIGameCtl, nextLv);
            }
        }
        turnTable() {
            UIMgr.show(UIDefine.UITurntableCtl);
        }
        upData() {
            this.view.keyNum.text = UserModel.getInstance().key + "";
        }
        onBtnAddKey() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.btnAddKey, { scaleX: 0.7, scaleY: 0.7 }, 100, null, Laya.Handler.create(this, function () {
                this.view.btnAddKey.scale(1, 1);
                UIMgr.show(UIDefine.UIGameStoreCtl);
            }));
        }
        showBtnCecruit() {
            let famedMen = HouseModel.getInstance().FamedMen;
            let unlockLevelList = UserModel.getInstance().unlockLevelList;
            let celeb = UserModel.getInstance().celeb;
            for (let i = 0; i < famedMen.length; i++) {
                if (unlockLevelList.length >= famedMen[i].level && !famedMen[i].watchAd && celeb[i] === 0) {
                    console.log(famedMen[i].name + "可以升级了！");
                    this.view.btnCecruit.visible = true;
                    return;
                }
            }
        }
        onClickBtnCecruit() {
            let famedMen = HouseModel.getInstance().FamedMen;
            let unlockLevelList = UserModel.getInstance().unlockLevelList;
            let celeb = UserModel.getInstance().celeb;
            for (let i = 0; i < famedMen.length; i++) {
                if (unlockLevelList.length >= famedMen[i].level && !famedMen[i].watchAd && celeb[i] === 0) {
                    celebHelp.showCeleb(famedMen[i].name);
                    UserModel.getInstance().celeb[i] = 1;
                    UserModel.getInstance().celeb = UserModel.getInstance().celeb;
                    this.view.btnCecruit.visible = false;
                    this.showBtnCecruit();
                    this.ReplaceBlackCeleb();
                    return;
                }
            }
        }
        showNewCeleb(foundHouse) {
            let famedMen = HouseModel.getInstance().FamedMen;
            let data = famedMen.find(item => item.name === foundHouse.name);
            let imgUrl;
            if (data !== -1) {
                imgUrl = `res/ui/main/celeb/${data.imgName}.png`;
                for (let i = 0; i < 4; i++) {
                    if (this.view[`celeb_${i}`].visible) {
                        continue;
                    }
                    this.view[`celeb_${i}`].skin = imgUrl;
                    this.view[`celeb_${i}`].visible = true;
                    return;
                }
            }
        }
        celebVisibleFalse() {
            for (let i = 0; i < 4; i++) {
                this.view[`celeb_${i}`].visible = false;
            }
        }
        ReplaceBlackCeleb() {
            let FamedMen = HouseModel.getInstance().FamedMen;
            let showCelebList = UserModel.getInstance().showCelebList;
            if (showCelebList.length < 1) {
                this.view.btnCeleb.skin = `res/ui/main/celeb/002.png`;
                return;
            }
            let showCelebIndex = [];
            for (let i = 0; i < showCelebList.length; i++) {
                let findindex = FamedMen.findIndex(item => item.name === showCelebList[i].name);
                let find = FamedMen.find(item => item.name === showCelebList[i].name);
                console.log(find);
                if (findindex !== -1 && !find.watchAd) {
                    showCelebIndex.push(findindex);
                }
            }
            let max;
            if (showCelebIndex.length > 0) {
                max = Math.max(...showCelebIndex);
            }
            else {
                this.view.btnCeleb.skin = `res/ui/main/celeb/${FamedMen[1].imgName}.png`;
                return;
            }
            for (let i = max + 1; i < FamedMen.length; i++) {
                if (!FamedMen[i].watchAd) {
                    this.view.btnCeleb.skin = `res/ui/main/celeb/${FamedMen[i].imgName}.png`;
                    return;
                }
                else if (i == FamedMen.length - 1) {
                    this.view.btnCeleb.skin = `res/ui/main/celeb/${FamedMen[max].imgName}.png`;
                }
            }
        }
        showStatus() {
            let myDevModel = HouseModel.getInstance().myDev;
            let unlockList = UserModel.getInstance().unlockLevelList.length;
            let skinNum = 0;
            for (let i = 0; i < 5; i++) {
                if (unlockList >= myDevModel[i].level) {
                    skinNum++;
                }
            }
            UserModel.getInstance().lv = skinNum;
            if (this.statusAniTimer) {
                this.statusAniTimer.clear(this, () => {
                    this.view.status.skin = `res/ui/main/character/10${skinNum}.png`;
                    this.statusHeight = this.view.status.height;
                });
            }
            else {
                this.view.status.skin = `res/ui/main/character/10${skinNum}.png`;
                this.statusHeight = this.view.status.height;
            }
            this.view.statusName.text = myDevModel[skinNum - 1].myName;
            this.view.lv.text = `Lv.${skinNum}`;
        }
        trendsMan() {
            this.timer2.clearAll(this);
            this.timeline.reset();
            this.timeline2.reset();
            this.view.btnStart.scale(1, 1);
            this.timeline2.to(this.view.btnStart, { scaleX: this.view.btnStart.scaleX + 0.15, scaleY: this.view.btnStart.scaleY + 0.15 }, 750)
                .to(this.view.btnStart, { scaleX: this.view.btnStart.scaleX, scaleY: this.view.btnStart.scaleY }, 750).play();
            Laya.Tween.to(this.view.status, { height: this.view.status.height + 20 }, 1000);
            Laya.timer.once(1000, this, () => {
                Laya.Tween.to(this.view.status, { height: this.statusHeight }, 1000);
            });
            this.ani();
            this.timer2.loop(1500, this, this.ani2);
        }
        ani() {
            if (this.statusAniTimer) {
                this.statusAniTimer.clearAll(this);
            }
            this.statusAniTimer = new Laya.Timer();
            this.statusAniTimer.loop(2000, this, () => {
                this.view.status.height = this.statusHeight;
                Laya.Tween.to(this.view.status, { height: this.view.status.height + 20 }, 1000);
                Laya.timer.once(1000, this, () => {
                    Laya.Tween.to(this.view.status, { height: this.view.status.height - 20 }, 1000);
                });
            });
        }
        ani2() {
            this.timeline2.to(this.view.btnStart, { scaleX: this.view.btnStart.scaleX + 0.15, scaleY: this.view.btnStart.scaleY + 0.15 }, 750)
                .to(this.view.btnStart, { scaleX: this.view.btnStart.scaleX, scaleY: this.view.btnStart.scaleY }, 750).play();
        }
        updateUserInfo() {
            let status = UserModel.getInstance().status;
            this.view.House.skin = HouseModel.getInstance().House[UserModel.getInstance().house[UserModel.getInstance().house.length - 1]["lvNum"]] + "";
            this.view.NumberLife.text = UserModel.getInstance().life + "";
            this.view.lv.text = "Lv." + UserModel.getInstance().lv;
            this.view.houseNameTxt.text = UserModel.getInstance().house[UserModel.getInstance().house.length - 1].schoolName + "";
        }
        showAncientPoetry() {
            this.guShiTimer = new Laya.Timer();
            let apArr = [
                "少壮不努力，老大徒伤悲",
                "天行健，君子以自强不息",
                "百尺杆头须进步",
                "绳锯木断，水滴石穿",
                "千里之行，始于足下",
            ];
            let randomNumber = Math.floor(Math.random() * 5) + 0;
            this.view.promptTxt.text = apArr[randomNumber];
            this.guShiTimer.loop(4000, this, () => {
                this.view.prompt.visible = false;
                Laya.timer.once(1000, this, () => {
                    this.view.prompt.visible = true;
                    randomNumber = Math.floor(Math.random() * 5) + 0;
                    if (this.LastGushi == randomNumber) {
                        if (randomNumber < 4) {
                            randomNumber++;
                        }
                        else {
                            randomNumber--;
                        }
                    }
                    this.LastGushi = randomNumber;
                    this.view.promptTxt.text = apArr[randomNumber];
                });
            });
        }
        onBtnCeleb() {
            SoundHelper.clickClose();
            UIMgr.show(UIDefine.UICelebrityCtl);
        }
        onBtnLvSelect() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.btnLvSelect, { scaleX: 0.8, scaleY: 0.8 }, 200, null, Laya.Handler.create(this, function () {
                Laya.Tween.to(this.view.btnLvSelect, { scaleX: 1, scaleY: 1 }, 200);
                UIMgr.show(UIDefine.UILvSelectCtl);
                this.hide();
            }));
        }
        onBtnHouseName() {
            SoundHelper.clickClose();
            UIMgr.show(UIDefine.UIMySchoolCtl);
            Laya.Tween.to(this.view.btnHouseName, { scaleX: 0.8, scaleY: 0.8 }, 200, null, Laya.Handler.create(this, function () {
                Laya.Tween.to(this.view.btnHouseName, { scaleX: 1, scaleY: 1 }, 200);
            }));
        }
        onBtnStatus() {
            SoundHelper.clickClose();
            UIMgr.show(UIDefine.UIMyDevCtl);
            Laya.Tween.to(this.view.btnStatus, { scaleX: 0.8, scaleY: 0.8 }, 200, null, Laya.Handler.create(this, function () {
                Laya.Tween.to(this.view.btnStatus, { scaleX: 1, scaleY: 1 }, 200);
            }));
        }
        onBtnSound() {
            SoundHelper.clickClose();
            AudioMgr.isOpenAll = !AudioMgr.isOpenAll;
            this.view.btnSound.skin = (this.view.btnSound.skin == "res/ui/main/sound_1.png" ? "res/ui/main/sound.png" : "res/ui/main/sound_1.png");
        }
        showBtnSoundSkin(bool) {
            this.view.btnSound.skin = (bool ? "res/ui/main/sound.png" : "res/ui/main/sound_1.png");
        }
        showBtnUpLvHouse() {
            let houseModel = HouseModel.getInstance().mySchool;
            for (let i = 0; i < 4; i++) {
                if (UserModel.getInstance().unlockLevelList.length >= houseModel[i + 1].level
                    && UserModel.getInstance().house[UserModel.getInstance().house.length - 1]["lvNum"] < HouseModel.getInstance().mySchool[i + 1].lvNum) {
                    this.view.btnUpHouse.visible = true;
                    this.playAnimBtnHouse();
                    return;
                }
            }
        }
        onClickBtnUpHouse() {
            SoundHelper.clickClose();
            if ((UserModel.getInstance().house.length - 1) >= 5) {
                Message.show("学校已经满级！");
                return;
            }
            let upshSchool = HouseModel.getInstance().mySchool[UserModel.getInstance().house[UserModel.getInstance().house.length - 1]["lvNum"]];
            UserModel.getInstance().house.push(upshSchool);
            UserModel.getInstance().house = UserModel.getInstance().house;
            this.updateUserInfo();
            this.view.btnUpHouse.visible = false;
            this.showBtnUpLvHouse();
        }
        playAnimBtnHouse() {
            if (this.timerTip) {
                this.timerTip.clearAll(this);
                this.timerupLv.clearAll(this);
            }
            this.timerTip = new Laya.Timer();
            this.timerupLv = new Laya.Timer();
            Laya.Tween.to(this.view.clickTip, { scaleX: 1.5, scaleY: 1.5 }, 500);
            Laya.timer.once(500, this, () => {
                Laya.Tween.to(this.view.clickTip, { scaleX: 1, scaleY: 1 }, 500);
            });
            this.timerTip.loop(1000, this, () => {
                Laya.Tween.to(this.view.clickTip, { scaleX: 1.5, scaleY: 1.5 }, 500);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(this.view.clickTip, { scaleX: 1, scaleY: 1 }, 500);
                });
            });
            Laya.Tween.to(this.view.upLv, { y: 0 }, 500);
            Laya.timer.once(500, this, () => {
                Laya.Tween.to(this.view.upLv, { y: 48 }, 500);
            });
            this.timerupLv.loop(1000, this, () => {
                Laya.Tween.to(this.view.upLv, { y: 0 }, 500);
                Laya.timer.once(500, this, () => {
                    Laya.Tween.to(this.view.upLv, { y: 48 }, 500);
                });
            });
        }
        onShowCelebList() {
            let showCelebList = UserModel.getInstance().showCelebList;
            if (showCelebList.length < 0) {
                return;
            }
            for (let i = 0; i < showCelebList.length; i++) {
                this.showNewCeleb(showCelebList[i]);
            }
        }
        refreshShowCeleb() {
            this.celebVisibleFalse();
            this.onShowCelebList();
        }
        showCelebBlack() {
            var colorMatrix = [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 1, 0,
            ];
            var blackFilter = new Laya.ColorFilter(colorMatrix);
            this.view.btnCeleb.filters = [blackFilter];
        }
    }

    class UIGameSettingCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnExit, Laya.Event.CLICK, this.onbtnExit, null],
                [this.view.btnReplay, Laya.Event.CLICK, this.onbtnReplay, null],
            ];
        }
        uiResList() {
            return [];
        }
        onAdapter(w, h) {
            let sfix = UIAdapterUtil.getScaleFix();
            this.view.content.scale(sfix, sfix);
        }
        uiView() {
            return ui.view.setting.GameSettingUI;
        }
        onShow(argc) {
            PlatformAdapter.getInstance().showInterstitial();
        }
        onHide() {
            PlatformAdapter.getInstance().hideBanner();
        }
        onbtnExit() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIMainCtl);
        }
        onbtnReplay() {
        }
    }

    class UIMainLifeCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnWatchAD, Laya.Event.CLICK, this.onbtnWatchAD, null],
            ];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.MainLifeUI;
        }
        onShow(argc) {
            PlatformAdapter.getInstance().showInterstitial();
            this.updateView();
        }
        onHide() {
            PlatformAdapter.getInstance().hideBanner();
        }
        updateView() {
        }
        onToggleSound() {
            AudioMgr.isOpenSound = !AudioMgr.isOpenSound;
            this.updateView();
        }
        onToggleMuisc() {
            AudioMgr.isOpenMusic = !AudioMgr.isOpenMusic;
            this.updateView();
        }
        onToggleShake() {
            VibrationMgr.isOpen = !VibrationMgr.isOpen;
            this.updateView();
        }
        onBtnsure() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIMainCtl);
        }
        onbtnWatchAD() {
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                PlatformAdapter.getInstance().showVideoAd((res) => {
                    if (res) {
                        UserModel.getInstance().life += 5;
                        this.clickBtnClose();
                    }
                });
            }
            else {
                Message.show("领取成功!");
                UserModel.getInstance().life += 5;
                this.clickBtnClose();
            }
        }
        clickBtnClose() {
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
    }

    class RequestMgr extends Singleton {
        async get(url, callback) {
            let [isOk, data] = await HttpHelper.getAsync(url);
            if (isOk) {
                if (data.result == 0) {
                    callback && callback(data.reData);
                }
                else {
                    MessageBox.show(data.message, "确定", Laya.Handler.create(this, () => this.get(url, callback)), "取消");
                }
            }
            else {
                MessageBox.show("网络错误，是否重试", "确定", Laya.Handler.create(this, () => this.get(url, callback)), "取消");
            }
        }
    }

    class RequestController extends Singleton {
        constructor() {
            super();
        }
        async uploadUserInfo(callback) {
            let uid = UserModel.getInstance().uid;
            let nickname = UserModel.getInstance().nickname;
            let avatar = UserModel.getInstance().avatar;
            let url = AppConfig.phpRoot + "login/updateUserInfo?openid=" + uid + "&nickname=" + nickname + "&avatar=" + avatar;
            RequestMgr.getInstance().get(url, callback);
        }
        async uploadScore() {
            let uid = UserModel.getInstance().uid;
            let pro = UserModel.getInstance().pro;
            let url = AppConfig.phpRoot + "userInfo/uploadScore?openid=" + uid + "&pro=" + pro;
            HttpHelper.getAsync(url);
        }
        async requestRank(callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "userInfo/getRank?openid=" + uid;
            RequestMgr.getInstance().get(url, callback);
        }
        async requestGetUserInfo(callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "userInfo/getUserInfo?openid=" + uid;
            RequestMgr.getInstance().get(url, callback);
        }
        async requestGetDraw(callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "userInfo/getDraw?openid=" + uid;
            RequestMgr.getInstance().get(url, callback);
        }
        async requestSaveAddress(nickname, phone, bankCard, bank, address, callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "userInfo/saveAddress?openid=" + uid + "&nickname=" + nickname + "&phone=" + phone + "&address=" + address + "&bankCard=" + bankCard + "&bank=" + bank;
            RequestMgr.getInstance().get(url, callback);
        }
        async requestGetPrize(callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "gameConfig/prize";
            RequestMgr.getInstance().get(url, callback);
        }
        async requestGetGameconfig(callback) {
            let url = AppConfig.phpRoot + "gameConfig/gameConfig";
            RequestMgr.getInstance().get(url, callback);
        }
        async requestChangePro(pro, callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "userInfo/changePro?openid=" + uid + "&pro=" + pro;
            RequestMgr.getInstance().get(url, callback);
        }
        async signIn(pro, callback) {
            let uid = UserModel.getInstance().uid;
            let url = AppConfig.phpRoot + "signIn/numberOfClaims?open_id=" + uid + "&signCount=" + pro;
            RequestMgr.getInstance().get(url, callback);
        }
    }

    class RandomUtil {
        static randomInt(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        static randomFloat(min, max) {
            return Math.random() * (max - min) + min;
        }
        static randomIntList(min, max, num) {
            if (num > max - min) {
                throw ("randomIntList 返回数量超过列表数量");
            }
            let len = max - min;
            let list = [];
            for (let i = 0; i < len; i++) {
                list[i] = min + i;
            }
            let arr = [];
            let cnum = 0;
            while (cnum < num) {
                let ran = this.randomInt(0, list.length);
                let d = list[ran];
                list.splice(ran, 1);
                arr.push(d);
                cnum++;
            }
            return arr;
        }
        static randomFlag() {
            return Math.random() > 0.5;
        }
    }

    class UITurntableCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.canTouch = true;
        }
        uiEventList() {
            return [
                [this.view.btnStart, Laya.Event.CLICK, this.onBtnStart, null],
                [this.view.btnSpin, Laya.Event.CLICK, this.ramdomNumberFun, null],
                [this.view.bg, Laya.Event.CLICK, this.hide, null],
                [GameDispatcher.getInstance(), EventName.ADD_LIFE, this.updateLife, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/turntable.atlas"
            ];
        }
        uiView() {
            return ui.view.turntable.TurntableUI;
        }
        onHide() {
        }
        onLoad() {
        }
        onShow(argc) {
            this.view.lifeTxt.text = UserModel.getInstance().life + "";
            PlatformAdapter.getInstance().showInterstitial();
            this.canTouch = true;
            this.view.rotator.rotation = 0;
            this.turnTableNums();
            this.updateTickCount(UserModel.getInstance().turntableNum);
            this.view.rotator.skin = "res/ui/turntable/tbg1.png";
        }
        turnTableNums() {
            let drawTime = Laya.LocalStorage.getItem('drawTime');
            let isDraw = false;
            if (drawTime) {
                isDraw = TimeUtil.isSameDay(parseInt(drawTime), Math.floor(new Date().getTime() / 1000));
            }
            if (!isDraw) {
                UserModel.getInstance().turntableNum = 4;
                this.view.lifeTxt.text = UserModel.getInstance().life + "";
                console.log("OK！刷新转盘次数");
            }
            else {
                console.log("未到明天");
            }
            if (UserModel.getInstance().turntableNum <= 0) {
                this.view.btnSpin.disabled = true;
            }
            else {
                this.view.btnSpin.disabled = false;
            }
        }
        updateTickCount(count) {
            if (count <= 0) {
                count = 0;
            }
            this.view.txtNum.text = '剩余' + count + '次抽奖机会';
        }
        updateLife() {
            this.view.lifeTxt.text = UserModel.getInstance().life + "";
            if (UserModel.getInstance().turntableNum <= 0) {
                this.view.btnSpin.disabled = true;
            }
            this.updateTickCount(UserModel.getInstance().turntableNum);
        }
        onBtnStart() {
            if (!this.canTouch) {
                return;
            }
            this.canTouch = false;
            RequestController.getInstance().requestGetDraw((res) => {
                console.log(res);
                return;
            });
        }
        ramdomNumberFun() {
        }
        luckDraw(type) {
            let awradID = type;
            console.log(awradID);
            this.view.rotator.rotation %= 360;
            let target = 3600 + (awradID - 1) * -72 + RandomUtil.randomInt(-15, 15);
            Laya.Tween.to(this.view.rotator, { rotation: target }, 5000, Laya.Ease.sineInOut, new Laya.Handler(this, this.trunEnd, [type]));
        }
        trunEnd(type) {
            Laya.timer.once(1000, this, () => {
                this.canTouch = true;
                this.view.btnSpin.on(Laya.Event.CLICK, this, this.ramdomNumberFun);
                UIMgr.show(UIDefine.UITurntableResultCtl, [type]);
            });
        }
    }

    class UITurntableResultCtl extends UIBaseCtl {
        uiEventList() {
            return [];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.turntable.TurntableResultUI;
        }
        onAdapter(w, h) {
        }
        onShow(type) {
            console.log(type);
            this.showReward(type);
        }
        showReward(type) {
            let reward = ['体力x10', '体力x5', '体力x2', '体力x1', '体力x4'];
            switch (type - 1) {
                case 0:
                    UserModel.getInstance().life += 10;
                    break;
                case 1:
                    UserModel.getInstance().life += 5;
                    break;
                case 2:
                    UserModel.getInstance().life += 2;
                    break;
                case 3:
                    UserModel.getInstance().life += 1;
                    break;
                case 4:
                    UserModel.getInstance().life += 4;
                    break;
                default:
                    break;
            }
            Laya.LocalStorage.setItem('drawTime', Math.floor(new Date().getTime() / 1000).toString());
            UserModel.getInstance().turntableNum -= 1;
            Message.show("抽到的奖品为" + reward[type - 1]);
            GameDispatcher.getInstance().event(EventName.ADD_LIFE);
            this.hide();
        }
    }

    class UICelebrityCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
            ];
        }
        uiResList() {
            return [];
        }
        onLoad() {
            this.map = [];
            this.view.pnl.vScrollBar.visible = false;
        }
        uiView() {
            return ui.view.main.CelebrityUI;
        }
        onShow(argc) {
            let celeb = UserModel.getInstance().celeb;
            for (let i = 0; i < celeb.length; i++) {
                this.view[`celeb_${i}`].getChildByName("clickShow").on(Laya.Event.CLICK, this, this.onClickShow, [i]);
                if (celeb[i] == 0) {
                    this.creteRedFilter(i);
                }
                else {
                    this.remakeFilter(i);
                }
            }
            this.showTxt();
            if (UserModel.getInstance().celeb[0] === 0) {
                this.view[`celeb_0`].on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCeleb, [0]);
            }
            if (UserModel.getInstance().celeb[3] === 0) {
                this.view[`celeb_3`].on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCeleb, [3]);
            }
            if (UserModel.getInstance().celeb[5] === 0) {
                this.view[`celeb_5`].on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCeleb, [5]);
            }
            this.showTick();
        }
        onHide() {
        }
        onMouseDownCeleb(i) {
            this.view[`celeb_${i}`].on(Laya.Event.MOUSE_UP, this, this.onMouseUpCeleb, [i]);
        }
        onMouseUpCeleb(i) {
            console.log("看广告");
            this.view[`celeb_${i}`].off(Laya.Event.MOUSE_UP, this, this.onMouseUpCeleb);
            PlatformAdapter.getInstance().showVideoAd(() => {
                let name = HouseModel.getInstance().FamedMen[i].name;
                UserModel.getInstance().celeb[i] = 1;
                this.remakeFilter(i);
                celebHelp.showCeleb(name);
                this.view[`celeb_${i}`].off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownCeleb);
                this.showTxt();
                this.showTick();
            });
        }
        showTxt() {
            let celeb = UserModel.getInstance().celeb;
            let FamedMen = HouseModel.getInstance().FamedMen;
            for (let i = 0; i < celeb.length; i++) {
                if (celeb[i] == 1) {
                    this.view[`celeb_${i}`].getChildByName("needLv").visible = true;
                    this.view[`celeb_${i}`].getChildByName("needLv").text = "已获取";
                    this.view[`celeb_${i}`].getChildByName("watchAd").visible = false;
                    this.view[`celeb_${i}`].getChildByName("clickShow").visible = true;
                }
                else if (!FamedMen[i].watchAd) {
                    this.view[`celeb_${i}`].getChildByName("needLv").text = `完成第${FamedMen[i].level}关`;
                    this.view[`celeb_${i}`].getChildByName("watchAd").visible = false;
                    this.view[`celeb_${i}`].getChildByName("clickShow").visible = false;
                }
                else {
                    this.view[`celeb_${i}`].getChildByName("needLv").text = `免费领取`;
                    this.view[`celeb_${i}`].getChildByName("watchAd").visible = true;
                    this.view[`celeb_${i}`].getChildByName("clickShow").visible = false;
                }
            }
        }
        showTick() {
            let showCelebList = UserModel.getInstance().showCelebList;
            let FamedMen = HouseModel.getInstance().FamedMen;
            let celeb = UserModel.getInstance().celeb;
            if (showCelebList.length < 1) {
                for (let i = 0; i < celeb.length; i++) {
                    this.view[`celeb_${i}`].getChildByName("clickShow").getChildByName("isShow").visible = false;
                }
                return;
            }
            for (let j = 0; j < celeb.length; j++) {
                if (celeb[j] === 1) {
                    let find = showCelebList.find(item => item.name === FamedMen[j].name);
                    if (find !== -1 && find) {
                        console.log(find, "下标为==>", j);
                        this.view[`celeb_${j}`].getChildByName("clickShow").getChildByName("isShow").visible = true;
                    }
                    else {
                        this.view[`celeb_${j}`].getChildByName("clickShow").getChildByName("isShow").visible = false;
                    }
                }
            }
        }
        onClickShow(i) {
            let visible = this.view[`celeb_${i}`].getChildByName("clickShow").getChildByName("isShow").visible;
            this.view[`celeb_${i}`].getChildByName("clickShow").getChildByName("isShow").visible = !visible;
            visible = this.view[`celeb_${i}`].getChildByName("clickShow").getChildByName("isShow").visible;
            let FamedMen = HouseModel.getInstance().FamedMen;
            let showCelebList = UserModel.getInstance().showCelebList;
            if (visible) {
                let name = FamedMen[i].name;
                celebHelp.showCeleb(name);
            }
            else {
                if (showCelebList.length < 0) {
                    return;
                }
                let findIndex = showCelebList.findIndex(item => item.name === FamedMen[i].name);
                if (findIndex !== -1) {
                    if (showCelebList.length === 1) {
                        this.view[`celeb_${i}`].getChildByName("clickShow").getChildByName("isShow").visible = true;
                        Message.show("至少显示一位名人");
                        return;
                    }
                    showCelebList.splice(findIndex, 1);
                    console.log(showCelebList);
                    UserModel.getInstance().showCelebList = showCelebList;
                    GameDispatcher.getInstance().event(EventName.MAIN_REFRESH_CELEB);
                }
            }
        }
        creteRedFilter(item) {
            var colorMatrix = [
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 1, 0,
            ];
            var blackFilter = new Laya.ColorFilter(colorMatrix);
            for (let i = 0; i < 7; i++) {
                this.view[`celeb_${item}`].getChildByName("img").filters = [blackFilter];
            }
        }
        remakeFilter(item) {
            var colorMatrix = [
                1, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0,
            ];
            var blackFilter = new Laya.ColorFilter(colorMatrix);
            this.view[`celeb_${item}`].getChildByName("img").filters = [blackFilter];
        }
        clickBtnClose() {
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
    }

    class UIBigLv extends ui.view.level.BigLvUI {
        constructor() {
            super();
            this.unlock = false;
            this.unlockNum = 0;
            this.lvArrUnLock = false;
        }
        hide() {
            this.visible = false;
        }
        init(title, lv, lvArr, unlockNum) {
            this.title.text = title;
            this.visible = true;
            this.lv.text = lv;
            this.lvArr = lvArr;
            this.unlockNum = unlockNum;
            if (this.lvArr) {
                for (let i = 0; i < this.lvArr.length; i++) {
                    if (UserModel.getInstance().unlockLevelList.includes(this.lvArr[i])) {
                        this.lvArrUnLock = true;
                    }
                }
            }
            if (UserModel.getInstance().unlockLevel >= this.unlockNum || this.lvArrUnLock) {
                this.blackMask.visible = false;
                this.unlock = true;
            }
            else if (this.unlockNum == null) {
                this.blackMask.visible = false;
                this.unlock = true;
            }
            else {
                this.blackMask.visible = true;
                this.unlock = false;
            }
            if (this.unlock) {
                this.on(Laya.Event.CLICK, this, this.onClick);
            }
            else {
                this.on(Laya.Event.CLICK, this, () => {
                    Message.show("请先解锁前面的关卡");
                });
            }
        }
        onClick() {
            if (this.lvArr == null) {
                return;
            }
            SoundHelper.clickClose();
            UIMgr.hide(UIDefine.UILvSelectCtl);
            UIMgr.show(UIDefine.UILvSelectTowCtl, this);
        }
    }

    class UILvSelectCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.lvArr = [];
        }
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
            ];
        }
        uiResList() {
            return [];
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.view.content.scale(s, s);
        }
        uiView() {
            return ui.view.level.LvSelectUI;
        }
        onLoad() {
            this.map = [];
            this.view.pnl.vScrollBar.visible = false;
            for (let j = 0; j <= 5; j++) {
                let item = new UIBigLv();
                item.x = 0;
                item.y = j * 310;
                this.map[j] = item;
                this.view.pnl.addChild(item);
                item.index = j;
            }
        }
        onShow(argc) {
            for (let j = 0; j <= 5; j++) {
                this.map[j].hide();
            }
            Laya.loader.load("res/ui/lvselect/level.json", Laya.Handler.create(this, this.onLoadMap));
        }
        onHide() {
        }
        onLoadMap(data) {
            this.mapData = data;
            data.map.forEach((v) => {
                let lvTxt = v[0];
                let y = v[1];
                let range = v[2];
                let lvArr = v[3];
                let unlock = v[4];
                this.map[y].init(lvTxt, range, lvArr, unlock);
                this.lvArr.push(this.map[y]);
            });
        }
        clickBtnClose() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
                UIMgr.show(UIDefine.UIMainCtl);
            }));
        }
    }

    class UIMySchoolCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
            ];
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.view.content.scale(s, s);
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.MySchoolUI;
        }
        onShow(argc) {
            this.getListData();
        }
        onHide() {
        }
        getListData() {
            let mySchool = HouseModel.getInstance().mySchool;
            let dataSchool = UserModel.getInstance().house;
            let unlockList = UserModel.getInstance().unlockLevelList.length;
            for (let i = 0; i < 5; i++) {
                let foundHouse = dataSchool.find(item => item.lvNum === i + 1);
                this.view[`schoolLv_${i}`].skin = (foundHouse ? "res/ui/school/unlockBg.png" : "res/ui/school/lockBg.png");
                this.view[`schoolLv_${i}`].getChildByName("lvNum").text = `Lv${mySchool[i].lvNum}`;
                this.view[`schoolLv_${i}`].getChildByName("schoolName").text = `${mySchool[i].schoolName}`;
                this.view[`schoolLv_${i}`].getChildByName("lock").text = (foundHouse ? "已解锁" : `完成${mySchool[i].level}关`);
            }
        }
        clickBtnClose() {
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
    }

    class UIMyDevCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
            ];
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.view.content.scale(s, s);
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.MyDevUI;
        }
        onShow(argc) {
            this.getListData();
        }
        getListData() {
            let myDevModel = HouseModel.getInstance().myDev;
            let unlockList = UserModel.getInstance().unlockLevelList.length;
            for (let i = 0; i < 5; i++) {
                this.view[`devLv_${i}`].skin = (unlockList >= myDevModel[i].level ? "res/ui/school/unlockBg.png" : "res/ui/school/lockBg.png");
                this.view[`devLv_${i}`].getChildByName("lvNum").text = `Lv${myDevModel[i].lvNum}`;
                this.view[`devLv_${i}`].getChildByName("myName").text = `${myDevModel[i].myName}`;
                this.view[`devLv_${i}`].getChildByName("lock").text = (unlockList >= myDevModel[i].level ? "已解锁" : `完成${myDevModel[i].level}关`);
            }
        }
        clickBtnClose() {
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
    }

    class UISmallLv extends ui.view.level.SmallLvUI {
        constructor() {
            super();
            this.unlock = false;
        }
        set dataSource(data) {
        }
        hide() {
            this.visible = false;
        }
        init(num, win = null, bg = null) {
            this.visible = true;
            this.index = Number(num);
            this.num.text = num;
            let unlockLevel = UserModel.getInstance().unlockLevel;
            this.bg.skin = (unlockLevel == this.index ? "res/ui/lvselect/smallBg2.png" : "res/ui/lvselect/smallBg1.png");
            this.win.visible = (UserModel.getInstance().unlockLevelList.includes(this.index) ? true : false);
            this.blackMask.visible = (UserModel.getInstance().unlockLevelList.includes(this.index) || unlockLevel == this.index ? false : true);
            this.unlock = !this.blackMask.visible;
            this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown() {
            Laya.Tween.to(this.bg, { scaleX: 1.2, scaleY: 1.2 }, 200);
            this.on(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }
        onMouseOut() {
            Laya.Tween.to(this.bg, { scaleX: 1, scaleY: 1 }, 200);
            this.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        }
        onMouseUp() {
            Laya.Tween.to(this.bg, { scaleX: 1, scaleY: 1 }, 200);
            this.off(Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.onClick();
        }
        onClick() {
            if (!this.unlock) {
                return;
            }
            else {
                SoundHelper.clickClose();
                if (HouseModel.lvList.includes(this.index)) {
                    UIMgr.hide(UIDefine.UILvSelectTowCtl);
                    LevelHelp.openLevel(this.index);
                }
                else {
                    Message.show("暂无更多关卡");
                }
            }
        }
    }

    class UILvSelectTowCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.lvArr = [];
            this.mapList = [];
        }
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
            ];
        }
        uiResList() {
            return [];
        }
        onAdapter(w, h) {
            let s = UIAdapterUtil.getScaleFix();
            this.view.content.scale(s, s);
        }
        uiView() {
            return ui.view.level.LvSelectTowUI;
        }
        onLoad() {
            this.view.pnl.vScrollBar.visible = false;
            this.levelItemList = [];
            for (let i = 0; i < 24; i++) {
                let item = new UISmallLv();
                let x = i % 3;
                let y = Math.floor(i / 3);
                item.x = x * (185 + 50);
                item.y = y * (194 + 50);
                this.view.pnl.addChild(item);
                this.levelItemList[i] = item;
            }
        }
        onShow(item) {
            for (let i = 0; i < 24; i++) {
                this.levelItemList[i].hide();
            }
            this.lvArr = item.lvArr;
            for (let i = 0; i < this.lvArr.length; i++) {
                this.levelItemList[i].init(`${this.lvArr[i]}`);
            }
        }
        onHide() {
        }
        clickBtnClose() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
                UIMgr.show(UIDefine.UILvSelectCtl);
            }));
        }
    }

    class UIGameTipsCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onBtnAddKey, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/comm.atlas",
                "res/atlas/res/ui/game.atlas",
            ];
        }
        uiView() {
            return ui.view.game.GameTipsUI;
        }
        onPreLoad() {
            this.setUILayer(LayerMgr.LAYER_MAIN);
        }
        onAdapter(w, h) {
            let sfix = UIAdapterUtil.getScaleFix();
            this.view.content.scale(sfix, sfix);
        }
        onLoad() {
        }
        onShow() {
            this.showAnswer();
        }
        showAnswer() {
            this.cfg = ConfigManager.GetConfigByKey(CfgLevel, Game.currentLevelID);
            this.view.answer.visible = false;
            this.view.answer.visible = false;
            if (this.cfg.answertxt) {
                this.view.answer.visible = false;
                this.view.answerTxt.visible = true;
                this.view.answerTxt.text = this.cfg.answertxt;
            }
            else {
                this.view.answer.visible = true;
                this.view.answerTxt.visible = false;
                this.view.answer.skin = Game.currentLevel.getAnswer() + "";
                this.answerWidth();
            }
        }
        answerWidth() {
            if (this.view.answer.width > 692 || this.view.answer.height > 482) {
                this.view.answer.width = 692;
                this.view.answer.height = 482;
            }
        }
        clickBtnClose() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
        onBtnAddKey() {
            SoundHelper.clickClose();
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                PlatformAdapter.getInstance().showVideoAd((res) => {
                    if (res) {
                        UserModel.getInstance().key += 1;
                        this.clickBtnClose();
                    }
                });
            }
            else {
                UserModel.getInstance().key += 1;
                this.clickBtnClose();
            }
        }
    }

    class UIGameSkipCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.onBtnClose, [1]],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onBtnAddKey, null],
                [this.view.btnSkip, Laya.Event.CLICK, this.onBtnSkip, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/comm.atlas",
                "res/atlas/res/ui/game.atlas",
            ];
        }
        uiView() {
            return ui.view.game.GameSkipUI;
        }
        onPreLoad() {
            this.setUILayer(LayerMgr.LAYER_MAIN);
        }
        onAdapter(w, h) {
            let sfix = UIAdapterUtil.getScaleFix();
            this.view.content.scale(sfix, sfix);
        }
        onLoad() {
        }
        onShow() {
        }
        onBtnClose(callback = null) {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                if (callback == 1) {
                    callback = null;
                }
                callback && callback();
                this.hide();
            }));
        }
        onBtnAddKey() {
            SoundHelper.clickClose();
            this.onBtnClose(() => {
                UIMgr.show(UIDefine.UIGameStoreCtl);
            });
        }
        onBtnSkip() {
            SoundHelper.clickClose();
            let key = UserModel.getInstance().key;
            let index = HouseModel.lvList.indexOf(Game.currentLevelID);
            if (key >= 2) {
                if (!HouseModel.lvList[index + 1]) {
                    Message.show("暂无更多关卡");
                    this.onBtnClose();
                    return;
                }
                UserModel.getInstance().pass(Game.currentLevel.cfg.id);
                UserModel.getInstance().key -= 2;
                UIMgr.show(UIDefine.UIGameWinCtl);
                this.onBtnClose();
            }
            else {
                Message.show("钥匙不够两把了！");
            }
        }
    }

    class UIGameStoreCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.clickBtnClose, null],
                [this.view.btnClose2, Laya.Event.CLICK, this.clickBtnClose, null],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onbtnWatchingAD, null],
            ];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.game.GameStoreUI;
        }
        onShow(argc) {
        }
        onHide() {
        }
        onbtnWatchingAD() {
            SoundHelper.clickClose();
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                PlatformAdapter.getInstance().showVideoAd((res) => {
                    if (res) {
                        Message.show("钥匙+1");
                        UserModel.getInstance().key += 1;
                        this.clickBtnClose();
                    }
                });
            }
            else {
                Message.show("钥匙+1");
                UserModel.getInstance().key += 1;
                this.clickBtnClose();
            }
        }
        clickBtnClose() {
            SoundHelper.clickClose();
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                this.hide();
            }));
        }
    }

    class UIGameWinCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnHome, Laya.Event.CLICK, this.onBtnHome, null],
                [this.view.btnAddKey, Laya.Event.CLICK, this.onBtnAddKey, null],
                [this.view.btnNext, Laya.Event.CLICK, this.onBtnNext, null],
                [this.view.btnRemake, Laya.Event.CLICK, this.onBtnRemake, null],
                [this.view.btnStore, Laya.Event.CLICK, this.onBtnStore, null],
                [this.view.btnReturn, Laya.Event.CLICK, this.onBtnReturn, null],
            ];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.GameWinUI;
        }
        onAdapter(w, h) {
            let sfix = UIAdapterUtil.getScaleFix();
            this.view.content.scale(sfix, sfix);
        }
        onLoad() {
        }
        onShow() {
            this.showStatus();
            Laya.SoundManager.playMusic("res/sounds/winbgm.mp3");
            console.log("onShow==>", Game.currentLevelID);
            let index = HouseModel.lvList.indexOf(Game.currentLevelID);
            if (index !== -1) {
                console.log("下一关==>", HouseModel.lvList[index + 1]);
                this.showBtnReturn(HouseModel.lvList[index + 1]);
                if (HouseModel.lvList[index + 1]) {
                    UserModel.getInstance().unlockLevel = HouseModel.lvList[index + 1];
                }
                else {
                    UserModel.getInstance().unlockLevel = HouseModel.lvList[0];
                }
            }
            else {
                UserModel.getInstance().unlockLevel = Game.currentLevelID + 1;
            }
            let houseModel = HouseModel.getInstance().mySchool;
        }
        onHide() {
        }
        onBtnHome() {
            Laya.Tween.to(this.view.content, { scaleX: 0, scaleY: 0 }, 200, null, Laya.Handler.create(this, function () {
                this.view.content.scale(1, 1);
                UIMgr.hide(UIDefine.UIGameCtl);
                UIMgr.show(UIDefine.UIMainCtl);
                this.hide();
            }));
        }
        showBtnReturn(lv) {
            if (lv == undefined) {
                this.view.btnReturn.visible = true;
                this.view.btnNext.visible = false;
            }
            else {
                this.view.btnReturn.visible = false;
                this.view.btnNext.visible = true;
            }
        }
        onBtnReturn() {
            this.hide();
            UIMgr.show(UIDefine.UIMainCtl);
        }
        showStatus() {
            let statusLv = UserModel.getInstance().lv;
            this.view.avatar.skin = `res/ui/game/avatar/avatar${statusLv}.png`;
            this.view.lv.text = `Lv.${statusLv}`;
        }
        onBtnAddKey() {
            if (Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame
                || Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame
                || Laya.Browser.onHWMiniGame || Laya.Browser.onKGMiniGame) {
                PlatformAdapter.getInstance().showVideoAd((res) => {
                    if (res) {
                        Message.show("钥匙+1!");
                        UserModel.getInstance().key += 1;
                    }
                });
            }
            else {
                Message.show("钥匙+1!");
                UserModel.getInstance().key += 1;
            }
        }
        onBtnNext() {
            let index = HouseModel.lvList.indexOf(Game.currentLevelID);
            if (HouseModel.lvList[index + 1]) {
                UIMgr.hide(UIDefine.UIGameWinCtl);
                LevelHelp.closeLevel();
                console.log("Game.currentLevelID==>", Game.currentLevelID);
                LevelHelp.openLevel(LevelHelp.getNextLevel(Game.currentLevelID));
            }
            else {
                Message.show("暂无更多关卡");
            }
        }
        onBtnRemake() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIGameCtl, Game.currentLevelID);
        }
        onBtnStore() {
            UIMgr.show(UIDefine.UIGameStoreCtl);
        }
    }

    class GameLoader extends Singleton {
        start() {
            this.initAppConfig();
        }
        async initAppConfig() {
            await AppConfig.init();
            UIMgr.loadBG("loading/bg_l.png");
            this.preLoadingRes();
        }
        preLoadingRes() {
            let arr = [
                "loading/bg.jpg"
            ];
            Laya.loader.load(arr, Laya.Handler.create(this, this.initSystem));
        }
        initSystem() {
            AudioMgr.init();
            VibrationMgr.init();
            CmdHelper.init();
            this.loadLevelFileJson();
        }
        loadLevelFileJson() {
            Laya.loader.load(["res/file.json", "res/subRes.json"], Laya.Handler.create(this, this.loadUIJson), null, Laya.Loader.JSON);
        }
        loadUIJson() {
            LevelLoaderAdapter.init();
            Laya.loader.load("loading/ui.json", Laya.Handler.create(this, this.onUIJsonLoaded));
        }
        async onUIJsonLoaded() {
            Laya.Scene.setUIMap("loading/ui.json");
            LoadingView.progress(0);
            PlatformAdapter.getInstance().init();
            this.loadSubPack();
        }
        loadSubPack() {
            Log.l("开始加载分包", "GameLoader");
            LoadingView.progress(10);
            if (Laya.Browser.onMiniGame) {
                const loadTask = wx["loadSubpackage"]({
                    name: 'res',
                    success: (res) => {
                        Log.l("分包加载成功", "GameLoader");
                        this.onLoginCallback();
                    },
                    fail: function (res) {
                    }
                });
            }
            else {
                this.onLoginCallback();
            }
        }
        onLoginCallback() {
            LoadingView.progress(20);
            ConfigManager.loadAllConfigFile(Laya.Handler.create(this, this.preloadingImage));
        }
        preloadingImage() {
            let arr = [
                "res/atlas/res/ui/comm.atlas",
                "res/atlas/res/ui/messagebox.atlas",
                "res/anim/effect/effect.atlas",
            ];
            Laya.loader.load(arr, Laya.Handler.create(this, this.preloadingUI));
        }
        preloadingUI() {
            UIMgr.registerUI(UIDefine.UILoginCtl, UILoginCtl);
            UIMgr.registerUI(UIDefine.UIMainCtl, UIMainCtl);
            UIMgr.registerUI(UIDefine.UIGameCtl, UIGameCtl);
            UIMgr.registerUI(UIDefine.UIGameWinCtl, UIGameWinCtl);
            UIMgr.registerUI(UIDefine.UIGameSettingCtl, UIGameSettingCtl);
            UIMgr.registerUI(UIDefine.UIMainLifeCtl, UIMainLifeCtl);
            UIMgr.registerUI(UIDefine.UITurntableCtl, UITurntableCtl);
            UIMgr.registerUI(UIDefine.UITurntableResultCtl, UITurntableResultCtl);
            UIMgr.registerUI(UIDefine.UICelebrityCtl, UICelebrityCtl);
            UIMgr.registerUI(UIDefine.UILvSelectCtl, UILvSelectCtl);
            UIMgr.registerUI(UIDefine.UIMySchoolCtl, UIMySchoolCtl);
            UIMgr.registerUI(UIDefine.UIMyDevCtl, UIMyDevCtl);
            UIMgr.registerUI(UIDefine.UIGameStoreCtl, UIGameStoreCtl);
            UIMgr.registerUI(UIDefine.UILvSelectTowCtl, UILvSelectTowCtl);
            UIMgr.registerUI(UIDefine.UIGameTipsCtl, UIGameTipsCtl);
            UIMgr.registerUI(UIDefine.UIGameSkipCtl, UIGameSkipCtl);
            let preloadList = [
                UIDefine.UIGameCtl,
                UIDefine.UIMainCtl,
                UIDefine.UIGameWinCtl,
                UIDefine.UIGameSettingCtl,
                UIDefine.UITurntableCtl,
                UIDefine.UITurntableResultCtl,
                UIDefine.UICelebrityCtl,
                UIDefine.UILvSelectCtl,
                UIDefine.UIMySchoolCtl,
                UIDefine.UIMyDevCtl,
                UIDefine.UIGameStoreCtl,
                UIDefine.UILvSelectTowCtl,
                UIDefine.UIGameTipsCtl,
                UIDefine.UIGameSkipCtl,
            ];
            UIMgr.preloadingUI(preloadList, Laya.Handler.create(this, this.initMvc), new Laya.Handler(this, this.loadUIProcess, null, false));
        }
        loadUIProcess(n) {
            LoadingView.progress(Math.floor(50 + n * 45));
        }
        initMvc() {
            UserModel.getInstance().init();
            PlatformAdapter.getInstance().init();
            this.ready();
        }
        async ready() {
            LoadingView.progress(99);
            Laya.SoundManager.playMusic("res/sounds/bgm.mp3");
            LoadingView.progress(100);
            UIMgr.show(UIDefine.UIMainCtl);
        }
    }

    Laya.Point.prototype.clone = function () {
        return new Laya.Point(this.x, this.y);
    };
    Laya.Point.prototype.normalized = function () {
        var result = new Laya.Point(this.x, this.y);
        result.normalize();
        return result;
    };
    Laya.Point.prototype.equal = function (p) {
        if (!p)
            return false;
        if (p == this)
            return true;
        if (p.x == this.x && p.y == this.y)
            return true;
        return false;
    };
    Laya.Point.prototype.lerp = function (to, ratio) {
        var out = new Laya.Point();
        var x = this.x;
        var y = this.y;
        out.x = x + (to.x - x) * ratio;
        out.y = y + (to.y - y) * ratio;
        return out;
    };
    Laya.Point.prototype.add = function (point) {
        var out = new Laya.Point();
        out.x = this.x + point.x;
        out.y = this.y + point.y;
        return out;
    };
    Laya.Point.prototype.sub = function (point) {
        var out = new Laya.Point();
        out.x = this.x - point.x;
        out.y = this.y - point.y;
        return out;
    };
    Laya.Point.prototype.mul = function (num) {
        var out = new Laya.Point();
        out.x = this.x * num;
        out.y = this.y * num;
        return out;
    };
    Laya.Point.prototype.div = function (num) {
        var out = new Laya.Point();
        out.x = this.x / num;
        out.y = this.y / num;
        return out;
    };
    Laya.Point.prototype.neg = function () {
        var out = new Laya.Point();
        out.x = -this.x;
        out.y = -this.y;
        return out;
    };
    Laya.Point.prototype.scale = function (point) {
        var out = new Laya.Point();
        out.x = this.x * point.x;
        out.y = this.y * point.y;
        return out;
    };
    Laya.Point.prototype.dot = function (point) {
        return this.x * point.x + this.y * point.y;
    };
    Laya.Point.prototype.cross = function (point) {
        return this.x * point.y - this.y * point.x;
    };
    Laya.Point.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Laya.Point.prototype.project = function (point) {
        return point.mul(this.dot(point) / point.dot(point));
    };
    Laya.Point.prototype.rotateSelf = function (radians) {
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        var x = this.x;
        this.x = cos * x - sin * this.y;
        this.y = sin * x + cos * this.y;
        return this;
    };
    Laya.Point.prototype.rotate = function (radians) {
        var out = new Laya.Point();
        out.x = this.x;
        out.y = this.y;
        return out.rotateSelf(radians);
    };
    Laya.Point.prototype.sqrMag = function () {
        return this.x * this.x + this.y * this.y;
    };
    Laya.Point.prototype.clampMag = function (maxLength) {
        var result;
        if (this.sqrMag() > maxLength * maxLength) {
            result = this.normalized().mul(maxLength);
        }
        else {
            result = new Laya.Point(this.x, this.y);
        }
        return result;
    };

    class Main {
        constructor() {
            Config.useWebGL2 = false;
            Config.isAntialias = false;
            Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.start));
        }
        start() {
            GameLoader.getInstance().start();
        }
    }
    new Main();

}());

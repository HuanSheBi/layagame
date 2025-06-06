(function () {
    'use strict';

    class QueryArgsUtil {
        static getUrlParms() {
            var args = new Object();
            if (location == null || location.search == null) {
                return args;
            }
            var query = location.search.substring(1);
            query = decodeURI(query);
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1)
                    continue;
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                args[argname] = unescape(value);
            }
            return args;
        }
        static get(key) {
            if (this._parms == null) {
                this._parms = this.getUrlParms();
            }
            return this._parms[key];
        }
    }
    QueryArgsUtil._parms = null;

    class ButtomScaleEffect extends Laya.Script {
        constructor() {
            super();
            this.enabledScale = true;
            this.scaleTime = 100;
            this.scaleNum = 1.2;
            this.baseScaleX = 1;
            this.baseScaleY = 1;
        }
        onAwake() {
            this.baseScaleX = this.owner.scaleX;
            this.baseScaleY = this.owner.scaleY;
        }
        onEnable() {
        }
        onDisable() {
        }
        onMouseDown() {
            if (this.enabledScale == false) {
                return;
            }
            if (this.tweenScale) {
                Laya.Tween.clear(this.tweenScale);
            }
            this.tweenScale = Laya.Tween.to(this.owner, { scaleX: this.scaleNum * this.baseScaleX, scaleY: this.scaleNum * this.baseScaleY }, this.scaleTime, null, Laya.Handler.create(this, () => {
                this.tweenScale = null;
            }));
        }
        onMouseUp() {
            this.scaleBack();
        }
        onMouseOut() {
            this.scaleBack();
        }
        onMouseOver() {
            this.scaleBack();
        }
        scaleBack() {
            if (this.enabledScale == false) {
                return;
            }
            if (this.tweenScale) {
                Laya.Tween.clear(this.tweenScale);
            }
            this.tweenScale = Laya.Tween.to(this.owner, { scaleX: this.baseScaleX, scaleY: this.baseScaleY }, this.scaleTime / 2, null, Laya.Handler.create(this, () => {
                this.tweenScale = null;
            }));
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("view/scripts/ButtomScaleEffect.ts", ButtomScaleEffect);
        }
    }
    GameConfig.width = 1334;
    GameConfig.height = 750;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "view/game/EndlessGame.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

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
        }
    }
    AppConfig.appName = "JueJing";
    AppConfig.isLoadRemoteConfig = false;
    AppConfig.remoteConfigPath = "http://racecar.6899game.com/release/phpApi/AppConfig.php";
    AppConfig.versionJson = "version.json";
    AppConfig.logLevel = "info";
    AppConfig.logIgnore = "ModelPool,Net:Msg";
    AppConfig.logAlway = "";
    AppConfig.phpRoot = "https://yhhf-activity.6899game.com/tofu/php/";
    AppConfig.remoteUrl = "https://yhhf-res.6899game.com/tofu_v2/";
    AppConfig.shareTitle = "";
    AppConfig.shareImage = "share.png";
    AppConfig.shareInviteCode = "";
    AppConfig.serverUrl = "ws:192.168.30.24:8866/ws";

    class Singleton {
        static getInstance() {
            if (!this.instance) {
                this.instance = new this();
            }
            return this.instance;
        }
    }

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

    class Serializable {
        constructor() {
            this.defaultSaveKey = "";
            this.defaultSaveKey = `SaveData.${AppConfig.appName}.${this["constructor"].name}`;
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
            this.setJson(str);
        }
        getSaveKey() {
            return this.defaultSaveKey + "." + AppConfig.userName;
        }
    }

    class UserSerializable extends Serializable {
        constructor() {
            super(...arguments);
            this.accountLevel = false;
            this.spDataArr = null;
            this.diamond = 0;
            this.money = 0;
            this.lastLevel = 1;
            this.passList = [];
            this.beginnerTutorial = {
                lv1: false,
                lv2: false,
            };
            this.showTest = false;
            this.firstLvTip = false;
            this.clickTipsList = [
                { name: "main", click: 0 },
                { name: "firstLv", click: 0 },
            ];
            this.fightHeroList = [null, null, null, null];
            this.userData = { lv: 1, exp: 0, avatar: "res/ui/comm/avatar.png" };
            this.taskList = [
                { id: 1, count: 0, receive: false },
                { id: 2, count: 0, receive: false },
            ];
            this.payNum = 0;
            this.payNumToday = 0;
            this.useMoneyMoon = 0;
            this.goodsList = [
                { id: 2003, number: 5000 },
            ];
            this.heroList = [
                { id: 3, lv: 1, maxlv: 100, hp: 0, attack: 0, defense: 0, clothing: [], helmet: [], cloak: [], star: 1, power: 0 },
                { id: 6, lv: 1, maxlv: 100, hp: 0, attack: 0, defense: 0, clothing: [], helmet: [], cloak: [], star: 1, power: 0 },
            ];
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
    EventName.CORE_SHOW_GAME = "CORE_SHOW_GAME";
    EventName.GAME_WIN = "GAME_WIN";
    EventName.GAME_AT_THE_BELL = "GAME_AT_THE_BELL";
    EventName.GAME_SELECT_HERO = "GAME_SELECT_HERO";
    EventName.GAME_NOT_HERO = "GAME_NOT_HERO";
    EventName.GAME_REFRESH_LIST = "GAME_REFRESH_LIST";
    EventName.GAME_START = "GAME_START";
    EventName.GAME_DRAG_AVATAR = "GAME_DRAG_AVATAR";
    EventName.GAME_SELECT_ENEMY = "GAME_SELECT_ENEMY";
    EventName.GAME_OVER = "GAME_OVER";
    EventName.GAME_NEXT_WAVE = "GAME_NEXT_WAVE";
    EventName.GAME_HERO_DIE = "GAME_HERO_DIE";
    EventName.GAME_FIRST_TIPS = "GAME_FIRST_TIPS";
    EventName.GAME_FIRST_TIPS2 = "GAME_FIRST_TIPS2";
    EventName.GAME_FIRST_TIPS3 = "GAME_FIRST_TIPS3";
    EventName.GAME_TIPS_USE_SKILL = "GAME_TIPS_USE_SKILL";
    EventName.GAME_AT_THE_BELL_ENDLESS = "GAME_AT_THE_BELL_ENDLESS";
    EventName.GAME_NEXT_WAVE_ENDLESS = "GAME_NEXT_WAVE_ENDLESS";
    EventName.GAME_RETURN_ENDLSEE = "GAME_RETURN_ENDLSEE";
    EventName.GAME_SHOW_OTHER_POWER = "GAME_SHOW_OTHER_POWER";
    EventName.USER_TASK_TIME_REMOVED = "USER_TASK_TIME_REMOVED";
    EventName.USER_SWITCH_DIAMOND = "USER_SWITCH_DIAMOND";
    EventName.USER_SWITCH_MONEY = "USER_SWITCH_MONEY";
    EventName.USER_SAVE_GOODS = "USER_SAVE_GOODS";
    EventName.USER_EQUIP_SELECT_ITEM = "USER_EQUIP_SELECT_ITEM";
    EventName.USER_UPDATA = "USER_UPDATA";
    EventName.USER_UPLV_HERO = "USER_UPLV_HERO";

    class UserModel extends Singleton {
        constructor() {
            super();
            this._upLvItemNum = [];
            this._useItemArr = {};
            this.init();
        }
        init() {
            this.data = new UserSerializable();
            this.data.load();
        }
        get spDataArr() {
            return this.data.spDataArr;
        }
        set spDataArr(value) {
            this.data.spDataArr = value;
            this.data.save();
        }
        get lastLevel() {
            return this.data.lastLevel;
        }
        set lastLevel(value) {
            this.data.lastLevel = value;
            this.data.save();
        }
        get passList() {
            return this.data.passList;
        }
        pass(lv) {
            if (this.data.passList.indexOf(lv) == -1) {
                if (lv == 1) {
                    this.data.firstLvTip = true;
                    this.data.save();
                }
                this.data.passList.push(lv);
                this.data.save();
            }
        }
        get goodsList() {
            return this.data.goodsList;
        }
        set goodsList(v) {
            this.data.goodsList = v;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_SAVE_GOODS);
        }
        get heroList() {
            return this.data.heroList;
        }
        set heroList(v) {
            this.data.heroList = v;
            this.data.save();
        }
        get fightHeroList() {
            return this.data.fightHeroList;
        }
        set fightHeroList(v) {
            this.data.fightHeroList = v;
            let isOK = false;
            this.data.save();
            for (let i = 0; i < this.data.fightHeroList.length; i++) {
                if (this.data.fightHeroList[i] !== null) {
                    isOK = true;
                    GameDispatcher.getInstance().event(EventName.GAME_SELECT_HERO);
                    return;
                }
            }
            if (!isOK) {
                GameDispatcher.getInstance().event(EventName.GAME_NOT_HERO);
            }
        }
        get time() {
            return this.data.time;
        }
        set time(v) {
            this.data.time = v;
            this.data.save();
        }
        get beginnerTutorial() {
            return this.data.beginnerTutorial;
        }
        set beginnerTutorial(v) {
            this.data.beginnerTutorial = v;
            this.data.save();
        }
        set userData(v) {
            this.data.userData = v;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_UPDATA);
        }
        get userData() {
            return this.data.userData;
        }
        get taskList() {
            return this.data.taskList;
        }
        set taskList(v) {
            this.data.taskList = v.concat([]);
            this.data.save();
        }
        get diamond() {
            return this.data.diamond;
        }
        set diamond(v) {
            this.data.diamond = v;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_SWITCH_DIAMOND);
        }
        get money() {
            return this.data.money;
        }
        set money(v) {
            this.data.money = v;
            this.data.save();
            GameDispatcher.getInstance().event(EventName.USER_SWITCH_MONEY);
        }
        get upLvItemNum() {
            return this._upLvItemNum;
        }
        set upLvItemNum(v) {
            this._upLvItemNum = v.concat([]);
        }
        get useItemArr() {
            return this._useItemArr;
        }
        set useItemArr(v) {
            this._useItemArr = v;
            GameDispatcher.getInstance().event(EventName.USER_EQUIP_SELECT_ITEM);
        }
        removeTaskTime(v) {
            this.data.time = v;
            let taskList = this.data.taskList;
            taskList.forEach(task => { task.receive = false; task.count = 0; });
            this.taskList = taskList.concat([]);
            GameDispatcher.getInstance().event(EventName.USER_TASK_TIME_REMOVED);
        }
        set showTest(v) {
            this.data.showTest = v;
            this.data.save();
        }
        get showTest() {
            return this.data.showTest;
        }
        get firstLvTip() {
            return this.data.firstLvTip;
        }
        set firstLvTip(v) {
            this.data.firstLvTip = v;
            this.data.save();
        }
        get clickTipsList() {
            return this.data.clickTipsList;
        }
        set clickTipsList(v) {
            this.data.clickTipsList = v;
            this.data.save();
        }
        get payNumToday() {
            return this.data.payNumToday;
        }
        set payNumToday(v) {
            this.data.payNumToday = v;
            this.data.save();
        }
        get payNum() {
            return this.data.payNum;
        }
        set payNum(v) {
            this.data.payNum = v;
            this.data.save();
        }
        get useMoneyMoon() {
            return this.data.useMoneyMoon;
        }
        set useMoneyMoon(v) {
            this.data.useMoneyMoon = v;
            this.data.save();
        }
        get uid() {
            return this.data.uid;
        }
        setUid(v) {
            this.data.uid = v;
            this.data.save();
        }
        get lastBuyTime() {
            return this.data.lastBuyTime;
        }
        set lastBuyTime(v) {
            this.data.lastBuyTime = v;
            this.data.save();
        }
        get accountLevel() {
            return this.data.accountLevel;
        }
        set accountLevel(v) {
            this.data.accountLevel = v;
            this.data.save();
        }
    }

    class UIDefine {
    }
    UIDefine.UILoginCtl = "UILoginCtl";
    UIDefine.UIMainCtl = "UIMainCtl";
    UIDefine.UIGameCtl = "UIGameCtl";
    UIDefine.UIEndLessGameCtl = "UIEndLessGameCtl";
    UIDefine.UITaskCtl = "UITaskCtl";
    UIDefine.UIShopCtl = "UIShopCtl";
    UIDefine.UIBagCtl = "UIBagCtl";
    UIDefine.UIHeroUpCtl = "UIHeroUpCtl";
    UIDefine.UIGameWinCtl = "UIGameWinCtl";
    UIDefine.UIEndLessGameWinCtl = "UIEndLessGameWinCtl";
    UIDefine.UIGameFailCtl = "UIGameFailCtl";
    UIDefine.UIPlanStartCtl = "UIPlanStartCtl";
    UIDefine.UIArticleTipCtl = "UIArticleTipCtl";
    UIDefine.UIHeroInfoCtl = "UIHeroInfoCtl";
    UIDefine.UIEquipInfoCtl = "UIEquipInfoCtl";
    UIDefine.UIEquipUpLvCtl = "UIEquipUpLvCtl";
    UIDefine.UICallHeroCtl = "UICallHeroCtl";
    UIDefine.UISettingCtl = "UISettingCtl";
    UIDefine.Debug = "Debug";

    class DebugHelper {
        static get ctx() {
            if (this._ctx == null) {
                let ctxn = new Laya.Sprite();
                ctxn.name = "DebugNode";
                ctxn.zOrder = 99999;
                this._ctx = ctxn.graphics;
                Laya.stage.addChild(ctxn);
            }
            return this._ctx;
        }
    }
    DebugHelper.disableRailwayFind = false;
    DebugHelper.onlyRailwayFind = false;

    class CmdHelper {
        static init() {
            let window = Laya.Browser.window;
            window.UIMgr = UIMgr;
            window.UIDefine = UIDefine;
            window.AppConfig = AppConfig;
            window.UserModel = UserModel;
            window.DebugHelper = DebugHelper;
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
                window["tt"].vibrateShort({ success: null, fail: null, complete: null });
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

    class FontUtil {
        static registerBitMapFont(name, path, callback = null) {
            FontUtil.loadFont(name, path, callback);
        }
        static loadFont(name, path, callback = null) {
            var bitmapFont = new Laya.BitmapFont();
            bitmapFont.loadFont(path, new Laya.Handler(this, FontUtil.onFontLoaded, [name, bitmapFont, callback]));
        }
        static onFontLoaded(name, bitmapFont, callback = null) {
            Laya.Text.registerBitmapFont(name, bitmapFont);
            callback && callback();
        }
    }

    class Game {
    }
    Game.currentGroupID = 0;
    Game.isEndLessMode = 1;
    Game.round = 0;
    Game.Debug = false;

    class Model extends Singleton {
        init() {
        }
    }

    class GameModel extends Model {
        constructor() {
            super(...arguments);
            this._attack = [];
        }
        get enemyPos() {
            return this._enemyPos;
        }
        get attack() {
            return this._attack;
        }
        set attack(v) {
            this._attack = v;
        }
        gameOver() {
            GameDispatcher.getInstance().event(EventName.GAME_OVER);
        }
        selectPos(x, y) {
            this._enemyPos = new Laya.Point;
            this._enemyPos.setTo(x, y);
            GameDispatcher.getInstance().event(EventName.GAME_SELECT_ENEMY);
        }
    }

    class SoundManager {
        static playMainBgm() {
            let sound = new Laya.Sound();
            sound.load("res/sound/bgmMain.mp3");
            if (Laya.Browser.onAndroid || Laya.Browser.onTTMiniGame) {
                Laya.SoundManager.playMusic("res/sound/bgmMain.ogg", 0);
                Laya.SoundManager.autoStopMusic = false;
            }
            else {
                Laya.SoundManager.playMusic("res/sound/bgmMain.mp3", 0);
                Laya.SoundManager.autoStopMusic = false;
            }
        }
        static playGameBgm() {
            let sound = new Laya.Sound();
            sound.load("res/sound/bgmGame.mp3");
            if (Laya.Browser.onAndroid || Laya.Browser.onTTMiniGame) {
                Laya.SoundManager.playMusic("res/sound/bgmGame.ogg", 0);
                Laya.SoundManager.autoStopMusic = false;
            }
            else {
                Laya.SoundManager.playMusic("res/sound/bgmGame.mp3", 0);
                Laya.SoundManager.autoStopMusic = false;
            }
        }
        static clickSound() {
            let sound = new Laya.Sound();
            sound.load("res/sound/click.mp3");
            if (Laya.Browser.onAndroid || Laya.Browser.onTTMiniGame) {
                Laya.SoundManager.playSound("res/sound/click.ogg", 1);
            }
            else {
                Laya.SoundManager.playSound("res/sound/click.mp3", 1);
            }
        }
    }

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
        openUI(name, argc = null, isSound = null) {
            UIMgr.show(name, argc);
            if (isSound !== null) {
                SoundManager.clickSound();
            }
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
            var game;
            (function (game) {
                class characterUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/character");
                    }
                }
                game.characterUI = characterUI;
                REG("ui.view.game.characterUI", characterUI);
                class debugUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/debug");
                    }
                }
                game.debugUI = debugUI;
                REG("ui.view.game.debugUI", debugUI);
                class EndLessFightGameUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/EndLessFightGame");
                    }
                }
                game.EndLessFightGameUI = EndLessFightGameUI;
                REG("ui.view.game.EndLessFightGameUI", EndLessFightGameUI);
                class EndlessGameUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/EndlessGame");
                    }
                }
                game.EndlessGameUI = EndlessGameUI;
                REG("ui.view.game.EndlessGameUI", EndlessGameUI);
                class EndLessGameWinUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/EndLessGameWin");
                    }
                }
                game.EndLessGameWinUI = EndLessGameWinUI;
                REG("ui.view.game.EndLessGameWinUI", EndLessGameWinUI);
                class FightGameUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/FightGame");
                    }
                }
                game.FightGameUI = FightGameUI;
                REG("ui.view.game.FightGameUI", FightGameUI);
                class GameUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/Game");
                    }
                }
                game.GameUI = GameUI;
                REG("ui.view.game.GameUI", GameUI);
                class GameFailUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/GameFail");
                    }
                }
                game.GameFailUI = GameFailUI;
                REG("ui.view.game.GameFailUI", GameFailUI);
                class GameWinUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/GameWin");
                    }
                }
                game.GameWinUI = GameWinUI;
                REG("ui.view.game.GameWinUI", GameWinUI);
                class HeroAvatarItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/HeroAvatarItem");
                    }
                }
                game.HeroAvatarItemUI = HeroAvatarItemUI;
                REG("ui.view.game.HeroAvatarItemUI", HeroAvatarItemUI);
                class RoleAvatarUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/game/RoleAvatar");
                    }
                }
                game.RoleAvatarUI = RoleAvatarUI;
                REG("ui.view.game.RoleAvatarUI", RoleAvatarUI);
            })(game = view.game || (view.game = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var hero;
            (function (hero) {
                class EquipGainItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/hero/EquipGainItem");
                    }
                }
                hero.EquipGainItemUI = EquipGainItemUI;
                REG("ui.view.hero.EquipGainItemUI", EquipGainItemUI);
                class HeroInfoUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/hero/HeroInfo");
                    }
                }
                hero.HeroInfoUI = HeroInfoUI;
                REG("ui.view.hero.HeroInfoUI", HeroInfoUI);
                class HeroUpUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/hero/HeroUp");
                    }
                }
                hero.HeroUpUI = HeroUpUI;
                REG("ui.view.hero.HeroUpUI", HeroUpUI);
                class HeroUpItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/hero/HeroUpItem");
                    }
                }
                hero.HeroUpItemUI = HeroUpItemUI;
                REG("ui.view.hero.HeroUpItemUI", HeroUpItemUI);
                class SelectEquipItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/hero/SelectEquipItem");
                    }
                }
                hero.SelectEquipItemUI = SelectEquipItemUI;
                REG("ui.view.hero.SelectEquipItemUI", SelectEquipItemUI);
            })(hero = view.hero || (view.hero = {}));
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
            class SpeakMsgUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("view/SpeakMsg");
                }
            }
            view.SpeakMsgUI = SpeakMsgUI;
            REG("ui.view.SpeakMsgUI", SpeakMsgUI);
            class ttestUI extends View {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("view/ttest");
                }
            }
            view.ttestUI = ttestUI;
            REG("ui.view.ttestUI", ttestUI);
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var main;
            (function (main) {
                class ArticleTipUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/ArticleTip");
                    }
                }
                main.ArticleTipUI = ArticleTipUI;
                REG("ui.view.main.ArticleTipUI", ArticleTipUI);
                class BagUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/Bag");
                    }
                }
                main.BagUI = BagUI;
                REG("ui.view.main.BagUI", BagUI);
                class bagItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/bagItem");
                    }
                }
                main.bagItemUI = bagItemUI;
                REG("ui.view.main.bagItemUI", bagItemUI);
                class CallHeroUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/CallHero");
                    }
                }
                main.CallHeroUI = CallHeroUI;
                REG("ui.view.main.CallHeroUI", CallHeroUI);
                class EnemyAvatarItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/EnemyAvatarItem");
                    }
                }
                main.EnemyAvatarItemUI = EnemyAvatarItemUI;
                REG("ui.view.main.EnemyAvatarItemUI", EnemyAvatarItemUI);
                class EquipInfoUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/EquipInfo");
                    }
                }
                main.EquipInfoUI = EquipInfoUI;
                REG("ui.view.main.EquipInfoUI", EquipInfoUI);
                class EquipUpLvUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/EquipUpLv");
                    }
                }
                main.EquipUpLvUI = EquipUpLvUI;
                REG("ui.view.main.EquipUpLvUI", EquipUpLvUI);
                class EquipUpLvItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/EquipUpLvItem");
                    }
                }
                main.EquipUpLvItemUI = EquipUpLvItemUI;
                REG("ui.view.main.EquipUpLvItemUI", EquipUpLvItemUI);
                class LvItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/LvItem");
                    }
                }
                main.LvItemUI = LvItemUI;
                REG("ui.view.main.LvItemUI", LvItemUI);
                class MainUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/Main");
                    }
                }
                main.MainUI = MainUI;
                REG("ui.view.main.MainUI", MainUI);
                class PlanStartUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/main/PlanStart");
                    }
                }
                main.PlanStartUI = PlanStartUI;
                REG("ui.view.main.PlanStartUI", PlanStartUI);
            })(main = view.main || (view.main = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var removegame;
            (function (removegame) {
                class StarItemUI extends View {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/removegame/StarItem");
                    }
                }
                removegame.StarItemUI = StarItemUI;
                REG("ui.view.removegame.StarItemUI", StarItemUI);
            })(removegame = view.removegame || (view.removegame = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var setting;
            (function (setting) {
                class SettingUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/setting/Setting");
                    }
                }
                setting.SettingUI = SettingUI;
                REG("ui.view.setting.SettingUI", SettingUI);
            })(setting = view.setting || (view.setting = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var shop;
            (function (shop) {
                class ShopUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/shop/Shop");
                    }
                }
                shop.ShopUI = ShopUI;
                REG("ui.view.shop.ShopUI", ShopUI);
                class ShopItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/shop/ShopItem");
                    }
                }
                shop.ShopItemUI = ShopItemUI;
                REG("ui.view.shop.ShopItemUI", ShopItemUI);
            })(shop = view.shop || (view.shop = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var view;
        (function (view) {
            var task;
            (function (task) {
                class TaskUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/task/Task");
                    }
                }
                task.TaskUI = TaskUI;
                REG("ui.view.task.TaskUI", TaskUI);
                class TaskItemUI extends Dialog {
                    constructor() { super(); }
                    createChildren() {
                        super.createChildren();
                        this.loadScene("view/task/TaskItem");
                    }
                }
                task.TaskItemUI = TaskItemUI;
                REG("ui.view.task.TaskItemUI", TaskItemUI);
            })(task = view.task || (view.task = {}));
        })(view = ui.view || (ui.view = {}));
    })(ui || (ui = {}));

    class UITestCtl extends UIBaseCtl {
        uiEventList() {
            return [];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.ttestUI;
        }
        onLoad() {
            let img = new Laya.Sprite;
            this.view.addChild(img);
            this.ctx = img.graphics;
        }
        onShow() {
        }
    }

    class ConfigBase {
    }

    class CfgHero extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.type = data.type;
            this.avatar = data.avatar;
            this.img = data.img;
            this.hp = data.hp;
            this.lvmax = data.lvmax;
            this.aggress = data.aggress;
            this.gameavatar = data.gameavatar;
            this.star = data.star;
            this.defense = data.defense;
            this.career = data.career;
            this.debris = data.debris;
            this.activeskill = data.activeskill;
            this.starskill = data.starskill;
            this.passiveskill = data.passiveskill;
            this.skillarr = data.skillarr = "" ? [] : data.skillarr.split(',').map(v => parseInt(v));
            this.skurl = data.skurl;
            this.attacktype = data.attacktype;
            this.ismagic = data.ismagic;
            this.useskillarr = data.useskillarr = "" ? [] : data.useskillarr.split(',').map(v => parseInt(v));
            return this.id;
        }
        configName() {
            return "Hero";
        }
    }

    class CfgLevel extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.obstacle = !data.obstacle ? [] : data.obstacle.split(',').map(Number);
            if (typeof data.enemy == "number") {
                this.enemy = [];
                this.enemy.push(data.enemy);
            }
            else {
                this.enemy = data.enemy == "" ? [] : JSON.parse(data.enemy);
            }
            if (typeof data.item == "number") {
                this.item = [];
                this.item.push(data.item);
            }
            else {
                this.item = data.item == "" ? [] : JSON.parse(data.item);
            }
            return this.id;
        }
        configName() {
            return "Level";
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
        static randomShuffle(arr, isAffectOriginalArr = true) {
            let i = arr.length;
            if (isAffectOriginalArr == false) {
                arr = arr.concat([]);
            }
            while (i) {
                let j = Math.floor(Math.random() * i--);
                [arr[j], arr[i]] = [arr[i], arr[j]];
            }
            return arr;
        }
    }

    class BuffManager {
        constructor() {
            this.buffs = [];
            this.deBuffs = [];
            this.delbuffId = [];
        }
        addBuff(buff) {
            this.buffs.push(buff);
        }
        addDeBuff(buff) {
            this.deBuffs.push(buff);
        }
        update(delta = 1) {
            this.delbuffId = [];
            this.buffs = this.buffs.filter(buff => {
                let isEnd = buff.update(delta);
                if (isEnd && !this.delbuffId.includes(buff.id)) {
                    this.delbuffId.push(buff.id);
                }
                return buff.remainingTime > 0;
            });
            this.deBuffs = this.deBuffs.filter(deBuffs => {
                let isEnd = deBuffs.update(delta);
                if (isEnd && !this.delbuffId.includes(deBuffs.id)) {
                    this.delbuffId.push(deBuffs.id);
                }
                return deBuffs.remainingTime > 0;
            });
        }
        randomBuff() {
            let buffList = [
                { name: "attack", value: 0.2, round: 2, isPercentage: true },
                { name: "attack", value: 20, round: 2, isPercentage: false },
                { name: "attack", value: 50, round: 1, isPercentage: false },
                { name: "defense", value: 5, round: 2, isPercentage: false },
                { name: "defense", value: 0.1, round: 2, isPercentage: true },
                { name: "defense", value: 0.2, round: 2, isPercentage: true },
            ];
            let random = RandomUtil.randomInt(0, buffList.length);
            return buffList[random];
        }
    }

    class EndLessFightData extends Singleton {
        constructor() {
            super(...arguments);
            this.gameover = false;
            this.otherArr = [];
            this.selfArr = [];
            this.currentWave = 0;
            this.roundNum = 1;
        }
        setAvatarId(id) {
            this.clickItemId = id;
        }
        getSelfHeroIdList() {
            let heroIdArr = [];
            for (let i = 0; i < this.selfArr.length; i++) {
                if (this.selfArr[i]) {
                    heroIdArr.push(this.selfArr[i].cfg.type);
                }
            }
            return heroIdArr;
        }
        isShowStar(num) {
            let idArr = this.getSelfHeroIdList();
            if (idArr.includes(num)) {
                return true;
            }
            return false;
        }
        getColorAttack(color) {
            let attackSum = 0;
            for (let i = 0; i < this.selfArr.length; i++) {
                if (this.selfArr[i]) {
                    this.selfArr[i].cfg.type == color ? attackSum += this.selfArr[i].getData().attack : null;
                }
            }
            return attackSum;
        }
        nextWave() {
            this.currentWave++;
            GameDispatcher.getInstance().event(EventName.GAME_NEXT_WAVE_ENDLESS);
        }
        clearUnit() {
            this.gameover = true;
            for (let i = 0; i < this.otherArr.length; i++) {
                this.otherArr[i].unitSk.offAll();
                this.otherArr[i].unitSk.stop();
                this.otherArr[i].destroy(true);
            }
            for (let i = 0; i < this.selfArr.length; i++) {
                this.selfArr[i].unitSk.offAll();
                this.selfArr[i].unitSk.stop();
                this.selfArr[i].destroy(true);
            }
        }
    }

    class EndLessFightGame {
        init() {
            GameDispatcher.getInstance().on(EventName.GAME_START, this, this.cancelEvent);
            this.fightData = new EndLessFightData();
            this.fightData.buffmgr = new BuffManager();
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (this.fightData.otherArr[i] !== null) {
                    this.fightData.otherArr[i].destroy();
                }
            }
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                if (this.fightData.otherArr[i] !== null) {
                    this.fightData.selfArr[i].destroy();
                }
            }
            this.fightData.otherArr = [];
            this.fightData.selfArr = [];
            this.testHp();
        }
        start() {
            this.fightData.targetIndex = 0;
            this.fightData.selfIndex = 0;
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                this.fightData.otherArr[i].on(Laya.Event.CLICK, this, this.onClickItem, [i]);
            }
            this.onClickItem(0);
        }
        onClickItem(index) {
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (this.fightData.otherArr[i]) {
                    this.fightData.otherArr[i].select.visible = false;
                }
            }
            this.fightData.otherArr[index].select.visible = true;
            this.fightData.targetIndex = index;
            if (!this.fightData.otherArr[index].parent) {
                return;
            }
            let father = this.fightData.otherArr[index].parent.parent;
            let monsterFather = this.fightData.otherArr[index].parent;
            let pos1 = monsterFather.localToGlobal(new Laya.Point(this.fightData.otherArr[index].x, this.fightData.otherArr[index].y));
            let fatherPos = father.globalToLocal(new Laya.Point(pos1.x, pos1.y));
            GameModel.getInstance().selectPos(fatherPos.x, fatherPos.y);
        }
        switchSelectMonster() {
            let isWin = true;
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                this.fightData.otherArr[i].on(Laya.Event.CLICK, this, this.onClickItem, [i]);
            }
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (!this.fightData.otherArr[i].isDie) {
                    isWin = false;
                    this.fightData.targetIndex = i;
                    this.onClickItem(this.fightData.targetIndex);
                    Game.endLessMgr.clearNow = false;
                    return isWin;
                }
            }
            return isWin;
        }
        clearSelfArr() {
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                if (this.fightData.selfArr[i] !== null) {
                    this.fightData.selfArr[i].destroy();
                }
            }
            this.fightData.selfArr = [];
        }
        cancelEvent() {
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                this.fightData.selfArr[i].offAll();
            }
        }
        testHp() {
            Laya.Browser.window.startHpEL = EndLessFightGame.startReduceHp;
            Laya.Browser.window.startHpSelfEL = EndLessFightGame.startReduceHpSelf;
        }
        static startReduceHp(reduceHp = 0) {
            let fightgame = Game.endLessFightGame;
            for (let i = 0; i < fightgame.fightData.otherArr.length; i++) {
                if (reduceHp == 0) {
                    let hp = fightgame.fightData.otherArr[i].getData().blood - 1;
                    fightgame.fightData.otherArr[i].bloodCount(-hp);
                    console.log(fightgame.fightData.otherArr[i].cfg.name + "减少" + hp + "生命值", "剩余" + fightgame.fightData.otherArr[i].getData().blood);
                }
                else {
                    fightgame.fightData.otherArr[i].bloodCount(-reduceHp);
                    console.log(fightgame.fightData.otherArr[i].cfg.name + "减少" + reduceHp + "生命值", "剩余" + fightgame.fightData.otherArr[i].getData().blood);
                }
            }
        }
        static startReduceHpSelf(reduceHp = 0) {
            let fightgame = Game.endLessFightGame;
            for (let i = 0; i < fightgame.fightData.selfArr.length; i++) {
                if (reduceHp == 0) {
                    let hp = fightgame.fightData.selfArr[i].getData().blood - 1;
                    fightgame.fightData.selfArr[i].bloodCount(-hp);
                    console.log(fightgame.fightData.selfArr[i].cfg.name + "减少" + hp + "生命值", "剩余" + fightgame.fightData.selfArr[i].getData().blood);
                }
                else {
                    fightgame.fightData.selfArr[i].bloodCount(-reduceHp);
                    console.log(fightgame.fightData.selfArr[i].cfg.name + "减少" + reduceHp + "生命值", "剩余" + fightgame.fightData.selfArr[i].getData().blood);
                }
            }
        }
    }

    class CfgMonster extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.hp = data.hp;
            this.aggressivity = data.aggressivity;
            data.skin ? this.skin = data.skin : this.skin = null;
            this.defense = data.defense;
            this.skurl = data.skurl;
            this.attacktype = data.attacktype;
            this.isBoss = data.isBoss;
            data.attackeffect ? this.attackeffect = data.attackeffect : this.attackeffect = null;
            this.ismagic = data.ismagic;
            return this.id;
        }
        configName() {
            return "Monster";
        }
    }

    class FixedEffect extends Laya.Sprite {
        constructor() {
            super();
            this.sk = new Laya.Skeleton;
            this.sk.url = FixedEffect.skUrl;
            this.addChild(this.sk);
        }
        static createEffect(skUrl) {
            FixedEffect.skUrl = skUrl;
            return new FixedEffect();
        }
        playAnimOnce(callback = null) {
            Laya.timer.frameOnce(3, this, () => {
                this.sk.offAll();
                this.sk.play(0, false);
                this.sk.on(Laya.Event.STOPPED, this, () => {
                    callback && callback();
                    this.recover();
                });
            });
        }
        recover() {
            this.removeSelf();
        }
    }

    class AttackEffectBase {
    }

    class AttackEffectAll extends AttackEffectBase {
        attackEffect10001(fatherNode, x, y) {
            console.log("attackEffect10001", x, y, fatherNode);
            let effectNum = RandomUtil.randomInt(3, 6);
            for (let i = 0; i < effectNum; i++) {
                let randomTime = RandomUtil.randomInt(200, 800) + (i * 200);
                Laya.timer.once(randomTime, this, () => {
                    let randomX = RandomUtil.randomInt(-100, 100) + x;
                    let randomY = RandomUtil.randomInt(-100, 100) + y;
                    let effect = FixedEffect.createEffect("res/game/skillskeleton/luo_nangua.sk");
                    effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                        fatherNode.addChild(effect);
                        effect.pos(randomX, randomY);
                        effect.playAnimOnce();
                    }));
                });
            }
        }
    }

    class Buff {
        constructor(effectType, effectValue, duration, target, isPercentage = false) {
            this.effectType = effectType;
            this.effectValue = effectValue;
            this.duration = duration;
            this.remainingTime = duration;
            this.target = target;
            this.id = this.target.id;
            this.isPercentage = isPercentage;
        }
        applyTo() {
            if (this.target[`${this.effectType}`]) {
                let type = this.target.getData()[`${this.effectType}`];
                if (this.isPercentage) {
                    let Magnification = (type * this.effectValue);
                    this.target.buffAddition[`${this.effectType}`] += Magnification;
                }
                else {
                    this.target.buffAddition[`${this.effectType}`] += this.effectValue;
                }
            }
        }
        update(delta) {
            this.remainingTime -= delta;
            if (this.remainingTime <= 0) {
                this.remove();
                return true;
            }
            return false;
        }
        remove() {
            this.target.buffAddition[`${this.effectType}`] = 0;
        }
    }

    class DeBuff {
        constructor(effectType, effectValue, duration, target, caster, casterType, isPercentage = false) {
            this.effectType = effectType;
            this.effectValue = effectValue;
            this.duration = duration;
            this.remainingTime = duration;
            this.target = target;
            this.caster = caster;
            this.casterType = casterType;
            this.isPercentage = isPercentage;
            this.id = this.target.id;
        }
        applyTo() {
            if (this.target[`${this.effectType}`]) {
                if (this.effectType !== "blood") {
                    let type = this.caster.getData()[`${this.casterType}`];
                    if (this.isPercentage) {
                        let Magnification = (type * this.effectValue);
                        this.target.buffAddition[`${this.effectType}`] -= Magnification;
                    }
                    else {
                        this.target.buffAddition[`${this.effectType}`] -= this.effectValue;
                    }
                }
            }
        }
        update(delta) {
            this.remainingTime -= delta;
            if (this.effectType == "blood") {
                let type = this.caster.getData()[`${this.casterType}`];
                if (this.isPercentage) {
                    let Magnification = Math.floor((type * this.effectValue));
                    this.target.bloodCount(-Magnification);
                }
                else {
                    this.target.bloodCount(-this.effectValue);
                }
            }
            if (this.remainingTime <= 0) {
                this.remove();
                return true;
            }
            return false;
        }
        remove() {
            this.target.buffAddition[`${this.effectType}`] = 0;
        }
    }

    class HeroAvatar extends Singleton {
        constructor() {
            super(...arguments);
            this.avatarDataList = [];
            this.endLessAvatarList = [];
            this.fractionArr = [];
        }
        setAvatarList(data) {
            this.avatarDataList = data;
            GameDispatcher.getInstance().on(EventName.GAME_HERO_DIE, this, this.deleteAvatar);
        }
        setEndLessAvatarDataList(data) {
            this.endLessAvatarList = data;
            GameDispatcher.getInstance().on(EventName.GAME_HERO_DIE, this, this.deleteAvatarEndLess);
        }
        deleteAvatar(id) {
            let find = this.avatarDataList.find(item => item.heroId === id);
            console.log("闯关模式，死亡的英雄id==" + id, "是否成功==", find);
            if (find) {
                find.modifyCdMask(null);
            }
        }
        deleteAvatarEndLess(id) {
            let find = this.endLessAvatarList.find(item => item.heroId === id);
            if (find) {
                find.runAround();
            }
        }
        setFractionArr(data) {
            this.fractionArr = data;
            let yellowFr = 0;
            let blueFr = 0;
            let redFr = 0;
            let greenFr = 0;
            for (let i = 0; i < this.fractionArr.length; i++) {
                switch (this.fractionArr[i][0]) {
                    case 1:
                        if (this.fractionArr[i][1] == 20) {
                            yellowFr += 20;
                        }
                        else {
                            yellowFr += 50;
                        }
                        break;
                    case 2:
                        if (this.fractionArr[i][1] == 20) {
                            blueFr += 20;
                        }
                        else {
                            blueFr += 50;
                        }
                        break;
                    case 3:
                        if (this.fractionArr[i][1] == 20) {
                            redFr += 20;
                        }
                        else {
                            redFr += 50;
                        }
                        break;
                    case 4:
                        if (this.fractionArr[i][1] == 20) {
                            greenFr += 20;
                        }
                        else {
                            greenFr += 50;
                        }
                        break;
                    default:
                        break;
                }
            }
            for (let i = 0; i < this.avatarDataList.length; i++) {
                switch (this.avatarDataList[i].type) {
                    case 1:
                        yellowFr !== 0 ? this.avatarDataList[i].modifyCdMask(yellowFr) : null;
                        break;
                    case 2:
                        blueFr !== 0 ? this.avatarDataList[i].modifyCdMask(blueFr) : null;
                        break;
                    case 3:
                        redFr !== 0 ? this.avatarDataList[i].modifyCdMask(redFr) : null;
                        break;
                    case 4:
                        greenFr !== 0 ? this.avatarDataList[i].modifyCdMask(greenFr) : null;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    class SkillBase {
        onAwake() {
        }
        getTargetIndex() {
            let targetIndex;
            if (Game.isEndLessMode == 2) {
                targetIndex = Game.endLessFightGame.fightData.targetIndex;
            }
            else {
                targetIndex = Game.fightGame.fightData.targetIndex;
            }
            return targetIndex;
        }
        getUnitPos(id, type) {
            let pos;
            if (Game.isEndLessMode == 2) {
                pos = Game.endLessMgr.getUnitPos(id, type);
            }
            else {
                pos = Game.fightManager.getUnitPos(id, type);
            }
            return pos;
        }
        getMonster() {
            let otherIndex = this.getTargetIndex();
            let monster;
            if (Game.isEndLessMode == 2) {
                let other = Game.endLessFightGame.fightData.otherArr;
                monster = other[otherIndex];
                if (monster) {
                    if (monster.isDie) {
                        for (let i = 0; i < other.length; i++) {
                            if (!other[i].isDie) {
                                monster = other[i];
                            }
                        }
                    }
                }
            }
            else {
                let other = Game.fightGame.fightData.otherArr;
                monster = Game.fightGame.fightData.otherArr[otherIndex];
                if (monster) {
                    if (monster.isDie) {
                        for (let i = 0; i < other.length; i++) {
                            if (!other[i].isDie) {
                                monster = other[i];
                            }
                        }
                    }
                }
            }
            return monster;
        }
        getSeveralMonsters(num) {
            let otherIndex = this.getTargetIndex();
            let otherArr = [];
            let returnArr = [];
            if (Game.isEndLessMode == 2) {
                otherArr = Game.endLessFightGame.fightData.otherArr;
                if (!otherArr[otherIndex].isDie) {
                    returnArr.push(otherArr[otherIndex]);
                }
                for (let i = 0; i < otherArr.length; i++) {
                    if (i !== otherIndex && !otherArr[i].isDie) {
                        returnArr.push(otherArr[i]);
                        if (returnArr.length == num) {
                            break;
                        }
                    }
                }
            }
            else if (Game.isEndLessMode == 1) {
                otherArr = Game.fightGame.fightData.otherArr;
                if (!otherArr[otherIndex].isDie) {
                    returnArr.push(otherArr[otherIndex]);
                }
                for (let i = 0; i < otherArr.length; i++) {
                    if (i !== otherIndex && !otherArr[i].isDie) {
                        returnArr.push(otherArr[i]);
                        if (returnArr.length == (num - 1)) {
                            break;
                        }
                    }
                }
            }
            return returnArr;
        }
        getHeroSelfList() {
            let selfArr = [];
            if (Game.isEndLessMode == 1) {
                selfArr = Game.fightGame.fightData.selfArr;
            }
            else if (Game.isEndLessMode == 2) {
                selfArr = Game.endLessFightGame.fightData.selfArr;
            }
            return selfArr;
        }
        getHero(heroId) {
            let skillHero;
            let heroSelf = this.getHeroSelfList();
            for (let i = 0; i < heroSelf.length; i++) {
                if (heroSelf[i].id == heroId) {
                    skillHero = heroSelf[i];
                    break;
                }
            }
            return skillHero;
        }
        getOtherArr() {
            let other = [];
            if (Game.isEndLessMode == 2) {
                other = Game.endLessFightGame.fightData.otherArr;
            }
            else if (Game.isEndLessMode == 1) {
                other = Game.fightGame.fightData.otherArr;
            }
            return other;
        }
    }

    class SkillAll extends SkillBase {
        onAwake() {
        }
        skill5001(heroId, callback = null) {
            let skillHero = this.getHero(heroId);
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                callback && callback();
                return;
            }
            let fatherNode = monster.parent;
            let monsterPos = new Laya.Point(monster.x, monster.y);
            let heroAttackPower = skillHero.getData().attack * 8;
            if (skillHero.isDie) {
                callback && callback();
                return;
            }
            let Pos = this.getUnitPos(otherIndex, 2);
            skillHero.zOrder = 10;
            skillHero.unitSk.play("move", true);
            Laya.Tween.to(skillHero, { x: Pos.x - 230, y: Pos.y - 10 }, 500, null, Laya.Handler.create(this, () => {
                skillHero.unitSk.play("skill", false);
                skillHero.unitSk.offAll();
                skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                    let effect = FixedEffect.createEffect("res/game/skillskeleton/hero_atk1_1.sk");
                    Game.load.newEffect(effect, () => {
                        fatherNode.addChild(effect);
                        effect.pos(monsterPos.x, monsterPos.y);
                        effect.playAnimOnce();
                    });
                    monster.bloodCount(-heroAttackPower);
                    skillHero.unitSk.play("move", true);
                    skillHero.unitSk.scale(-0.45, 0.45);
                    Laya.Tween.to(skillHero, { x: skillHero.initPos.x, y: skillHero.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                        skillHero.zOrder = skillHero.initZOrder;
                        skillHero.unitSk.play("stand", true);
                        skillHero.unitSk.scale(0.45, 0.45);
                        callback && callback();
                    }));
                });
            }));
        }
        skill5002(heroId, callback = null) {
            let skillHero = this.getHero(heroId);
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                callback && callback();
                return;
            }
            let buff = new Buff("attack", 0.2, 2, skillHero, true);
            buff.applyTo();
            let heroAttackPower = skillHero.getData().attack * 2;
            Game.fightGame.fightData.buffmng.addBuff(buff);
            let selfArr = Game.fightGame.fightData.selfArr;
            let survivingHero = [];
            for (let i = 0; i < selfArr.length; i++) {
                if (!selfArr[i].isDie && selfArr[i].id !== skillHero.id) {
                    survivingHero.push(selfArr[i]);
                }
            }
            if (survivingHero.length >= 1) {
                let randomNum = RandomUtil.randomInt(0, survivingHero.length);
                let randomBuff = Game.fightGame.fightData.buffmng.randomBuff();
                let buff = new Buff(randomBuff.name, randomBuff.value, randomBuff.round, survivingHero[randomNum], randomBuff.isPercentage);
                buff.applyTo();
                Game.fightGame.fightData.buffmng.addBuff(buff);
            }
            skillHero.unitSk.play("move", true);
            skillHero.zOrder = 10;
            Laya.Tween.to(skillHero, { x: monster.x - 200, y: monster.y }, 500, null, Laya.Handler.create(this, () => {
                let effect = FixedEffect.createEffect("res/game/skillskeleton/zhanshi_putong.sk");
                let fatherNode = skillHero.parent;
                Game.load.newEffect(effect, () => {
                    fatherNode.addChild(effect);
                    effect.pos(monster.x, monster.y);
                    effect.playAnimOnce();
                });
                skillHero.unitSk.play("attack", false);
                skillHero.unitSk.offAll();
                skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                    skillHero.unitSk.play("move", true);
                    monster.bloodCount(-heroAttackPower);
                    skillHero.unitSk.scale(-0.45, 0.45);
                    Laya.Tween.to(skillHero, { x: skillHero.initPos.x, y: skillHero.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                        skillHero.zOrder = skillHero.initZOrder;
                        skillHero.unitSk.play("stand", true);
                        skillHero.unitSk.scale(0.45, 0.45);
                        callback && callback();
                    }));
                });
            }));
        }
        skill5003(heroId = 6) {
            let skillHero = this.getHero(heroId);
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                return;
            }
            this.skill5002(heroId);
            let list = HeroAvatar.getInstance().avatarDataList;
            for (let i = 0; i < list.length; i++) {
                if (list[i].heroId === heroId) {
                    list[i].modifyCdMask(60);
                    break;
                }
            }
        }
        skill9001(heroId, callback = null) {
            let skillHero = this.getHero(heroId);
            console.log(skillHero);
            if (skillHero.isDie) {
                callback && callback();
                return;
            }
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                callback && callback();
                return;
            }
            let heroAttackPower = skillHero.getData().attack * 4;
            let fatherNode = monster.parent;
            let Pos = this.getUnitPos(otherIndex, 2);
            skillHero.zOrder = 10;
            skillHero.unitSk.play("move", true);
            Laya.Tween.to(skillHero, { x: Pos.x - 130, y: Pos.y - 10 }, 500, null, Laya.Handler.create(this, () => {
                skillHero.unitSk.play("skill", false);
                let effect = FixedEffect.createEffect("res/game/skillskeleton/luo_huoyan.sk");
                Laya.timer.once(500, this, () => {
                    monster.bloodCount(-heroAttackPower);
                });
                Laya.timer.once(1700, this, () => {
                    monster.bloodCount(-heroAttackPower);
                });
                effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                    fatherNode.addChild(effect);
                    effect.pos(Pos.x, Pos.y);
                    effect.playAnimOnce();
                }));
                skillHero.unitSk.offAll();
                skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                    skillHero.unitSk.play("move", true);
                    skillHero.unitSk.scale(-0.45, 0.45);
                    Laya.Tween.to(skillHero, { x: skillHero.initPos.x, y: skillHero.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                        skillHero.zOrder = skillHero.initZOrder;
                        skillHero.unitSk.play("stand", true);
                        skillHero.unitSk.scale(0.45, 0.45);
                        callback && callback();
                    }));
                });
            }));
        }
        skill9002(heroId, callback = null) {
            let skillHero = this.getHero(heroId);
            if (skillHero.isDie) {
                return;
            }
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                callback && callback();
                return;
            }
            let heroAttackPower = skillHero.getData().attack * 2;
            let fatherNode = monster.parent;
            let Pos = this.getUnitPos(otherIndex, 2);
            skillHero.zOrder = 10;
            skillHero.unitSk.play("move", true);
            Laya.Tween.to(skillHero, { x: Pos.x - 130, y: Pos.y - 10 }, 500, null, Laya.Handler.create(this, () => {
                skillHero.unitSk.play("attack", false);
                let debuff = new DeBuff("blood", 0.6, 3, monster, skillHero, "attack", true);
                debuff.applyTo();
                Game.fightGame.fightData.buffmng.addDeBuff(debuff);
                let effect = FixedEffect.createEffect("res/game/skillskeleton/luo_huzhua.sk");
                Game.load.newEffect(effect, () => {
                    fatherNode.addChild(effect);
                    effect.pos(Pos.x, Pos.y);
                    effect.playAnimOnce();
                });
                skillHero.unitSk.offAll();
                skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                    monster.bloodCount(-heroAttackPower);
                    skillHero.unitSk.play("move", true);
                    skillHero.unitSk.scale(-0.45, 0.45);
                    Laya.Tween.to(skillHero, { x: skillHero.initPos.x, y: skillHero.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                        skillHero.zOrder = skillHero.initZOrder;
                        skillHero.unitSk.play("stand", true);
                        skillHero.unitSk.scale(0.45, 0.45);
                        callback && callback();
                    }));
                });
            }));
        }
        skill9003(heroId = 3, callback = null) {
            let skillHero = this.getHero(heroId);
            if (skillHero.isDie) {
                return;
            }
            let otherIndex = this.getTargetIndex();
            let monster = this.getMonster();
            if (!monster) {
                callback && callback();
                return;
            }
            let deBuffs = Game.fightGame.fightData.buffmng.deBuffs;
            for (let i = 0; i < deBuffs.length; i++) {
                if (deBuffs[i].id == monster.id) {
                    console.log("当前怪物存在debuff");
                    skillHero.tembuff.criticalChance += 30;
                    let attack = skillHero.tembuff.getData.attack * (2 / 10);
                    skillHero.tembuff.attack += attack;
                    callback && callback();
                }
            }
        }
        skill1001(heroId, callback = null) {
            let heroList = this.getHeroSelfList();
            let skillHero = this.getHero(heroId);
            if (skillHero.isDie) {
                callback && callback();
                return;
            }
            skillHero.unitSk.play("skill", false);
            skillHero.unitSk.offAll();
            skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                skillHero.unitSk.play("stand", true);
            });
            Laya.timer.once(500, this, () => {
                for (let i = 0; i < heroList.length; i++) {
                    if (!heroList[i].isDie) {
                        let maxHp = heroList[i].maxHp;
                        let addHp = Math.ceil(maxHp * (25 / 100));
                        heroList[i].bloodCount(addHp);
                        let fatherNode = heroList[i].parent;
                        let heroPos = new Laya.Point(heroList[i].x, heroList[i].y);
                        let effect = FixedEffect.createEffect("res/game/skillskeleton/aid_buff_1.sk");
                        Game.load.newEffect(effect, () => {
                            fatherNode.addChild(effect);
                            effect.pos(heroPos.x, heroPos.y);
                            effect.playAnimOnce();
                        });
                    }
                }
                callback && callback();
            });
        }
        skill2001(heroId, callback = null) {
            let skillHero = this.getHero(heroId);
            let otherArr = this.getOtherArr();
            let monster = this.getMonster();
            let attackDamage = Math.floor(skillHero.getData().attack * (1.6));
            if (skillHero.isDie) {
                callback && callback();
                return;
            }
            skillHero.unitSk.offAll();
            skillHero.unitSk.play("skill", false);
            skillHero.unitSk.on(Laya.Event.STOPPED, this, () => {
                for (let i = 0; i < 10; i++) {
                    let fatherNode = monster.parent;
                    if (!fatherNode) {
                        if (i == 9) {
                            skillHero.unitSk.play("stand", true);
                            callback && callback();
                            return;
                        }
                        continue;
                    }
                    Laya.timer.once(i * 500, this, () => {
                        let notDieArr = [];
                        for (let j = 0; j < otherArr.length; j++) {
                            if (!otherArr[j].isDie) {
                                notDieArr.push(j);
                            }
                        }
                        if (notDieArr.length == 0) {
                            Laya.timer.clearAll(this);
                            callback && callback();
                            return;
                        }
                        let random = RandomUtil.randomInt(0, notDieArr.length);
                        let index = notDieArr[random];
                        let effect = FixedEffect.createEffect("res/game/skillskeleton/hero_atk2.sk");
                        Game.load.newEffect(effect, () => {
                            fatherNode.addChild(effect);
                            effect.pos(otherArr[index].x, otherArr[index].y);
                            effect.playAnimOnce();
                        });
                        otherArr[index].bloodCount(-attackDamage);
                        if (i == 9) {
                            skillHero.unitSk.play("stand", true);
                            Laya.timer.clearAll(this);
                            callback && callback();
                            return;
                        }
                    });
                }
            });
        }
    }

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

    class RangedAttack extends Laya.Sprite {
        constructor(dir) {
            super();
            this.sk = new Laya.Skeleton;
            this.sk.url = RangedAttack.skUrl;
            this.addChild(this.sk);
            if (dir == "向右") {
                this.sk.scaleX = 1;
            }
            else if (dir == "向左") {
                this.sk.scaleX = -1;
            }
        }
        static createSk(skUrl) {
            if (skUrl == 1) {
                RangedAttack.skUrl = "res/game/skattack/hero_atk1.sk";
                return new RangedAttack("向右");
            }
            else if (skUrl == 2) {
                RangedAttack.skUrl = "res/game/skattack/mon_atk1.sk";
                return new RangedAttack("向左");
            }
        }
        posMoveToPos(x1, y1, x2, y2, target, other, delay = 0) {
            this.pos(x1, y1);
            let distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
            let time = 300;
            this.offAll();
            Laya.Tween.to(this, { x: x2, y: y2 }, time, null, Laya.Handler.create(this, function () {
                this.recover();
                target.bloodCount(-other.getData().attack);
            }), delay);
        }
        recover() {
            this.removeSelf();
        }
    }

    class CfgItem extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.type = data.type;
            this.img = data.img;
            this.tip = data.tip;
            data.career ? this.career = data.career : this.career = null;
            data.addhp ? this.addhp = data.addhp : this.addhp = null;
            data.attack ? this.attack = data.attack : this.attack = null;
            data.defense ? this.defense = data.defense : this.defense = null;
            (data.equiptype !== null || data.equiptype !== undefined) ? this.equiptype = data.equiptype : this.equiptype = null;
            data.quality ? this.quality = data.quality : this.quality = null;
            data.hero ? this.hero = data.hero : this.hero = null;
            this.maxlv = data.maxlv ? data.maxlv : null;
            return this.id;
        }
        configName() {
            return "Item";
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
        static isSameMoon(timeStamp1, timeStamp2) {
            let date1 = new Date(timeStamp1 * 1000);
            let date2 = new Date(timeStamp2 * 1000);
            let y1 = date1.getFullYear();
            let y2 = date2.getFullYear();
            let m1 = date1.getMonth();
            let m2 = date2.getMonth();
            if (y1 !== y2) {
                return false;
            }
            if (y1 == y2 && m1 !== m2) {
                return false;
            }
            return true;
        }
        static todayStart() {
            return new Date(new Date().toLocaleDateString()).getTime();
        }
        static todayEnd() {
            return new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1;
        }
    }

    class ItemSerializable extends Serializable {
        constructor() {
            super(...arguments);
            this.drawCardNum = 0;
            this.drawCardTime = 0;
            this.getHero = false;
        }
    }

    class ItemModel extends Singleton {
        constructor() {
            super();
            this._maxCardNum = 50;
            this.init();
        }
        init() {
            this.data = new ItemSerializable();
            this.data.load();
        }
        set drawCardNum(v) {
            this.data.drawCardNum = v;
            this.data.save();
        }
        get drawCardNum() {
            return this.data.drawCardNum;
        }
        set drawCardTime(v) {
            this.data.drawCardTime = v;
            this.data.save();
        }
        get drawCardTime() {
            return this.data.drawCardTime;
        }
        set maxCardNum(v) {
            this._maxCardNum = v;
        }
        get maxCardNum() {
            return this._maxCardNum;
        }
    }

    class itemManager {
        static equipPower() {
            let goodsList = UserModel.getInstance().goodsList;
            for (let i = 0; i < goodsList.length; i++) {
                if (goodsList[i].lv) {
                    let lv = goodsList[i].lv - 1;
                    let attack = lv * 5;
                    let defense = lv * 1;
                    let hp = lv * 20;
                    let defaultValue = ConfigManager.GetConfigByKey(CfgItem, goodsList[i].id);
                    let defaultPower = defaultValue.addhp + defaultValue.attack + defaultValue.defense;
                    goodsList[i].power = attack + defense + hp + defaultPower;
                }
            }
            UserModel.getInstance().goodsList = goodsList;
        }
        static addItem(id, number) {
            let cfg = ConfigManager.GetConfigByKey(CfgItem, id);
            if (cfg.type == 99) {
                return;
            }
            else if (cfg.id == 1002) {
                let money = UserModel.getInstance().money;
                money += number;
                UserModel.getInstance().money = money;
                return;
            }
            let goodsList = UserModel.getInstance().goodsList;
            let addItem;
            if (cfg.type !== 3) {
                let findIndex = goodsList.findIndex(item => item.id === id);
                if (findIndex !== -1) {
                    goodsList[findIndex].number += number;
                }
                else {
                    addItem = { id: id, number: number };
                    goodsList.push(addItem);
                }
            }
            else {
                for (let n = 0; n < number; n++) {
                    let maxId = 1;
                    for (let i = 0; i < goodsList.length; i++) {
                        if (goodsList[i].onlyId >= 1) {
                            goodsList[i].onlyId >= maxId ? maxId = goodsList[i].onlyId + 1 : null;
                        }
                    }
                    addItem = { id: id, onlyId: maxId, number: 1, lv: 1, maxLv: 50, useHeroId: null, power: 0, equiptype: cfg.equiptype, exp: 0 };
                    goodsList.push(addItem);
                }
            }
            UserModel.getInstance().goodsList = goodsList.concat([]);
        }
        static getStrongestPower(heroId) {
            let cfgHero = ConfigManager.GetConfigByKey(CfgHero, heroId);
            let type = cfgHero.career;
            itemManager.equipPower();
            let goodsList = UserModel.getInstance().goodsList;
            let clothingPower = 0;
            let clothing = [];
            let helmetPower = 0;
            let helmet = [];
            let cloakPower = 0;
            let cloak = [];
            for (let i = 0; i < goodsList.length; i++) {
                let cfgItem = ConfigManager.GetConfigByKey(CfgItem, goodsList[i].id);
                if (goodsList[i].equiptype !== undefined && cfgItem.career === type) {
                    switch (goodsList[i].equiptype) {
                        case 0:
                            (goodsList[i].power > clothingPower && (goodsList[i].useHeroId == heroId || goodsList[i].useHeroId == null))
                                ? (clothingPower = goodsList[i].power, clothing = [goodsList[i].id, goodsList[i].onlyId]) : null;
                            break;
                        case 1:
                            (goodsList[i].power > helmetPower && (goodsList[i].useHeroId == heroId || goodsList[i].useHeroId == null))
                                ? (helmetPower = goodsList[i].power, helmet = [goodsList[i].id, goodsList[i].onlyId]) : null;
                            break;
                        case 2:
                            (goodsList[i].power > cloakPower && (goodsList[i].useHeroId == heroId || goodsList[i].useHeroId == null))
                                ? (cloakPower = goodsList[i].power, cloak = [goodsList[i].id, goodsList[i].onlyId]) : null;
                            break;
                        default:
                            break;
                    }
                }
            }
            return { clothing: clothing, helmet: helmet, cloak: cloak };
        }
        static equipData(onlyId) {
            let goodsList = UserModel.getInstance().goodsList;
            let item = goodsList.find(item => item.onlyId === onlyId);
            let defaultValue = ConfigManager.GetConfigByKey(CfgItem, item.id);
            let lv = item.lv - 1;
            let attack = lv * 5;
            let defense = lv * 0.2;
            let hp = lv * 10;
            if (item) {
                return { hp: hp + defaultValue.addhp, aggress: attack + defaultValue.attack, defense: defense + defaultValue.defense };
            }
            return null;
        }
        static clearModelGoodsList() {
            let goodsList = UserModel.getInstance().goodsList;
            for (let i = goodsList.length - 1; i >= 0; i--) {
                goodsList[i].number <= 0 ? goodsList.splice(i, 1) : null;
            }
            UserModel.getInstance().goodsList = goodsList.concat([]);
        }
        static refreshGoodsList() {
            let goodsList = UserModel.getInstance().goodsList;
            for (let i = 0; i < goodsList.length; i++) {
                let cfgItem = ConfigManager.GetConfigByKey(CfgItem, goodsList[i].id);
                if (goodsList[i].equiptype !== null && goodsList[i].equiptype !== undefined) {
                    goodsList[i].equiptype = cfgItem.equiptype;
                }
            }
            UserModel.getInstance().goodsList = goodsList.concat([]);
        }
        static selectTypeEquip(type, career) {
            let goodsList = UserModel.getInstance().goodsList;
            let equipArr = [];
            for (let i = 0; i < goodsList.length; i++) {
                if (goodsList[i].equiptype === type) {
                    let cfgItem = ConfigManager.GetConfigByKey(CfgItem, goodsList[i].id);
                    if (cfgItem.career === career) {
                        equipArr.push(goodsList[i].onlyId);
                    }
                }
            }
            return equipArr;
        }
        static getGoodsNum(id) {
            let goodsList = UserModel.getInstance().goodsList;
            let goods = goodsList.find(item => item.id === id);
            if (goods) {
                return goods.number;
            }
            return 0;
        }
        static getUpLvGoodsNum() {
            let item1 = itemManager.getGoodsNum(2001);
            let item2 = itemManager.getGoodsNum(2002);
            let arr = [];
            if (item1 > 20) {
                for (let i = 0; i < 20; i++) {
                    arr.push({ select: false, id: 2001, index: arr.length });
                }
            }
            else {
                let num = 20 - item1;
                if (item2 >= num) {
                    for (let i = 0; i < item1; i++) {
                        arr.push({ select: false, id: 2001, index: arr.length });
                    }
                    for (let i = 0; i < num; i++) {
                        arr.push({ select: false, id: 2002, index: arr.length });
                    }
                }
                else {
                    for (let i = 0; i < item1; i++) {
                        arr.push({ select: false, id: 2001, index: arr.length });
                    }
                    for (let i = 0; i < item2; i++) {
                        arr.push({ select: false, id: 2002, index: arr.length });
                    }
                }
            }
            UserModel.getInstance().upLvItemNum = arr;
        }
        static getMaterial() {
            let uplvItemNum = UserModel.getInstance().upLvItemNum;
            let data = { small: 0, big: 0, num: 0 };
            for (let i = 0; i < uplvItemNum.length; i++) {
                if (uplvItemNum[i].select) {
                    if (uplvItemNum[i].id === 2001) {
                        data.small++;
                    }
                    else if (uplvItemNum[i].id === 2002) {
                        data.big++;
                    }
                }
            }
            data.num = data.small * 100 + data.big * 500;
            UserModel.getInstance().useItemArr = data;
        }
        static selectItemAll() {
            let uplvItemNum = UserModel.getInstance().upLvItemNum;
            for (let j = 0; j < uplvItemNum.length; j++) {
                if (uplvItemNum[j].select === false) {
                    for (let i = 0; i < uplvItemNum.length; i++) {
                        uplvItemNum[i].select = true;
                    }
                    UserModel.getInstance().upLvItemNum = uplvItemNum;
                    return;
                }
            }
            for (let i = 0; i < uplvItemNum.length; i++) {
                uplvItemNum[i].select = false;
            }
        }
        static equipUpLv(exp, onlyId) {
            if (!exp) {
                Message.show(`未选择任何材料`);
                return;
            }
            let goodsList = UserModel.getInstance().goodsList;
            let useItemArr = UserModel.getInstance().useItemArr;
            let equipIndex = goodsList.findIndex(item => item.onlyId === onlyId);
            let equip;
            let expCount = exp;
            if (equipIndex !== -1) {
                equip = goodsList[equipIndex];
            }
            else {
                return;
            }
            for (let i = 0; i < 50; i++) {
                if (equip.lv >= 50) {
                    itemManager.materialReturn(expCount);
                    break;
                }
                let Exp = itemManager.equipLvUpAlgorithm(equip.lv + 1);
                let needExp = Exp - equip.exp;
                if (expCount < needExp) {
                    equip.exp += expCount;
                    break;
                }
                expCount -= needExp;
                equip.exp = 0;
                equip.lv++;
            }
            let smallIndex = goodsList.findIndex(item => item.id === 2001);
            let bigIndex = goodsList.findIndex(item => item.id === 2002);
            if (smallIndex !== -1) {
                goodsList[smallIndex].number -= useItemArr.small;
            }
            if (bigIndex !== -1) {
                goodsList[bigIndex].number -= useItemArr.big;
            }
            UserModel.getInstance().useItemArr = {};
            UserModel.getInstance().goodsList = goodsList.concat([]);
        }
        static materialReturn(expCount) {
            console.log("剩余经验值==>", expCount);
            let Count = Math.floor(expCount / 100);
            if (Count === 0 || Count == NaN) {
                Message.show(`装备已满级`);
            }
            else {
                itemManager.addItem(2001, Count);
                Message.show(`装备已满级，多余经验已转化为${Count}个强化水晶`);
            }
        }
        static equipLvUpAlgorithm(lv) {
            let exp = 100 + 10 * lv;
            return exp;
        }
        static showuplv(exp, onlyId) {
            let goodsList = UserModel.getInstance().goodsList;
            let equip = goodsList.find(item => item.onlyId === onlyId);
            let expCount = exp;
            let newExp = equip.exp;
            let newLv = equip.lv;
            if (!equip) {
                return;
            }
            for (let i = 0; i < 50; i++) {
                if (newLv >= 50) {
                    break;
                }
                let Exp = itemManager.equipLvUpAlgorithm(newLv + 1);
                let needExp = Exp - newExp;
                if (expCount < needExp) {
                    newExp += expCount;
                    break;
                }
                expCount -= needExp;
                newExp = 0;
                newLv++;
            }
            return newLv;
        }
        static getLevelItem() {
            let lv = UserModel.getInstance().lastLevel;
            let potion = 1000 + (500 * (lv - 1));
            let money = 500 + (100 * (lv - 1));
            let cfgItem = ConfigManager.GetConfig(CfgItem);
            let material = [];
            let equip = [];
            let exp = 100;
            cfgItem.forEach(item => {
                if (item.type === 2 && item.id !== 2003) {
                    material.push(item.id);
                }
                else if (item.type === 3) {
                    equip.push(item.id);
                }
            });
            let getMaterial = material[RandomUtil.randomInt(0, material.length)];
            let getEquip = equip[RandomUtil.randomInt(0, equip.length)];
            return [[2003, potion], [1002, money], [getMaterial, 1], [getEquip, 1], [9999, exp]];
        }
        static getLevelItemEndLess() {
            console.log("无尽模式获取战利品");
            let lv = Game.endLessFightGame.fightData.currentWave;
            let potion = 1000 + (500 * lv);
            let money = 500 + (500 * lv);
            let cfgItem = ConfigManager.GetConfig(CfgItem);
            let material = [];
            let equip = [];
            let exp = 100;
            cfgItem.forEach(item => {
                if (item.type === 2 && item.id !== 2003) {
                    material.push(item.id);
                }
                else if (item.type === 3) {
                    equip.push(item.id);
                }
            });
            let getMaterial = material[RandomUtil.randomInt(0, material.length)];
            let getEquip = equip[RandomUtil.randomInt(0, equip.length)];
            if (lv === 0) {
                return [[2003, potion], [1002, money]];
            }
            return [[2003, potion], [1002, money], [getMaterial, 1], [getEquip, 1], [9999, exp]];
        }
    }
    itemManager.maxLv = 50;

    class UnitManager {
        static unitLvPowerHero(num) {
            let lv = num - 1;
            let hp = lv * 10;
            let attack = lv * 7;
            let defense = lv * 0.2;
            return { hp: hp, attack: attack, defense: defense };
        }
        static unitLvPowerMonster(num) {
            let lv = num - 1;
            let hp = lv * 45;
            let attack = lv * 15;
            let defense = lv * 0.5;
            return { hp: hp, attack: attack, defense: defense };
        }
        static unitEquipUpPower(onlyId, heroId, type) {
            let goodsList = UserModel.getInstance().goodsList;
            let heroList = UserModel.getInstance().heroList;
            let findGoods = goodsList.find(item => item.onlyId === onlyId);
            let findIndexGoods = goodsList.findIndex(item => item.onlyId === onlyId);
            let powerValue;
            if (findGoods.length !== 0) {
                powerValue = UnitManager.unitLvPowerHero(findGoods.lv);
            }
            let findIndex = heroList.findIndex(item => item.id === heroId);
            if (findIndex !== -1) {
                for (let i = 0; i < heroList.length; i++) {
                    if (heroList[i].clothing[1] == onlyId) {
                        heroList[i].clothing = [];
                    }
                    if (heroList[i].helmet[1] == onlyId) {
                        heroList[i].helmet = [];
                    }
                    if (heroList[i].cloak[1] == onlyId) {
                        heroList[i].cloak = [];
                    }
                }
                goodsList[findIndexGoods].useHeroId = heroId;
                heroList[findIndex].hp += powerValue.hp;
                heroList[findIndex].attack += powerValue.attack;
                heroList[findIndex].defense += powerValue.defense;
                switch (type) {
                    case 0:
                        heroList[findIndex].clothing = [findGoods.id, onlyId];
                        break;
                    case 1:
                        heroList[findIndex].helmet = [findGoods.id, onlyId];
                        break;
                    case 2:
                        heroList[findIndex].cloak = [findGoods.id, onlyId];
                        break;
                    default:
                        break;
                }
                UserModel.getInstance().heroList = heroList.concat([]);
                UserModel.getInstance().goodsList = goodsList.concat([]);
            }
        }
        static unwield(onlyId, heroId) {
            let goodsList = UserModel.getInstance().goodsList;
            let heroList = UserModel.getInstance().heroList;
            let goods = goodsList.find(item => item.onlyId === onlyId);
            let goodsIndex = goodsList.findIndex(item => item.onlyId === onlyId);
            let cfgitem = ConfigManager.GetConfigByKey(CfgItem, goods.id);
            let equipType = cfgitem.equiptype;
            let powerValue;
            if (goods.length !== 0) {
                powerValue = UnitManager.unitLvPowerHero(goods.lv);
            }
            let findIndex = heroList.findIndex(item => item.id === heroId);
            if (findIndex !== -1) {
                goodsList[goodsIndex].useHeroId = null;
                heroList[findIndex].hp -= powerValue.hp;
                heroList[findIndex].attack -= powerValue.attack;
                heroList[findIndex].defense -= powerValue.defense;
                switch (equipType) {
                    case 0:
                        heroList[findIndex].clothing = [];
                        break;
                    case 1:
                        heroList[findIndex].helmet = [];
                        break;
                    case 2:
                        heroList[findIndex].cloak = [];
                        break;
                    default:
                        break;
                }
                UserModel.getInstance().heroList = heroList.concat([]);
                UserModel.getInstance().goodsList = goodsList.concat([]);
            }
        }
        static isHasEquip(onlyId, heroId, isClear = false) {
            let goodsList = UserModel.getInstance().goodsList;
            let heroList = UserModel.getInstance().heroList;
            let heroIndex = heroList.findIndex(item => item.id === heroId);
            let equip = goodsList.find(item => item.onlyId === onlyId);
            let ishaveEquip = false;
            if (equip && heroIndex !== -1) {
                let cfgitem = ConfigManager.GetConfigByKey(CfgItem, equip.id);
                switch (cfgitem.equiptype) {
                    case 0:
                        heroList[heroIndex].clothing[1] == onlyId ? ishaveEquip = true : null;
                        if (ishaveEquip === true && isClear == true) {
                            heroList[heroIndex].clothing = [];
                            UserModel.getInstance().heroList = heroList.concat([]);
                        }
                        break;
                    case 1:
                        heroList[heroIndex].helmet[1] == onlyId ? ishaveEquip = true : null;
                        if (ishaveEquip === true && isClear == true) {
                            heroList[heroIndex].helmet = [];
                            UserModel.getInstance().heroList = heroList.concat([]);
                        }
                        break;
                    case 2:
                        heroList[heroIndex].cloak[1] == onlyId ? ishaveEquip = true : null;
                        if (ishaveEquip === true && isClear == true) {
                            heroList[heroIndex].cloak = [];
                            UserModel.getInstance().heroList = heroList.concat([]);
                        }
                        break;
                    default:
                        break;
                }
            }
            return ishaveEquip;
        }
        static upLvHero(heroId) {
            let heroList = UserModel.getInstance().heroList;
            let heroIndex = heroList.findIndex(item => item.id === heroId);
            let need = UnitManager.getHeroUpLvResource(heroId);
            let money = UserModel.getInstance().money;
            let goodsList = UserModel.getInstance().goodsList;
            let itemIndex = goodsList.findIndex(item => item.id === 2003);
            if (itemIndex !== -1) {
                let potion = goodsList[itemIndex];
                console.log(`下一等级所需材料，药水：${need.potion},金币：${need.money}，目前拥有药水：${potion},金币：${money}`);
                if (potion.number >= need.potion && money >= need.money) {
                    console.log("升级成功!");
                    heroList[heroIndex].lv++;
                    goodsList[itemIndex].number -= need.potion;
                    money -= need.money;
                }
                else {
                    console.log("材料不足");
                    Message.show("材料不足");
                }
                UserModel.getInstance().money = money;
                UserModel.getInstance().goodsList = goodsList;
                UserModel.getInstance().heroList = heroList.concat([]);
                GameDispatcher.getInstance().event(EventName.USER_UPLV_HERO);
            }
            else {
                console.log("空");
            }
        }
        static getHeroUpLvResource(heroId) {
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.find(item => item.id === heroId);
            let heroLv;
            if (hero) {
                heroLv = hero.lv + 1;
            }
            let money = 1000 + 500 * heroLv;
            let potion = 500 + 100 * heroLv;
            return { money: money, potion: potion };
        }
        static nowLvData(heroId) {
            let cfg = ConfigManager.GetConfigByKey(CfgHero, heroId);
            let heroList = UserModel.getInstance().heroList;
            let find = heroList.find(hero => hero.id === cfg.id);
            if (find) {
                let LvPower = UnitManager.unitLvPowerHero(find.lv);
                return { hp: cfg.hp + LvPower.hp, aggress: cfg.aggress + LvPower.attack, defense: cfg.defense + LvPower.defense };
            }
        }
        static nowLvDataMonster(Id, lv) {
            let cfg = ConfigManager.GetConfigByKey(CfgMonster, Id);
            let LvPower = UnitManager.unitLvPowerMonster(lv);
            return { hp: cfg.hp + LvPower.hp, aggress: cfg.aggressivity + LvPower.attack, defense: cfg.defense + LvPower.defense };
        }
        static MonsterPower(Id, lv) {
            let dataAll = UnitManager.nowLvDataMonster(Id, lv);
            let addSum = dataAll.hp + dataAll.aggress + dataAll.defense;
            return addSum;
        }
        static equipData(heroId) {
            let cfg = ConfigManager.GetConfigByKey(CfgHero, heroId);
            let heroList = UserModel.getInstance().heroList;
            let goodsList = UserModel.getInstance().goodsList;
            let find = heroList.find(hero => hero.id === cfg.id);
            if (find) {
                let clothingOnlyId;
                let helmetOnlyId;
                let cloakOnlyId;
                let clothing = { hp: 0, defense: 0, aggress: 0 };
                let helmet = { hp: 0, defense: 0, aggress: 0 };
                let cloak = { hp: 0, defense: 0, aggress: 0 };
                if (find.clothing.length !== 0) {
                    clothingOnlyId = find.clothing[1];
                    let clothingFind = goodsList.find(goods => goods.onlyId === clothingOnlyId);
                    if (clothingFind) {
                        clothing = itemManager.equipData(clothingOnlyId);
                    }
                }
                if (find.helmet.length !== 0) {
                    helmetOnlyId = find.helmet[1];
                    let helmetFind = goodsList.find(goods => goods.onlyId === helmetOnlyId);
                    if (helmetFind) {
                        helmet = itemManager.equipData(helmetOnlyId);
                    }
                }
                if (find.cloak.length !== 0) {
                    cloakOnlyId = find.cloak[1];
                    let cloakFind = goodsList.find(goods => goods.onlyId === cloakOnlyId);
                    if (cloakFind) {
                        cloak = itemManager.equipData(cloakOnlyId);
                    }
                }
                let hp = clothing.hp + helmet.hp + cloak.hp;
                let aggress = clothing.aggress + helmet.aggress + cloak.aggress;
                let defense = clothing.defense + helmet.defense + cloak.defense;
                return { clothing: clothing, helmet: helmet, cloak: cloak, hp: hp, aggress: aggress, defense: defense };
            }
        }
        static heroStarPower(starNum) {
            let hp = starNum * 500;
            let aggress = starNum * 50;
            let defense = starNum * 10;
            return { hp: hp, aggress: aggress, defense: defense };
        }
        static heroStarUpLv(heroId, starNum = 1) {
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.findIndex(hero => hero.id === heroId);
            if (hero !== -1) {
                heroList[hero].star += starNum;
                UserModel.getInstance().heroList = heroList.concat([]);
            }
        }
        static updateHeroData() {
            let heroList = UserModel.getInstance().heroList;
            for (let i = 0; i < heroList.length; i++) {
                let heroId = heroList[i].id;
                let equip = UnitManager.equipData(heroId);
                let lv = UnitManager.nowLvData(heroId);
                let star = UnitManager.heroStarPower(heroList[i].star);
                heroList[i].hp = equip.hp + lv.hp + star.hp;
                heroList[i].attack = equip.aggress + lv.aggress + star.aggress;
                heroList[i].defense = equip.defense + lv.defense + star.defense;
            }
            UserModel.getInstance().heroList = heroList.concat([]);
        }
        static updateOneHeroData(heroID) {
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.findIndex(hero => hero.id === heroID);
            if (hero != -1) {
                let equip = UnitManager.equipData(heroID);
                let lv = UnitManager.nowLvData(heroID);
                let star = UnitManager.heroStarPower(heroList[hero].star);
                heroList[hero].hp = equip.hp + lv.hp + star.hp;
                heroList[hero].attack = equip.aggress + lv.aggress + star.aggress;
                heroList[hero].defense = equip.defense + lv.defense + star.defense;
                UserModel.getInstance().heroList = heroList.concat([]);
                return { hp: heroList[hero].hp, aggress: heroList[hero].attack, defense: heroList[hero].defense };
            }
        }
        static addHero(heroId) {
            let heroList = UserModel.getInstance().heroList;
            let cfgItem = ConfigManager.GetConfig(CfgItem);
            let hero = heroList.find(item => item.id === heroId);
            if (hero) {
                cfgItem.forEach(item => {
                    if (item.hero === hero.id) {
                        console.log('获取的英雄碎片==>', item);
                        itemManager.addItem(item.id, 10);
                    }
                });
            }
            else {
                let data = { id: heroId, lv: 1, maxlv: 100, hp: 0, attack: 0, defense: 0, clothing: [], helmet: [], cloak: [], star: 1, power: 0 };
                heroList.push(data);
                UserModel.getInstance().heroList = heroList.concat([]);
            }
        }
        static drawCards() {
            let cardsList = [];
            let herolist = [];
            let itemlist = [];
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            let cfgItem = ConfigManager.GetConfig(CfgItem);
            let exclude = [9999, 1002];
            cfgHero.forEach(item => { cardsList.push(item.id), herolist.push(item.id); });
            cfgItem.forEach(item => { if (!exclude.includes(item.id)) {
                cardsList.push(item.id), itemlist.push(item.id);
            } });
            let rand = UnitManager.shuffle(cardsList);
            var randomIndex = Math.floor(Math.random() * rand.length);
            let cardId = rand[randomIndex];
            let findHero = herolist.find(num => num === cardId);
            let findItem = itemlist.find(num => num === cardId);
            let cfg;
            if (findHero) {
                cfg = ConfigManager.GetConfigByKey(CfgHero, findHero);
                UnitManager.addHero(cfg.id);
                console.log("抽到的是===>", cfg);
                return [cfg, 1];
            }
            else if (findItem) {
                cfg = ConfigManager.GetConfigByKey(CfgItem, findItem);
                itemManager.addItem(cfg.id, 1);
                console.log("抽到的是===>", cfg);
                return [cfg, 2];
            }
        }
        static mustGoOutHero() {
            let herolist = [];
            let havedHeroList = UserModel.getInstance().heroList;
            let haveHeroIdList = [];
            for (let i = 0; i < havedHeroList.length; i++) {
                haveHeroIdList.push(havedHeroList[i].id);
            }
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            cfgHero.forEach(item => {
                if (!haveHeroIdList.includes(item.id)) {
                    herolist.push(item.id);
                }
            });
            if (herolist.length == 0) {
                cfgHero.forEach(item => { herolist.push(item.id); });
            }
            herolist = UnitManager.shuffle(herolist);
            let randonHeroId = herolist[RandomUtil.randomInt(0, herolist.length)];
            let hero = ConfigManager.GetConfigByKey(CfgHero, randonHeroId);
            console.log("保底英雄=>", hero);
            UnitManager.addHero(hero.id);
            return hero;
        }
        static drawCardTime(isDrawCard = true) {
            let nowDate = TimeUtil.UTC;
            let drawCardTime = ItemModel.getInstance().drawCardTime;
            let isSameDay = TimeUtil.isSameDay(nowDate, drawCardTime);
            if (!isSameDay) {
                ItemModel.getInstance().drawCardNum = 0;
            }
            if (isDrawCard) {
                ItemModel.getInstance().drawCardTime = nowDate;
            }
        }
        static drawProbability() {
            let itemList = ConfigManager.GetConfig(CfgItem);
            let heroList = ConfigManager.GetConfig(CfgHero);
            let exclude = [9999, 1002];
            let itemNum = 0;
            itemList.forEach(element => {
                if (!exclude.includes(element.id)) {
                    itemNum++;
                }
            });
            heroList.forEach(element => {
                itemNum++;
            });
            let probability = Number((1 / itemNum * 100).toFixed(2));
            return probability;
        }
        static randomArr(arr) {
            var newArr = arr.slice(0);
            var len = arr.length;
            var indexArr = [];
            for (var i = 0; i < len; i++) {
                if (indexArr[i]) {
                    continue;
                }
                var random = Math.floor(Math.random() * len);
                while (random === i) {
                    random = Math.floor(Math.random() * len);
                }
                indexArr[random] = indexArr[i] = true;
                var swap = newArr[i];
                newArr[i] = newArr[random];
                newArr[random] = swap;
            }
            return newArr;
        }
        static shuffle(arr) {
            let i = arr.length, t, j;
            while (i) {
                j = Math.floor(Math.random() * (i--));
                t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            }
            return arr;
        }
        static equipPowerSum(list) {
            let powerAll = 0;
            for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < list[i].length; j++) {
                    let powerOfUnit = UnitManager.MonsterPower(list[i][j][0], list[i][j][1]);
                    powerAll += powerOfUnit;
                }
            }
            return powerAll;
        }
        loadHero() {
            let cfg = ConfigManager.GetConfig(CfgHero);
            let urlList = [];
            cfg.forEach(item => {
                urlList.push(item.skurl);
            });
            for (let i = 0; i < urlList.length; i++) {
                let skel = new Laya.Skeleton();
                skel.load(urlList[i], Laya.Handler.create(this, () => {
                    Laya.timer.frameOnce(1, this, () => {
                        skel.play("stand", true);
                    });
                }));
                console.log(skel.url);
            }
        }
    }

    class EndLessMgr {
        constructor() {
            this.notAttackedUnitArr = [];
            this.notAttackedMonsterArr = [];
            this.attackedUnitArr = [];
            this.attackCount = 0;
            this.newSelfArr = [];
            this.newOtherArr = [];
            this.clearNow = false;
            this.heroSkillList = [];
            this.isSkillNow = false;
        }
        getUnitGlobalPos(id, type) {
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            let pos = new Laya.Point;
            if (type == 1) {
                let unit = selfArr.findIndex(item => item.id === id);
                if (unit !== -1) {
                    let fatherNode = selfArr[unit].parent;
                    pos = fatherNode.localToGlobal(new Laya.Point(selfArr[unit].x, selfArr[unit].y));
                }
            }
            else if (type == 2) {
                for (let i = 0; i < otherArr.length; i++) {
                    if (!otherArr[i].isDie) {
                        if (i === id) {
                            let fatherNodeMon = otherArr[i].parent;
                            pos = fatherNodeMon.localToGlobal(new Laya.Point(otherArr[i].x, otherArr[i].y));
                            break;
                        }
                    }
                }
            }
            return pos;
        }
        getUnitPos(id, type) {
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            let pos = new Laya.Point;
            if (type == 1) {
                let unit = selfArr.findIndex(item => item.id === id);
                pos.setTo(selfArr[unit].x, selfArr[unit].y);
                return pos;
            }
            else if (type == 2) {
                let mansterIndex = Game.endLessFightGame.fightData.targetIndex;
                if (otherArr.length > 0) {
                    if (otherArr[mansterIndex]) {
                        pos.setTo(otherArr[mansterIndex].x, otherArr[mansterIndex].y);
                        return pos;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            }
        }
        startBattle() {
            console.log("————————————开始攻击————————————");
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            this.newSelfArr = [];
            this.newOtherArr = [];
            selfArr.forEach(item => {
                if (!item.isDie) {
                    this.newSelfArr.push(item);
                }
            });
            otherArr.forEach(item => {
                if (!item.isDie) {
                    this.newOtherArr.push(item);
                }
            });
            let heroGoOn = this.notAttackedUnitArr.length !== 0 && Game.round === 1;
            let monsterGoOn = this.notAttackedMonsterArr.length !== 0 && Game.round === 2;
            this.attackCount = 0;
            if (heroGoOn || monsterGoOn) {
                this.goOnFight();
                return;
            }
            if (Game.round === 1) {
                this.notAttackedUnitArr = this.newSelfArr.concat([]);
            }
            else if (Game.round === 2) {
                this.notAttackedMonsterArr = this.newOtherArr.concat([]);
            }
            this.executeBattle(() => { console.log(1); });
        }
        cb() {
            if (Game.round == 1) {
                let attackHeroId = this.newSelfArr[this.attackCount].id;
                let findIndex = this.notAttackedUnitArr.findIndex(hero => hero.id === attackHeroId);
                if (findIndex !== -1) {
                    this.notAttackedUnitArr.splice(findIndex, 1);
                }
                this.attackedUnitArr.push(this.newSelfArr[this.attackCount]);
                this.attackCount++;
                if (this.heroSkillList.length > 0) {
                    this.initPos();
                    this.useHeroSkill();
                    return;
                }
                this.executeBattle(() => { console.log(2, "战斗"); });
            }
            else if (Game.round == 2) {
                console.log("怪物列表==>", this.newOtherArr, "下标==>" + this.attackCount, "this.newOtherArr.length==>" + this.newOtherArr.length);
                if (this.newOtherArr[this.attackCount]) {
                    let attackMonsterId = this.newOtherArr[this.attackCount].id;
                    let findIndex = this.notAttackedMonsterArr.findIndex(monster => monster.id === attackMonsterId);
                    if (findIndex !== -1) {
                        this.notAttackedMonsterArr.splice(findIndex, 1);
                    }
                    this.attackCount++;
                    this.executeBattle(() => { console.log(3); });
                }
            }
        }
        executeBattle(callback) {
            callback();
            if (this.newOtherArr.length == 0) {
                console.log("所有单位死亡,生成下一波怪物");
                this.onWin();
                return;
            }
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let mansterIndex = Game.endLessFightGame.fightData.targetIndex;
            let selectMonster = otherArr[mansterIndex];
            if (Game.round === 1) {
                if (this.newSelfArr.length == this.attackedUnitArr.length) {
                    console.log("所有单位发动过攻击，跳到敌人回合");
                    this.atTheBell();
                    return;
                }
                if (this.attackCount < this.newSelfArr.length) {
                    console.log("默认战斗，当前攻击者==>", this.newSelfArr[this.attackCount].cfg.name);
                    this.fightUnit(this.newSelfArr[this.attackCount], selectMonster, () => {
                        this.cb();
                    });
                }
                else {
                    this.atTheBell();
                }
            }
            else if (Game.round === 2) {
                console.log("怪物攻击");
                if (this.newOtherArr.length == 0) {
                    console.log("所有单位死亡,生成下一波怪物");
                    this.onWin();
                    return;
                }
                let randomCount = RandomUtil.randomInt(0, this.newSelfArr.length);
                let hero = this.newSelfArr[randomCount];
                if (this.attackCount < this.newOtherArr.length) {
                    this.fightUnit(this.newOtherArr[this.attackCount], hero, () => {
                        this.cb();
                    });
                }
                else {
                    this.atTheBell();
                }
            }
        }
        goOnFight() {
            console.log("——————继续战斗——————");
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let mansterIndex = Game.endLessFightGame.fightData.targetIndex;
            let selectMonster = otherArr[mansterIndex];
            let attackCount = 0;
            if (Game.round === 1) {
                if (this.newSelfArr.length == this.attackedUnitArr.length) {
                    console.log("所有单位发动过攻击，跳到敌人回合");
                    this.atTheBell();
                    return;
                }
                if (attackCount < this.notAttackedUnitArr.length) {
                    console.log("继续战斗，当前攻击者==>", this.notAttackedUnitArr[attackCount].cfg.name);
                    this.fightUnit(this.notAttackedUnitArr[attackCount], selectMonster, () => {
                        console.log("英雄列表", this.notAttackedUnitArr, "下标", attackCount, "具体单位", this.notAttackedUnitArr[attackCount]);
                        if (this.notAttackedUnitArr.length == 0) {
                            console.log("英雄列表为空，跳过回合");
                            this.atTheBell();
                            return;
                        }
                        let attackHeroId = this.notAttackedUnitArr[attackCount].id;
                        let findIndex = this.notAttackedUnitArr.findIndex(hero => hero.id === attackHeroId);
                        if (findIndex !== -1) {
                            this.notAttackedUnitArr.splice(findIndex, 1);
                        }
                        this.attackedUnitArr.push(this.notAttackedUnitArr[attackCount]);
                        if (this.heroSkillList.length > 0) {
                            this.initPos();
                            this.useHeroSkill();
                            return;
                        }
                        this.goOnFight();
                    });
                }
                else {
                    this.atTheBell();
                }
            }
            else if (Game.round === 2) {
                let randomCount = RandomUtil.randomInt(0, this.newSelfArr.length);
                let hero = this.newSelfArr[randomCount];
                if (attackCount < this.notAttackedMonsterArr.length) {
                    this.fightUnit(this.notAttackedMonsterArr[attackCount], hero, () => {
                        let attackMonsterId = this.notAttackedMonsterArr[attackCount].id;
                        console.log("未攻击怪物数组==>", this.notAttackedMonsterArr);
                        let findIndex = this.notAttackedMonsterArr.findIndex(monster => monster.id === attackMonsterId);
                        if (findIndex !== -1) {
                            this.notAttackedMonsterArr.splice(findIndex, 1);
                        }
                        this.goOnFight();
                    });
                }
                else {
                    this.atTheBell();
                }
            }
        }
        fightUnit(attackUnit, attackedUnit, callback) {
            if (Game.isEndLessMode !== 2) {
                Laya.timer.clearAll(this);
                Laya.Tween.clearAll(this);
                return;
            }
            if (Game.round === 1) {
                attackUnit.zOrder = 10;
                let pos = this.getUnitPos(null, 2);
                if (pos == null) {
                    Laya.timer.once(100, this, () => {
                        callback && callback();
                    });
                }
                else {
                    if (attackUnit.cfg.attacktype == 1) {
                        this.closeAttack(attackUnit, pos, attackedUnit, () => {
                            callback && callback();
                        });
                    }
                    else {
                        this.rangedAttack(attackUnit, pos, attackedUnit, () => {
                            callback && callback();
                        });
                    }
                }
            }
            else if (Game.round === 2) {
                attackUnit.zOrder = 10;
                if (!attackedUnit) {
                    return;
                }
                let pos = this.getUnitPos(attackedUnit.id, 1);
                if (attackUnit.cfg.attacktype == 1) {
                    this.closeAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
                else {
                    this.rangedAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
            }
        }
        closeAttack(attackUnit, localPos, attackedUnit, callback = null) {
            if (attackUnit.isHero) {
                attackUnit.unitSk.play("move", true);
                Laya.Tween.to(attackUnit, { x: localPos.x - 150, y: localPos.y }, 500, null, Laya.Handler.create(this, () => {
                    attackUnit.unitSk.offAll();
                    attackUnit.unitSk.play('attack', false);
                    let fatherNode = attackUnit.parent;
                    if (attackUnit.cfg.attackeffect) {
                        let attack = new AttackEffectAll();
                        attack[`attackEffect${attackUnit.cfg.attackeffect}`](fatherNode, localPos.x, localPos.y);
                    }
                    this.heroAttack(attackUnit, attackedUnit);
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        attackUnit.unitSk.scale(-0.45, 0.45);
                        attackUnit.unitSk.play("move", true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                            attackUnit.unitSk.play("stand", true);
                            attackUnit.unitSk.scale(0.45, 0.45);
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }));
            }
            else {
                console.log("近战怪物攻击，坐标=>", localPos);
                Laya.Tween.to(attackUnit, { x: localPos.x + 150, y: localPos.y }, 500, null, Laya.Handler.create(this, () => {
                    attackUnit.unitSk.offAll();
                    attackUnit.unitSk.play('attack', false);
                    let fatherNode = attackUnit.parent;
                    if (attackUnit.cfg.attackeffect) {
                        let attack = new AttackEffectAll();
                        attack[`attackEffect${attackUnit.cfg.attackeffect}`](fatherNode, localPos.x, localPos.y);
                    }
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        attackedUnit.bloodCount(-attackUnit.getData().attack);
                        attackUnit.unitSk.play('stand', true);
                        attackUnit.unitSk.scale(0.7, 0.7);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                            attackUnit.unitSk.scale(-0.7, 0.7);
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }));
            }
        }
        heroAttack(attackUnit, attackedUnit) {
            let axeList = [1, 3];
            let swordList = [6, 2, 7];
            if (axeList.includes(attackUnit.cfg.id)) {
                Laya.timer.once(500, this, () => {
                    attackedUnit.bloodCount(-attackUnit.getData().attack);
                });
            }
            else if (swordList.includes(attackUnit.cfg.id)) {
                Laya.timer.once(150, this, () => {
                    attackedUnit.bloodCount(-attackUnit.getData().attack);
                });
            }
        }
        rangedAttack(attackUnit, localPos, affectedUnit, callback = null) {
            if (!attackUnit) {
                if (callback) {
                    callback();
                }
                return;
            }
            let fatherNode = attackUnit.parent;
            let ismagic = attackUnit.cfg.ismagic;
            attackUnit.unitSk.offAll();
            attackUnit.unitSk.once(Laya.Event.STOPPED, this, () => {
                attackUnit.unitSk.play('stand', true);
            });
            attackUnit.unitSk.play('attack', false);
            attackUnit.zOrder = attackUnit.initZOrder;
            if (ismagic == 1) {
                if (!affectedUnit) {
                    if (callback) {
                        callback();
                    }
                    console.log("单位被清除，取消远程攻击");
                    return;
                }
                else {
                    if (affectedUnit.getData().blood <= 0) {
                        if (callback) {
                            callback();
                        }
                        console.log(`单位生命值为${affectedUnit.getData().blood}，取消远程攻击`);
                        return;
                    }
                }
                let fatherNode2 = affectedUnit.parent;
                Laya.timer.once(750, this, () => {
                    let pointAttack = new Laya.Point(attackUnit.x, attackUnit.y);
                    let pointAffected = new Laya.Point(affectedUnit.x, affectedUnit.y);
                    for (let i = 0; i < 3; i++) {
                        let X = ((pointAffected.x - pointAttack.x) * ((i + 2) / 5)) + pointAttack.x;
                        let Y = ((pointAffected.y - pointAttack.y) * ((i + 2) / 5)) + pointAttack.y;
                        Laya.timer.once(200 * (i + 1), this, () => {
                            let effect = FixedEffect.createEffect("res/game/skillskeleton/Spell_Active_Attack_DragonNormal.sk");
                            fatherNode2.addChild(effect);
                            effect.pos(9999, 9999);
                            effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                                Laya.timer.frameOnce(2, this, () => {
                                    effect.scaleY = -1;
                                    effect.pos(X, (Y - 500));
                                    effect.playAnimOnce();
                                });
                            }));
                        });
                    }
                    Laya.timer.once(800, this, () => {
                        let anim = FixedEffect.createEffect("res/game/skillskeleton/Spell_Active_Attack_DragonNormal.sk");
                        anim.sk.load(anim.sk.url, Laya.Handler.create(this, () => {
                            Laya.timer.frameOnce(2, this, () => {
                                fatherNode2.addChild(anim);
                                anim.scaleY = -1;
                                anim.pos(affectedUnit.x, affectedUnit.y - 500);
                                anim.playAnimOnce(() => {
                                    affectedUnit.bloodCount(-attackUnit.getData().attack);
                                });
                            });
                        }));
                        if (callback) {
                            callback();
                        }
                    });
                });
            }
            else {
                if (Game.round == 2) {
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        let attackSk = RangedAttack.createSk(Game.round);
                        if (attackSk) {
                            if (fatherNode) {
                                fatherNode.addChild(attackSk);
                            }
                            else {
                                callback();
                                return;
                            }
                        }
                        attackSk.pos(attackUnit.initPos.x, attackUnit.initPos.y);
                        attackSk.zOrder = 11;
                        attackSk.posMoveToPos(attackUnit.initPos.x, attackUnit.initPos.y, localPos.x, localPos.y, affectedUnit, attackUnit);
                        attackUnit.unitSk.play('stand', true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 1000, null, Laya.Handler.create(this, () => {
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }
                else {
                    Laya.timer.once(1500, this, () => {
                        let attackSk = RangedAttack.createSk(Game.round);
                        if (attackSk) {
                            if (fatherNode) {
                                fatherNode.addChild(attackSk);
                            }
                            else {
                                callback();
                                return;
                            }
                        }
                        attackSk.pos(attackUnit.initPos.x, attackUnit.initPos.y);
                        attackSk.zOrder = 11;
                        attackSk.posMoveToPos(attackUnit.initPos.x, attackUnit.initPos.y, localPos.x, localPos.y, affectedUnit, attackUnit);
                        attackUnit.unitSk.play('stand', true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 1000, null, Laya.Handler.create(this, () => {
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }
            }
        }
        atTheBell() {
            if (this.clearNow) {
                return;
            }
            this.initPos(() => {
                this.notAttackedUnitArr = [].concat([]);
                this.attackedUnitArr = [].concat([]);
                Game.round == 1 ? Game.round = 2 : Game.round = 1;
                if (Game.round == 1) {
                    Game.endLessFightGame.fightData.buffmgr.update();
                }
                if (Game.isEndLessMode == 2) {
                    this.startBattle();
                }
            });
        }
        showMave() {
            Message.show("无尽模式 第" + (Game.endLessFightGame.fightData.currentWave + 1) + "关");
        }
        initPos(callback = null) {
            console.log("恢复位置");
            let fightData = Game.endLessFightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            this.clearOld(() => { console.log(2); });
            for (let i = 0; i < otherArr.length; i++) {
                let monster = otherArr[i];
                if (!monster.isDie) {
                    monster.unitSk.offAll();
                    monster.unitSk.scale(-0.7, 0.7);
                    monster.unitSk.play("stand", true, false);
                    Laya.Tween.to(monster, { x: monster.initPos.x, y: monster.initPos.y }, 300, null, Laya.Handler.create(this, () => { monster.zOrder = monster.initZOrder; }));
                }
                else if (monster.isDie && monster.visible) {
                    monster.visible = false;
                }
            }
            for (let i = 0; i < selfArr.length; i++) {
                let hero = selfArr[i];
                if (!hero.isDie) {
                    hero.unitSk.offAll();
                    hero.unitSk.scale(0.45, 0.45);
                    hero.unitSk.play("stand", true, false);
                    Laya.Tween.to(hero, { x: hero.initPos.x, y: hero.initPos.y }, 300, null, Laya.Handler.create(this, () => { hero.zOrder = hero.initZOrder; }));
                }
                else if (hero.isDie && hero.visible) {
                    hero.visible = false;
                }
            }
            this.clearNow = false;
            Laya.timer.once(500, this, () => {
                callback && callback();
            });
        }
        isFail() {
            let fightData = Game.endLessFightGame.fightData;
            let selfArr = fightData.selfArr;
            for (let i = 0; i < selfArr.length; i++) {
                if (!selfArr[i].isDie) {
                    fightData.selfIndex = i;
                    return false;
                }
            }
            fightData.gameover = true;
            return true;
        }
        onFail() {
            if (this.isFail() == true) {
                this.clearOld(() => { console.log(3); });
                this.clearNow = false;
                GameModel.getInstance().gameOver();
                UIMgr.show(UIDefine.UIEndLessGameWinCtl, []);
            }
        }
        onWin() {
            let isWin = Game.endLessFightGame.switchSelectMonster();
            let currentWave = Game.endLessFightGame.fightData.currentWave;
            console.log("isWin==>", isWin);
            if (isWin) {
                this.clearOld(() => { console.log(4); });
                Game.endLessMgr.attackedUnitArr = [].concat([]);
                Game.endLessFightGame.fightData.nextWave();
                console.log(`下一波为第${currentWave + 1}波`);
                this.showMave();
            }
        }
        remake() {
            GameModel.getInstance().gameOver();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIGameCtl, UserModel.getInstance().lastLevel);
        }
        setSkillMap() {
            this.activeSkillMap = new Map();
            let heroArr = Game.endLessFightGame.fightData.selfArr;
            for (let i = 0; i < heroArr.length; i++) {
                let skillNum = heroArr[i].cfg.useskillarr[0];
                let skillClass = "skill" + skillNum;
                this.activeSkillMap.set(skillNum, skillClass);
            }
        }
        getRandomMansterArr() {
            let currentWave = Game.endLessFightGame.fightData.currentWave;
            if (currentWave < 5) {
                return this.getRegularManstersArr();
            }
            let mansterArr = [];
            let cfgManster = ConfigManager.GetConfig(CfgMonster);
            let allMansterId = [];
            let allBossId = [];
            cfgManster.forEach(data => {
                if (data.isBoss === 1) {
                    allBossId.push(data.id);
                }
                else {
                    allMansterId.push(data.id);
                }
            });
            let lv = currentWave + 1;
            let isBossLv = currentWave % 5 == 0 && currentWave !== 0;
            if (isBossLv) {
                let random = RandomUtil.randomInt(0, allBossId.length);
                let boss = allBossId[random];
                mansterArr.push([boss, lv]);
            }
            else {
                for (let i = 0; i < 4; i++) {
                    let random = RandomUtil.randomInt(0, allMansterId.length);
                    let manster = allMansterId[random];
                    mansterArr.push([manster, lv]);
                }
            }
            return mansterArr;
        }
        getRegularManstersArr() {
            let currentWave = Game.endLessFightGame.fightData.currentWave;
            let fiveMonsterArr = [[[2, 1]], [[1, 2], [1, 2]], [[4, 3], [4, 3], [4, 3]], [[14, 4], [14, 4], [14, 4], [14, 4]], [[10, 5], [10, 5], [10, 5], [10, 5]]];
            return fiveMonsterArr[currentWave];
        }
        clearOld(callback) {
            this.clearNow = true;
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            console.log("结束清空");
            this.isSkillNow = false;
            callback();
        }
        addHeroSkill(id, callback) {
            if (!this.heroSkillList.includes(id)) {
                this.heroSkillList.push(id);
                callback();
            }
        }
        useHeroSkill() {
            if (this.isSkillNow) {
                console.log("技能施放中，请等待!");
                return;
            }
            if (this.heroSkillList.length == 0) {
                let otherArr = Game.endLessFightGame.fightData.otherArr;
                let dieNum = 0;
                for (let i = 0; i < otherArr.length; i++) {
                    if (otherArr[i].isDie) {
                        dieNum++;
                    }
                }
                if (dieNum !== otherArr.length) {
                    this.startBattle();
                }
                return;
            }
            this.isSkillNow = true;
            let skill;
            skill = new SkillAll();
            let cfgHero = ConfigManager.GetConfigByKey(CfgHero, this.heroSkillList[0]);
            let getV = Game.endLessMgr.activeSkillMap.get(cfgHero.useskillarr[0]);
            if (!skill[`${getV}`]) {
                Message.show("技能制作中...");
                this.heroSkillList.splice(0, 1);
                this.isSkillNow = false;
                this.useHeroSkill();
                return;
            }
            skill[`${getV}`](this.heroSkillList[0], () => {
                let list = HeroAvatar.getInstance().endLessAvatarList;
                console.log("英雄列表=>", list);
                for (let i = 0; i < list.length; i++) {
                    if (list[i].heroId == this.heroSkillList[0]) {
                        list[i].runAround();
                        break;
                    }
                }
                this.heroSkillList.splice(0, 1);
                this.isSkillNow = false;
                this.useHeroSkill();
                return;
            });
        }
        getMonsterPower() {
            let list = [[]];
            let otherArr = Game.endLessFightGame.fightData.otherArr;
            for (let i = 0; i < otherArr.length; i++) {
                let id = otherArr[i].cfg.id;
                let lv = otherArr[i].lvData;
                list[0].push([id, lv]);
            }
            let powerAll = UnitManager.equipPowerSum(list);
            GameDispatcher.getInstance().event(EventName.GAME_SHOW_OTHER_POWER, powerAll);
            return powerAll;
        }
    }

    class FightData extends Singleton {
        constructor() {
            super(...arguments);
            this.gameover = false;
            this.otherArr = [];
            this.otherDataArr = [];
            this.selfArr = [];
            this.roundNum = 1;
            this.attackHeroList = [];
            this.starSkillHeroList = [];
            this.isAttack = false;
        }
        setAvatarId(id) {
            this.clickItemId = id;
        }
        getSelfHeroIdList() {
            let heroIdArr = [];
            for (let i = 0; i < this.selfArr.length; i++) {
                if (this.selfArr[i]) {
                    heroIdArr.push(this.selfArr[i].cfg.type);
                }
            }
            return heroIdArr;
        }
        isShowStar(num) {
            let idArr = this.getSelfHeroIdList();
            if (idArr.includes(num)) {
                return true;
            }
            return false;
        }
        getColorAttack(color) {
            let attackSum = 0;
            for (let i = 0; i < this.selfArr.length; i++) {
                if (this.selfArr[i]) {
                    this.selfArr[i].cfg.type == color ? attackSum += this.selfArr[i].getData().attack : null;
                }
            }
            return attackSum;
        }
        nextWave() {
            this.currentWave++;
            GameDispatcher.getInstance().event(EventName.GAME_NEXT_WAVE);
        }
    }

    class FightGame extends Singleton {
        init() {
            GameDispatcher.getInstance().on(EventName.GAME_START, this, this.cancelEvent);
            this.fightData = new FightData();
            this.fightData.buffmng = new BuffManager();
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (this.fightData.otherArr[i] !== null) {
                    this.fightData.otherArr[i].destroy();
                }
            }
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                if (this.fightData.otherArr[i] !== null) {
                    this.fightData.selfArr[i].destroy();
                }
            }
            this.fightData.otherArr = [];
            this.fightData.selfArr = [];
            this.testHp();
        }
        start() {
            this.fightData.targetIndex = 0;
            this.fightData.selfIndex = 0;
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                this.fightData.otherArr[i].on(Laya.Event.CLICK, this, this.onClickItem, [i]);
            }
            this.onClickItem(0);
        }
        onClickItem(index) {
            if (Game.round !== 1) {
                return;
            }
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (this.fightData.otherArr[i]) {
                    this.fightData.otherArr[i].select.visible = false;
                }
            }
            if (!this.fightData.otherArr[index].parent) {
                return;
            }
            this.fightData.otherArr[index].select.visible = true;
            this.fightData.targetIndex = index;
            let father = this.fightData.otherArr[index].parent.parent.parent.parent.parent;
            let monsterFather = this.fightData.otherArr[index].parent;
            let pos1 = monsterFather.localToGlobal(new Laya.Point(this.fightData.otherArr[index].x, this.fightData.otherArr[index].y));
            let fatherPos = father.globalToLocal(new Laya.Point(pos1.x, pos1.y));
            GameModel.getInstance().selectPos(fatherPos.x, fatherPos.y);
        }
        switchSelectMonster() {
            let isWin = true;
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                this.fightData.otherArr[i].on(Laya.Event.CLICK, this, this.onClickItem, [i]);
            }
            for (let i = 0; i < this.fightData.otherArr.length; i++) {
                if (!this.fightData.otherArr[i].isDie) {
                    isWin = false;
                    this.fightData.targetIndex = i;
                    this.onClickItem(this.fightData.targetIndex);
                    return isWin;
                }
            }
            return isWin;
        }
        bloomCount(color) {
            if (this.fightData.otherArr[this.fightData.targetIndex] == null) {
                return;
            }
            let attackSum = this.fightData.getColorAttack(color);
            this.fightData.otherArr[this.fightData.targetIndex].bloodCount(-attackSum);
        }
        otherAttack() {
            Game.fightManager.startBattle();
        }
        useHeroSkill(heroId) {
            console.log("使用技能,heroId==" + heroId);
        }
        clearSelfArr() {
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                this.fightData.selfArr[i].destroy();
            }
            this.fightData.selfArr = [];
        }
        cancelEvent() {
            for (let i = 0; i < this.fightData.selfArr.length; i++) {
                this.fightData.selfArr[i].offAll();
            }
        }
        testHp() {
            Laya.Browser.window.startHp = FightGame.startReduceHp;
            Laya.Browser.window.startHpSelf = FightGame.startReduceHpSelf;
        }
        static startReduceHp(reduceHp = 0) {
            let fightgame = Game.fightGame;
            for (let i = 0; i < fightgame.fightData.otherArr.length; i++) {
                if (reduceHp == 0) {
                    let hp = fightgame.fightData.otherArr[i].getData().blood - 1;
                    fightgame.fightData.otherArr[i].bloodCount(-hp);
                    console.log(fightgame.fightData.otherArr[i].cfg.name + "减少" + hp + "生命值", "剩余" + fightgame.fightData.otherArr[i].getData().blood);
                }
                else {
                    fightgame.fightData.otherArr[i].bloodCount(-reduceHp);
                    console.log(fightgame.fightData.otherArr[i].cfg.name + "减少" + reduceHp + "生命值", "剩余" + fightgame.fightData.otherArr[i].getData().blood);
                }
            }
        }
        static startReduceHpSelf(reduceHp = 0) {
            let fightgame = Game.fightGame;
            for (let i = 0; i < fightgame.fightData.selfArr.length; i++) {
                if (reduceHp == 0) {
                    let hp = fightgame.fightData.selfArr[i].getData().blood - 1;
                    fightgame.fightData.selfArr[i].bloodCount(-hp);
                    console.log(fightgame.fightData.selfArr[i].cfg.name + "减少" + hp + "生命值", "剩余" + fightgame.fightData.selfArr[i].getData().blood);
                }
                else {
                    fightgame.fightData.selfArr[i].bloodCount(-reduceHp);
                    console.log(fightgame.fightData.selfArr[i].cfg.name + "减少" + reduceHp + "生命值", "剩余" + fightgame.fightData.selfArr[i].getData().blood);
                }
            }
        }
    }

    class TutorialManager {
        static lv1Win() {
            let lv = UserModel.getInstance().lastLevel;
            let tutorial = UserModel.getInstance().beginnerTutorial;
            if (!tutorial.lv1 && lv == 1) {
                UnitManager.addHero(8);
                tutorial.lv1 = true;
                UserModel.getInstance().beginnerTutorial = tutorial;
            }
        }
        static lv2Win() {
            let lv = UserModel.getInstance().lastLevel;
            let tutorial = UserModel.getInstance().beginnerTutorial;
            if (!tutorial.lv2 && lv == 2) {
                UnitManager.addHero(5);
                tutorial.lv2 = true;
                UserModel.getInstance().beginnerTutorial = tutorial;
            }
        }
    }

    class UserManager {
        static upLvUser(level) {
            let exp = UserManager.getLevelExp(level);
            let userData = UserModel.getInstance().userData;
            userData.exp += exp;
            for (let i = 0; i < userData.lv + 999; i++) {
                let needExp = UserManager.upLvNeedMoney(userData.lv + 1);
                if (userData.exp >= needExp) {
                    userData.lv++;
                    userData.exp - needExp;
                }
                else {
                    UserModel.getInstance().userData = userData;
                    return;
                }
            }
        }
        static getLevelExp(level) {
            let exp = 100;
            return exp;
        }
        static upLvNeedMoney(lv) {
            let exp = 200 + 300 * lv;
            return exp;
        }
        static setUserData() {
            if (UserModel.getInstance().accountLevel) {
                return;
            }
            UserModel.getInstance().accountLevel = true;
            let lowerLvList = ["3ceshi_2", "4test_20low@qq.com", "3test_20low@qq.com", "feiji_2", "1test_2", "2test_2", "tanke_2", "1tanke_1", "2test_1"];
            let middleLvList = ["3ceshi_3", "4test_20mid@qq.com", "3test_20mid@qq.com", "test_3", "1feiji_3", "2feiji_3", "ceshi_3", "1tanke_3", "2tanke_3"];
            let seniorLvList = ["test_20hig@qq.com", "1test_20hig@qq.com", "3ceshi_4", "ceshi_4", "1ceshi_4", "2test_4", "qiche_4", "1ceshi_4", "2paoku_4"];
            if (lowerLvList.includes(AppConfig.userName)) {
                console.log("低级账号");
                UserModel.getInstance().money = 1000;
                UserModel.getInstance().diamond = 1000;
                let tutorial = UserModel.getInstance().beginnerTutorial;
                UnitManager.addHero(8);
                UnitManager.addHero(5);
                tutorial.lv1 = true;
                tutorial.lv2 = true;
                UserModel.getInstance().beginnerTutorial = tutorial;
            }
            else if (middleLvList.includes(AppConfig.userName)) {
                console.log("中级账号");
                UserModel.getInstance().money = 8000;
                UserModel.getInstance().diamond = 8000;
                let tutorial = UserModel.getInstance().beginnerTutorial;
                for (let i = 1; i <= 35; i++) {
                    UserModel.getInstance().pass(i);
                }
                UnitManager.addHero(8);
                UnitManager.addHero(5);
                tutorial.lv1 = true;
                tutorial.lv2 = true;
                UserModel.getInstance().beginnerTutorial = tutorial;
                let heroList = UserModel.getInstance().heroList;
                for (let i = 0; i < heroList.length; i++) {
                    heroList[i].lv = 40;
                    heroList[i].star = 3;
                }
                UserModel.getInstance().heroList = heroList;
                let equipIdList = [3002, 3005, 3008, 3102, 3105, 3108, 3202, 3205, 3208, 3302, 3305, 3308];
                for (let i = 0; i < equipIdList.length; i++) {
                    itemManager.addItem(equipIdList[i], 1);
                }
                let itemIdList = [1001, 1002, 2001, 2002, 2003, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009];
                for (let i = 0; i < itemIdList.length; i++) {
                    itemManager.addItem(itemIdList[i], 999999);
                }
                ;
                let equipIdList2 = [3001, 3002, 3004, 3005, 3007, 3008, 3101, 3102, 3104, 3105, 3107, 3108, 3201, 3202, 3204, 3205, 3207, 3208, 3301, 3302, 3304, 3305, 3307, 3308];
                for (let i = 0; i < equipIdList2.length; i++) {
                    itemManager.addItem(equipIdList2[i], 1);
                }
                ;
                let goodsList = UserModel.getInstance().goodsList;
                goodsList.forEach(item => {
                    if (item.onlyId) {
                        item.lv = 40;
                    }
                });
                UserModel.getInstance().goodsList = goodsList;
                heroList.forEach(item => {
                    let strongsetPower = itemManager.getStrongestPower(item.id);
                    strongsetPower.clothing.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.clothing[1], item.id, 0) : null;
                    strongsetPower.helmet.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.helmet[1], item.id, 1) : null;
                    strongsetPower.cloak.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.cloak[1], item.id, 2) : null;
                });
                UserModel.getInstance().firstLvTip = true;
                UserModel.getInstance().clickTipsList[0].click = 1;
                UserModel.getInstance().clickTipsList[1].click = 1;
                UserModel.getInstance().showTest = true;
            }
            else if (seniorLvList.includes(AppConfig.userName)) {
                console.log("高级账号");
                UserModel.getInstance().money = 99999999;
                UserModel.getInstance().diamond = 99999999;
                let tutorial = UserModel.getInstance().beginnerTutorial;
                for (let i = 1; i <= 100; i++) {
                    UserModel.getInstance().pass(i);
                }
                let cfgHero = ConfigManager.GetConfig(CfgHero);
                cfgHero.forEach(item => { UnitManager.addHero(item.id); });
                tutorial.lv1 = true;
                tutorial.lv2 = true;
                UserModel.getInstance().beginnerTutorial = tutorial;
                let heroList = UserModel.getInstance().heroList;
                for (let i = 0; i < heroList.length; i++) {
                    heroList[i].lv = 100;
                    heroList[i].star = 5;
                }
                UserModel.getInstance().heroList = heroList;
                let equipIdList = [3003, 3006, 3009, 3103, 3106, 3109, 3203, 3206, 3209, 3303, 3306, 3309];
                for (let i = 0; i < equipIdList.length; i++) {
                    itemManager.addItem(equipIdList[i], 3);
                }
                let itemIdList = [1001, 1002, 2001, 2002, 2003, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009];
                for (let i = 0; i < itemIdList.length; i++) {
                    itemManager.addItem(itemIdList[i], 999999);
                }
                ;
                let equipIdList2 = [3001, 3002, 3004, 3005, 3007, 3008, 3101, 3102, 3104, 3105, 3107, 3108, 3201, 3202, 3204, 3205, 3207, 3208, 3301, 3302, 3304, 3305, 3307, 3308];
                for (let i = 0; i < equipIdList2.length; i++) {
                    itemManager.addItem(equipIdList2[i], 1);
                }
                ;
                let goodsList = UserModel.getInstance().goodsList;
                goodsList.forEach(item => {
                    if (item.onlyId) {
                        item.lv = 50;
                    }
                });
                heroList.forEach(item => {
                    let strongsetPower = itemManager.getStrongestPower(item.id);
                    strongsetPower.clothing.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.clothing[1], item.id, 0) : null;
                    strongsetPower.helmet.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.helmet[1], item.id, 1) : null;
                    strongsetPower.cloak.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.cloak[1], item.id, 2) : null;
                });
                UserModel.getInstance().firstLvTip = true;
                UserModel.getInstance().clickTipsList[0].click = 1;
                UserModel.getInstance().clickTipsList[1].click = 1;
                UserModel.getInstance().showTest = true;
            }
        }
    }

    class CfgTask extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.num = data.num;
            data.jump ? this.jump = data.jump : this.jump = null;
            if (typeof data.reward == "number") {
                this.reward = [];
                this.reward.push(data.reward);
            }
            else {
                this.reward = data.reward == "" ? [] : JSON.parse(data.reward);
            }
            return this.id;
        }
        configName() {
            return "Task";
        }
    }

    class TaskManager {
        static setNewTime() {
            let nowTime = TimeUtil.UTC;
            let time = UserModel.getInstance().time;
            let isOK = !time || !TimeUtil.isSameDay(time, nowTime);
            if (isOK) {
                console.log("更新时间戳,重置所有任务" + nowTime);
                UserModel.getInstance().removeTaskTime(nowTime);
            }
        }
        static taskProgress() {
        }
        static updateTaskCount(TaskId, addCount = 1) {
            let taskList = UserModel.getInstance().taskList;
            let index = taskList.findIndex(task => task.id === TaskId);
            let cfg = ConfigManager.GetConfigByKey(CfgTask, TaskId);
            if (index !== -1 && taskList[index].count < cfg.num) {
                taskList[index].count += addCount;
                console.log("目前数量==>", taskList[index].count);
                UserModel.getInstance().taskList = taskList.concat([]);
            }
        }
    }

    class FightManager {
        constructor() {
            this.isTip = false;
            this.isSlefFight = false;
            this.isRemoveGame = false;
            this.isSkill = false;
            this.attackCount = 0;
            this.newOtherArr = [];
            this.newSelfArr = [];
            this.notAttackedMonsterArr = [];
            this.attackedUnitArr = [];
            this.heroSkillList = [];
            this.isSkillNow = false;
        }
        removeColor(arr) {
            GameModel.getInstance().attack = arr;
        }
        getUnitGlobalPos(id, type) {
            let fightData = Game.fightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            let pos = new Laya.Point;
            if (type == 1) {
                let unit = selfArr.findIndex(item => item.id === id);
                let fatherNode = selfArr[unit].parent;
                pos = fatherNode.localToGlobal(new Laya.Point(selfArr[unit].x, selfArr[unit].y));
            }
            else if (type == 2) {
                for (let i = 0; i < otherArr.length; i++) {
                    if (!otherArr[i].isDie) {
                        if (i === id) {
                            console.log(otherArr[i].cfg.name + "坐标====>", otherArr[i].x, otherArr[i].y);
                            let fatherNodeMon = otherArr[i].parent;
                            pos = fatherNodeMon.localToGlobal(new Laya.Point(otherArr[i].x, otherArr[i].y));
                            break;
                        }
                    }
                }
            }
            return pos;
        }
        getUnitPos(id, type) {
            let fightData = Game.fightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            let pos = new Laya.Point;
            if (type == 1) {
                let unit = selfArr.findIndex(item => item.id === id);
                pos.setTo(selfArr[unit].x, selfArr[unit].y);
            }
            else if (type == 2) {
                let mansterIndex = Game.fightGame.fightData.targetIndex;
                pos.setTo(otherArr[mansterIndex].x, otherArr[mansterIndex].y);
            }
            return pos;
        }
        isEnd(num) {
            if (num == 1) {
                if (!Game.fightGame.fightData.isAttack && Game.fightGame.fightData.attackHeroList.length !== 0) {
                    this.isSlefFight = false;
                    this.startBattle();
                    Game.fightGame.fightData.isAttack = true;
                }
                else {
                    if (!Game.fightGame.fightData.isAttack) {
                        console.log("消除结束,this.isSlefFight", this.isSlefFight);
                        this.isSlefFight = true;
                    }
                    this.isRemoveGame = true;
                    GameDispatcher.getInstance().event(EventName.GAME_AT_THE_BELL, 1);
                    Game.fightGame.fightData.isAttack = false;
                }
            }
            else if (num == 2) {
                if (Game.fightGame.fightData.attackHeroList.length !== 0) {
                    this.isSlefFight = false;
                    this.startBattle();
                    Game.fightGame.fightData.isAttack = true;
                    return;
                }
                Game.fightGame.fightData.isAttack = false;
                if (this.isRemoveGame) {
                    console.log("战斗结束,this.isSlefFight", this.isSlefFight);
                    this.isSlefFight = true;
                }
            }
            else if (num == 3) {
                if (this.isSkill) {
                    return;
                }
                this.isSkill = true;
            }
            if (!UserModel.getInstance().firstLvTip && UserModel.getInstance().lastLevel == 1 && !this.isTip) {
                this.isTip = true;
                GameDispatcher.getInstance().event(EventName.GAME_FIRST_TIPS2);
            }
            console.log("this.isRemoveGame==>", this.isRemoveGame, "this.isSlefFight==>", this.isSlefFight);
            if (this.isRemoveGame && this.isSlefFight && this.isSkill) {
                this.isRemoveGame = false;
                this.isSlefFight = false;
                this.isSkill = true;
                this.atTheBell2();
            }
        }
        atTheBell2() {
            if (Game.round == 1) {
                console.log("—————————————己方回合结束——————————————");
            }
            else {
                console.log("—————————————敌方回合结束——————————————");
            }
            Game.round == 1 ? Game.round = 2 : Game.round = 1;
            console.log("回合结束后，Game.round==>" + Game.round);
            if (Game.round == 1) {
                Game.fightGame.fightData.buffmng.update();
            }
            if (Game.round == 2) {
                Game.fightGame.otherAttack();
            }
        }
        atTheBell() {
            if (Game.round == 1) {
                console.log("—————————————己方回合结束——————————————");
            }
            else {
                console.log("—————————————敌方回合结束——————————————");
            }
            Game.round == 1 ? Game.round = 2 : Game.round = 1;
            console.log("回合结束后，Game.round==>" + Game.round);
            GameDispatcher.getInstance().event(EventName.GAME_AT_THE_BELL, 2);
            if (Game.round == 1) {
                Game.fightGame.fightData.buffmng.update();
            }
            if (Game.round == 2) {
                Game.fightGame.otherAttack();
            }
        }
        showMave() {
            Message.show("回合 " + (Game.fightGame.fightData.currentWave + 1) + "/" + (Game.fightGame.fightData.waveMaxNum + 1));
        }
        isFail() {
            if (Game.isEndLessMode == 1) {
                let fightData = Game.fightGame.fightData;
                let selfArr = fightData.selfArr;
                for (let i = 0; i < selfArr.length; i++) {
                    if (!selfArr[i].isDie) {
                        fightData.selfIndex = i;
                        return false;
                    }
                }
                fightData.gameover = true;
                return true;
            }
        }
        onFail() {
            if (Game.isEndLessMode == 1) {
                let isFail = this.isFail();
                if (isFail === true) {
                    GameModel.getInstance().gameOver();
                    UIMgr.show(UIDefine.UIGameFailCtl, []);
                }
            }
            else if (Game.isEndLessMode == 2) {
                Game.endLessMgr.onFail();
            }
        }
        onWin() {
            if (Game.isEndLessMode == 1) {
                let isWin = Game.fightGame.switchSelectMonster();
                let waveMaxNum = Game.fightGame.fightData.waveMaxNum;
                let currentWave = Game.fightGame.fightData.currentWave;
                let lv = UserModel.getInstance().lastLevel;
                console.log("isWin==>", isWin);
                if (isWin) {
                    if (currentWave < waveMaxNum) {
                        Game.fightGame.fightData.nextWave();
                        console.log(`下一波为第${currentWave + 1}波，最大波数为${waveMaxNum}`);
                        this.showMave();
                    }
                    else {
                        Laya.Tween.clearAll(this);
                        Laya.timer.clearAll(this);
                        Game.fightGame.fightData.gameover = true;
                        GameModel.getInstance().gameOver();
                        TutorialManager.lv1Win();
                        TutorialManager.lv2Win();
                        UserModel.getInstance().pass(lv);
                        TaskManager.updateTaskCount(2);
                        UserManager.upLvUser(lv);
                        UIMgr.show(UIDefine.UIGameWinCtl, lv);
                    }
                }
            }
            else if (Game.isEndLessMode == 2) {
                Game.endLessMgr.onWin();
            }
        }
        remake() {
            GameModel.getInstance().gameOver();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIGameCtl, UserModel.getInstance().lastLevel);
        }
        setSkillMap() {
            this.activeSkillMap = new Map();
            let heroArr = Game.fightGame.fightData.selfArr;
            for (let i = 0; i < heroArr.length; i++) {
                let skillNum = heroArr[i].cfg.useskillarr[0];
                let skillClass = "skill" + skillNum;
                this.activeSkillMap.set(skillNum, skillClass);
            }
            console.log("保存英雄技能==>", this.activeSkillMap);
        }
        heroAttack1() {
            console.log("待攻击英雄列表==>", Game.fightGame.fightData.attackHeroList);
            this.startBattle();
        }
        initPos(callback = null) {
            console.log("恢复位置");
            let fightData = Game.fightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            this.clearOld(() => { console.log(2); });
            for (let i = 0; i < otherArr.length; i++) {
                let monster = otherArr[i];
                if (!monster.isDie) {
                    monster.unitSk.offAll();
                    monster.unitSk.scale(-0.7, 0.7);
                    monster.unitSk.play("stand", true, false);
                    Laya.Tween.to(monster, { x: monster.initPos.x, y: monster.initPos.y }, 300, null, Laya.Handler.create(this, () => { monster.zOrder = monster.initZOrder; }));
                }
                else if (monster.isDie && monster.visible) {
                    monster.unitSk.offAll();
                    monster.unitSk.play("death", false, true);
                    monster.unitSk.on(Laya.Event.STOPPED, this, () => {
                        monster.visible = false;
                        Game.fightManager.onWin();
                        Game.fightManager.onFail();
                    });
                }
            }
            for (let i = 0; i < selfArr.length; i++) {
                let hero = selfArr[i];
                if (!hero.isDie) {
                    hero.unitSk.offAll();
                    hero.unitSk.scale(0.45, 0.45);
                    hero.unitSk.play("stand", true, false);
                    Laya.Tween.to(hero, { x: hero.initPos.x, y: hero.initPos.y }, 300, null, Laya.Handler.create(this, () => { hero.zOrder = hero.initZOrder; }));
                }
                else if (hero.isDie && hero.visible) {
                    hero.unitSk.offAll();
                    hero.unitSk.play("death", false, true);
                    hero.unitSk.on(Laya.Event.STOPPED, this, () => {
                        hero.visible = false;
                        Game.fightManager.onWin();
                        Game.fightManager.onFail();
                    });
                }
            }
            Laya.timer.once(500, this, () => {
                callback && callback();
            });
        }
        clearOld(callback) {
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            console.log("结束清空");
            this.isSkillNow = false;
            callback();
        }
        addHeroSkill(id, callback) {
            if (!this.heroSkillList.includes(id)) {
                this.heroSkillList.push(id);
                callback();
            }
            if (!Game.fightGame.fightData.isAttack) {
                this.useHeroSkill();
            }
            else {
                console.log("在攻击中，无法施放技能");
            }
        }
        useHeroSkill() {
            if (this.isSkillNow) {
                console.log("技能施放中，请等待!");
                return;
            }
            if (this.heroSkillList.length == 0) {
                let otherArr = Game.fightGame.fightData.otherArr;
                let dieNum = 0;
                for (let i = 0; i < otherArr.length; i++) {
                    if (otherArr[i].isDie) {
                        dieNum++;
                    }
                }
                if (dieNum !== otherArr.length) {
                    this.startBattle();
                }
                return;
            }
            this.isSkill = false;
            this.isSkillNow = true;
            let skill;
            skill = new SkillAll();
            let cfgHero = ConfigManager.GetConfigByKey(CfgHero, this.heroSkillList[0]);
            let getV = Game.fightManager.activeSkillMap.get(cfgHero.useskillarr[0]);
            skill[`${getV}`](this.heroSkillList[0], () => {
                this.heroSkillList.splice(0, 1);
                this.isSkillNow = false;
                console.log("技能施放完毕");
                this.useHeroSkill();
                return;
            });
        }
        useHeroStarSkill() {
            let starSkillHeroList = Game.fightGame.fightData.starSkillHeroList;
            let skillNum = starSkillHeroList[0].cfg.useskillarr[1];
            let skill;
            skill = new SkillAll();
            if (!skill[`skill${skillNum}`]) {
                console.log(starSkillHeroList[0].cfg.name + "星纹技能未完成");
                this.useStarSkillEnd();
                return;
            }
            console.log(`${starSkillHeroList[0].cfg.name}释放星纹技，skill${skillNum}`);
            skill[`skill${skillNum}`](starSkillHeroList[0].cfg.id, () => {
                this.useStarSkillEnd();
            });
        }
        useStarSkillEnd() {
            Game.fightGame.fightData.starSkillHeroList.splice(0, 1);
            if (Game.fightGame.fightData.starSkillHeroList.length !== 0) {
                console.log("施放主动技能", Game.fightGame.fightData.starSkillHeroList);
                this.useHeroSkill();
            }
            else {
                this.executeBattle((() => { console.log(4, "星纹技能结束"); }));
            }
        }
        startBattle() {
            console.log("————————————开始攻击————————————");
            if (this.isSkillNow) {
                console.log("攻击：正在等待技能施放完毕");
                return;
            }
            this.isSkill = true;
            let fightData = Game.fightGame.fightData;
            let otherArr = fightData.otherArr;
            let selfArr = fightData.selfArr;
            this.newOtherArr = [];
            this.newSelfArr = [];
            selfArr.forEach(item => {
                if (!item.isDie) {
                    this.newSelfArr.push(item);
                }
            });
            otherArr.forEach(item => {
                if (!item.isDie) {
                    this.newOtherArr.push(item);
                }
            });
            this.attackCount = 0;
            if (Game.round === 2) {
                this.notAttackedMonsterArr = this.newOtherArr.concat([]);
            }
            this.executeBattle(() => { console.log(1); });
        }
        executeBattle(callback) {
            callback();
            if (Game.fightGame.fightData.gameover) {
                return;
            }
            if (this.newOtherArr.length == 0) {
                console.log("所有单位死亡,生成下一波怪物");
                this.onWin();
                return;
            }
            let fightData = Game.fightGame.fightData;
            let otherArr = fightData.otherArr;
            let mansterIndex = Game.fightGame.fightData.targetIndex;
            let selectMonster = otherArr[mansterIndex];
            if (Game.round === 1) {
                if (Game.fightGame.fightData.starSkillHeroList.length !== 0) {
                    this.useHeroStarSkill();
                    return;
                }
                if (Game.fightGame.fightData.attackHeroList.length == 0) {
                    console.log("暂无单位可以攻击", Game.fightGame.fightData.attackHeroList);
                    this.isEnd(2);
                    return;
                }
                console.log("英雄攻击2222");
                console.log("英雄列表==>", Game.fightGame.fightData.attackHeroList);
                this.fightUnit(Game.fightGame.fightData.attackHeroList[0], selectMonster, () => {
                    this.cb();
                });
            }
            else if (Game.round === 2) {
                console.log("怪物攻击");
                if (this.newOtherArr.length == 0) {
                    console.log("所有单位死亡,生成下一波怪物");
                    this.onWin();
                    return;
                }
                let randomCount = RandomUtil.randomInt(0, this.newSelfArr.length);
                let hero = this.newSelfArr[randomCount];
                console.log("22222，this.attackCount==>" + this.attackCount, "this.newOtherArr.length==>" + this.newOtherArr.length);
                if (this.attackCount < this.newOtherArr.length) {
                    console.log("怪物攻击222");
                    this.fightUnit(this.newOtherArr[this.attackCount], hero, () => {
                        this.cb();
                    });
                }
                else {
                    this.atTheBell();
                }
            }
        }
        cb() {
            if (Game.round == 1) {
                Game.fightGame.fightData.attackHeroList.splice(0, 1);
                this.attackedUnitArr.push(Game.fightGame.fightData.attackHeroList[0]);
                this.attackCount++;
                if (this.heroSkillList.length > 0) {
                    this.initPos();
                    this.useHeroSkill();
                    return;
                }
                this.executeBattle(() => { console.log(2, "战斗22"); });
            }
            else if (Game.round == 2) {
                if (this.notAttackedMonsterArr.length == 0) {
                    this.atTheBell();
                }
                console.log("this.attackCount==>" + this.attackCount, "this.newOtherArr.length==>" + this.newOtherArr.length);
                let attackMonsterId = this.newOtherArr[this.attackCount].id;
                let findIndex = this.notAttackedMonsterArr.findIndex(monster => monster.id === attackMonsterId);
                if (findIndex !== -1) {
                    this.notAttackedMonsterArr.splice(findIndex, 1);
                }
                this.attackCount++;
                this.executeBattle(() => { console.log(3, "战斗22"); });
            }
        }
        fightUnit(attackUnit, attackedUnit, callback) {
            if (Game.isEndLessMode !== 1) {
                Laya.timer.clearAll(this);
                Laya.Tween.clearAll(this);
                return;
            }
            if (Game.round === 1) {
                attackUnit.zOrder = 10;
                let pos = this.getUnitPos(null, 2);
                if (attackUnit.cfg.attacktype == 1) {
                    this.closeAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
                else {
                    this.rangedAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
            }
            else if (Game.round === 2) {
                attackUnit.zOrder = 10;
                if (!attackedUnit) {
                    return;
                }
                let pos = this.getUnitPos(attackedUnit.id, 1);
                if (attackUnit.cfg.attacktype == 1) {
                    this.closeAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
                else {
                    this.rangedAttack(attackUnit, pos, attackedUnit, () => {
                        callback && callback();
                    });
                }
            }
        }
        closeAttack(attackUnit, localPos, attackedUnit, callback = null) {
            if (attackUnit.isHero) {
                attackUnit.unitSk.play("move", true);
                Laya.Tween.to(attackUnit, { x: localPos.x - 150, y: localPos.y }, 500, null, Laya.Handler.create(this, () => {
                    attackUnit.unitSk.offAll();
                    attackUnit.unitSk.play('attack', false);
                    let fatherNode = attackUnit.parent;
                    if (attackUnit.cfg.attackeffect) {
                        let attack = new AttackEffectAll();
                        attack[`attackEffect${attackUnit.cfg.attackeffect}`](fatherNode, localPos.x, localPos.y);
                    }
                    this.heroAttack(attackUnit, attackedUnit);
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        attackUnit.unitSk.scale(-0.45, 0.45);
                        attackUnit.unitSk.play("move", true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                            attackUnit.unitSk.play("stand", true);
                            attackUnit.unitSk.scale(0.45, 0.45);
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }));
            }
            else {
                Laya.Tween.to(attackUnit, { x: localPos.x + 150, y: localPos.y }, 500, null, Laya.Handler.create(this, () => {
                    attackUnit.unitSk.offAll();
                    attackUnit.unitSk.play('attack', false);
                    let fatherNode = attackUnit.parent;
                    if (attackUnit.cfg.attackeffect) {
                        let attack = new AttackEffectAll();
                        attack[`attackEffect${attackUnit.cfg.attackeffect}`](fatherNode, localPos.x, localPos.y);
                    }
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        attackedUnit.bloodCount(-attackUnit.getData().attack);
                        attackUnit.unitSk.play('stand', true);
                        attackUnit.unitSk.scale(0.7, 0.7);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 500, null, Laya.Handler.create(this, () => {
                            attackUnit.unitSk.scale(-0.7, 0.7);
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }));
            }
        }
        heroAttack(attackUnit, attackedUnit) {
            let daoList = [2, 6, 7];
            if (attackUnit.cfg.id == 3 || attackUnit.cfg.id == 1) {
                Laya.timer.once(500, this, () => {
                    attackedUnit.bloodCount(-attackUnit.getData().attack);
                });
            }
            else if (daoList.includes(attackUnit.cfg.id)) {
                Laya.timer.once(150, this, () => {
                    attackedUnit.bloodCount(-attackUnit.getData().attack);
                });
            }
        }
        rangedAttack(attackUnit, localPos, affectedUnit, callback = null) {
            console.log("远程攻击");
            let fatherNode = attackUnit.parent;
            let ismagic = attackUnit.cfg.ismagic;
            attackUnit.unitSk.offAll();
            attackUnit.unitSk.play('attack', false);
            attackUnit.zOrder = attackUnit.initZOrder;
            if (ismagic == 1) {
                if (!affectedUnit) {
                    if (callback) {
                        callback();
                    }
                    console.log("单位被清除，取消远程攻击");
                    return;
                }
                else {
                    if (affectedUnit.getData().blood <= 0) {
                        if (callback) {
                            callback();
                        }
                        console.log(`单位生命值为${affectedUnit.getData().blood}，取消远程攻击`);
                        return;
                    }
                }
                let fatherNode2 = affectedUnit.parent;
                Laya.timer.once(750, this, () => {
                    let pointAttack = new Laya.Point(attackUnit.x, attackUnit.y);
                    let pointAffected = new Laya.Point(affectedUnit.x, affectedUnit.y);
                    for (let i = 0; i < 3; i++) {
                        let X = ((pointAffected.x - pointAttack.x) * ((i + 2) / 5)) + pointAttack.x;
                        let Y = ((pointAffected.y - pointAttack.y) * ((i + 2) / 5)) + pointAttack.y;
                        Laya.timer.once(200 * (i + 1), this, () => {
                            let effect = FixedEffect.createEffect("res/game/skillskeleton/Spell_Active_Attack_DragonNormal.sk");
                            fatherNode2.addChild(effect);
                            effect.pos(9999, 9999);
                            effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                                Laya.timer.frameOnce(2, this, () => {
                                    effect.scaleY = -1;
                                    effect.pos(X, (Y - 500));
                                    effect.playAnimOnce();
                                });
                            }));
                        });
                    }
                    Laya.timer.once(800, this, () => {
                        let anim = FixedEffect.createEffect("res/game/skillskeleton/Spell_Active_Attack_DragonNormal.sk");
                        anim.sk.load(anim.sk.url, Laya.Handler.create(this, () => {
                            Laya.timer.frameOnce(2, this, () => {
                                fatherNode2.addChild(anim);
                                anim.scaleY = -1;
                                anim.pos(affectedUnit.x, affectedUnit.y - 500);
                                anim.playAnimOnce(() => {
                                    affectedUnit.bloodCount(-attackUnit.getData().attack);
                                });
                            });
                        }));
                        attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                            attackUnit.unitSk.play('stand', true);
                            if (callback) {
                                callback();
                            }
                        });
                    });
                });
            }
            else {
                if (Game.round == 2) {
                    attackUnit.unitSk.on(Laya.Event.STOPPED, this, () => {
                        let attackSk = RangedAttack.createSk(Game.round);
                        if (attackSk) {
                            fatherNode.addChild(attackSk);
                        }
                        attackSk.pos(attackUnit.initPos.x, attackUnit.initPos.y);
                        attackSk.zOrder = 11;
                        attackSk.posMoveToPos(attackUnit.initPos.x, attackUnit.initPos.y, localPos.x, localPos.y, affectedUnit, attackUnit);
                        attackUnit.unitSk.play('stand', true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 1000, null, Laya.Handler.create(this, () => {
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }
                else {
                    Laya.timer.once(1500, this, () => {
                        let attackSk = RangedAttack.createSk(Game.round);
                        if (attackSk) {
                            fatherNode.addChild(attackSk);
                        }
                        attackSk.pos(attackUnit.initPos.x, attackUnit.initPos.y);
                        attackSk.zOrder = 11;
                        attackSk.posMoveToPos(attackUnit.initPos.x, attackUnit.initPos.y, localPos.x, localPos.y, affectedUnit, attackUnit);
                        attackUnit.unitSk.play('stand', true);
                        Laya.Tween.to(attackUnit, { x: attackUnit.initPos.x, y: attackUnit.initPos.y }, 1000, null, Laya.Handler.create(this, () => {
                            attackUnit.zOrder = attackUnit.initZOrder;
                            if (callback) {
                                callback();
                            }
                        }));
                    });
                }
            }
        }
    }

    class Load {
        newEffect(effect, callback) {
            effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                callback();
            }));
        }
    }

    class GameMgr {
        static init() {
            Game.endLessFightGame = new EndLessFightGame();
            Game.endLessFightGame.init();
            Game.endLessMgr = new EndLessMgr();
            Game.fightGame = new FightGame();
            Game.fightGame.init();
            Game.fightManager = new FightManager();
            Game.load = new Load();
        }
    }

    class FxStar extends Laya.Sprite {
        constructor(id = 1) {
            super();
            this._list = [];
            this._num = 6;
            for (let i = 0; i < this._num; i++) {
                let st = new Star("res/particle/star" + id + ".png");
                this.addChild(st);
                this._list.push(st);
            }
        }
        shoot() {
            for (let i = 0; i < this._num; i++) {
                this._list[i].init(RandomUtil.randomInt(-600, 600), RandomUtil.randomInt(-250, -500), RandomUtil.randomInt(-300, 300));
            }
            Laya.timer.frameLoop(1, this, this.update);
        }
        update() {
            let dt = Laya.timer.delta / 1000;
            for (let i = 0; i < this._num; i++) {
                this._list[i].update(dt);
            }
        }
    }
    class Star extends Laya.Image {
        constructor(url) {
            super(url);
            this.vx = 0;
            this.vy = 0;
            this.r = 0;
            this.t = 0;
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.scale(1.4, 1.4);
        }
        init(vx, vy, r) {
            this.x = 0;
            this.y = 0;
            this.vx = vx;
            this.vy = vy;
            this.t = 1;
            this.r = r;
        }
        update(dt) {
            this.x += this.vx * dt;
            this.t += dt;
            this.vy += 1000 * dt * this.t * this.t;
            this.y += this.vy * dt;
            this.rotation += this.r * dt;
        }
    }

    class SpecialEliminateAlgorithm extends Singleton {
        constructor() {
            super(...arguments);
            this.usedRowList = [];
            this.usedColList = [];
            this.delList = [];
        }
        createPoint(x, y) {
            let point;
            point = new Laya.Point();
            point.setTo(x, y);
            return point;
        }
        generateDataArr(lv, isInit) {
            let obsLvIdList = [23, 25, 26];
            if (isInit) {
                let firstLv = UserModel.getInstance().firstLvTip;
                let lastLv = UserModel.getInstance().lastLevel;
                console.log(lastLv === 1 && firstLv);
                if (lastLv === 1 && !firstLv) {
                    this.dataArr = [
                        [2, 4, 3, 3, 1],
                        [2, 4, 2, 2, 3],
                        [4, 1, 1, 3, 4],
                        [1, 4, 3, 1, 3],
                        [4, 1, 4, 2, 1],
                        [3, 4, 3, 3, 2],
                        [2, 3, 4, 2, 2],
                    ];
                    return;
                }
                if (obsLvIdList.includes(lv)) {
                    this.dataArr = this.specialDataArr(lv);
                    return;
                }
                this.dataArr = [];
                this.dataArr = this.initDataArrTest();
                return;
            }
            else {
                this.newDataArr = [];
                for (let i = 0; i <= 6; i++) {
                    let arr = [];
                    for (let j = 0; j <= 4; j++) {
                        arr.push(RandomUtil.randomInt(1, 5));
                    }
                    this.newDataArr.push(arr);
                }
            }
        }
        generateObstacle(id) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevel, id);
            let pecialLvList = [23, 24, 25, 26, 27, 28, 29];
            if (pecialLvList.includes(id)) {
                this.getsPecialObstacle(id);
                return;
            }
            let obstacle = cfg.obstacle;
            for (let i = 0; i < obstacle.length; i++) {
                let X = this.getX(obstacle[i]);
                let Y = this.getY(obstacle[i]);
                this.dataArr[Y][X] = 13;
            }
        }
        getDataArr() {
            return this.dataArr;
        }
        getNewDataArr() {
            return this.newDataArr;
        }
        ClearUsedList() {
            this.usedRowList = [];
            this.usedColList = [];
        }
        getClearArr() {
            this.dataArr = UserModel.getInstance().spDataArr.concat([]);
            this.ObstacleArr = [];
            for (let i = 0; i < this.delList.length; i++) {
                let pos = this.delList[i];
                let delX = this.getX(pos);
                let delY = this.getY(pos);
                if (delY - 1 >= 0) {
                    if (this.dataArr[delY - 1][delX] > 9) {
                        if (this.ObstacleArr.length === 0) {
                            this.ObstacleArr.push(this.getIndex(delY - 1, delX));
                        }
                        let find = this.ObstacleArr.find(index => index === this.getIndex(delY - 1, delX));
                        if (find == undefined) {
                            this.ObstacleArr.push(this.getIndex(delY - 1, delX));
                        }
                    }
                }
                if (delY + 1 < this.dataArr.length) {
                    if (this.dataArr[delY + 1][delX] > 9) {
                        if (this.ObstacleArr.length === 0) {
                            this.ObstacleArr.push(this.getIndex(delY + 1, delX));
                        }
                        let find = this.ObstacleArr.find(index => index === this.getIndex(delY + 1, delX));
                        if (find == undefined) {
                            this.ObstacleArr.push(this.getIndex(delY + 1, delX));
                        }
                    }
                }
                if (delX - 1 >= 0) {
                    if (this.dataArr[delY][delX - 1] > 9) {
                        if (this.ObstacleArr.length === 0) {
                            this.ObstacleArr.push(this.getIndex(delY, delX - 1));
                        }
                        let find = this.ObstacleArr.find(index => index === this.getIndex(delY, delX - 1));
                        if (find == undefined) {
                            this.ObstacleArr.push(this.getIndex(delY, delX - 1));
                        }
                    }
                }
                if (delX + 1 < this.dataArr[0].length) {
                    if (this.dataArr[delY][delX + 1] > 9) {
                        if (this.ObstacleArr.length === 0) {
                            this.ObstacleArr.push(this.getIndex(delY, delX + 1));
                        }
                        let find = this.ObstacleArr.find(index => index === this.getIndex(delY, delX + 1));
                        if (find == undefined) {
                            this.ObstacleArr.push(this.getIndex(delY, delX + 1));
                        }
                    }
                }
            }
            return [this.delList, this.ObstacleArr];
        }
        getFourInOnePosArr() {
            return this.fourInOnePosArr;
        }
        getIndex(y, x) {
            return y * 5 + x;
        }
        getX(index) {
            return Math.floor(index % 5);
        }
        getY(index) {
            return Math.floor(index / 5);
        }
        clickItem(x, y) {
            this.dataArr = [];
            this.delList = [];
            this.fourInOnePosArr = [];
            this.dataArr = UserModel.getInstance().spDataArr.concat([]);
            let clickItem = this.dataArr[x][y];
            if (clickItem > 9) {
                return;
            }
            let colArr = [];
            let colOrRow = 0;
            for (let i = x - 1; i >= 0; i--) {
                let find = this.usedColList.find(num => num === this.getIndex(x, y));
                if (this.dataArr[i][y] == null || find !== undefined || colOrRow == 2) {
                    break;
                }
                if (this.dataArr[i][y] == clickItem) {
                    colOrRow = 1;
                    colArr.push(this.getIndex(i, y));
                    this.usedColList.push(this.getIndex(i, y));
                }
                else {
                    break;
                }
            }
            for (let i = x + 1; i < 7; i++) {
                let find = this.usedColList.find(num => num === this.getIndex(x, y));
                if (this.dataArr[i][y] == null || find !== undefined || colOrRow == 2) {
                    break;
                }
                if (this.dataArr[i][y] == clickItem) {
                    colOrRow = 1;
                    colArr.push(this.getIndex(i, y));
                    this.usedColList.push(this.getIndex(i, y));
                }
                else {
                    break;
                }
            }
            if (colArr.length >= 2) {
                colArr.push(this.getIndex(x, y));
                this.delList = this.delList.concat(colArr);
            }
            let rowArr = [];
            for (let i = y - 1; i >= 0; i--) {
                let find = this.usedRowList.find(num => num === this.getIndex(x, y));
                if (this.dataArr[x][i] == null || find !== undefined || (colOrRow == 1 && colArr.includes(this.getIndex(x, y)))) {
                    break;
                }
                if (this.dataArr[x][i] == clickItem) {
                    colOrRow = 2;
                    rowArr.push(this.getIndex(x, i));
                    this.usedRowList.push(this.getIndex(x, i));
                }
                else {
                    break;
                }
            }
            for (let i = y + 1; i < 5; i++) {
                let find = this.usedRowList.find(num => num === this.getIndex(x, y));
                if (this.dataArr[x][i] == null || find !== undefined || (colOrRow == 1 && colArr.includes(this.getIndex(x, y)))) {
                    break;
                }
                if (this.dataArr[x][i] == clickItem) {
                    colOrRow = 2;
                    rowArr.push(this.getIndex(x, i));
                    this.usedRowList.push(this.getIndex(x, i));
                }
                else {
                    break;
                }
            }
            if (rowArr.length >= 2) {
                rowArr.push(this.getIndex(x, y));
                this.delList = this.delList.concat(rowArr);
            }
        }
        getItemColorNum(itemArr, removeArr) {
            let sumArr = [];
            for (let i = 0; i < removeArr.length; i++) {
                if (removeArr[i].length !== 0) {
                    for (let j = 0; j < removeArr[i].length; j++) {
                        let x = this.getX(removeArr[i][j]);
                        let y = this.getY(removeArr[i][j]);
                        let item = itemArr[y][x];
                        sumArr.push({ color: item.id, isBig: item.FourInOneState });
                    }
                }
            }
            if (sumArr.length !== 0) {
                Game.fightManager.removeColor(sumArr);
            }
        }
        getItemColorNumFive(clearArr) {
            let sumArr = [];
            clearArr.forEach(item => {
                if (item.length !== 0) {
                    sumArr.push({ color: item[0], isBig: item[1] });
                }
            });
            Game.fightManager.removeColor(sumArr);
        }
        initDataArrTest() {
            let arr = [
                [
                    [2, 4, 2, 3, 1],
                    [2, 3, 4, 2, 3],
                    [4, 1, 4, 3, 4],
                    [1, 4, 1, 1, 2],
                    [4, 1, 2, 2, 1],
                    [2, 4, 1, 3, 2],
                    [2, 1, 4, 2, 2],
                ],
                [
                    [2, 3, 4, 2, 3],
                    [2, 1, 3, 2, 2],
                    [4, 2, 4, 3, 4],
                    [4, 1, 2, 2, 1],
                    [2, 4, 2, 3, 1],
                    [2, 1, 1, 3, 2],
                    [1, 4, 1, 1, 2],
                ],
                [
                    [4, 2, 4, 3, 4],
                    [2, 4, 2, 3, 1],
                    [3, 3, 4, 2, 3],
                    [2, 1, 1, 3, 2],
                    [4, 1, 2, 2, 1],
                    [1, 4, 1, 1, 2],
                    [2, 1, 3, 2, 2],
                ],
                [
                    [2, 4, 2, 3, 1],
                    [2, 1, 1, 2, 2],
                    [4, 2, 4, 3, 4],
                    [2, 1, 3, 2, 2],
                    [4, 1, 2, 2, 1],
                    [1, 4, 1, 1, 2],
                    [3, 3, 4, 2, 3],
                ],
                [
                    [2, 1, 3, 2, 2],
                    [2, 2, 1, 2, 2],
                    [4, 1, 2, 3, 1],
                    [4, 2, 4, 3, 4],
                    [3, 3, 4, 2, 3],
                    [1, 4, 1, 1, 2],
                    [2, 4, 2, 3, 1],
                ],
            ];
            let random = RandomUtil.randomInt(0, arr.length);
            return arr[random];
        }
        specialDataArr(lv) {
            let arr = [];
            switch (lv) {
                case 23:
                    arr = [
                        [3, 3, 3, 3, 3],
                        [3, 3, 3, 3, 3],
                        [3, 3, 3, 3, 3],
                        [3, 3, 5, 3, 3],
                        [3, 3, 3, 3, 3],
                        [3, 3, 3, 3, 3],
                        [3, 3, 3, 3, 3],
                    ];
                    break;
                case 25:
                    arr = [
                        [3, 3, 1, 3, 3],
                        [3, 3, 1, 3, 3],
                        [3, 1, 2, 1, 3],
                        [3, 3, 1, 3, 3],
                        [3, 3, 1, 3, 3],
                        [3, 3, 1, 3, 3],
                        [3, 3, 1, 3, 3],
                    ];
                    break;
                case 26:
                    arr = [
                        [3, 3, 2, 3, 3],
                        [3, 2, 1, 2, 3],
                        [3, 1, 2, 1, 3],
                        [3, 3, 4, 3, 3],
                        [3, 3, 2, 3, 3],
                        [3, 2, 1, 2, 3],
                        [3, 2, 1, 2, 3],
                    ];
                    break;
                default:
                    break;
            }
            return arr;
        }
        getsPecialObstacle(id) {
            let obsArr11;
            let obsArr12;
            let obsArr13;
            switch (id) {
                case 23:
                    obsArr11 = [2, 6, 8, 12];
                    obsArr12 = [25, 29, 31, 33];
                    obsArr13 = [10, 14, 16, 18, 21, 23, 27];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    for (let i = 0; i < obsArr13.length; i++) {
                        let X = this.getX(obsArr13[i]);
                        let Y = this.getY(obsArr13[i]);
                        this.dataArr[Y][X] = 13;
                    }
                    break;
                case 24:
                    obsArr12 = [0, 4, 5, 9, 10, 14, 15, 19, 20, 24, 25, 29, 30, 31, 33, 34];
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    break;
                case 25:
                    obsArr11 = [0, 4, 30, 31, 33, 34, 32];
                    obsArr12 = [1, 3, 6, 8, 16, 18, 21, 23, 26, 28, 5, 10, 15, 20, 25, 9, 14, 19, 24, 29];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    break;
                case 26:
                    obsArr11 = [1, 3, 10, 14];
                    obsArr12 = [11, 13, 20, 24];
                    obsArr13 = [0, 4, 5, 9];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    for (let i = 0; i < obsArr13.length; i++) {
                        let X = this.getX(obsArr13[i]);
                        let Y = this.getY(obsArr13[i]);
                        this.dataArr[Y][X] = 13;
                    }
                    break;
                case 27:
                    obsArr11 = [1, 3, 31, 33];
                    obsArr12 = [0, 5, 10, 15, 20, 25, 30, 4, 9, 14, 19, 24, 29, 34];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    break;
                case 28:
                    obsArr11 = [15, 16, 21, 19, 18, 23];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    break;
                case 29:
                    obsArr11 = [16, 18];
                    obsArr12 = [10, 15, 20, 14, 19, 24];
                    for (let i = 0; i < obsArr11.length; i++) {
                        let X = this.getX(obsArr11[i]);
                        let Y = this.getY(obsArr11[i]);
                        this.dataArr[Y][X] = 11;
                    }
                    for (let i = 0; i < obsArr12.length; i++) {
                        let X = this.getX(obsArr12[i]);
                        let Y = this.getY(obsArr12[i]);
                        this.dataArr[Y][X] = 12;
                    }
                    break;
            }
        }
    }

    class Star$1 extends Laya.Sprite {
        constructor() {
            super();
            this.icon = new Laya.Image();
            this.icon.anchorX = 0.5;
            this.icon.anchorY = 0.5;
            this.icon.skin = "res/ui/icon/icon1.png";
            this.addChild(this.icon);
        }
        static CreateStar() {
            if (Star$1.poolList.length <= 0) {
                return new Star$1();
            }
            else {
                return Star$1.poolList.pop();
            }
        }
        posMoveToPos(color, x1, y1, x2, y2, isBig, delay = 0) {
            this.pos(x1, y1);
            let time = RandomUtil.randomInt(200, 350);
            Laya.Tween.to(this, { x: x2, y: y2 }, time, null, Laya.Handler.create(this, function () {
                this.recover();
            }), delay);
        }
        recover() {
            this.removeSelf();
            Star$1.poolList.push(this);
        }
    }
    Star$1.poolList = [];

    class StarItem extends ui.view.removegame.StarItemUI {
        constructor() {
            super();
            this.id = 1;
            this.FourInOneState = false;
        }
        static createStarItem() {
            return new StarItem();
        }
        setId(value) {
            if (value <= 0) {
                return;
            }
            this.id = value;
            if (this.id <= 4) {
                this.icon.skin = "res/ui/icon/star" + this.id + ".png";
            }
            else if (this.id === 5) {
                this.icon.skin = `res/ui/icon/fiveInOne.png`;
            }
            else if (this.id > 10) {
                this.icon.skin = `res/ui/icon/obstacle${this.id}.png`;
            }
        }
        modeifyState(id) {
            this.id = id;
            if (this.id > 10) {
                this.icon.skin = `res/ui/icon/obstacle${this.id}.png`;
            }
        }
        FourInOne() {
            this.FourInOneState = true;
            this.icon.skin = `res/ui/icon/star${this.id + 4}.png`;
        }
        fiveInOne() {
            this.id = 5;
            this.icon.skin = `res/ui/icon/fiveInOne.png`;
        }
        recover() {
            this.destroy();
        }
        changeColor(color) {
            this.id = color;
            this.icon.skin = "res/ui/icon/star" + color + ".png";
        }
    }

    class SpeakMsg extends ui.view.SpeakMsgUI {
        static show(txt, isShowBg = false, callback = null, Y = null) {
            let box = new SpeakMsg(txt, isShowBg, callback, Y);
            let layer = LayerMgr.getLayer(LayerMgr.LAYER_TIPS);
            layer.addChild(box);
            box.width = Laya.stage.width;
            box.height = Laya.stage.height;
            box.zOrder = UIMgr.getNextLayerZOrder(LayerMgr.LAYER_TIPS);
        }
        constructor(txt, isShowBg, callback = null, Y = null) {
            super();
            if (Y) {
                this.img.y = Y;
            }
            if (isShowBg) {
                this.bg.visible = true;
            }
            else {
                this.bg.visible = false;
            }
            this.txt.text = txt;
            this.content.x = Laya.stage.width / 2;
            this.content.y = Laya.stage.height / 2;
            this.on(Laya.Event.CLICK, this, () => {
                this.onClickSpeak(callback);
            });
        }
        onClickSpeak(callback = null) {
            this.removeSelf();
            callback && callback();
        }
    }

    class ClickTips extends Laya.Sprite {
        constructor(pos, isAnim, posList, speed) {
            super();
            console.log("创建手指箭头");
            this.img = new Laya.Image;
            this.img.anchorX = 0.5;
            this.img.anchorY = 0.5;
            this.img.skin = "res/ui/comm/img_click.png";
            this.addChild(this.img);
            this.pos(pos.x, pos.y);
            let animNum = 0;
            if (isAnim) {
                for (let i = 0; i < posList.length; i++) {
                    Laya.timer.once(i * speed, this, () => {
                        Laya.Tween.to(this, { x: posList[i].x, y: posList[i].y }, speed, Laya.Ease.backOut, Laya.Handler.create(this, () => {
                            animNum++;
                            if (animNum == posList.length) {
                                Laya.timer.loop((posList.length * speed) + 650, this, () => {
                                    for (let i = 0; i < posList.length; i++) {
                                        Laya.timer.once(i * speed, this, () => {
                                            Laya.Tween.to(this, { x: posList[i].x, y: posList[i].y }, speed, Laya.Ease.backOut);
                                        });
                                    }
                                });
                            }
                        }));
                    });
                }
            }
        }
        static show(pos, isAnim, posList, speed = 800) {
            return new ClickTips(pos, isAnim, posList, speed);
        }
        remove() {
            this.destroy(true);
        }
    }

    class SpecialRemoveGame extends Laya.Sprite {
        constructor(view) {
            super();
            this.itemW = 79;
            this.itemH = 79;
            this.paceX = 6;
            this.paceY = 6;
            this.dataArr = [];
            this.pMouse = new Laya.Point();
            this.pTemp = new Laya.Point();
            this.removeArr = [];
            this.isAnimation = false;
            this.newDataArr = [];
            this.newItemArr = [];
            this.isAutoMatic = false;
            this.isRemove = false;
            this.itemPos = [];
            this.isClick = false;
            this.clickTip7 = false;
            this.width = (this.itemW + 2 * this.paceX) * 5;
            this.height = (this.itemH + 2 * this.paceY) * 7;
            this.init();
        }
        init() {
            this.root = new Laya.Sprite();
            this.addChild(this.root);
            this.itemRoot = new Laya.Sprite();
            this.root.addChild(this.itemRoot);
            this.addEvent();
        }
        startGame(lv) {
            this.lv = lv;
            if (UserModel.getInstance().lastLevel == 1 && !UserModel.getInstance().firstLvTip) {
                Game.fightGame.fightData.roundNum = 4;
                this.showNoviceTips();
            }
            GameDispatcher.getInstance().on(EventName.GAME_FIRST_TIPS2, this, this.showNoviceTips2);
            SpecialEliminateAlgorithm.getInstance().generateDataArr(this.lv, true);
            SpecialEliminateAlgorithm.getInstance().generateObstacle(UserModel.getInstance().lastLevel);
            this.dataArr = SpecialEliminateAlgorithm.getInstance().getDataArr();
            UserModel.getInstance().spDataArr = this.dataArr.concat([]);
            this.clearPanel();
            this.initPanel();
        }
        clearPanel() {
            if (this.itemArr) {
                for (let i = 0; i <= 6; i++) {
                    for (let j = 0; j <= 4; j++) {
                        if (this.dataArr[i][j] > 0) {
                            let item = this.itemArr[i][j];
                            item && item.recover();
                        }
                    }
                }
            }
            this.itemArr = [];
        }
        initPanel() {
            for (let i = 0; i <= 6; i++) {
                let arr = [];
                let item;
                for (let j = 0; j <= 4; j++) {
                    let id = this.dataArr[i][j];
                    if (id > 0) {
                        item = StarItem.createStarItem();
                        item.setId(id);
                        this.itemRoot.addChild(item);
                        let x = this.getItemPositionX(j);
                        let y = this.getItemPositionY(i);
                        item.pos(x, y);
                        arr.push(item);
                    }
                    else {
                        arr.push(null);
                    }
                }
                this.itemArr.push(arr);
            }
        }
        getItemPositionX(index) {
            return index * (this.itemW + 2 * this.paceX);
        }
        getItemPositionY(index) {
            return index * (this.itemH + 2 * this.paceY);
        }
        addEvent() {
            this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        onMouseDown(event) {
            if (this.isAnimation) {
                console.log("等待动画!");
                return;
            }
            this.downPos = new Laya.Point(event.stageX, event.stageY);
            this.pMouse.setTo(Laya.MouseManager.instance.mouseX, Laya.MouseManager.instance.mouseY);
            this.pTemp = this.globalToLocal(this.pMouse);
            this.itemPos[0] = Math.floor(this.pTemp.y / (this.itemW + 2 * this.paceX));
            this.itemPos[1] = Math.floor(this.pTemp.x / (this.itemH + 2 * this.paceY));
            console.log(this.itemPos[0], this.itemPos[1]);
            this.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            let lastLevel = UserModel.getInstance().lastLevel;
            let firstLvTip = UserModel.getInstance().firstLvTip;
            if (!this.isClick && lastLevel == 1 && !firstLvTip) {
                this.on(Laya.Event.MOUSE_MOVE, this, this.firstLvTips);
            }
            this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp2);
            this.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp2);
        }
        showNoviceTips() {
            SpeakMsg.show("把3枚同色的宝石连成一排，就可以对敌人发动攻击了哦。");
            let pos1 = new Laya.Point(375, 250);
            let pos2 = new Laya.Point(375, 350);
            this.tipClick = ClickTips.show(pos1, true, [pos1, pos2]);
            this.addChild(this.tipClick);
        }
        firstLvTips(event) {
            let item1 = this.itemPos[0] == 2 && this.itemPos[1] == 3;
            let item2 = this.itemPos[0] == 3 && this.itemPos[1] == 3;
            let movePos = new Laya.Point(event.stageX, event.stageY);
            if (item1 && (movePos.y - this.downPos.y) > 50 && this.dataArr[this.itemPos[0] + 1][this.itemPos[1]] !== null) {
                console.log("OK!,从上往下拖动");
                this.clickOK();
                return;
            }
            else if (item2 && (movePos.y - this.downPos.y) < -50 && this.dataArr[this.itemPos[0] - 1][this.itemPos[1]] !== null) {
                console.log("OK!,从下往上拖动");
                this.clickOK();
                return;
            }
        }
        clickOK() {
            this.isClick = true;
            this.off(Laya.Event.MOUSE_MOVE, this, this.firstLvTips);
            this.mouseEnabled = false;
            GameDispatcher.getInstance().event(EventName.GAME_FIRST_TIPS);
        }
        showNoviceTips2() {
            this.mouseEnabled = true;
            let pos1 = new Laya.Point(180, 530);
            let pos2 = new Laya.Point(180, 630);
            this.tipClick = ClickTips.show(pos1, true, [pos1, pos2]);
            this.addChild(this.tipClick);
        }
        showNoviceTips3() {
            SpeakMsg.show("每一次触发的消除越多，造成的伤害越多。", true, () => {
                this.showNoviceTips4();
            });
        }
        showNoviceTips4() {
            SpeakMsg.show("第二课：消除宝石还可以为对应颜色的英雄积攒能量。", true, () => {
                this.showNoviceTips5();
            });
            this.mouseEnabled = true;
        }
        showNoviceTips5() {
            console.log("提示6");
            SpeakMsg.show("再消除一排紫色宝石，看看会发生什么。", true, () => {
                this.dataArr[6][0] = 3;
                this.dataArr[6][1] = 3;
                this.dataArr[6][2] = 1;
                this.dataArr[6][3] = 3;
                this.itemArr[6][0].changeColor(3);
                this.itemArr[6][1].changeColor(3);
                this.itemArr[6][2].changeColor(1);
                this.itemArr[6][3].changeColor(3);
                let pos1 = new Laya.Point(350, 630);
                let pos2 = new Laya.Point(280, 630);
                this.tipClick = ClickTips.show(pos1, true, [pos1, pos2]);
                this.addChild(this.tipClick);
            });
            this.mouseEnabled = true;
        }
        onMouseMove(event) {
            if (this.isAnimation) {
                return;
            }
            if (this.tipClick) {
                this.tipClick.remove();
            }
            this.isRemove = false;
            this.targetItem = null;
            this.targetData = null;
            this.isAutoMatic = false;
            let movePos = new Laya.Point(event.stageX, event.stageY);
            this.selfItem = this.itemArr[this.itemPos[0]][this.itemPos[1]];
            this.selfData = this.dataArr[this.itemPos[0]][this.itemPos[1]];
            let selfX = this.selfItem.x;
            let selfY = this.selfItem.y;
            let moveX = (this.itemW + 2 * this.paceX);
            let moveY = (this.itemH + 2 * this.paceY);
            if (this.selfData > 9) {
                return;
            }
            if (Game.fightGame.fightData.roundNum == 2) {
                this.clickTip7 = true;
            }
            if ((movePos.x - this.downPos.x) > 50 && this.dataArr[this.itemPos[0]][this.itemPos[1] + 1] !== null) {
                this.targetItem = this.itemArr[this.itemPos[0]][this.itemPos[1] + 1];
                this.targetData = this.dataArr[this.itemPos[0]][this.itemPos[1] + 1];
                if (this.targetData > 9) {
                    return;
                }
                this.dir = "右";
                Laya.Tween.to(this.selfItem, { x: selfX + moveX, y: selfY }, 100);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 100);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.targetItem;
                this.itemArr[this.itemPos[0]][this.itemPos[1] + 1] = this.selfItem;
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = this.targetData;
                this.dataArr[this.itemPos[0]][this.itemPos[1] + 1] = this.selfData;
                if (this.selfData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1] + 1] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1] + 1].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1] + 1] = null;
                }
                else if (this.targetData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1]] = null;
                }
                this.onMouseUp();
            }
            else if ((movePos.x - this.downPos.x) < -50 && this.dataArr[this.itemPos[0]][this.itemPos[1] - 1] !== null) {
                this.targetItem = this.itemArr[this.itemPos[0]][this.itemPos[1] - 1];
                this.targetData = this.dataArr[this.itemPos[0]][this.itemPos[1] - 1];
                if (this.targetData > 9) {
                    return;
                }
                this.dir = "左";
                Laya.Tween.to(this.selfItem, { x: selfX - moveX, y: selfY }, 100);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 100);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.targetItem;
                this.itemArr[this.itemPos[0]][this.itemPos[1] - 1] = this.selfItem;
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = this.targetData;
                this.dataArr[this.itemPos[0]][this.itemPos[1] - 1] = this.selfData;
                if (this.selfData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1] - 1] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1] - 1].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1] - 1] = null;
                }
                else if (this.targetData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1]] = null;
                }
                this.onMouseUp();
            }
            else if ((movePos.y - this.downPos.y) > 50 && this.dataArr[this.itemPos[0] + 1][this.itemPos[1]] !== null) {
                this.targetItem = this.itemArr[this.itemPos[0] + 1][this.itemPos[1]];
                this.targetData = this.dataArr[this.itemPos[0] + 1][this.itemPos[1]];
                if (this.targetData > 9) {
                    return;
                }
                this.dir = "下";
                Laya.Tween.to(this.selfItem, { x: selfX, y: selfY + moveY }, 100);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 100);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.targetItem;
                this.itemArr[this.itemPos[0] + 1][this.itemPos[1]] = this.selfItem;
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = this.targetData;
                this.dataArr[this.itemPos[0] + 1][this.itemPos[1]] = this.selfData;
                if (this.selfData == 5) {
                    this.dataArr[this.itemPos[0] + 1][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0] + 1][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0] + 1][this.itemPos[1]] = null;
                }
                else if (this.targetData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1]] = null;
                }
                this.onMouseUp();
            }
            else if ((movePos.y - this.downPos.y) < -50 && this.dataArr[this.itemPos[0] - 1][this.itemPos[1]] !== null) {
                this.targetItem = this.itemArr[this.itemPos[0] - 1][this.itemPos[1]];
                this.targetData = this.dataArr[this.itemPos[0] - 1][this.itemPos[1]];
                if (this.targetData > 9) {
                    return;
                }
                this.dir = "上";
                Laya.Tween.to(this.selfItem, { x: selfX, y: selfY - moveY }, 100);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 100);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.targetItem;
                this.itemArr[this.itemPos[0] - 1][this.itemPos[1]] = this.selfItem;
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = this.targetData;
                this.dataArr[this.itemPos[0] - 1][this.itemPos[1]] = this.selfData;
                if (this.selfData == 5) {
                    this.dataArr[this.itemPos[0] - 1][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0] - 1][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0] - 1][this.itemPos[1]] = null;
                }
                else if (this.targetData == 5) {
                    this.dataArr[this.itemPos[0]][this.itemPos[1]] = null;
                    this.itemArr[this.itemPos[0]][this.itemPos[1]].recover();
                    this.itemArr[this.itemPos[0]][this.itemPos[1]] = null;
                }
                this.onMouseUp();
            }
        }
        onMouseUp() {
            this.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            if (this.isAnimation) {
                return;
            }
            this.isAnimation = true;
            this.removeArr = [];
            let allObsArr = [];
            Laya.timer.once(120, this, () => {
                for (let i = 0; i < this.dataArr.length; i++) {
                    for (let j = 0; j < this.dataArr[i].length; j++) {
                        UserModel.getInstance().spDataArr = this.dataArr.concat([]);
                        SpecialEliminateAlgorithm.getInstance().clickItem(i, j);
                        let getAllArr = SpecialEliminateAlgorithm.getInstance().getClearArr();
                        this.removeArr.push(getAllArr[0]);
                        let obsArr = getAllArr[1];
                        if (allObsArr.length !== 0) {
                            for (const key in allObsArr) {
                                for (let i = 0; i < obsArr.length; i++) {
                                    if (allObsArr[key] === obsArr[i]) {
                                        obsArr.splice(i, 1);
                                    }
                                }
                            }
                        }
                        allObsArr = allObsArr.concat(obsArr);
                    }
                }
                SpecialEliminateAlgorithm.getInstance().getItemColorNum(this.itemArr, this.removeArr);
                let fourInOneIndexArr = [];
                let fourInOneColorArr = [];
                let fractionArr = [];
                let fiveInOneIndexArr = [];
                let fiveInOneColorArr = [];
                let getclearArr = [];
                let bosDelArr = [];
                let fivecolorList = [];
                if (this.targetData == 5 || this.selfData == 5) {
                    let delNum;
                    this.targetData == 5 ? delNum = this.selfData : delNum = this.targetData;
                    for (let i = 0; i < this.dataArr.length; i++) {
                        for (let j = 0; j < this.dataArr[i].length; j++) {
                            if (this.dataArr[i][j] === delNum) {
                                bosDelArr = bosDelArr.concat(this.bosDelItem(i, j));
                                if (this.itemArr[i][j].FourInOneState) {
                                    fractionArr.push([this.dataArr[i][j], 40]);
                                    getclearArr.push([this.dataArr[i][j], 2]);
                                }
                                else {
                                    fractionArr.push([this.dataArr[i][j], 30]);
                                    getclearArr.push([this.dataArr[i][j], 1]);
                                }
                                fivecolorList.push({ color: this.dataArr[i][j], isBig: this.itemArr[i][j].FourInOneState });
                                this.shootParticle(this.dataArr[i][j], SpecialEliminateAlgorithm.getInstance().getIndex(i, j), this.itemArr[i][j].FourInOneState);
                                this.dataArr[i][j] = null;
                                this.itemArr[i][j].recover();
                                this.itemArr[i][j] = null;
                            }
                        }
                    }
                    let selfArr = Game.fightGame.fightData.selfArr;
                    let addHero = [];
                    for (let i = 0; i < fivecolorList.length; i++) {
                        if (fivecolorList[i].isBig) {
                            for (let j = 0; j < selfArr.length; j++) {
                                if (selfArr[j].cfg.type == fivecolorList[i].color && !selfArr[j].isDie) {
                                    Game.fightGame.fightData.starSkillHeroList.push(selfArr[j]);
                                }
                            }
                        }
                    }
                    for (let i = 0; i < fivecolorList.length; i++) {
                        for (let j = 0; j < selfArr.length; j++) {
                            if (selfArr[j].cfg.type == fivecolorList[i].color && !selfArr[j].isDie) {
                                let find = addHero.find(num => num === selfArr[j].cfg.id);
                                if (!find) {
                                    Game.fightGame.fightData.attackHeroList.push(selfArr[j]);
                                    console.log("5合1消除，添加英雄成功");
                                }
                                else {
                                    console.log("5合1消除，添加英雄失败，当前英雄已在列表中");
                                }
                                addHero.push(selfArr[j].cfg.id);
                            }
                        }
                    }
                    SpecialEliminateAlgorithm.getInstance().getItemColorNumFive(getclearArr);
                }
                for (let i = 0; i < bosDelArr.length; i++) {
                    let find = allObsArr.find(index => index === bosDelArr[i]);
                    if (find == undefined) {
                        allObsArr.push(bosDelArr[i]);
                    }
                }
                if (allObsArr.length !== 0) {
                    for (let i = 0; i < allObsArr.length; i++) {
                        let obsX = SpecialEliminateAlgorithm.getInstance().getX(allObsArr[i]);
                        let obsY = SpecialEliminateAlgorithm.getInstance().getY(allObsArr[i]);
                        if (this.dataArr[obsY][obsX] >= 10) {
                            this.dataArr[obsY][obsX] -= 1;
                            this.itemArr[obsY][obsX].modeifyState(this.dataArr[obsY][obsX]);
                            if (this.itemArr[obsY][obsX].id <= 10) {
                                this.dataArr[obsY][obsX] = null;
                                this.removeArr.push([allObsArr[i]]);
                            }
                        }
                    }
                }
                let colorList = [];
                for (let n = 0; n < this.removeArr.length; n++) {
                    for (let j = 0; j < this.removeArr[n].length; j++) {
                        let dataX = SpecialEliminateAlgorithm.getInstance().getX(this.removeArr[n][j]);
                        let dataY = SpecialEliminateAlgorithm.getInstance().getY(this.removeArr[n][j]);
                        if (this.removeArr[n].length === 4 && j == 1 && this.dataArr[dataY][dataX] !== null) {
                            fourInOneIndexArr.push(this.removeArr[n][j]);
                            fourInOneColorArr.push(this.dataArr[dataY][dataX]);
                            console.log("push==>", this.dataArr[dataY][dataX], "数组==>", fourInOneColorArr);
                        }
                        if (this.removeArr[n].length >= 5 && j == 1) {
                            fiveInOneIndexArr.push(this.removeArr[n][j]);
                            fiveInOneColorArr.push(this.dataArr[dataY][dataX]);
                        }
                        if (this.dataArr[dataY][dataX] !== null) {
                            if (Game.fightGame.fightData.roundNum == 2 && this.clickTip7) {
                                this.clickTip7 = false;
                                SpeakMsg.show("看，加恩的能量攒满了，点击头像，让他施放强大的主动技能吧！", false, () => {
                                    let avatar = HeroAvatar.getInstance().avatarDataList;
                                    for (let i = 0; i < avatar.length; i++) {
                                        HeroAvatar.getInstance().avatarDataList[i].mouseEnabled = true;
                                        if (avatar[i].cfg.id == 6) {
                                            avatar[i].addPowerMax();
                                            GameDispatcher.getInstance().event(EventName.GAME_TIPS_USE_SKILL, [avatar[i]]);
                                        }
                                    }
                                }, 0);
                            }
                            if (this.itemArr[dataY][dataX].FourInOneState) {
                                fractionArr.push([this.dataArr[dataY][dataX], 50]);
                            }
                            else {
                                fractionArr.push([this.dataArr[dataY][dataX], 30]);
                            }
                        }
                        if (this.itemArr[dataY][dataX]) {
                            this.isRemove = true;
                            this.shootParticle(this.dataArr[dataY][dataX], this.removeArr[n][j], this.itemArr[dataY][dataX].FourInOneState);
                            colorList.push({ color: this.dataArr[dataY][dataX], isBig: this.itemArr[dataY][dataX].FourInOneState });
                            this.itemArr[dataY][dataX].recover();
                        }
                        this.dataArr[dataY][dataX] = null;
                        this.itemArr[dataY][dataX] = null;
                    }
                }
                let selfArr = Game.fightGame.fightData.selfArr;
                let addHero = [];
                for (let i = 0; i < colorList.length; i++) {
                    if (colorList[i].isBig) {
                        for (let j = 0; j < selfArr.length; j++) {
                            if (selfArr[j].cfg.type == colorList[i].color && !selfArr[j].isDie) {
                                Game.fightGame.fightData.starSkillHeroList.push(selfArr[j]);
                            }
                        }
                    }
                }
                for (let i = 0; i < colorList.length; i++) {
                    for (let j = 0; j < selfArr.length; j++) {
                        if (selfArr[j].cfg.type == colorList[i].color && !selfArr[j].isDie) {
                            let find = addHero.find(num => num === selfArr[j].cfg.id);
                            if (!find) {
                                Game.fightGame.fightData.attackHeroList.push(selfArr[j]);
                                console.log("添加英雄成功");
                            }
                            else {
                                console.log("添加英雄失败，当前英雄已在列表中");
                            }
                            addHero.push(selfArr[j].cfg.id);
                        }
                    }
                }
                console.log("isAttack==>", Game.fightGame.fightData.isAttack, ",false为可以攻击,attackHeroList.length==>", Game.fightGame.fightData.attackHeroList.length);
                if (!Game.fightGame.fightData.isAttack && Game.fightGame.fightData.attackHeroList.length !== 0) {
                    Game.fightManager.heroAttack1();
                    Game.fightGame.fightData.isAttack = true;
                }
                this.targetData = null;
                this.selfData = null;
                if (fractionArr.length !== 0) {
                    HeroAvatar.getInstance().setFractionArr(fractionArr);
                }
                for (let i = 0; i < fourInOneIndexArr.length; i++) {
                    let dataX = SpecialEliminateAlgorithm.getInstance().getX(fourInOneIndexArr[i]);
                    let dataY = SpecialEliminateAlgorithm.getInstance().getY(fourInOneIndexArr[i]);
                    let item;
                    item = StarItem.createStarItem();
                    let X = this.getItemPositionX(dataX);
                    let Y = this.getItemPositionY(dataY);
                    item.id = fourInOneColorArr[i];
                    this.dataArr[dataY][dataX] = fourInOneColorArr[i];
                    console.log("颜色==>", fourInOneColorArr);
                    this.itemArr[dataY][dataX] = item;
                    this.itemArr[dataY][dataX].FourInOne();
                    this.itemRoot.addChild(item);
                    item.pos(X, Y);
                }
                for (let i = 0; i < fiveInOneIndexArr.length; i++) {
                    let dataX = SpecialEliminateAlgorithm.getInstance().getX(fiveInOneIndexArr[i]);
                    let dataY = SpecialEliminateAlgorithm.getInstance().getY(fiveInOneIndexArr[i]);
                    let item;
                    item = StarItem.createStarItem();
                    let X = this.getItemPositionX(dataX);
                    let Y = this.getItemPositionY(dataY);
                    item.pos(X, Y);
                    item.id = fiveInOneColorArr[i];
                    this.itemRoot.addChild(item);
                    this.dataArr[dataY][dataX] = 5;
                    this.itemArr[dataY][dataX] = item;
                    this.itemArr[dataY][dataX].fiveInOne();
                }
                UserModel.getInstance().spDataArr = this.dataArr.concat([]);
                this.itemDown();
            });
        }
        bosDelItem(Y, X) {
            let delArr = [];
            if (X - 1 >= 0) {
                if (this.dataArr[Y][X - 1] > 9) {
                    delArr.push(SpecialEliminateAlgorithm.getInstance().getIndex(Y, X - 1));
                }
            }
            if (X + 1 <= 6) {
                if (this.dataArr[Y][X + 1] > 9) {
                    delArr.push(SpecialEliminateAlgorithm.getInstance().getIndex(Y, X + 1));
                }
            }
            if (Y - 1 >= 0) {
                if (this.dataArr[Y - 1][X] > 9) {
                    delArr.push(SpecialEliminateAlgorithm.getInstance().getIndex(Y - 1, X));
                }
            }
            if (Y + 1 <= 4) {
                if (this.dataArr[Y + 1][X] > 9) {
                    delArr.push(SpecialEliminateAlgorithm.getInstance().getIndex(Y + 1, X));
                }
            }
            return delArr;
        }
        shootParticle(color, index, isBig) {
            if (!color || !index) {
                return;
            }
            let isFly = Game.fightGame.fightData.isShowStar(color);
            let X = SpecialEliminateAlgorithm.getInstance().getX(index);
            let Y = SpecialEliminateAlgorithm.getInstance().getY(index);
            let point = new Laya.Point(this.itemArr[Y][X].x, this.itemArr[Y][X].y);
            let fxStar = new FxStar(color);
            this.itemRoot.addChild(fxStar);
            fxStar.shoot();
            fxStar.pos(point.x, point.y);
            Laya.timer.once(2000, this, function () {
                fxStar.destroy();
            });
            let selfArr = Game.fightGame.fightData.selfArr;
            let attackList = [];
            for (let i = 0; i < selfArr.length; i++) {
                let type = selfArr[i].cfg.type;
                if (type == color) {
                    attackList.push(selfArr[i]);
                    let heroPos = new Laya.Point(selfArr[i].x, selfArr[i].y - 100);
                    let parentImg2 = this.parent.parent.parent.parent;
                    let star = Star$1.CreateStar();
                    parentImg2.addChild(star);
                    let pos2 = this.itemRoot.localToGlobal(point);
                    let pos3 = parentImg2.globalToLocal(pos2);
                    let randomCount = RandomUtil.randomInt(200, 700);
                    if (isFly) {
                        star.posMoveToPos(color, pos3.x, pos3.y, heroPos.x, heroPos.y, isBig, randomCount);
                    }
                    else {
                        star.recover();
                    }
                }
            }
        }
        onMouseUp2() {
            this.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp2);
            this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            this.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp2);
            console.log(this.dataArr);
        }
        itemDown() {
            for (let i = this.dataArr.length - 1; i >= 0; i--) {
                for (let j = 0; j < this.dataArr[i].length; j++) {
                    if (this.dataArr[i][j] === null) {
                        for (let x = i; x >= 0; x--) {
                            if (this.dataArr[x][j] > 9) {
                                break;
                            }
                            if (this.dataArr[x][j] !== null) {
                                this.dataArr[i][j] = this.dataArr[x][j];
                                this.itemArr[i][j] = this.itemArr[x][j];
                                this.dataArr[x][j] = null;
                                this.itemArr[x][j] = null;
                                Laya.Tween.to(this.itemArr[i][j], { x: j * (this.itemW + 2 * this.paceX), y: i * (this.itemH + 2 * this.paceY) }, 200);
                                break;
                            }
                        }
                    }
                }
            }
            Laya.timer.once(200, this, this.itemDownSide);
        }
        itemDownSide() {
            let isOK = true;
            for (let i = 0; i < this.dataArr.length; i++) {
                for (let j = 0; j < this.dataArr[i].length; j++) {
                    if (i == this.dataArr.length - 1 || this.dataArr[i][j] > 9 || this.itemArr[i][j] === null) {
                        continue;
                    }
                    let selfItem = this.itemArr[i][j];
                    let moveX = this.itemW + 2 * this.paceX;
                    let moveY = this.itemH + 2 * this.paceY;
                    if (this.dataArr[i + 1][j - 1] === null && j > 0 && this.dataArr[i][j - 1] > 9) {
                        isOK = false;
                        this.dataArr[i + 1][j - 1] = this.dataArr[i][j];
                        this.itemArr[i + 1][j - 1] = selfItem;
                        Laya.Tween.to(this.itemArr[i + 1][j - 1], { x: selfItem.x - moveX, y: selfItem.y + moveY }, 50, null, Laya.Handler.create(this, () => {
                            this.dataArr[i][j] = null;
                            this.itemArr[i][j] = null;
                            this.itemDown();
                        }));
                        return;
                    }
                    else if (this.dataArr[i + 1][j + 1] === null && j < this.dataArr[i].length - 1 && this.dataArr[i][j + 1] > 9) {
                        isOK = false;
                        let newNumTest = 0;
                        newNumTest += this.dataArr[i][j];
                        this.dataArr[i + 1][j + 1] = newNumTest;
                        this.itemArr[i + 1][j + 1] = selfItem;
                        Laya.Tween.to(this.itemArr[i + 1][j + 1], { x: selfItem.x + moveX, y: selfItem.y + moveY }, 50, null, Laya.Handler.create(this, () => {
                            this.dataArr[i][j] = null;
                            this.itemArr[i][j] = null;
                            this.itemDown();
                        }));
                        return;
                    }
                }
            }
            if (!isOK) {
                this.itemDown();
            }
            else {
                this.AddPanel();
            }
        }
        AddPanel() {
            let isNull = true;
            for (let i = 0; i < this.dataArr.length; i++) {
                for (let j = 0; j < this.dataArr[i].length; j++) {
                    if (this.dataArr[i][j] == null) {
                        isNull = false;
                    }
                }
            }
            if (isNull) {
                if (!Game.fightGame.fightData.gameover && this.isRemove) {
                    if (Game.fightGame.fightData.roundNum > 0) {
                        Game.fightGame.fightData.roundNum--;
                        if (Game.fightGame.fightData.roundNum == 2) {
                            this.showNoviceTips3();
                        }
                    }
                    else {
                        console.log("回合结束1");
                        Game.fightManager.isEnd(1);
                    }
                }
                this.isAnimation = false;
                console.log("返回原位1");
                this.revokeItem();
                return;
            }
            this.newItemArr = [];
            this.newDataArr = [];
            SpecialEliminateAlgorithm.getInstance().generateDataArr(this.lv, false);
            this.newDataArr = SpecialEliminateAlgorithm.getInstance().getNewDataArr();
            for (let i = 0; i <= 6; i++) {
                let arr = [];
                let item;
                for (let j = 0; j <= 4; j++) {
                    let id = this.newDataArr[i][j];
                    if (id > 0) {
                        item = StarItem.createStarItem();
                        item.setId(id);
                        this.itemRoot.addChild(item);
                        let x = this.getItemPositionX(j);
                        let y = this.getItemPositionY(i);
                        item.pos(x, y);
                        arr.push(item);
                    }
                    else {
                        arr.push(null);
                    }
                }
                this.newItemArr.push(arr);
            }
            let itemCount = 0;
            for (let i = 0; i < this.newDataArr.length; i++) {
                for (let j = 0; j < this.newDataArr[i].length; j++) {
                    if (this.dataArr[i][j] == null) {
                        let haveSpeciItem = false;
                        for (let n = i; n >= 0; n--) {
                            if (this.dataArr[n][j] > 9) {
                                haveSpeciItem = true;
                            }
                        }
                        if (haveSpeciItem) {
                            itemCount++;
                            this.itemRoot.removeChild(this.newItemArr[i][j]);
                            this.newItemArr[i][j].recover();
                            if (itemCount === 35) {
                                Laya.timer.once(200, this, () => {
                                    this.isAnimation = false;
                                });
                                console.log("返回原位2");
                                this.revokeItem();
                            }
                            continue;
                        }
                        this.itemArr[i][j] = this.newItemArr[i][j];
                        this.newItemArr[i][j] = null;
                        this.dataArr[i][j] = this.newDataArr[i][j];
                        this.newDataArr[i][j] = null;
                        Laya.Tween.from(this.itemArr[i][j], { y: this.itemArr[i][j].y - 500 }, 200, Laya.Ease.cubicInOut, Laya.Handler.create(this, this.clearNewPanel));
                    }
                    else {
                        itemCount++;
                        this.newItemArr[i][j].visible = false;
                        if (itemCount === 35) {
                            if (!Game.fightGame.fightData.gameover && this.isRemove) {
                                if (Game.fightGame.fightData.roundNum > 0) {
                                    Game.fightGame.fightData.roundNum--;
                                    if (Game.fightGame.fightData.roundNum == 2) {
                                        this.showNoviceTips3();
                                    }
                                }
                                else {
                                    console.log("回合结束2");
                                    Game.fightManager.isEnd(1);
                                }
                            }
                            Laya.timer.once(200, this, () => {
                                this.isAnimation = false;
                            });
                            console.log("返回原位3");
                            this.revokeItem();
                            return;
                        }
                    }
                }
            }
            if (itemCount !== 35) {
                this.isAutoMatic = true;
                Laya.timer.once(200, this, () => {
                    UserModel.getInstance().spDataArr = this.dataArr.concat([]);
                    this.onMouseUp();
                });
            }
            SpecialEliminateAlgorithm.getInstance().ClearUsedList();
        }
        revokeItem() {
            if (this.isAutoMatic) {
                return;
            }
            this.isAnimation = true;
            let selfX = this.selfItem.x;
            let selfY = this.selfItem.y;
            let moveX = (this.itemW + 2 * this.paceX);
            let moveY = (this.itemH + 2 * this.paceY);
            if (this.dir === "左") {
                Laya.Tween.to(this.selfItem, { x: selfX + moveX, y: selfY }, 50);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 50);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.selfItem;
                this.itemArr[this.itemPos[0]][this.itemPos[1] - 1] = this.targetItem;
                let num1 = this.dataArr[this.itemPos[0]][this.itemPos[1]];
                let num2 = this.dataArr[this.itemPos[0]][this.itemPos[1] - 1];
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = num2;
                this.dataArr[this.itemPos[0]][this.itemPos[1] - 1] = num1;
            }
            else if (this.dir === "右") {
                Laya.Tween.to(this.selfItem, { x: selfX - moveX, y: selfY }, 50);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 50);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.selfItem;
                this.itemArr[this.itemPos[0]][this.itemPos[1] + 1] = this.targetItem;
                let num1 = this.dataArr[this.itemPos[0]][this.itemPos[1]];
                let num2 = this.dataArr[this.itemPos[0]][this.itemPos[1] + 1];
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = num2;
                this.dataArr[this.itemPos[0]][this.itemPos[1] + 1] = num1;
            }
            else if (this.dir === "上") {
                Laya.Tween.to(this.selfItem, { x: selfX, y: selfY + moveY }, 50);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 50);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.selfItem;
                this.itemArr[this.itemPos[0] - 1][this.itemPos[1]] = this.targetItem;
                let num1 = this.dataArr[this.itemPos[0]][this.itemPos[1]];
                let num2 = this.dataArr[this.itemPos[0] - 1][this.itemPos[1]];
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = num2;
                this.dataArr[this.itemPos[0] - 1][this.itemPos[1]] = num1;
            }
            else if (this.dir === "下") {
                Laya.Tween.to(this.selfItem, { x: selfX, y: selfY - moveY }, 50);
                Laya.Tween.to(this.targetItem, { x: selfX, y: selfY }, 50);
                this.itemArr[this.itemPos[0]][this.itemPos[1]] = this.selfItem;
                this.itemArr[this.itemPos[0] + 1][this.itemPos[1]] = this.targetItem;
                let num1 = this.dataArr[this.itemPos[0]][this.itemPos[1]];
                let num2 = this.dataArr[this.itemPos[0] + 1][this.itemPos[1]];
                this.dataArr[this.itemPos[0]][this.itemPos[1]] = num2;
                this.dataArr[this.itemPos[0] + 1][this.itemPos[1]] = num1;
            }
            Laya.timer.once(50, this, () => {
                this.isAnimation = false;
            });
        }
        clearNewPanel() {
            if (this.newItemArr) {
                for (let i = 0; i <= 6; i++) {
                    for (let j = 0; j <= 4; j++) {
                        let item = this.newItemArr[i][j];
                        if (item) {
                            item.visible = false;
                            item.removeSelf();
                            item.destroy();
                        }
                    }
                }
            }
            UserModel.getInstance().spDataArr = this.dataArr.concat([]);
            this.newDataArr = [];
            this.isAnimation = false;
        }
    }

    class MessageBox extends ui.common.MessageBoxUI {
        constructor(tips, txtBtn1 = null, callback1 = null, txtBtn2 = null, callback2 = null, align = "center") {
            super();
            if (txtBtn1 && txtBtn2) {
                this.btn1.x = 242;
                this.txtLeft.x = 242;
                this.btn2.x = 555;
                this.txtRight.x = 555;
            }
            else if (txtBtn1) {
                this.btn1.x = 407;
                this.txtLeft.x = 407;
                this.btn2.visible = false;
                this.txtRight.visible = false;
            }
            else if (txtBtn2) {
                this.btn2.x = 407;
                this.txtRight.x = 407;
                this.btn1.visible = false;
                this.txtLeft.visible = false;
            }
            if (txtBtn1) {
                this.txtLeft.text = txtBtn1;
            }
            if (txtBtn2) {
                this.txtRight.text = txtBtn2;
            }
            if (callback1) {
                this._callback1 = callback1;
            }
            if (callback2) {
                this._callback2 = callback2;
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
            if (tips.length <= 30) {
                this.img.scale(0.8, 0.8);
            }
            if (tips.length >= 90) {
                this.tips.fontSize = 40;
            }
            if (tips.length >= 100) {
                this.tips.fontSize = 30;
            }
            if (tips.length >= 140) {
                this.tips.fontSize = 30;
            }
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

    class ShowDataTxt extends Laya.Sprite {
        constructor() {
            super();
            this.txt = new Laya.Label;
            this.txt.text = ShowDataTxt.txtData;
            this.txt.fontSize = ShowDataTxt.txtFontSize;
            this.txt.color = ShowDataTxt.txtColor;
            this.txt.anchorX = 0.5;
            this.txt.anchorY = 0.5;
            this.txt.centerX = 0;
            this.txt.centerY = 0;
            this.zOrder = 11;
            this.addChild(this.txt);
        }
        static createTxt(txt, color = "绿", fontsize = 50) {
            ShowDataTxt.txtData = txt;
            ShowDataTxt.txtFontSize = fontsize;
            switch (color) {
                case "红":
                    ShowDataTxt.txtColor = "#ff2800";
                    break;
                case "绿":
                    ShowDataTxt.txtColor = "#00ff14";
                    break;
                default:
                    ShowDataTxt.txtColor = "#ff2800";
                    break;
            }
            return new ShowDataTxt();
        }
        floatSet(time = 500, height = 50) {
            Laya.Tween.to(this, { y: this.y - height }, time, null, Laya.Handler.create(this, () => {
                this.recover();
            }));
        }
        recover() {
            this.destroy();
        }
    }

    class CfgSkill extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.describe = data.describe;
            this.illustrate = data.illustrate;
            this.uplv2 = data.uplv2;
            this.uplv3 = data.uplv3;
            this.skilltype = data.skilltype;
            this.img = data.img;
            this.lv2condition = data.lv2condition;
            this.lv3condition = data.lv3condition;
            return this.id;
        }
        configName() {
            return "Skill";
        }
    }

    class SkillManager {
        static getSkillLv(skillId, heroId) {
            let cfgskill = ConfigManager.GetConfigByKey(CfgSkill, skillId);
            let cfghero = ConfigManager.GetConfigByKey(CfgHero, heroId);
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.find(item => item.id === cfghero.id);
            if (hero) {
                let heroStar = hero.star;
                if (cfgskill.lv3condition <= heroStar) {
                    return 3;
                }
                else if (cfgskill.lv2condition <= heroStar) {
                    return 2;
                }
                else {
                    return 1;
                }
            }
        }
        static getSkillLvForStar(skillId, starNum) {
            let cfgskill = ConfigManager.GetConfigByKey(CfgSkill, skillId);
            if (cfgskill.lv3condition <= starNum) {
                return 3;
            }
            else if (cfgskill.lv2condition <= starNum) {
                return 2;
            }
            else {
                return 1;
            }
        }
        static getSkillLvUpStar(skillId) {
            let cfgskill = ConfigManager.GetConfigByKey(CfgSkill, skillId);
            return [cfgskill.lv2condition, cfgskill.lv3condition];
        }
        static async useSkill() {
            for (let i = 0; i < 3; i++) {
                let skill = new SkillAll();
                await skill.skill1001(1);
            }
        }
        static useHeroStarSkill(color) {
            console.log("英雄星纹技能,color==" + color);
            let selfArr = Game.fightGame.fightData.selfArr;
            for (let i = 0; i < selfArr.length; i++) {
                if (selfArr[i].cfg.type == color) {
                    let skillNum = selfArr[i].cfg.useskillarr[1];
                    let skill;
                    skill = new SkillAll();
                    if (!skill[`skill${skillNum}`]) {
                        console.log(selfArr[i].cfg.name + "暂时未拥有星纹技能");
                        return;
                    }
                    skill[`skill${skillNum}`](selfArr[i].cfg.id);
                    console.log(`${selfArr[i].cfg.name}释放星纹技，skill${skillNum}`);
                }
            }
        }
        static useHeroPassiveSkill(id, isHero) {
            let cfg = ConfigManager.GetConfigByKey(CfgHero, id);
        }
    }

    class UICharacter extends ui.view.game.characterUI {
        constructor() {
            super();
            this.maxHp = 100;
            this.blood = 100;
            this.maxMagic = 0;
            this.magic = 0;
            this.isDie = false;
            this.criticalChance = 0;
            this.buffAddition = {
                attack: 0,
                defense: 0,
                maxHp: 0,
                blood: 0,
                criticalChance: 0,
            };
            this.tembuff = {
                attack: 0,
                defense: 0,
                maxHp: 0,
                blood: 0,
                criticalChance: 0,
            };
        }
        getData() {
            SkillManager.useHeroPassiveSkill(this.id, this.isHero);
            let isCrit = this.isCrit();
            let getTembuff = this.getTemBuff();
            let maxHp = this.maxHp + this.buffAddition.maxHp + getTembuff.maxHp;
            let defense = this.defense + this.buffAddition.defense + getTembuff.defense;
            let blood = this.blood + this.buffAddition.blood + getTembuff.blood;
            let criticalChance = this.criticalChance + this.buffAddition.criticalChance + getTembuff.criticalChance;
            let attack;
            if (isCrit) {
                attack = Math.floor((this.attack + this.buffAddition.attack + getTembuff.attack) * 1.5);
            }
            else {
                attack = Math.floor((this.attack + this.buffAddition.attack + getTembuff.attack));
            }
            return {
                maxHp: maxHp,
                defense: defense,
                attack: attack,
                blood: blood,
                criticalChance: criticalChance,
            };
        }
        getTemBuff() {
            let attack = this.tembuff.attack;
            let defense = this.tembuff.defense;
            let maxHp = this.tembuff.maxHp;
            let blood = this.tembuff.blood;
            let criticalChance = this.tembuff.criticalChance;
            this.tembuff = {
                attack: 0,
                defense: 0,
                maxHp: 0,
                blood: 0,
                criticalChance: 0,
            };
            return { attack: attack, defense: defense, maxHp: maxHp, blood: blood, criticalChance: criticalChance };
        }
        isCrit() {
            let criticalChance = this.criticalChance + this.buffAddition.criticalChance + this.getTemBuff().criticalChance;
            if (criticalChance == 0) {
                return false;
            }
            let randomNum = RandomUtil.randomInt(1, 101);
            if (randomNum >= criticalChance) {
                return true;
            }
            return false;
        }
        setData(id, type, lv) {
            let heroList = UserModel.getInstance().heroList;
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.mpMask.width = 1;
            this.showHpView.x = 99;
            this.showHpView.y = 46;
            if (type === 1) {
                this.hpBg.mask = null;
                this.element.y = 18;
                this.select.visible = false;
                this.mp.visible = true;
                this.isHero = true;
                this.id = id;
                this.cfg = ConfigManager.GetConfigByKey(CfgHero, id);
                let hero = heroList.find(item => item.id === this.cfg.id);
                this.maxHp = hero.hp;
                this.defense = hero.defense;
                this.blood = this.maxHp;
                this.unitSk.url = this.cfg.skurl;
                this.unitSk.pos(85.5, 241);
                this.unitSk.scale(0.45, 0.45);
                this.unitSk.load(this.cfg.skurl, Laya.Handler.create(this, () => {
                    Laya.timer.frameOnce(3, this, () => {
                        this.unitSk.play("stand", true);
                    });
                }));
                this.attack = hero.attack;
                this.lv.visible = false;
                switch (this.cfg.type) {
                    case 1:
                        this.element.skin = "res/ui/icon/star1.png";
                        break;
                    case 2:
                        this.element.skin = "res/ui/icon/star2.png";
                        break;
                    case 3:
                        this.element.skin = "res/ui/icon/star3.png";
                        break;
                    case 4:
                        this.element.skin = "res/ui/icon/star4.png";
                        break;
                    default:
                        break;
                }
                this.element.scale(0.45, 0.45);
                this.showHpHeightViewHero();
                this.heroSkPos();
            }
            else if (type === 2) {
                this.hpBg.mask = this.onlyShowHp;
                this.select.visible = true;
                this.mp.visible = false;
                this.isHero = false;
                this.element.y = 13;
                this.lv.y = 14;
                this.cfg = ConfigManager.GetConfigByKey(CfgMonster, id);
                if (!Game.Debug) {
                    this.id = 1000 + Game.fightGame.fightData.otherArr.length + 1;
                }
                let mansterData = UnitManager.nowLvDataMonster(id, lv);
                this.maxHp = mansterData.hp;
                this.blood = this.maxHp;
                this.attack = mansterData.aggress;
                this.defense = mansterData.defense;
                console.log(`${this.cfg.name}，最大生命值=${this.maxHp},攻击力=${this.attack},防御力=${this.defense}`);
                this.lvData = lv;
                this.monsterLv = lv;
                this.lv.visible = true;
                this.lv.text = lv.toString();
                this.element.skin = "res/ui/game/img_lv_bg.png";
                this.element.scale(1, 1);
                this.showHpHeightViewMonster();
                this.unitSk.load(this.cfg.skurl, Laya.Handler.create(this, () => {
                    this.unitSk.url = this.cfg.skurl;
                    this.unitSk.scale(-0.7, 0.7);
                    this.unitSk.pos(76, 214);
                    Laya.timer.frameOnce(3, this, () => {
                        this.unitSk.play("stand", true);
                    });
                }));
            }
            this.anchorX = 0.5;
            this.anchorY = 1;
        }
        showHpHeightViewHero() {
            if (this.cfg.id == 1) {
                this.showHpView.y -= 40;
            }
            else if (this.cfg.id == 2) {
                this.showHpView.y -= 15;
                this.showHpView.x -= 7;
            }
            else if (this.cfg.id == 3) {
                this.showHpView.y -= 25;
            }
            else if (this.cfg.id == 4) {
                this.showHpView.y -= 65;
            }
            else if (this.cfg.id == 5) {
                this.showHpView.y -= 30;
                this.showHpView.x -= 7;
            }
            else if (this.cfg.id == 6) {
                this.showHpView.y -= 20;
                this.showHpView.x -= 7;
            }
            else if (this.cfg.id == 7) {
                this.showHpView.y -= 90;
                this.showHpView.x -= 12;
            }
            else if (this.cfg.id == 8) {
                this.showHpView.y -= 50;
                this.showHpView.x -= 20;
            }
            else if (this.cfg.id == 9) {
                this.showHpView.y -= 50;
                this.showHpView.x -= 20;
            }
        }
        showHpHeightViewMonster() {
            if (this.cfg.id == 9) {
                this.showHpView.y -= 10;
            }
            else if (this.cfg.id == 11) {
                this.showHpView.y -= 75;
            }
            else if (this.cfg.id == 12 || this.cfg.id == 18) {
                this.showHpView.y -= 50;
            }
            else if (this.cfg.id == 14) {
                this.showHpView.y -= 40;
            }
            else if (this.cfg.id == 16) {
                this.showHpView.y -= 15;
            }
            else if (this.cfg.id == 17) {
                this.showHpView.y += 12;
                this.showHpView.x -= 25;
            }
            else if (this.cfg.id == 21) {
                this.showHpView.y += 70;
                this.showHpView.x -= 7;
            }
            else if (this.cfg.id == 10001) {
                this.showHpView.y -= 200;
                this.showHpView.x -= 15;
            }
            else if (this.cfg.id == 10002 || this.cfg.id == 10006) {
                this.showHpView.y -= 100;
                this.showHpView.x -= 180;
            }
            else if (this.cfg.id == 10003) {
                this.showHpView.y -= 120;
            }
            else if (this.cfg.id == 10004) {
                this.showHpView.y -= 90;
                this.showHpView.x -= 50;
            }
            else if (this.cfg.id == 10005) {
                this.showHpView.y -= 200;
                this.showHpView.x -= 40;
            }
        }
        heroSkPos() {
            switch (this.id) {
                case 1:
                    this.unitSk.x += 15;
                    break;
                case 2:
                    this.unitSk.x += 15;
                    break;
                case 3:
                    this.unitSk.x += 7;
                    break;
                case 4:
                    this.unitSk.x += 15;
                    this.unitSk.y -= 15;
                    break;
                case 5:
                    this.unitSk.x += 15;
                    this.unitSk.y -= 15;
                    break;
                case 6:
                    this.unitSk.x += 18;
                    this.unitSk.y -= 7;
                    break;
                case 7:
                    this.unitSk.x += 18;
                    break;
                case 8:
                    this.unitSk.x += 12;
                    this.unitSk.y -= 7;
                    break;
                case 9:
                    this.unitSk.x += 15;
                    this.unitSk.y -= 10;
                    break;
                default:
                    break;
            }
        }
        bloodCount(num) {
            if (!this.isDie) {
                let floatTxt;
                let count = 1 - (Math.round(((this.getData().defense * 0.06) / (1 + (0.06 * this.getData().defense))) * 1000) / 1000);
                let result = Math.floor(num * count);
                let fatherNode = this.parent;
                if (!fatherNode) {
                    return;
                }
                this.blood += Math.ceil(result);
                if (this.blood > this.maxHp) {
                    this.blood = this.maxHp;
                }
                if (result <= 0) {
                    floatTxt = ShowDataTxt.createTxt(result.toString(), "绿");
                    let effect;
                    if (this.isHero) {
                        effect = FixedEffect.createEffect("res/game/skattack/hit1.sk");
                    }
                    else {
                        effect = FixedEffect.createEffect("res/game/skattack/mon_hit1.sk");
                    }
                    effect.sk.load(effect.sk.url, Laya.Handler.create(this, () => {
                        fatherNode.addChild(effect);
                        effect.pos(this.x, this.y - 20);
                        effect.playAnimOnce();
                    }));
                    this.unitSk.offAll();
                    this.unitSk.play("hit", false);
                    if (this.blood <= 0) {
                        this.isDie = true;
                        Game.fightGame.switchSelectMonster();
                        Game.endLessFightGame.switchSelectMonster();
                        console.log(this.cfg.name + "死亡");
                        this.unitSk.on(Laya.Event.STOPPED, this, () => {
                            GameDispatcher.getInstance().event(EventName.GAME_HERO_DIE, this.id);
                            console.log(this.cfg.name + "播放死亡动画");
                            this.unitSk.play("death", false, true);
                            this.unitSk.offAll();
                            this.unitSk.on(Laya.Event.STOPPED, this, () => {
                                console.log(this.cfg.name + "死亡动画播放完毕");
                                this.visible = false;
                                Game.fightManager.onWin();
                                Game.fightManager.onFail();
                            });
                        });
                    }
                    else {
                        this.unitSk.on(Laya.Event.STOPPED, this, () => {
                            this.unitSk.play("stand", true);
                        });
                    }
                }
                else {
                    floatTxt = ShowDataTxt.createTxt("+" + result, "绿");
                }
                fatherNode.addChild(floatTxt);
                floatTxt.pos(this.x, this.y);
                floatTxt.floatSet();
                this.blood < 0 ? this.hpMask.width = 1 : this.hpMask.width = (this.blood / this.maxHp) * this.hp.width;
            }
        }
        setPos(x, y) {
            this.initPos = new Laya.Point(x, y);
            this.pos(x, y);
        }
    }

    class UIFightGame extends ui.view.game.FightGameUI {
        constructor() {
            super(...arguments);
            this.characterPosSelf = [
                [[20, 249]],
                [[32, 118], [32, 399]],
                [[14, 84], [77, 238], [14, 401]],
                [[319, 582], [107.5, 597], [307.5, 401], [89.5, 383.5]]
            ];
            this.characterPosOther = [
                [[654, 500]],
                [[716, 630], [716, 348]],
                [[548, 611], [716, 517.5], [538, 359]],
                [[525, 642], [716, 630], [538, 359], [716, 335]]
            ];
            this.selfIdArr = [];
        }
        init() {
            GameDispatcher.getInstance().on(EventName.GAME_NEXT_WAVE, this, this.updataOther);
            GameDispatcher.getInstance().on(EventName.GAME_SELECT_HERO, this, this.pushId);
            if (this.peopleRoot) {
                this.peopleRoot.destroy(true);
            }
            this.peopleRoot = new Laya.Sprite;
            this.addChild(this.peopleRoot);
            this.showAllCharacters();
        }
        showAllCharacters() {
            let enemyArr = [];
            let cfg = ConfigManager.GetConfigByKey(CfgLevel, UserModel.getInstance().lastLevel);
            Game.fightGame.fightData.otherDataArr = cfg.enemy;
            Game.fightGame.fightData.waveMaxNum = cfg.enemy.length - 1;
            Game.fightGame.fightData.currentWave = 0;
            cfg.enemy[0].forEach(element => {
                let cfgManster = ConfigManager.GetConfigByKey(CfgMonster, element[0]);
                enemyArr.push([cfgManster.id, element[1]]);
            });
            for (const key in enemyArr) {
                let item = new UICharacter;
                item.setData(enemyArr[key][0], 2, enemyArr[key][1]);
                this.peopleRoot.addChild(item);
                let x = this.characterPosOther[enemyArr.length - 1][key][0];
                let y = this.characterPosOther[enemyArr.length - 1][key][1];
                item.setPos(x, y);
                let num = parseInt(key);
                item.initZOrder = -(num);
                item.zOrder = -(num);
                this.exceptionalUnit(item);
                Game.fightGame.fightData.otherArr.push(item);
            }
            let fightHeroList = UserModel.getInstance().fightHeroList;
            Laya.timer.frameOnce(3, this, () => {
                UserModel.getInstance().fightHeroList = fightHeroList;
            });
            Game.fightGame.start();
        }
        pushId() {
            Game.fightGame.clearSelfArr();
            this.selfIdArr = UserModel.getInstance().fightHeroList;
            let dataArr = [];
            this.selfIdArr.forEach(element => {
                let cfgHero = ConfigManager.GetConfigByKey(CfgHero, element);
                if (cfgHero == undefined) {
                    dataArr.push(null);
                }
                else {
                    dataArr.push(cfgHero.id);
                }
            });
            for (let i = 0; i < dataArr.length; i++) {
                if (dataArr[i]) {
                    Laya.timer.frameOnce(i * 3, this, () => {
                        let item = new UICharacter();
                        item.setData(dataArr[i], 1);
                        this.peopleRoot.addChild(item);
                        let x = this.characterPosSelf[3][i][0];
                        let y = this.characterPosSelf[3][i][1];
                        item.anchorX = 0.5;
                        item.anchorY = 1;
                        item.initZOrder = -(i);
                        item.zOrder = -(i);
                        item.setPos(x, y);
                        Game.fightGame.fightData.selfArr.push(item);
                        item.on(Laya.Event.CLICK, this, () => {
                            let fightHeroList = UserModel.getInstance().fightHeroList;
                            item.destroy();
                            fightHeroList[i] = null;
                            UserModel.getInstance().fightHeroList = fightHeroList.concat([]);
                            GameDispatcher.getInstance().event(EventName.GAME_REFRESH_LIST);
                        });
                    });
                }
            }
        }
        updataOther() {
            let enemyArr = [];
            let otherArr = Game.fightGame.fightData.otherArr;
            console.log("开始出现下一波,当前的otherArr数组==>", otherArr);
            for (let i = 0; i < otherArr.length; i++) {
                otherArr[i].removeSelf();
            }
            let currentWave = Game.fightGame.fightData.currentWave;
            let cfg = ConfigManager.GetConfigByKey(CfgLevel, UserModel.getInstance().lastLevel);
            cfg.enemy[currentWave].forEach(element => {
                let cfgManster = ConfigManager.GetConfigByKey(CfgMonster, element[0]);
                enemyArr.push([cfgManster.id, element[1]]);
            });
            for (const key in enemyArr) {
                let item = new UICharacter;
                item.setData(enemyArr[key][0], 2, enemyArr[key][1]);
                this.peopleRoot.addChild(item);
                let x = this.characterPosOther[enemyArr.length - 1][key][0];
                let y = this.characterPosOther[enemyArr.length - 1][key][1];
                let num = parseInt(key);
                item.initZOrder = -(num);
                item.zOrder = -(num);
                item.setPos(x, y);
                this.exceptionalUnit(item);
                Laya.Tween.from(item, { x: 1200, y: 600 }, 750, Laya.Ease.backOut, Laya.Handler.create(this, () => {
                    console.log("新敌人已经涌入战场，敌方开始战斗");
                }));
                Game.fightGame.fightData.otherArr.push(item);
            }
            Laya.timer.once(1000, this, () => {
                Game.fightManager.startBattle();
                Game.fightGame.switchSelectMonster();
            });
        }
        exceptionalUnit(item) {
            let x;
            let y;
            switch (item.unitSk.url) {
                case "res/game/monstersk/boss1.sk":
                    x = 570;
                    y = item.y;
                    item.setPos(x, y);
                    break;
                case "res/game/monstersk/boss3.sk":
                    x = 570;
                    y = item.y;
                    item.setPos(x, y);
                    break;
                default:
                    break;
            }
        }
        clear() {
            GameDispatcher.getInstance().off(EventName.GAME_NEXT_WAVE, this, this.updataOther);
            GameDispatcher.getInstance().off(EventName.GAME_SELECT_HERO, this, this.pushId);
            Game.fightGame.fightData.otherArr = [];
            this.destroy(true);
        }
    }

    class UIHeroAvatarItem extends ui.view.game.HeroAvatarItemUI {
        constructor() {
            super();
            this.isLock = true;
        }
        set dataSource(id) {
            if (id) {
                let cfg = ConfigManager.GetConfigByKey(CfgHero, id);
                this.id = id;
                let heroList = UserModel.getInstance().heroList;
                let findHero = heroList.find(item => item.id === id);
                if (findHero) {
                    this.lvNum = findHero.lv;
                    this.isLock = false;
                    this.isLockBg.visible = false;
                    this.lock.visible = false;
                }
                else {
                    this.isLock = true;
                    this.isLockBg.visible = true;
                    this.lock.visible = true;
                    this.lvNum = 1;
                }
                this.lv.text = this.lvNum + "级";
                this.avatar.skin = cfg.avatar;
                this.frame.skin = `res/game/heroavatar/frame_${cfg.type}.png`;
                this.type = cfg.type;
                this.img = cfg.img;
                let isExist = this.IsExistId(this.id);
                if (isExist) {
                    this.blackMask.visible = true;
                    this.dagou.visible = true;
                    this.isSelected = true;
                }
                else {
                    this.blackMask.visible = false;
                    this.dagou.visible = false;
                    this.isSelected = false;
                }
                this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                GameDispatcher.getInstance().on(EventName.GAME_REFRESH_LIST, this, this.onMouseUp);
            }
        }
        IsExistId(id) {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            let findIndex = fightHeroList.findIndex(num => num === id);
            if (findIndex != -1) {
                return true;
            }
            else {
                return false;
            }
        }
        onClick() {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            let findIndex = fightHeroList.findIndex(num => num === this.id);
            if (findIndex != -1) {
                fightHeroList[findIndex] = null;
            }
            else {
                let isNull = false;
                for (let i = 0; i < fightHeroList.length; i++) {
                    if (fightHeroList[i] == null) {
                        fightHeroList[i] = this.id;
                        isNull = true;
                        break;
                    }
                }
                if (fightHeroList.length < 4) {
                    !isNull ? fightHeroList.push(this.id) : null;
                }
            }
            UserModel.getInstance().fightHeroList = fightHeroList.concat([]);
        }
        onMouseDown(event) {
            if (this.isLock) {
                Message.show("英雄未解锁");
                return;
            }
            if (!this.isSelected) {
                Game.fightGame.fightData.setAvatarId(this.id);
                GameDispatcher.getInstance().event(EventName.GAME_DRAG_AVATAR, [event]);
                this.isSelected = true;
            }
        }
        onMouseUp() {
            let isExist = this.IsExistId(this.id);
            if (isExist) {
                this.blackMask.visible = true;
                this.dagou.visible = true;
                this.isSelected = true;
            }
            else {
                this.blackMask.visible = false;
                this.dagou.visible = false;
                this.isSelected = false;
            }
        }
    }

    class UIRoleAvatar extends ui.view.game.RoleAvatarUI {
        constructor() {
            super();
            this.angle = -89.9;
            this.cd = 0;
        }
        set dataSource(data) {
            if (data) {
            }
        }
        clearData() {
            this.cfg = null;
            this.hero = null;
            this.type = null;
            this.heroId = null;
        }
        setData(cfg) {
            if (cfg) {
                console.log("加载头像成功");
                this.cfg = cfg;
                this.angle = -89.9;
                this.cd = 0;
                this.type = cfg.type;
                this.avatar.skin = cfg.gameavatar;
                this.frame.skin = `res/ui/game/heroFrame${this.type}.png`;
                this.heroId = cfg.id;
                let selfArr = Game.fightGame.fightData.selfArr;
                for (let i = 0; i < selfArr.length; i++) {
                    if (selfArr[i].id == this.cfg.id) {
                        this.hero = selfArr[i];
                        break;
                    }
                }
                this.cdMask.graphics.clear();
                this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                this.on(Laya.Event.CLICK, this, this.onClick);
            }
        }
        modifyCdMask(fraction) {
            let hero = Game.fightGame.fightData.selfArr.find(item => item.id === this.heroId);
            if (hero.isDie) {
                this.offAll();
                this.angle = -89.9;
                this.cdMask.graphics.clear();
                this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                return;
            }
            if (this.angle == -90) {
                return;
            }
            for (let i = 0; i < fraction; i++) {
                Laya.timer.once(10 * i, this, () => {
                    this.angle += 1;
                    if (this.cd < 360) {
                        this.cd++;
                    }
                    this.hero.mpMask.width = Math.floor((this.cd / 360) * this.hero.mp.width);
                    if (this.angle < 270) {
                        this.cdMask.graphics.clear();
                        this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                    }
                    else {
                        Laya.timer.clearAll(this);
                        this.angle = -90;
                        this.cdMask.graphics.clear();
                        this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                        return;
                    }
                });
            }
        }
        onClick() {
            if (Game.round == 2) {
                Message.show("无法在敌方回合使用技能");
                return;
            }
            if (this.angle !== -90) {
                Message.show("消除对应颜色的格子解锁技能");
                return;
            }
            this.angle = -89.9;
            this.cdMask.graphics.clear();
            this.cdMask.graphics.drawPie(50, 50, 53, this.angle, -90, "#000");
            this.cd = 0;
            let skill;
            skill = new SkillAll();
            let getV = Game.fightManager.activeSkillMap.get(this.hero.cfg.useskillarr[0]);
            if (!skill[`${getV}`]) {
                Message.show("技能制作中...");
                console.log("当前技能未完成");
                return;
            }
            console.log("施放技能");
            Game.fightManager.addHeroSkill(this.heroId, () => {
                this.angle = -89.9;
                this.cd = 0;
                this.cdMask.graphics.clear();
                this.cdMask.graphics.drawPie(50, 50, 53, this.angle, -90, "#000");
            });
            this.hero.mpMask.width = 1;
        }
        addPowerMax() {
            console.log("添加能量");
            Laya.timer.clearAll(this);
            this.angle = -90;
            this.cdMask.graphics.clear();
            this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
        }
        clear() {
            Laya.timer.clearAll(this);
        }
    }

    var SelectType;
    (function (SelectType) {
        SelectType[SelectType["ALL"] = 1] = "ALL";
        SelectType[SelectType["YELLOW"] = 2] = "YELLOW";
        SelectType[SelectType["BLUE"] = 3] = "BLUE";
        SelectType[SelectType["RED"] = 4] = "RED";
        SelectType[SelectType["GREEN"] = 5] = "GREEN";
    })(SelectType || (SelectType = {}));
    class UIGameCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.type = SelectType.ALL;
            this.heroArr = [];
            this.avatarArr = [];
        }
        uiEventList() {
            return [
                [this.view.btnStop, Laya.Event.CLICK, this.onBtnStop, null],
                [this.view.btnStop2, Laya.Event.CLICK, this.onBtnStop, null],
                [this.view.btnAll, Laya.Event.CLICK, this.selectType, [1]],
                [this.view.btnYellow, Laya.Event.CLICK, this.selectType, [2]],
                [this.view.btnBlue, Laya.Event.CLICK, this.selectType, [3]],
                [this.view.btnRed, Laya.Event.CLICK, this.selectType, [4]],
                [this.view.btnGreen, Laya.Event.CLICK, this.selectType, [5]],
                [this.view.btnStartGame, Laya.Event.CLICK, this.onBtnStartGame, null],
                [this.gameDispatcher, EventName.GAME_AT_THE_BELL, this.roundEnd, null],
                [this.gameDispatcher, EventName.GAME_REFRESH_LIST, this.showItemType, null],
                [this.gameDispatcher, EventName.GAME_DRAG_AVATAR, this.onMoveDrag, null],
                [this.gameDispatcher, EventName.GAME_NOT_HERO, this.notHaveHeroOnSite, null],
                [this.gameDispatcher, EventName.GAME_NEXT_WAVE, this.updataShowWave, null],
                [this.gameDispatcher, EventName.GAME_FIRST_TIPS, this.firstLvMask, null],
                [this.gameDispatcher, EventName.GAME_TIPS_USE_SKILL, this.useSkillTip, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/game.atlas",
            ];
        }
        uiView() {
            return ui.view.game.GameUI;
        }
        onLoad() {
            this.view.heroList.itemRender = UIHeroAvatarItem;
            this.view.heroList.vScrollBarSkin = "";
            this.view.heroList.array = [];
            this.view.heroList.repeatX = 5;
            this.view.heroList.spaceX = 5;
            this.view.heroList.spaceY = 20;
            this.showAvatar();
        }
        showAvatar() {
            for (let i = 0; i < 4; i++) {
                let item = new UIRoleAvatar;
                this.view.leftNode.addChild(item);
                item.x = 27 + i * item.width + 35 * i;
                item.y = 655;
                item.visible = false;
                this.avatarArr.push(item);
            }
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        onHide() {
            this.specialRemoveGame.destroy(true);
            GameModel.getInstance().gameOver();
            for (let i = 0; i < this.avatarArr.length; i++) {
                this.avatarArr[i].clear();
            }
            this.fightGame.clear();
        }
        onShow(lv) {
            this.fightGame = new UIFightGame();
            this.view.rootLeft.addChild(this.fightGame);
            SoundManager.playGameBgm();
            this.view.btnStop.visible = false;
            this.view.waveTxt.visible = false;
            GameMgr.init();
            this.view.btnStartGame.disabled = true;
            this.specialRemoveGame = new SpecialRemoveGame(this.view);
            this.view.rootRight.addChild(this.specialRemoveGame);
            console.log("打开第" + lv + "关");
            this.lv = lv;
            this.view.lv.text = `关卡: ${lv}`;
            this.view.cover.visible = false;
            this.view.rightGame.mouseEnabled = true;
            this.view.rightBg.visible = false;
            this.view.selectHero.visible = true;
            this.view.btnStartGame.visible = true;
            this.showEquipPower();
            Game.round = 1;
            this.fightGame.init();
            this.hideAvatar();
            this.gameStart();
            this.clickTips();
        }
        hideAvatar() {
            this.avatarArr.forEach(item => { item.visible = false; });
        }
        showEquipPower() {
            let lastLevel = UserModel.getInstance().lastLevel;
            let cfgLv = ConfigManager.GetConfigByKey(CfgLevel, lastLevel);
            let power = UnitManager.equipPowerSum(cfgLv.enemy);
            this.view.equipPower.text = power.toString();
        }
        onBtnStop() {
            MessageBox.show("是否确认退出游戏？", "确认", Laya.Handler.create(this, () => {
                this.hide();
                GameModel.getInstance().gameOver();
                UIMgr.show(UIDefine.UIMainCtl, []);
            }), "取消", Laya.Handler.create(this, () => { }));
        }
        gameStart() {
            this.heroArr = [];
            let herolist = UserModel.getInstance().heroList;
            for (let i = 0; i < herolist.length; i++) {
                this.heroArr.push(herolist[i]);
            }
            let fightHeroList = UserModel.getInstance().fightHeroList;
            fightHeroList.forEach(num => {
                if (num !== null) {
                    this.view.btnStartGame.disabled = false;
                    this.playBtnAnim();
                }
            });
            this.showItemType();
        }
        playBtnAnim(isRun = true) {
            if (!isRun) {
                Laya.Tween.clearAll(this);
                Laya.timer.clearAll(this);
                this.view.btnStartGame.scale(1, 1);
                return;
            }
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.view.btnStartGame.scale(1, 1);
            Laya.Tween.to(this.view.btnStartGame, { scaleX: 1.1, scaleY: 1.1 }, 1000);
            Laya.timer.once(1000, this, () => {
                Laya.Tween.to(this.view.btnStartGame, { scaleX: 1, scaleY: 1 }, 1000);
            });
            Laya.timer.loop(2000, this, () => {
                Laya.Tween.to(this.view.btnStartGame, { scaleX: 1.1, scaleY: 1.1 }, 1000);
                Laya.timer.once(1000, this, () => {
                    Laya.Tween.to(this.view.btnStartGame, { scaleX: 1, scaleY: 1 }, 1000);
                });
            });
        }
        updataShowWave() {
            this.view.waveTxt.visible = true;
            this.view.waveTxt.text = "回合 " + (Game.fightGame.fightData.currentWave + 1) + "/" + (Game.fightGame.fightData.waveMaxNum + 1);
        }
        onBtnStartGame() {
            this.view.btnStartGame.visible = false;
            this.view.rightBg.visible = true;
            this.view.selectHero.visible = false;
            this.getPnlList(UserModel.getInstance().fightHeroList);
            GameDispatcher.getInstance().event(EventName.GAME_START);
            Game.fightManager.setSkillMap();
            Game.fightManager.showMave();
            this.updataShowWave();
            this.specialRemoveGame.startGame(this.lv);
            if (UserModel.getInstance().lastLevel == 1 && !UserModel.getInstance().firstLvTip) {
                this.showNoviceTips();
            }
        }
        getPnlList(data) {
            let itemArr = [];
            this.avatarArr.forEach(element => {
                element.clearData();
            });
            for (let i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    for (let j = 0; j < this.avatarArr.length; j++) {
                        if (!this.avatarArr[j].cfg) {
                            this.avatarArr[j].visible = true;
                            let cfgHero = ConfigManager.GetConfigByKey(CfgHero, data[i]);
                            this.avatarArr[j].setData(cfgHero);
                            itemArr.push(this.avatarArr[j]);
                            if (UserModel.getInstance().lastLevel == 1 && !UserModel.getInstance().firstLvTip) {
                                this.avatarArr[j].mouseEnabled = false;
                            }
                            break;
                        }
                    }
                }
                else {
                    this.avatarArr[i].visible = false;
                }
            }
            HeroAvatar.getInstance().setAvatarList(itemArr);
            this.view.btnStop.visible = true;
        }
        roundEnd(num) {
            if (num == 2) {
                this.view.rightGame.mouseEnabled = true;
                this.view.cover.visible = false;
            }
            else if (num == 1) {
                this.view.rightGame.mouseEnabled = false;
                this.view.cover.visible = true;
            }
        }
        selectType(num) {
            switch (num) {
                case 1:
                    this.type = SelectType.ALL;
                    break;
                case 2:
                    this.type = SelectType.YELLOW;
                    break;
                case 3:
                    this.type = SelectType.BLUE;
                    break;
                case 4:
                    this.type = SelectType.RED;
                    break;
                case 5:
                    this.type = SelectType.GREEN;
                    break;
                default: break;
            }
            this.showItemType();
        }
        showItemType() {
            this.type == SelectType.ALL ? this.view.btnAll.skin = "res/ui/game/selectBg.png" : this.view.btnAll.skin = "";
            this.type == SelectType.YELLOW ? this.view.btnYellow.skin = "res/ui/game/selectBg.png" : this.view.btnYellow.skin = "";
            this.type == SelectType.BLUE ? this.view.btnBlue.skin = "res/ui/game/selectBg.png" : this.view.btnBlue.skin = "";
            this.type == SelectType.RED ? this.view.btnRed.skin = "res/ui/game/selectBg.png" : this.view.btnRed.skin = "";
            this.type == SelectType.GREEN ? this.view.btnGreen.skin = "res/ui/game/selectBg.png" : this.view.btnGreen.skin = "";
            let arr = [];
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            cfgHero.forEach(item => {
                if (this.type == SelectType.YELLOW && item.type == 1) {
                    arr.push(item.id);
                }
                else if (this.type == SelectType.BLUE && item.type == 2) {
                    arr.push(item.id);
                }
                else if (this.type == SelectType.RED && item.type == 3) {
                    arr.push(item.id);
                }
                else if (this.type == SelectType.GREEN && item.type == 4) {
                    arr.push(item.id);
                }
                else if (this.type == SelectType.ALL) {
                    arr.push(item.id);
                }
            });
            let heroList = UserModel.getInstance().heroList;
            let haveHero = [];
            for (let i = 0; i < arr.length; i++) {
                heroList.forEach(item => {
                    if (item.id == arr[i]) {
                        haveHero.push(item.id);
                    }
                });
            }
            for (let i = 0; i < haveHero.length; i++) {
                let index = arr.findIndex(item => item === haveHero[i]);
                if (index !== -1) {
                    arr.splice(index, 1);
                }
            }
            arr.unshift(...haveHero);
            this.view.heroList.array = arr;
        }
        onMoveDrag(event) {
            if (this.dragSk) {
                this.dragSk.removeSelf();
            }
            this.dragSk = new Laya.Skeleton();
            if (!Game.fightGame.fightData.clickItemId) {
                return;
            }
            let cfghero = ConfigManager.GetConfigByKey(CfgHero, Game.fightGame.fightData.clickItemId);
            this.dragSk.load(cfghero.skurl, Laya.Handler.create(this, () => {
                this.dragSk.url = cfghero.skurl;
                this.dragSk.scale(0.45, 0.45);
                Laya.timer.frameOnce(2, this, () => {
                    this.dragSk.play("stand", true);
                    Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
                    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
                    Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
                    this.view.content.addChild(this.dragSk);
                    let pos = new Laya.Point();
                    pos.setTo(event.stageX, event.stageY);
                    let pos2 = this.view.content.globalToLocal(pos);
                    this.dragSk.pos(pos2.x, pos2.y);
                });
            }));
        }
        onMouseMove(e) {
            let pos2 = new Laya.Point(e.stageX, e.stageY);
            let pos = this.view.content.globalToLocal(pos2);
            this.dragSk.pos(pos.x, pos.y);
        }
        onMouseUp(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            let isHit_1 = this.view.hit_1.hitTestPoint(pos.x, pos.y);
            let isHit_2 = this.view.hit_2.hitTestPoint(pos.x, pos.y);
            let isHit_3 = this.view.hit_3.hitTestPoint(pos.x, pos.y);
            let isHit_4 = this.view.hit_4.hitTestPoint(pos.x, pos.y);
            this.view.btnStartGame.disabled = false;
            let fightHeroList = UserModel.getInstance().fightHeroList;
            this.dragSk.removeSelf();
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            if (isHit_1) {
                fightHeroList[0] = Game.fightGame.fightData.clickItemId;
            }
            else if (isHit_2) {
                fightHeroList[1] = Game.fightGame.fightData.clickItemId;
            }
            else if (isHit_3) {
                fightHeroList[2] = Game.fightGame.fightData.clickItemId;
            }
            else if (isHit_4) {
                fightHeroList[3] = Game.fightGame.fightData.clickItemId;
            }
            UserModel.getInstance().fightHeroList = fightHeroList;
            this.showItemType();
            this.herolistIsNull();
        }
        herolistIsNull() {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            for (let i = 0; i < fightHeroList.length; i++) {
                if (fightHeroList[i] !== null) {
                    this.view.btnStartGame.disabled = false;
                    return;
                }
            }
            this.view.btnStartGame.disabled = true;
            this.playBtnAnim(false);
        }
        notHaveHeroOnSite() {
            this.view.btnStartGame.disabled = true;
            this.playBtnAnim(false);
        }
        showNoviceTips() {
            SpeakMsg.show("把3枚同色的宝石连成一排，就可以对敌人发动攻击了哦。");
            this.view.noviceTipBg.visible = true;
            this.view.noviceTipBg2.visible = true;
        }
        firstLvMask() {
            this.view.noviceTipBg.visible = false;
            this.view.noviceTipBg2.visible = false;
        }
        useSkillTip(data) {
            let pos1 = new Laya.Point(data.x + 120, data.y - 20);
            let pos2 = new Laya.Point(data.x + 100, data.y + 20);
            let tipClick = ClickTips.show(pos1, true, [pos1, pos2], 300);
            tipClick.img.scaleY = -1;
            this.view.leftNode.addChild(tipClick);
            data.on(Laya.Event.CLICK, this, () => {
                if (tipClick) {
                    SpeakMsg.show("接下来交给你了，让我看看你的实力！", true);
                    Game.fightGame.fightData.roundNum = 1;
                    tipClick.remove();
                    tipClick = null;
                }
            });
        }
        clickTips() {
            let clicktip = UserModel.getInstance().clickTipsList;
            if (clicktip[1].click == 1) {
                return;
            }
            this.view.noviceTips.visible = true;
            let pos1 = new Laya.Point(-30, 250);
            let pos2 = new Laya.Point(40, 200);
            let tipClick = ClickTips.show(pos1, true, [pos1, pos2], 300);
            tipClick.img.scale(-1, 1);
            this.view.selectHero.addChild(tipClick);
            this.view.on(Laya.Event.CLICK, this, () => {
                this.view.noviceTips.visible = false;
                tipClick.remove();
                this.view.offAll();
                clicktip[1].click = 1;
                UserModel.getInstance().clickTipsList = clicktip;
            });
        }
    }

    class UIGameFailCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnRemake, Laya.Event.CLICK, this.onBtnRemake, null],
                [this.view.btnRemake2, Laya.Event.CLICK, this.onBtnRemake, null],
                [this.view.btnStrengthen, Laya.Event.CLICK, this.onBtnStrengthen, null],
                [this.view.bg, Laya.Event.CLICK, this.onBg, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.game.GameFailUI;
        }
        onLoad() {
        }
        onShow(argc) {
        }
        onBtnRemake() {
            Game.fightManager.remake();
        }
        onBtnStrengthen() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIMainCtl);
            UIMgr.show(UIDefine.UIHeroUpCtl, "openHero");
        }
        onBg() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIMainCtl, []);
        }
    }

    class StringUtil {
        constructor() {
        }
        static stringCut(maxChars, str, suffix = "...") {
            if (str == "") {
                return str;
            }
            let toCodePoint = function (unicodeSurrogates) {
                let r = [], c = 0, p = 0, i = 0;
                while (i < unicodeSurrogates.length) {
                    let pos = i;
                    c = unicodeSurrogates.charCodeAt(i++);
                    if (c == 0xfe0f) {
                        continue;
                    }
                    if (p) {
                        let value = (0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00));
                        r.push({
                            v: value,
                            pos: pos
                        });
                        p = 0;
                    }
                    else if (0xD800 <= c && c <= 0xDBFF) {
                        p = c;
                    }
                    else {
                        r.push({
                            v: c,
                            pos: pos
                        });
                    }
                }
                return r;
            };
            maxChars *= 2;
            let codeArr = toCodePoint(str);
            let numChar = 0;
            let index = 0;
            for (let i = 0; i < codeArr.length; ++i) {
                let code = codeArr[i].v;
                let add = 1;
                if (code >= 128) {
                    add = 2;
                }
                if (numChar + add > maxChars) {
                    break;
                }
                index = i;
                numChar += add;
            }
            if (codeArr.length - 1 == index) {
                return str;
            }
            let more = suffix ? 1 : 0;
            return str.substring(0, codeArr[index - more].pos + 1) + suffix;
        }
        static numformat(value) {
            if (value > 1000000000000000) {
                return (value / 1000000000000000).toFixed(1) + "千兆";
            }
            if (value > 1000000000000) {
                return (value / 1000000000000).toFixed(1) + "兆";
            }
            if (value > 1000000000) {
                return (value / 1000000000).toFixed(1) + "十亿";
            }
            if (value > 1000000) {
                return (value / 1000000).toFixed(1) + "百万";
            }
            if (value > 10000) {
                return (value / 1000).toFixed(1) + "千";
            }
            return value + "";
        }
        static isPhoneNumber(str) {
            let reg = /^1([0-9])\d{9}$/;
            if (reg.test(str)) {
                return true;
            }
            else {
                return false;
            }
        }
        static isNumberOrChar(str) {
            let reg = /^[0-9a-zA-Z]+$/;
            if (reg.test(str)) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    class UIBagItem extends ui.view.main.bagItemUI {
        constructor() {
            super();
        }
        set dataSource(data) {
            if (data) {
                this.data = data;
                this.id = data.id;
                let cfg = ConfigManager.GetConfigByKey(CfgItem, this.id);
                this.type = cfg.type;
                this.img.skin = cfg.img;
                cfg.hero ? this.debris.visible = true : this.debris.visible = false;
                if (this.type !== 3 || !data.lv) {
                    this.countData = data[1];
                    this.count.text = StringUtil.numformat(data.number);
                    this.count.visible = true;
                    this.lv.visible = false;
                }
                else {
                    this.count.visible = false;
                    this.lv.visible = true;
                    this.lv.text = data.lv + "级";
                }
                this.on(Laya.Event.CLICK, this, this.onClick);
            }
        }
        onClick() {
            if (this.data.onlyId) {
                UIMgr.show(UIDefine.UIEquipInfoCtl, this.data.onlyId);
            }
            else {
                UIMgr.show(UIDefine.UIArticleTipCtl, this.data);
            }
        }
    }

    class UIGameWinCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.bg, Laya.Event.CLICK, this.onBg, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.game.GameWinUI;
        }
        onLoad() {
            this.view.list.itemRender = UIBagItem;
            this.view.list.vScrollBarSkin = "";
            this.view.list.array = [];
            this.view.list.spaceX = 20;
            this.view.list.spaceY = 20;
        }
        onShow(lv) {
            this.addItem(lv);
        }
        addItem(lv) {
            let itemArr = [];
            let addItem;
            if (Game.isEndLessMode == 2) {
                addItem = itemManager.getLevelItemEndLess();
            }
            else {
                addItem = itemManager.getLevelItem();
            }
            addItem.forEach(item => {
                itemArr.push({ id: item[0], number: item[1] });
                itemManager.addItem(item[0], item[1]);
            });
            this.view.list.array = itemArr;
        }
        onBg() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.show(UIDefine.UIMainCtl, []);
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
                this.view.onAdapter();
            }
            this.view.setProgress(p, msg);
        }
        onAdapter() {
            let w = Laya.stage.width;
            let h = Laya.stage.height;
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                LoadingView.view.bottomNode.scale(s, s);
                LoadingView.view.content.scale(s, s);
            }
        }
        init() {
            this.resize();
            Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
        }
        setProgress(p, msg) {
            if (p == 100) {
                this.bar.visible = false;
                this.loadingTxt.visible = false;
                this.txtDesc.visible = false;
                this.barBg.visible = false;
                LoadingView.view.btnStart.on(Laya.Event.CLICK, this, () => {
                    this.isOpen = false;
                    Laya.Dialog.lock(false);
                    LoadingView.view.close();
                    UserManager.setUserData();
                    itemManager.refreshGoodsList();
                    UIMgr.show(UIDefine.UIMainCtl);
                    TaskManager.updateTaskCount(1);
                });
            }
            else {
                if (this.isOpen == false) {
                    this.isOpen = true;
                    Laya.Dialog.lock(true);
                    LoadingView.view.show(false, false);
                }
            }
            let pw = this.bar.width * p / 100;
            this.progressMask.width = pw;
            if (msg) {
                this.txtDesc.text = msg;
            }
            else {
                this.txtDesc.text = `${p}%`;
            }
        }
        resize() {
            this.height = Laya.stage.height;
            this.width = Laya.stage.width;
        }
    }
    LoadingView.view = null;

    class Net {
        ;
        static connect() {
            window["Net"] = this;
            this.byte = new Laya.Byte();
            this.byte.endian = Laya.Byte.LITTLE_ENDIAN;
            this.socket = new Laya.Socket();
            this.socket.endian = Laya.Byte.LITTLE_ENDIAN;
            this.socket.connectByUrl(AppConfig.serverUrl);
            this.socket.on(Laya.Event.OPEN, this, this.onOpen);
            this.socket.on(Laya.Event.MESSAGE, this, this.onReceive);
            this.socket.on(Laya.Event.CLOSE, this, this.onClose);
            this.socket.on(Laya.Event.ERROR, this, this.onError);
        }
        static onOpen(event = null) {
            this.isConnect = true;
            Log.l("连接成功 " + AppConfig.serverUrl, "Net");
        }
        static onReceive(json = null) {
            let msg;
            try {
                msg = JSON.parse(json);
            }
            catch (err) {
                Log.l(`JSON解析失败，json == \n  ${json} \n==`, "Net");
            }
            if (!msg.cmd) {
                Log.l("无协议号", "Net");
                return;
            }
            if (this.isEnbleDebug && msg.cmd != 14) {
                console.log("收到协议=> " + json);
            }
            if (!this.cmdMap.has(msg.cmd)) {
                Log.l(`议号[${msg.cmd}]未注册`, "Net");
                return;
            }
            this.isHasBack = true;
            let handle = this.cmdMap.get(msg.cmd);
            handle.runWith(msg.data);
        }
        static close() {
            this.isConnect = false;
            this.socket.close();
        }
        static onClose(e = null) {
            this.isConnect = false;
            Log.l("连接断开", "Net");
        }
        static onError(e = null) {
            Log.e("连接错误" + e, "Net");
        }
        static onTimer() {
        }
        static sendCmd(cmd, data) {
            if (this.isConnect == false) {
                Log.e("socket 未连接无法发送消息", "Net");
                return;
            }
            let msg = {
                cmd: cmd,
                data: data
            };
            let json = JSON.stringify(msg);
            if (this.isEnbleDebug && msg.cmd != 13) {
                console.log("发送协议=> " + json);
            }
            this.socket.send(json);
        }
        static registerCmd(cmd, caller, callback) {
            let handle = new Laya.Handler(caller, callback, [], false);
            this.cmdMap.set(cmd, handle);
        }
        static enableDebug(b) {
            this.isEnbleDebug = b;
        }
        static isSocketConnect() {
            return this.isConnect;
        }
    }
    Net.cmdMap = new Map();
    Net.isEnbleDebug = false;
    Net.isConnect = false;
    Net.isHasBack = false;

    class UILoginCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.clickTime = 0;
            this.account = "";
        }
        uiEventList() {
            return [
                [this.view.btnLogin, Laya.Event.CLICK, this.onLogin, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.LoginUI;
        }
        onLoad() {
        }
        onShow() {
            this.view.account.visible = Laya.Browser.onPC;
            let account = localStorage.getItem("account");
            if (account) {
                this.view.account.text = account;
            }
            this.onNetConnectOpen();
        }
        onNetConnectOpen() {
            if (Net.isSocketConnect()) {
                let uid = QueryArgsUtil.get("uid");
                if (uid != null) {
                }
                this.view.btnLogin.visible = true;
            }
            else {
                this.view.btnLogin.visible = false;
            }
        }
        onLogin() {
            let nowTime = Laya.Browser.now();
            if (nowTime - this.clickTime <= 2000) {
                return;
            }
            this.clickTime = nowTime;
            if (this.view.account.text != "") {
                localStorage.setItem("account", this.view.account.text);
            }
            this.account = this.view.account.text;
        }
    }

    class UIArticleTipCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null]
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.ArticleTipUI;
        }
        onLoad() {
        }
        onShow(arr) {
            this.showItem(arr);
            Game.isEndLessMode = 1;
        }
        showItem(arr) {
            let cfgItem = ConfigManager.GetConfigByKey(CfgItem, arr.id);
            this.view.itemName.text = cfgItem.name;
            this.view.img.skin = cfgItem.img;
            this.view.blurb.text = cfgItem.tip;
            if (arr.number) {
                this.view.count.text = "拥有：" + arr.number;
            }
            else {
                this.view.count.text = "拥有：1";
            }
        }
    }

    var Select;
    (function (Select) {
        Select[Select["All"] = 1] = "All";
        Select[Select["Prop"] = 2] = "Prop";
        Select[Select["Material"] = 3] = "Material";
        Select[Select["Equip"] = 4] = "Equip";
    })(Select || (Select = {}));
    class UIBagCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.SelectIndex = Select.All;
        }
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btn1, Laya.Event.CLICK, this.onBtn, [1]],
                [this.view.btn2, Laya.Event.CLICK, this.onBtn, [2]],
                [this.view.btn3, Laya.Event.CLICK, this.onBtn, [3]],
                [this.view.btn4, Laya.Event.CLICK, this.onBtn, [4]],
                [this.gameDispatcher, EventName.USER_SAVE_GOODS, this.updata, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/main.atlas",
                "res/atlas/res/ui/comm.atlas",
            ];
        }
        uiView() {
            return ui.view.main.BagUI;
        }
        onLoad() {
            this.view.list.vScrollBarSkin = "";
            this.view.list.itemRender = UIBagItem;
            this.view.list.array = null;
            this.view.list.repeatX = 7;
            this.view.list.spaceX = 20;
            this.view.list.spaceY = 20;
        }
        onShow(argc) {
            itemManager.clearModelGoodsList();
            this.setListData();
            this.btnState();
        }
        showListData() {
            let itemArray = UserModel.getInstance().goodsList;
            this.view.list.array = itemArray;
        }
        updata() {
            this.showListData();
            this.setListData();
        }
        onBtn(num) {
            let itemArray = UserModel.getInstance().goodsList;
            switch (num) {
                case 1:
                    this.SelectIndex = Select.All;
                    this.view.list.array = itemArray;
                    break;
                case 2:
                    this.SelectIndex = Select.Prop;
                    this.setListData();
                    break;
                case 3:
                    this.SelectIndex = Select.Material;
                    this.setListData();
                    break;
                case 4:
                    this.SelectIndex = Select.Equip;
                    this.setListData();
                    break;
                default:
                    break;
            }
            this.btnState();
        }
        btnState() {
            this.SelectIndex == Select.All ? this.view.btn1.skin = "res/ui/comm/img_btn_select_1.png" : this.view.btn1.skin = "res/ui/comm/img_btn_select_0.png";
            this.SelectIndex == Select.Prop ? this.view.btn2.skin = "res/ui/comm/img_btn_select_1.png" : this.view.btn2.skin = "res/ui/comm/img_btn_select_0.png";
            this.SelectIndex == Select.Material ? this.view.btn3.skin = "res/ui/comm/img_btn_select_1.png" : this.view.btn3.skin = "res/ui/comm/img_btn_select_0.png";
            this.SelectIndex == Select.Equip ? this.view.btn4.skin = "res/ui/comm/img_btn_select_1.png" : this.view.btn4.skin = "res/ui/comm/img_btn_select_0.png";
        }
        setListData() {
            let itemArray = UserModel.getInstance().goodsList;
            let array = [];
            for (let i = 0; i < itemArray.length; i++) {
                let cfg = ConfigManager.GetConfigByKey(CfgItem, itemArray[i].id);
                if (this.SelectIndex == Select.Prop && cfg.type == 1) {
                    array.push(itemArray[i]);
                }
                else if (this.SelectIndex == Select.Material && cfg.type == 2) {
                    array.push(itemArray[i]);
                }
                else if (this.SelectIndex == Select.Equip && cfg.type == 3) {
                    array.push(itemArray[i]);
                }
            }
            if (this.SelectIndex == Select.All) {
                this.view.list.array = itemArray;
            }
            else {
                this.view.list.array = array;
            }
        }
    }

    class UIHeroUpItem extends ui.view.hero.HeroUpItemUI {
        constructor() {
            super();
            this.isLock = true;
            this.starPosArr = [
                [103],
                [84, 117],
                [67.5, 100.5, 133],
                [115, 146, 85, 55],
                [42, 72, 102, 133, 163]
            ];
        }
        set dataSource(id) {
            if (id) {
                if (this.starNode) {
                    this.starNode.destroy(true);
                }
                this.starNode = new Laya.Image;
                this.addChild(this.starNode);
                this.starNode.left = 0;
                this.starNode.right = 0;
                this.starNode.top = 0;
                this.starNode.bottom = 0;
                let starArr = [];
                this.id = id;
                let cfg = ConfigManager.GetConfigByKey(CfgHero, id);
                this.img.skin = cfg.img;
                Laya.loader.load(cfg.img, Laya.Handler.create(this, () => {
                    let maskS = 1;
                    if (this.img.height > 243) {
                        let s = 243 / this.img.height;
                        this.img.scale(s, s);
                        maskS = this.img.height / 243;
                    }
                    this.img.mask = this.imgMask;
                    this.img.centerX = 0;
                    this.imgMask.scale(maskS, maskS);
                    this.imgMask.centerX = 0;
                }));
                let heroList = UserModel.getInstance().heroList;
                let hero = heroList.find(item => item.id === cfg.id);
                if (hero) {
                    this.lv.text = "等级." + hero.lv;
                    this.starNum = hero.star;
                    this.isLock = false;
                    this.lock.visible = false;
                    this.lockBg.visible = false;
                }
                else {
                    this.isLock = true;
                    this.lock.visible = true;
                    this.lockBg.visible = true;
                    this.lv.text = "等级.1";
                    this.starNum = 1;
                }
                for (let i = 0; i < this.starNum; i++) {
                    let starImg = new Laya.Image;
                    starImg.skin = "res/ui/hero/img_star.png";
                    starImg.anchorX = 0.5;
                    starImg.anchorY = 0.5;
                    starArr.push(starImg);
                    this.starNode.addChild(starImg);
                    starImg.pos(this.starPosArr[this.starNum - 1][i], 220);
                }
                this.type = cfg.type;
                this.bg.skin = `res/ui/hero/img_bg_${this.type}.png`;
                this.colorIcon.skin = `res/ui/icon/star${this.type}.png`;
            }
            this.on(Laya.Event.CLICK, this, this.onClick);
        }
        onClick() {
            if (this.isLock) {
                Message.show("当前英雄未解锁");
                return;
            }
            UIMgr.show(UIDefine.UIHeroInfoCtl, this.id);
        }
    }

    var Select$1;
    (function (Select) {
        Select[Select["All"] = 0] = "All";
        Select[Select["YELLOW"] = 1] = "YELLOW";
        Select[Select["BLUE"] = 2] = "BLUE";
        Select[Select["RED"] = 3] = "RED";
        Select[Select["GREEN"] = 4] = "GREEN";
    })(Select$1 || (Select$1 = {}));
    class UIHeroUpCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.SelectState = Select$1.All;
            this.heroArr = [];
        }
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnAll, Laya.Event.CLICK, this.switchState, [0]],
                [this.view.btnYellow, Laya.Event.CLICK, this.switchState, [1]],
                [this.view.btnBlue, Laya.Event.CLICK, this.switchState, [2]],
                [this.view.btnRed, Laya.Event.CLICK, this.switchState, [3]],
                [this.view.btnGreen, Laya.Event.CLICK, this.switchState, [4]],
                [this.gameDispatcher, EventName.USER_UPLV_HERO, this.onShowHero, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/hero.atlas",
                "res/atlas/res/ui/comm.atlas"
            ];
        }
        uiView() {
            return ui.view.hero.HeroUpUI;
        }
        onLoad() {
            this.view.list.itemRender = UIHeroUpItem;
            this.view.list.vScrollBarSkin = "";
            this.view.list.array = [];
        }
        onShow(argc) {
            this.selectionEffect();
            if (argc == 'openHero') {
                console.log(this.heroArr[0]);
                UIMgr.show(UIDefine.UIHeroInfoCtl, this.heroArr[0]);
            }
        }
        switchState(num) {
            switch (num) {
                case 0:
                    this.SelectState = Select$1.All;
                    break;
                case 1:
                    this.SelectState = Select$1.YELLOW;
                    break;
                case 2:
                    this.SelectState = Select$1.BLUE;
                    break;
                case 3:
                    this.SelectState = Select$1.RED;
                    break;
                case 4:
                    this.SelectState = Select$1.GREEN;
                    break;
                default:
                    break;
            }
            this.selectionEffect();
        }
        selectionEffect() {
            this.SelectState == Select$1.All ? this.view.btnAll.skin = "res/ui/hero/img_select.png" : this.view.btnAll.skin = "";
            this.SelectState == Select$1.YELLOW ? this.view.btnYellow.skin = "res/ui/hero/img_select.png" : this.view.btnYellow.skin = "";
            this.SelectState == Select$1.BLUE ? this.view.btnBlue.skin = "res/ui/hero/img_select.png" : this.view.btnBlue.skin = "";
            this.SelectState == Select$1.RED ? this.view.btnRed.skin = "res/ui/hero/img_select.png" : this.view.btnRed.skin = "";
            this.SelectState == Select$1.GREEN ? this.view.btnGreen.skin = "res/ui/hero/img_select.png" : this.view.btnGreen.skin = "";
            this.onShowHero();
        }
        onShowHero() {
            this.heroArr = [];
            let hero = ConfigManager.GetConfig(CfgHero);
            hero.forEach(item => {
                if (this.SelectState == Select$1.All) {
                    this.heroArr.push(item.id);
                }
                else if (item.type == 1 && this.SelectState == Select$1.YELLOW) {
                    this.heroArr.push(item.id);
                }
                else if (item.type == 2 && this.SelectState == Select$1.BLUE) {
                    this.heroArr.push(item.id);
                }
                else if (item.type == 3 && this.SelectState == Select$1.RED) {
                    this.heroArr.push(item.id);
                }
                else if (item.type == 4 && this.SelectState == Select$1.GREEN) {
                    this.heroArr.push(item.id);
                }
            });
            let heroList = UserModel.getInstance().heroList;
            let isHaveHero = [];
            for (let i = 0; i < this.heroArr.length; i++) {
                heroList.forEach(item => {
                    if (item.id == this.heroArr[i]) {
                        isHaveHero.push(item.id);
                    }
                });
            }
            console.log("获取已解锁英雄==>", isHaveHero, "原数组==>", this.heroArr);
            for (let i = 0; i < isHaveHero.length; i++) {
                let index = this.heroArr.findIndex(item => item == isHaveHero[i]);
                if (index !== -1) {
                    this.heroArr.splice(index, 1);
                }
            }
            console.log("删除后数组==>", this.heroArr);
            this.heroArr.unshift(...isHaveHero);
            console.log("重新组合数组==>", this.heroArr);
            this.view.list.array = this.heroArr;
        }
    }

    class CfgLevelGroup extends ConfigBase {
        parse(data) {
            this.id = data.id;
            this.name = data.name;
            this.isOpen = data.isOpen == 1;
            this.isShow = data.isShow == 1;
            this.unlockNum = data.unlockNum;
            this.sort = data.sort;
            this.level = data.level == "" ? [] : data.level.split(',').map(v => parseInt(v));
            return this.id;
        }
        configName() {
            return "LevelGroup";
        }
    }

    class levelHelp {
        static getFirstUnlockID(groupID, passList) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, groupID);
            for (let i = 0; i < cfg.level.length; i++) {
                if (passList.indexOf(cfg.level[i]) == -1) {
                    return cfg.level[i];
                }
            }
            return -1;
        }
        static getLeveListChunk(groupID) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, groupID);
            let lvCfgArr = [];
            for (let i = 0; i < cfg.level.length; i++) {
                let lvCfg = ConfigManager.GetConfigByKey(CfgLevel, cfg.level[i]);
                lvCfgArr.push(lvCfg);
            }
            console.log(lvCfgArr);
            return lvCfgArr;
        }
        static getIdIndex(id) {
            let cfg = ConfigManager.GetConfigByKey(CfgLevelGroup, Game.currentGroupID);
            let findIndex = cfg.level.findIndex(num => num === id);
            if (findIndex !== -1) {
                return findIndex + 1;
            }
            return 250;
        }
    }

    class UILvItem extends ui.view.main.LvItemUI {
        constructor() {
            super();
            this.isLock = true;
            this.isPass = false;
        }
        static createLvItem() {
            return new UILvItem();
        }
        set dataSource(id) {
        }
        setId(id) {
            this.id = id;
            this.isPass = UserModel.getInstance().passList.includes(this.id);
            this.isLock = id != levelHelp.getFirstUnlockID(Game.currentGroupID, UserModel.getInstance().passList) && !this.isPass;
            this.img.disabled = this.isLock;
            this.lv.text = `第${levelHelp.getIdIndex(id)}关`;
            this.avatarSp.visible = false;
        }
        onClick() {
            if (!this.isLock) {
                UserModel.getInstance().lastLevel = this.id;
                return true;
            }
            else {
                Message.show("未解锁");
                return false;
            }
        }
    }

    var Select$2;
    (function (Select) {
        Select[Select["Bag"] = 1] = "Bag";
        Select[Select["Hero"] = 2] = "Hero";
        Select[Select["Right"] = 3] = "Right";
        Select[Select["Special"] = 4] = "Special";
    })(Select$2 || (Select$2 = {}));
    class UIMainCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.itemArr = [];
            this.dropArr = [];
            this.selectState = Select$2.Right;
            this.useI = 0;
        }
        uiEventList() {
            return [
                [this.view.btnAddDiamond, Laya.Event.CLICK, this.openUI, [UIDefine.UIShopCtl, null, 1]],
                [this.view.btnShop, Laya.Event.CLICK, this.openUI, [UIDefine.UIShopCtl, null, 1]],
                [this.view.btnSetting, Laya.Event.CLICK, this.openUI, [UIDefine.UISettingCtl, null, 1]],
                [this.view.btnCall, Laya.Event.CLICK, this.openUI, [UIDefine.UICallHeroCtl, null, 1]],
                [this.view.btnTask, Laya.Event.CLICK, this.openUI, [UIDefine.UITaskCtl, null, 1]],
                [this.view.btnPlay, Laya.Event.CLICK, this.openUI, [UIDefine.UIPlanStartCtl, null, 1]],
                [this.view.btnKnapsack, Laya.Event.CLICK, this.openBottomBtn, [1]],
                [this.view.btnHeroUp, Laya.Event.CLICK, this.openBottomBtn, [2]],
                [this.view.btnRushLevel, Laya.Event.CLICK, this.openBottomBtn, [3]],
                [this.view.btnEndLess, Laya.Event.CLICK, this.openBottomBtn, [4]],
                [this.view.captionsBg, Laya.Event.CLICK, this.onCaptionsBg, null],
                [this.gameDispatcher, EventName.USER_SWITCH_DIAMOND, this.updatePlayer, null],
                [this.gameDispatcher, EventName.USER_SWITCH_MONEY, this.updatePlayer, null],
                [this.gameDispatcher, EventName.USER_UPDATA, this.updatePlayer, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
                this.view.captionsBg.scale(s, s);
            }
            else {
            }
        }
        uiResList() {
            return ["res/atlas/res/ui/main.atlas"];
        }
        uiView() {
            return ui.view.main.MainUI;
        }
        onLoad() {
            this.createLvItem();
            this.view.pnl.hScrollBarSkin = '';
        }
        onShow(argc) {
            SoundManager.playMainBgm();
            if (!UserModel.getInstance().showTest) {
                for (let i = 0; i < 4; i++) {
                    this.view[`txt_${i}`].visible = false;
                    this.view[`txt_${i}`].alpha = 0;
                }
                this.showFirstGameTxt();
            }
            else {
            }
            this.selectState = Select$2.Right;
            Game.currentGroupID = 1;
            TaskManager.setNewTime();
            itemManager.equipPower();
            UnitManager.updateHeroData();
            this.showUnlockLv();
            this.updatePlayer();
            if (UserModel.getInstance().lastLevel) {
                this.onCLickItem(UserModel.getInstance().lastLevel - 1);
            }
            let passList = UserModel.getInstance().lastLevel;
            if (passList >= 4) {
                this.view.pnl.scrollTo(460 + (240 * (passList - 4)));
            }
            this.showView();
        }
        noviceTip() {
            let clicktip = UserModel.getInstance().clickTipsList;
            if (clicktip[0].click == 1) {
                return;
            }
            ;
            this.view.gametips_1.visible = true;
            let pos1 = new Laya.Point(-30, -30);
            let pos2 = new Laya.Point(0, 0);
            let tipClick = ClickTips.show(pos1, true, [pos1, pos2], 300);
            tipClick.img.scale(-1, -1);
            this.view.btnPlay.addChild(tipClick);
            Laya.timer.once(1500, this, () => {
                this.view.on(Laya.Event.CLICK, this, () => {
                    if (this.view.captionsBg.visible !== false) {
                        return;
                    }
                    tipClick.remove();
                    this.view.gametips_1.visible = false;
                    clicktip[0].click = 1;
                    UserModel.getInstance().clickTipsList = clicktip;
                    this.view.offAll();
                });
            });
        }
        createLvItem() {
            let cfgLG = ConfigManager.GetConfigByKey(CfgLevelGroup, 1);
            let obstacle = cfgLG.level;
            for (let i = 0; i < obstacle.length; i++) {
                let item = new UILvItem;
                item = UILvItem.createLvItem();
                this.view.pnl.addChild(item);
                let randomNum = Math.floor((Math.random() * (332 - 160)) + 159);
                item.x = i * 243;
                item.y = randomNum;
                item.setId(obstacle[i]);
                item.zOrder = 1;
                item.on(Laya.Event.CLICK, this, this.onCLickItem, [i]);
                this.itemArr.push(item);
            }
            this.addDrop();
            if (UserModel.getInstance().lastLevel) {
                this.onCLickItem(UserModel.getInstance().lastLevel - 1);
            }
        }
        onCLickItem(index) {
            let onClick = this.itemArr[index].onClick();
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            if (onClick) {
                for (let i = 0; i < this.itemArr.length; i++) {
                    this.itemArr[i].img.skin = "res/ui/main/level.png";
                    this.itemArr[i].avatarSp.visible = false;
                }
                this.itemArr[index].img.skin = "res/ui/main/select.png";
                this.itemArr[index].avatarSp.visible = true;
                Laya.Tween.to(this.itemArr[index].avatarSp, { y: -20 }, 1000);
                Laya.timer.once(1000, this, () => {
                    Laya.Tween.to(this.itemArr[index].avatarSp, { y: 0 }, 1000);
                });
                Laya.timer.loop(2000, this, () => {
                    Laya.Tween.to(this.itemArr[index].avatarSp, { y: -20 }, 1000);
                    Laya.timer.once(1000, this, () => {
                        Laya.Tween.to(this.itemArr[index].avatarSp, { y: 0 }, 1000);
                    });
                });
            }
        }
        openBottomBtn(num) {
            SoundManager.clickSound();
            switch (num) {
                case 1:
                    this.selectState = Select$2.Bag;
                    break;
                case 2:
                    this.selectState = Select$2.Hero;
                    break;
                case 3:
                    this.selectState = Select$2.Right;
                    break;
                case 4:
                    this.selectState = Select$2.Special;
                    break;
                default:
                    break;
            }
            this.showView();
        }
        showView() {
            this.selectState == Select$2.Bag ?
                (Laya.Tween.to(this.view.btnKnapsack, { scaleX: 1.2, scaleY: 1.2 }, 100),
                    this.view.btnKnapsack.skin = "res/ui/main/btnFrame_1.png",
                    UIMgr.show(UIDefine.UIBagCtl, []))
                : (this.view.btnKnapsack.scale(1, 1), this.view.btnKnapsack.skin = "res/ui/main/btnFrame_0.png");
            this.selectState == Select$2.Hero ?
                (Laya.Tween.to(this.view.btnHeroUp, { scaleX: 1.2, scaleY: 1.2 }, 100),
                    this.view.btnHeroUp.skin = "res/ui/main/btnFrame_1.png",
                    UIMgr.show(UIDefine.UIHeroUpCtl, []))
                : (this.view.btnHeroUp.scale(1, 1), this.view.btnHeroUp.skin = "res/ui/main/btnFrame_0.png");
            this.selectState == Select$2.Right ?
                (Laya.Tween.to(this.view.btnRushLevel, { scaleX: 1.2, scaleY: 1.2 }, 100),
                    this.view.btnRushLevel.skin = "res/ui/main/btnFrame_1.png",
                    Game.currentGroupID = 1,
                    Game.isEndLessMode = 1)
                : (this.view.btnRushLevel.scale(1, 1), this.view.btnRushLevel.skin = "res/ui/main/btnFrame_0.png");
            this.selectState == Select$2.Special ?
                (Laya.Tween.to(this.view.btnEndLess, { scaleX: 1.2, scaleY: 1.2 }, 100),
                    this.view.btnEndLess.skin = "res/ui/main/btnFrame_1.png",
                    Game.currentGroupID = 2,
                    this.hide(),
                    Game.isEndLessMode = 2,
                    UIMgr.show(UIDefine.UIEndLessGameCtl))
                : (this.view.btnEndLess.scale(1, 1), this.view.btnEndLess.skin = "res/ui/main/btnFrame_0.png");
        }
        showUnlockLv() {
            let cfgLG = ConfigManager.GetConfigByKey(CfgLevelGroup, 1);
            let obstacle = cfgLG.level;
            for (let i = 0; i < this.itemArr.length; i++) {
                this.itemArr[i].setId(obstacle[i]);
                if (i !== 0) {
                    if (!this.itemArr[i].isLock || this.itemArr[i].isPass) {
                        this.dropArr[i - 1][0].disabled = false;
                        this.dropArr[i - 1][1].disabled = false;
                    }
                    else {
                        this.dropArr[i - 1][0].disabled = true;
                        this.dropArr[i - 1][1].disabled = true;
                    }
                }
            }
            let passList = UserModel.getInstance().passList[UserModel.getInstance().passList.length - 1];
            let findIndex = obstacle.findIndex(num => num === passList);
            if (this.itemArr[findIndex + 1]) {
                for (let i = 0; i < this.itemArr.length; i++) {
                    this.itemArr[i].img.skin = "res/ui/main/level.png";
                }
                this.itemArr[findIndex + 1].img.skin = "res/ui/main/select.png";
                UserModel.getInstance().lastLevel = this.itemArr[findIndex + 1].id;
            }
            else {
                UserModel.getInstance().lastLevel = this.itemArr[findIndex].id;
            }
        }
        addDrop() {
            this.view.pnl.hScrollBarSkin = '';
            for (let i = 0; i < this.itemArr.length; i++) {
                let pos1 = new Laya.Point(this.itemArr[i].x, this.itemArr[i].y);
                if (i == this.itemArr.length - 1) {
                    continue;
                }
                let pos2 = new Laya.Point(this.itemArr[i + 1].x, this.itemArr[i + 1].y);
                let width = pos2.x - pos1.x;
                let height = pos2.y - pos1.y;
                let item1 = new Laya.Image;
                let item2 = new Laya.Image;
                item1.skin = "res/ui/main/root.png";
                item2.skin = "res/ui/main/root.png";
                this.view.pnl.addChild(item1);
                let compensateX = 60;
                let compensateY = 25;
                this.view.pnl.addChild(item2);
                item1.pos(this.itemArr[i].x + compensateX + width * 0.35, this.itemArr[i].y + compensateY + height * 0.35);
                item2.pos(pos1.x + compensateX + width * 0.6, pos1.y + compensateY + height * 0.6);
                this.dropArr.push([item1, item2]);
            }
        }
        updatePlayer() {
            this.view.diamond.text = StringUtil.numformat(UserModel.getInstance().diamond);
            this.view.money.text = StringUtil.numformat(UserModel.getInstance().money);
            this.view.selfLv.text = UserModel.getInstance().userData.lv + "";
            console.log("更新成功");
        }
        showFirstGameTxt() {
            this.view.content.visible = false;
            this.view.captionsBg.visible = true;
            this.view[`txt_${this.useI}`].visible = true;
            this.runTimer(this.useI, () => {
                this.useI++;
                if (this.useI < 4) {
                    this.showFirstGameTxt();
                }
                else {
                    this.view.content.visible = true;
                    Laya.Tween.to(this.view.captionsBg, { alpha: 0 }, 1000, null, Laya.Handler.create(this, () => {
                        this.view.captionsBg.visible = false;
                        UserModel.getInstance().showTest = true;
                        this.noviceTip();
                    }));
                }
            });
        }
        runTimer(i, callback) {
            Laya.timer.once(0, this, () => {
                Laya.Tween.to(this.view[`txt_${i}`], { alpha: 1 }, 1000, null, Laya.Handler.create(this, () => {
                    Laya.timer.once(30000, this, () => {
                        Laya.Tween.to(this.view[`txt_${i}`], { alpha: 0 }, 500, null, Laya.Handler.create(this, () => {
                            callback();
                        }));
                    });
                }));
            });
        }
        onCaptionsBg() {
            if (this.useI >= 4) {
                return;
            }
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            for (let i = 0; i <= this.useI; i++) {
                this.view[`txt_${i}`].alpha = 0;
                this.view[`txt_${i}`].visible = false;
            }
            this.useI++;
            if (this.useI < 4) {
                this.showFirstGameTxt();
            }
            else {
                this.view.content.visible = true;
                Laya.Tween.to(this.view.captionsBg, { alpha: 0 }, 1000, null, Laya.Handler.create(this, () => {
                    this.view.captionsBg.visible = false;
                    UserModel.getInstance().showTest = true;
                    this.noviceTip();
                }));
            }
        }
    }

    class UIEnemyAvatarItem extends ui.view.main.EnemyAvatarItemUI {
        constructor() {
            super();
        }
        set dataSource(data) {
            if (data) {
                this.img.skin = data.img;
            }
        }
    }

    class UIPlanStartCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.bg, Laya.Event.CLICK, this.hide, null],
                [this.view.btnStart, Laya.Event.CLICK, this.onBtnStart, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.PlanStartUI;
        }
        onLoad() {
            this.view.peopleList.itemRender = UIEnemyAvatarItem;
            this.view.peopleList.hScrollBarSkin = "";
            this.view.peopleList.array = [];
            this.view.peopleList.spaceX = 20;
            this.view.itemList.itemRender = UIBagItem;
            this.view.itemList.hScrollBarSkin = "";
            this.view.itemList.array = [];
            this.view.itemList.spaceX = 20;
        }
        onShow(argc) {
            let cfg_level = ConfigManager.GetConfigByKey(CfgLevel, UserModel.getInstance().lastLevel);
            let avatarData = [];
            for (let i = 0; i < cfg_level.enemy.length; i++) {
                cfg_level.enemy[i].forEach(item => {
                    let data = {
                        img: `res/game/enemyavatar/avatar_${item[0]}.png`
                    };
                    avatarData.push(data);
                });
            }
            this.view.peopleList.array = avatarData;
            let powerSum = UnitManager.equipPowerSum(cfg_level.enemy);
            this.view.powerTxt.text = powerSum.toString();
            let itemData = [];
            let getLvItem = itemManager.getLevelItem();
            for (let i = 0; i < getLvItem.length; i++) {
                itemData.push({ id: getLvItem[i][0], number: getLvItem[i][1] });
                this.view.itemList.array = itemData;
            }
            this.view.levelNum.text = "关卡: " + UserModel.getInstance().lastLevel;
        }
        onBtnStart() {
            this.hide();
            UIMgr.hide(UIDefine.UIMainCtl);
            UIMgr.show(UIDefine.UIGameCtl, UserModel.getInstance().lastLevel);
        }
    }

    class UIShopItem extends ui.view.shop.ShopItemUI {
        set dataSource(data) {
            if (data) {
                this.data = data;
                this.id = data.id;
                this.img.skin = data.skin;
                this.doubleTxt.text = "+" + data.diamond;
                this.btnName.text = data.money + "元";
                this.goodsName.text = data.diamond + "钻石";
                this.needMoney = data.money;
                this.getDiamond = data.diamond;
                this.btn.on(Laya.Event.CLICK, this, this.onClick);
            }
        }
        onClick() {
            let lastBuyTime = UserModel.getInstance().lastBuyTime;
            let nowTime = TimeUtil.UTC;
            let uid = UserModel.getInstance().uid;
            let years8 = ["ceshi_4", "test_3", "feiji_2", "qiche_4", "ceshi_3", "tanke_2"];
            let years16 = ["1ceshi_4", "1feiji_3", "1test_2", "1ceshi_4", "1tanke_3", "1tanke_1"];
            let years18 = ["2test_4", "2feiji_3", "2test_2", "2paoku_4", "2tanke_3", "2test_1"];
            let isSameDay = TimeUtil.isSameDay(lastBuyTime, nowTime);
            let isSameMoon = TimeUtil.isSameMoon(lastBuyTime, nowTime);
            if (!isSameDay) {
                UserModel.getInstance().payNumToday = 0;
            }
            if (!isSameMoon) {
                UserModel.getInstance().useMoneyMoon = 0;
            }
            let payNumToday = UserModel.getInstance().payNumToday;
            let useMoneyMoon = UserModel.getInstance().useMoneyMoon;
            if (payNumToday == 30) {
                MessageBox.show("今日次数已达30次，不允许继续消费", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }));
                return;
            }
            if (years8.includes(uid)) {
                MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，本游戏不为未满8周岁的用户提供游戏充值服务。", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }), null, null, "left");
                return;
            }
            if (years16.includes(uid)) {
                if (useMoneyMoon + this.needMoney >= 200) {
                    MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，您已超出支付上限，无法继续充值。", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }), null, null, "left");
                    return;
                }
                if (this.needMoney >= 50) {
                    MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，本游戏的实名认证及防沉迷系统设置如下:游戏中8周岁以上未满16周岁的用户，单次充值金额不得超过50元人民币，每月充值金额不得超过200元人民币。", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }), null, null, "left");
                    return;
                }
                MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，本游戏的实名认证及防沉迷系统设置如下:游戏中8周岁以上未满16周岁的用户，单次充值金额不得超过50元人民币，每月充值金额不得超过200元人民币。", "确定", Laya.Handler.create(this, () => {
                    UserModel.getInstance().lastBuyTime = TimeUtil.UTC;
                    UserModel.getInstance().payNum += 1;
                    UserModel.getInstance().payNumToday += 1;
                    console.log("购买成功,钻石添加" + (this.data.diamond * 2));
                    Message.show("购买成功,钻石添加" + (this.data.diamond * 2));
                    UserModel.getInstance().diamond += this.data.diamond * 2;
                    UserModel.getInstance().useMoneyMoon += this.data.money;
                    TaskManager.updateTaskCount(3);
                    return;
                }));
            }
            else if (years18.includes(uid)) {
                if (useMoneyMoon + this.needMoney >= 400) {
                    MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，您已超出支付上限，无法继续充值。", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }), null, null, "left");
                    return;
                }
                if (this.needMoney >= 100) {
                    MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，本游戏的实名认证及防沉迷系统设置如下:游戏中16周岁以上未满18周岁的用户，单次充值金额不得超过100元人民币，每月充值金额不得超过400元人民币。", "确定", Laya.Handler.create(this, () => { Message.show("购买失败"); }), null, null, "left");
                    return;
                }
                MessageBox.show("您目前为未成年人账号，已被纳入防沉迷系统。根据国家新闻出版署《关于防止未成年人沉迷网络游戏的通知》及《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》的要求，本游戏的实名认证及防沉迷系统设置如下:游戏中16周岁以上未满18周岁的用户，单次充值金额不得超过100元人民币，每月充值金额不得超过400元人民币。", "确定", Laya.Handler.create(this, () => {
                    UserModel.getInstance().lastBuyTime = TimeUtil.UTC;
                    UserModel.getInstance().payNum += 1;
                    UserModel.getInstance().payNumToday += 1;
                    console.log("购买成功,钻石添加" + (this.data.diamond * 2));
                    Message.show("购买成功,钻石添加" + (this.data.diamond * 2));
                    UserModel.getInstance().diamond += this.data.diamond * 2;
                    UserModel.getInstance().useMoneyMoon += this.data.money;
                    TaskManager.updateTaskCount(3);
                    return;
                }));
            }
            else {
                this.pay();
            }
        }
        pay() {
            UserModel.getInstance().lastBuyTime = TimeUtil.UTC;
            UserModel.getInstance().payNum += 1;
            UserModel.getInstance().payNumToday += 1;
            console.log("购买成功,钻石添加" + (this.data.diamond * 2));
            Message.show("购买成功,钻石添加" + (this.data.diamond * 2));
            UserModel.getInstance().diamond += this.data.diamond * 2;
            UserModel.getInstance().useMoneyMoon += this.data.money;
            TaskManager.updateTaskCount(3);
        }
    }

    class UIShopCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.shop.ShopUI;
        }
        onLoad() {
            this.view.list.itemRender = UIShopItem;
            this.view.list.vScrollBarSkin = "";
            this.view.list.array = [];
            this.view.list.repeatX = 3;
            this.view.list.spaceX = 45;
            this.view.list.spaceY = 20;
        }
        onShow(argc) {
            this.showTestData();
        }
        showTestData() {
            this.view.list.array = shopData.data;
        }
    }
    class shopData {
    }
    shopData.data = [
        { id: 1, money: 30, diamond: 300, skin: "res/ui/shop/item_0.png" },
        { id: 2, money: 68, diamond: 680, skin: "res/ui/shop/item_1.png" },
        { id: 3, money: 128, diamond: 1280, skin: "res/ui/shop/item_2.png" },
        { id: 4, money: 198, diamond: 1980, skin: "res/ui/shop/item_3.png" },
        { id: 5, money: 328, diamond: 3280, skin: "res/ui/shop/item_4.png" },
    ];

    class UITaskItem extends ui.view.task.TaskItemUI {
        constructor() {
            super(...arguments);
            this.progressWidth = 291;
        }
        set dataSource(id) {
            if (id) {
                this.id = id;
                let itemArr = [];
                this.cfg = ConfigManager.GetConfigByKey(CfgTask, id);
                this.taskName.text = this.cfg.name;
                this.cfg.reward.forEach(item => {
                    itemArr.push({ id: item[0], number: item[1] });
                });
                this.list.itemRender = UIBagItem;
                this.list.hScrollBarSkin = "";
                this.list.spaceX = 16;
                this.list.array = itemArr;
                this.updateState();
                this.on(Laya.Event.CLICK, this, this.onClick);
            }
        }
        updateState() {
            let taskList = UserModel.getInstance().taskList;
            let task = taskList.find(item => item.id === this.id);
            if (task) {
                this.progressBar(task.count);
            }
        }
        progressBar(num) {
            let taskList = UserModel.getInstance().taskList;
            let task = taskList.find(item => item.id === this.id);
            this.progressMask.width = this.progressWidth * (num / this.cfg.num);
            this.num.text = num + "/" + this.cfg.num;
            if (task) {
                if (num === this.cfg.num) {
                    if (!task.receive) {
                        console.log("已完成" + this.cfg.name);
                        this.btnClick.skin = "res/ui/task/img_btnReceive.png";
                    }
                    else {
                        this.btnClick.skin = "res/ui/task/img_btnCompleted.png";
                    }
                }
                else {
                    this.btnClick.skin = "res/ui/task/img_btnCome.png";
                }
            }
        }
        onClick() {
            let taskList = UserModel.getInstance().taskList;
            let task = taskList.find(item => item.id === this.id);
            if (task) {
                if (task.count !== this.cfg.num && !task.receive) {
                    console.log("未完成");
                    if (this.cfg.jump !== null) {
                        UIMgr.hide(UIDefine.UITaskCtl);
                        UIMgr.show(UIDefine[`${this.cfg.jump}`], null);
                    }
                    return;
                }
                else if (task.receive) {
                    console.log("已完成");
                    return;
                }
                task.receive = true;
            }
            console.log("领取成功!");
            Message.show("领取成功!");
            this.btnClick.skin = "res/ui/task/img_btnCompleted.png";
            this.cfg.reward.forEach(item => { itemManager.addItem(item[0], item[1]); });
        }
    }

    class UITaskCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/task.atlas",
                "res/atlas/res/ui/comm.atlas",
            ];
        }
        uiView() {
            return ui.view.task.TaskUI;
        }
        onLoad() {
            this.view.list.vScrollBarSkin = "";
            this.view.list.itemRender = UITaskItem;
            this.view.list.array = [];
            this.view.list.spaceY = 5;
        }
        onShow(argc) {
            this.showTestData();
        }
        showTestData() {
            let arr = [];
            let test = ConfigManager.GetConfig(CfgTask);
            test.forEach(element => {
                arr.push(element.id);
            });
            this.view.list.array = arr;
        }
    }

    class UIUtils {
        static getStarByLevel(level) {
            if (level == 0) {
                return 0;
            }
            else if (level > 30) {
                return 5;
            }
            else {
                let n = level % 5;
                n = n == 0 ? 5 : n;
                return n;
            }
        }
        static getDan(level) {
            if (level == 0) {
                return this.DAN[0];
            }
            if (level > 30) {
                return this.DAN[6];
            }
            let index = Math.floor((level - 1) / 5);
            index = Math.min(5, index);
            let n = this.getStarByLevel(level);
            return this.DAN[index] + this.intToRoman(n);
        }
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
    UIUtils.DAN = ["青铜", "白银", "黄金", "白金", "钻石", "大师", "王者"];

    class UIEquipGainItem extends ui.view.hero.EquipGainItemUI {
        constructor() {
            super();
        }
        set dataSource(data) {
            if (data) {
                this.equipKey.text = data.equipKey;
                this.equipValue.text = "+" + data.equipValue;
            }
        }
    }

    class UISelectEquipItem extends ui.view.hero.SelectEquipItemUI {
        constructor() {
            super();
        }
        set dataSource(data) {
            if (data) {
                this.onlyId = data[0];
                this.HeroId = data[1];
                let goodsList = UserModel.getInstance().goodsList;
                let item = goodsList.find(item => item.onlyId === data[0]);
                if (item) {
                    let cfgItem = ConfigManager.GetConfigByKey(CfgItem, item.id);
                    this.img.skin = cfgItem.img;
                    this.equipName.text = cfgItem.name;
                    let equipData = itemManager.equipData(data[0]);
                    this.attributeTxt.text = "攻击：" + equipData.aggress;
                    let isEquip = UnitManager.isHasEquip(this.onlyId, this.HeroId);
                    isEquip === true ? this.btnReplace.visible = false : this.btnReplace.visible = true;
                }
                this.btnReplace.on(Laya.Event.CLICK, this, this.onClick);
            }
        }
        onClick() {
            console.log("点击穿戴装备");
            let heroList = UserModel.getInstance().heroList;
            let goodsList = UserModel.getInstance().goodsList;
            let heroIndex = heroList.findIndex(item => item.id === this.HeroId);
            let equip = goodsList.find(item => item.onlyId === this.onlyId);
            if (heroIndex !== undefined && equip) {
                let cfgitem = ConfigManager.GetConfigByKey(CfgItem, equip.id);
                UnitManager.unitEquipUpPower(this.onlyId, this.HeroId, cfgitem.equiptype);
                let cfghero = ConfigManager.GetConfigByKey(CfgHero, this.HeroId);
                console.log(`testlog:${cfghero.name}穿戴${cfgitem.name}`, heroList[heroIndex]);
            }
        }
    }

    var Select$3;
    (function (Select) {
        Select[Select["INFO"] = 1] = "INFO";
        Select[Select["EQUIP"] = 2] = "EQUIP";
        Select[Select["UPSTAR"] = 3] = "UPSTAR";
    })(Select$3 || (Select$3 = {}));
    class UIHeroInfoCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.selectState = Select$3.INFO;
            this.equipTowId = [];
        }
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnInfo, Laya.Event.CLICK, this.selected, [1]],
                [this.view.btnEquip, Laya.Event.CLICK, this.selected, [2]],
                [this.view.btnUpStar, Laya.Event.CLICK, this.selected, [3]],
                [this.view.btnWear, Laya.Event.CLICK, this.onBtnWear, null],
                [this.view.btnRemoveAll, Laya.Event.CLICK, this.onBtnRemoveAll, null],
                [this.view.btnUpStarLv, Laya.Event.CLICK, this.onBtnUpStarLv, null],
                [this.view.btnLeft, Laya.Event.CLICK, this.switchHero, [1]],
                [this.view.btnRight, Laya.Event.CLICK, this.switchHero, [2]],
                [this.view.frame0, Laya.Event.CLICK, this.onOpenEquip, [0]],
                [this.view.frame1, Laya.Event.CLICK, this.onOpenEquip, [1]],
                [this.view.frame2, Laya.Event.CLICK, this.onOpenEquip, [2]],
                [this.view.btnCloseEquip, Laya.Event.CLICK, this.onBtnCloseEquip, null],
                [this.view.replaceMaskBg, Laya.Event.CLICK, this.onReplaceMaskBg, null],
                [this.view.btnReplace, Laya.Event.CLICK, this.onBtnReplace, null],
                [this.gameDispatcher, EventName.USER_SAVE_GOODS, this.updataView, null],
                [this.view.btnRemove, Laya.Event.CLICK, this.onBtnRemove, null],
                [this.view.skill1, Laya.Event.CLICK, this.onSkill, [1]],
                [this.view.skill2, Laya.Event.CLICK, this.onSkill, [2]],
                [this.view.skill3, Laya.Event.CLICK, this.onSkill, [3]],
                [this.view.skillMaskBg, Laya.Event.CLICK, this.hideSkill, null],
                [this.view.btnEquipUpLv, Laya.Event.CLICK, this.onBtnEquipUpLv, null],
                [this.view.btnUpLvHero, Laya.Event.CLICK, this.onBtnUpLvHero, null],
                [this.gameDispatcher, EventName.USER_UPLV_HERO, this.updataView, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
                this.view.equipContent.scale(s, s);
                this.view.replaceContent.scale(s, s);
                this.view.skillContent.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/hero.atlas",
                "res/atlas/res/game/skillimg.atlas",
                "res/atlas/res/game/frame.atlas",
                "res/atlas/res/ui/comm.atlas"
            ];
        }
        uiView() {
            return ui.view.hero.HeroInfoUI;
        }
        onLoad() {
            this.view.equipList.itemRender = UIEquipGainItem;
            this.view.replaceList.itemRender = UISelectEquipItem;
            this.view.equipList.array = [];
            this.view.replaceList.array = [];
            this.view.equipList.vScrollBarSkin = "";
            this.view.replaceList.vScrollBarSkin = "";
            this.view.equipList.spaceY = 15;
            this.view.replaceList.spaceY = 15;
        }
        onShow(id) {
            this.cfg = ConfigManager.GetConfigByKey(CfgHero, id);
            console.log(this.cfg);
            this.view.equipMaskBg.visible = false;
            this.view.equipContent.visible = false;
            this.view.replaceMaskBg.visible = false;
            this.view.replaceContent.visible = false;
            this.view.skillContent.visible = false;
            this.view.skillMaskBg.visible = false;
            this.showSelectState();
            this.showLeftData();
            this.heroInfo();
        }
        updataView() {
            console.log("升级英雄，更新视图");
            this.view.replaceMaskBg.visible = false;
            this.view.replaceContent.visible = false;
            this.view.equipContent.visible = false;
            this.view.equipMaskBg.visible = false;
            this.showSelectState();
            this.showLeftData();
            this.heroInfo();
        }
        showLeftData() {
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.find(item => item.id === this.cfg.id);
            this.view.heroName.text = this.cfg.name;
            for (let i = 0; i < 5; i++) {
                this.view[`star${i}`].skin = "res/ui/hero/img_blackstar.png";
            }
            if (hero) {
                for (let i = 0; i < hero.star; i++) {
                    this.view[`star${i}`].skin = "res/ui/hero/img_star.png";
                }
                this.view.leftShowLv.text = hero.lv + "/" + hero.maxlv;
                this.view.pMask.width = 177 * hero.lv / hero.maxlv;
            }
            Laya.loader.load(this.cfg.img, Laya.Handler.create(this, () => {
                this.view.heroImg.skin = this.cfg.img;
                if (this.view.heroImg.height > 338) {
                    let s = 338 / this.view.heroImg.height;
                    this.view.heroImg.scale(s, s);
                }
                else {
                    this.view.heroImg.scale(1, 1);
                }
            }));
            this.view.leftNodeColorIcon.skin = `res/ui/icon/star${this.cfg.type}.png`;
            this.view.progress1.mask = this.view.pMask;
            this.view.pMask.visible = false;
            switch (this.cfg.career) {
                case 1:
                    this.view.career.text = "坦克";
                    break;
                case 2:
                    this.view.career.text = "法师";
                    break;
                case 3:
                    this.view.career.text = "战士";
                    break;
                case 4:
                    this.view.career.text = "射手";
                    break;
                default:
                    this.view.career.text = "其他";
                    break;
            }
        }
        heroInfo() {
            let heroData = UnitManager.updateOneHeroData(this.cfg.id);
            let need = UnitManager.getHeroUpLvResource(this.cfg.id);
            this.view.needMoney.text = need.money.toString();
            this.view.needPotion.text = need.potion.toString();
            this.view.hpNum.text = heroData.hp.toString();
            this.view.defenseNum.text = Math.floor(heroData.defense).toString();
            this.view.aggressNum.text = heroData.aggress.toString();
            this.view.power.text = (heroData.hp + heroData.defense + heroData.aggress).toString();
        }
        onBtnUpLvHero() {
            console.log("升级英雄", this.cfg.id);
            UnitManager.upLvHero(this.cfg.id);
        }
        onBtnWear() {
            let strongsetPower = itemManager.getStrongestPower(this.cfg.id);
            strongsetPower.clothing.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.clothing[1], this.cfg.id, 0) : null;
            strongsetPower.helmet.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.helmet[1], this.cfg.id, 1) : null;
            strongsetPower.cloak.length !== 0 ? UnitManager.unitEquipUpPower(strongsetPower.cloak[1], this.cfg.id, 2) : null;
            this.showEquipNode();
            this.heroInfo();
            if (strongsetPower.clothing.length == 0 && strongsetPower.helmet.length == 0 && strongsetPower.cloak.length == 0) {
                Message.show("暂无合适的装备");
            }
        }
        onBtnRemoveAll() {
            let hero = UserModel.getInstance().heroList;
            let find = hero.find(item => item.id === this.cfg.id);
            if (find) {
                if (find.clothing.length == 0 && find.helmet.length == 0 && find.cloak.length == 0) {
                    Message.show("暂无装备可卸下");
                }
                find.clothing.length !== 0 ? UnitManager.unwield(find.clothing[1], this.cfg.id) : null;
                find.helmet.length !== 0 ? UnitManager.unwield(find.helmet[1], this.cfg.id) : null;
                find.cloak.length !== 0 ? UnitManager.unwield(find.cloak[1], this.cfg.id) : null;
                this.showEquipNode();
                this.heroInfo();
            }
        }
        showInfoNode() {
            let HeroList = UserModel.getInstance().heroList;
            let hero = HeroList.find(item => item.id === this.cfg.id);
            let fullLevel = UIUtils.getChildByPath(this.view.HeroInfoNode1, "fullLevel");
            let skill1 = UIUtils.getChildByPath(this.view.skill1, "skillLv");
            let skill2 = UIUtils.getChildByPath(this.view.skill2, "skillLv");
            let skill3 = UIUtils.getChildByPath(this.view.skill3, "skillLv");
            let skill_img1 = UIUtils.getChildByPath(this.view.skill1, "skill_img");
            let skill_img2 = UIUtils.getChildByPath(this.view.skill2, "skill_img");
            let skill_img3 = UIUtils.getChildByPath(this.view.skill3, "skill_img");
            skill_img1.skin = this.cfg.activeskill;
            skill_img2.skin = this.cfg.starskill;
            skill_img3.skin = this.cfg.passiveskill;
            this.view.node1Camp.skin = `res/ui/hero/camp${this.cfg.type}.png`;
            if (hero) {
                if (hero.lv >= 100) {
                    this.view.btnUpLvHero.disabled = true;
                }
                else {
                    this.view.btnUpLvHero.disabled = false;
                }
                this.view.HeroInfoNode1.getChildByName('lvNum').text = hero.lv + "/" + hero.maxlv;
                let skill = this.cfg.skillarr;
                let lvArr = [];
                for (let i = 0; i < 3; i++) {
                    let lv = SkillManager.getSkillLv(skill[i], this.cfg.id);
                    lvArr.push(lv);
                }
                skill1.text = lvArr[0].toString();
                skill2.text = lvArr[1].toString();
                skill3.text = lvArr[2].toString();
                if (hero.maxlv == hero.lv) {
                    fullLevel.visible = true;
                }
                else {
                    fullLevel.visible = false;
                }
            }
        }
        showEquipNode() {
            let goodsList = UserModel.getInstance().goodsList;
            let nullSkin = "res/ui/hero/equip_tips.png";
            let heroList = UserModel.getInstance().heroList;
            let hero = heroList.find(item => item.id === this.cfg.id);
            let img0 = this.view.img0;
            let img1 = this.view.img1;
            let img2 = this.view.img2;
            let equiplv0 = this.view.equiplv0;
            let equiplv1 = this.view.equiplv1;
            let equiplv2 = this.view.equiplv2;
            let equip0 = this.view.equip0;
            let equip1 = this.view.equip1;
            let equip2 = this.view.equip2;
            if (hero) {
                if (hero.clothing.length !== 0) {
                    equiplv0.visible = true;
                    equip0.visible = true;
                    let cfg = ConfigManager.GetConfigByKey(CfgItem, hero.clothing[0]);
                    img0.skin = cfg.img;
                    equip0.text = cfg.name;
                    let filter = goodsList.filter(item => item.onlyId === hero.clothing[1]);
                    if (filter.length !== 0) {
                        equiplv0.text = "等级:" + filter[0].lv;
                    }
                }
                else {
                    img0.skin = nullSkin;
                    equiplv0.visible = false;
                    equip0.visible = false;
                }
                if (hero.helmet.length !== 0) {
                    equiplv1.visible = true;
                    equip1.visible = true;
                    let cfg = ConfigManager.GetConfigByKey(CfgItem, hero.helmet[0]);
                    img1.skin = cfg.img;
                    equip1.text = cfg.name;
                    let filter = goodsList.filter(item => item.onlyId === hero.helmet[1]);
                    if (filter.length !== 0) {
                        equiplv1.text = "等级:" + filter[0].lv;
                    }
                }
                else {
                    img1.skin = nullSkin;
                    equiplv1.visible = false;
                    equip1.visible = false;
                }
                if (hero.cloak.length !== 0) {
                    equiplv2.visible = true;
                    equip2.visible = true;
                    let cfg = ConfigManager.GetConfigByKey(CfgItem, hero.cloak[0]);
                    img2.skin = cfg.img;
                    equip2.text = cfg.name;
                    let filter = goodsList.filter(item => item.onlyId === hero.cloak[1]);
                    if (filter.length !== 0) {
                        equiplv2.text = "等级:" + filter[0].lv;
                    }
                }
                else {
                    img2.skin = nullSkin;
                    equiplv2.visible = false;
                    equip2.visible = false;
                }
            }
        }
        showUpStar() {
            let starArr = [];
            let skillNum1 = UIUtils.getChildByPath(this.view.HeroInfoNode3, "skill0/skillNum");
            let skillNum2 = UIUtils.getChildByPath(this.view.HeroInfoNode3, "skill1/skillNum");
            let img1 = UIUtils.getChildByPath(this.view.HeroInfoNode3, "skill0/img");
            let img2 = UIUtils.getChildByPath(this.view.HeroInfoNode3, "skill1/img");
            let avatar = UIUtils.getChildByPath(this.view.HeroInfoNode3, "avatar");
            let heroDebris = ConfigManager.GetConfigByKey(CfgItem, this.cfg.debris);
            avatar.skin = heroDebris.img;
            img1.skin = this.cfg.activeskill;
            img2.skin = this.cfg.activeskill;
            for (let i = 0; i < 5; i++) {
                let star = UIUtils.getChildByPath(this.view.HeroInfoNode3, `star${i}`);
                starArr.push(star);
            }
            let heroList = UserModel.getInstance().heroList;
            let find = heroList.find(hero => hero.id === this.cfg.id);
            let skill = this.cfg.skillarr;
            let skillStar = SkillManager.getSkillLv(skill[0], this.cfg.id);
            skillNum1.text = skillStar.toString();
            if (find) {
                if (find.star !== 5) {
                    for (let i = 0; i < 5; i++) {
                        starArr[i].skin = "res/ui/hero/img_blackstar.png";
                    }
                    for (let j = 0; j < find.star + 1; j++) {
                        starArr[j].skin = "res/ui/hero/img_star.png";
                        if (j === find.star) {
                            starArr[j].skin = "res/ui/hero/img_star2.png";
                        }
                    }
                    let newSkillLv = SkillManager.getSkillLvForStar(skill[0], find.star + 1);
                    skillNum2.text = newSkillLv.toString();
                    this.starNumber();
                }
                else {
                    for (let i = 0; i < 5; i++) {
                        starArr[i].skin = "res/ui/hero/img_star.png";
                    }
                    this.view.btnUpStarLv.disabled = true;
                }
            }
        }
        onOpenEquip(num) {
            this.equipType = num;
            let heroList = UserModel.getInstance().heroList;
            let goodsList = UserModel.getInstance().goodsList;
            let hero = heroList.find(item => item.id === this.cfg.id);
            let equip = [];
            let cfgItem;
            let equipPower = [];
            if (hero) {
                if (num === 0) {
                    equip = hero.clothing;
                }
                else if (num === 1) {
                    equip = hero.helmet;
                }
                else if (num === 2) {
                    equip = hero.cloak;
                }
                if (equip.length === 0) {
                    this.replaceEquip(null, num);
                    return;
                }
                this.equipTowId = equip;
                let goodsIndex = goodsList.findIndex(item => item.onlyId === equip[1]);
                cfgItem = ConfigManager.GetConfigByKey(CfgItem, equip[0]);
                let goods = goodsList[goodsIndex];
                this.onlyId = equip[1];
                let itemData = itemManager.equipData(equip[1]);
                this.view.showEquipImg.skin = cfgItem.img;
                this.view.equipName.text = cfgItem.name;
                this.view.showEquipLv.text = `等级：${goods.lv}/${goods.maxLv}`;
                this.view.equipDescribe.text = cfgItem.tip;
                this.showInlay(goods.lv);
                equipPower = [
                    { equipKey: "生命值", equipValue: itemData.hp },
                    { equipKey: "攻击力", equipValue: itemData.aggress },
                    { equipKey: "防御力", equipValue: itemData.defense },
                ];
                this.view.equipList.array = equipPower;
            }
            this.view.equipMaskBg.visible = true;
            this.view.equipContent.visible = true;
        }
        showInlay(lv) {
            if (lv >= 15) {
                this.view.inlay0T0.visible = true;
                this.view.inlay0T1.visible = true;
                this.view.inlay0.skin = "res/ui/hero/img_attribute_bg.png";
            }
            else {
                this.view.inlay0T0.visible = false;
                this.view.inlay0T1.visible = false;
                this.view.inlay0.skin = "res/ui/hero/img_not_attribute.png";
            }
            if (lv >= 30) {
                this.view.inlay1T0.visible = true;
                this.view.inlay1T1.visible = true;
                this.view.inlay1.skin = "res/ui/hero/img_attribute_bg.png";
            }
            else {
                this.view.inlay1T0.visible = false;
                this.view.inlay1T1.visible = false;
                this.view.inlay1.skin = "res/ui/hero/img_not_attribute.png";
            }
        }
        onSkill(type) {
            console.log(this.cfg);
            let skill = ConfigManager.GetConfigByKey(CfgSkill, this.cfg.skillarr[type - 1]);
            this.view.skillMaskBg.visible = true;
            this.view.skillContent.visible = true;
            this.view.skillImg.skin = skill.img;
            this.view.skillName.text = skill.name;
            this.view.skill_txt1.text = skill.describe;
            this.view.skillType.skin = `res/ui/hero/img_skill_${type}.png`;
            let skillLv = SkillManager.getSkillLv(skill.id, this.cfg.id);
            let UpStar = SkillManager.getSkillLvUpStar(skill.id);
            this.view.skillLv.text = skillLv.toString();
            this.view.skill_txt2.innerHTML = `
        <div style = 'width:460px;height:110px;line-height:10px;'>
        <span style='font-size:16px;color:#ffd29e;padding:0 0 20px 0;line-height:10px;letter-spacing:1px;'>${skill.illustrate}</span><br/>
        <span style='font-size:16px;color:#ffd29e;padding:0 0 20px 0;line-height:10px;letter-spacing:1px;'>${skill.uplv2 + (skillLv >= 2 ? " (已解锁)" : `(${UpStar[0]}星解锁)`)}</span><br/>
        <span style='font-size:16px;color:#ffd29e;padding:0 0 20px 0;line-height:10px;letter-spacing:1px;'>${skill.uplv3 + (skillLv >= 3 ? " (已解锁)" : `(${UpStar[1]}星解锁)`)}</span><br/>
        </div>
        `;
        }
        hideSkill() {
            this.view.skillMaskBg.visible = false;
            this.view.skillContent.visible = false;
        }
        onBtnReplace() {
            this.replaceEquip(this.equipTowId[1], this.equipType);
        }
        onBtnRemove() {
            UnitManager.unwield(this.equipTowId[1], this.cfg.id);
        }
        replaceEquip(onlyId, type) {
            let career = this.cfg.career;
            let onlyIdArr = itemManager.selectTypeEquip(type, career);
            let goodsList = UserModel.getInstance().goodsList;
            let itemArr = [];
            if (onlyId !== null) {
                let showImg = goodsList.find(item => item.onlyId === onlyId);
                if (showImg) {
                    let cfg = ConfigManager.GetConfigByKey(CfgItem, showImg.id);
                    this.view.equipImg.visible = true;
                    this.view.equipImg.skin = cfg.img;
                    this.view.replaceEquipName.text = cfg.name;
                }
            }
            else {
                this.view.replaceEquipName.text = "暂无";
                this.view.equipImg.visible = false;
            }
            for (let i = 0; i < onlyIdArr.length; i++) {
                let equip = goodsList.find(item => item.onlyId === onlyIdArr[i]);
                if (equip) {
                    itemArr.push([equip.onlyId, this.cfg.id]);
                }
            }
            this.view.replaceList.array = itemArr;
            this.view.replaceContent.visible = true;
            this.view.replaceMaskBg.visible = true;
        }
        onReplaceMaskBg() {
            this.view.replaceMaskBg.visible = false;
            this.view.replaceContent.visible = false;
        }
        onBtnCloseEquip() {
            this.view.equipMaskBg.visible = false;
            this.view.equipContent.visible = false;
        }
        starNumber() {
            let goodsList = UserModel.getInstance().goodsList;
            let hero;
            this.view.btnUpStarLv.disabled = true;
            for (let i = 0; i < goodsList.length; i++) {
                let goodsid = goodsList[i].id;
                let cfg = ConfigManager.GetConfigByKey(CfgItem, goodsid);
                if (cfg.hero != null) {
                    cfg.hero === this.cfg.id ? hero = goodsList[i] : hero = null;
                    if (hero) {
                        if (hero.number >= 10) {
                            this.view.btnUpStarLv.disabled = false;
                        }
                        return;
                    }
                }
            }
            console.log("无当前英雄的碎片！");
        }
        onBtnUpStarLv() {
            let goodsList = UserModel.getInstance().goodsList;
            let hero;
            Message.show("当前英雄升星成功！");
            for (let i = 0; i < goodsList.length; i++) {
                let goodsid = goodsList[i].id;
                let cfg = ConfigManager.GetConfigByKey(CfgItem, goodsid);
                if (cfg.hero != null) {
                    cfg.hero === this.cfg.id ? hero = goodsList[i] : hero = null;
                    if (hero) {
                        console.log(hero);
                        hero.number -= 10;
                        UnitManager.heroStarUpLv(this.cfg.id);
                        this.showUpStar();
                        itemManager.clearModelGoodsList();
                        this.heroInfo();
                        return;
                    }
                }
            }
        }
        selected(num) {
            switch (num) {
                case 1:
                    this.selectState = Select$3.INFO;
                    break;
                case 2:
                    this.selectState = Select$3.EQUIP;
                    break;
                case 3:
                    this.selectState = Select$3.UPSTAR;
                    break;
                default:
                    break;
            }
            this.showSelectState();
        }
        showSelectState() {
            let img0 = "res/ui/comm/img_btn_select_0.png";
            let img1 = "res/ui/comm/img_btn_select_1.png";
            this.selectState == Select$3.INFO ? (this.view.btnInfo.skin = img1, this.view.HeroInfoNode1.visible = true,
                this.showInfoNode()) :
                (this.view.btnInfo.skin = img0, this.view.HeroInfoNode1.visible = false);
            this.selectState == Select$3.EQUIP ? (this.view.btnEquip.skin = img1, this.view.HeroInfoNode2.visible = true,
                this.showEquipNode()) :
                (this.view.btnEquip.skin = img0, this.view.HeroInfoNode2.visible = false);
            this.selectState == Select$3.UPSTAR ? (this.view.btnUpStar.skin = img1, this.view.HeroInfoNode3.visible = true,
                this.showUpStar()) :
                (this.view.btnUpStar.skin = img0, this.view.HeroInfoNode3.visible = false);
        }
        onBtnEquipUpLv() {
            UIMgr.show(UIDefine.UIEquipUpLvCtl, this.onlyId);
        }
        switchHero(num) {
            console.log(this.cfg.id);
            let heroList = UserModel.getInstance().heroList;
            let findIndex = heroList.findIndex(item => item.id === this.cfg.id);
            if (findIndex !== -1) {
                if (num === 1) {
                    findIndex !== 0 ? this.cfg = ConfigManager.GetConfigByKey(CfgHero, heroList[findIndex - 1].id) : this.cfg = ConfigManager.GetConfigByKey(CfgHero, heroList[heroList.length - 1].id);
                    this.showLeftData();
                    this.showInfoNode();
                    this.showEquipNode();
                    this.showUpStar();
                    this.heroInfo();
                }
                else if (num === 2) {
                    findIndex !== heroList.length - 1 ? this.cfg = ConfigManager.GetConfigByKey(CfgHero, heroList[findIndex + 1].id) : this.cfg = ConfigManager.GetConfigByKey(CfgHero, heroList[0].id);
                    this.showLeftData();
                    this.showInfoNode();
                    this.showEquipNode();
                    this.showUpStar();
                    this.heroInfo();
                }
            }
        }
    }

    class UIEquipInfoCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnCloseEquip, Laya.Event.CLICK, this.hide, null],
                [this.view.btnUpLv, Laya.Event.CLICK, this.onBtnUpLv, null]
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.EquipInfoUI;
        }
        onLoad() {
            this.view.equipList.itemRender = UIEquipGainItem;
            this.view.equipList.vScrollBarSkin = "";
            this.view.equipList.array = [];
            this.view.equipList.spaceY = 15;
        }
        onShow(onlyId) {
            this.onlyId = onlyId;
            this.getItemData(onlyId);
        }
        getItemData(onlyId) {
            let goodsList = UserModel.getInstance().goodsList;
            let goodsIndex = goodsList.findIndex(item => item.onlyId === onlyId);
            if (goodsIndex !== -1) {
                this.id = goodsList[goodsIndex].id;
                this.cfg = ConfigManager.GetConfigByKey(CfgItem, this.id);
                this.view.showEquipImg.skin = this.cfg.img;
                this.view.equipName.text = this.cfg.name;
                this.view.showEquipLv.text = "等级：" + goodsList[goodsIndex].lv + "/" + goodsList[goodsIndex].maxLv;
                this.view.equipDescribe.text = this.cfg.tip;
                let equipData = itemManager.equipData(onlyId);
                let obj = [
                    { equipKey: "生命值", equipValue: equipData.hp },
                    { equipKey: "攻击力", equipValue: equipData.aggress },
                    { equipKey: "防御力", equipValue: equipData.defense },
                ];
                this.showInlay(goodsList[goodsIndex].lv);
                this.view.equipList.array = obj;
            }
        }
        onBtnUpLv() {
            this.hide();
            UIMgr.show(UIDefine.UIEquipUpLvCtl, this.onlyId);
        }
        showInlay(lv) {
            if (lv >= 15) {
                this.view.inlay0T0.visible = true;
                this.view.inlay0T1.visible = true;
                this.view.inlay0.skin = "res/ui/hero/img_attribute_bg.png";
            }
            else {
                this.view.inlay0T0.visible = false;
                this.view.inlay0T1.visible = false;
                this.view.inlay0.skin = "res/ui/hero/img_not_attribute.png";
            }
            if (lv >= 30) {
                this.view.inlay1T0.visible = true;
                this.view.inlay1T1.visible = true;
                this.view.inlay1.skin = "res/ui/hero/img_attribute_bg.png";
            }
            else {
                this.view.inlay1T0.visible = false;
                this.view.inlay1T1.visible = false;
                this.view.inlay1.skin = "res/ui/hero/img_not_attribute.png";
            }
        }
    }

    class EquipUpLvItem extends ui.view.main.EquipUpLvItemUI {
        constructor() {
            super();
        }
        set dataSource(data) {
            if (data) {
                this.isSelect = data.select;
                this.index = data.index;
                let cfg = ConfigManager.GetConfigByKey(CfgItem, data.id);
                this.img.skin = cfg.img;
                this.on(Laya.Event.CLICK, this, this.onClick);
                this.itemMask.visible = this.isSelect;
                this.dg.visible = this.isSelect;
            }
        }
        onClick() {
            this.isSelect = !this.isSelect;
            this.itemMask.visible = this.isSelect;
            this.dg.visible = this.isSelect;
            let uplvItemNum = UserModel.getInstance().upLvItemNum;
            uplvItemNum[this.index].select = !uplvItemNum[this.index].select;
            UserModel.getInstance().upLvItemNum = uplvItemNum;
            itemManager.getMaterial();
        }
    }

    class UIEquipUpLvCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnCloseEquip, Laya.Event.CLICK, this.hide, null],
                [this.view.btnSelectAll, Laya.Event.CLICK, this.onBtnSelectAll, null],
                [this.gameDispatcher, EventName.USER_EQUIP_SELECT_ITEM, this.updataTxt, null],
                [this.view.btnUplv, Laya.Event.CLICK, this.onBtnUplv, null],
                [this.gameDispatcher, EventName.USER_SAVE_GOODS, this.updataView, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.main.EquipUpLvUI;
        }
        onLoad() {
            this.view.equipList.itemRender = UIEquipGainItem;
            this.view.materialList.itemRender = EquipUpLvItem;
            this.view.equipList.vScrollBarSkin = "";
            this.view.materialList.vScrollBarSkin = "";
            this.view.equipList.array = [];
            this.view.materialList.array = [];
            this.view.materialList.spaceX = 20;
            this.view.materialList.spaceY = 20;
            this.view.equipList.spaceY = 15;
        }
        onShow(onlyId) {
            this.view.dataTxt.text = "未选择任何材料";
            this.getEquipData(onlyId);
        }
        getEquipData(onlyId) {
            this.onlyId = onlyId;
            let goodsList = UserModel.getInstance().goodsList;
            let equip = goodsList.find(item => item.onlyId === onlyId);
            if (equip) {
                this.cfg = ConfigManager.GetConfigByKey(CfgItem, equip.id);
                this.view.equipName.text = this.cfg.name;
                this.view.showEquipImg.skin = this.cfg.img;
                this.view.showEquipLv.text = "等级：" + equip.lv + "/" + equip.maxLv;
                let equipData = itemManager.equipData(onlyId);
                let obj = [
                    { equipKey: "生命值", equipValue: equipData.hp },
                    { equipKey: "攻击力", equipValue: equipData.aggress },
                    { equipKey: "防御力", equipValue: equipData.defense },
                ];
                this.view.equipList.array = obj;
                if (equip.lv >= itemManager.maxLv) {
                    this.view.btnUplv.visible = false;
                    this.view.btnSelectAll.visible = false;
                    this.view.materialList.array = [];
                    this.view.dataTxt.text = "当前装备已满级";
                }
                else {
                    this.view.btnUplv.visible = true;
                    this.view.btnSelectAll.visible = true;
                    itemManager.getUpLvGoodsNum();
                    this.view.materialList.array = UserModel.getInstance().upLvItemNum;
                }
            }
        }
        onBtnSelectAll() {
            itemManager.selectItemAll();
            this.view.materialList.array = UserModel.getInstance().upLvItemNum;
            itemManager.getMaterial();
        }
        updataTxt() {
            let useItemArr = UserModel.getInstance().useItemArr;
            let lv = itemManager.showuplv(UserModel.getInstance().useItemArr.num, this.onlyId);
            this.view.dataTxt.text = `消耗【${useItemArr.num}】升级到：${lv}级`;
        }
        onBtnUplv() {
            itemManager.equipUpLv(UserModel.getInstance().useItemArr.num, this.onlyId);
            itemManager.clearModelGoodsList();
            itemManager.getUpLvGoodsNum();
            this.view.materialList.array = UserModel.getInstance().upLvItemNum;
            this.view.dataTxt.text = "未选择任何材料";
        }
        updataView() {
            this.getEquipData(this.onlyId);
        }
    }

    class UICallHeroCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnCall, Laya.Event.CLICK, this.onBtnCall, null],
                [this.view.maskBg, Laya.Event.CLICK, this.onMaskBg, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
                this.view.conpletContent.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/main.atlas",
                "res/atlas/res/ui/comm.atlas"
            ];
        }
        uiView() {
            return ui.view.main.CallHeroUI;
        }
        onLoad() {
            this.view.list.itemRender = listItem;
            this.view.list.vScrollBarSkin = "";
        }
        onShow(argc) {
            UnitManager.drawCardTime(false);
            this.view.conpletContent.visible = false;
            this.view.maskBg.visible = false;
            this.showHaveCardNum();
            this.todayDrawCardNum();
            this.showList();
        }
        onBtnCall() {
            let drawCardNum = ItemModel.getInstance().drawCardNum;
            if (drawCardNum === 50) {
                Message.show("今日抽卡次数已用完");
                return;
            }
            let goodsList = UserModel.getInstance().goodsList;
            let cardsIndex = goodsList.findIndex(item => item.id === 1001);
            if (cardsIndex !== -1) {
                if (goodsList[cardsIndex].number > 0) {
                    UnitManager.drawCardTime();
                    let drawCards;
                    let card;
                    goodsList[cardsIndex].number--;
                    ItemModel.getInstance().drawCardNum++;
                    drawCardNum = ItemModel.getInstance().drawCardNum;
                    this.showHaveCardNum();
                    this.todayDrawCardNum();
                    UserModel.getInstance().goodsList = goodsList;
                    if (drawCardNum == 50) {
                        card = UnitManager.mustGoOutHero();
                        this.view.showImg.skin = card.img;
                        this.view.itemName.text = card.name;
                    }
                    else {
                        drawCards = UnitManager.drawCards();
                        this.view.showImg.skin = drawCards[0].img;
                        this.view.itemName.text = drawCards[0].name;
                    }
                    Laya.loader.load(this.view.showImg.skin, Laya.Handler.create(this, () => {
                        if (this.view.showImg.height > 300) {
                            let s = 300 / this.view.showImg.height;
                            this.view.showImg.scale(s, s);
                        }
                        else if (this.view.showImg.height < 150) {
                            let s = 150 / this.view.showImg.height;
                            this.view.showImg.scale(s, s);
                        }
                    }));
                    this.view.conpletContent.visible = true;
                    this.view.maskBg.visible = true;
                    this.rotateAnim();
                }
                else {
                    Message.show("材料不足");
                }
            }
            else {
                Message.show("材料不足");
            }
        }
        showHaveCardNum() {
            let goodsList = UserModel.getInstance().goodsList;
            let cardsIndex = goodsList.find(item => item.id === 1001);
            if (cardsIndex) {
                this.view.haveCard.text = `(剩余抽卡券：${cardsIndex.number})`;
            }
            else {
                this.view.haveCard.text = `(剩余抽卡券：0)`;
            }
        }
        todayDrawCardNum() {
            let maxCardNum = ItemModel.getInstance().maxCardNum;
            let drawCardNum = ItemModel.getInstance().drawCardNum;
            this.view.showDrawCard.text = `今日抽卡：${drawCardNum}/${maxCardNum}(${maxCardNum}抽必出英雄)`;
        }
        rotateAnim() {
            Laya.Tween.to(this.view.rotateImg, { rotation: 360 }, 5000);
            Laya.timer.loop(5000, this, () => {
                this.view.rotateImg.rotation = 0;
                Laya.Tween.to(this.view.rotateImg, { rotation: 360 }, 5000);
            });
        }
        onMaskBg() {
            this.view.conpletContent.visible = false;
            this.view.maskBg.visible = false;
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this.view.rotateImg);
            this.view.rotateImg.rotation = 0;
        }
        showList() {
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            let heroList = [];
            cfgHero.forEach(element => {
                let item = { heroName: element.name };
                heroList.push(item);
            });
            this.view.list.array = heroList;
        }
    }
    class listItem extends Laya.Image {
        set dataSource(data) {
            if (data) {
                this.height = 20;
                this.txt = new Laya.Label;
                this.addChild(this.txt);
                this.txt.fontSize = 20;
                let drawProbability = UnitManager.drawProbability();
                this.txt.text = data.heroName + "概率：" + drawProbability + "%";
            }
        }
    }

    class UIEndLessFightGame extends ui.view.game.EndLessFightGameUI {
        constructor() {
            super(...arguments);
            this.randomTest = 0;
            this.characterPosSelf = [
                [[20, 249]],
                [[32, 118], [32, 399]],
                [[14, 84], [77, 238], [14, 401]],
                [[521, 609], [307, 621], [519, 422], [296, 416]]
            ];
            this.characterPosOther = [
                [[943, 495]],
                [[1051, 589], [1051, 375]],
                [[868, 632], [1036, 500], [868, 348]],
                [[855, 632], [1046, 620], [868, 348], [1046, 325]]
            ];
            this.selfIdArr = [];
        }
        init() {
            this.randomTest = RandomUtil.randomInt(0, 9999);
            GameDispatcher.getInstance().on(EventName.GAME_NEXT_WAVE_ENDLESS, this, this.updataOther);
            GameDispatcher.getInstance().on(EventName.GAME_SELECT_HERO, this, this.pushId);
            if (this.peopleRoot) {
                this.peopleRoot.destroy(true);
            }
            this.peopleRoot = new Laya.Sprite;
            this.addChild(this.peopleRoot);
            Game.endLessFightGame.init();
            this.showAllCharacters();
        }
        showAllCharacters() {
            Game.endLessFightGame.fightData.currentWave = 0;
            let enemyArr = Game.endLessMgr.getRandomMansterArr();
            for (const key in enemyArr) {
                let item = new UICharacter;
                item.setData(enemyArr[key][0], 2, enemyArr[key][1]);
                this.peopleRoot.addChild(item);
                let x = this.characterPosOther[enemyArr.length - 1][key][0];
                let y = this.characterPosOther[enemyArr.length - 1][key][1];
                item.setPos(x, y);
                let num = parseInt(key);
                item.initZOrder = -(num);
                item.zOrder = -(num);
                Game.endLessFightGame.fightData.otherArr.push(item);
            }
            let fightHeroList = UserModel.getInstance().fightHeroList;
            Laya.timer.frameOnce(3, this, () => {
                UserModel.getInstance().fightHeroList = fightHeroList;
            });
            Game.endLessFightGame.start();
            Game.endLessMgr.getMonsterPower();
        }
        pushId() {
            console.log("英雄上场" + this.randomTest);
            Game.endLessFightGame.clearSelfArr();
            this.selfIdArr = UserModel.getInstance().fightHeroList;
            let dataArr = [];
            this.selfIdArr.forEach(element => {
                let cfgHero = ConfigManager.GetConfigByKey(CfgHero, element);
                if (cfgHero == undefined) {
                    dataArr.push(null);
                }
                else {
                    dataArr.push(cfgHero.id);
                }
            });
            for (let i = 0; i < dataArr.length; i++) {
                if (dataArr[i]) {
                    Laya.timer.frameOnce(i * 3, this, () => {
                        let item = new UICharacter();
                        item.setData(dataArr[i], 1);
                        this.peopleRoot.addChild(item);
                        let x = this.characterPosSelf[3][i][0];
                        let y = this.characterPosSelf[3][i][1];
                        item.anchorX = 0.5;
                        item.anchorY = 1;
                        item.initZOrder = -(i);
                        item.zOrder = -(i);
                        item.setPos(x, y);
                        Game.endLessFightGame.fightData.selfArr.push(item);
                        item.on(Laya.Event.CLICK, this, () => {
                            let fightHeroList = UserModel.getInstance().fightHeroList;
                            item.destroy();
                            fightHeroList[i] = null;
                            UserModel.getInstance().fightHeroList = fightHeroList.concat([]);
                            GameDispatcher.getInstance().event(EventName.GAME_REFRESH_LIST);
                        });
                    });
                }
            }
        }
        updataOther() {
            console.log("生成下一波怪物");
            let otherArr = Game.endLessFightGame.fightData.otherArr;
            for (let i = 0; i < otherArr.length; i++) {
                otherArr[i].removeSelf();
            }
            Game.endLessFightGame.fightData.otherArr = [];
            let enemyArr = Game.endLessMgr.getRandomMansterArr();
            let selfArr = Game.endLessFightGame.fightData.selfArr;
            Game.endLessMgr.clearOld(() => { console.log(5); });
            for (let i = 0; i < selfArr.length; i++) {
                if (!selfArr[i].isDie) {
                    selfArr[i].pos(selfArr[i].initPos.x, selfArr[i].initPos.y);
                    selfArr[i].unitSk.play("stand", true);
                    selfArr[i].unitSk.scale(0.45, 0.45);
                }
            }
            for (const key in enemyArr) {
                let item = new UICharacter;
                item.setData(enemyArr[key][0], 2, enemyArr[key][1]);
                this.peopleRoot.addChild(item);
                let x = this.characterPosOther[enemyArr.length - 1][key][0];
                let y = this.characterPosOther[enemyArr.length - 1][key][1];
                item.setPos(x, y);
                let num = parseInt(key);
                item.initZOrder = -(num);
                item.zOrder = -(num);
                Laya.Tween.from(item, { x: 1200, y: 600 }, 750, Laya.Ease.backOut, Laya.Handler.create(this, () => {
                    console.log("新敌人已经涌入战场，敌方开始战斗");
                }));
                Game.endLessFightGame.fightData.otherArr.push(item);
            }
            Game.endLessMgr.getMonsterPower();
            Laya.timer.once(1000, this, () => {
                Game.endLessFightGame.switchSelectMonster();
                Game.endLessMgr.startBattle();
            });
        }
        clear() {
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            GameDispatcher.getInstance().off(EventName.GAME_NEXT_WAVE_ENDLESS, this, this.updataOther);
            GameDispatcher.getInstance().off(EventName.GAME_SELECT_HERO, this, this.pushId);
        }
    }

    class UIEndLessHeroAvatarItem extends ui.view.game.HeroAvatarItemUI {
        constructor() {
            super();
            this.isLock = true;
        }
        set dataSource(id) {
            if (id) {
                let cfg = ConfigManager.GetConfigByKey(CfgHero, id);
                let heroList = UserModel.getInstance().heroList;
                let findHero = heroList.find(item => item.id === id);
                this.id = id;
                if (findHero) {
                    this.lvNum = findHero.lv;
                    this.isLock = false;
                    this.isLockBg.visible = false;
                    this.lock.visible = false;
                }
                else {
                    this.lvNum = 1;
                    this.isLock = true;
                    this.isLockBg.visible = true;
                    this.lock.visible = true;
                }
                this.lv.text = this.lvNum + "级";
                this.avatar.skin = cfg.avatar;
                this.frame.skin = `res/game/heroavatar/frame_${cfg.type}.png`;
                this.type = cfg.type;
                this.img = cfg.img;
                let isExist = this.IsExistId(this.id);
                if (isExist) {
                    this.blackMask.visible = true;
                    this.dagou.visible = true;
                    this.isSelected = true;
                }
                else {
                    this.blackMask.visible = false;
                    this.dagou.visible = false;
                    this.isSelected = false;
                }
                this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                GameDispatcher.getInstance().on(EventName.GAME_REFRESH_LIST, this, this.onMouseUp);
            }
        }
        IsExistId(id) {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            let findIndex = fightHeroList.findIndex(num => num === id);
            if (findIndex != -1) {
                return true;
            }
            else {
                return false;
            }
        }
        onClick() {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            let findIndex = fightHeroList.findIndex(num => num === this.id);
            if (findIndex != -1) {
                fightHeroList[findIndex] = null;
            }
            else {
                let isNull = false;
                for (let i = 0; i < fightHeroList.length; i++) {
                    if (fightHeroList[i] == null) {
                        fightHeroList[i] = this.id;
                        isNull = true;
                        break;
                    }
                }
                if (fightHeroList.length < 4) {
                    !isNull ? fightHeroList.push(this.id) : null;
                }
            }
            UserModel.getInstance().fightHeroList = fightHeroList.concat([]);
        }
        onMouseDown(event) {
            if (this.isLock) {
                Message.show("当前英雄未解锁");
                return;
            }
            if (!this.isSelected) {
                Game.endLessFightGame.fightData.setAvatarId(this.id);
                GameDispatcher.getInstance().event(EventName.GAME_DRAG_AVATAR, [event]);
                this.isSelected = true;
            }
        }
        onMouseUp() {
            let isExist = this.IsExistId(this.id);
            if (isExist) {
                this.blackMask.visible = true;
                this.dagou.visible = true;
                this.isSelected = true;
            }
            else {
                this.blackMask.visible = false;
                this.dagou.visible = false;
                this.isSelected = false;
            }
        }
    }

    class UIEndLessRoleAvatar extends ui.view.game.RoleAvatarUI {
        constructor() {
            super();
            this.angle = -89.9;
            this.cd = 0;
        }
        set dataSource(data) {
            if (data) {
            }
        }
        setData(cfg) {
            if (cfg) {
                this.cfg = cfg;
                this.angle = -89.9;
                this.cd = 0;
                this.type = cfg.type;
                this.avatar.skin = cfg.gameavatar;
                this.frame.skin = `res/ui/game/heroFrame${this.type}.png`;
                this.heroId = cfg.id;
                this.cdMask.graphics.clear();
                let selfArr = Game.endLessFightGame.fightData.selfArr;
                for (let i = 0; i < selfArr.length; i++) {
                    if (selfArr[i].id == this.cfg.id) {
                        this.hero = selfArr[i];
                        break;
                    }
                }
                this.runAround();
                this.on(Laya.Event.CLICK, this, this.onClick);
                console.log("创建技能");
            }
        }
        clearData() {
            this.cfg = null;
            this.hero = null;
            this.type = null;
            this.heroId = null;
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.destroy();
        }
        runAround() {
            let hero = Game.endLessFightGame.fightData.selfArr.find(item => item.id === this.heroId);
            console.log(hero.isDie);
            if (hero.isDie) {
                this.offAll();
                this.angle = -89.9;
                this.cdMask.graphics.clear();
                this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                return;
            }
            if (this.angle == -90) {
                return;
            }
            let s = 10;
            let ms = s * 1000;
            let round = 360;
            let num = Math.floor(ms / round);
            for (let i = 0; i < round; i++) {
                Laya.timer.once(num * i, this, () => {
                    if (this.cd < round) {
                        this.cd++;
                    }
                    this.angle += 1;
                    this.hero.mpMask.width = Math.floor((this.cd / round) * this.hero.mp.width);
                    if (this.angle < 270) {
                        this.cdMask.graphics.clear();
                        this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                    }
                    else {
                        Laya.timer.clearAll(this);
                        this.angle = -90;
                        this.cdMask.graphics.clear();
                        this.cdMask.graphics.drawPie(35, 35, 35, this.angle, -90, "#000");
                        return;
                    }
                });
            }
        }
        onClick() {
            if (Game.round == 2) {
                console.log("目前为敌方回合,禁止使用英雄技能");
                Message.show("无法在敌方回合使用技能");
                return;
            }
            if (this.angle !== -90) {
                console.log("在冷却中");
                return;
            }
            let skill;
            skill = new SkillAll();
            let getV = Game.endLessMgr.activeSkillMap.get(this.hero.cfg.useskillarr[0]);
            if (!skill[`${getV}`]) {
                Message.show("技能制作中...");
                return;
            }
            Game.endLessMgr.addHeroSkill(this.heroId, () => {
                this.angle = -89.9;
                this.cd = 0;
                this.cdMask.graphics.clear();
                this.cdMask.graphics.drawPie(50, 50, 53, this.angle, -90, "#000");
            });
        }
    }

    var SelectType$1;
    (function (SelectType) {
        SelectType[SelectType["ALL"] = 1] = "ALL";
        SelectType[SelectType["YELLOW"] = 2] = "YELLOW";
        SelectType[SelectType["BLUE"] = 3] = "BLUE";
        SelectType[SelectType["RED"] = 4] = "RED";
        SelectType[SelectType["GREEN"] = 5] = "GREEN";
    })(SelectType$1 || (SelectType$1 = {}));
    class UIEndLessGameCtl extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.type = SelectType$1.ALL;
            this.heroArr = [];
            this.avatarArr = [];
        }
        uiEventList() {
            return [
                [this.view.btnStop, Laya.Event.CLICK, this.onBtnStop, null],
                [this.view.btnStop2, Laya.Event.CLICK, this.onBtnStop, null],
                [this.view.btnAll, Laya.Event.CLICK, this.selectType, [1]],
                [this.view.btnYellow, Laya.Event.CLICK, this.selectType, [2]],
                [this.view.btnBlue, Laya.Event.CLICK, this.selectType, [3]],
                [this.view.btnRed, Laya.Event.CLICK, this.selectType, [4]],
                [this.view.btnGreen, Laya.Event.CLICK, this.selectType, [5]],
                [this.view.btnStartGame, Laya.Event.CLICK, this.onBtnStartGame, null],
                [this.gameDispatcher, EventName.GAME_DRAG_AVATAR, this.onMoveDrag, null],
                [this.gameDispatcher, EventName.GAME_NOT_HERO, this.notHaveHeroOnSite, null],
                [this.gameDispatcher, EventName.GAME_NEXT_WAVE_ENDLESS, this.updataShowWave, null],
                [this.gameDispatcher, EventName.GAME_SHOW_OTHER_POWER, this.showOtherPower, null],
            ];
        }
        uiResList() {
            return [
                "res/atlas/res/ui/game.atlas",
            ];
        }
        onHide() {
            GameModel.getInstance().gameOver();
            for (let i = 0; i < this.avatarArr.length; i++) {
                this.avatarArr[i].clearData();
            }
            this.avatarArr = [];
            this.endLessFightGame.clear();
            this.endLessFightGame.destroy();
            console.log("this.endLessFightGame==>", this.endLessFightGame);
        }
        uiView() {
            return ui.view.game.EndlessGameUI;
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        onLoad() {
            this.view.heroList.itemRender = UIEndLessHeroAvatarItem;
            this.view.heroList.vScrollBarSkin = "";
            this.view.heroList.array = [];
            this.view.heroList.repeatX = 5;
            this.view.heroList.spaceX = 5;
            this.view.heroList.spaceY = 20;
        }
        showAvatar() {
            this.avatarArr = [];
            for (let i = 0; i < 4; i++) {
                let item = new UIEndLessRoleAvatar;
                this.view.content.addChild(item);
                item.x = i * 10 + 94 * i + 40 * i;
                item.y = 599;
                this.avatarArr.push(item);
            }
        }
        onShow(argc) {
            this.endLessFightGame = new UIEndLessFightGame();
            this.view.content.addChild(this.endLessFightGame);
            this.showAvatar();
            SoundManager.playGameBgm();
            GameMgr.init();
            this.view.btnStop.visible = false;
            Game.round = 1;
            this.view.selectHero.visible = true;
            this.view.btnStartGame.visible = true;
            Game.endLessMgr.clearOld(() => { console.log(6); });
            Game.endLessMgr.clearNow = false;
            this.endLessFightGame.init();
            this.hideAvatar();
            this.gameStart();
            this.updataShowWave();
        }
        hideAvatar() {
            this.avatarArr.forEach(item => { item.visible = false; });
        }
        gameStart() {
            this.heroArr = [];
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            cfgHero.forEach(item => {
                this.heroArr.push(item);
            });
            let fightHeroList = UserModel.getInstance().fightHeroList;
            fightHeroList.forEach(num => {
                if (num !== null) {
                    this.view.btnStartGame.disabled = false;
                    this.playBtnAnim();
                }
            });
            this.showItemType();
        }
        updataShowWave() {
            this.view.waveTxt.text = "无尽模式 第" + (Game.endLessFightGame.fightData.currentWave + 1) + "关";
        }
        onBtnStop() {
            MessageBox.show("现在退出将不会获得任何奖励，确认要退出吗？", "确认", Laya.Handler.create(this, () => {
                this.hide();
                UIMgr.show(UIDefine.UIMainCtl);
                GameDispatcher.getInstance().event(EventName.GAME_RETURN_ENDLSEE);
                Game.endLessFightGame.fightData.clearUnit();
                Game.endLessMgr.clearOld(() => { console.log(7); });
            }), "取消", Laya.Handler.create(this, () => { }));
        }
        onMoveDrag(event) {
            if (this.dragSk) {
                this.dragSk.removeSelf();
            }
            this.dragSk = new Laya.Skeleton();
            console.log(Game.endLessFightGame.fightData.clickItemId);
            if (!Game.endLessFightGame.fightData.clickItemId) {
                return;
            }
            let cfghero = ConfigManager.GetConfigByKey(CfgHero, Game.endLessFightGame.fightData.clickItemId);
            this.dragSk.load(cfghero.skurl, Laya.Handler.create(this, () => {
                this.dragSk.url = cfghero.skurl;
                this.dragSk.scale(0.45, 0.45);
                Laya.timer.frameOnce(2, this, () => {
                    this.dragSk.play("stand", true);
                    this.view.content.addChild(this.dragSk);
                    let pos = new Laya.Point();
                    pos.setTo(event.stageX, event.stageY);
                    let pos2 = this.view.content.globalToLocal(pos);
                    this.dragSk.pos(pos2.x, pos2.y);
                    Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
                    Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
                    Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
                });
            }));
        }
        onMouseMove(e) {
            let pos2 = new Laya.Point(e.stageX, e.stageY);
            let pos = this.view.content.globalToLocal(pos2);
            this.dragSk.pos(pos.x, pos.y);
        }
        onMouseUp(e) {
            let pos = new Laya.Point(e.stageX, e.stageY);
            let isHit_1 = this.view.hit_1.hitTestPoint(pos.x, pos.y);
            let isHit_2 = this.view.hit_2.hitTestPoint(pos.x, pos.y);
            let isHit_3 = this.view.hit_3.hitTestPoint(pos.x, pos.y);
            let isHit_4 = this.view.hit_4.hitTestPoint(pos.x, pos.y);
            this.view.btnStartGame.disabled = false;
            let fightHeroList = UserModel.getInstance().fightHeroList;
            this.dragSk.removeSelf();
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
            Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            if (isHit_1) {
                fightHeroList[0] = Game.endLessFightGame.fightData.clickItemId;
            }
            else if (isHit_2) {
                fightHeroList[1] = Game.endLessFightGame.fightData.clickItemId;
            }
            else if (isHit_3) {
                fightHeroList[2] = Game.endLessFightGame.fightData.clickItemId;
            }
            else if (isHit_4) {
                fightHeroList[3] = Game.endLessFightGame.fightData.clickItemId;
            }
            UserModel.getInstance().fightHeroList = fightHeroList;
            this.showItemType();
            this.herolistIsNull();
        }
        onBtnStartGame() {
            this.view.btnStop.visible = true;
            this.view.btnStartGame.visible = false;
            this.view.selectHero.visible = false;
            this.getPnlList(UserModel.getInstance().fightHeroList);
            GameDispatcher.getInstance().event(EventName.GAME_START);
            Game.endLessMgr.setSkillMap();
            Game.endLessMgr.showMave();
            Game.round == 1;
            Game.endLessMgr.startBattle();
        }
        getPnlList(data) {
            let itemArr = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    for (let j = 0; j < this.avatarArr.length; j++) {
                        if (!this.avatarArr[j].cfg) {
                            this.avatarArr[j].visible = true;
                            let cfgHero = ConfigManager.GetConfigByKey(CfgHero, data[i]);
                            this.avatarArr[j].setData(cfgHero);
                            itemArr.push(this.avatarArr[j]);
                            break;
                        }
                    }
                }
                else {
                    this.avatarArr[i].visible = false;
                }
            }
            HeroAvatar.getInstance().setEndLessAvatarDataList(itemArr);
            console.log(this.avatarArr);
        }
        playBtnAnim(isRun = true) {
            if (!isRun) {
                Laya.Tween.clearAll(this);
                Laya.timer.clearAll(this);
                this.view.btnStartGame.scale(1, 1);
                return;
            }
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.view.btnStartGame.scale(1, 1);
            Laya.Tween.to(this.view.btnStartGame, { scaleX: 1.1, scaleY: 1.1 }, 1000);
            Laya.timer.once(1000, this, () => {
                Laya.Tween.to(this.view.btnStartGame, { scaleX: 1, scaleY: 1 }, 1000);
            });
            Laya.timer.loop(2000, this, () => {
                Laya.Tween.to(this.view.btnStartGame, { scaleX: 1.1, scaleY: 1.1 }, 1000);
                Laya.timer.once(1000, this, () => {
                    Laya.Tween.to(this.view.btnStartGame, { scaleX: 1, scaleY: 1 }, 1000);
                });
            });
        }
        herolistIsNull() {
            let fightHeroList = UserModel.getInstance().fightHeroList;
            for (let i = 0; i < fightHeroList.length; i++) {
                if (fightHeroList[i] !== null) {
                    this.view.btnStartGame.disabled = false;
                    return;
                }
            }
            this.view.btnStartGame.disabled = true;
            this.playBtnAnim(false);
        }
        notHaveHeroOnSite() {
            this.view.btnStartGame.disabled = true;
            this.playBtnAnim(false);
        }
        showOtherPower(powerAll) {
            console.log(powerAll);
            this.view.power.text = powerAll.toString();
        }
        selectType(num) {
            switch (num) {
                case 1:
                    this.type = SelectType$1.ALL;
                    break;
                case 2:
                    this.type = SelectType$1.YELLOW;
                    break;
                case 3:
                    this.type = SelectType$1.BLUE;
                    break;
                case 4:
                    this.type = SelectType$1.RED;
                    break;
                case 5:
                    this.type = SelectType$1.GREEN;
                    break;
                default: break;
            }
            this.showItemType();
        }
        showItemType() {
            this.type == SelectType$1.ALL ? this.view.btnAll.skin = "res/ui/game/selectBg.png" : this.view.btnAll.skin = "";
            this.type == SelectType$1.YELLOW ? this.view.btnYellow.skin = "res/ui/game/selectBg.png" : this.view.btnYellow.skin = "";
            this.type == SelectType$1.BLUE ? this.view.btnBlue.skin = "res/ui/game/selectBg.png" : this.view.btnBlue.skin = "";
            this.type == SelectType$1.RED ? this.view.btnRed.skin = "res/ui/game/selectBg.png" : this.view.btnRed.skin = "";
            this.type == SelectType$1.GREEN ? this.view.btnGreen.skin = "res/ui/game/selectBg.png" : this.view.btnGreen.skin = "";
            let arr = [];
            for (let i = 0; i < this.heroArr.length; i++) {
                if (this.type == SelectType$1.YELLOW && this.heroArr[i].type == 1) {
                    arr.push(this.heroArr[i].id);
                }
                else if (this.type == SelectType$1.BLUE && this.heroArr[i].type == 2) {
                    arr.push(this.heroArr[i].id);
                }
                else if (this.type == SelectType$1.RED && this.heroArr[i].type == 3) {
                    arr.push(this.heroArr[i].id);
                }
                else if (this.type == SelectType$1.GREEN && this.heroArr[i].type == 4) {
                    arr.push(this.heroArr[i].id);
                }
                else if (this.type == SelectType$1.ALL) {
                    arr.push(this.heroArr[i].id);
                }
            }
            let heroList = UserModel.getInstance().heroList;
            let haveHero = [];
            for (let i = 0; i < arr.length; i++) {
                heroList.forEach(item => {
                    if (item.id == arr[i]) {
                        haveHero.push(item.id);
                    }
                });
            }
            for (let i = 0; i < haveHero.length; i++) {
                let index = arr.findIndex(item => item === haveHero[i]);
                if (index !== -1) {
                    arr.splice(index, 1);
                }
            }
            arr.unshift(...haveHero);
            this.view.heroList.array = arr;
        }
    }

    class UIEndLessGameWinCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.bg, Laya.Event.CLICK, this.onBg, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.game.EndLessGameWinUI;
        }
        onLoad() {
            this.view.list.itemRender = UIBagItem;
            this.view.list.vScrollBarSkin = "";
            this.view.list.array = [];
            this.view.list.spaceX = 20;
            this.view.list.spaceY = 20;
        }
        onShow(lv) {
            this.addItem(lv);
        }
        addItem(lv) {
            let itemArr = [];
            let addItem;
            if (Game.isEndLessMode == 2) {
                addItem = itemManager.getLevelItemEndLess();
            }
            else {
                addItem = itemManager.getLevelItem();
            }
            addItem.forEach(item => {
                itemArr.push({ id: item[0], number: item[1] });
                itemManager.addItem(item[0], item[1]);
            });
            this.view.list.array = itemArr;
        }
        onBg() {
            this.hide();
            UIMgr.hide(UIDefine.UIGameCtl);
            UIMgr.hide(UIDefine.UIEndLessGameCtl);
            UIMgr.show(UIDefine.UIMainCtl, []);
        }
    }

    class SDKUtils {
        static getUserName() {
            if (Laya.Render.isConchApp) {
                let name = SDKUtils.PlatformClass.createClass("demo.YoungSDK").call("getUserName");
                return name;
            }
        }
        static billing(n) {
            if (Laya.Render.isConchApp) {
                let b = SDKUtils.PlatformClass.createClass("demo.YoungSDK").call("billing", n);
                return b;
            }
            return false;
        }
    }
    SDKUtils.PlatformClass = window["PlatformClass"];

    class UISettingCtl extends UIBaseCtl {
        uiEventList() {
            return [
                [this.view.btnClose, Laya.Event.CLICK, this.hide, null],
                [this.view.btnMusic, Laya.Event.CLICK, this.onBtnMusic, null],
                [this.view.btnSound, Laya.Event.CLICK, this.onBtnSound, null],
                [this.view.btnExit, Laya.Event.CLICK, this.onBtnExit, null],
            ];
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        uiResList() {
            return [
                "res/atlas/res/ui/setting.atlas",
            ];
        }
        uiView() {
            return ui.view.setting.SettingUI;
        }
        onLoad() {
        }
        onShow(argc) {
            AudioMgr.isOpenMusic ? this.view.btnMusic.skin = "res/ui/setting/btn0.png" : this.view.btnMusic.skin = "res/ui/setting/btn1.png";
            AudioMgr.isOpenSound ? this.view.btnSound.skin = "res/ui/setting/btn0.png" : this.view.btnSound.skin = "res/ui/setting/btn1.png";
        }
        onBtnMusic() {
            AudioMgr.isOpenMusic = !AudioMgr.isOpenMusic;
            AudioMgr.isOpenMusic ? (this.view.btnMusic.skin = "res/ui/setting/btn0.png", SoundManager.playMainBgm()) : this.view.btnMusic.skin = "res/ui/setting/btn1.png";
        }
        onBtnSound() {
            AudioMgr.isOpenSound = !AudioMgr.isOpenSound;
            AudioMgr.isOpenSound ? this.view.btnSound.skin = "res/ui/setting/btn0.png" : this.view.btnSound.skin = "res/ui/setting/btn1.png";
        }
        onBtnExit() {
            if (Laya.Render.isConchApp) {
                SDKUtils.PlatformClass.createClass("demo.YoungSDK").call("exitGame");
            }
        }
    }

    class Debug extends UIBaseCtl {
        constructor() {
            super(...arguments);
            this.cfgListMonster = [];
            this.cfgListHero = [];
            this.selectIndex = 0;
            this.isHero = false;
        }
        uiEventList() {
            return [
                [this.view.btnLeft, Laya.Event.CLICK, this.onBtn, [0]],
                [this.view.btnRight, Laya.Event.CLICK, this.onBtn, [1]],
                [this.view.btnSwitch, Laya.Event.CLICK, this.onBtnSwitch, null],
            ];
        }
        uiResList() {
            return [];
        }
        uiView() {
            return ui.view.game.debugUI;
        }
        onLoad() {
        }
        onAdapter(w, h) {
            if (w / h < 1334 / 750) {
                let s = (w / h) / (1334 / 750);
                this.view.content.scale(s, s);
            }
        }
        onHide() {
        }
        onShow(argc) {
            Game.Debug = true;
            let cfgMonster = ConfigManager.GetConfig(CfgMonster);
            let cfgHero = ConfigManager.GetConfig(CfgHero);
            cfgMonster.forEach(item => {
                this.cfgListMonster.push(item);
            });
            cfgHero.forEach(item => {
                this.cfgListHero.push(item);
            });
            this.Character = new UICharacter;
            this.view.content.addChild(this.Character);
            this.Character.pos(0, 0);
            this.Character.setData(this.cfgListMonster[this.selectIndex].id, 2, 1);
        }
        onBtn(btn) {
            if (btn == 0) {
                this.selectIndex > 0 ? this.selectIndex-- : Message.show("这是第一个");
            }
            else {
                if (this.isHero) {
                    this.selectIndex < this.cfgListHero.length - 1 ? this.selectIndex++ : Message.show("这是最后一个");
                }
                else {
                    this.selectIndex < this.cfgListMonster.length - 1 ? this.selectIndex++ : Message.show("这是最后一个");
                }
            }
            if (this.isHero) {
                console.log(this.cfgListHero[this.selectIndex]);
                this.Character.setData(this.cfgListHero[this.selectIndex].id, 1);
            }
            else {
                console.log(this.cfgListMonster[this.selectIndex]);
                this.Character.setData(this.cfgListMonster[this.selectIndex].id, 2, 1);
            }
        }
        onBtnSwitch() {
            this.isHero = !this.isHero;
            this.selectIndex = 0;
            this.onBtn(0);
        }
    }

    class GameLoader extends Singleton {
        start() {
            if (Laya.Browser.onPC) {
                Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
            }
            else {
                Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
            }
            this.initAppConfig();
        }
        async initAppConfig() {
            await AppConfig.init();
            UIMgr.loadBG("loading/whiteMask.png");
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
            this.loadUIJson();
        }
        loadUIJson() {
            Laya.loader.load("loading/ui.json", Laya.Handler.create(this, this.onUIJsonLoaded));
        }
        async onUIJsonLoaded() {
            Laya.Scene.setUIMap("loading/ui.json");
            LoadingView.progress(0);
            AppConfig.userName = "2feiji_3";
            if (Laya.Render.isConchApp) {
                AppConfig.userName = SDKUtils.getUserName();
            }
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
                        console.log("分包加载失败");
                    }
                });
            }
            else {
                this.onLoginCallback();
            }
        }
        onLoginCallback() {
            LoadingView.progress(20);
            ConfigManager.loadAllConfigFile(Laya.Handler.create(this, this.preloadingImage), Laya.Handler.create(this, this.onTableLoadedProgress));
        }
        onTableLoadedProgress(p) { }
        preloadingImage() {
            let arr = [
                "res/atlas/res/ui/comm.atlas",
                "res/atlas/res/ui/messagebox.atlas",
            ];
            Laya.loader.load(arr, Laya.Handler.create(this, this.preloadingUI));
        }
        preloadFont() {
            let ttfloader = new Laya.TTFLoader();
            ttfloader.load("res/font/FZCY.ttf");
            ttfloader.fontName = "FZCuYuan-M03S";
            ttfloader.err = Laya.Handler.create(this, () => {
                console.log("加载失败ubuntu-bold.ttf");
            });
            FontUtil.registerBitMapFont("tt2", "res/font/tt2.fnt", () => {
                FontUtil.registerBitMapFont("tt", "res/font/tt.fnt", () => {
                    this.preloadingUI();
                });
            });
        }
        preloadingUI() {
            UIMgr.registerUI(UIDefine.UILoginCtl, UILoginCtl);
            UIMgr.registerUI(UIDefine.UIMainCtl, UIMainCtl);
            UIMgr.registerUI(UIDefine.UIGameCtl, UIGameCtl);
            UIMgr.registerUI(UIDefine.UITaskCtl, UITaskCtl);
            UIMgr.registerUI(UIDefine.UIShopCtl, UIShopCtl);
            UIMgr.registerUI(UIDefine.UIBagCtl, UIBagCtl);
            UIMgr.registerUI(UIDefine.UIHeroUpCtl, UIHeroUpCtl);
            UIMgr.registerUI(UIDefine.UIGameWinCtl, UIGameWinCtl);
            UIMgr.registerUI(UIDefine.UIEndLessGameWinCtl, UIEndLessGameWinCtl);
            UIMgr.registerUI(UIDefine.UIGameFailCtl, UIGameFailCtl);
            UIMgr.registerUI(UIDefine.UIPlanStartCtl, UIPlanStartCtl);
            UIMgr.registerUI(UIDefine.UIArticleTipCtl, UIArticleTipCtl);
            UIMgr.registerUI(UIDefine.UIHeroInfoCtl, UIHeroInfoCtl);
            UIMgr.registerUI(UIDefine.UIEndLessGameCtl, UIEndLessGameCtl);
            UIMgr.registerUI(UIDefine.UIEquipInfoCtl, UIEquipInfoCtl);
            UIMgr.registerUI(UIDefine.UIEquipUpLvCtl, UIEquipUpLvCtl);
            UIMgr.registerUI(UIDefine.UICallHeroCtl, UICallHeroCtl);
            UIMgr.registerUI(UIDefine.UISettingCtl, UISettingCtl);
            UIMgr.registerUI(UIDefine.Debug, Debug);
            UIMgr.registerUI("test", UITestCtl);
            Game.currentGroupID = 1;
            let preloadList = [
                UIDefine.UIMainCtl,
            ];
            UIMgr.preloadingUI(preloadList, Laya.Handler.create(this, this.initMvc), new Laya.Handler(this, this.loadUIProcess, null, false));
        }
        loadUIProcess(n) {
            LoadingView.progress(Math.floor(50 + n * 45));
        }
        initMvc() {
            UserModel.getInstance().init();
            GameModel.getInstance().init();
            ItemModel.getInstance().init();
            UserModel.getInstance().setUid(AppConfig.userName);
            this.ready();
        }
        async ready() {
            LoadingView.progress(100, "加载完成");
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
            Config.useWebGL2 = true;
            Config.isAntialias = true;
            if (QueryArgsUtil.get("editor") == 1) {
                Laya.init(1920, 1080, Laya["WebGL"]);
            }
            else {
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            }
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

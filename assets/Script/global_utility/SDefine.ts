import TSUtility from "./TSUtility";
import { Utility } from "./Utility";

export default class SDefine{
	static isBingoBallItem(t) {
		return t == SDefine.I_BINGOBALL_FREE || t == SDefine.I_BINGOBALL_OFFER
	}
	
	static getSlotName = function(t) {
		return null == SDefine._slotSceneInfo && SDefine._initSlotSceneInfo(),
		null == SDefine._slotSceneInfo[t] ? (cc.error("not found slotid ", t),
		t) : SDefine._slotSceneInfo[t].name
	}

	static getSlotSceneInfo = function(t) {
		return null == SDefine._slotSceneInfo && SDefine._initSlotSceneInfo(),
		null == SDefine._slotSceneInfo[t] ? (cc.error("not found slotid ", t),
		null) : SDefine._slotSceneInfo[t]
	}
	
	static getSlotSceneInfoBySceneName = function(t) {
		for (var n in null == SDefine._slotSceneInfo && SDefine._initSlotSceneInfo(),
		SDefine._slotSceneInfo)
			if (SDefine._slotSceneInfo[n].sceneName == t)
				return SDefine._slotSceneInfo[n];
		return null
	}
	
	static preInit = function() {
		// if (cc.sys.os != cc.sys.OS_IOS && cc.sys.os != cc.sys.OS_OSX || (e.Mobile_SpineAnimationStart_Flag = true),
		// Utility.isMobileGame() && cc.sys.os == cc.sys.OS_IOS && (e.Mobile_iOS_PurchaseLimit_Flag = true),
		// Utility.isMobileGame()) {
		// 	var t = Utility.getApplicationVersion()
		// 	  , n = Utility.getApplicationVersionCode(t)
		// 	  , o = 0;
		// 	cc.sys.os == cc.sys.OS_IOS ? o = Utility.getApplicationVersionCode("2.2.1") : cc.sys.os == cc.sys.OS_ANDROID ? o = Utility.getApplicationVersionCode("2.2.1") : cc.sys.os == cc.sys.OS_WINDOWS ? o = Utility.getApplicationVersionCode("2.2.1") : (cc.log("auth V2 not defined minversion"),
		// 	o = Utility.getApplicationVersionCode("99.99.99")),
		// 	o <= n && SDefine.setUseMobileAuth2(),
		// 	cc.sys.os == cc.sys.OS_IOS ? o = Utility.getApplicationVersionCode("2.5.1") : cc.sys.os == cc.sys.OS_ANDROID ? o = Utility.getApplicationVersionCode("2.5.1") : (cc.log("auth V2 not defined minversion"),
		// 	o = Utility.getApplicationVersionCode("99.99.99"))
		// }
	}
	
	static setFBInstant_IOS_Shop_Flag = function() {
		if (Utility.isFacebookInstant()) {
			// var t = FBInstant.getSupportedAPIs()
			//   , n = false;
            //   SDefine.contains(t, "payments.purchaseAsync") ? (cc.log("Can Use purchaseAsync"),
			// n = true) : (cc.log("Can not Use purchaseAsync"),
			// n = false),
			// !n && (SDefine.FB_Instant_iOS_Shop_Flag = true)
		}
	}
	
	static contains = function(e, t) {
		for (var n = e.length; n--; )
			if (e[n] === t)
				return true;
		return false
	}
	
	static Init = function() {
		// if (TSUtility.isDevService() && (SDefine.LEAGUE_GAME_INTERVAL = 3600),
		// Utility.isMobileGame()) {
		// 	var t = Utility.getApplicationVersion()
		// 	  , n = Utility.getApplicationVersionCode(t)
		// 	  , a = 0;
		// 	if (cc.sys.os == cc.sys.OS_IOS ? a = Utility.getApplicationVersionCode("2.3.5") : cc.sys.os == cc.sys.OS_ANDROID ? a = Utility.getApplicationVersionCode("2.3.5") : cc.sys.os == cc.sys.OS_WINDOWS ? a = Utility.getApplicationVersionCode("2.3.1") : (cc.log("Mobile_MultiTouch_OnOff is not defined minversion"),
		// 	a = Utility.getApplicationVersionCode("99.99.99")),
		// 	a <= n && (cc.log("Mobile_MultiTouch_OnOff true"),
		// 	SDefine.Mobile_MultiTouch_OnOff = true),
		// 	cc.sys.os == cc.sys.OS_IOS && (a = Utility.getApplicationVersionCode("2.2.18")) <= n && (e.Mobile_Use_iOS_Liftoff = true),
		// 	cc.sys.os == cc.sys.OS_ANDROID && ((a = Utility.getApplicationVersionCode("3.0.8")) <= n && (e.Mobile_Use_AOS_GetSkuInfo = true),
		// 	n <= (i = Utility.getApplicationVersionCode("3.1.19")) && (SDefine.Mobile_AF_PurchaseLog_Revenue_Rounding = true)),
		// 	Utility.isMobileGame()) {
		// 		(a = Utility.getApplicationVersionCode("3.0.38")) <= n && (SDefine.Mobile_Use_Google_CMP = true),
		// 		a = Utility.getApplicationVersionCode("3.0.42");
		// 		var i = Utility.getApplicationVersionCode("3.0.51");
		// 		a <= n && i >= n && (SDefine.Mobile_ShowCMP_At_Start = true),
		// 		(a = Utility.getApplicationVersionCode("3.0.45")) <= n && (SDefine.Mobile_Use_IAA_DoubleBidding = true),
		// 		(a = Utility.getApplicationVersionCode("3.0.51")) <= n && (SDefine.IOS_Facebook_ATT_Update = true),
		// 		(a = Utility.getApplicationVersionCode("3.1.1")) <= n && (SDefine.Mobile_IAP_Renewal = true),
		// 		(a = Utility.getApplicationVersionCode("3.1.35")) <= n && (SDefine.Mobile_AppLovin_S2S_Impression = true),
		// 		(a = Utility.getApplicationVersionCode("3.1.50")) <= n && (SDefine.Mobile_AF_PurchaseConnector_Use = true),
		// 		(a = Utility.getApplicationVersionCode("3.2.1")) <= n && (SDefine.Mobile_Admob_Use = true)
		// 	}
		// }
	}
   
	static InitAfterGetUserInfo = function() {}
	
	static setUseMobileAuth2 = function() {
		cc.log("Use_Mobile_Auth_v2 true"),
		SDefine.Use_Mobile_Auth_v2 = true
	}
	
	static _initSlotSceneInfo = function() {
		SDefine._slotSceneInfo = {};
		for (var t = 0; t < SDefine.SLOT_SCENEINFO.length; ++t) {
			var n = SDefine.SLOT_SCENEINFO[t];
			SDefine._slotSceneInfo[n.gameId] = n
		}
	}
	
	static setSlotSceneInfo = function(t) {
		for (var n = false, o = 0; o < SDefine.SLOT_SCENEINFO.length; ++o)
			if (SDefine.SLOT_SCENEINFO[o].gameId == t.gameId) {
				cc.log("setSlotSceneInfo update", t.gameId),
				SDefine.SLOT_SCENEINFO[o] = t,
				n = true;
				break
			}
		!n && SDefine.SLOT_SCENEINFO.push(t)
	}
	
	static setInstant_PurchaseAPI_Use = function(t) {
		cc.log("setInstant_PurchaseAPI_Use", t),
		SDefine.FBInstant_PurchaseAPI_Useable = t
	}
	
	static getZoneName = function(t) {
		return t == SDefine.HIGHROLLER_ZONEID ? Utility.isFacebookInstant() ? SDefine.LIGHTNING_ZONENAME : SDefine.HIGHROLLER_ZONENAME : t == SDefine.VIP_LOUNGE_ZONEID ? SDefine.VIP_LOUNGE_ZONENAME : SDefine.SUITE_ZONENAME
	}
	
	static isValidZoneId = function(t) {
		return !(t < SDefine.HIGHROLLER_ZONEID || t > SDefine.SUITE_ZONEID)
	}
	
	static setSquadUse = function() {
		SDefine.FBInstant_Squad_Use = false
	}
	
	static INTERVAL_JACKPOTINFO = 18e4
	static TUTORIAL_SLOTID = "100xdollar"
	static SLOT_JACKPOT_TYPE_GRAND = 4
	static SLOT_JACKPOT_TYPE_MEGA = 3
	static SLOT_JACKPOT_TYPE_MAJOR = 2
	static SLOT_JACKPOT_TYPE_MINOR = 1
	static SLOT_JACKPOT_TYPE_MINI = 0
	static SLOT_JACKPOT_TYPE_MINISMALL = 5
	static SLOT_JACKPOT_KEY_GRAND = "grand"
	static SLOT_JACKPOT_KEY_MEGA = "mega"
	static SLOT_JACKPOT_KEY_MAJOR = "major"
	static SLOT_JACKPOT_KEY_MINOR = "minor"
	static SLOT_JACKPOT_KEY_MINI = "mini"
	static SLOT_JACKPOT_KEY_MINISMALL = "mini_small"
	static SLOT_JACKPOT_TYPE_CASINO = 0
	static SUBGAMEID_SLOT_SEVENRUSH = "sevenrush"
	static SUBGAMEID_SLOT_WHEELOFVEGAS = "wheelofvegas"
	static SUBGAMEID_SLOT_SUPER25 = "super25"
	static SUBGAMEID_SLOT_THUNDERSTRIKE = "thunderstrike"
	static SUBGAMEID_SLOT_DUALWHEELACTION = "dualwheelaction"
	static SUBGAMEID_SLOT_BLAZINGPHOENIX = "blazingphoenix"
	static SUBGAMEID_SLOT_MAJESTICLION = "majesticlion"
	static SUBGAMEID_SLOT_FORTUNEPOT = "fortunepot"
	static SUBGAMEID_SLOT_NUDGEWILD = "nudgewild"
	static SUBGAMEID_SLOT_BLACKWHITETIGER = "blackwhitetiger"
	static SUBGAMEID_SLOT_TAJMAHALPRINCESS = "tajmahalprincess"
	static SUBGAMEID_SLOT_THEMIGHTYVIKING = "themightyviking"
	static SUBGAMEID_SLOT_SUPERNINEBELLS = "superninebells"
	static SUBGAMEID_SLOT_GOLDENCROWN = "goldencrown"
	static SUBGAMEID_SLOT_RHINOBILITZ = "rhinoblitz"
	static SUBGAMEID_SLOT_ROLLTHEDICE = "rollthedice"
	static SUBGAMEID_SLOT_MYSTICGYPSY = "mysticgypsy"
	static SUBGAMEID_SLOT_CURIOUSMERMAID = "curiousmermaid"
	static SUBGAMEID_SLOT_SANTARUDOLPH = "santarudolph"
	static SUBGAMEID_SLOT_DIAMONDSTRIKE = "diamondstrike"
	static SUBGAMEID_SLOT_KINGOFSAFARI = "kingofsafari"
	static SUBGAMEID_SLOT_GEMDIGGERJOE = "gemdiggerjoe"
	static SUBGAMEID_SLOT_ORIENTALLANTERNS = "orientallanterns"
	static SUBGAMEID_SLOT_DRAGONTALES = "dragontales"
	static SUBGAMEID_SLOT_BOOMBURST = "boomburst"
	static SUBGAMEID_SLOT_FIRELOCKCLASSIC = "firelockclassic"
	static SUBGAMEID_SLOT_GOLDENBUFFALO = "goldenbuffalo"
	static SUBGAMEID_SLOT_PHARAOHSECRETS = "pharaohsecrets"
	static SUBGAMEID_SLOT_MAGICLAMP = "magiclamp"
	static SUBGAMEID_SLOT_RETURNOFCAPTAINHOOK = "returnofcaptainhook"
	static SUBGAMEID_SLOT_100XDOLLAR = "100xdollar"
	static SUBGAMEID_SLOT_AMERICAN9EAGLES = "american9eagles"
	static SUBGAMEID_SLOT_SISHENFORTUNES = "sishenfortunes"
	static SUBGAMEID_SLOT_BIRDJACKPOT = "birdjackpot"
	static SUBGAMEID_SLOT_FRUITYJEWELS = "fruityjewels"
	static SUBGAMEID_SLOT_NUDGINGLOCKCLASSIC = "nudginglockclassic"
	static SUBGAMEID_SLOT_WILDWOLF = "wildwolf"
	static SUBGAMEID_SLOT_CASHDASH = "cashdash"
	static SUBGAMEID_SLOT_OKTOBERFESTBIERHAUS = "oktoberfestbierhaus"
	static SUBGAMEID_SLOT_PUMPKINFORTUNE = "pumpkinfortune"
	static SUBGAMEID_SLOT_BELLSTRIKEFRENZY = "bellstrikefrenzy"
	static SUBGAMEID_SLOT_GOLDEN100XDOLLAR = "golden100xdollar"
	static SUBGAMEID_SLOT_FATTURKEYWILDS = "fatturkeywilds"
	static SUBGAMEID_SLOT_WRATHOFZEUS = "wrathofzeus"
	static SUBGAMEID_SLOT_FROZENTHRONERESPIN = "frozenthronerespin"
	static SUBGAMEID_SLOT_CASINOROYALE = "casinoroyale"
	static SUBGAMEID_SLOT_GUMMYTUMMYWILD = "gummytummywild"
	static SUBGAMEID_SLOT_SUPER25DELUXE = "super25deluxe"
	static SUBGAMEID_SLOT_FORTUNETREE = "fortunetree"
	static SUBGAMEID_SLOT_SHANGHAIFULLMOON = "shanghaifullmoon"
	static SUBGAMEID_SLOT_CARNIVALINRIO = "carnivalinrio"
	static SUBGAMEID_SLOT_ALICEINWONDERLAND = "aliceinwonderland"
	static SUBGAMEID_SLOT_FIREBLASTCLASSIC = "fireblastclassic"
	static SUBGAMEID_SLOT_LEPRECHAUNLUCKYRESPINS = "leprechaunluckyrespins"
	static SUBGAMEID_SLOT_RAINBOWPEARL = "rainbowpearl"
	static SUBGAMEID_SLOT_PHARAOHSBEETLELINK = "pharaohsbeetlelink"
	static SUBGAMEID_SLOT_FRANKENDUALSHOCK = "frankendualshock"
	static SUBGAMEID_SLOT_LUCKYAMERICANROLL = "luckyamericanroll"
	static SUBGAMEID_SLOT_MIDASTOUCHOFRICHES = "midastouchofriches"
	static SUBGAMEID_SLOT_TRIPLEBLASTCLASSIC = "tripleblastclassic"
	static SUBGAMEID_SLOT_CLASSICLOCKROLLGRAND = "classiclockrollgrand"
	static SUBGAMEID_SLOT_FOURTHOFJULYWILDRESPIN = "4thofjulywildrespin"
	static SUBGAMEID_SLOT_MAKEITRAIN = "makeitrain"
	static SUBGAMEID_SLOT_BLAZINGBULLWILD = "blazingbullwild"
	static SUBGAMEID_SLOT_ALOHAHAWAII = "alohahawaii"
	static SUBGAMEID_SLOT_LOLLYLANDGUMMYKING = "lollylandgummyking"
	static SUBGAMEID_SLOT_ABRACADABRA = "abracadabra"
	static SUBGAMEID_SLOT_DIAMONDBEAMJACKPOT = "diamondbeamjackpot"
	static SUBGAMEID_SLOT_PIGGYBANKRICHES = "piggybankriches"
	static SUBGAMEID_SLOT_DREAMCITYLIGHTS = "dreamcitylights"
	static SUBGAMEID_SLOT_EMERALDGREEN = "emeraldgreen"
	static SUBGAMEID_SLOT_MEGATONDYNAMITE = "megatondynamite"
	static SUBGAMEID_SLOT_GHOSTHUNTERS = "ghosthunters"
	static SUBGAMEID_SLOT_SHOPAHOLIC = "shopaholic"
	static SUBGAMEID_SLOT_GOLDENBUFFALOFEVER = "goldenbuffalofever"
	static SUBGAMEID_SLOT_RUDOLPHEXPRESS = "rudolphexpress"
	static SUBGAMEID_SLOT_HONEYBEEPARADE = "honeybeeparade"
	static SUBGAMEID_SLOT_HIGHRISEJACKPOT = "highrisejackpot"
	static SUBGAMEID_SLOT_BANKOFWEALTH = "bankofwealth"
	static SUBGAMEID_SLOT_CUPIDSLOVEWHEEL = "cupidslovewheel"
	static SUBGAMEID_SLOT_LEPRECHAUNMAGICDROP = "leprechaunmagicdrop"
	static SUBGAMEID_SLOT_CASHSHOWDOWN = "cashshowdown"
	static SUBGAMEID_SLOT_MAYANTEMPLEMAGIC = "mayantemplemagic"
	static SUBGAMEID_SLOT_FLAMEFURYWHEEL = "flamefurywheel"
	static SUBGAMEID_SLOT_CHILICHILIFEVER = "chilichilifever"
	static SUBGAMEID_SLOT_IMPERIALGOLDFORTUNE = "imperialgoldfortune"
	static SUBGAMEID_SLOT_AMERICANVALOR = "americanvalor"
	static SUBGAMEID_SLOT_BINGOTRIO = "bingotrio"
	static SUBGAMEID_SLOT_GREATAMERICA = "greatamerica"
	static SUBGAMEID_SLOT_KONGFURY = "kongfury"
	static SUBGAMEID_SLOT_FIRELOCKULTIMATE = "firelockultimate"
	static SUBGAMEID_SLOT_SHARKATTACK = "sharkattack"
	static SUBGAMEID_SLOT_PINKSTARDIAMONDS = "pinkstardiamonds"
	static SUBGAMEID_SLOT_KINGDOMINPERIL = "kingdominperil"
	static SUBGAMEID_SLOT_PIGGYHOUSES = "piggyhouses"
	static SUBGAMEID_SLOT_JIUJIUJIU999 = "jiujiujiu999"
	static SUBGAMEID_SLOT_FANTASTICEAGLES = "fantasticeagles"
	static SUBGAMEID_SLOT_CASHSHOWDOWNCLASSIC = "cashshowdownclassic"
	static SUBGAMEID_SLOT_MOONLIGHTWOLF = "moonlightwolf"
	static SUBGAMEID_SLOT_SPOOKYNIGHT = "spookynight"
	static SUBGAMEID_SLOT_FATBILLY = "fatbilly"
	static SUBGAMEID_SLOT_GOLDENTRAIN = "goldentrain"
	static SUBGAMEID_SLOT_RAPIDHITANTARCTIC = "rapidhitantarctic"
	static SUBGAMEID_SLOT_MARINEADVENTURE = "marineadventure"
	static SUBGAMEID_SLOT_BIGBUCKSBOUNTY = "bigbucksbounty"
	static SUBGAMEID_SLOT_BABYSANTAWILD = "babysantawild"
	static SUBGAMEID_SLOT_WINYOURHEART = "winyourheart"
	static SUBGAMEID_SLOT_WUDANGJIANSHI = "wudangjianshi"
	static SUBGAMEID_SLOT_FRUITYBLAST = "fruityblast"
	static SUBGAMEID_SLOT_THEBIGGAME = "thebiggame"
	static SUBGAMEID_SLOT_SHAMROCKLOCK = "shamrocklock"
	static SUBGAMEID_SLOT_WILDFIREMEN = "wildfiremen"
	static SUBGAMEID_SLOT_BUNNYBANK = "bunnybank"
	static SUBGAMEID_SLOT_THEARCANEALCHEMIST = "thearcanealchemist"
	static SUBGAMEID_SLOT_PINATAPARADE = "pinataparade"
	static SUBGAMEID_SLOT_SEVENGLORY = "sevenglory"
	static SUBGAMEID_SLOT_WAIKIKISANTA = "waikikisanta"
	static SUBGAMEID_SLOT_WICKEDLILDEVIL = "wickedlildevil"
	static SUBGAMEID_SLOT_GOLDENEAGLEKING = "goldeneagleking"
	static SUBGAMEID_SLOT_PILINGFORTUNES = "pilingfortunes"
	static SUBGAMEID_SLOT_VIVALASVEGAS = "vivalasvegas"
	static SUBGAMEID_SLOT_PHOENIXIGNITE = "phoenixignite"
	static SUBGAMEID_SLOT_JOLLYROGERJACKPOT = "jollyrogerjackpot"
	static SUBGAMEID_SLOT_HOROSCOPEBLESSINGS = "horoscopeblessings"
	static SUBGAMEID_SLOT_SUPERNOVABLASTS = "supernovablasts"
	static SUBGAMEID_SLOT_MONEYSTAX = "moneystax"
	static SUBGAMEID_SLOT_FORTUNESHRINE = "fortuneshrine"
	static SUBGAMEID_SLOT_VAMPRESSMANSION = "vampressmansion"
	static SUBGAMEID_SLOT_VOLCANICTAHITI = "volcanictahiti"
	static SUBGAMEID_SLOT_MEOWGICALHALLOWEEN = "meowgicalhalloween"
	static SUBGAMEID_SLOT_FLAMEOFLIBERTY = "flameofliberty"
	static SUBGAMEID_SLOT_THANKSGIVINGGALORE = "thanksgivinggalore"
	static SUBGAMEID_SLOT_WILDBUNCH = "wildbunch"
	static SUBGAMEID_SLOT_BONANZAEXPRESS = "bonanzaexpress"
	static SUBGAMEID_SLOT_CHRISTMASBLINGS = "christmasblings"
	static SUBGAMEID_SLOT_TRIPLEWHEELSUPREME = "triplewheelsupreme"
	static SUBGAMEID_SLOT_XINNIANHAO = "xinnianhao"
	static SUBGAMEID_SLOT_DUALDIAMONDSSTRIKE = "dualdiamondsstrike"
	static SUBGAMEID_SLOT_ZIPPYJACKPOTS = "zippyjackpots"
	static SUBGAMEID_SLOT_THEBEASTSSECRET = "thebeastssecret"
	static SUBGAMEID_SLOT_ROBINHOODSECONDSHOT = "robinhoodsecondshot"
	static SUBGAMEID_SLOT_WINNINGROLLS = "winningrolls"
	static SUBGAMEID_SLOT_LADYOLUCK = "ladyoluck"
	static SUBGAMEID_SLOT_PIGGYMANIA = "piggymania"
	static SUBGAMEID_SLOT_LUCKYBUNNYDROP = "luckybunnydrop"
	static SUBGAMEID_SLOT_DRAGONSANDPEARLS = "dragonsandpearls"
	static SUBGAMEID_SLOT_CLASSICSTAR = "classicstar"
	static SUBGAMEID_SLOT_ALIENAMIGOS = "alienamigos"
	static SUBGAMEID_SLOT_BEAVERSTACKS = "beaverstacks"
	static SUBGAMEID_SLOT_THEMOBKING = "themobking"
	static SUBGAMEID_SLOT_DUALFORTUNEPOT = "dualfortunepot"
	static SUBGAMEID_SLOT_LADYLIBERTYRESPINS = "ladylibertyrespins"
	static SUBGAMEID_SLOT_MEGABINGOCLASSIC = "megabingoclassic"
	static SUBGAMEID_SLOT_RICHRICHFARM = "richrichfarm"
	static SUBGAMEID_SLOT_GEMPACKEDWILDS = "gempackedwilds"
	static SUBGAMEID_SLOT_JACKSMAGICBEANS = "jacksmagicbeans"
	static SUBGAMEID_SLOT_DRMADWIN = "drmadwin"
	static SUBGAMEID_SLOT_CANDYCASTLE = "candycastle"
	static SUBGAMEID_SLOT_WILDHEARTS = "wildhearts"
	static SUBGAMEID_SLOT_RACOONSHOWDOWN = "raccoonshowdown"
	static SUBGAMEID_SLOT_WITCHPUMPKINS = "witchpumpkins"
	static SUBGAMEID_SLOT_MAGMAFICENT = "magmaficent"
	static SUBGAMEID_SLOT_DAKOTAFARMGIRL = "dakotafarmgirl"
	static SUBGAMEID_SLOT_BOONANZA = "boonanza"
	static SUBGAMEID_SLOT_STARRYHOLIDAY = "starryholidays"
	static SUBGAMEID_SLOT_DINGDONGJACKPOTS = "dingdongjackpots"
	static SUBGAMEID_SLOT_LOCKNROLLFIVER = "locknrollfiver"
	static SUBGAMEID_SLOT_HOARDINGGOBLINS = "hoardinggoblins"
	static SUBGAMEID_SLOT_CUPIDLOVESPELLS = "cupidlovespells"
	static SUBGAMEID_SLOT_CASHSHOWDOWNDELUXE = "cashshowdowndeluxe"
	static SUBGAMEID_SLOT_ZEUSTHUNDERSHOWER = "zeusthundershower"
	static SUBGAMEID_SLOT_SUPERSEVENBLASTS = "supersevenblasts"
	static SUBGAMEID_SLOT_CHRONOSPHEREEGYPT = "chronosphereegypt"
	static SUBGAMEID_SLOT_AZTECODYSSEY = "aztecodyssey"
	static SUBGAMEID_SLOT_BLOODGEMS = "bloodgems"
	static SUBGAMEID_SLOT_SUPERDRUMBASH = "superdrumbash"
	static SUBGAMEID_SLOT_ALLAMERICAN = "allamerican"
	static SUBGAMEID_SLOT_JURASSICWILDSTOMPS = "jurassicwildstomps"
	static SUBGAMEID_SLOT_PIRATEBOOTYRAPIDHIT = "piratebootyrapidhit"
	static SUBGAMEID_SLOT_ALLSTARCIRCUS = "allstarcircus"
	static SUBGAMEID_SLOT_HOUNDOFHADES = "houndofhades"
	static SUBGAMEID_SLOT_JUMBOPIGGIES = "jumbopiggies"
	static SUBGAMEID_SLOT_PAWSOMEPANDA = "pawsomepanda"
	static SUBGAMEID_SLOT_THEPURRGLAR = "thepurrglar"
	static SUBGAMEID_SLOT_DRAGONORBS = "dragonorbs"
	static SUBGAMEID_SLOT_TOMEOFFATE = "tomeoffate"
	static SUBGAMEID_SLOT_SHANGHAIEXPRESS = "shanghaiexpress"
	static SUBGAMEID_SLOT_CAPTAINBLACKPURR = "captainblackpurr"
	static SUBGAMEID_SLOT_SMASHNCASH = "smashncash"
	static SUBGAMEID_SLOT_TEMPLEOFATHENA = "templeofathena"
	static SUBGAMEID_SLOT_NUTTYSQUIRREL = "nuttysquirrel"
	static SUBGAMEID_SLOT_WITCHSAPPLES = "witchsapples"
	static SUBGAMEID_SLOT_TALESOFARCADIA = "talesofarcadia"
	static SUBGAMEID_SLOT_WILDSIGNITERESPINS = "wildsigniterespins"
	static SUBGAMEID_SLOT_PINUPPARADISE = "pinupparadise"
	static SUBGAMEID_SLOT_POSEIDONWILDWAVES = "poseidonwildwaves"
	static SUBGAMEID_SLOT_CUPIDLOVEYDOVEY = "cupidloveydovey"
	static SUBGAMEID_SLOT_THEHOGMANCER = "thehogmancer"
	static SUBGAMEID_SLOT_RAINBOWPEARL_DY = "rainbowpearl_dy"
	static SUBGAMEID_SLOT_100XDOLLAR_DY = "100xdollar_dy"
	static SUBGAMEID_SLOT_SUPER25DELUXE_DY = "super25deluxe_dy"
	static SUBGAMEID_SLOT_PHARAOHSBEETLELINK_DY = "pharaohsbeetlelink_dy"
	static SUBGAMEID_SLOT_DUALFORTUNEPOT_DY = "dualfortunepot_dy"
	static SUBGAMEID_SLOT_GEMPACKEDWILDS_DY = "gempackedwilds_dy"
	static SUBGAMEID_SLOT_MOONLIGHTWOLF_DY = "moonlightwolf_dy"
	static SUBGAMEID_SLOT_GOLDENMOONFORTUNE = "goldenmoonfortune"
	static SUBGAMEID_SLOT_PHOENIXIGNITE_DY = "phoenixignite_dy"
	static SUBGAMEID_SLOT_FIRELOCKCLASSIC_DY = "firelockclassic_dy"
	static SUBGAMEID_SLOT_CASINOROYALE_DY = "casinoroyale_dy"
	static SUBGAMEID_SLOT_NUDGINGLOCKCLASSIC_DY = "nudginglockclassic_dy"
	static SUBGAMEID_SLOT_PIGGYBANKRICHES_DY = "piggybankriches_dy"
	static SUBGAMEID_SLOT_BIRDJACKPOT_DY = "birdjackpot_dy"
	static SUBGAMEID_SLOT_ALOHAHAWAII_DY = "alohahawaii_dy"
	static SUBGAMEID_SLOT_WRATHOFZEUS_DY = "wrathofzeus_dy"
	static SUBGAMEID_SLOT_BUNNYBANK_DY = "bunnybank_dy"
	static SUBGAMEID_SLOT_CLASSICSTAR_DY = "classicstar_dy"
	static SUBGAMEID_SLOT_WITCHPUMPKINS_DY = "witchpumpkins_dy"
	static SUBGAMEID_SLOT_PIGGYMANIA_DY = "piggymania_dy"
	static SUBGAMEID_SLOT_WILDHEARTS_DY = "wildhearts_dy"
	static NAME_SLOT_SEVENRUSH = "Seven Rush"
	static NAME_SLOT_WHEELOFVEGAS = "Wheel of Vegas"
	static NAME_SLOT_SUPER25 = "Super 25"
	static NAME_SLOT_THUNDERSTRIKE = "Thunder Strike"
	static NAME_SLOT_DUALWHEELACTION = "Dual Wheel Action"
	static NAME_SLOT_BLAZINGPHOENIX = "Blazing Phoenix"
	static NAME_SLOT_MAJESTICLION = "Majestic Lion"
	static NAME_SLOT_FORTUNEPOT = "Fortune Pot"
	static NAME_SLOT_NUDGEWILD = "Nudge WILD"
	static NAME_SLOT_BLACKWHITETIGER = "Black&White tiger"
	static NAME_SLOT_TAJMAHALPRINCESS = "Taj Mahal Princess"
	static NAME_SLOT_THEMIGHTYVIKING = "The Mighty Viking"
	static NAME_SLOT_SUPERNINEBELLS = "Super Nine Bells"
	static NAME_SLOT_GOLDENCROWN = "Golden Crown"
	static NAME_SLOT_RHINOBILITZ = "Rhino Blitz"
	static NAME_SLOT_ROLLTHEDICE = "Roll the Dice"
	static NAME_SLOT_MYSTICGYPSY = "Mystic Gypsy"
	static NAME_SLOT_CURIOUSMERMAID = "Curious Mermaid"
	static NAME_SLOT_SANTARUDOLPH = "Santa and Rudolph"
	static NAME_SLOT_DIAMONDSTRIKE = "Diamond Strike"
	static NAME_SLOT_KINGOFSAFARI = "King of Safari"
	static NAME_SLOT_GEMDIGGERJOE = "Gem Digger Joe"
	static NAME_SLOT_ORIENTALLANTERNS = "Oriental Lanterns"
	static NAME_SLOT_DRAGONTALES = "Dragon Tales"
	static NAME_SLOT_BOOMBURST = "Boom Boom Burst"
	static NAME_SLOT_FIRELOCKCLASSIC = "Fire Lock Classic"
	static NAME_SLOT_GOLDENBUFFALO = "Golden Buffalo"
	static NAME_SLOT_PHARAOHSECRETS = "Pharaoh Secrets"
	static NAME_SLOT_MAGICLAMP = "Magic Lamp"
	static NAME_SLOT_RETURNOFCAPTAINHOOK = "Return Of Captain Hook"
	static NAME_SLOT_100XDOLLAR = "100X Dollar"
	static NAME_SLOT_AMERICAN9EAGLES = "American 9Eagles"
	static NAME_SLOT_SISHENFORTUNES = "SiShen Fortunes"
	static NAME_SLOT_BIRDJACKPOT = "Bird Jackpot"
	static NAME_SLOT_FRUITYJEWELS = "Fruity Jewels"
	static NAME_SLOT_NUDGINGLOCKCLASSIC = "Nudging Lock Classic"
	static NAME_SLOT_WILDWOLF = "Wild Wolf"
	static NAME_SLOT_CASHDASH = "Cash Dash"
	static NAME_SLOT_OKTOBERFESTBIERHAUS = "OktoberFest Bier Haus"
	static NAME_SLOT_PUMPKINFORTUNE = "Pumpkin Fortune"
	static NAME_SLOT_BELLSTRIKEFRENZY = "Bell Strike Frenzy"
	static NAME_SLOT_GOLDEN100XDOLLAR = "Golden 100X Dollar"
	static NAME_SLOT_FATTURKEYWILDS = "Fat Turkey Wilds"
	static NAME_SLOT_WRATHOFZEUS = "Wrath of Zeus"
	static NAME_SLOT_FROZENTHRONERESPIN = "Frozen Throne Respin"
	static NAME_SLOT_CASINOROYALE = "Casino Royale"
	static NAME_SLOT_GUMMYTUMMYWILD = "Gummy Tummy Wild"
	static NAME_SLOT_SUPER25DELUXE = "Super 25 Deluxe"
	static NAME_SLOT_FORTUNETREE = "Fortune Tree"
	static NAME_SLOT_SHANGHAIFULLMOON = "Shanghai Full Moon"
	static NAME_SLOT_CARNIVALINRIO = "Carnival in Rio"
	static NAME_SLOT_ALICEINWONDERLAND = "Alice in Wonderland"
	static NAME_SLOT_FIREBLASTCLASSIC = "Fire Blast Classic"
	static NAME_SLOT_LEPRECHAUNLUCKYRESPINS = "Leprechaun Lucky Respins"
	static NAME_SLOT_RAINBOWPEARL = "Rainbow Pearl"
	static NAME_SLOT_PHARAOHSBEETLELINK = "Pharaoh's Beetle Link"
	static NAME_SLOT_FRANKENDUALSHOCK = "Franken Dual Shock"
	static NAME_SLOT_LUCKYAMERICANROLL = "Lucky American Roll"
	static NAME_SLOT_MIDASTOUCHOFRICHES = "Midas Touch of Riches"
	static NAME_SLOT_TRIPLEBLASTCLASSIC = "Triple Blast Classic"
	static NAME_SLOT_CLASSICLOCKROLLGRAND = "Classic Lock and Roll Grand"
	static NAME_SLOT_FOURTHOFJULYWILDRESPIN = "4th Of July Wild Respin"
	static NAME_SLOT_MAKEITRAIN = "Make It Rain"
	static NAME_SLOT_BLAZINGBULLWILD = "Blazing Bull Wild"
	static NAME_SLOT_ALOHAHAWAII = "Aloha Hawaii"
	static NAME_SLOT_LOLLYLANDGUMMYKING = "Lollyland Gummy King"
	static NAME_SLOT_ABRACADABRA = "Abra Cadabra"
	static NAME_SLOT_DIAMONDBEAMJACKPOT = "Diamond Beam Jackpot"
	static NAME_SLOT_PIGGYBANKRICHES = "Piggy Bank Riches"
	static NAME_SLOT_DREAMCITYLIGHTS = "Dream City Lights"
	static NAME_SLOT_EMERALDGREEN = "Emerald Green"
	static NAME_SLOT_MEGATONDYNAMITE = "Megaton Dynamite"
	static NAME_SLOT_GHOSTHUNTERS = "Ghost Hunters"
	static NAME_SLOT_SHOPAHOLIC = "Shopaholic"
	static NAME_SLOT_GOLDENBUFFALOFEVER = "Golden Buffalo Fever"
	static NAME_SLOT_RUDOLPHEXPRESS = "Rudolph Express"
	static NAME_SLOT_HONEYBEEPARADE = "Honey Bee Parade"
	static NAME_SLOT_HIGHRISEJACKPOT = "High Rise Jackpot"
	static NAME_SLOT_BANKOFWEALTH = "Bank of Wealth"
	static NAME_SLOT_CUPIDSLOVEWHEEL = "Cupid's Love Wheel"
	static NAME_SLOT_LEPRECHAUNMAGICDROP = "Leprechaun Magic Drop"
	static NAME_SLOT_CASHSHOWDOWN = "Cash Showdown"
	static NAME_SLOT_MAYANTEMPLEMAGIC = "Mayan Temple Magic"
	static NAME_SLOT_FLAMEFURYWHEEL = "Flame Fury Wheel"
	static NAME_SLOT_CHILICHILIFEVER = "Chili Chili Fever"
	static NAME_SLOT_IMPERIALGOLDFORTUNE = "Imperial Gold Fortune"
	static NAME_SLOT_AMERICANVALOR = "American Valor"
	static NAME_SLOT_BINGOTRIO = "Bingo Trio"
	static NAME_SLOT_GREATAMERICA = "Great America"
	static NAME_SLOT_KONGFURY = "KongFury"
	static NAME_SLOT_FIRELOCKULTIMATE = "Fire Lock Ultimate"
	static NAME_SLOT_SHARKATTACK = "Shark Attack"
	static NAME_SLOT_PINKSTARDIAMONDS = "Pink Star Diamonds"
	static NAME_SLOT_KINGDOMINPERIL = "Kingdom in Peril"
	static NAME_SLOT_PIGGYHOUSES = "Piggy Houses"
	static NAME_SLOT_JIUJIUJIU999 = "Jiu Jiu Jiu 999"
	static NAME_SLOT_FANTASTICEAGLES = "Fantastic Eagles"
	static NAME_SLOT_CASHSHOWDOWNCLASSIC = "Cash Showdown Classic"
	static NAME_SLOT_MOONLIGHTWOLF = "Moonlight Wolf"
	static NAME_SLOT_SPOOKYNIGHT = "Spooky Night"
	static NAME_SLOT_FATBILLY = "Fat Billy"
	static NAME_SLOT_GOLDENTRAIN = "Golden Train"
	static NAME_SLOT_RAPIDHITANTARCTIC = "Rapid Hit Antarctic"
	static NAME_SLOT_MARINEADVENTURE = "Marine Adventure"
	static NAME_SLOT_BIGBUCKSBOUNTY = "Big Bucks Bounty"
	static NAME_SLOT_BABYSANTAWILD = "Baby Santa Wild"
	static NAME_SLOT_WINYOURHEART = "WIN YOUR HEART"
	static NAME_SLOT_WUDANGJIANSHI = "Wudang Jianshi"
	static NAME_SLOT_FRUITYBLAST = "Fruity Blast"
	static NAME_SLOT_THEBIGGAME = "The Big Game"
	static NAME_SLOT_SHAMROCKLOCK = "Shamrock Lock"
	static NAME_SLOT_WILDFIREMEN = "Wild Firemen"
	static NAME_SLOT_BUNNYBANK = "Bunny Bank"
	static NAME_SLOT_THEARCANEALCHEMIST = "The Arcane Alchemist"
	static NAME_SLOT_PINATAPARADE = "Pi\xf1ata Parade"
	static NAME_SLOT_SEVENGLORY = "Seven Glory"
	static NAME_SLOT_WAIKIKISANTA = "Waikiki Santa"
	static NAME_SLOT_WICKEDLILDEVIL = "Wicked Lil' Devil"
	static NAME_SLOT_GOLDENEAGLEKING = "Golden Eagle King"
	static NAME_SLOT_PILINGFORTUNES = "Piling Fortunes"
	static NAME_SLOT_VIVALASVEGAS = "Viva Lasvegas"
	static NAME_SLOT_PHOENIXIGNITE = "Phoenix Ignite"
	static NAME_SLOT_JOLLYROGERJACKPOT = "Jolly Roger Jackpot"
	static NAME_SLOT_HOROSCOPEBLESSINGS = "Horoscope Blessings"
	static NAME_SLOT_SUPERNOVABLASTS = "Supernova Blasts"
	static NAME_SLOT_MONEYSTAX = "Money Stax"
	static NAME_SLOT_FORTUNESHRINE = "Fortune Shrine"
	static NAME_SLOT_VAMPRESSMANSION = "Vampress Mansion"
	static NAME_SLOT_VOLCANICTAHITI = "Volcanic Tahiti"
	static NAME_SLOT_MEOWGICALHALLOWEEN = "Meowgical Halloween"
	static NAME_SLOT_FLAMEOFLIBERTY = "Flame Of Liberty"
	static NAME_SLOT_THANKSGIVINGGALORE = "Thanksgiving Galore"
	static NAME_SLOT_WILDBUNCH = "Wild Bunch"
	static NAME_SLOT_BONANZAEXPRESS = "Bonanza Express"
	static NAME_SLOT_CHRISTMASBLINGS = "Christmas Blings"
	static NAME_SLOT_TRIPLEWHEELSUPREME = "Triple Wheel Supreme"
	static NAME_SLOT_XINNIANHAO = "Xin Nian Hao"
	static NAME_SLOT_DUALDIAMONDSSTRIKE = "Dual Diamonds Strike"
	static NAME_SLOT_ZIPPYJACKPOTS = "Zippy Jackpots"
	static NAME_SLOT_THEBEASTSSECRET = "The Beast's Secret"
	static NAME_SLOT_ROBINHOODSECONDSHOT = "Robin Hood Second Shot"
	static NAME_SLOT_WINNINGROLLS = "Winning Rolls"
	static NAME_SLOT_LADYOLUCK = "Lady O' Luck"
	static NAME_SLOT_PIGGYMANIA = "Piggy Mania"
	static NAME_SLOT_LUCKYBUNNYDROP = "Lucky Bunny Drop"
	static NAME_SLOT_DRAGONSANDPEARLS = "Dragons And Pearls"
	static NAME_SLOT_CLASSICSTAR = "Classic Star"
	static NAME_SLOT_ALIENAMIGOS = "Alien Amigos"
	static NAME_SLOT_BEAVERSTACKS = "Beaver Stacks"
	static NAME_SLOT_THEMOBKING = "The Mob King"
	static NAME_SLOT_DUALFORTUNEPOT = "Dual Fortune Pot"
	static NAME_SLOT_LADYLIBERTYRESPINS = "Lady Liberty Respins"
	static NAME_SLOT_MEGABINGOCLASSIC = "Mega Bingo Classic"
	static NAME_SLOT_RICHRICHFARM = "Rich Rich Farm"
	static NAME_SLOT_GEMPACKEDWILDS = "Gem Packed Wilds"
	static NAME_SLOT_JACKSMAGICBEANS = "Jack's Magic Beans"
	static NAME_SLOT_DRMADWIN = "Dr. Madwin"
	static NAME_SLOT_CANDYCASTLE = "Candy Castle"
	static NAME_SLOT_WILDHEARTS = "Wild Hearts"
	static NAME_SLOT_RACOONSHOWDOWN = "Raccoon Showdown"
	static NAME_SLOT_WITCHPUMPKINS = "Witch Pumpkins"
	static NAME_SLOT_MAGMAFICENT = "Magma Ficent"
	static NAME_SLOT_STARRYHOLIDAY = "Starry Holidays"
	static NAME_SLOT_DINGDONGJACKPOTS = "Ding Dong Jackpots"
	static NAME_SLOT_LOCKNROLLFIVER = "Lock&Roll Fiver"
	static NAME_SLOT_HOARDINGGOBLINS = "Hoarding Goblins"
	static NAME_SLOT_CUPIDLOVESPELLS = "Cupid Love Spells"
	static NAME_SLOT_GOLDENMOONFORTUNE = "Golden Moon Fortune"
	static NAME_SLOT_CASHSHOWDOWNDELUXE = "Cash Showdown Deluxe"
	static NAME_SLOT_ZEUSTHUNDERSHOWER = "Zeus Thunder Shower"
	static NAME_SLOT_SUPERSEVENBLASTS = "Super Seven Blasts"
	static NAME_SLOT_CHRONOSPHAREEGYPT = "Chronosphere Egypt"
	static NAME_SLOT_BLOODGEMS = "Blood Gems"
	static NAME_SLOT_AZTECODYSSEY = "Aztec Odyssey"
	static NAME_SLOT_SUPERDRUMBASH = "Super Drum Bash"
	static NAME_SLOT_ALLAMERICAN = "All American"
	static NAME_SLOT_JURASSICWILDSTOMPS = "Jurassic Wild Stomps"
	static NAME_SLOT_PIRATEBOOTYRAPIDHIT = "Pirate Booty Rapid Hit"
	static NAME_SLOT_ALLSTARCIRCUS = "All Star Circus"
	static NAME_SLOT_HOUNDOFHADES = "Hound Of Hades"
	static NAME_SLOT_JUMBOPIGGIES = "Jumbo Piggies"
	static NAME_SLOT_PAWSOMEPANDA = "Pawsome Panda"
	static NAME_SLOT_THEPURRGLAR = "The Purrglar"
	static NAME_SLOT_DRAGONORBS = "Dragon Orbs"
	static NAME_SLOT_TOMEOFFATE = "Tome Of Fate"
	static NAME_SLOT_SHANGHAIEXPRESS = "Shanghai Express"
	static NAME_SLOT_CAPTAINBLACKPURR = "Captain Black Purr"
	static NAME_SLOT_SMASHNCASH = "Smash 'N Cash"
	static NAME_SLOT_TEMPLEOFATHENA = "Temple Of Athena"
	static NAME_SLOT_NUTTYSQUIRREL = "Nutty Squirrel"
	static NAME_SLOT_WITCHSAPPLES = "Witch's Apples"
	static NAME_SLOT_TALESOFARCADIA = "Tales Of Arcadia"
	static NAME_SLOT_WILDSIGNITERESPINS = "Wilds Ignite Respins"
	static NAME_SLOT_PINUPPARADISE = "Pinup Paradise"
	static NAME_SLOT_RAINBOWPEARL_DY = "Rainbow Pearl"
	static NAME_SLOT_100XDOLLAR_DY = "100X Dollar"
	static NAME_SLOT_SUPER25DELUXE_DY = "Super 25 Deluxe"
	static NAME_SLOT_PHARAOHSBEETLELINK_DY = "Pharaoh's Beetle Link"
	static NAME_SLOT_DUALFORTUNEPOT_DY = "Dual Fortune Pot"
	static NAME_SLOT_GEMPACKEDWILDS_DY = "Gem Packed Wilds"
	static NAME_SLOT_MOONLIGHTWOLF_DY = "Moonlight Wolf"
	static NAME_SLOT_PHOENIXIGNITE_DY = "Phoenix Ignite"
	static NAME_SLOT_FIRELOCKCLASSIC_DY = "Fire Lock Classic"
	static NAME_SLOT_CASINOROYALE_DY = "Casino Royale"
	static NAME_SLOT_NUDGINGLOCKCLASSIC_DY = "Nudging Lock Classic"
	static NAME_SLOT_PIGGYBANKRICHES_DY = "Piggy Bank Riches"
	static NAME_SLOT_BIRDJACKPOT_DY = "Bird Jackpot"
	static NAME_SLOT_ALOHAHAWAII_DY = "Aloha Hawaii"
	static NAME_SLOT_WRATHOFZEUS_DY = "Wrath of Zeus"
	static NAME_SLOT_BUNNYBANK_DY = "Bunny Bank"
	static NAME_SLOT_CLASSICSTAR_DY = "Classic Star"
	static NAME_SLOT_WITCHPUMPKINS_DY = "Witch Pumpkins"
	static NAME_SLOT_PIGGYMANIA_DY = "Piggy Mania"
	static NAME_SLOT_WILDHEARTS_DY = "Wild Hearts"
	static NAME_SLOT_DAKOTAFARMGIRL = "Dakota Farmgirl"
	static NAME_SLOT_BOONANZA = "Boo!nanza"
	static NAME_SLOT_SUITE_RAINBOWPEARL = "Suite Rainbow Pearl"
	static SLOT_SCENEINFO = [{
		sceneName: "02_SevenRush",
		gameId: SDefine.SUBGAMEID_SLOT_SEVENRUSH,
		name: SDefine.NAME_SLOT_SEVENRUSH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "03_WheelOfVegas",
		gameId: SDefine.SUBGAMEID_SLOT_WHEELOFVEGAS,
		name: SDefine.NAME_SLOT_WHEELOFVEGAS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "04_Super25",
		gameId: SDefine.SUBGAMEID_SLOT_SUPER25,
		name: SDefine.NAME_SLOT_SUPER25,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "05_ThunderStrike",
		gameId: SDefine.SUBGAMEID_SLOT_THUNDERSTRIKE,
		name: SDefine.NAME_SLOT_THUNDERSTRIKE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "06_DualWheelAction",
		gameId: SDefine.SUBGAMEID_SLOT_DUALWHEELACTION,
		name: SDefine.NAME_SLOT_DUALWHEELACTION,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "07_BlazingPhoenix",
		gameId: SDefine.SUBGAMEID_SLOT_BLAZINGPHOENIX,
		name: SDefine.NAME_SLOT_BLAZINGPHOENIX,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "08_MajesticLion",
		gameId: SDefine.SUBGAMEID_SLOT_MAJESTICLION,
		name: SDefine.NAME_SLOT_MAJESTICLION,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "09_FortunePot",
		gameId: SDefine.SUBGAMEID_SLOT_FORTUNEPOT,
		name: SDefine.NAME_SLOT_FORTUNEPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "10_NudgeWild",
		gameId: SDefine.SUBGAMEID_SLOT_NUDGEWILD,
		name: SDefine.NAME_SLOT_NUDGEWILD,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "11_BlackAndWhiteTiger",
		gameId: SDefine.SUBGAMEID_SLOT_BLACKWHITETIGER,
		name: SDefine.NAME_SLOT_BLACKWHITETIGER,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "12_TajMahalPrincess",
		gameId: SDefine.SUBGAMEID_SLOT_TAJMAHALPRINCESS,
		name: SDefine.NAME_SLOT_TAJMAHALPRINCESS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "13_TheMightyViking",
		gameId: SDefine.SUBGAMEID_SLOT_THEMIGHTYVIKING,
		name: SDefine.NAME_SLOT_THEMIGHTYVIKING,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "14_SuperNineBells",
		gameId: SDefine.SUBGAMEID_SLOT_SUPERNINEBELLS,
		name: SDefine.NAME_SLOT_SUPERNINEBELLS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "15_GoldenCrown",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENCROWN,
		name: SDefine.NAME_SLOT_GOLDENCROWN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "16_RhinoBlitz",
		gameId: SDefine.SUBGAMEID_SLOT_RHINOBILITZ,
		name: SDefine.NAME_SLOT_RHINOBILITZ,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "17_RollTheDice",
		gameId: SDefine.SUBGAMEID_SLOT_ROLLTHEDICE,
		name: SDefine.NAME_SLOT_ROLLTHEDICE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "18_MysticGypsy",
		gameId: SDefine.SUBGAMEID_SLOT_MYSTICGYPSY,
		name: SDefine.NAME_SLOT_MYSTICGYPSY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "19_CuriousMermaid",
		gameId: SDefine.SUBGAMEID_SLOT_CURIOUSMERMAID,
		name: SDefine.NAME_SLOT_CURIOUSMERMAID,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "20_DiamondStrike",
		gameId: SDefine.SUBGAMEID_SLOT_DIAMONDSTRIKE,
		name: SDefine.NAME_SLOT_DIAMONDSTRIKE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "21_SantaAndRudolph",
		gameId: SDefine.SUBGAMEID_SLOT_SANTARUDOLPH,
		name: SDefine.NAME_SLOT_SANTARUDOLPH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "22_DragonTales",
		gameId: SDefine.SUBGAMEID_SLOT_DRAGONTALES,
		name: SDefine.NAME_SLOT_DRAGONTALES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "23_OrientalLanterns",
		gameId: SDefine.SUBGAMEID_SLOT_ORIENTALLANTERNS,
		name: SDefine.NAME_SLOT_ORIENTALLANTERNS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "24_KingOfSafari",
		gameId: SDefine.SUBGAMEID_SLOT_KINGOFSAFARI,
		name: SDefine.NAME_SLOT_KINGOFSAFARI,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "25_Bob_Boom_Burst",
		gameId: SDefine.SUBGAMEID_SLOT_BOOMBURST,
		name: SDefine.NAME_SLOT_BOOMBURST,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "26_Bob_Golden_Buffalo",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENBUFFALO,
		name: SDefine.NAME_SLOT_GOLDENBUFFALO,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "27_FireLockClassic",
		gameId: SDefine.SUBGAMEID_SLOT_FIRELOCKCLASSIC,
		name: SDefine.NAME_SLOT_FIRELOCKCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "28_GemDiggerJoe",
		gameId: SDefine.SUBGAMEID_SLOT_GEMDIGGERJOE,
		name: SDefine.NAME_SLOT_GEMDIGGERJOE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "29_PharaohSecrets",
		gameId: SDefine.SUBGAMEID_SLOT_PHARAOHSECRETS,
		name: SDefine.NAME_SLOT_PHARAOHSECRETS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "30_100XDollar",
		gameId: SDefine.SUBGAMEID_SLOT_100XDOLLAR,
		name: SDefine.NAME_SLOT_100XDOLLAR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "31_MagicLamp",
		gameId: SDefine.SUBGAMEID_SLOT_MAGICLAMP,
		name: SDefine.NAME_SLOT_MAGICLAMP,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "32_ReturnOfCaptainHook",
		gameId: SDefine.SUBGAMEID_SLOT_RETURNOFCAPTAINHOOK,
		name: SDefine.NAME_SLOT_RETURNOFCAPTAINHOOK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "33_American9Eagles",
		gameId: SDefine.SUBGAMEID_SLOT_AMERICAN9EAGLES,
		name: SDefine.NAME_SLOT_AMERICAN9EAGLES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "34_SiShenFortunes",
		gameId: SDefine.SUBGAMEID_SLOT_SISHENFORTUNES,
		name: SDefine.NAME_SLOT_SISHENFORTUNES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "35_BirdJackpot",
		gameId: SDefine.SUBGAMEID_SLOT_BIRDJACKPOT,
		name: SDefine.NAME_SLOT_BIRDJACKPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "36_NudgingLockClassic",
		gameId: SDefine.SUBGAMEID_SLOT_NUDGINGLOCKCLASSIC,
		name: SDefine.NAME_SLOT_NUDGINGLOCKCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "37_FruityJewels",
		gameId: SDefine.SUBGAMEID_SLOT_FRUITYJEWELS,
		name: SDefine.NAME_SLOT_FRUITYJEWELS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "38_Bob_01_WildWolf",
		gameId: SDefine.SUBGAMEID_SLOT_WILDWOLF,
		name: SDefine.NAME_SLOT_WILDWOLF,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "39_CashDash",
		gameId: SDefine.SUBGAMEID_SLOT_CASHDASH,
		name: SDefine.NAME_SLOT_CASHDASH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "40_OktoberfestBierhaus",
		gameId: SDefine.SUBGAMEID_SLOT_OKTOBERFESTBIERHAUS,
		name: SDefine.NAME_SLOT_OKTOBERFESTBIERHAUS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "41_BellStrikeFrenzy",
		gameId: SDefine.SUBGAMEID_SLOT_BELLSTRIKEFRENZY,
		name: SDefine.NAME_SLOT_BELLSTRIKEFRENZY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "42_Pumpkinfortune",
		gameId: SDefine.SUBGAMEID_SLOT_PUMPKINFORTUNE,
		name: SDefine.NAME_SLOT_PUMPKINFORTUNE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "43_Golden100xDollar",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDEN100XDOLLAR,
		name: SDefine.NAME_SLOT_GOLDEN100XDOLLAR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "44_FatTurkeyWilds",
		gameId: SDefine.SUBGAMEID_SLOT_FATTURKEYWILDS,
		name: SDefine.NAME_SLOT_FATTURKEYWILDS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "45_Wrath_of_Zeus",
		gameId: SDefine.SUBGAMEID_SLOT_WRATHOFZEUS,
		name: SDefine.NAME_SLOT_WRATHOFZEUS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "46_FrozenThroneRespin",
		gameId: SDefine.SUBGAMEID_SLOT_FROZENTHRONERESPIN,
		name: SDefine.NAME_SLOT_FROZENTHRONERESPIN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "47_CasinoRoyale",
		gameId: SDefine.SUBGAMEID_SLOT_CASINOROYALE,
		name: SDefine.NAME_SLOT_CASINOROYALE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "48_Gummytummywild",
		gameId: SDefine.SUBGAMEID_SLOT_GUMMYTUMMYWILD,
		name: SDefine.NAME_SLOT_GUMMYTUMMYWILD,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "49_Super25Deluxe",
		gameId: SDefine.SUBGAMEID_SLOT_SUPER25DELUXE,
		name: SDefine.NAME_SLOT_SUPER25DELUXE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "50_FortuneTree",
		gameId: SDefine.SUBGAMEID_SLOT_FORTUNETREE,
		name: SDefine.NAME_SLOT_FORTUNETREE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "51_Shanghaifullmoon",
		gameId: SDefine.SUBGAMEID_SLOT_SHANGHAIFULLMOON,
		name: SDefine.NAME_SLOT_SHANGHAIFULLMOON,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "52_Canival_in_Rio",
		gameId: SDefine.SUBGAMEID_SLOT_CARNIVALINRIO,
		name: SDefine.NAME_SLOT_CARNIVALINRIO,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "53_FireBlastClassic",
		gameId: SDefine.SUBGAMEID_SLOT_FIREBLASTCLASSIC,
		name: SDefine.NAME_SLOT_FIREBLASTCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "56_AliceinWonderland",
		gameId: SDefine.SUBGAMEID_SLOT_ALICEINWONDERLAND,
		name: SDefine.NAME_SLOT_ALICEINWONDERLAND,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "54_Leprechaunluckrespin",
		gameId: SDefine.SUBGAMEID_SLOT_LEPRECHAUNLUCKYRESPINS,
		name: SDefine.NAME_SLOT_LEPRECHAUNLUCKYRESPINS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "55_RainbowPearl",
		gameId: SDefine.SUBGAMEID_SLOT_RAINBOWPEARL,
		name: SDefine.NAME_SLOT_RAINBOWPEARL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "57_PharaohsBeetlelink",
		gameId: SDefine.SUBGAMEID_SLOT_PHARAOHSBEETLELINK,
		name: SDefine.NAME_SLOT_PHARAOHSBEETLELINK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "58_Frankendualshock",
		gameId: SDefine.SUBGAMEID_SLOT_FRANKENDUALSHOCK,
		name: SDefine.NAME_SLOT_FRANKENDUALSHOCK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "59_LuckyAmericanRoll",
		gameId: SDefine.SUBGAMEID_SLOT_LUCKYAMERICANROLL,
		name: SDefine.NAME_SLOT_LUCKYAMERICANROLL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "60_MidasTouchOfRiches",
		gameId: SDefine.SUBGAMEID_SLOT_MIDASTOUCHOFRICHES,
		name: SDefine.NAME_SLOT_MIDASTOUCHOFRICHES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "61_TripleBlastClassic",
		gameId: SDefine.SUBGAMEID_SLOT_TRIPLEBLASTCLASSIC,
		name: SDefine.NAME_SLOT_TRIPLEBLASTCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "62_ClassicLocknRollGrand",
		gameId: SDefine.SUBGAMEID_SLOT_CLASSICLOCKROLLGRAND,
		name: SDefine.NAME_SLOT_CLASSICLOCKROLLGRAND,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "63_4thOfJulyWildRespin",
		gameId: SDefine.SUBGAMEID_SLOT_FOURTHOFJULYWILDRESPIN,
		name: SDefine.NAME_SLOT_FOURTHOFJULYWILDRESPIN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "64_MakeItRain",
		gameId: SDefine.SUBGAMEID_SLOT_MAKEITRAIN,
		name: SDefine.NAME_SLOT_MAKEITRAIN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "65_Blazingbullwild",
		gameId: SDefine.SUBGAMEID_SLOT_BLAZINGBULLWILD,
		name: SDefine.NAME_SLOT_BLAZINGBULLWILD,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "66_Alohahawaii",
		gameId: SDefine.SUBGAMEID_SLOT_ALOHAHAWAII,
		name: SDefine.NAME_SLOT_ALOHAHAWAII,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "67_LollylandGummyKing",
		gameId: SDefine.SUBGAMEID_SLOT_LOLLYLANDGUMMYKING,
		name: SDefine.NAME_SLOT_LOLLYLANDGUMMYKING,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: false
	}, {
		sceneName: "68_Abracadabra",
		gameId: SDefine.SUBGAMEID_SLOT_ABRACADABRA,
		name: SDefine.NAME_SLOT_ABRACADABRA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "69_DiamondBeamJackpot",
		gameId: SDefine.SUBGAMEID_SLOT_DIAMONDBEAMJACKPOT,
		name: SDefine.NAME_SLOT_DIAMONDBEAMJACKPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "70_PiggyBankRiches",
		gameId: SDefine.SUBGAMEID_SLOT_PIGGYBANKRICHES,
		name: SDefine.NAME_SLOT_PIGGYBANKRICHES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "71_Dreamcitylights",
		gameId: SDefine.SUBGAMEID_SLOT_DREAMCITYLIGHTS,
		name: SDefine.NAME_SLOT_DREAMCITYLIGHTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "72_EmeraldGreen",
		gameId: SDefine.SUBGAMEID_SLOT_EMERALDGREEN,
		name: SDefine.NAME_SLOT_EMERALDGREEN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "73_Ghosthunters",
		gameId: SDefine.SUBGAMEID_SLOT_GHOSTHUNTERS,
		name: SDefine.NAME_SLOT_GHOSTHUNTERS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "74_MegatonDynamite",
		gameId: SDefine.SUBGAMEID_SLOT_MEGATONDYNAMITE,
		name: SDefine.NAME_SLOT_MEGATONDYNAMITE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "76_Shopaholic",
		gameId: SDefine.SUBGAMEID_SLOT_SHOPAHOLIC,
		name: SDefine.NAME_SLOT_SHOPAHOLIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "75_GoldenBuffaloFever",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENBUFFALOFEVER,
		name: SDefine.NAME_SLOT_GOLDENBUFFALOFEVER,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "77_RudolphExpress",
		gameId: SDefine.SUBGAMEID_SLOT_RUDOLPHEXPRESS,
		name: SDefine.NAME_SLOT_RUDOLPHEXPRESS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "78_HoneyBeeparade",
		gameId: SDefine.SUBGAMEID_SLOT_HONEYBEEPARADE,
		name: SDefine.NAME_SLOT_HONEYBEEPARADE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "79_HighRiseJackpot",
		gameId: SDefine.SUBGAMEID_SLOT_HIGHRISEJACKPOT,
		name: SDefine.NAME_SLOT_HIGHRISEJACKPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "80_Bankofwealth",
		gameId: SDefine.SUBGAMEID_SLOT_BANKOFWEALTH,
		name: SDefine.NAME_SLOT_BANKOFWEALTH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "81_CupidsLoveWheel",
		gameId: SDefine.SUBGAMEID_SLOT_CUPIDSLOVEWHEEL,
		name: SDefine.NAME_SLOT_CUPIDSLOVEWHEEL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "82_LeprechaunMagicDrop",
		gameId: SDefine.SUBGAMEID_SLOT_LEPRECHAUNMAGICDROP,
		name: SDefine.NAME_SLOT_LEPRECHAUNMAGICDROP,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "83_CashShowdown",
		gameId: SDefine.SUBGAMEID_SLOT_CASHSHOWDOWN,
		name: SDefine.NAME_SLOT_CASHSHOWDOWN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "84_MayanTempleMagic",
		gameId: SDefine.SUBGAMEID_SLOT_MAYANTEMPLEMAGIC,
		name: SDefine.NAME_SLOT_MAYANTEMPLEMAGIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "85_FlameFuryWheel",
		gameId: SDefine.SUBGAMEID_SLOT_FLAMEFURYWHEEL,
		name: SDefine.NAME_SLOT_FLAMEFURYWHEEL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "86_ChiliChiliFever",
		gameId: SDefine.SUBGAMEID_SLOT_CHILICHILIFEVER,
		name: SDefine.NAME_SLOT_CHILICHILIFEVER,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "87_ImperialgoldFortune",
		gameId: SDefine.SUBGAMEID_SLOT_IMPERIALGOLDFORTUNE,
		name: SDefine.NAME_SLOT_IMPERIALGOLDFORTUNE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "88_AmericanValor",
		gameId: SDefine.SUBGAMEID_SLOT_AMERICANVALOR,
		name: SDefine.NAME_SLOT_AMERICANVALOR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "89_BingoTrio",
		gameId: SDefine.SUBGAMEID_SLOT_BINGOTRIO,
		name: SDefine.NAME_SLOT_BINGOTRIO,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "90_FireLockUltimate",
		gameId: SDefine.SUBGAMEID_SLOT_FIRELOCKULTIMATE,
		name: SDefine.NAME_SLOT_FIRELOCKULTIMATE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "91_GreatAmerica",
		gameId: SDefine.SUBGAMEID_SLOT_GREATAMERICA,
		name: SDefine.NAME_SLOT_GREATAMERICA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "92_KongFury",
		gameId: SDefine.SUBGAMEID_SLOT_KONGFURY,
		name: SDefine.NAME_SLOT_KONGFURY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "93_SharkAttack",
		gameId: SDefine.SUBGAMEID_SLOT_SHARKATTACK,
		name: SDefine.NAME_SLOT_SHARKATTACK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "95_PinkStarDiamond",
		gameId: SDefine.SUBGAMEID_SLOT_PINKSTARDIAMONDS,
		name: SDefine.NAME_SLOT_PINKSTARDIAMONDS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "94_KingdominPeril",
		gameId: SDefine.SUBGAMEID_SLOT_KINGDOMINPERIL,
		name: SDefine.NAME_SLOT_KINGDOMINPERIL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "96_PiggyHouses",
		gameId: SDefine.SUBGAMEID_SLOT_PIGGYHOUSES,
		name: SDefine.NAME_SLOT_PIGGYHOUSES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "97_Jiujiujiu999",
		gameId: SDefine.SUBGAMEID_SLOT_JIUJIUJIU999,
		name: SDefine.NAME_SLOT_JIUJIUJIU999,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "98_FantasticEagles",
		gameId: SDefine.SUBGAMEID_SLOT_FANTASTICEAGLES,
		name: SDefine.NAME_SLOT_FANTASTICEAGLES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: false,
		isPortrait: true
	}, {
		sceneName: "101_CashShowDownClassic",
		gameId: SDefine.SUBGAMEID_SLOT_CASHSHOWDOWNCLASSIC,
		name: SDefine.NAME_SLOT_CASHSHOWDOWNCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "99_MoonlightWolf",
		gameId: SDefine.SUBGAMEID_SLOT_MOONLIGHTWOLF,
		name: SDefine.NAME_SLOT_MOONLIGHTWOLF,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "100_SpookyNight",
		gameId: SDefine.SUBGAMEID_SLOT_SPOOKYNIGHT,
		name: SDefine.NAME_SLOT_SPOOKYNIGHT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "102_Fatbilly",
		gameId: SDefine.SUBGAMEID_SLOT_FATBILLY,
		name: SDefine.NAME_SLOT_FATBILLY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "103_GoldenTrain",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENTRAIN,
		name: SDefine.NAME_SLOT_GOLDENTRAIN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "104_RapidHitAntarctic",
		gameId: SDefine.SUBGAMEID_SLOT_RAPIDHITANTARCTIC,
		name: SDefine.NAME_SLOT_RAPIDHITANTARCTIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "106_MarineAdventure",
		gameId: SDefine.SUBGAMEID_SLOT_MARINEADVENTURE,
		name: SDefine.NAME_SLOT_MARINEADVENTURE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "107_BigBucksBounty",
		gameId: SDefine.SUBGAMEID_SLOT_BIGBUCKSBOUNTY,
		name: SDefine.NAME_SLOT_BIGBUCKSBOUNTY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "105_BabySantaWild",
		gameId: SDefine.SUBGAMEID_SLOT_BABYSANTAWILD,
		name: SDefine.NAME_SLOT_BABYSANTAWILD,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "109_WinYourHeart",
		gameId: SDefine.SUBGAMEID_SLOT_WINYOURHEART,
		name: SDefine.NAME_SLOT_WINYOURHEART,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "108_WudangJianshi",
		gameId: SDefine.SUBGAMEID_SLOT_WUDANGJIANSHI,
		name: SDefine.NAME_SLOT_WUDANGJIANSHI,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "110_FruityBlast",
		gameId: SDefine.SUBGAMEID_SLOT_FRUITYBLAST,
		name: SDefine.NAME_SLOT_FRUITYBLAST,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "112_TheBiggame",
		gameId: SDefine.SUBGAMEID_SLOT_THEBIGGAME,
		name: SDefine.NAME_SLOT_THEBIGGAME,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "111_ShamrockLock",
		gameId: SDefine.SUBGAMEID_SLOT_SHAMROCKLOCK,
		name: SDefine.NAME_SLOT_SHAMROCKLOCK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "113_WildFiremen",
		gameId: SDefine.SUBGAMEID_SLOT_WILDFIREMEN,
		name: SDefine.NAME_SLOT_WILDFIREMEN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "114_Bunnybank",
		gameId: SDefine.SUBGAMEID_SLOT_BUNNYBANK,
		name: SDefine.NAME_SLOT_BUNNYBANK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "115_thearcanealchemist",
		gameId: SDefine.SUBGAMEID_SLOT_THEARCANEALCHEMIST,
		name: SDefine.NAME_SLOT_THEARCANEALCHEMIST,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "116_Pinataparade",
		gameId: SDefine.SUBGAMEID_SLOT_PINATAPARADE,
		name: SDefine.NAME_SLOT_PINATAPARADE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "118_SevenGlory",
		gameId: SDefine.SUBGAMEID_SLOT_SEVENGLORY,
		name: SDefine.NAME_SLOT_SEVENGLORY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "117_WaikikiSanta",
		gameId: SDefine.SUBGAMEID_SLOT_WAIKIKISANTA,
		name: SDefine.NAME_SLOT_WAIKIKISANTA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "119_WickedLilDevil",
		gameId: SDefine.SUBGAMEID_SLOT_WICKEDLILDEVIL,
		name: SDefine.NAME_SLOT_WICKEDLILDEVIL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: false
	}, {
		sceneName: "121_GoldenEagleKing",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENEAGLEKING,
		name: SDefine.NAME_SLOT_GOLDENEAGLEKING,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "120_PilingFortunes",
		gameId: SDefine.SUBGAMEID_SLOT_PILINGFORTUNES,
		name: SDefine.NAME_SLOT_PILINGFORTUNES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "122_PhoenixIgnite",
		gameId: SDefine.SUBGAMEID_SLOT_PHOENIXIGNITE,
		name: SDefine.NAME_SLOT_PHOENIXIGNITE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "123_Vivalasvegas",
		gameId: SDefine.SUBGAMEID_SLOT_VIVALASVEGAS,
		name: SDefine.NAME_SLOT_VIVALASVEGAS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "124_Jollyrogerjackpot",
		gameId: SDefine.SUBGAMEID_SLOT_JOLLYROGERJACKPOT,
		name: SDefine.NAME_SLOT_JOLLYROGERJACKPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "125_HoroscopeBlessings",
		gameId: SDefine.SUBGAMEID_SLOT_HOROSCOPEBLESSINGS,
		name: SDefine.NAME_SLOT_HOROSCOPEBLESSINGS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "126_Supernovablasts",
		gameId: SDefine.SUBGAMEID_SLOT_SUPERNOVABLASTS,
		name: SDefine.NAME_SLOT_SUPERNOVABLASTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "127_MoneyStax",
		gameId: SDefine.SUBGAMEID_SLOT_MONEYSTAX,
		name: SDefine.NAME_SLOT_MONEYSTAX,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "128_Foruneshrine",
		gameId: SDefine.SUBGAMEID_SLOT_FORTUNESHRINE,
		name: SDefine.NAME_SLOT_FORTUNESHRINE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "129_VampressMansion",
		gameId: SDefine.SUBGAMEID_SLOT_VAMPRESSMANSION,
		name: SDefine.NAME_SLOT_VAMPRESSMANSION,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "130_VolcanicTahiti",
		gameId: SDefine.SUBGAMEID_SLOT_VOLCANICTAHITI,
		name: SDefine.NAME_SLOT_VOLCANICTAHITI,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "131_MeowgicalHalloween",
		gameId: SDefine.SUBGAMEID_SLOT_MEOWGICALHALLOWEEN,
		name: SDefine.NAME_SLOT_MEOWGICALHALLOWEEN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "132_FlameOfLiberty",
		gameId: SDefine.SUBGAMEID_SLOT_FLAMEOFLIBERTY,
		name: SDefine.NAME_SLOT_FLAMEOFLIBERTY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "133_ThanksgivingGalore",
		gameId: SDefine.SUBGAMEID_SLOT_THANKSGIVINGGALORE,
		name: SDefine.NAME_SLOT_THANKSGIVINGGALORE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "134_WildBunch",
		gameId: SDefine.SUBGAMEID_SLOT_WILDBUNCH,
		name: SDefine.NAME_SLOT_WILDBUNCH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "135_BonanzaExpress",
		gameId: SDefine.SUBGAMEID_SLOT_BONANZAEXPRESS,
		name: SDefine.NAME_SLOT_BONANZAEXPRESS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "136_ChristmasBlings",
		gameId: SDefine.SUBGAMEID_SLOT_CHRISTMASBLINGS,
		name: SDefine.NAME_SLOT_CHRISTMASBLINGS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "137_TripleWheelSupreme",
		gameId: SDefine.SUBGAMEID_SLOT_TRIPLEWHEELSUPREME,
		name: SDefine.NAME_SLOT_TRIPLEWHEELSUPREME,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "139_XinNianHao",
		gameId: SDefine.SUBGAMEID_SLOT_XINNIANHAO,
		name: SDefine.NAME_SLOT_XINNIANHAO,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "138_DualDiamondsStrike",
		gameId: SDefine.SUBGAMEID_SLOT_DUALDIAMONDSSTRIKE,
		name: SDefine.NAME_SLOT_DUALDIAMONDSSTRIKE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "140_ZippyJackpots",
		gameId: SDefine.SUBGAMEID_SLOT_ZIPPYJACKPOTS,
		name: SDefine.NAME_SLOT_ZIPPYJACKPOTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "141_TheBeastsSecret",
		gameId: SDefine.SUBGAMEID_SLOT_THEBEASTSSECRET,
		name: SDefine.NAME_SLOT_THEBEASTSSECRET,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "142_RobinHoodSecondShot",
		gameId: SDefine.SUBGAMEID_SLOT_ROBINHOODSECONDSHOT,
		name: SDefine.NAME_SLOT_ROBINHOODSECONDSHOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "143_WinningRolls",
		gameId: SDefine.SUBGAMEID_SLOT_WINNINGROLLS,
		name: SDefine.NAME_SLOT_WINNINGROLLS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "144_LadyOLuck",
		gameId: SDefine.SUBGAMEID_SLOT_LADYOLUCK,
		name: SDefine.NAME_SLOT_LADYOLUCK,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "145_PiggyMania",
		gameId: SDefine.SUBGAMEID_SLOT_PIGGYMANIA,
		name: SDefine.NAME_SLOT_PIGGYMANIA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "146_LuckyBunnyDrop",
		gameId: SDefine.SUBGAMEID_SLOT_LUCKYBUNNYDROP,
		name: SDefine.NAME_SLOT_LUCKYBUNNYDROP,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "147_DragonsAndPearls",
		gameId: SDefine.SUBGAMEID_SLOT_DRAGONSANDPEARLS,
		name: SDefine.NAME_SLOT_DRAGONSANDPEARLS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "149_ClassicStar",
		gameId: SDefine.SUBGAMEID_SLOT_CLASSICSTAR,
		name: SDefine.NAME_SLOT_CLASSICSTAR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "148_AlienAmigos",
		gameId: SDefine.SUBGAMEID_SLOT_ALIENAMIGOS,
		name: SDefine.NAME_SLOT_ALIENAMIGOS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "150_BeaverStacks",
		gameId: SDefine.SUBGAMEID_SLOT_BEAVERSTACKS,
		name: SDefine.NAME_SLOT_BEAVERSTACKS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "152_TheMobKing",
		gameId: SDefine.SUBGAMEID_SLOT_THEMOBKING,
		name: SDefine.NAME_SLOT_THEMOBKING,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "151_DualFortunePot",
		gameId: SDefine.SUBGAMEID_SLOT_DUALFORTUNEPOT,
		name: SDefine.NAME_SLOT_DUALFORTUNEPOT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "153_LadyLibertyRespins",
		gameId: SDefine.SUBGAMEID_SLOT_LADYLIBERTYRESPINS,
		name: SDefine.NAME_SLOT_LADYLIBERTYRESPINS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "154_MegaBingoClassic",
		gameId: SDefine.SUBGAMEID_SLOT_MEGABINGOCLASSIC,
		name: SDefine.NAME_SLOT_MEGABINGOCLASSIC,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "155_RichRichFarm",
		gameId: SDefine.SUBGAMEID_SLOT_RICHRICHFARM,
		name: SDefine.NAME_SLOT_RICHRICHFARM,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "156_GemPackedWilds",
		gameId: SDefine.SUBGAMEID_SLOT_GEMPACKEDWILDS,
		name: SDefine.NAME_SLOT_GEMPACKEDWILDS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "157_JacksMagicBeans",
		gameId: SDefine.SUBGAMEID_SLOT_JACKSMAGICBEANS,
		name: SDefine.NAME_SLOT_JACKSMAGICBEANS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "158_Dr_Madwin",
		gameId: SDefine.SUBGAMEID_SLOT_DRMADWIN,
		name: SDefine.NAME_SLOT_DRMADWIN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "159_CandyCastle",
		gameId: SDefine.SUBGAMEID_SLOT_CANDYCASTLE,
		name: SDefine.NAME_SLOT_CANDYCASTLE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "160_WildHearts",
		gameId: SDefine.SUBGAMEID_SLOT_WILDHEARTS,
		name: SDefine.NAME_SLOT_WILDHEARTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "03_RainbowPearl_Suite",
		gameId: SDefine.SUBGAMEID_SLOT_RAINBOWPEARL_DY,
		name: SDefine.NAME_SLOT_RAINBOWPEARL_DY,
		prefabName: "RainbowPearl_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "161_RaccoonShowdown",
		gameId: SDefine.SUBGAMEID_SLOT_RACOONSHOWDOWN,
		name: SDefine.NAME_SLOT_RACOONSHOWDOWN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "162_Witchpumpkins",
		gameId: SDefine.SUBGAMEID_SLOT_WITCHPUMPKINS,
		name: SDefine.NAME_SLOT_WITCHPUMPKINS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "163_MagmaFicent",
		gameId: SDefine.SUBGAMEID_SLOT_MAGMAFICENT,
		name: SDefine.NAME_SLOT_MAGMAFICENT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "01_100XDollar_Suite",
		gameId: SDefine.SUBGAMEID_SLOT_100XDOLLAR_DY,
		name: SDefine.NAME_SLOT_100XDOLLAR_DY,
		prefabName: "100XDollar_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "02_Super25Deluxe_Suite",
		gameId: SDefine.SUBGAMEID_SLOT_SUPER25DELUXE_DY,
		name: SDefine.NAME_SLOT_SUPER25DELUXE_DY,
		prefabName: "Super25Deluxe_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "04_PharaohsBeetlelink_Suite",
		gameId: SDefine.SUBGAMEID_SLOT_PHARAOHSBEETLELINK_DY,
		name: SDefine.NAME_SLOT_PHARAOHSBEETLELINK_DY,
		prefabName: "PharaohsBeetleLink_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "05_DualFortunePot_Suite",
		gameId: SDefine.SUBGAMEID_SLOT_DUALFORTUNEPOT_DY,
		name: SDefine.NAME_SLOT_DUALFORTUNEPOT_DY,
		prefabName: "DualFurtunePot_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "156_GemPackedWilds_DY",
		gameId: SDefine.SUBGAMEID_SLOT_GEMPACKEDWILDS_DY,
		name: SDefine.NAME_SLOT_GEMPACKEDWILDS_DY,
		prefabName: "GemPackedWilds_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "164_Dakota_Farmgirl",
		gameId: SDefine.SUBGAMEID_SLOT_DAKOTAFARMGIRL,
		name: SDefine.NAME_SLOT_DAKOTAFARMGIRL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "165_BooNanza",
		gameId: SDefine.SUBGAMEID_SLOT_BOONANZA,
		name: SDefine.NAME_SLOT_BOONANZA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "166_StarryHolidays",
		gameId: SDefine.SUBGAMEID_SLOT_STARRYHOLIDAY,
		name: SDefine.NAME_SLOT_STARRYHOLIDAY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "167_Ding_Dong_Jackpots",
		gameId: SDefine.SUBGAMEID_SLOT_DINGDONGJACKPOTS,
		name: SDefine.NAME_SLOT_DINGDONGJACKPOTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "168_LocknRollFiver",
		gameId: SDefine.SUBGAMEID_SLOT_LOCKNROLLFIVER,
		name: SDefine.NAME_SLOT_LOCKNROLLFIVER,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "169_Hoarding_Goblins",
		gameId: SDefine.SUBGAMEID_SLOT_HOARDINGGOBLINS,
		name: SDefine.NAME_SLOT_HOARDINGGOBLINS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "170_CupidLoveSpells",
		gameId: SDefine.SUBGAMEID_SLOT_CUPIDLOVESPELLS,
		name: SDefine.NAME_SLOT_CUPIDLOVESPELLS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "707_MoonlightWolf_DY",
		gameId: SDefine.SUBGAMEID_SLOT_MOONLIGHTWOLF_DY,
		name: SDefine.NAME_SLOT_MOONLIGHTWOLF_DY,
		prefabName: "MoonLightWolf_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "171_Golden_Moon_Fortune",
		gameId: SDefine.SUBGAMEID_SLOT_GOLDENMOONFORTUNE,
		name: SDefine.NAME_SLOT_GOLDENMOONFORTUNE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "708_PhoenixIgnite_DY",
		gameId: SDefine.SUBGAMEID_SLOT_PHOENIXIGNITE_DY,
		name: SDefine.NAME_SLOT_PHOENIXIGNITE_DY,
		prefabName: "PhoenixIgnite_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "172_CashShowdownDeluxe",
		gameId: SDefine.SUBGAMEID_SLOT_CASHSHOWDOWNDELUXE,
		name: SDefine.NAME_SLOT_CASHSHOWDOWNDELUXE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "173_zeusthundershower",
		gameId: SDefine.SUBGAMEID_SLOT_ZEUSTHUNDERSHOWER,
		name: SDefine.NAME_SLOT_ZEUSTHUNDERSHOWER,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "174_SuperSevenBlasts",
		gameId: SDefine.SUBGAMEID_SLOT_SUPERSEVENBLASTS,
		name: SDefine.NAME_SLOT_SUPERSEVENBLASTS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "175_ChronosphereEgypt",
		gameId: SDefine.SUBGAMEID_SLOT_CHRONOSPHEREEGYPT,
		name: SDefine.NAME_SLOT_CHRONOSPHAREEGYPT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "176_Bloodgems",
		gameId: SDefine.SUBGAMEID_SLOT_BLOODGEMS,
		name: SDefine.NAME_SLOT_BLOODGEMS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "177_AztecOdyssey",
		gameId: SDefine.SUBGAMEID_SLOT_AZTECODYSSEY,
		name: SDefine.NAME_SLOT_AZTECODYSSEY,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "178_SuperDrumBash",
		gameId: SDefine.SUBGAMEID_SLOT_SUPERDRUMBASH,
		name: SDefine.NAME_SLOT_SUPERDRUMBASH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "179_AllAmerican",
		gameId: SDefine.SUBGAMEID_SLOT_ALLAMERICAN,
		name: SDefine.NAME_SLOT_ALLAMERICAN,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "180_PirateBootyRapidHit",
		gameId: SDefine.SUBGAMEID_SLOT_PIRATEBOOTYRAPIDHIT,
		name: SDefine.NAME_SLOT_PIRATEBOOTYRAPIDHIT,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "181_JurassicWildStomps",
		gameId: SDefine.SUBGAMEID_SLOT_JURASSICWILDSTOMPS,
		name: SDefine.NAME_SLOT_JURASSICWILDSTOMPS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "182_AllStarCircus",
		gameId: SDefine.SUBGAMEID_SLOT_ALLSTARCIRCUS,
		name: SDefine.NAME_SLOT_ALLSTARCIRCUS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "183_HoundOfHades",
		gameId: SDefine.SUBGAMEID_SLOT_HOUNDOFHADES,
		name: SDefine.NAME_SLOT_HOUNDOFHADES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "184_JumboPiggies",
		gameId: SDefine.SUBGAMEID_SLOT_JUMBOPIGGIES,
		name: SDefine.NAME_SLOT_JUMBOPIGGIES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "185_Pawsome_Panda",
		gameId: SDefine.SUBGAMEID_SLOT_PAWSOMEPANDA,
		name: SDefine.NAME_SLOT_PAWSOMEPANDA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "186_ThePurrGlar",
		gameId: SDefine.SUBGAMEID_SLOT_THEPURRGLAR,
		name: SDefine.NAME_SLOT_THEPURRGLAR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "187_DragonOrbs",
		gameId: SDefine.SUBGAMEID_SLOT_DRAGONORBS,
		name: SDefine.NAME_SLOT_DRAGONORBS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "188_Tomeoffate",
		gameId: SDefine.SUBGAMEID_SLOT_TOMEOFFATE,
		name: SDefine.NAME_SLOT_TOMEOFFATE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "190_CaptainBlackpurr",
		gameId: SDefine.SUBGAMEID_SLOT_CAPTAINBLACKPURR,
		name: SDefine.NAME_SLOT_CAPTAINBLACKPURR,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "189_ShanghaiExpress",
		gameId: SDefine.SUBGAMEID_SLOT_SHANGHAIEXPRESS,
		name: SDefine.NAME_SLOT_SHANGHAIEXPRESS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "191_SmashNCash",
		gameId: SDefine.SUBGAMEID_SLOT_SMASHNCASH,
		name: SDefine.NAME_SLOT_SMASHNCASH,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "192_TempleofAthena",
		gameId: SDefine.SUBGAMEID_SLOT_TEMPLEOFATHENA,
		name: SDefine.NAME_SLOT_TEMPLEOFATHENA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "193_NuttySquirrel",
		gameId: SDefine.SUBGAMEID_SLOT_NUTTYSQUIRREL,
		name: SDefine.NAME_SLOT_NUTTYSQUIRREL,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "194_WitchsApples",
		gameId: SDefine.SUBGAMEID_SLOT_WITCHSAPPLES,
		name: SDefine.NAME_SLOT_WITCHSAPPLES,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "195_TalesofArcadia",
		gameId: SDefine.SUBGAMEID_SLOT_TALESOFARCADIA,
		name: SDefine.NAME_SLOT_TALESOFARCADIA,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "196_WildsIgniteRespins",
		gameId: SDefine.SUBGAMEID_SLOT_WILDSIGNITERESPINS,
		name: SDefine.NAME_SLOT_WILDSIGNITERESPINS,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "197_PinupParadise",
		gameId: SDefine.SUBGAMEID_SLOT_PINUPPARADISE,
		name: SDefine.NAME_SLOT_PINUPPARADISE,
		prefabName: "simpleImg",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "709_FireLockClassic_DY",
		gameId: SDefine.SUBGAMEID_SLOT_FIRELOCKCLASSIC_DY,
		name: SDefine.NAME_SLOT_FIRELOCKCLASSIC_DY,
		prefabName: "FireLockClassic_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "710_CasinoRoyale_DY",
		gameId: SDefine.SUBGAMEID_SLOT_CASINOROYALE_DY,
		name: SDefine.NAME_SLOT_CASINOROYALE_DY,
		prefabName: "CasinoRoyale_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "711_NudgingLockClassic_DY",
		gameId: SDefine.SUBGAMEID_SLOT_NUDGINGLOCKCLASSIC_DY,
		name: SDefine.NAME_SLOT_NUDGINGLOCKCLASSIC_DY,
		prefabName: "NudgingLockClassic_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "712_PiggyBankRiches_DY",
		gameId: SDefine.SUBGAMEID_SLOT_PIGGYBANKRICHES_DY,
		name: SDefine.NAME_SLOT_PIGGYBANKRICHES_DY,
		prefabName: "PiggyBankRiches_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "713_BirdJackpot_DY",
		gameId: SDefine.SUBGAMEID_SLOT_BIRDJACKPOT_DY,
		name: SDefine.NAME_SLOT_BIRDJACKPOT_DY,
		prefabName: "BirdJackpot_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "714_Alohahawaii_DY",
		gameId: SDefine.SUBGAMEID_SLOT_ALOHAHAWAII_DY,
		name: SDefine.NAME_SLOT_ALOHAHAWAII_DY,
		prefabName: "AlohaHawaii_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "715_Wrath_of_Zeus_DY",
		gameId: SDefine.SUBGAMEID_SLOT_WRATHOFZEUS_DY,
		name: SDefine.NAME_SLOT_WRATHOFZEUS_DY,
		prefabName: "WrathofZeus_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "716_Bunnybank_DY",
		gameId: SDefine.SUBGAMEID_SLOT_BUNNYBANK_DY,
		name: SDefine.NAME_SLOT_BUNNYBANK_DY,
		prefabName: "BunnyBank_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "717_ClassicStar_DY",
		gameId: SDefine.SUBGAMEID_SLOT_CLASSICSTAR_DY,
		name: SDefine.NAME_SLOT_CLASSICSTAR_DY,
		prefabName: "ClassicStar_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "718_WitchPumpkins_DY",
		gameId: SDefine.SUBGAMEID_SLOT_WITCHPUMPKINS_DY,
		name: SDefine.NAME_SLOT_WITCHPUMPKINS_DY,
		prefabName: "WitchPumpkins_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}, {
		sceneName: "719_PiggyMania_DY",
		gameId: SDefine.SUBGAMEID_SLOT_PIGGYMANIA_DY,
		name: SDefine.NAME_SLOT_PIGGYMANIA_DY,
		prefabName: "PiggyMania_DY",
		useDev: true,
		useQA: true,
		useLive: true
	}]
	
	static ERR_BASE = 2097152
	static ERR_MINVERSION = 1 | SDefine.ERR_BASE
	static ERR_AUTH_BASE = 3145728
	static ERR_AuthInvalidServiceType = 1 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidUID = 2 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidAUDID = 3 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDDeviceIDDoNotMatch = 4 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDFacebookIDDoNotMatch = 5 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDAppleIDDoNotMatch = 6 | SDefine.ERR_AUTH_BASE
	static ERR_AuthFacebookSyncError = 7 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidRequest = 8 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidFacebookToken = 9 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidLynxAuthToken = 10 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidAppleToken = 11 | SDefine.ERR_AUTH_BASE
	static ERR_AuthChangeUIDByFacebookUID = 12 | SDefine.ERR_AUTH_BASE
	static ERR_AuthChangeUIDByAppleUID = 13 | SDefine.ERR_AUTH_BASE
	static ERR_AuthCantConversionLinkedAppleID = 14 | SDefine.ERR_AUTH_BASE
	static ERR_AuthCantConversionLinkedFacebookUID = 15 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDReqIDDoNotMatch = 16 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDFacebookIDDoNotMatchButLinkable = 17 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDAppleIDDoNotMatchButLinkable = 18 | SDefine.ERR_AUTH_BASE
	static ERR_AuthAccountFBIDnReqFacebookIDDoNotMatch = 19 | SDefine.ERR_AUTH_BASE
	static ERR_AuthAccountAppleIDnReqAppleIDDoNotMatch = 20 | SDefine.ERR_AUTH_BASE
	static ERR_AuthAccountsAUDIDIsEmpty = 21 | SDefine.ERR_AUTH_BASE
	static ERR_AuthAccountUserStateInvalid = 22 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDLineIDDoNotMatch = 23 | SDefine.ERR_AUTH_BASE
	static ERR_AuthChangeUIDByLineID = 24 | SDefine.ERR_AUTH_BASE
	static ERR_AuthCantConversionLinkedLineID = 25 | SDefine.ERR_AUTH_BASE
	static ERR_AuthUIDLineIDDoNotMatchButLinkable = 26 | SDefine.ERR_AUTH_BASE
	static ERR_AuthInvalidLineToken = 27 | SDefine.ERR_AUTH_BASE
	static ERR_AuthAccountLineIDnReqLineIDDoNotMatch = 28 | SDefine.ERR_AUTH_BASE
	static ERR_AUTH_AppleLinked_otherAppleID = 16777230 | SDefine.ERR_AUTH_BASE
	static ERR_AUTH_FacebookLinked_otherFBID = 16777231 | SDefine.ERR_AUTH_BASE
	static ERR_AUTH_LineLinked_otherLineID = 16777232 | SDefine.ERR_AUTH_BASE
	static ERR_PAYMENT_ALREADY_EXIST = 1048584
	static ERR_TOURNEY_ALREADY_END = 4194305
	static LOBBY_SCENE_HIGHROLLER_NAME = "L_Highroller_2024"
	static LOBBY_SCENE_VIP_LOUNGE_NAME = "L_VIP_Lounge_2024"
	static LOBBY_SCENE_LIGHTNING_NAME = "L_Lightning_2024"
	static LOBBY_SCENE_SUITE_LOUNGE_NAME = "L_SUITE_Lounge_2024"
	static HIGHROLLER_ZONEID = 0
	static LIGHTNING_ZONEID = 0
	static VIP_LOUNGE_ZONEID = 1
	static SUITE_ZONEID = 1
	static MAJORROLLER_ZONEID = 1
	static ASTROROLLER_ZONEID = 2
	static HIGHROLLER_ZONENAME = "HighRoller"
	static LIGHTNING_ZONENAME = "Lightning"
	static VIP_LOUNGE_ZONENAME = "VipLounge"
	static SUITE_ZONENAME = "Suite"
	static SUITE_MINBET = 27e5
	static MISSION_SPIN_TOURNEY = "slottourney"
	static TRIPLEJACKPOT_GOLD_TICKET_MODE = 1
	static TRIPLEJACKPOT_DIAMOND_TICKET_MODE = 2
	static I_GAMEMONEY = "i_game_money"
	static I_JOKER_CARD = "i_joker_card"
	static I_RANDOM_JOKER_CARD_1_MORE = "i_random_joker_card_1_more"
	static I_RANDOM_JOKER_CARD_3_MORE = "i_random_joker_card_3_more"
	static I_RANDOM_JOKER_CARD_5_MORE = "i_random_joker_card_5_more"
	static I_FULLED_PIGGY_BANK = "i_fulled_piggy_bank"
	static ITEM_MAJORROLLER_FREETICKET = "i_majorroller_freeticket"
	static ITEM_SUITE_PASS = "i_highroller_suite_freeticket"
	static ITEM_ATTENDANCE_DAILY_10 = "i_attendance_daily_10_10"
	static ITEM_ATTENDANCE_DAILY_30 = "i_attendance_daily_10_30"
	static ITEM_ATTENDANCE_DAILY_50 = "i_attendance_daily_10_50"
	static ITEM_ATTENDANCE_DAILY_60 = "i_attendance_daily_10_60"
	static ITEM_ATTENDANCE_DAILY_100 = "i_attendance_daily_10_100"
	static ITEM_ATTENDANCE_DAILY_10_RE = "i_attendance_daily_10_10_renewal"
	static ITEM_ATTENDANCE_DAILY_30_RE = "i_attendance_daily_10_30_renewal"
	static ITEM_ATTENDANCE_DAILY_60_RE = "i_attendance_daily_10_60_renewal"
	static ITEM_ATTENDANCE_DAILY_100_RE = "i_attendance_daily_10_100_renewal"
	static ITEM_NEWBIE_BINGO_TICKET = "i_newbie_bingo_ticket"
	static ITEM_BINGO_GAMETICKET = "i_bingo_gametecket"
	static ITEM_BINGO_GAMETICKET_REWARD = "i_bingo_gameticket_reward"
	static I_INBOX_FLIPCOIN = "i_inbox_flipcoin"
	static I_INBOX_SCRATCH_EMOJI777 = "i_inbox_scratch_emoji777"
	static I_INBOX_SCRATCH_8DRAGON = "i_inbox_scratch_8dragon"
	static I_INBOX_SCRATCH_LUCK_N_ROLL = "i_inbox_scratch_luck_n_roll"
	static I_INBOX_PIGGIES_LADDERS = "i_inbox_piggies_on_ladders"
	static I_INBOX_LUCKY_WHEEL = "i_inbox_lucky_strike_wheel"
	static I_MAINSHOP_COUPON_ITEM = "i_mainshop_coupon_item"
	static ITEM_LEVEL_UP_BOOSTER = "i_level_booster"
	static TUTORIAL_ITEM = "i_slot_tutorial"
	static I_TRIPLEDIA_JACKPOT_GOLD_TICKET = "i_triple_diamond_jackpot_gold_ticket"
	static I_TRIPLEDIA_JACKPOT_DIAMOND_TICKET = "i_triple_diamond_jackpot_diamond_ticket"
	static I_WONDER_BOX_PRIFIX = "i_wonder_box"
	static I_WONDER_BOX_1 = "i_wonder_box"
	static I_WONDER_BOX_2 = "i_wonder_box"
	static I_WONDER_BOX_3 = "i_wonder_box"
	static I_WONDER_BOX_4 = "i_wonder_box"
	static I_WONDER_BOX_5 = "i_wonder_box"
	static I_BLAST_OFF_CORE = "i_blast_off_core"
	static I_COLLECTION_CARD_PRIFIX = "i_collection_card_pack_"
	static I_COLLECTION_CARD_HERO_PRIFIX = SDefine.I_COLLECTION_CARD_PRIFIX + "hero_"
	static I_COLLECTION_CARD_HERO_PAID_PRIFIX = SDefine.I_COLLECTION_CARD_PRIFIX + "paid_hero_"
	static I_COLLECTION_CARD_PAID_PRIFIX = SDefine.I_COLLECTION_CARD_PRIFIX + "paid_"
	static I_STAR_CARD_PACK_BUNDLE = "i_star_card_pack_bundle"
	static I_COLLECTION_CARD_PACK_1 = "i_collection_card_pack_1"
	static I_COLLECTION_CARD_PACK_2 = "i_collection_card_pack_2"
	static I_COLLECTION_CARD_PACK_3 = "i_collection_card_pack_3"
	static I_COLLECTION_CARD_PACK_4 = "i_collection_card_pack_4"
	static I_COLLECTION_CARD_PACK_5 = "i_collection_card_pack_5"
	static I_COLLECTION_CARD_PACK_HERO_1 = "i_collection_card_pack_hero_1"
	static I_COLLECTION_CARD_PACK_HERO_2 = "i_collection_card_pack_hero_2"
	static I_COLLECTION_CARD_PACK_HERO_3 = "i_collection_card_pack_hero_3"
	static I_COLLECTION_CARD_PACK_HERO_4 = "i_collection_card_pack_hero_4"
	static I_COLLECTION_CARD_PACK_HERO_5 = "i_collection_card_pack_hero_5"
	static I_COLLECTION_CARD_PACK_PAID_HERO_1 = "i_collection_card_pack_paid_hero_1"
	static I_COLLECTION_CARD_PACK_PAID_HERO_2 = "i_collection_card_pack_paid_hero_2"
	static I_COLLECTION_CARD_PACK_PAID_HERO_3 = "i_collection_card_pack_paid_hero_3"
	static I_COLLECTION_CARD_PACK_PAID_HERO_4 = "i_collection_card_pack_paid_hero_4"
	static I_COLLECTION_CARD_PACK_PAID_HERO_5 = "i_collection_card_pack_paid_hero_5"
	static I_COLLECTION_CARD_PACK_PAID_2 = "i_collection_card_pack_paid_2"
	static I_COLLECTION_CARD_PACK_PAID_3 = "i_collection_card_pack_paid_3"
	static I_COLLECTION_CARD_PACK_PAID_4 = "i_collection_card_pack_paid_4"
	static I_COLLECTION_CARD_PACK_PAID_5 = "i_collection_card_pack_paid_5"
	static I_STAR_SHOP_COIN = "i_star_shop_coin"
	static I_SUITE_LEAGUE_SHOP_BALANCE = "i_suite_league_shop_balance"
	static I_COIN_SHOWER_BUBBLE = "i_coin_shower_bubble"
	static I_HERO_FORCE = "i_hero_force"
	static I_HERO_CARD = "i_hero_card"
	static I_SPECIAL_HERO = "i_special_hero"
	static I_BLASTOFF_CARD_PACK_UPGRADE = "i_blast_off_card_pack_upgrade"
	static I_OPEN_CARD_PACK_UPGRADE = "i_open_card_pack_upgrade"
	static I_COIN_SHOWER_TIME_BONUS = "i_coin_shower_time_bonus"
	static I_RAINBOW_DICE_REROLL = "i_rainbow_dice_reroll"
	static I_FIRE_DICE_REROLL = "i_fire_dice_reroll"
	static I_BINGO_FREE_MARKING_BOOST = "i_bingo_free_marking_boost"
	static I_BINGO_CHEST_BOOST = "i_bingo_chest_boost"
	static I_BINGO_MIRRORBALL_BOOST = "i_bingo_mirror_ball_boost"
	static I_BINGOBALL_FREE = "i_bingo_ball"
	static I_BINGOBALL_OFFER = "i_bingo_ball_paid"
	static I_CENTURION_CLIQUE = "i_centurion_clique"
	static I_COLLECTION_CARD_BOUNTY_PRIFIX = "i_bounty_card_pack_"
	static I_DAILYTOPUP_10 = "i_attendance_daily_10_10"
	static I_DAILYTOPUP_30 = "i_attendance_daily_10_30"
	static I_DAILYTOPUP_50 = "i_attendance_daily_10_50"
	static I_DAILYTOPUP_60 = "i_attendance_daily_10_60"
	static I_DAILYTOPUP_100 = "i_attendance_daily_10_100"
	static I_TRIPLE_THRILL_SILVER = "i_triple_thrill_jackpot_sliver"
	static I_TRIPLE_THRILL_GOLD = "i_triple_thrill_jackpot_gold"
	static I_TRIPLE_THRILL_DIAMOND = "i_triple_thrill_jackpot_diamond"
	static I_MEMBERS_CLASS_BOOSTUP = "i_members_class_boostup"
	static I_MEMBERS_CLASS_BOOSTUP_NORMAL = "i_members_class_boostup_normal"
	static I_SUITE_LEAGUE_FEVER_POINT = "i_suite_league_fever_point"
	static I_SUITE_LEAGUE_FEVER_TICKET = "i_suite_league_fever_ticket"
	static I_SUITE_LEAGUE_FEVER_USED_TICKET = "i_suite_league_fever_used_ticket"
	static I_DAILY_STAMP_PREMIUM = "i_daily_stamp_premium"
	static PRODUCT_DAILY_STAMP_PREMIUM = "PRO10101853"
	static I_LEVEL_UP_PASS_PREMIUM = "i_level_pass_premium"
	static I_JOKER_CARD_POINT = "i_joker_card_point"
	static I_COIN_SHOWER_TICKET = "i_coin_shower_ticket"
	static I_DAILY_BONUS_WHEEL_TICKET = "i_daily_bonus_wheel_ticket"
	static I_SPIN_2_WIN_PLAY_TICKET = "i_spin_2_win_play_ticket"
	static I_HYPER_BOUNTY_PASS_POINT = "i_hyper_bounty_pass_point"
	static I_HYPER_BOUNTY_PASS_PREMIUM = "i_hyper_bounty_pass_premium"
	static I_HYPER_BOUNTY_EXTEND_REWARD_BOX = "i_hyper_bounty_extend_reward_box"
	static I_COLLECTION_CARD_HERO_HYBRID_PRIFIX = SDefine.I_COLLECTION_CARD_PRIFIX + "hybrid_hero_"
	static I_COLLECTION_CARD_PACK_HYBRID_HERO_5 = "i_collection_card_pack_hybrid_hero_5"
	static DAILY_TOPUP_INTERVAL = 86400
	static ITEM_TYPE_TIMEBASE = "T"
	static ITEM_TYPE_COUNTBASE = "C"
	static ITEM_TYPE_HYBRID = "H"
	static JACKPOT_DISPLAY_DEFAULT_INTERVAL = .06
	static SENDGIFT_DAILYSEND_REWARD_CNT = 30
	static SENDGIFT_FRIEND_ACTIVE_REWARD = 1e4
	static SENDGIFT_FRIEND_NONACTIVE_REWARD = 5e3
	static DAILYBONUS_FRIENDS_MAX_CNT = 20
	static BINGO_HAVE_MAX_CNT = 150
	static BINGO_FREEGAME_FRIEND_CNT = 10
	static INBOX_RECEIVED_GIFT_CNTLIMIT = 100
	static LOGINTYPE_NOSELECT = 0
	static LOGINTYPE_FACEBOOK = 1
	static LOGINTYPE_GUEST = 2
	static LOGINTYPE_APPLE = 3
	static ATTrackingAuthorizationStatus_NotDetermined = 0
	static ATTrackingAuthorizationStatus_Restricted = 1
	static ATTrackingAuthorizationStatus_Denied = 2
	static ATTrackingAuthorizationStatus_Authorized = 3
	static tutorialBetLine = 3e4
	static _slotSceneInfo = null
	static _slotGameIdInfo = null
	static P_ENTRYPOINT_LOBBYBANKROLL = "LobbyBankroll"
	static P_ENTRYPOINT_INBOXBANNER = "InboxBanner"
	static P_ENTRYPOINT_LOGINTOLOBBY = "LoginToLobby"
	static P_ENTRYPOINT_LOBBYBANNER = "LobbyBanner"
	static P_ENTRYPOINT_MAINSHOPBANNER = "MainShopBanner"
	static P_ENTRYPOINT_SLOTTOLOBBY = "SlotToLobby"
	static P_ENTRYPOINT_LOBBYSHOPBTN = "LobbyShopBtn"
	static P_ENTRYPOINT_REPURCHASEOFFER = "RepurchaseOffer"
	static P_ENTRYPOINT_INGAMEDONGDONG = "IngameDongDong"
	static P_ENTRYPOINT_NOTENOUGHMONEY = "NotEnoughMoney"
	static P_ENTRYPOINT_INGAMEBANKROLL = "IngameBankroll"
	static P_ENTRYPOINT_INGAMEOFFER = "IngameOffer"
	static P_ENTRYPOINT_STARALBUM = "StarAlbum"
	static P_ENTRYPOINT_LOBBYBONUSMENU = "LobbyBonusMenu"
	static P_ENTRYPOINT_INGAMEPIGGYBTN = "IngamePiggyBtn"
	static P_ENTRYPOINT_LOBBYPIGGYBTN = "LobbyPiggyBtn"
	static P_ENTRYPOINT_BINGOSTART = "BingoStart"
	static P_ENTRYPOINT_BINGONOFRIEND = "BingoNofriend"
	static P_ENTRYPOINT_BINGONOFREECARD = "BingNoFreeCard"
	static P_ENTRYPOINT_VIPLIMITOFFER = "VipLimitOffer"
	static P_ENTRYPOINT_VIPLIMITSLOTBANNER = "VipLimitSlotBanner"
	static P_ENTRYPOINT_SUITELIMITSLOTBANNER = "SuiteLimitSlotBanner"
	static P_ENTRYPOINT_FROMFREEREWARDS = "FromFreeRewards"
	static P_ENTRYPOINT_DAILYBLITZ = "DailyBlitz"
	static P_ENTRYPOINT_ADSREMOVEOFFER = "AdsRemoveOffer"
	static P_ENTRYPOINT_BINGOPOPUP = "bingoPopoup"
	static P_ENTRYPOINT_NOTENOUGHBINGOBALLS = "NotEnoughBalls"
	static P_ENTRYPOINT_BINGOGAMEENDSOFFER = "BingoGameEndsOffer"
	static P_ENTRYPOINT_BINGODONGDONG = "BingoDongDong"
	static P_ENTRYPOINT_FISRSTOFFERBANNER = "FirstOfferBanner"
	static P_ENTRYPOINT_DOUBLEUPPOPUP = "DoubleupPopup"
	static P_ENTRYPOINT_BREAKINGNEWSPOPUP = "BreakingNewsPopup"
	static P_ENTRYPOINT_MEMBERSBOOSTUPPOPUP = "MembersBoostUpPopup"
	static P_ENTRYPOINT_ALLMIGHTYCOUPONPOPUP = "AllMightyCouponPopup"
	static P_ENTRYPOINT_InboxCoupon = "InboxCoupon"
	static P_ENTRYPOINT_FIRSTBUYCOUPONPOPUP = "FirstBuyCouponPopup"
	static P_ENTRYPOINT_DAILYSTAMP = "DailyStampPopup"
	static P_ENTRYPOINT_COMMONRESULTPOPUP = "CommonResultPopup"
	static P_ENTRYPOINT_LEVELUP_PASS_PREMIUM_POPUP = "LevelPassPremiumUnlockPopup"
	static P_ENTRYPOINT_REWARD_CENTE_POPUP = "RewardCenterPopup"
	static P_ENTRYPOINT_SPIN_2_WIN_POPUP = "Spin2WinPopup"
	static P_ENTRYPOINT_HYPER_BOUNTY_PASS_POPUP = "HyperBountyPassPopup"
	static AccSite_FBInstant = "fb_instant"
	static AccSite_Facebook = "fb_asid"
	static AccSite_AppleLogin = "apple"
	static AccSite_IOSGuest = "ios_audid"
	static AccSite_AOSGuest = "aos_audid"
	static AccSite_TestGuest = "test_audid"
	static AccSite_LineChennelingLogin = "lineChenneling"
	static FACEBOOK_FANPAGE_URL = "https://www.facebook.com/100063639294375/"
	static TERMS_OF_SERVICE_URL = "https://corp.playlinks.com/terms-of-service"
	static PRIVACY_POLICY_URL = "https://corp.playlinks.com/privacy-policy"
	static CONTACT_URL = "https://highrollervegas.net/contact"
	static PLAYSTORE_URL = "https://play.googlSDefine.com/store/apps/details?id=com.lynxgames.hrv"
	static APPSTORE_URL = "https://itunes.applSDefine.com/us/app/highroller-vegas-casino-slot/id1456325213?mt=8"
	static Lobby = "Lobby"
	static Slot = "Slot"
	static Launcher = "Launcher"
	static LEAGUE_GAME_INTERVAL = 86400
	static Facebook_Submit_20180831 = true
	static LevelBettingLock_Flag = true
	static Mobile_SpineAnimationStart_Flag = false
	static FB_Instant_iOS_Shop_Flag = false
	static Mobile_iOS_PurchaseLimit_Flag = false
	static Mobile_iOS_DownloadNotiPopup_Flag = false
	static FBInstant_PurchaseAPI_Useable = false
	static Mobile_AOS_ReviceVersion_Limitation = false
	static Use_CF_AccelerationServer_Flag = false
	static Use_LoadingPopup_Debug_Flag = false
	static Use_Mobile_Auth_v2 = false
	static Mopub_Expire_3Hour_Check = false
	static Mobile_Use_iOS_Liftoff = false
	static Mobile_Use_FireBase = true
	static Mobile_MultiTouch_OnOff = false
	static Mobile_OneSignal_NativeUse = true
	static SlotTournament_Use = true
	static FBInstant_Tournament_Use = true
	static FBInstant_Squad_Use = false
	static FBInstant_Squad_DevelopTemp = false
	static Mobile_Use_AOS_GetSkuInfo = false
	static Mobile_Use_Google_CMP = false
	static Mobile_ShowCMP_At_Start = false
	static Mobile_Use_IAA_DoubleBidding = false
	static IOS_Facebook_ATT_Update = false
	static Mobile_IAP_Renewal = false
	static Mobile_AppLovin_S2S_Impression = false
	static Mobile_AF_PurchaseLog_Revenue_Rounding = false
	static Mobile_AF_PurchaseConnector_Use = false
	static Mobile_Admob_Use = false
	static IAP_ReserveUnprocessedReceipt_Test = false
	static IAP_ServerResponseFail_Test = false
	static AD_Target_Test = false
	static SUNDAYTOZAD_LIVE_URL = "https://adlog.stzgamSDefine.net/logs"
	static SUNDAYTOZAD_DEV_URL = "https://dev-adlog.stzgamSDefine.net/logs"
	static UPSELL_PROMOTIONKEY = "pecan-upsell"
	static EPICWIN_OFFERKEY = "epicwin-minvalue-9.99"
	static MINISALE_TESTKEY = "2021-happynewyear"
	static EPICWIN_ABTEST_KEY = "epicwin_ab_2021"
	static TargetCardSeason = 16
}
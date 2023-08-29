/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename insertedSubjects.js 
 */

/**
 * Objekt reprezentující controller pro vložené předměty
 * @param {StudiumParser} sp Model pro práci s daty, který se má nastavit jako this.sp
 * @property {StudiumParser} sp Model pro práci s daty
 * @property {String[]} list List vložených předmětů
 * @property {String[]} lastGenerated List naposledy vygenerovaných předmětů
 * @property {View.InsertedSubjects} insertedSubjectsView View pro vykreslování vložených předmětů
 * @property {Controller.FreeTime} freeTimeController Controller pro komunikaci s vkládáním volna
 * @property {Controller.Schedules} schedulesController Controller pro komunikaci s rozvrhy 
 * @property {Controller.UserMessage} userMessageController Controller pro komunikaci s uživatelskými hláškami
 * @class
 */
Controller.prototype.InsertedSubjects = function(studiumParser) {
    this.sp = studiumParser;
    this.list = [];
    this.lastGenerated = [];

    this.insertedSubjectsView = null;
    this.freeTimeController = null;
    this.schedulesController = null;
    this.userMessageController = null;

    /**
     * Inicializuje userMessageController
     * @param {Controller.UserMessage} controller Controller, který má být nastaven jako userMessageController 
     */
    this.initUserMessageController = function(controller) {
        this.userMessageController = controller;
    }

    /**
     * Inicializuje freeTimeController
     * @param {Controller.FreeTime} controller Controller, který má být nastaven jako freeTimeController 
     */
    this.initFreeTimeController = function(controller) {
        this.freeTimeController = controller;
    }

    /**
     * Inicializuje schedulesController
     * @param {Controller.Schedules} controller Controller, který má být nastaven jako schedulesController 
     */
    this.initSchedulesController = function(controller) {
        this.schedulesController = controller;
    }

    /**
     * Inicializuje insertedSubjectsView
     * @param {View.InsertedSubjects} view View, která má být nastavena jako insertedSubjectsView
     */
    this.initInsertedSubjectsView = function(view) {
        this.insertedSubjectsView = view;
        this.insertedSubjectsView.initRemoveHandler(this.remove.bind(this));
    }

    /**
     * Odstraní vložený předmět z view
     * @param {String} value Hodnota, podle které se má odstranit vložený předmět
     */
    this.removeFromView = function(value) {
        this.insertedSubjectsView.removeElByValue(value);
    }

    /**
     * Vloží nový předmět do listu i do view
     * @param {String} value Hodnota, podle které má být vložený předmět (do listu i do view) 
     */
    this.insert = function(value) {
        this.list.push(value);
        this.insertedSubjectsView.insert(value);
    }

    /**
     * Odstraní předmět z listu i z view
     * @param {String} value Hodnota, která se má odstranit z předmětů
     * @param {Number} index Index, ze kterého se má v listu odstranit. Pokud je záporný, vyhledá se pozice uvnitř funkce sama 
     */
    this.remove = function(value, index = -1) {
        if(index == -1) index = this.list.indexOf(value);
        this.list.splice(index, 1);
        this.insertedSubjectsView.removeElByValue(value);
        if(!isNaN(parseInt(value))) {
            this.freeTimeController.unSelectTime(value);
            this.userMessageController.messageAppend("Volno bylo úspěšně odebráno");
        }
        else this.userMessageController.messageAppend("Předmět byl úspěšně odebrán");
    }

    /**
     * Vloží volno do listu i view
     * @param {Number} hour Hodina označující volno, které se má vložit 
     */
    this.insertFreeTime = function(hour) {
        this.insertedSubjectsView.insertFreeTime(hour);
        this.list.push(hour);
    }

    /**
     * Odebere volno z listu i z view
     * @param {Number} hour Hodina označující volno, které se má odebrat 
     */
    this.removeFreeTime = function(hour) {
        this.insertedSubjectsView.removeFreeTime(hour);
        this.freeTimeController.unSelectTime(hour);
        index = this.list.indexOf(hour);
        this.list.splice(index, 1);
    }

    /**
     * Vloží / odebere předmět, podle toho, zda již je ve vybraných předmětech nebo ne
     * @param {String} value Hodnota, podle které se má odebrat / vložit předmět 
     * @returns Vrací 0 pokud odebral předmět, 1 pokud ho přidal
     */
    this.insertRemove = function(value) {
        var index;
        if((index = this.list.indexOf(value)) >= 0) {
            this.remove(value, index);
            return 0;
        }
        else {
            this.insert(value);
            return 1;
        }
    }

    /**
     * Zjistí, zda by se měli rozvrhy generovat od začátku (změna předmětů)
     * @returns Vrací true, pokud se mají rozvrhy generovat od začátku, jinak false
     */
    this.shouldGenerateReset = function() {
        if(this.list.length == 0) return true;
        if(this.list.length != this.lastGenerated.length) return true;
        for(var i = 0; i < this.list.length; ++i) {
            if(this.list[i] != this.lastGenerated[i]) return true;
        }
        return false;
    }

    /**
     * Zavolá schedules controller, aby vygeneroval rozvrhy
     */
    this.generate = function() {
        if(!this.shouldGenerateReset()) this.schedulesController.generate(this.list, false);
        else this.schedulesController.generate(this.list, true);
        this.lastGenerated = this.list.filter((item) => true);  //Vytvoření kopie
    }
}
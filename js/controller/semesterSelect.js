/**
 * @author Igar Sauchanka (xsauch00)
 * @filename semesterSelect.js 
 */

/**
 * Objekt reprezentující controller pro ovládání výběru semestru
 * @param {StudiumParser} studiumParser Model pro práci s daty, který se má nastavit jako this.sp
 * @property {StudiumParser} sp Model pro práci s daty
 * @property {Controller.InsertedSubjects} insertedSubjectsController Controller pro komunikaci s vloženými předměty
 * @property {Controller.UserMessage} userMessageController Controller pro komunikaci a vykreslování hlášek pro uživatele
 * @property {String} studium Řetězec reprezentující vybrané studium
 * @property {String} year Řetězec reprezentující vybraný ročník
 * @property {String} focus Řetězec reprezentující vybrané zaměření studia
 * @property {Number} semester Číslo reprezentující vybraný semestr. 0 = zimní, 1 = letní
 * @property {String[]} lastSelected Naposledy vybrané předměty (aby se mohli při novém výběru smazat)
 * @property {View.SemesterSelect} semesterSelectView View pro vykreslování výběru semestru
 * @class
 */
Controller.prototype.SemesterSelect = function(studiumParser) {
    this.sp = studiumParser;
    this.insertedSubjectsController = null;
    this.userMessageController = null;
    this.textAdviserController = null;
    this.textAdviserOptionalObligatoryController = null;
    this.studium = "";
    this.year = "";
    this.focus = "";
    this.semester = 0;

    this.lastSelected = [];
    this.semesterSelectView = null;

    /**
     * Inicializuje textAdviserOptionalObligatoryController
     * @param {Controller.TextAdviser} controller Controller, který má být nastaven jako textAdviserOptionalObligatoryController 
     */
    this.initTextAdviserOptionalObligatoryController = function(controller) {
        this.textAdviserOptionalObligatoryController = controller;
    }

    /**
     * Inicializuje textAdviserController
     * @param {Controller.TextAdviser} controller Controller, který má být nastaven jako textAdviserController 
     */
     this.initTextAdviserController = function(controller) {
        this.textAdviserController = controller;
    }

    /**
     * Inicializuje userMessageController
     * @param {Controller.UserMessage} controller Controller, který má být nastaven jako userMessageController 
     */
    this.initUserMessageController = function(controller) {
        this.userMessageController = controller;
    }

    /**
     * Inicializuje insertedSubjectsController
     * @param {Controller.InsertedSubjects} controller Controller, který má být nastaven jako insertedSubjectsController 
     */
    this.initInsertedSubjectsController = function(controller) {
        this.insertedSubjectsController = controller;
    }

    /**
     * Inicializuje semesterSelectView
     * @param {View.SemesterSelect} view View, která má být nastavena jako semesterSelectView 
     */
    this.initSemesterSelectView = function(view) {
        this.semesterSelectView = view;
    }

    /**
     * Spustí filtr pro TextAdviser, který potřebuje filtrovat podle vybraného studia
     */
    this.runFilter = function() {
        this.textAdviserController.resetFilter();
        this.textAdviserOptionalObligatoryController.insertSubjects(this.studium, this.year, this.semester, this.focus);
        if(this.semester == 0) {
            this.textAdviserController.filterByClassName("summer");
            this.textAdviserOptionalObligatoryController.filterByClassName("summer");
        }
        else {
            this.textAdviserController.filterByClassName("winter");
            this.textAdviserOptionalObligatoryController.filterByClassName("winter");
        }
    }

    /**
     * Provede potvrzení výběru semestru
     * @param {*} semester Funkce jejíž návratová hodnota se nastaví jako this.semester, nebo string, který se rovnou nastaví jako this.semester
     */
    this.semesterSelect = function(semester, loadSubjects = true) {
        if(typeof semester == 'function') this.semester = semester(); 
        else this.semester = semester;
        this.runFilter();
    }

    /**
     * Provede potvrzení výběru ročníku
     * @param {*} year Funkce jejíž návratová hodnota se nastaví jako this.year, nebo string, který se rovnou nastaví jako this.year
     */
    this.yearSelect = function(year, loadSubjects = true) {
        if(typeof year == 'function') this.year = year();
        else this.year = year;
        this.runFilter();
        if(loadSubjects) this.submit();
    }

    /**
     * Provede potvrzení výběru zaměření studia
     * @param {*} year Funkce jejíž návratová hodnota se nastaví jako this.focus, nebo string, který se rovnou nastaví jako this.focus
     */
    this.focusSelect = function(focus, loadSubjects = true) {
        if(typeof focus == 'function') this.focus = focus();
        else this.focus = focus;
        this.runFilter();
        if(loadSubjects) this.submit();
    }

    /**
     * Provede potvrzení výběru studia
     * @param {*} year Funkce jejíž návratová hodnota se nastaví jako this.studium, nebo string, který se rovnou nastaví jako this.studium
     */
    this.studiumSelect = function(studium, loadSubjects = true) {
        if(typeof studium == 'function') this.studium = studium();
        else this.studium = studium;

        this.focus = this.semesterSelectView.insertFocuses(this.sp.getAllStudiumFocuses(this.studium));
        this.year = this.semesterSelectView.insertYears(this.sp.getYears(this.studium));
        this.runFilter();
        if(loadSubjects) this.submit();
    }

    /**
     * Inicializuje element, který má sloužit pro výběr semestru a zároveň nastaví potřebné event handlery tomuto nastavenému elementu
     * @param {Element} el Element, který má sloužit jako výběr semestru
     */
     this.initSelectSemesterElement = function(el) {
        this.semesterSelectView.initSelectSemesterElement(el, this.semesterSelect.bind(this, 
            this.semesterSelectView.getSemesterValue.bind(this.semesterSelectView)) );
    }

    /**
     * Inicializuje element, který má sloužit pro výběr ročníku a zároveň nastaví potřebné event handlery tomuto nastavenému elementu
     * @param {Element} el Element, který má sloužit jako výběr ročníku
     */
    this.initSelectYearElement = function(el) {
        this.semesterSelectView.initSelectYearElement(el, this.yearSelect.bind(this, 
            this.semesterSelectView.getYearValue.bind(this.semesterSelectView)) );
    }

    /**
     * Inicializuje element, který má sloužit pro výběr zaměření studia a zároveň nastaví potřebné event handlery tomuto nastavenému elementu
     * @param {Element} el Element, který má sloužit jako výběr zaměření studia
     */
    this.initSelectFocusElement = function(el) {
        this.semesterSelectView.initSelectFocusElement(el, this.focusSelect.bind(this, 
            this.semesterSelectView.getFocusValue.bind(this.semesterSelectView)) );
    }

    /**
     * Inicializuje element, který má sloužit pro výběr studia a zároveň nastaví potřebné event handlery tomuto nastavenému elementu
     * @param {Element} el Element, který má sloužit jako výběr studia
     */
    this.initSelectStudiumElement = function(el) {
        this.semesterSelectView.initSelectStudiumElement(el, this.studiumSelect.bind(this, 
            this.semesterSelectView.getStudiumValue.bind(this.semesterSelectView)) );
        this.semesterSelectView.initOnLoad(this.load.bind(this));
    }

    /**
     * Pokusí se načíst studia, zaměření prvního načteného studia a jeho ročníky. Pokud StudiumParser doposud nestihl zparsovat data, nastaví Timeout() na 50ms
     * a zavolá sebe sama
     */
    this.load = function() {
        if(this.sp.parsed) {
            this.semesterSelectView.insertStudiums(this.sp.getAllStudiums());
            this.studiumSelect(this.semesterSelectView.getStudiumValue.bind(this.semesterSelectView), false);
            
            this.semesterSelectView.insertFocuses(this.sp.getAllStudiumFocuses(this.studium));
            this.focusSelect(this.semesterSelectView.getFocusValue.bind(this.semesterSelectView), false);

            this.semesterSelectView.insertYears(this.sp.getYears(this.studium));
            this.yearSelect(this.semesterSelectView.getYearValue.bind(this.semesterSelectView), false);

            this.semesterSelect(0);    
        }
        else setTimeout(this.load.bind(this), 50);
    }

    /**
     * Potvrdí výběr semestru a povinné předměty z tohoto semestru pošle do insertedSubjectsControlleru
     */
    this.submit = function() {
        if(this.studium != "" && this.year != "") {
            //Load předměty podle vybraných selectů
            subjects = this.sp.getAllObligatorySubjects(this.studium, this.year, this.semester, this.focus);
            for(var i = 0; i < this.lastSelected.length; ++i) {
                this.insertedSubjectsController.remove(this.lastSelected[i]);
            }
            this.lastSelected = [];
            for(var i = 0; i < subjects.length; ++i) {
                this.insertedSubjectsController.insertRemove(subjects[i]);
                this.lastSelected.push(subjects[i]);
            }
            this.userMessageController.messageAppend("Předměty z vybraného semestru byly vloženy");
        }
    }

}
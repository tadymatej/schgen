/**
 * @author Igar Sauchanka (xsauch00)
 * 
 */

/**
 * Objekt reprezentující controller pro výběr volna 
 * @property {Controller.InsertedSubjects} insertedSubjectsController Controller, se kterým se komunikuje za účelem vložení vybraného volna do vložených předmětů
 * @property {Controller.UserMessage} userMessageController Controller, se kterým se komunikuje za účelem výpisu uživatelských hlášek
 * @property {View.FreeTime} freeTimeView View obsluhující výběr volna
 * @property {Number} mouseDown Informace, zda se drží tlačítko myši
 * @property {Number} selecting Informace, zda se právě vybírá volno
 * @property {Number[]} freeTime Pole s vloženými volny
 * @property {Number} showed Informace, zda je nyní výběr volna zobrazen
 * @property {Function} callTryHide Funkce, která se volá po zobrazení oken s výběrem tabulky na kliknutí, jako pokus skrýt okno s výběrem tabulky
 * @class
 */
Controller.prototype.FreeTime = function() {
    this.insertedSubjectsController = null;
    this.userMessageController = null;

    this.freeTimeView = null;
    this.mouseDown = false;
    this.selecting = false;

    this.freeTime = [];

    this.showed = false;

    /**
     * Inicializuje userMessageController
     * @param {Controller.UserMessage} controller Controller, který má být nastaven jako userMessageController 
     */
    this.initUserMessageController = function(controller) {
        this.userMessageController = controller;
    }

    /**
     * Zobrazí výběr volna
     */
    this.show = function() {
        this.freeTimeView.show();
        document.body.addEventListener("click", this.callTryHide, false);
        this.showed = true;
    }

    /**
     * Skryje výběr volna
     */
    this.hide = function() {
        this.freeTimeView.hide();
        document.body.removeEventListener("click", this.callTryHide, false);
        this.showed = false;
    }

    /**
     * Podle aktuálního stavu objektu skryje / zobrazí volna
     */
    this.showHide = function() {
        if(this.showed) this.hide();
        else this.show();
    }

    /**
     * Pokusí se skrýt výběr volna (pokud se kliklo mimo freeTimeView.container)
     * @param {Event} e Event, který byl vyvolán 
     */
    this.tryHide = function(e) {
        if(this.freeTimeView.isInsideContainer(e.target)) this.hide();
    }

    this.callTryHide = this.tryHide.bind(this);

    /**
     * Inicializuje insertedSubjectsController
     * @param {Controller.InsertedSubjects} controller Controller, který má být nastaven jako insertedSubjectsController 
     */
    this.initInsertedSubjectsController = function(controller) {
        this.insertedSubjectsController = controller;
    }

    /**
     * Inicializuje freeTimeView
     * @param {View.FreeTime} view View, které má být nastaveno jako freeTimeView 
     */
    this.initFreeTimeView = function(view) {
        this.freeTimeView = view;
    }

    /**
     * Provede změnu mouseDown
     */
    this.mouseDownChange = function() {
        this.mouseDown = !this.mouseDown;
    }

    /**
     * Začne vybírat / odebírat volna (podle toho, zda již bylo vybráno)
     * @param {Element} el Element, na kterém začlo vybírání volna 
     * @param {Event} e Event, který byl vyvolán 
     */
    this.startSelecting = function(el, e) {
        e.preventDefault();
        if(!this.freeTimeView.isColumnSelected(el)) this.selecting = true;
        else this.selecting = false;
        this.selectTime(el);
    }

    /**
     * Vybere / odebere volno (podle toho, zda již bylo vybráno)
     * @param {Element} el Element, který je vybírán / odebírán
     * @param {Event} e Event, který byl vyvolán 
     */
    this.selecting = function(el, e) {
        e.preventDefault();
        if(this.mouseDown) this.selectTime(el);
    }

    /**
     * Inicializuje tabulky pro výběr volna.
     * @param {Element[]} els Elementy, které mají být nastaveny jako tables 
     */
    this.initTables = function(els) {
        this.freeTimeView.initTables(els, this.mouseDownChange.bind(this), this.mouseDownChange.bind(this));

        this.freeTimeView.tablesColsBindHandlers(this.startSelecting, this.selecting, this);
    }

    /**
     * Provede výběr / odvýběr volné hodiny
     * @param {Element} el Element, kterým byla vybrána volná hodina pro grafické znázornění v GUI
     */
    this.selectTime = function(el) {
        var hour = parseInt(el.getAttribute("data-hour"));
        if(!this.freeTimeView.isColumnSelected(el) && this.selecting) {
            this.freeTime.push(hour);
            this.freeTimeView.tablesColsSetBackground("green", hour);
            this.insertedSubjectsController.insertFreeTime(hour);
            this.userMessageController.messageAppend("Volno bylo přidáno");
        }
        else if(!this.selecting) {
            var index = this.freeTime.indexOf(hour);
            this.freeTime.splice(index, 1);
            this.freeTimeView.tablesColsSetBackground(null, hour);
            this.insertedSubjectsController.removeFreeTime(hour);
            this.userMessageController.messageAppend("Volno bylo odebráno");
        }
    }

    /**
     * Odebere hodinu z vybraných voln
     * @param {Number} hour hodina, která se odebírá 
     */
    this.unSelectTime = function(hour) {
        this.freeTimeView.tablesColsSetBackground(null, hour);
    }
}
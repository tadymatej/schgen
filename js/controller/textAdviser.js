/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename textAdviser.js 
 */

/**
 * Objekt reprezentující controller pro práci s napovídáním
 * @param {StudiumParser} studiumParser Model, který má být nastaven jako this.sp
 * @property {StudiumParser} sp Model pro práci s daty
 * @property {Controller.InsertedSubjects} insertedSubjectsController Controller pro komunikaci s vloženými předměty
 * @property {Controller.UserMessage} userMessageController Controller pro komunikaci s uživatelskými hláškami
 * @property {View.TextAdviser} textAdviserView View, která vykresluje napovídání
 * @property {Function} callHide Funkce, která je volána při pokusu skrýt TextAdviser
 * @property {Function} callShow Funkce, která je volána při žádosti o zobrazení TextAdviser
 * @property {Function} callKeyUp Funkce, která je volána pokud se uvnitř TextAdviser narazí na event keyup
 * @class
 */
Controller.prototype.TextAdviser = function(studiumParser) {
    this.sp = studiumParser;
    this.insertedSubjectsController = null;
    this.userMessageController = null;
    this.textAdviserView = null;

    /**
     * Inicializuje textAdviserView
     * @param {View.TextAdviser} view View, která má být nastavena jako textAdviserView 
     */
    this.initTextAdviserView = function(view) {
        this.textAdviserView = view;
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
     * Inicializuje input pro napovídání
     * @param {Element} el Element, který má být nastaven jako input pro napovídání 
     */
    this.initInputElement = function(el) {
        this.textAdviserView.initInput(el, this.callShow, this.advise.bind(this));
    }

    /**
     * Vykoná obshluhu klávesnice
     * @param {Event} e Event, který byl vyvolán 
     */
     this.keyUpHandler = function(e) {
        if(e.which == 38) {
            this.textAdviserView.selectPrevious();
        }
        else if(e.which == 40) {
            this.textAdviserView.selectNext();
        }
        else if(e.which == 13) {
            this.submit();
        }
    }

    /**
     * Provede obsluhu kliknutí na volbu v napovídání
     * @param {Event} e Event, který byl vyvolán 
     */
    this.optionClick = function(e) {
        this.textAdviserView.updateSelected(e.target);
        this.submit();
    }

    /**
     * Vloží do textAdviseru předměty a nastaví jim skóre (zda jsou v zimním / letním semestru)
     * @param {String[]} subjects Pole názvů předmětů, které se mají vložit 
     */
    this.insertSubjectsWithScore = function(subjects) {
        for(var i = 0; i < subjects.length; ++i) {
            var semester = this.sp.getSemesterOfSubject(subjects[i]);
            var className = "";
            if(semester.length == 1) {
                if(semester[0] == 0) className = "winter";
                else className = "summer";
            }
            this.textAdviserView.insertDataWithScore([subjects[i]], [], className, this.optionClick.bind(this));
        }
    }

    /**
     * Pokusí se vložit předměty do containeru s napovídáním. Pokud se to nepovede z důvodu, že parser nezparsoval data, počká 50ms a zkusí to znovu
     */
    this.tryInsertSubjects = function() {
        if(this.sp.parsed) {
            var subjects = Array.from(new Set(this.sp.getAllSubjects()));
            subjects.sort();
            this.insertSubjectsWithScore(subjects);
        }
        else setTimeout(this.tryInsertSubjects.bind(this), 50);
    }

    /**
     * Inicializuje container pro napovídání
     * @param {Element} el Element, který má být nastaven jako container napovídání 
     */
    this.initTextAdviserContainer = function(el, load = true) {
        this.textAdviserView.initTextAdviserContainer(el);
        if(load) this.tryInsertSubjects();
    }

    /**
     * Zapne napovídání = zobrazí container s napovídáním a spustí všechny eventListenery
     */
    this.start = function() {
        document.body.addEventListener("click", this.callHide, false);
        document.body.addEventListener("keydown", this.callKeyUp, false);
        this.textAdviserView.show();
    }

    /**
     * Vypne napovídání = schová container s napovídáním a vypne všechny eventListenery
     * @param {Event} e Event, který byl vyvolán 
     */
    this.end = function(e) {
        if(!this.textAdviserView.isInside(e)) {
            this.textAdviserView.hide();
            document.body.removeEventListener("click", this.callHide, false);
            document.body.removeEventListener("keydown", this.callKeyUp, false);
        }

    }

    this.callHide = this.end.bind(this);
    this.callShow = this.start.bind(this);
    this.callKeyUp = this.keyUpHandler.bind(this);

    /**
     * Obshlujuje samotné napovídání
     * @param {Event} e Event, který byl vyvolán 
     */
    this.advise = function(e) {
        if(e.which != 38 && e.which != 40 && e.which != 13) {
            var val = this.textAdviserView.getInputValue();
            var first = true;
            var childs = this.textAdviserView.getAllOptionElements();
            for(var i = 0; i < childs.length; ++i) {
                if(!childs[i].className.includes("hint-allowed")) continue;
                if(childs[i].innerText.indexOf(val) >= 0) {
                    if(first) {
                        first = false;
                        this.textAdviserView.updateSelected(childs[i]);    
                    }
                    this.textAdviserView.showOption(childs[i]);
                }
                else this.textAdviserView.hideOption(childs[i]);
            }
        }
    }

    /**
     * Vyresetuje filtry textAdviseru
     */
    this.resetFilter = function() {
        var childs = this.textAdviserView.getAllOptionElements();
        for(var i = 0; i < childs.length; ++i) {
            if(!childs[i].className.includes("hint-allowed")) childs[i].className = childs[i].className + " hint-allowed";
        }
    }

    /** 
     * Vyfiltruje nápovědy uvnitř textAdviseru podle classy
     * @param {String} restrictClassName Název classy, která má být zakázaná
     */
    this.filterByClassName = function(restrictClassName) {
        var childs = this.textAdviserView.getAllOptionElements();
        for(var i = 0; i < childs.length; ++i) {
            if(childs[i].className.includes(restrictClassName)) childs[i].className = childs[i].className.replace("hint-allowed", "").trim();
        }
    }

    /**
     * Provede potvrzení volby z napovídání
     */
    this.submit = function() {
        if(this.textAdviserView.isSelectedElementDisplayed()) {
            var operation = this.insertedSubjectsController.insertRemove(this.textAdviserView.getSelectedValue());
            if(operation == 0) this.userMessageController.messageAppend("Předmět byl úspěšně odebrán");
            else this.userMessageController.messageAppend("Předmět byl úspěšně vložen");
        }
        else this.userMessageController.messageAppend("Zadejte správný název předmětu", 1);
    }
}

Controller.prototype.TextAdviserOptionalObligatory = function(studiumParser) {
    Controller.prototype.TextAdviser.call(this, studiumParser);

    /**
     * Vloží předměty do Nápovědy TextAdviseru
     * @param {String} studiumName Studium, kterého se mají vložit předměty 
     * @param {String} year Ročník studia, kterého se mají vložit předměty
     * @param {Number} semester Semestr, kterého se mají vložit předměty (0 = zimní, 1 = letní)
     * @param {String} studiumFocus Zaměření studia, kterého se mají vložit předměty 
     */
    this.insertSubjects = function(studiumName, year, semester, studiumFocus = "") {
        this.textAdviserView.clearTextAdviserContainer();
        var subjects = this.sp.getAllObligatoryOptionalSubjects(studiumName, year, semester, studiumFocus);
        subjects = Array.from(new Set(subjects)).sort();
        if(subjects.length == 0) this.textAdviserView.hideAll();
        else this.textAdviserView.showAll();
        this.insertSubjectsWithScore(subjects);
    }
}
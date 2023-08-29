/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename textAdviser.js
 */

/**
 * Objekt reprezentující view napovídání
 * @property {Element} input Input, pro který se napovídání vztahuje
 * @property {Element} textAdviserContainer Element, který obsahuje celé napovídání
 * @property {Element} selectedElement Element, který je označený jako vybraný v napovídání
 * @property {Function} onstart Funkce, která se zavolá po kliknutí na input 
 * @property {Function} runAdvise Funkce, která se zavolá při spuštění napovídání 
 * @property {Function} onsubmit Funkce, která se zavolá při potvrzení volby z napovídání
 * @class
 */
View.prototype.TextAdviser = function() {
    this.input = null;
    this.textAdviserContainer = null;
    this.selectedElement = null;

    this.onstart = null;
    this.runAdvise = null;
    this.onsubmit = null;

    /**
     * Vymaže všechno vložené HTML z textAdviseru
     */
    this.clearTextAdviserContainer = function() {
        this.textAdviserContainer.innerHTML = "";
    }

    /**
     * 
     * @param {String[]} data Pole dat, jehož prvky se budou vkládat do napovídacího elementu
     * @param {Function} dataClickHandler Funkce, která má být volána při kliknutí na element s prvkem z pole dat 
     */
    this.insertData = function(data, dataClickHandler = null) {
        data.sort();
        for(var i = 0; i < data.length; ++i) {
            var hint = document.createElement("div");
            hint.className = "hint";
            hint.innerHTML = data[i];
            this.textAdviserContainer.appendChild(hint);
            hint.onclick = dataClickHandler;
        }
        this.updateSelected(this.textAdviserContainer.children[0]);
    }

    /**
     * 
     * @param {String[]} data Text pro vkládané elementy (text hintů v napovídání)
     * @param {Number[]} scores Skóre, které se má nastavit vloženým elementům
     * @param {String} className název classy, která se má nastavit vloženým elementům
     * @param {Function} dataClickHandler Funkce, která se má zavolat po kliknutí na vložený element napovídání 
     */
    this.insertDataWithScore = function(data, scores, className, dataClickHandler = null) {
        data.sort();
        var score = scores.toString();
        for(var i = 0; i < data.length; ++i) {
            var hint = document.createElement("div");
            hint.className = "hint hint-allowed " + className;
            hint.setAttribute("data-scores", score);
            hint.innerHTML = data[i];
            this.textAdviserContainer.appendChild(hint);
            hint.onclick = dataClickHandler;
        }
        this.updateSelected(this.textAdviserContainer.children[0]);
    }

    /**
     * Získá hodnotu z inputu
     * @returns Vrací hodnotu z inputu. Navíc tuto hodnotu convertuje na upperCase()
     */
    this.getInputValue = function() {
        return this.input.value.toUpperCase();
    }

    /**
     * Získá všechny elementy s možnostmi v napovídání
     * @returns Vrací pole všech elementů s možnostmi v napovídání
     */
    this.getAllOptionElements = function() {
        return this.textAdviserContainer.children;
    }

    /**
     * Získá hodnotu označeného elementu v napovídání
     * @returns Vrací text, který obsahuje vybraný element v napovídání
     */
    this.getSelectedValue = function() {
        return this.selectedElement.innerText;
    }

    /**
     * Skryje element obsahující text jednoho napovídání (jeden řádek v napovídání)
     * @param {Element} el Element, který má být skryt
     */
    this.hideOption = function(el) {
        el.style.display = "none";
    }

    /**
     * Zobrazí element obsahující text jednoho napovídání (jeden řádek v napovídání)
     * @param {Element} el element, který má být zobrazen 
     */
    this.showOption = function(el) {
        el.style.display = "block";
    }

    /**
     * Změní vybraný element
     * @param {Element} newSelected Nově vybraný element
     */
     this.updateSelected = function(newSelected) {
        if(this.selectedElement != null) {
            this.selectedElement.style.backgroundColor = null;
        }
        this.selectedElement = newSelected;
        this.selectedElement.style.backgroundColor = "gray";
    }

    /**
     * Najde následující viditelný element
     * @param {Element} el Element, od kterého se začíná vyhledávat následující element 
     * @returns Vrací element, který je následující viditelný, jinak vrací null pokud se takový element nepodaří najít
     */
    this.findNextDisplayedEl = function(el) {
        while(el != null && window.getComputedStyle(el).getPropertyValue("display") == "none") {
            el = el.nextElementSibling;
        }
        return el;
    }

    /**
     * Najde předchozí viditelný element
     * @param {Element} el Element, od kterého se začíná vyhledávat předchozí element 
     * @returns Vrací element, který je předchozí viditelný, jinak vrací null pokud se takový element nepodaří najít
     */
    this.findPreviousDisplayedEl = function(el) {
        while(el != null && window.getComputedStyle(el).getPropertyValue("display") == "none") {
            el = el.previousElementSibling;
        }
        return el;
    }

    /**
     * Vybere následující element (šipka dolů na klávesnici)
     */
    this.selectNext = function() {
        var nextEl = this.findNextDisplayedEl(this.selectedElement.nextElementSibling);
        if(nextEl != null) {
            this.selectedElement.style.backgroundColor = null;
            this.selectedElement = nextEl;
            this.selectedElement.style.backgroundColor = "gray";
            if(this.selectedElement.parentElement.scrollTop + this.selectedElement.parentElement.offsetTop + this.selectedElement.parentElement.offsetHeight <= this.selectedElement.offsetTop) 
            {
                var scrollTop = (this.selectedElement.offsetTop - this.selectedElement.parentElement.offsetTop) - (this.selectedElement.offsetHeight * (parseInt(this.selectedElement.parentElement.offsetHeight / this.selectedElement.offsetHeight) - 1));    
                $(this.selectedElement.parentElement).scrollTop(scrollTop);
            }
            else if(this.selectedElement.parentElement.scrollTop + this.selectedElement.parentElement.offsetTop > this.selectedElement.offsetTop) {
                var scrollTop = (this.selectedElement.offsetTop - this.selectedElement.parentElement.offsetTop) - (this.selectedElement.offsetHeight * (parseInt(this.selectedElement.parentElement.offsetHeight / this.selectedElement.offsetHeight) - 1));
                $(this.selectedElement.parentElement).scrollTop(scrollTop);
            }
        }
    }

    /**
     * Vybere předchozí element (šipka nahoru na klávesnici)
     */
    this.selectPrevious = function() {
        var prevEl = this.findPreviousDisplayedEl(this.selectedElement.previousElementSibling);
        if(prevEl != null) {
            this.selectedElement.style.backgroundColor = null;
            this.selectedElement = prevEl;
            this.selectedElement.style.backgroundColor = "gray";
            if(this.selectedElement.parentElement.scrollTop + this.selectedElement.parentElement.offsetTop + this.selectedElement.parentElement.offsetHeight <= this.selectedElement.offsetTop) 
                $(this.selectedElement.parentElement).scrollTop(this.selectedElement.offsetTop - this.selectedElement.parentElement.offsetHeight - this.selectedElement.offsetHeight * 2);  
            else if(this.selectedElement.parentElement.scrollTop + this.selectedElement.parentElement.offsetTop > this.selectedElement.offsetTop) 
                $(this.selectedElement.parentElement).scrollTop(this.selectedElement.offsetTop - this.selectedElement.parentElement.offsetHeight - this.selectedElement.offsetHeight * 2);
        }
    }

    /**
     * Funkce zjistí, zda je kurzor myši na napovídání nebo inputu
     * @param {Event} e Event, který byl vyvolán 
     * @returns {Number} Vrací 1 pokud kurzor myši byl uvnitř inputu (nebo nápovědy) v opačném případě 0
     */
    this.isInside = function(e) {
        if(e.target == this.input) return true;
        var el = e.target;
        while(el != null) {
            if(el == this.textAdviserContainer) return true;
            el = el.parentElement;
        }
        return false;
    }

    /**
     * Zobrazí vše související s textAdviserem (nadpis, input, nápovědu)
     */
    this.showAll = function() {
        this.textAdviserContainer.parentElement.nextElementSibling.style.display = null;
        this.textAdviserContainer.parentElement.previousElementSibling.previousElementSibling.style.display = null;
        this.textAdviserContainer.style.display = null;
        this.textAdviserContainer.previousElementSibling.style.display = null;
    }

    /**
     * Skryje vše související s textAdviserem (nadpis, input, nápovědu)
     */
    this.hideAll = function() {
        this.textAdviserContainer.parentElement.nextElementSibling.style.display = "none";
        this.textAdviserContainer.parentElement.previousElementSibling.previousElementSibling.style.display = "none";
        this.textAdviserContainer.style.display = "none";
        this.textAdviserContainer.previousElementSibling.style.display = "none";
    }

    /**
     * Zobrazí napovídání
     */
    this.hide = function() {
        this.textAdviserContainer.style.display = "none";
    }

    /**
     * Skryje napovídání
     */
    this.show = function() {
        this.textAdviserContainer.style.display = "block";
    }

    /**
     * Inicializuje onstart handler
     * @param {Function} onstartHandler Funkce, která má být volána při kliknutí na input, pro který se napovídá
     */
    this.initOnStart = function(onstartHandler) {
        this.onstart = onstartHandler;
    }

    /**
     * Inicializuje runAdvise handler
     * @param {Function} runAdviseHandler Funkce, která má být volána při provádění napovídání 
     */
    this.initRunAdvise = function(runAdviseHandler) {
        this.runAdvise = runAdviseHandler;
    }
    
    /**
     * Inicializuje onsubmit Handler
     * @param {Function} onsubmitHandler Funkce, která má být volána na potvrzení výběru v textAdviseru
     */
    this.initOnSubmit = function(onsubmitHandler) {
        this.onsubmit = onsubmitHandler;
    }

    /**
     * Nastaví objektu input element
     * @param {Element} input Element, který má sloužit jako input objektu 
     * @param {Function} onstartHandler Funkce, která má být spuštěna po kliknutí na input
     * @param {Function} runAdviseHandler Funkce, která má být volána při provádění napovídání
     */
    this.initInput = function(input, onstartHandler = null, runAdviseHandler = null) {
        this.input = input;
        this.initOnStart(onstartHandler);
        this.initRunAdvise(runAdviseHandler);
        input.onclick = onstartHandler;
        input.onkeyup = runAdviseHandler;
    }

    /**
     * Nastaví objektu textAdviserContainer element
     * @param {Element} container Element, který má sloužit jako zobrazování napovídání
     */
    this.initTextAdviserContainer = function(container) {
        this.textAdviserContainer = container;
    }

    this.isSelectedElementDisplayed = function() {
        return window.getComputedStyle(this.selectedElement).getPropertyValue("display") != "none";
    }
}
/**
 * @author Igar Sauchanka (xsauch00)
 * @filename semesterSelect.js
 */

/**
 * Objekt reprezentující view výběru semestru 
 * @property {Element} selectStudiumElement Element, který obsahuje výběr studia
 * @property {Element} selectYearElement Element, který obsahuje výběr ročníku
 * @property {Element} selectSemesterElement Element, který obsahuje výběr semestru
 * @property {Element} selectFocusElement Element, který obsahuje výběr zaměření studia
 * @property {Function} onSubmit Funkce, která se zavolá po potvrzení výběru semestru
 * @class
 */
View.prototype.SemesterSelect = function() {
    this.selectStudiumElement = null;
    this.selectYearElement = null;
    this.selectSemesterElement = null;
    this.selectFocusElement = null;

    this.onSubmit = null;

    /**
     * Získá hodnotu aktuálně označeného semestru
     * @returns Vrací int hodnotu aktuálně označeného semestru
     */
    this.getSemesterValue = function() {
        return parseInt(this.selectSemesterElement.value);
    }

    /**
     * Získá hodnotu aktuáně označeného ročníku
     * @returns Vrací string hodnotu aktuálně označeného ročníku
     */
    this.getYearValue = function() {
        return this.selectYearElement.value;
    }

    /**
     * Získá hodnotu aktuálně označeného studia
     * @returns Vrací string hodnotu aktuálně označeného studia
     */
    this.getStudiumValue = function() {
        return this.selectStudiumElement.value;
    }

    /**
     * Získá hodnotu aktuálně označeného zaměření studia
     * @returns Vrací string hodnotu aktuálně označeného zaměření studia
     */
    this.getFocusValue = function() {
        if(this.selectFocusElement.style.display == "none") return "";
        return this.selectFocusElement.value;
    }

    /**
     * Inicializuje selectSemesterElement objektu a nastaví mu patřičné eventListenery
     * @param {Element} el Element, který má být nastaven jako selectSemesterElement 
     * @param {Function} onchangeHander Funkce, která se zavolá na změnu hodnoty elementu
     */
     this.initSelectSemesterElement = function(el, onchangeHander = null) {
        this.selectSemesterElement = el;
        if(onchangeHander != null) el.onchange = onchangeHander;
    }

    /**
     * Inicializuje selectYearElement objektu a nastaví mu patřičné eventListenery
     * @param {Element} el Element, který má být nastaven jako selectYearElement 
     * @param {Function} onchangeHander Funkce, která se zavolá na změnu hodnoty elementu
     */
    this.initSelectYearElement = function(el, onchangeHander = null) {
        this.selectYearElement = el;
        if(onchangeHander != null) el.onchange = onchangeHander;
    }

    /**
     * Inicializuje selectStudiumElement objektu a nastaví mu patřičné eventListenery
     * @param {Element} el Element, který má být nastaven jako selectStudiumElement 
     * @param {Function} onchangeHander Funkce, která se zavolá na změnu hodnoty elementu
     */
     this.initSelectStudiumElement = function(el, onchangeHander = null) {
        this.selectStudiumElement = el;
        if(onchangeHander != null) el.onchange = onchangeHander;
    }

    /**
     * Inicializuje selectFocusElement objektu a nastaví mu patřičné eventListenery
     * @param {Element} el Element, který má být nastaven jako selectFocusElement 
     * @param {Function} onchangeHander @param {Function} onchangeHander Funkce, která se zavolá na změnu hodnoty elementu
     */
    this.initSelectFocusElement = function(el, onchangeHander = null) {
        this.selectFocusElement = el;
        if(onchangeHander != null) el.onchange = onchangeHander;
    }

    /**
     * Vloží ročníky do selectYearElement
     * @param {String[]} years Pole s ročníky, které se mají vložit
     */
    this.insertYears = function(years) {
        this.selectYearElement.innerHTML = "";
        for(var i = 0; i < years.length; ++i) {
            var option = document.createElement("option");
            option.value = years[i];
            option.innerHTML = years[i];
            this.selectYearElement.appendChild(option);
        }
        return this.selectYearElement.value;
    }

    /**
     * Vloží zaměření studia do selectFocusElement
     * @param {String[]} focuses Pole se zaměřeními, které se mají vložit
     */
    this.insertFocuses = function(focuses) {
        this.selectFocusElement.innerHTML = "";
        if(focuses.length == 0) {
            this.selectFocusElement.previousElementSibling.style.display = "none";
            this.selectFocusElement.style.display = "none";
            return "";
        }
        else {
            this.selectFocusElement.previousElementSibling.style.display = "flex";
            this.selectFocusElement.style.display = "flex";
            for(var i = 0; i < focuses.length; ++i) {
                var option = document.createElement("option");
                option.value = focuses[i];
                option.innerHTML = focuses[i];
                this.selectFocusElement.appendChild(option);
            }
            return this.selectFocusElement.value;
        }
    }

    /**
     * Vloží studia do selectStudiumElementu
     * @param {String[]} studiums Pole se studiemi, které se mají vložit
     */
    this.insertStudiums = function(studiums) {
        this.selectStudiumElement.innerHTML = "";
        for(var i = 0; i < studiums.length; ++i) {
            var option = document.createElement("option");
            option.value = studiums[i];
            option.innerHTML = studiums[i];
            this.selectStudiumElement.appendChild(option);
        }
    }

    /**
     * Inicializuje handler, který se má volat na document.load
     * @param {Function} onloadHandler Funkce, která má být volána na document.load
     */
    this.initOnLoad = function(onloadHandler) {
        window.addEventListener("load", onloadHandler, true);
    }

    /**
     * Provede potvrzení výběru semestru - zavolá this.onSubmit()
     */
    this.submit = function() {
        if(this.onSubmit != null) this.onSubmit();
    }

    /**
     * Inicializuje onSubmit handler 
     * @param {Function} onsubmitHandler Funkce, která se má volat na this.submit()
     */
    this.initOnsubmit = function(onsubmitHandler) {
        this.onSubmit = onsubmitHandler;
    }
}
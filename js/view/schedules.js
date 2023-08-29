/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename schedules.js
 */

/**
 * Objekt reprezentující view, které se stará o vykreslování částí spojených s více rozvrhy
 * @property {View.Schedules.FixedButtons} fixedButtons View, které se stará o vykreslování tlačítek pro přepínání mezi rozvrhy na mobilu
 * 
 * @property {Element} goThrowFavouritesButton Tlačítko pro procházení oblíbených rozvrhů 
 * @property {Element} maxInputElement Input obsahující maximální počet generovaných předmětů
 * @property {Element} oddWeekButton Tlačítko pro zobrazení rozvrhu v lichém týdnu
 * @property {Element} evenWeekButton Tlačítko pro zobrazení rozvrhu v sudém týdnu
 * @property {Element} actualScheduleNumberHolders Elementy zobrazující index právě zobrazovaného rozvrhu
 * @property {Element} nextButton Tlačítko pro zobrazení dalšího rozvrhu
 * @property {Element} previousButton Tlačítko pro zobrazení předchozího rozvrhu
 * @property {Element} removeButton Tlačítko pro odstranění rozvrhu
 * @property {Element} addToFavouritesButton Tlačítko pro přidání rozvrhu k oblíbeným
 * @class
 */
View.prototype.Schedules = function() {
    this.fixedButtons = new this.FixedButtons();

    this.goThrowFavouritesButton = null;
    this.maxInputElement = null;
    this.oddWeekButton = null;
    this.evenWeekButton = null;
    this.actualScheduleNumberHolders = null;
    this.nextButton = null;
    this.previousButton = null;
    this.removeButton = null;
    this.addToFavouritesButton = null;

    /**
     * Inicializuje scheduleController
     * @param {Controller.Schedule} controller Controller, který má být nastaven jako scheduleController 
     */
    this.initScheduleController = function(controller) {
        this.scheduleController = controller;
    }

    /**
     * Inicializuje actualScheduleNumberHolder
     * @param {Element} el Element, který má být nastaven jako actualScheduleNumberHolder
     */
    this.initActualScheduleNumberHolders = function(els) {
        this.actualScheduleNumberHolders = els;
    }

    /**
     * Inicializuje maxInputElement
     * @param {Element} el Element, který má být nastaven jako maxInputElement 
     */
    this.initMaxInput = function(el) {
        this.maxInputElement = el;
    }

    /**
     * Inicializuje nextButton
     * @param {Element} el Element, který má být nastaven jako nextButton
     */
    this.initNextButton = function(el) {
        this.nextButton = el;
    }

    /**
     * Inicializuje previousButton
     * @param {Element} el Element, který má být nastaven jako previousButton 
     */
    this.initPreviousButton = function(el) {
        this.previousButton = el;
    }

    /**
     * Inicializuje addToFavouritesButton
     * @param {Element} el Element, který má být nastaven jako addToFavouritesButton
     */
    this.initAddToFavouritesButton = function(el) {
        this.addToFavouritesButton = el;
    }

    /**
     * Inicializuje GoThrowFavouritesButton
     * @param {Element} el Element, který má být nastaven jako goThrowFavouritesButton 
     */
    this.initGoThrowFavouritesButton = function(el) {
        this.goThrowFavouritesButton = el;
    }

    /**
     * Inicializuje removeButton
     * @param {Element} el Element, který má být nastaven jako removeButton
     */
    this.initRemoveButton = function(el) {
        this.removeButton = el;
    }

    /**
     * Inicializuje evenWeekButton
     * @param {Element} el Element, který má být nastaven jako evenWeekButton 
     */
    this.initEvenWeekButton = function(el) {
        this.evenWeekButton = el;
    }

    /**
     * Inicializuje oddWeekButton
     * @param {Element} el Element, který má být nastaven jako oddWeekButton 
     */
    this.initOddWeekButton = function(el) {
        this.oddWeekButton = el;
    }

    /**
     * Nastaví jako text actualScheduleNumberHolder dané číslo
     * @param {Number} number Číslo, které se má nastavit do numberHolderu
     */
    this.updateNumberHolder = function(number) {
        for(var i = 0; i < this.actualScheduleNumberHolders.length; ++i) {
            this.actualScheduleNumberHolders[i].innerHTML = number;
        }
    }

    /**
     * Provede vizualizaci zobrazení sudého rozvrhu
     */
    this.showEven = function() {
        this.evenWeekButton.style.color = "blue";
        this.oddWeekButton.style.color = null;
    }

    /**
     * Provede vizualizaci zobrazení lichého rozvrhu
     */
    this.showOdd = function() {
        this.evenWeekButton.style.color = null;
        this.oddWeekButton.style.color = "blue";
    }

    /**
     * Změní text Tlačítka "Procházet oblíbené" na "Procházet vše"
     * @param {Function} clickHandler Funkce, která má být vykonána po kliknutí na goThrowFavouritesButton 
     */
    this.goThrowFavourites = function(clickHandler) {
        this.goThrowFavouritesButton.innerHTML = "Procházet vše";
        this.goThrowFavouritesButton.onclick = clickHandler;
        this.addToFavouritesButton.innerHTML = "Odebrat z oblíbených";
        document.body.style.background = "lightgreen";
    }

    /**
     * Změní text Tlačítka "Procházet vše" na "Procházet oblíbené"
     * @param {Function} clickHandler Funkce, která má být vykonána po kliknutí na goThrowFavouritesButton 
     */
    this.exitFavourites = function(clickHandler) {
        this.goThrowFavouritesButton.innerHTML = "Procházet oblíbené";
        this.goThrowFavouritesButton.onclick = clickHandler;
        this.addToFavouritesButton.innerHTML = "Přidat do oblibených";
        document.body.style.background = null;
    }

    /**
     * Získá hodnotu z maxInputElementu
     * @returns Vrací číslo zadané v maxInputElementu
     */
    this.getMaxFromInput = function() {
        return parseInt(this.maxInputElement.value);
    }
}

/**
 * Objekt reprezentující view pro tlačítka, které se mají nalepit na spodní okraj obrazovky u rozvrhů
 * @property {Element[]} scheduleEls Elementy, které v sobě obsahují vygenerované rozvrhy (více jich je u řešení responzivity více elementy)
 * @property {Element} buttonsContainer Element, který v sobě obsahuje tlačítka, která se mají nalepit na spodní okraj obrazovky
 * @class
 */
View.prototype.Schedules.prototype.FixedButtons = function() {
    this.scheduleEls = null;
    this.buttonsContainer = null;
    this.lastPos = 0;

    /**
     * Inicializuje scheduleEls
     * @param {Element[]} els Elementy, které mají být nastaveny jako scheduleEls 
     */
    this.initScheduleEls = function(els) {
        this.scheduleEls = els;
    }

    /**
     * Inicializuje buttonsContainer
     * @param {Element} el Element, který má být nastaven jako buttonsContainer
     */
    this.initButtonsContainer = function(el) {
        this.buttonsContainer = el;
    }

    /**
     * Zobrazí tlačítka
     */
    this.buttonsShow = function() {
        this.buttonsContainer.style.display = "flex";
    }
    
    /**
     * Skryje tlačítka
     */
    this.buttonsHide = function() {
        this.buttonsContainer.style.display = "none";
        this.stickedAtPosition = 0;
    }

    /**
     * Přilepí tlačítka na spodní okraj obrazovky
     */
    this.buttonsStick = function() {
        this.buttonsContainer.style.position = null;
        this.buttonsContainer.style.backgroundColor = null; 
    }

    /**
     * Odlepí tlačítka od spodního okraje obrazovky
     */
    this.buttonsUnStick = function() {
        this.buttonsContainer.style.position = "relative";
        this.buttonsContainer.style.backgroundColor = "white";
    }

    /**
     * Zjistí, zda na displayi jde vidět některý z elementů s rozvrhem
     * @returns Vrací true, pokud je na displayi vidět nějaký z elementů s rozvrhem, jinak false
     */
    this.isScheduleElDisplayed = function() {
        for(var i = 0; i < this.scheduleEls.length; ++i) {
            if($(window).scrollTop() + $(window).height() >= this.scheduleEls[i].offsetTop && 
                window.getComputedStyle(this.scheduleEls[i]).getPropertyValue("display") != "none") 
                    return true;
        }
        return false;
    }

    /**
     * Zjistí, zda se tlačítka mají přilepit na spodní okraj obrazovky
     * @returns Vrací true, pokud by se tlačítka měla přilepit, jinak false
     */
    this.shouldBeSticked = function() {
        for(var i = 0; i < this.scheduleEls.length; ++i) {
            if($(window).scrollTop() + $(window).height() >= (this.scheduleEls[i].offsetTop + this.scheduleEls[i].offsetHeight) && 
                window.getComputedStyle(this.scheduleEls[i]).getPropertyValue("display") != "none") 
                    return true;
        }
        return false;
    }

    /**
     * Zjistí směr scrollování (dolů / nahoru)
     * @returns Vrací 1, pokud se scrolluje dolů, jinak -1
     */
    this.scrollDirection = function() {
        var direction;
        var scroll = $(window).scrollTop();
        if(this.lastPos < scroll) direction = 1;
        else direction = -1;
        this.lastPos = scroll;
        return direction;
    }

    /**
     * Zkontroluje pozici scrollu. Podle pozice scrollu přilepí / odlepí tlačítka.
     */
    this.checkScrollPosition = function() {
            if(this.scrollDirection() != 1) {
                this.buttonsUnStick();
            } 
            else {
                if(!this.shouldBeSticked() && this.isScheduleElDisplayed()) {
                    this.buttonsStick();
                }
                else {
                    this.buttonsUnStick();
                }
            }
    }

    document.addEventListener("scroll", this.checkScrollPosition.bind(this), true);

    /**
     * Funkce Pokud se kliklo do 
     * @param {Event} e Event, který byl vykonán 
     */
    this.touched = function(e) {
        var inside = false;
        for(var i = 0; i < this.scheduleEls.length; ++i) {
            if(e.target == this.scheduleEls[i]) {
                inside = true;
                break;
            }
        }
        if(inside) {
            //if(e.target == this.buttonsContainer) {
                if(this.isScheduleElDisplayed() && !this.shouldBeSticked()) {
                    this.buttonsStick();
                }
            //}
        }
    }

    document.addEventListener("touch", this.touched.bind(this), false);
    document.addEventListener("click", this.touched.bind(this), false);
}
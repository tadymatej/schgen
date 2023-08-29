/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename schedule.js
 */

/**
 * Objekt reprezentující controller ovládající vykreslování rozvrhů
 * @property {View.Schedule} scheduleView View, které vykresluje rozvrh
 * @class
 */
Controller.prototype.Schedule = function() {
    this.scheduleView = null;
    
    /**
     * Inicializuje scheduleView
     * @param {View.Schedule} view View, která má být nastavena jako scheduleView 
     */
    this.initScheduleView = function(view) {
        this.scheduleView = view;
    }

    /**
     * Vloží předmět do rozvrhů pro všechna zařízení
     * @param {Number[]} times Časy, ve kterých se předmět vyučuje
     * @param {String} name Kód předmětu
     * @param {String} classroom Místnost, ve které se předmět vyučuje
     * @param {String} teacher Vyučující předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení)
     */
    this.insertSubject = function(times, name, classroom, teacher, type, id, onStickedHandler = null) {
        this.scheduleView.desktop.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler);
        this.scheduleView.tablet.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler);
        this.scheduleView.mobile.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler);
    }

    /**
     * Vloží předmět do rozvrhů pro všechna zařízení a navíc mu nastaví styly, že je sticked tento předmět
     * @param {Number[]} times Časy, ve kterých se předmět vyučuje
     * @param {String} name Kód předmětu
     * @param {String} classroom Místnost, ve které se předmět vyučuje
     * @param {String} teacher Vyučující předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení)
     * @param {String} id Identifikátor daného vloženého předmětu, který mu  bude nastaven 
     * @param {Function} onStickedHandler Funkce, která se má zavolat na event onSticked
     */
    this.insertSubjectAndStick = function(times, name, classroom, teacher, type, id, onStickedHandler = null) {
        this.scheduleView.setSticked(this.scheduleView.desktop.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler));
        this.scheduleView.setSticked(this.scheduleView.tablet.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler));
        this.scheduleView.setSticked(this.scheduleView.mobile.insertSubject(times, name, classroom, teacher, type, id, onStickedHandler));
    }

    /**
     * Scrollne k aktuálně zobrazenému rozvrhu
     */
    this.scrollToSchedule = function() {
        if(window.getComputedStyle(this.scheduleView.desktop.dataContainer).getPropertyValue("display") != "none") this.scheduleView.desktop.scrollToSchedule();
        if(window.getComputedStyle(this.scheduleView.tablet.dataContainer).getPropertyValue("display") != "none") this.scheduleView.tablet.scrollToSchedule();
        if(window.getComputedStyle(this.scheduleView.mobile.dataContainer).getPropertyValue("display") != "none") this.scheduleView.mobile.scrollToSchedule();
    }

    /**
     * Smaže všechny vygenerované rozvrhy z view
     */
    this.clear = function() {
        this.scheduleView.desktop.clear();
        this.scheduleView.tablet.clear();
        this.scheduleView.mobile.clear();
    }
}
/**
 * @author Igar Sauchanka (xsauch00)
 * @filename freeTime.js
 * 
 */

/**
 * Objektr reprezentující view Vkládání volna
 * @property {Element[]} tables Tabulky s výběrem volna (více při řešení responzivity více tabulkami)
 * @property {Element} container Element, který obsahuje všechny tabulky s výběrem volna
 * @class
 */
View.prototype.FreeTime = function() {
    this.tables = null;

    this.container = null;

    /**
     * Inicializuje container
     * @param {Element} el Element, který má být nastaven jako container
     */
    this.initContainer = function(el) {
       this.container = el; 
    }

    /**
     * Zobrazí container s tabulkou pro výběr volna
     */
    this.show = function() {
        this.container.style.display = "flex";
    }

    /**
     * Skryje container s tabulkou pro výběr volna
     */
    this.hide = function() {
        this.container.style.display = "none";
    }

    /**
     * Zjistí, zda je element uvnitř containeru s výběrem volna
     * @param {Element} el Element, pro který se zjišťuje, zda je uvnitř containeru
     * @returns Vrací true, pokud element je uvnitř containeru, jinak false
     */
    this.isInsideContainer = function(el) {
        if(el == this.container || el.parentElement == this.container || 
            el.parentElement.parentElement == this.container) return true;
        else return false;
    }

    /**
     * Inicializuje table element objektu = nastaví buňkám event listenery
     * @param {Element} el Element, který má sloužit jako tabulka pro výběr volných hodin
     * @param {Function} mousedownHandler Funkce, která se má zavolat na mousedown uvnitř els
     * @param {Function} mouseupHandler Funkce která se má zavolat na mouseup uvnitř els
     */
     this.initTables = function(els, mousedownHandler = null, mouseupHandler = null) {
        this.tables = els;
        for(var i = 0; i < this.tables.length; ++i) {
            this.tables[i].onmousedown = mousedownHandler;
            this.tables[i].onmouseup = mouseupHandler;
        }
    }

    /**
     * Nastaví event handlery buňkám tabulek
     * @param {Function} mousedownHandler Funkce, která se zavolá při stisku myši na buňku v tabulce s výběrem volna
     * @param {Function} mouseenterHandler Funkce, která se zavolá při najetí myší na buňku v tabulce s výběrem volna
     * @param {*} toBind Bindne se jako this při volání handlerů
     */
    this.tablesColsBindHandlers = function(mousedownHandler = null, mouseenterHandler = null, toBind = null) {
        for(var k = 0; k < this.tables.length; ++k) {
            var rows = $(this.tables[k]).find("tr");
            for(var i = 1; i < rows.length; ++i) {
                var cols = $(rows[i]).find("td");
                for(var j = 1; j < cols.length; ++j) {
                    if(mousedownHandler != null)
                        cols[j].onmousedown = mousedownHandler.bind(toBind, cols[j]);
                    if(mouseenterHandler != null)
                        cols[j].onmouseenter = mouseenterHandler.bind(toBind, cols[j]);
                }
            }
        }
    }

    /**
     * Zjistí, zda element reprezentující sloupec tabulky je vybrán či nikoliv
     * @param {Element} el Element, pro který se zjišťuje, zda je vybraný
     * @returns Vrací true, pokud je element vybrán, jinak false
     */
    this.isColumnSelected = function(el) {
        if(el.style.background != "green") return false;
        else return true;
    }

    /**
     * Změní barvu všech buněk s hodnotou hour v tabulkách s výběrem volna
     * @param {*} background CSS value, která se má nastavit pro style.background 
     * @param {Number} hour Čas volna, pro který se mění barva
     */
    this.tablesColsSetBackground = function(background, hour) {
        for(var i = 0; i < this.tables.length; ++i) {
            var el = this.tables[i].querySelectorAll('[data-hour="' + hour + '"]')[0];   
            el.style.background = background;
        }
    }
}
/**
 * @author Igar Sauchanka (xsauch00)
 * @filename help.js
 */

/**
 * Objekt reprezentující view nápovědy
 * @property {Element} container Container element nápovědy
 * @class 
 */
View.prototype.Help = function() {
    this.container = null;

    /** 
     * Inicializuje container nápovědy
     * @param {Element} el Element, který má být nastaven jako container
     */
    this.initContainer = function(el) {
        this.container = el;
    }
    
    /** 
     * Zobrazí nápovědu
     */
    this.show = function() {
        this.container.style.display = "flex";
        document.body.addEventListener("click", this.callHide, false);
    }

    /** 
     * Skryje nápovědu
     */
    this.hide = function() {
        this.container.style.display = null;
        document.body.removeEventListener("click", this.callHide, false);
    }

    /** 
     * Pokusí se skrýt nápovědu
     */
    this.tryHide = function(e) {
        if(e.target == this.container) this.hide();
    }

    this.callHide = this.tryHide.bind(this);
}
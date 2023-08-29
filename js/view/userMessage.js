/**
 * @author Igar Sauchanka (xsauch00)
 * @filename userMessage.js
 */

/**
 * Objekt reprezentující view vykreslující informační hlášky pro uživatele o stavu akcí
 * @property {Element} conteiner Element, který obsahuje celou zprávu
 * @property {Timeout} timeout Timeout, který byl zapnut z důvodu animace. Při vícenásobném rychlém vložení zprávy se musí vyresetovat.
 * @class
 */
View.prototype.UserMessage = function() {
    this.container = document.createElement("div");
    this.container.className = "user-message";
    document.body.appendChild(this.container);

    this.timeout = null;

    /**
     * Nastaví text zprávy
     * @param {String} message Zpráva, která má být nastavena
     */
    this.setMessage = function(message, type = 0) {
        this.container.innerHTML = message;
        if(type == 0) this.container.style.background = "green";
        else this.container.style.background = "red";
    }

    /**
     * Zobrazí zprávu
     */
    this.show = function() {
        this.container.style.transitionDuration = "0";
        this.container.style.display = "block";
        if(this.timeout != null) {
            clearInterval(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(function() {
            this.container.style.opacity = "1";
            this.container.style.transitionDuration = "2s";
        }.bind(this), 200);
    }

    /**
     * Skryje zprávu
     */
    this.hide = function() {
        this.container.style.display = "none";
        this.container.style.opacity = "1";
    }

    /**
     * Skryje zprávu s animací
     */
    this.hideAnimated = function() {
        if(this.timeout != null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.container.style.opacity = "0";
        this.timeout = setTimeout(this.hide.bind(this), 4000);
    }
}
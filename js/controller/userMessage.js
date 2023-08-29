/**
 * @author Igar Sauchanka (xsauch00)
 * @filename userMessage.js
 */

/**
 * Objekt reprezentující controller ovladající informační hlášky pro uživatele o stavu akcí
 * @property {View.UserMessage} userMessageView View UserMessage, kam zasílá zprávy na vykreslování
 * @class
 */
Controller.prototype.UserMessage = function() {
    this.userMessageView = null;

    /**
     * Nastaví this.userMessageView
     * @param {View.UserMessage} view View, která má být nastavena 
     */
    this.initUserMessageView = function(view) {
        this.userMessageView = view;
    }

    /**
     * Vloží zprávu do view
     * @param {String} message Text reprezentující zprávu, která má být vypsána 
     */
    this.messageAppend = function(message, type = 0) {
        this.userMessageView.setMessage(message, type);
        this.userMessageView.show();
        setTimeout(this.userMessageView.hideAnimated.bind(this.userMessageView), 2000);
    }
}
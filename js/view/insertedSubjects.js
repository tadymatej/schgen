/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename insertedSubjects.js
 */

/**
 * Objekt reprezentující view Vložených předmětů
 * @property {Element} container Element, který obsahuje vložené předměty 
 * @property {Function} removeHandler Funkce, která se zavolá při smazání vloženého předmětu z view
 * @class
 */
View.prototype.InsertedSubjects = function() {
    this.container = null;
    this.removeHandler = null;

    /**
     * Inicializuje container
     * @param {Element} el Element, který má být nastaven jako container
     */
    this.initContainer = function(el) {
        this.container = el;
    }

    /**
     * Inicializuje removeHandler
     * @param {Function} handler Funkce, která má být volána při smazání vloženého předmětu z view
     */
    this.initRemoveHandler = function(handler) {
        this.removeHandler = handler;
    }

    /**
     * Odstraní element z vložených předmětů podle hodnoty
     * @param {String} value Hodnota, podle které se má odstranit z vložených předmětů 
     */
    this.removeElByValue = function(value) {    //TODO
        var els = $(this.container).find(".name");
        for(var i = 0; i < els.length; ++i) {
            if(els[i].innerText == value) {
                els[i].parentElement.remove();
                return;
            }
        }
    }

    /**
     * Vytvoří element s předmětem pro vložení do vložených předmětů
     * @param {String} value hodnota, která se má nastavit dovnitř vytvořeného elementu s předmětem (Kód předmětu) 
     * @returns Vrací vytvořený element
     */
    this.createSubjectElement = function(value) {
        var subject = document.createElement("div");
        subject.className = "subject";

        var name = document.createElement("div");
        name.className = "name";
        name.innerHTML = value;
        var remove = document.createElement("div");
        remove.innerHTML = "X";
        remove.className = "remove";
        remove.title = "Odebrat předmět";
        remove.onclick = function(el) {
            el.parentElement.remove();
            if(this.removeHandler != null) {
                var hourData = el.parentElement.getAttribute("data-inserted-hour");
                if(hourData == "" || hourData == null)
                    this.removeHandler(el.parentElement.firstElementChild.innerHTML);
                else this.removeHandler(hourData)
            }
        }.bind(this, remove);
        subject.appendChild(name);
        subject.appendChild(remove);
        return subject;
    }

    /**
     * Vloží element s předmětem do vložených předmětů úplně na konec
     * @param {String} value Kód předmětu, který se vkládá
     * @returns Vrací vložený element
     */
    this.append = function(value) {
        var el = this.createSubjectElement(value);
        this.container.appendChild(el);
        return el;
    }

    /**
     * Vloží element s předmětem do vložených předmětů před element el
     * @param {Element} el Element, před který se má vložit element s předmětem
     * @param {String} value Kód předmětu, který se vkládá
     * @returns Vrací vložený element
     */
    this.insertBefore = function(el, value) {
        var subject = this.createSubjectElement(value);
        el.parentElement.insertBefore(subject, el);
        return subject;
    }

    /**
     * Vloží element s předmětem do vložených předmětů. Prvek se vloží na místo tak, aby výstup byl abecedně seřazený
     * @param {String} value Kód předmětu, který se vkládá
     * @returns Vrací vložený element
     */
    this.insert = function(value) {
        var childs = this.container.children;
        if(childs.length == 0) return this.append(value);
        else {
            var i = 0;
            for(; i < childs.length; ++i) {
                if(value <= childs[i].firstElementChild.innerHTML) break;
            }
            if(i == childs.length) return this.append(value);
            else return this.insertBefore(childs[i], value);
        }
    }

    /**
     * Vloží do vložených předmětů volno
     * @param {Number} hour Čas volna, které se má vložit 
     */
    this.insertFreeTime = function(hour) {
        hour = parseInt(hour);
        var day = parseInt(hour / 24);
        if(day == "0") day = "Po";
        else if(day == 1) day = "Út";
        else if(day == 2) day = "St";
        else if(day == 3) day = "Čt";
        else day = "Pá";
        var time = hour % 24;
        var inserted = this.insert("Volno v " + day + " " + time + "-" + (time + 1) + "h");
        inserted.setAttribute("data-inserted-hour", hour);
    }

    /**
     * Odstraní z vložených předmětů volno
     * @param {Number} hour Čas volna, které se má odebrat
     */
    this.removeFreeTime = function(hour) {
        var els = $(this.container).find(".subject");
        for(var i = 0; i < els.length; ++i) {
            if(els[i].getAttribute("data-inserted-hour") == hour) {
                els[i].remove();
                return;
            }
        }
    }
}
/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename schedule.js
 */

/**
 * Objekt reprezentující view rozvrhu
 * @property {View.Schedule.Desktop} desktop View ovládající rozvrhy na počítači 
 * @property {View.Schedule.Tablet} tablet View ovládající rozvrhy na tabletu
 * @property {View.Schedule.Mobile} mobile View ovládající rozvrhy na mobilu
 * @class
 */
View.prototype.Schedule = function() {
    this.desktop = new this.Desktop();
    this.tablet = new this.Tablet();
    this.mobile = new this.Mobile();

    /**
     * Nastaví element reprezentující termín v rozvrhu jako sticked termín
     * @param {Element} el Element, na kterém bylo provedeno sticked
     * @param {Function} handlerToCall Funkce, která se má volat
     */
    View.prototype.Schedule.prototype.setSticked = function(el, handlerToCall = null) {
        var span = null;
        var subjectName = el.firstElementChild.firstElementChild.innerHTML;
        if(el.style.backgroundColor == "green") {
            subjectName += "-LECT";
            var len = Math.round(el.offsetWidth / 70);
            var len2 = Math.round(el.offsetHeight / 70);
            if(len2 > len)
                subjectName += len2;
            else subjectName += len;
        }
        else if(el.style.backgroundColor == "yellow") subjectName += "-EX";
        else subjectName += "-DEMO";
        var subjectTime = new SubjectTime(parseInt(el.getAttribute("data-startTime")), parseInt(el.getAttribute("data-endTime")) + 1, subjectName, 
                                el.getAttribute("data-classroom"), el.getAttribute("data-teacher"));
        if((span = $(el).find(".subject-sticked")[0]) == null) {
            var spans = $("." + el.className.split(" ")[1]);
            for(var i = 0; i < spans.length; ++i) {
                span = document.createElement("span");
                span.className = "subject-sticked";
                span.innerHTML = "S";
                span.title = "Termín přilepen a zůstane na stejném místě";
                span.style.position = "absolute";
                span.style.top = "0";
                span.style.right = "0";
                span.style.width = "20px";
                span.style.height = "20px";
                span.style.borderRadius = "50%";
                span.style.border = "2px solid black";
                span.style.background = "white";
                span.style.display = "flex";
                span.style.justifyContent = "center";
                spans[i].appendChild(span);
            }
            if(handlerToCall != null) handlerToCall(true, subjectTime);
        } else {
            var spans = $("." + el.className.split(" ")[1] + " .subject-sticked");
            for(var i = 0; i < spans.length; ++i) spans[i].remove();
            if(handlerToCall != null) handlerToCall(false, subjectTime);
        }
    }

    /**
     * Vytvoří element, který bude obsahovat informace o termínu předmětu v rozvrhu
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení) 
     * @returns Vrací vytvořený element
     */
    View.prototype.Schedule.prototype.createSubjectEl = function(name, classroom, teacher, type, id, onStickedHandler = null) {
        var subjectEl = document.createElement("td");
        subjectEl.setAttribute("data-classroom", classroom);
        subjectEl.setAttribute("teacher", teacher);
        var div = document.createElement("div");
        div.style.height = "62px";
        div.style.overflow = "auto";
        div.style.overflowX = "hidden";
        div.style.maxHeight = "62px";
        div.style.width = "100%";

        subjectEl.appendChild(div);

        var nameEl = document.createElement("div");
        nameEl.style.width = "100%";
        var classroomEl = document.createElement("div");
        classroomEl.style.width = "100%";
        var teacherEl = document.createElement("div");
        teacherEl.style.width = "100%";
        subjectEl.className = "inserted-subject " + id;
        nameEl.innerHTML = name;
        classroomEl.innerHTML = classroom;
        teacherEl.innerHTML = teacher;

        div.appendChild(nameEl);
        div.appendChild(classroomEl);
        div.appendChild(teacherEl);

        subjectEl.onclick = View.prototype.Schedule.prototype.setSticked.bind(this, subjectEl, onStickedHandler);
        
        subjectEl.style.justifyContent = "center";
        subjectEl.style.flexDirection = "column";
        subjectEl.style.display = "flex";
        subjectEl.style.position = "absolute";
        subjectEl.style.overflowY = "hidden";
        subjectEl.style.flexWrap = "wrap";
        subjectEl.style.border = "2px solid black";
        subjectEl.style.textAlign = "center";
        subjectEl.style.flexDirection = "column";
        subjectEl.style.flex = "1 0 100%";


        switch(type) {
            case 0: subjectEl.style.backgroundColor = "green"; break;
            case 1: subjectEl.style.backgroundColor = "blue"; break;
            case 2: subjectEl.style.backgroundColor = "yellow"; break;
        }

        return subjectEl;
    }
}

/**
 * Objekt reprezentující view rozvrhu na počítači
 * @property {Element} dataContainer Element, do kterého se vkládají elementy s předměty 
 * @property {Number} width Šířka jednoho sloupce v rozvrhu
 * @property {Number} border Šířka obou okrajů dohromady v jednom sloupci
 * @property {Number} offsetLeft Vzdálenost od levého okraje, která se má vždy přičíst 
 * @property {Number} marginLeft Velikost okraje mezi dvěma sloupci
 * @class
 */
View.prototype.Schedule.prototype.Desktop = function() {
    this.dataContainer = null;
    this.width = 75;
    this.border = 8;
    this.offsetLeft = 30;
    this.marginLeft = 1.5;

    /**
     * Scrollne na rozvrhy
     */
    this.scrollToSchedule = function() {
        this.dataContainer.scrollIntoView();
    }

    /**
     * Vymaže veškeré vložené předměty
     */
    this.clear = function() {
        var els = $(this.dataContainer).find(".inserted-subject");
        for(var i = 0; i < els.length; ++i) els[i].remove();
    }

    /**
     * Inicializuje dataContainer
     * @param {Element} el Element, který má být nastaven jako dataContainer 
     */
    this.initDataContainer = function(el) {
        this.dataContainer = el;
    }

    /**
     * @inherit View.Schedule.createSubjectEl
     * Vytvoří element, který bude obsahovat informace o termínu předmětu v rozvrhu
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení) 
     * @returns Vrací vytvořený element
     */
    View.prototype.Schedule.prototype.Desktop.prototype.createSubjectEl = function(name, teacher, classroom, type, id, onStickedHandler = null) {
        return View.prototype.Schedule.prototype.createSubjectEl.call(this, name, teacher, classroom, type, id, onStickedHandler);
    }

    /**
     * Vloží předmět do dataContaineru
     * @param {Number[]} times Časy, ve kterých se termín vyučuje 
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení)
     */
    this.insertSubject = function(times, name, classroom, teacher, type, id, onStickedHandler = null) {
        var row = parseInt((times[0] / 24)) + 1;
        var col = (times[0] % 24) - 6;
        if(col < 0) return;
        var len = times.length;
        
        var subjectEl = this.createSubjectEl(name, teacher, classroom, type, id, onStickedHandler);
        subjectEl.setAttribute("data-startTime", times[0]);
        subjectEl.setAttribute("data-endTime", times[times.length - 1]);
        var left = (col * this.width + this.offsetLeft);
        left += this.marginLeft * col + 4; 
        subjectEl.style.marginLeft = left + "px";
        
        var width = (this.width * len - this.border);
        width += this.marginLeft * len * 2 - len * 3; 
        subjectEl.style.width = width + "px";

        $(this.dataContainer).find("tr")[row].appendChild(subjectEl);
        return subjectEl;
    }
}

/**
 * Objekt reprezentující view rozvrhu na tabletu
 * @property {Element} dataContainer Element, do kterého se vkládají elementy s předměty 
 * @property {Number} width Šířka jednoho sloupce v rozvrhu
 * @property {Number} border Šířka obou okrajů dohromady v jednom sloupci
 * @property {Number} height Výška jednoho řádku v rozvrhu
 * @property {Number} offsetLeft Vzdálenost od levého okraje, která se má vždy přičíst 
 * @property {Number} marginLeft Velikost okraje mezi dvěma sloupci
 * @property {Number} offsetTop Vzdálenost od horního okraje, která se má vždy přičíst 
 * @property {Number} marginTop Velikost okraje mezi dvěma řádky
 * @class
 */
View.prototype.Schedule.prototype.Tablet = function() {
    this.dataContainer = null;
    this.width = 72;
    this.border = 8;
    this.height = 70;
    this.marginLeft = 4;
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.marginTop = 0.2;

    /**
     * Scrollne na rozvrhy
     */
    this.scrollToSchedule = function() {
        this.dataContainer.scrollIntoView();
    }

    /**
     * Vymaže veškeré vložené předměty
     */
    this.clear = function() {
        var els = $(this.dataContainer).find(".inserted-subject");
        for(var i = 0; i < els.length; ++i) els[i].remove();
    }

    /**
     * Inicializuje dataContainer
     * @param {Element} el Element, který má být nastaven jako dataContainer 
     */
    this.initDataContainer = function(el) {
        this.dataContainer = el;
    }

    /**
     * @inherit View.Schedule.createSubjectEl
     * Vytvoří element, který bude obsahovat informace o termínu předmětu v rozvrhu
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení) 
     * @returns Vrací vytvořený element
     */
    View.prototype.Schedule.prototype.Tablet.prototype.createSubjectEl = function(name, teacher, classroom, type, id, onStickedHandler = null) {
        return View.prototype.Schedule.prototype.createSubjectEl.call(this, name, teacher, classroom, type, id, onStickedHandler);
    }

    /**
     * Vloží předmět do dataContaineru
     * @param {Number[]} times Časy, ve kterých se termín vyučuje 
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení)
     */
    this.insertSubject = function(times, name, classroom, teacher, type, id, onStickedHandler = null) {
        var row = parseInt((times[0] / 24));
        var col = (times[0] % 24) - 6;
        if(col < 0) return;
        var len = times.length;

        var subjectEl = this.createSubjectEl(name, teacher, classroom, type, id, onStickedHandler);
        subjectEl.setAttribute("data-startTime", times[0]);
        subjectEl.setAttribute("data-endTime", times[times.length - 1]);
        subjectEl.firstElementChild.style.height = null;
        subjectEl.firstElementChild.style.maxHeight = null;

        var left = (row * this.width) + this.offsetLeft;
        left += this.marginLeft;
        subjectEl.style.marginLeft = left + "px";

        var top = (col * this.height) + this.offsetTop;
        top += col * this.marginTop - 1;
        subjectEl.style.marginTop = top + "px";
        
        var width = this.width - this.border;
        subjectEl.style.width = width + "px";
        var height = this.height * len - (this.marginTop * 2) - 5;
        subjectEl.style.height = height + "px";

        this.dataContainer.appendChild(subjectEl);
        return subjectEl;
    }
}

/**
 * Objekt reprezentující view rozvrhu na tabletu
 * @property {Element} dataContainer Element, do kterého se vkládají elementy s předměty 
 * @property {Number} width Šířka jednoho sloupce v rozvrhu
 * @property {Number} border Šířka obou okrajů dohromady v jednom sloupci
 * @property {Number} height Výška jednoho řádku v rozvrhu
 * @property {Number} offsetLeft Vzdálenost od levého okraje, která se má vždy přičíst 
 * @property {Number} marginLeft Velikost okraje mezi dvěma sloupci
 * @property {Number} offsetTop Vzdálenost od horního okraje, která se má vždy přičíst 
 * @property {Number} marginTop Velikost okraje mezi dvěma řádky
 * @class
 */
View.prototype.Schedule.prototype.Mobile = function() {
    this.dataContainer = null;
    this.width = 72;
    this.border = 8;
    this.height = 70;
    this.marginLeft = 4;
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.marginTop = 0.2;
    this.showLast = false;

    /**
     * Scrollne na rozvrhy
     */
    this.scrollToSchedule = function() {
        this.dataContainer.scrollIntoView();
    }

    /**
     * Vymaže veškeré vložené předměty
     */
    this.clear = function() {
        var els = $(this.dataContainer).find(".inserted-subject");
        for(var i = 0; i < els.length; ++i) els[i].remove();
    }

    /**
     * Inicializuje dataContainer
     * @param {Element} el Element, který má být nastaven jako dataContainer 
     */
    this.initDataContainer = function(el) {
        this.dataContainer = el;
    }


    /**
     * @inherit View.Schedule.createSubjectEl
     * Vytvoří element, který bude obsahovat informace o termínu předmětu v rozvrhu
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení) 
     * @returns Vrací vytvořený element
     */
    View.prototype.Schedule.prototype.Mobile.prototype.createSubjectEl = function(name, teacher, classroom, type, id, onStickedHandler = null) {
        return View.prototype.Schedule.prototype.createSubjectEl.call(this, name, teacher, classroom, type, id, onStickedHandler);
    }

    /**
     * Prohodí dny, které se právě zobrazují
     */
    this.swapShowing = function() {
        if(!this.showLast) {
            $(".mobile-content td")[0].className = $(".mobile-content td")[0].className + " default-hidden";
            $(".mobile-content td")[1].className = $(".mobile-content td")[1].className + " default-hidden";
            $(".mobile-content td")[2].className = $(".mobile-content td")[2].className + " default-hidden";
            $(".mobile-content td")[3].className = $(".mobile-content td")[3].className.replace(" default-hidden", "");
            $(".mobile-content td")[4].className = $(".mobile-content td")[4].className.replace(" default-hidden", "");
        }
        else {
            $(".mobile-content td")[0].className = $(".mobile-content td")[0].className.replace(" default-hidden", "");
            $(".mobile-content td")[1].className = $(".mobile-content td")[1].className.replace(" default-hidden", "");
            $(".mobile-content td")[2].className = $(".mobile-content td")[2].className.replace(" default-hidden", "");
            $(".mobile-content td")[3].className = $(".mobile-content td")[3].className + " default-hidden";
            $(".mobile-content td")[4].className = $(".mobile-content td")[4].className + " default-hidden";
        }
        this.showLast = !this.showLast;
        var inserted = $(this.dataContainer).find(".inserted-subject");
        for(var i = 0; i < inserted.length; ++i) {
            if(inserted[i].className.includes("default-hidden")) 
                inserted[i].className = inserted[i].className.replace("default-hidden", "").trim();
            else inserted[i].className += " default-hidden";
        }
    }

    /**
     * Vloží předmět do dataContaineru
     * @param {Number[]} times Časy, ve kterých se termín vyučuje 
     * @param {String} name Kód předmětu, který je v daném termínu vyučován
     * @param {String} classroom Třída, ve které se termín předmětu vyučuje
     * @param {String} teacher Vyučující termínu předmětu
     * @param {Number} type Typ předmětu (0 = přednáška, 1 = democvičení, 2 = cvičení)
     */
    this.insertSubject = function(times, name, classroom, teacher, type, id, onStickedHandler = null) {
        var row = parseInt((times[0] / 24));
        var col = (times[0] % 24) - 6;
        if(col < 0) return;
        var len = times.length;

        var subjectEl = this.createSubjectEl(name, teacher, classroom, type, id, onStickedHandler);
        subjectEl.setAttribute("data-startTime", times[0]);
        subjectEl.setAttribute("data-endTime", times[times.length - 1]);
        subjectEl.firstElementChild.style.height = null;
        subjectEl.firstElementChild.style.maxHeight = null;

        if(row >= 3) {
            if(!this.showLast) subjectEl.className += " default-hidden";
        } else {
            if(this.showLast) subjectEl.className += " default-hidden";
        }

        if(row >= 3) {
            row = row - 3;
        }
        var left = (row * this.width) + this.offsetLeft;
        left += this.marginLeft;
        subjectEl.style.marginLeft = left + "px";

        var top = (col * this.height) + this.offsetTop;
        top += col * this.marginTop - 1;
        subjectEl.style.marginTop = top + "px";
        
        var width = this.width - this.border;
        subjectEl.style.width = width + "px";
        var height = this.height * len - (this.marginTop * 2) - 5;
        subjectEl.style.height = height + "px";

        this.dataContainer.appendChild(subjectEl);
        return subjectEl;
    }
}
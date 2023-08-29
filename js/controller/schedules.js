/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename schedules.js
 *  
 */

/**
 * Objekt reprezentující controller pro práci s rozvrhy 
 * @param {StudiumParser} sp Model, který má být nastaven jako this.sp
 * @property {StudiumParser} sp Model pro práci s daty
 * @property {Schedule[]} schedules Pole vygenerovaných rozvrhů
 * @property {Schedule[]} favourites Pole oblíbených rozvrhů
 * @property {View.Schedules} schedulesView View pro vykreslování při operacích s rozvrhy
 * @property {Controller.Schedule} scheduleController Controller pro komunikaci s vkládáním předmětů do rozvrhu
 * @property {Number} insertedPosition Pozice vloženého rozvrhu uvnitř schedules / favourites
 * @property {Number} positionSchedules Pozice procházení uvnitř schedules
 * @property {Number} positionFavourites Pozice procházení uvnitř favourites
 * @property {Number} goingThrow Informace, zda se právě prochází přes schedules nebo favourites (0 / 1)
 * @property {LinkedListSubjects} linkedList Dvousměrně vázaný seznam předmětů, který umožňuje generovat rozvrhy
 * @property {Number} firstIterate Informace, zda se bude provádět první iterace nad danou konfigurací iterace
 * @property {Function} lastAction Funkce, kterou byly generovány rozvrhy naposledy (generate / iterate)
 * @class 
 */
Controller.prototype.Schedules = function(sp) {
    this.sp = sp;
    this.schedules = [];
    this.favourites = [];
    this.schedulesView;
    this.insertedPosition = -1;
    this.positionSchedules = -1;
    this.positionFavourites = -1;
    this.goingThrow = 0;
    this.scheduleController = null;
    this.userMessageController = null;
    this.linkedList = null;
    this.stickedSubjects = [];
    this.lastAction = null;
    this.firstIterate = true;


    /**
     * Inicializuje schedulesView
     * @param {View.Schedules} view View, která má být nastavena jako schedulesView
     */
    this.initSchedulesView = function(view) {
        this.schedulesView = view;
    }

    /**
     * Inicializuje userMessageController
     * @param {Controller.UserMessage} controller Controller, který má být nastaven jako userMessageController 
     */
     this.initUserMessageController = function(controller) {
        this.userMessageController = controller;
    }

    /**
     * Inicializuje scheduleController
     * @param {Controller.Schedule} controller Controller, který má být nastaven jako scheduleController 
     */
    this.initScheduleController = function(controller) {
        this.scheduleController = controller;
    }

    /**
     * Inicializuje nextButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako nextButton
     */
    this.initNextButton = function(el) {
        this.schedulesView.initNextButton(el);
        el.onclick = this.next.bind(this);
    }

    /**
     * Inicializuje previousButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako previousButton
     */
    this.initPreviousButton = function(el) {
        this.schedulesView.initPreviousButton(el);
        el.onclick = this.previous.bind(this);
    }

    /**
     * Inicializuje addToFavouritesButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako addToFavouritesButton
     */
    this.initAddToFavouritesButton = function(el) {
        this.schedulesView.initAddToFavouritesButton(el);
        el.onclick = this.addToFavourite.bind(this);
    }

    /**
     * Inicializuje goThrowFavouritesButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako goThrowFavouritesButton
     */
    this.initGoThrowFavouritesButton = function(el) {
        el.onclick = this.goThrowFavourites.bind(this);
        this.schedulesView.initGoThrowFavouritesButton(el);
    }

    /**
     * Inicializuje removeButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako removeButton
     */
    this.initRemoveButton = function(el) {
        this.schedulesView.initRemoveButton(el);
        el.onclick = this.remove.bind(this);
    }

    /**
     * Inicializuje evenWeekButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako evenWeekButton
     */
    this.initEvenWeekButton = function(el) {
        this.schedulesView.initEvenWeekButton(el);
        el.onclick = this.showEven.bind(this);
    }

    /**
     * Inicializuje oddWeekButton ve view a nastaví mu potřebný onclick eventHandler
     * @param {Element} el Element, který má být nastaven jako oddWeekButton
     */
    this.initOddWeekButton = function(el) {
        this.schedulesView.initOddWeekButton(el);
        el.onclick = this.showOdd.bind(this);
    }

    /**
     * Zobrazí aktuální rozvrh v sudém týdnu
     */
    this.showEven = function() {
        if(this.goingThrow == 0) this.insertEvenWeek(this.schedules[this.insertedPosition]);
        else this.insertEvenWeek(this.favourites[this.insertedPosition]);
        this.schedulesView.showEven();
    }

    /**
     * Zobrazí aktuální rozvrh v lichém týdnu
     */
    this.showOdd = function() {
        if(this.goingThrow == 0) this.insertEvenWeek(this.schedules[this.insertedPosition]);
        else this.insertEvenWeek(this.favourites[this.insertedPosition]);
        this.schedulesView.showOdd();
    }

    /**
     * Přepne průchod rozvrhů na oblíbené
     */
    this.goThrowFavourites = function() {
        this.schedulesView.goThrowFavourites(this.exitFavourites.bind(this));
        this.goingThrow = 1;
        this.positionSchedules = this.insertedPosition;
        this.insertedPosition = this.positionFavourites;
        if(this.insertedPosition >= 0) this.showEven();
        else this.scheduleController.clear();
        this.schedulesView.updateNumberHolder(this.insertedPosition);
    }

    /**
     * Přepne průchod rozvrhů na vygenerované
     */
    this.exitFavourites = function() {
        this.schedulesView.exitFavourites(this.goThrowFavourites.bind(this));
        this.goingThrow = 0;
        this.positionFavourites = this.insertedPosition;
        this.insertedPosition = this.positionSchedules;
        if(this.insertedPosition >= 0) this.showEven();
        else this.scheduleController.clear();
        this.schedulesView.updateNumberHolder(this.insertedPosition);
    }

    /**
     * Přidá aktuální rozvrh k oblíbeným
     */
    this.addToFavourite = function() {
        if(this.insertedPosition >= 0) {
            this.favourites.push(this.schedules[this.insertedPosition]);
            if(this.positionFavourites < 0) this.positionFavourites = 0;
        }
    }

    /**
     * Zobrazí následující rozvrh
     */
    this.previous = function() {
        if(this.insertedPosition - 1 >= 0) {
            this.insertedPosition--;
            this.showEven();
        }
        this.schedulesView.updateNumberHolder(this.insertedPosition);
    }

    /**
     * Odstraní aktuální rozvrh
     */
    this.remove = function() {
        this.scheduleController.clear();
        if(this.goingThrow == 0) {
            this.favourites.splice(this.insertedPosition, 1);
            if(this.insertedPosition >= this.favourites.length) this.insertedPosition--;
        }
        else {
            this.favourites.splice(this.insertedPosition, 1);
            if(this.insertedPosition >= this.favourites.length) this.insertedPosition--;
        }
        if(this.insertedPosition >= 0) this.showEven();
        this.schedulesView.updateNumberHolder(this.insertedPosition);
    }

    /**
     * Zobrazí následující rozvrh
     */
    this.next = function() {
        var len = this.schedules.length;
        if(this.goingThrow == 1) len = this.favourites.length;
        if(this.insertedPosition + 1 < len && this.insertedPosition >= 0) {
            this.insertedPosition++;
            this.showEven();
            this.schedulesView.updateNumberHolder(this.insertedPosition);
        }
        else if(this.goingThrow == 0) {
            if(this.lastAction != null) {
                this.lastAction();
                if(this.insertedPosition + 1 < this.schedules.length)
                    this.next();
            }
        }
    }

    /**
     * Vloží do listu termíny přednášek určité délky daných předmětů
     * @param {LinkedListSubjects} list List, do kterého se přidávají termíny přednášek
     * @param {*[]} subjects Předměty, které se mají vkládat
     * @param {Number} lectLen Délka přednášky, která se má vkládat
     * @returns {LinkedListSubjects} Vrací list, do kterého vložil termíny přednášky všech předmětů
     */
    this.appendLectureToList = function(list, subjects, lectLen) {
        for(var i = 0; i < subjects.length; ++i) {
            if(!isNaN(parseInt(subjects[i]))) continue;
            var subjectTimesLen = [];  //Někdy jsou v týdnu dvě přednášky různé velikosti, proto to je ošetřeno takto
            var times = this.sp.getLecturesOfSubject(subjects[i], parseInt($("select#semester")[0].value));
            for(var j = 0; j < times.length; ++j) {
                var startTime = times[j].times[0];
                var endTime = times[j].times[times[j].times.length - 1] + 1;
                var week = -1;
                if(times[j].teachingAt == "sudý") week = 0;
                else if(times[j].teachingAt == "lichý") week = 1;
                if(times[j].times.length == lectLen) {    
                    var subjectTime = new SubjectTime(startTime, endTime, subjects[i] + "-LECT" + lectLen, times[j].classroom, times[j].teacher, week);
                    subjectTimesLen.push(subjectTime);
                }
            }
            if(subjectTimesLen.length > 0)
                list.addItem(subjects[i]  + "-LECT" + lectLen, subjectTimesLen);
        }
        return list;
    }

    /**
     * Vloží do listu termíny přednášek předmětů
     * @param {LinkedListSubjects} list List, do kterého se přidávají termíny přednášek
     * @param {*[]} subjects Smíšené pole stringu a integerů, pokud se jedná o integer, je to volno, jinak předmět, který se má vložit
     * @returns {LinkedListSubjects} Vrací list, do kterého vložil termíny přednášek všech předmětů
     */
    this.appendLecturesToList = function(list, subjects) {
        list = this.appendLectureToList(list, subjects, 1);
        list = this.appendLectureToList(list, subjects, 2);
        list = this.appendLectureToList(list, subjects, 3);
        list = this.appendLectureToList(list, subjects, 4);
        return list;
    }

    /**
     * Vloží do listu termíny democvičení předmětů
     * @param {LinkedListSubjects} list List, do kterého se přidávají termíny democvičení
     * @param {*[]} subjects Smíšené pole stringu a integerů, pokud se jedná o integer, je to volno, jinak předmět, který se má vložit
     * @returns {LinkedListSubjects} Vrací list, do kterého vložil termíny democvičení všech předmětů
     */
    this.appendDemosToList = function(list, subjects) {
        for(var i = 0; i < subjects.length; ++i) {
            if(!isNaN(parseInt(subjects[i]))) continue;
            var times = this.sp.getDemosOfSubject(subjects[i], parseInt($("select#semester")[0].value));
            var subjectTimes = [];
            for(var j = 0; j < times.length; ++j) {
                var startTime = times[j].times[0];
                var endTime = times[j].times[times[j].times.length - 1] + 1;
                var week = -1;
                if(times[j].teachingAt == "sudý") week = 0;
                else if(times[j].teachingAt == "lichý") week = 1;
                var subjectTime = new SubjectTime(startTime, endTime, subjects[i] + "-DEMO", times[j].classroom, times[j].teacher, week);
                subjectTimes.push(subjectTime);
            }
            if(subjectTimes.length > 0)
                list.addItem(subjects[i] + "-DEMO", subjectTimes);
        }
        return list;
    }

    /**
     * Vloží do listu termíny cvičení předmětů
     * @param {LinkedListSubjects} list List, do kterého se přidávají termíny cvičení
     * @param {*[]} subjects Smíšené pole stringu a integerů, pokud se jedná o integer, je to volno, jinak předmět, který se má vložit
     * @returns {LinkedListSubjects} Vrací list, do kterého vložil termíny cvičení všech předmětů
     */
    this.appendExercisesToList = function(list, subjects) {
        for(var i = 0; i < subjects.length; ++i) {
            if(!isNaN(parseInt(subjects[i]))) continue;
            var times = this.sp.getExercisesOfSubject(subjects[i], parseInt($("select#semester")[0].value));
            var subjectTimes = [];
            for(var j = 0; j < times.length; ++j) {
                var startTime = times[j].times[0];
                var endTime = times[j].times[times[j].times.length - 1] + 1;
                var week = -1;
                if(times[j].teachingAt == "sudý") week = 0;
                else if(times[j].teachingAt == "lichý") week = 1;
                var subjectTime = new SubjectTime(startTime, endTime, subjects[i] + "-EX", times[j].classroom, times[j].teacher, week);
                subjectTimes.push(subjectTime);
            }
            if(subjectTimes.length > 0)
                list.addItem(subjects[i] + "-EX", subjectTimes);
        }
        return list;
    }

    /**
     * Vloží do listu volna
     * @param {LinkedListSubjects} list List, do kterého se přidávají volna
     * @param {*[]} subjects Smíšené pole stringu a integerů, pokud se jedná o integer, je to volno, které se má vložit, jinak předmět
     * @returns {LinkedListSubjects} Vrací list, do kterého vložil všechna volna
     */
    this.appendFreeTimesToList = function(list, subjects) {
        for(var i = 0; i < subjects.length; ++i) {
            if(isNaN(parseInt(subjects[i]))) continue;
            list.addItem("VOLNO", [new SubjectTime(subjects[i] - 1, subjects[i], "VOLNO", "", "")]);
        }
        return list;
    }

    /**
     * Vytvoří LinkedListSubjects a vloží do něj všechny termíny předmětů subjects
     * @param {*[]} subjects Smíšené pole stringu a integerů, pokud se jedná o integer, je to volno, které se má vložit, jinak předmět, který se má vložit
     * @returns Vrací vytvořený list
     */
    this.createLinkedList = function(subjects) {
        var linkedList = new LinkedListSubjects();
        linkedList = this.appendDemosToList(linkedList, subjects);
        linkedList = this.appendExercisesToList(linkedList, subjects);
        linkedList = this.appendLecturesToList(linkedList, subjects);
        linkedList = this.appendFreeTimesToList(linkedList, subjects);
        return linkedList;
    }

    /**
     * Zjistí typ vygenerovaného předmětu
     * @param {String} subject Název předmětu, který vypsal generátor rozvrhu
     * @returns Vrací: {0 = přednášeka, 1 = democvičení, 2 = cvičení}
     */
    this.getSubjectType = function(subject) {
        var type = 0;
        if(subject.indexOf("-EX") >= 0) {
            subject = subject.replace("-EX", "");
            type = 2;
        }
        else if(subject.indexOf("-LECT") >= 0) {
            subject = subject.replace(/-LECT[0-9]/g, "");
            type = 0;
        }
        else if(subject.indexOf("-DEMO") >= 0) {
            subject = subject.replace("-DEMO", "");
            type = 1;
        }
        return {type: type, subject: subject};
    }

    /**
     * Vykreslí sudý týden rozvrhu
     * @param {Schedule} schedule Rozvrh, kterého sudý týden má být vložen 
     */
    this.insertEvenWeek = function(schedule) {
        this.scheduleController.clear();
        var lastSubject = "";
        var lastClassroom = "";
        var lastTeacher = "";
        var times = [];
        for(var i = 0; i < schedule.hoursEven.length; ++i) {
            if(schedule.hoursEven[i] != null) {
                if(schedule.hoursEven[i].subjectName == lastSubject) times.push(i);
                else if(times.length > 0) {
                    var res = this.getSubjectType(lastSubject);
                    if(res.subject != "VOLNO") {
                        if(this.stickedSubjects.indexOf(lastSubject) >= 0)
                            this.scheduleController.insertSubjectAndStick(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                        else 
                            this.scheduleController.insertSubject(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                    }
                    times = [];
                    times.push(i);
                }
                else times.push(i);
                lastSubject = schedule.hoursEven[i].subjectName;
                lastTeacher = schedule.hoursEven[i].teacher;
                lastClassroom = schedule.hoursEven[i].room;
            } else if(times.length > 0) {
                var res = this.getSubjectType(lastSubject);
                if(res.subject != "VOLNO") {
                    if(this.stickedSubjects.indexOf(lastSubject) >= 0)
                        this.scheduleController.insertSubjectAndStick(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                    else this.scheduleController.insertSubject(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                }
                times = [];
                lastSubject = "";
                lastClassroom = "";
                lastTeacher = "";
            }
            else {
                lastSubject = "";
                lastClassroom = "";
                lastTeacher = "";
            }
        }
    }

    /**
     * Vykreslí lichý týden rozvrhu
     * @param {Schedule} schedule Rozvrh, kterého lichý týden má být vložen 
     */
    this.insertOddWeek = function(schedule) {
        this.scheduleController.clear();
        var lastSubject = "";
        var lastClassroom = "";
        var lastTeacher = "";
        var times = [];
        for(var i = 0; i < schedule.hoursOdd.length; ++i) {
            if(schedule.hoursOdd[i] != null) {
                if(schedule.hoursOdd[i].subjectName == lastSubject) times.push(i);
                else if(times.length > 0) {
                    var res = this.getSubjectType(lastSubject);
                    if(res.subject != "VOLNO") {
                        if(this.stickedSubjects.indexOf(lastSubject) >= 0)
                            this.scheduleController.insertSubjectAndStick(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                        else 
                            this.scheduleController.insertSubject(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                    }
                    times = [];
                    times.push(i);
                }
                else times.push(i);
                lastSubject = schedule.hoursOdd[i].subjectName;
                lastTeacher = schedule.hoursOdd[i].teacher;
                lastClassroom = schedule.hoursOdd[i].room;
            } else if(times.length > 0) {
                var res = this.getSubjectType(lastSubject);
                if(res.subject != "VOLNO") {
                    if(this.stickedSubjects.indexOf(lastSubject) >= 0)
                        this.scheduleController.insertSubjectAndStick(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                    else
                        this.scheduleController.insertSubject(times, res.subject, lastClassroom, lastTeacher, res.type, "id" + i, this.onSticked.bind(this));
                }
                times = [];
                lastSubject = "";
                lastClassroom = "";
                lastTeacher = "";
            }
            else {
                lastSubject = "";
                lastClassroom = "";
                lastTeacher = "";
            }
        }
    }

    /**
     * Provede eventHandler custom eventu onSticked = Přidá / odebere do LinkedListSubjects sticked termín
     * @param {Number} sticked Informace, zda se termín sticknul / unsticknul
     * @param {SubjectTime} subjectTime SubjectTime reprezentující termín, na kterém se provedl custom event onSticked 
     */
    this.onSticked = function(sticked, subjectTime) {
        if(this.schedules[this.insertedPosition].hoursEven.find((item) => item != null && item.subjectName == subjectTime.subjectName) != null) {
            if(this.schedules[this.insertedPosition].hoursOdd.find((item) => item != null && item.subjectName == subjectTime.subjectName) != null) {
                subjectTime.week = -1;
            } else {
                subjectTime.week = 0;
            }
        }
        else {
            subjectTime.week = 1;
        }
        if(sticked) {
            this.stickedSubjects.push(subjectTime.subjectName);
            this.linkedList.addSticked(subjectTime);
        } else {
            this.stickedSubjects.splice(this.stickedSubjects.indexOf(subjectTime.subjectName), 1);
            this.linkedList.removeSticked(subjectTime.subjectName);
            this.linkedList.reset();
            var subjectInfo = subjectTime.subjectName.split("-");
            if(subjectInfo[1].indexOf("LECT") >= 0)
                this.linkedList = this.appendLectureToList(this.linkedList, [subjectInfo[0]], subjectTime.endTime - subjectTime.startTime);
            else if(subjectInfo[1].indexOf("EX") >= 0)
                this.linkedList = this.appendExercisesToList(this.linkedList, [subjectInfo[0]]);
            else if(subjectInfo[1].indexOf("DEMO") >= 0)
                this.linkedList = this.appendDemosToList(this.linkedList, [subjectInfo[0]]);
        }
        this.firstIterate = true;
    }

    /** 
     * Provede iteraci vygenerovaných rozvrhů
     */
    this.iterate = function() {
        if(this.firstIterate) {
            if(this.linkedList == null) {
                this.userMessageController.messageAppend("Žádný rozvrh bez kolizí se ze zadaných předmětů nepodařilo vytvořit", 1);
                return;
            }
            this.linkedList.reset();
            this.generate([], false);
        } else this.generate([], false);
        this.firstIterate = false;
        this.lastAction = this.iterate;
    }

    /**
     * Vygeneruje určitý počet rozvrhů
     * @param {*[]} subjects Pole obsahující kódy generovaných předmětů, popřípadě volna jako integer 
     * @param {Number} reset Informace, zda se mají nové rozvrhy generovat od začátku, nebo se má pokračovat ve stávající konfiguraci LinkedListSujects 
     */
    this.generate = function(subjects, reset = true) {
        this.scheduleController.clear();
        if(this.lastAction == this.iterate && subjects.length > 0) reset = true;
        this.lastAction = this.generate.bind(this, [], false);
        if(reset) {
            this.stickedSubjects = [];
            this.linkedList = this.createLinkedList(subjects);
            this.linkedList.setMax(this.schedulesView.getMaxFromInput());
            this.insertedPosition = 0;
            this.schedules = [];
        }
        else {
            this.linkedList.maxIncrease(this.schedulesView.getMaxFromInput());
        }
        this.linkedList.createSchedule();

        this.schedules = this.linkedList.schedules;
        if(this.schedules.length == 0) {
            this.userMessageController.messageAppend("Žádný rozvrh bez kolizí se ze zadaných předmětů nepodařilo vytvořit", 1);
            return;
        }
        this.showEven();
        this.schedulesView.updateNumberHolder(this.insertedPosition);
    }

    /**
     * Spustí stáhnutí zobrazeného rozvrhu
     * @param {Element} clicledEL Element, kterým se spustilo stahování 
     */
    this.download = function(clicledEL) {
        var canvas = document.createElement("canvas");
        var element = this.scheduleController.scheduleView.desktop.dataContainer;
        element.style.display = "block";

        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;

        var toLoadImg = document.createElement("img");
        var a = document.createElement("a");
        var style = "<style>table.desktop {clear: both;border-collapse: collapse;}table.desktop tr:nth-of-type(1) td {border-left: 1px solid black;padding-top: 0px;font-size: 20px;box-sizing: content-box;max-height: 100%;}table.desktop td {width: 70px;padding-left: 2px;padding-right: 2px;margin: 0px;border-collapse: collapse;}table.desktop tr:nth-of-type(1) ,table.desktop tr td:nth-of-type(1),table.mobile td, div.mobile-content table tr  {background-color: lightblue;z-index: -20;}table.mobile tr:nth-of-type(n+3) td {border-top: 2px solid black;}div.mobile-content table td:nth-of-type(1) {border-left: 2px solid black;}table.desktop tr:nth-of-type(1) td:nth-of-type(1) {z-index: 10;border-bottom: 2px solid black;border-top: 1px solid black;}table.desktop tr td:nth-of-type(1) {width: 25px !important;border:none;border-right: 2px solid black;height: 100%;}table.desktop tr {border: 1px solid black;width: 100%;height: 70px;display: block;border-spacing: 0px;display:flex;align-items: center;vertical-align: middle;border-collapse: collapse;}table.desktop td.day {display:flex;align-items: center;font-size: 20px;font-weight: bold;}table.desktop td.day div {height: 30%;}.inserted-subject div{scrollbar-width: none; /* Firefox */-ms-overflow-style: none;  /* Internet Explorer 10+ */}.inserted-subject div::-webkit-scrollbar { display: none;  /* Safari and Chrome */</style>";
        toLoadImg.src = 'data:image/svg+xml,' + '<svg xmlns="http://www.w3.org/2000/svg" width="' + element.offsetWidth + '" height="' + element.offsetHeight + '"><foreignObject width="100%" height="100%">' + style + '<div xmlns="http://www.w3.org/1999/xhtml">' + element.outerHTML + '</div></foreignObject></svg>';
        
        a.download = "schedule";
        document.body.appendChild(a);
        toLoadImg.addEventListener("load", function(a, canvas) {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);
            a.href = canvas.toDataURL("image/png");
            a.click();
            a.remove();
            clicledEL.scrollIntoView();

        }.bind(toLoadImg, a, canvas))
        element.style.display = null;
    }
}
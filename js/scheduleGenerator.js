/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename scheduleGenerator.js
 * 
 */

/**
 * Dvousměrně vázaný list
 * @property {LinkedListItem} head Začátek dvousměrně vázaného seznamu
 * @property {LinkedListItem} tail Konec dvousměrně vázaného seznamu
 * @class
 */
function LinkedList() {
    this.head = null;
    this.tail = null;

    /**
     * Pomocná debuggovací funkce, která vypíše všechny prvky v seznamu
     */
    this.printAllItems = function() {
        var item = this.head;
        while(item != null) {
            console.log(item.subjectName);
            item = item.next;
        }
    }
}

/**
 * Vloží do dvousměrně vázaného seznamu nový prvek na konec
 * @param {LinkedListItem} item Item, který se má vložit, pokud je null tak se vytvoří nový item
 * @returns {LinkedListItem} Vrací vložený item
 */
LinkedList.prototype.addItem = function(item = null) {
    if(item == null) item = new LinkedListItem();
    if(this.head == null) {
        this.head = item;
        this.tail = item;
    }
    else {
        this.tail.next = item;
        item.previous = this.tail;
        this.tail = item;
    }
    return item;
}

/**
 * Objekt reprezentující zásobník
 * @property {[*]} stack Zásobník samotný
 * @class
 */
function Stack() {
    this.stack = [];
    
    /**
     * Vloží hodnotu na zásobník
     * @param {*} val Hodnota, která má být vložena na zásobník
     */
    this.push = function(val) {
        this.stack.push(val);
    }

    /**
     * Odebere hodnotu ze zásobníku
     * @returns Vrací odebranou hodnotu ze zásobníku
     */
    this.pop = function() {
        return this.stack.pop();
    }

    /**
     * Získá hodnotu na vrcholu zásobníku
     * @returns Vrací hodnotu na vrcholu zásobníku
     */
    this.top = function() {
        return this.stack[this.stack.length - 1];
    }

    /**
     * Zjistí, zda je zásobník prázdný
     * @returns Vrací true pokud je prázdný, jinak false
     */
    this.isEmpty = function() {
        if(this.stack.length == 0) return true;
        return false;
    }

    /**
     * Přepíše vrchol zásobníku hodnotou value
     * @param {*} value Hodnota, která má být nastavena 
     */
    this.setLast = function(value) {
        this.stack[this.stack.length - 1] = value;
    }
}

/**
 * Objekt obsahující strukturu předmětů (Dvousměrně vázaný list předmětů)
 * @property {Schedule[]} schedules Pole vygenerovaných rozvrhů
 * @property {Stack} stackSchedules Zásobník vygenerovaných rozvrhů
 * @property {Stack} stackItems Zásobník dvousměrně vázaných listů s předměty.
 * @property {Number} nOfSchedules Počet vygenerovaných rozvrhů
 * @property {Number} max Maximální počet rozvrhů, který se má generovat
 * @property {SubjectTime[]} stickedOdd Pole fixních termínů v rozvrhu v liché týdny (stále jsou na stejném místě)
 * @property {SubjectTime[]} stickedEven Pole fixních termínů v rozvrhu v sudé týdny (stále jsou na stejném místě)
 * @class
 */
function LinkedListSubjects(){
    LinkedList.call(this);

    this.schedules = [];

    this.stackSchedules = new Stack();
    this.stackItems = new Stack();

    this.nOfSchedules = 0;

    this.max = 1;

    this.stickedOdd = [];
    this.stickedEven = [];

    /**
     * Přidá do fixních termínů v rozvrhu v sudém týdnu termín
     * @param {SubjectTime} subjectTime termín, který má být vložen
     */
    this.addStickedEven = function(subjectTime) {
        this.stickedEven.push(subjectTime);
    }

    /**
     * Přidá do fixních termínů v rozvrhu v lichém týdnu termín
     * @param {SubjectTime} subjectTime termín, který má být vložen
     */
    this.addStickedOdd = function(subjectTime) {
        this.stickedOdd.push(subjectTime);
    }

    /**
     * Vyresetuje stav generátoru, ponechá pouze stejné fixní termíny
     */
    this.reset = function() {
        this.max = 1;
        this.nOfSchedules = 0;
        this.stackSchedules = new Stack();
        this.stackItems = new Stack();
        this.schedules = [];
        var el = this.head;
        while(el != null) {
            el.insertedVariant = 0;
            el.inSchedule = false;
            el = el.next;
        }

    }

    /**
     * Přidá do fixnutých termínů generátoru nový termín
     * @param {SubjectTime} subjectTime Termín, který má být vložen mezi fixnuté termíny 
     */
    this.addSticked = function(subjectTime) {
        var el = this.head;
        while(el != null) {
            if(el.subjectName == subjectTime.subjectName) {
                if(el.previous != null) el.previous.next = el.next;
                if(el.next != null) el.next.previous = el.previous;
                if(el == this.head) this.head = el.next;
                if(el == this.tail) this.tail = el.previous;
                el = null;
            }
            else el = el.next;
        }

        if(subjectTime.week == 0) this.addStickedEven(subjectTime);
        else if(subjectTime.week == 1) this.addStickedOdd(subjectTime);
        else {
            this.addStickedEven(subjectTime);
            this.addStickedOdd(subjectTime);
        }
    }

    /**
     * Odstraní termín z fixních termínů v generátoru z obou (lichého i sudého) týdnů
     * @param {String} subjectName Název předmětu, který má být odstraněn z fixních termínů generátoru 
     */
    this.removeSticked = function(subjectName) {
        this.stickedEven = this.stickedEven.filter((item) => item.subjectName != subjectName);
        this.stickedOdd = this.stickedOdd.filter((item) => item.subjectName != subjectName);
    }

    /**
     * Zjistí, zda ve vymezený čas je již čas zabraný termínem ze sticked rozvrhu v sudém týdnu
     * @param {Number} startTime Čas, od kterého termín začíná
     * @param {Number} endTime Čas, ve kterém termín končí
     * @returns Vrací true, pokud je čas již zabrán, jinak false
     */
    this.isStickedEven = function(startTime, endTime) {
        for(var i = 0; i < this.stickedEven.length; ++i) {
            if(!(endTime <= this.stickedEven[i].startTime || startTime >= this.stickedEven[i].endTime)) return true;
        }
        return false;
    }

    /**
     * Zjistí, zda ve vymezený čas je již čas zabraný termínem ze sticked rozvrhu v lichém týdnu
     * @param {Number} startTime Čas, od kterého termín začíná
     * @param {Number} endTime Čas, ve kterém termín končí
     * @returns Vrací true, pokud je čas již zabrán, jinak false
     */
    this.isStickedOdd = function(startTime, endTime) {
        for(var i = 0; i < this.stickedOdd.length; ++i) {
            if(!(endTime <= this.stickedOdd[i].startTime || startTime >= this.stickedOdd[i].endTime)) return true;
        }
        return false;
    }

    /**
     * Zjistí, zda ve vymezený čas je již čas zabraný termínem ze sticked rozvrhu v týdnu week
     * @param {Number} startTime Čas, od kterého termín začíná
     * @param {Number} endTime Čas, ve kterém termín končí
     * @param {Number} week Týden, pro který se termín kontroluje (-1 = oba, 0 = sudý, 1 = lichý)
     * @returns Vrací true, pokud je čas již zabrán, jinak false
     */
    this.isSticked = function(startTime, endTime, week) {
        if(week == 0) {
            return this.isStickedEven(startTime, endTime);
        } else if(week == 1) {
            return this.isStickedOdd(startTime, endTime);
        } else {
            return this.isStickedOdd(startTime, endTime) || this.isStickedEven(startTime, endTime);
        }
    }

    /**
     * Zvedne hodnotu maxima rozvrhů, které se generují
     * @param {Number} incVal Hodnota, o které se má maximum generovaných rozvrhů zvýšit 
     */
    this.maxIncrease = function(incVal) {
        this.max += incVal;
    }

    /**
     * Nastaví maximum generovaných rozvrhů
     * @param {Number} max Nové maximum generovaných rozvrhů 
     */
    this.setMax = function(max) {
        this.max = max;
    }

    /**
     * Vloží do rozvrhu termíny z objektu, které jsou fixní
     * @param {Schedule} schedule Rozvrh, do kterého se mají vložit termíny na fixních pozicích
     * @returns Vrací rozvrh vyplněný termíny, které objekt má na fixních pozicích
     */
    this.scheduleFillInWithSticked = function(schedule) {
        for(var i = 0; i < this.stickedEven.length; ++i) {
            schedule.fillInHours(this.stickedEven[i].startTime, this.stickedEven[i].endTime, this.stickedEven[i].subjectName, this.stickedEven[i].teacher,
                this.stickedEven[i].room, this.stickedEven[i].week);
        }
        for(var i = 0; i < this.stickedOdd.length; ++i) {
            schedule.fillInHours(this.stickedOdd[i].startTime, this.stickedOdd[i].endTime, this.stickedOdd[i].subjectName, this.stickedOdd[i].teacher,
                this.stickedOdd[i].room, this.stickedOdd[i].week);
        }
        return schedule;
    }

    /**
     * Vytvoří this.max počet vygenerovaných rozvrhů. Funkce si v objektu pamatuje aktuální stav, tudíž při vícenásobném volání pokračuje tam, kde skončila.
     */
    this.createSchedule = function() {
        if(this.head == null && (this.stickedEven.length == 0 && this.stickedOdd.length == 0)) return;

        //Inicializace
        if(this.nOfSchedules == 0) {
            var schedule = new Schedule();
            schedule = this.scheduleFillInWithSticked(schedule);
            if(this.head == null) {
                this.schedules.push(schedule);
                return;
            }
            this.stackSchedules.push(schedule);
            this.stackItems.push(this.head);
        }
        
        //Provádění
        while(!this.stackItems.isEmpty()) {
            if(this.nOfSchedules == this.max) break;
            var topSchedule = this.stackSchedules.top();
            var topItem = this.stackItems.top();

            if(topItem.insertedVariant == topItem.subjectTimes.length) {
                topItem.insertedVariant = 0;
                topItem.inSchedule = false;

                var schedule2 = new Schedule();
                topSchedule.copy(schedule2)
                schedule2.popLast();
                this.stackSchedules.setLast(schedule2);
                
                this.stackItems.pop();
                if(topItem.previous != null) this.stackItems.push(topItem.previous);
            }
            else {
                if(!this.isSticked(topItem.subjectTimes[topItem.insertedVariant].startTime, topItem.subjectTimes[topItem.insertedVariant].endTime,
                                    topItem.subjectTimes[topItem.insertedVariant].week)) {
                    if(!topSchedule.fillInHours(topItem.subjectTimes[topItem.insertedVariant].startTime, 
                                            topItem.subjectTimes[topItem.insertedVariant].endTime, topItem.subjectTimes[topItem.insertedVariant].subjectName,
                                            topItem.subjectTimes[topItem.insertedVariant].room, topItem.subjectTimes[topItem.insertedVariant].teacher, 
                                            topItem.subjectTimes[topItem.insertedVariant].week)) {
                                                    topItem.insertedVariant++;
                    } else {
                        this.stackItems.pop();

                        topItem.inSchedule = true;
                        topItem.insertedVariant++;
                        if(topItem.next == null) {
                            this.schedules.push(topSchedule);
 
                            var schedule2 = new Schedule();
                            topSchedule.copy(schedule2)
                            schedule2.popLast();
                            
                            this.nOfSchedules++;
                            this.stackSchedules.push(schedule2);

                            topItem.inSchedule = false;
                            this.stackItems.push(topItem);
                        }
                        else this.stackItems.push(topItem.next);    
                    }              
                }
                else {
                    topItem.insertedVariant++;
                }
            }
            
        }
    }

    /**
     * Vygeneruje všechny možné varianty rozvrhů
     * @deprecated
     */
    this.createScheduleRecursive = function() {
        if(this.head != null) {
            var schedule = new Schedule();
            this.head.addToScheduleRecursive(this.schedules, schedule);
        }
    }

}

/**
 * Vloží nový termín předmětu do obosměrně vázaného listu předmětů
 * @param {String} subjectName Název předmětu, pro který se vkládané termíny vztahují 
 * @param {SubjectTime[]} subjectTimes Časy termínů přednášek a cvičení pro daný předmět
 */
LinkedListSubjects.prototype.addItem = function(subjectName, subjectTimes) {
    var item = new LinkedListSubjectItem();
    LinkedList.prototype.addItem.call(this, item);
    item.subjectName = subjectName;
    item.subjectTimes = subjectTimes;
}

/**
 * Prvek dvousměrně vázaného seznamu
 * @property {LinkedListItem} next Následovník prvku v seznamu
 * @property {LinkedListItem} previous Předchůdce prvku v seznamu
 * @class
 */
function LinkedListItem() {
    this.next = null;
    this.previous = null;
}

/**
 * Prvek dvousměrně vázaného seznamu předmětů
 * @property {String} subjectName Název předmětu, který prvek seznamu reprezentuje
 * @property {SubjectTime[]} subjectTimes Všechny termíny přednášek a cvičení od předmětu, který prvek seznamu reprezentuje
 * @property {Number} inSchedule Informace, zda předmět je v aktuálně generovaném rozvrhu již obsazen
 * @property {Number} insertedVariant Číslo naposledy vložené varianty termínu do rozvrhu (Index do pole subjectTimes)
 * @class
 */
function LinkedListSubjectItem() {
    LinkedListItem.call(this);

    this.subjectName = "";
    this.subjectTimes = null;

    this.inSchedule = false;
    this.insertedVariant = 0;

    /**
     * Vygeneruje rozvrhy a vloží je do pole rozvrhů
     * @param {Schedule[]} schedules Pole rozvrhů, do kterého se vkládá každý hotový nový rozvrh
     * @param {Schedule} schedule Rozvrh, který se aktuálně generuje a do kterého se mají přidávat termíny
     * @deprecated
     */
    this.addToScheduleRecursive = function(schedules, schedule) {
        if(counter == max) return;
        if(this.insertedVariant == (this.subjectTimes.length)) {
            this.insertedVariant = 0;
            this.inSchedule = false;
            
            var schedule2 = new Schedule();
            schedule.copy(schedule2);
            schedule2.popLast();
            schedule = schedule2;

            if(this.previous == null) return;
            else this.previous.addToScheduleRecursive(schedules, schedule);
        }
        else {
            if(!schedule.fillInHours(this.subjectTimes[this.insertedVariant].startTime, this.subjectTimes[this.insertedVariant].endTime, this.subjectTimes[this.insertedVariant].subjectName)) {
                this.insertedVariant++;
                this.addToScheduleRecursive(schedules, schedule);
            }
            else {
                this.inSchedule = true;
                this.insertedVariant++;
                if(this.next == null) {
                    schedules.push(schedule);
                    var schedule2 = new Schedule();
                    schedule.copy(schedule2);
                    schedule2.popLast();
                    schedule = schedule2;
                    
                    counter++;

                    this.inSchedule = false;
                    this.addToScheduleRecursive(schedules, schedule);
                }
                else this.next.addToScheduleRecursive(schedules, schedule);
            }
        }
    }
}

/**
 * Objekt reprezentující termín předmětu
 * @param {Number[]} startTime Počáteční čas termínu
 * @param {Number[]} endTime Koncový čas termínu
 * @param {String} subjectName Kód předmětu termínu
 * @param {String} room Místnost termínu
 * @param {String} teacher Vyučující termínu
 * @param {Number} weeks -1 = sudé i liché, 0 = sudé, 1 = liché 
 * @class
 */
function SubjectTime(startTime, endTime, subjectName, room, teacher, week = -1) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.subjectName = subjectName;
    this.week = week;
    this.room = room;
    this.teacher = teacher;
}


/**
 * Objekt reprezentující jeden rozvrh
 * @property {Object[]} hoursOdd Pole reprezentující rozvrh v lichém týdnu
 * @property {Object[]} hoursEven Pole reprezentující rozvrh v sudém týdnu
 * @property {Number[]} addedOdd Pole fungující jako zásobník. Ukládají se indexy vložených termínů do sudého rozvrhu
 * @property {Number[]} addedEven Pole fungující jako zásobník. Ukládají se indexy vložených termínů do lichého rozvrhu
 * @property {Number[]} addedTo Pole fungující jako zásobník. Ukládá se informace pořadí, kdy se vkládalo do sudého rozvrhu, kdy do lichého, nebo kdy do obou naráz 
 * @class
 */
function Schedule() {
    this.hoursOdd = new Array(24 * 5);
    this.hoursEven = new Array(24 * 5);

    this.addedOdd = [];
    this.addedEven = [];
    this.addedTo = [];

    /**
     * Zjistí, zda v lichém rozvrhu je místo pro termín vymezený časem: <startHour, endHour)
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @returns Vrací true pokud je v rozvrhu místo v intervalu <startHour, endHour)
     */
    this.checkEmptyHoursOddWeek = function(startHour, endHour) {
        for(var i = startHour; i < endHour; ++i) {
            if(this.hoursOdd[i] != null) return false;
        }
        return true;
    }

    /**
     * Zjistí, zda v sudém rozvrhu je místo pro termín vymezený časem: <startHour, endHour)
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @returns Vrací true pokud je v rozvrhu místo v intervalu <startHour, endHour)
     */
    this.checkEmptyHoursEvenWeek = function(startHour, endHour) {
        for(var i = startHour; i < endHour; ++i) {
            if(this.hoursEven[i] != null) return false;
        }
        return true;
    }

    /**
     * 
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @param {Number} week Číslo reprezentující týdny, ve kterých se termín vyučuje (0 = sudý, 1 = lichý, jinak = oba týdny)
     * @returns Vrací true pokud je v rozvrhu místo v intervalu <startHour, endHour)
     */
    this.checkEmptyHours = function(startHour, endHour, week) {
        if(week == 0) return this.checkEmptyHoursEvenWeek(startHour, endHour);
        else if(week == 1) return this.checkEmptyHoursOddWeek(startHour, endHour);
        else {
            return this.checkEmptyHoursEvenWeek(startHour, endHour) && this.checkEmptyHoursOddWeek(startHour, endHour);
        }
    }

    /**
     * Zaplní hodiny v sudém rozvrhu v intervalu <startHour, endHour)
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @param {Strinng} subjectName Název předmětu, který se v termínu vyučuje
     * @param {String} teacher Vyučující termínu
     * @param {String} room Místnost, ve které se termín vyučuje
     */
    this.fillInHoursEvenWeek = function(startHour, endHour, subjectName, teacher, room) {
        var added = [];
        for(var i = startHour; i < endHour; ++i) {
            this.hoursEven[i] = {subjectName: subjectName, teacher: teacher, room: room};
            added.push(i);
        }
        this.addedEven.push(added);
    }

    /**
     * Zaplní hodiny v lichém rozvrhu v intervalu <startHour, endHour)
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @param {Strinng} subjectName Název předmětu, který se v termínu vyučuje
     * @param {String} teacher Vyučující termínu
     * @param {String} room Místnost, ve které se termín vyučuje
     */
    this.fillInHoursOddWeek = function(startHour, endHour, subjectName, teacher, room) {
        var added = [];
        for(var i = startHour; i < endHour; ++i) {
            this.hoursOdd[i] = {subjectName: subjectName, teacher: teacher, room: room};
            added.push(i);
        }
        this.addedOdd.push(added);
    }

    /**
     * Zaplní hodiny rozvrhu v intervalu <startHour, endHour)
     * @param {Number} startHour Číslo reprezentující čas, kdy začíná termín
     * @param {Number} endHour Číslo reprezentující čas, kdy končí termín
     * @param {Strinng} subjectName Název předmětu, který se v termínu vyučuje
     * @param {String} teacher Vyučující termínu
     * @param {String} room Místnost, ve které se termín vyučuje
     * @param {Number} week Číslo reprezentující týdny, ve kterých se termín vyučuje (0 = sudý, 1 = lichý, jinak = oba týdny)
     */
    this.fillInHours = function(startHour, endHour, subjectName, teacher, room, week) {
        if(!this.checkEmptyHours(startHour, endHour, week)) return 0;
        if(week == 0) {
            this.fillInHoursEvenWeek(startHour, endHour, subjectName, teacher, room);
        }
        else if(week == 1) {
            this.fillInHoursOddWeek(startHour, endHour, subjectName, teacher, room);
        }
        else {
            this.fillInHoursOddWeek(startHour, endHour, subjectName, teacher, room);
            this.fillInHoursEvenWeek(startHour, endHour, subjectName, teacher, room);
        }
        this.addedTo.push(week);
        return true;
    }

    /**
     * Zkopíruje tento objekt do jiného objektu
     * @param {Schedule} schedule Objekt, do kterého má být zkopírován tento objekt
     */
    this.copy = function(schedule) {
        for(var i = 0; i < this.hoursOdd.length; ++i) {
            if(this.hoursOdd[i] != null) {
                schedule.hoursOdd[i] = {subjectName: this.hoursOdd[i].subjectName, teacher: this.hoursOdd[i].teacher, room: this.hoursOdd[i].room};
            }
        }
        for(var i = 0; i < this.hoursEven.length; ++i) {
            if(this.hoursEven[i] != null) {
                schedule.hoursEven[i] = {subjectName: this.hoursEven[i].subjectName, teacher: this.hoursEven[i].teacher, room: this.hoursEven[i].room};
            }
        }
        for(var i = 0; i < this.addedTo.length; ++i) {
            if(schedule.addedTo.length < (i - 1)) schedule.addedTo.push(this.addedTo[i]);
            else schedule.addedTo[i] = this.addedTo[i];
        }
        for(var i = 0; i < this.addedEven.length; ++i) {
            if(schedule.addedEven.length < (i - 1)) schedule.addedEven.push(this.addedEven[i]);
            else schedule.addedEven[i] = this.addedEven[i];
        }
        for(var i = 0; i < this.addedTo.length; ++i) {
            if(schedule.addedOdd.length < (i - 1)) schedule.addedOdd.push(this.addedOdd[i]);
            else schedule.addedOdd[i] = this.addedOdd[i];
        }
    }

    /**
     * Odebere naposledy vložené termíny do sudého rozvrhu 
     */
    this.popEvenWeek = function() {
        var indices = this.addedEven.pop();
        if(indices == null) return;
        for(var i = 0; i < indices.length; ++i) {
            this.hoursEven[indices[i]] = null;
        }
    }

    /**
     * Odebere naposledy vložené termíny do lichého rozvrhu 
     */
    this.popOddWeek = function() {
        var indices = this.addedOdd.pop();
        if(indices == null) return;
        for(var i = 0; i < indices.length; ++i) {
            this.hoursOdd[indices[i]] = null;
        }
    }

    /**
     * Odebere naposledy vložené termíny
     */
    this.popLast = function() {
        var popFrom = this.addedTo.pop();
        if(popFrom == 0) this.popEvenWeek(); 
        else if(popFrom == 1) this.popOddWeek();
        else {
            this.popOddWeek();
            this.popEvenWeek();
        }
    }
}


function Schedules() {

}



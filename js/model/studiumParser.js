/**
 * @author Matěj Žalmánek (xzalma00)
 * @filename studiumParser.js
 * 
 */

/**
 * Parsuje .json soubor s informacemi o předmětech. Reprezentuje model aplikace.
 * @property {Number} parsed Informace, zda parser stihl data zparsovat
 * @property {Object} studiums Zparsované data se seznamem studií
 * @property {Object} subjects Zparsované data se seznamem předmětů
 * @class
 */
function StudiumParser() {
    this.studiums = "../../data/studiums.json";
    this.subjects = "../../data/subjects.json"
    this.parsed = false;

    /**
     * Parsne soubor do js objektů
     */
    $.get(this.studiums, function(data) {
        console.log(this.studiums);
        this.studiums = Object.assign({}, data);
    }.bind(this));

    /**
     * Parsne soubor do js objektů
     */
    $.get(this.subjects, function(data) {
        this.subjects = Object.assign({}, data);
        this.parsed = true;
    }.bind(this));

    /**
     * Získá list všech studií na fakultě
     * @returns Vrací list kódů všech studií na fakultě
     */
    this.getAllStudiums = function() {
        var toReturn = [];
        var studiums = this.studiums.studiums;
        for(var i = 0; i < studiums.length; ++i) {
            toReturn.push(studiums[i].studium.name);
        }
        return toReturn;
    }

    /**
     * Získá všechny zaměření studia
     * @param {String} studiumName Název studia, pro které se mají získat zaměření
     * @returns Vrací list názvů zaměření studia
     */
    this.getAllStudiumFocuses = function(studiumName) {
        var studium = this.studiums.studiums.find((studium) => studium.studium.name == studiumName);
        return studium.studium.studiumFocuses;
    }

    /**
     * Získá typ studia = bakalářské, magisterské, doktorské (pro účely délky studia)
     * @param {String} studiumName Název studia, pro které se má zjistit typ
     * @returns Vrací číslo reprezentující daný typ: {0 = bakalářské, 1 = magisterské, 2 = doktorské}
     */
    this.getStudiumType = function(studiumName) {
        var studium = this.studiums.studiums.find((studium) => studium.studium.name === studiumName);
        return studium.studium.type;
    }

    /**
     * Získá počet let ve studiu
     * @param {String} studiumName Název studia, pro které se má zjistit počet let
     * @returns Vrací list řetězců, kde každý řetězec reprezentuje rok, podle kterého lze vyhledávat v datech podle ročníku
     */
    this.getYears = function(studiumName) {
        var type = this.getStudiumType(studiumName);
        var years = [];
        years.push("1. ročník");
        years.push("2. ročník");
        if(type == 0) years.push("3. ročník");
        else if(type == 2) {
            years.push("3. ročník");
            years.push("4. ročník");
        }
        return years;
    }
 
    /**
     * Získá všechny předměty ve všech studiích na fakultě
     * @returns Vrací list kódů předmětů
     */
    this.getAllSubjects = function() {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        for(var i = 0; i < subjects.length; ++i) {
            toReturn.push(subjects[i].subject.code);
        }
        return toReturn;
    }

    /**
     * Získá všechny předměty ve studiu
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu předmětů, které jsou ve studiu
     */
    this.getAllSubjectsAtStudium = function(studiumName, studiumFocus = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(studiumFocus === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code)) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code)) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && 
                   studium.studiumFocuses.find((focus) => focus == studiumFocus) != null) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    /**
     * Získá všechny předměty ve studiu omezené ročníkem studia
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} year String reprezentující ročník studia, pro který se získávají předměty. ("x. ročník", x = {1,2,3,4})
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu předmětů, které jsou ve studiu v daném ročníku
     */
    this.getAllSubjectsAtStudiumYear = function(studiumName, year, studiumFocus = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(studiumFocus === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code)) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName &&
                   (studium.year == year || studium.year == "libovolný ročník")) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code)) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && 
                    (studium.year == year || studium.year == "libovolný ročník") &&
                    studium.studiumFocuses.find((focus) => focus == studiumFocus) != null) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    /**
     * Získá všechny předměty ve studiu omezené ročníkem studia a semestrem
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} year String reprezentující ročník studia, pro který se získávají předměty. ("x. ročník", x = {1,2,3,4})
     * @param {Number} semester Informace, zda se mají zjistit předměty pro zimní / letní semestr (0 / 1)
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu předmětů, které jsou ve studiu v daném ročníku a navíc omezené semestrem
     */
    this.getAllSubjectsAtStudiumSemester = function(studiumName, year, semester, studiumFocus = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(studiumFocus === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName &&
                   (studium.year == year || studium.year == "libovolný ročník")) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && 
                    (studium.year == year || studium.year == "libovolný ročník") &&
                    studium.studiumFocuses.find((focus) => focus == studiumFocus) != null) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    /**
     * Získá všechny povinné předměty pro vybraný semestr v oboru a ročníku
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} year String reprezentující ročník studia, pro který se získávají předměty. ("x. ročník", x = {1,2,3,4})
     * @param {Number} semester Informace, zda se mají zjistit předměty pro zimní / letní semestr (0 / 1)
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu povinných předmětů, které jsou ve studiu v daném ročníku a navíc omezené semestrem
     */
    this.getAllObligatorySubjects = function(studiumName, year, semester, studiumFocus = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(studiumFocus === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && studium.obligatory == 0 &&
                   (studium.year == year || studium.year == "libovolný ročník")) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && 
                    (studium.year == year || studium.year == "libovolný ročník") && studium.obligatory == 0 &&
                    (studium.studiumFocuses.find((focus) => focus == studiumFocus) != null)) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    /**
     * Získá všechny volitelné předměty pro vybraný semestr v oboru a ročníku
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} year String reprezentující ročník studia, pro který se získávají předměty. ("x. ročník", x = {1,2,3,4})
     * @param {Number} semester Informace, zda se mají zjistit předměty pro zimní / letní semestr (0 / 1)
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu volitelných předmětů, které jsou ve studiu v daném ročníku a navíc omezené semestrem
     */
    this.getAllOptionalSubjects = function(studiumName, semester = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(semester === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code)) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && studium.obligatory == 1) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        } else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && studium.obligatory == 1) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    /**
     * Získá všechny povinně volitelné předměty pro vybraný semestr v oboru a ročníku
     * @param {String} studiumName Název studia, pro které se mají získat předměty
     * @param {String} year String reprezentující ročník studia, pro který se získávají předměty. ("x. ročník", x = {1,2,3,4})
     * @param {Number} semester Informace, zda se mají zjistit předměty pro zimní / letní semestr (0 / 1)
     * @param {String} studiumFocus Název zaměření studia, pro které se mají získat předměty, nepovinný parametr
     * @returns Vrací list kódu povinně volitelných předmětů, které jsou ve studiu v daném ročníku a navíc omezené semestrem
     */ 
    this.getAllObligatoryOptionalSubjects = function(studiumName, year, semester, studiumFocus = "") {
        var toReturn = [];
        var subjects = this.subjects.subjects;
        if(studiumFocus === "") {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && studium.obligatory != 0 && studium.obligatory != 1 &&
                   (studium.year == year || studium.year == "libovolný ročník")) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        else {
            for(var i = 0; i < subjects.length; ++i) {
                if((toReturn.length > 0 && toReturn[toReturn.length - 1] == subjects[i].subject.code) || subjects[i].subject.semester != semester) continue; //Toto si můžu dovolit, protože předměty jsou v datech seřazené a pokud se rovnají
                                                                                                //Dva názvy předmětů (pro letní i zimní semestr), stačí vypsat jeden
                if(subjects[i].subject.studiums.find((studium) => studium.studiumName == studiumName && 
                    (studium.year == year || studium.year == "libovolný ročník") && studium.obligatory != 0 && studium.obligatory != 1 &&
                    studium.studiumFocuses.find((focus) => focus == studiumFocus) != null) != null) 
                    toReturn.push(subjects[i].subject.code);
            }
        }
        return toReturn;
    }

    this.getInfoAboutSubject = function(subjectName) {
        var toReturn = [];
        var studiums = this.subjects.subjects.find((subject) => subject.subject.code === subjectName).subject.studiums;
        for(var i = 0; i < studiums.length; ++i) {
            var studiumType = this.getStudiumType(studiums[i].studiumName);
            toReturn.push({studium: studiumType, year: studiums[i].year});
        }
        return toReturn;
    }

    this.getSemesterOfSubject = function(subjectName) {
        var toReturn = [];
        var subjects = this.subjects.subjects.filter((subject) => subject.subject.code == subjectName);
        for(var i = 0; i < subjects.length; ++i) {
            toReturn.push(subjects[i].subject.semester);
        }
        return toReturn;
    }

    /**
     * Získá všechny termíny předmětu
     * @param {String} subjectName Název předmětu, pro který se mají získat všechny termíny
     * @param {Number} semester Informace, zda se jedná o předmět v zimním nebo letním semestru (0|1)
     * @returns Vrací list termínů. tento list má strukturu stejnou jako termíny v datech.
     */
    this.getTermsOfSubject = function(subjectName, semester) {
        return this.subjects.subjects.find((subject) => subject.subject.code == subjectName && subject.subject.semester == semester).subject.terms;
    }

    /**
     * Získá všechny termíny přednášek předmětu
     * @param {String} subjectName Název předmětu, pro který se mají získat termíny přednášek
     * @param {String} semester Informace, zda se jedná o předmět v zimním nebo letním semestru (0|1)
     * @returns Vrací list termínů přednášek. tento list má strukturu stejnou jako termíny v datech.
     */
    this.getLecturesOfSubject = function(subjectName, semester) {
        return this.subjects.subjects.find((subject) => subject.subject.code == subjectName && subject.subject.semester == semester).subject.terms.filter((term) =>
            term.type == "přednáška");
    }

    /**
     * Získá všechny termíny democvičení předmětu
     * @param {String} subjectName Název předmětu, pro který se mají získat termíny democvičení
     * @param {String} semester Informace, zda se jedná o předmět v zimním nebo letním semestru (0|1)
     * @returns Vrací list termínů democvičení. tento list má strukturu stejnou jako termíny v datech.
     */
    this.getDemosOfSubject = function(subjectName, semester) {
        return this.subjects.subjects.find((subject) => subject.subject.code == subjectName && subject.subject.semester == semester).subject.terms.filter((term) =>
            term.type == "cvičení");
    }

    /**
     * Získá všechny termíny cvičení předmětu
     * @param {String} subjectName Název předmětu, pro který se mají získat termíny cvičení
     * @param {String} semester  Informace, zda se jedná o předmět v zimním nebo letním semestru (0|1)
     * @returns Vrací list cvičení. tento list má strukturu stejnou jako termíny v datech.
     */
    this.getExercisesOfSubject = function(subjectName, semester) {
        return this.subjects.subjects.find((subject) => subject.subject.code == subjectName && subject.subject.semester == semester).subject.terms.filter((term) =>
            term.type == "poč. lab");
    }
}

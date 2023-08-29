/**
 * @author Matěj Žalmánek (xzalma00), Igar Sauchanka (xsauch00)
 * @filename view.js 
 */

/**
 * Objekt reprezentující View aplikace
 * @property {View.SemesterSelect} semesterSelect View vykreslující výběr semestru
 * @property {View.TextAdviser} textAdviser View vykreslující napovídání u výběru předmětu
 * @property {View.FreeTime} freeTime View vykreslující tabulku pro výběr volna
 * @property {View.InsertedSubjects} insertedSubjects View vykreslující vložené předměty
 * @property {View.Schedule} schedule View vykreslující rozvrh
 * @property {View.Schedules} schedules View vykreslující informace o rozvrzích
 * @property {View.UserMessage} userMessage View vykreslující informační hlášky o stavu akcí aplikace
 * @property {View.Help} help View vykreslující nápovědu
 * @class
 */
function View() {
    this.semesterSelect = new this.SemesterSelect();
    this.textAdviser = new this.TextAdviser();
    this.textAdviser2 = new this.TextAdviser();
    this.freeTime = new this.FreeTime();
    this.insertedSubjects = new this.InsertedSubjects();
    this.schedule = new this.Schedule();
    this.schedules = new this.Schedules();
    this.userMessage = new this.UserMessage();
    this.help = new this.Help();
}

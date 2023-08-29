/**
 * @author Matěj Žalmánek (xzalma00), Igar Sauchanka (xsauch00)
 * @filename controller.js
 */
/**
 * Objekt reprezentující controller aplikace
 * @property {StudiumParser} sp Objekt pro práci s modelem (daty)
 * @property {Controller.SemesterSelect} semesterSelect Controller starající se o výběr aktuálního semestru
 * @property {Controller.TextAdviser} textAdviser Controller starající se o napovídání ve výběru předmětu
 * @property {Controller.FreeTime} freeTime Controller starající se o výběr volna
 * @property {Controller.InsertedSubjects} insertedSubjects Controller získávající informace o předmětech, které chce uživatel v rozvrhu
 * @property {Controller.Schedule} schedule Controller starající se o práci s jedním rozvrhem (vykreslování)
 * @property {Controller.Schedules} schedules Controller starající se o práci s rozvrhy (operace s více rozvrhy)
 * @property {Controller.UserMessage} userMessage Controller starající se o vyskakovací hlášky o úspěšnosti akcí
 * @class
 */
function Controller () {
    this.sp = new StudiumParser();
    this.semesterSelect = new this.SemesterSelect(this.sp);
    this.textAdviser = new this.TextAdviser(this.sp);
    this.textAdviserOptionalObligatory = new this.TextAdviserOptionalObligatory(this.sp);
    this.freeTime = new this.FreeTime();
    this.insertedSubjects = new this.InsertedSubjects(this.sp);
    this.schedule = new this.Schedule();
    this.schedules = new this.Schedules(this.sp);
    this.userMessage = new this.UserMessage();

    this.semesterSelect.initInsertedSubjectsController(this.insertedSubjects);
    this.semesterSelect.initUserMessageController(this.userMessage);
    this.semesterSelect.initTextAdviserController(this.textAdviser);
    this.semesterSelect.initTextAdviserOptionalObligatoryController(this.textAdviserOptionalObligatory);
    this.textAdviser.initInsertedSubjectsController(this.insertedSubjects);
    this.textAdviserOptionalObligatory.initInsertedSubjectsController(this.insertedSubjects);
    this.textAdviser.initUserMessageController(this.userMessage);
    this.textAdviserOptionalObligatory.initUserMessageController(this.userMessage);
    this.freeTime.initInsertedSubjectsController(this.insertedSubjects);
    this.freeTime.initUserMessageController(this.userMessage);
    this.insertedSubjects.initFreeTimeController(this.freeTime);
    this.insertedSubjects.initSchedulesController(this.schedules);
    this.insertedSubjects.initUserMessageController(this.userMessage);
    this.schedules.initScheduleController(this.schedule);
    this.schedules.initUserMessageController(this.userMessage);
}
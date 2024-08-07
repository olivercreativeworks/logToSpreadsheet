/**
 * @typedef Log
 * @property {(messages: LogMessage[]) => void} append
 */

/** @type {Log} */
class SpreadsheetLog{
  /** 
   * @private 
   * @param {SpreadsheetApp.Sheet} logSheet
   */
  constructor(logSheet){
    /** @private */
    this.logSheet = logSheet
    /** @private */
    this.lockManager = getLockManager()
  }

  /** 
   * Returns a spreadsheet log that you can write messages to. Use the append method to add messages to the log. The log uses a **script lock to manage concurrent writes to the spreadsheet**.
   * @param {SpreadsheetApp.Sheet} logSheet
   * @return {Log}
   */
  static makeLog(logSheet){
    SpreadsheetLog.registerLogSheet(logSheet)
    return new SpreadsheetLog(logSheet)
  }

  /** 
   * @private
   * @param {SpreadsheetApp.Sheet} logSheet
   */
  static registerLogSheet(logSheet){
    /** @type {Settings} */
    const settings = {
      sheetId:logSheet.getSheetId(),
      spreadsheetId:logSheet.getParent().getId()
    }
    PropertiesService.getScriptProperties().setProperties(settings)
  }

  /** 
   * @typedef Settings
   * @prop {string} sheetId
   * @prop {string} spreadsheetId
   */

  /** 
   * Uses a script lock to write messages to the spreadsheet log. If the lock times out, messages will be added to the pending message queue instead. 
   * 
   * **Uses a script lock to manage concurrent writes**
   * @param {LogMessage[]} 
   */
  append(messages){
    if(!SpreadsheetLog.messagesAreValid(messages)) {
      return console.warn(`Messages are invalid. Messages must be an array of string tuples: [string, string][].\n Please correct your messages:\n${JSON.stringify(messages)}`)
    }
    this.lockManager.handleScriptLock( 
      () => this.appendToLog(messages), 
      () => this.addToPendingMessageQueue(messages),
    )
  }

  /**
   * @private
   * @param {unknown} messages
   * @return {messages is LogMessage[]}
   */
  static messagesAreValid(messages){
    return messages && 
      Array.isArray(messages) && 
      messages.length > 0 && 
      messages.every(entry => Array.isArray(entry) && entry.length === 2)
  }

  /**
   * @private 
   * @param {LogMessage[]} messages 
   */
  appendToLog(messages){
    console.log('Attempting to append to log')
    this.logSheet.getRange(this.logSheet.getLastRow() + 1, 1, messages.length, 2)
      .setValues(messages)
  }

  /** 
   * @private
   * @param {LogMessage[]} messages 
   */
  addToPendingMessageQueue(messages){
    console.log('Saving messages to pending message queue')
    SpreadsheetLog.pendingMessageQueue.addMessages(messages)
    SpreadsheetLog.scheduler.scheduleJob({jobName:`${SpreadsheetLog.name}.${SpreadsheetLog.appendPendingMessages.name}`, minutesFromNow:1})
  }

  /**
   * @private
   */
  static get pendingMessageQueue(){
    return getPendingMessagesQueue()
  }

  /**
   * @private
   */
  static get scheduler(){
    return getJobScheduler()
  }

  /**
   * Appends messages from the pending message onto the spreadsheet log saved in the properties service of this script.
   * @param {object} e Clock trigger event object
   * @param {string} e.triggerUid The unique id for the trigger
   */
  static appendPendingMessages({triggerUid}){
    SpreadsheetLog.scheduler.deleteScheduledJob(triggerUid)
    SpreadsheetLog.getRegisteredLog().append(SpreadsheetLog.pendingMessageQueue.getMessagesOut())
  }

  /**
   * @private
   */
  static getRegisteredLog(){
    /** @type {Settings} */
    const props = PropertiesService.getScriptProperties().getProperties()
    const logSheet =  SpreadsheetApp.openById(props.spreadsheetId)
      .getSheets()
      .filter(sheet => sheet.getSheetId() == props.sheetId)[0] // use loose equality so you get a match when the sheetId is 0.
    return new SpreadsheetLog(logSheet)
  }
}

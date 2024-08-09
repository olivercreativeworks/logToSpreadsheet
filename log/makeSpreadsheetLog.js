/**
 * @typedef Log
 * @property {(messages: LogMessage[]) => void} append
 */

/** @type {Log} */
class SpreadsheetLog_{
  /** 
   * @private 
   * @param {SpreadsheetApp.Sheet} logSheet
   * @param {LockService.Lock} userProvidedLock
   * @param {string} processPendingMessagesFnName
   */
  constructor(logSheet, userProvidedLock, processPendingMessagesFnName){
    /** @private */
    this.logSheet = logSheet
    /** @private */
    this.processPendingMessageFnName = processPendingMessagesFnName
    /** @private */
    this.userProvidedLock = userProvidedLock
    /** private */
    this.uniqueId = SpreadsheetLog_.createUniqueId(logSheet)
  }

  /** 
   * Returns a spreadsheet log that you can write messages to. Use the append method to add messages to the log. The log uses a **script lock to manage concurrent writes to the spreadsheet**.
   * @param {SpreadsheetApp.Sheet} logSheet
   * @return {Log}
   */
  static makeSpreadsheetLog(logSheet){
    SpreadsheetLog_.registerLogSheet(logSheet)
    return new SpreadsheetLog_(logSheet)
  }

  /** 
   * @private
   * @param {SpreadsheetApp.Sheet} logSheet
   * @param {LockService.Lock} userProvidedLock
   * @param {string} processPendingMessagesFnName
   * @return {Log}
   */
  static makeLog(logSheet, userProvidedLock, processPendingMessagesFnName){
    return new SpreadsheetLog_(logSheet, userProvidedLock, processPendingMessagesFnName)
  }

  /** 
   * Uses a script lock to write messages to the spreadsheet log. If the lock times out, messages will be added to the pending message queue instead. 
   * 
   * **Uses a script lock to manage concurrent writes**
   * @param {LogMessage[]} 
   */
  append(messages){
    if(!SpreadsheetLog_.messagesAreValid(messages)) {
      return console.warn(`Messages are invalid. Messages must be an array of string tuples: [string, string][].\n Please correct your messages:\n${JSON.stringify(messages)}`)
    }
    SpreadsheetLog_.lockManager.handleUserProvidedLock(
      this.userProvidedLock,
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
    SpreadsheetLog_.lockManager.handleUserLock( () => {
      console.log('Saving messages to pending message queue')
      SpreadsheetLog_.pendingMessageQueue.addMessages(messages, this.uniqueId)
      SpreadsheetLog_.scheduler.scheduleJob({jobName:this.processPendingMessageFnName, minutesFromNow:1})
    })
  }

  /**
   * @private
   */
  static get pendingMessageQueue(){
    return getPendingMessagesQueue_()
  }

  /**
   * @private
   */
  static get scheduler(){
    return getJobScheduler_()
  }

  /**
   * @private
   */
  static get lockManager(){
    return getLockManager_()
  }

  /**
   * Appends messages from the pending message onto the spreadsheet log saved in the properties service of this script.
   * @param {object} e Clock trigger event object
   * @param {string} e.triggerUid The unique id for the trigger
   */
  static appendPendingMessages({triggerUid}, logSheet, userProvidedLock, processPendingMessages){
    SpreadsheetLog_.scheduler.deleteScheduledJob(triggerUid)
    SpreadsheetLog_.makeLog(logSheet, userProvidedLock, processPendingMessages)
      .append(SpreadsheetLog_.getPendingMessages(logSheet))
  }

  /** @param {SpreadsheetApp.Sheet} forLogSheet */
  static getPendingMessages(forLogSheet){
    return SpreadsheetLog_.lockManager.handleUserLock(() => {
      return SpreadsheetLog_.pendingMessageQueue.getMessagesOut(SpreadsheetLog_.createUniqueId(forLogSheet))
    })
  }
}

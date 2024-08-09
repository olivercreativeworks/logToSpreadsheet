const stagingArea = getStagingArea_()

/** 
 * You can write any number of messages to the log before calling commit.
 * 
 * Messages are formatted to include a timestamp and a message so when you write them to the spreadsheet one column will contain a timestamp and the other a message: [timestamp, message]
 * 
 * #### Write to the log
 * ```
 * const logger = SpreadsheetLogger
 * // collect some messages to be appended to the log later
 * logger.write('Hello world')
 * logger.write('It is a good day!')
 * logger.write('Bye bye!')
 * ``` 
 * 
 * #### Commit to the log (3 steps)
 * ``` 
 * // 1) define the log sheet and lock
 * const log = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
 * const lock = LockService.getScriptLock()
 * 
 * // 2) define a function to write pending messages to the log on a clock trigger
 * function logPendingMessages(e){
 *    SpreadsheetLogger.writePendingMessagesToLog(e, log, lock, logPendingMessages.name)
 * }
 * 
 * // 3) call commit to actually append the messages to the log
 * logger.commitToLog(log, lock, logPendingMessages.name) 
 * ``` 
 * @param {string} message 
 */
function write(message){
  stagingArea.stageMessage(message)
}
/** 
 * Call this after writing some messages. 
 * 
 * This method will write as many pending messages as possible to the log and set up a trigger to write additional messages if need be.
 * 
 * #### Commit to the log (3 steps)
 * ``` 
 * // 1) define the log sheet and lock
 * const log = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
 * const lock = LockService.getScriptLock()
 * 
 * // 2) define a function to write pending messages to the log on a clock trigger
 * function logPendingMessages(e){
 *    SpreadsheetLogger.writePendingMessagesToLog(e, log, lock, logPendingMessages.name)
 * }
 * 
 * // 3) call commit to actually append the messages to the log
 * logger.commitToLog(log, lock, logPendingMessages.name) 
 * ``` 
 * 
 * @param {SpreadsheetApp.Sheet} logSheet The first column of the log sheet should be for timestamps, the second column is for a message. The written timestamps and messages will be appended to the end of the sheet. 
 * @param {LockService.Lock} userProvidedLock
 * @param {string} processPendingMessages The name of the function that will be responsible for appending pending messages to the log. This function should call the method writePendingMessagesToLog and pass in the clock event trigger. See the writePendingMessagesToLog method for more details.
 */
function commitToLog(logSheet, userProvidedLock, processPendingMessages){
  SpreadsheetLog_.makeLog(logSheet, userProvidedLock, processPendingMessages)
    .append(stagingArea.getMessagesOut())
}

/**
 * Appends messages from the pending message queue onto the spreadsheet log. To get pending messages, pass in the same sheet you used in the commitToLog function.
 * 
 * This method will write as many pending messages as possible to the log and set up a trigger to write additional messages if need be.
 * 
 * #### Commit to the log (3 steps)
 * ``` 
 * // 1) define the log sheet and lock
 * const log = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
 * const lock = LockService.getScriptLock()
 * 
 * // 2) define a function to write pending messages to the log on a clock trigger
 * function logPendingMessages(e){
 *    SpreadsheetLogger.writePendingMessagesToLog(e, log, lock, logPendingMessages.name)
 * }
 * 
 * // 3) call commit to actually append the messages to the log
 * logger.commitToLog(log, lock, logPendingMessages.name) 
 * ``` 
 * 
 * @param {object} e Clock trigger event object
 * @param {string} e.triggerUid The unique id for the trigger
 * @param {SpreadsheetApp.Sheet} logSheet Should match the sheet you used in commitToLog. Pending messages will be appended to the end of the sheet. 
 * @param {LockService.Lock} userProvidedLock A lock that will be used to prevent concurrent writes to the sheet.
 * @param {string} processPendingMessages The name of the function that will be responsible for appending pending messages to the log. The function should call this method inside it's body.
 */
function writePendingMessagesToLog(e, logSheet, userProvidedLock, processPendingMessages){
  SpreadsheetLog_.appendPendingMessages(e, logSheet, userProvidedLock, processPendingMessages)
}
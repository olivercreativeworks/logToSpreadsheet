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
 * 
 * #### Commit to the log
 * // call commit to actually append the messages to the log
 * const logSheet = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
 * logger.commitToLog(logSheet) 
 * ``` 
 * @param {string} message 
 */
function write(message){
  stagingArea.stageMessage(message)
}
/** 
 * Call this after writing some messages
 * @param {SpreadsheetApp.Sheet} logSheet The first column of the log sheet should be for timestamps, the second column is for a message. The written timestamps and messages will be appended to the end of the sheet. 
 * @param {LockService.Lock} userProvidedLock
 * @param {string} processPendingMessages The name of the function that will be responsible for appending pending messages to the log. The function should call this method inside it's body.
 */
function writePendingMessagesToLog(e, logSheet, userProvidedLock, processPendingMessages){
  SpreadsheetLog_.appendPendingMessages(e, logSheet, userProvidedLock, processPendingMessages)
}
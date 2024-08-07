/**
 * This method creates a wrapper around the provided log to allow for more efficient writes. The method writes messages to a local staging area via the write method and appends those messages to the provided log via the commit method.
 * 
 * Messages are formatted to include a timestamp and a message: [[timestamp, message]]
 * 
 * #### Write to the log
 * ```
 * const logger = createLogger()
 * // collect some messages to be appended to the log later
 * logger.write('Hello world')
 * logger.write('It is a good day!')
 * logger.write('Bye bye!')
 * // call commit to actually append the messages to the log
 * const logSheet = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
 * logger.commit() 
 * ``` 
 */
function createLogger(){
  const stagingArea = getStagingArea_()
  return {
    write: write,
    commit: commitToLog,
  }

  /** 
   * The first method you should call after creating the logger. You can write any number of messages to the log before calling commit.
   * @param {string} message 
   */
  function write(message){
    stagingArea.stageMessage(message)
  }
  /** 
   * Call this after writing some messages to the staging area 
   * @param {SpreadsheetApp.Sheet} logSheet The first column of the log sheet should be for timestamps, the second column is for a message.
   * @param {LockService.Lock} lock A script lock that will be used to manager concurrent writes to the sheet.
   */
  function commitToLog(logSheet, lock){
    SpreadsheetLog_.makeSpreadsheetLog(logSheet, lock).append(stagingArea.getMessagesOut())
  }
}
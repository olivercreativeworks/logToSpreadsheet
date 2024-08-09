const stagingArea = getStagingArea_()
/** 
 * ## Documentation
  * This method is just for documentation purposes. It is not meant to be called.
  *
  * ### Description
    * This script handles writing concurrent messages to a spreadsheet log.
  * 
  * ### Library ID
    * ```1xrEKwx-IPIUccpVeUXA1fy7anoRzfGgqfWIv2aPtVyHbcUOUjeKUnzW2```
  * 
  * ### Purpose
    * This script was made to log messages from code ran during doPost, since messages written via console.log and Logger.log do not show up in the execution log when logged from a doPost call.
  * 
  * ### Usage
    * #### Write messages to memory
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
      * // 1) Define the log sheet and lock.
      * const log = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
      * const lock = LockService.getScriptLock()
      * 
      * // 2) Define a function in the global scope to commit any pending messages to the log
      * function logPendingMessages(e){
      *    SpreadsheetLogger.commitPendingMessagesToLog(e, log, lock, logPendingMessages.name)
      * }
      * 
      * // 3) Call commit to actually append the written messages to the log. 
      * // Any messages that are unable to be written will become pending and scheduled to be written later.
      * logger.commitToLog(log, lock, logPendingMessages.name) 
      * ``` 
  * 
  * ### About
    * #### Appending to the log sheet
      * This script appends timestamped messages to your log sheet. Your log sheet should have two columns: 
      * 1) Column A is where timestamps will go. The timestamps represent the time the message was written into memory using the ```write``` method. 
      * 2) Column B is where your logged message goes.
      * 
    * #### Handling concurrency
      * The script uses a lock to help prevent race conditions when writing to your log. 
      * 
      * If the lock times out and an instance of your script is unable to write messages to the log, those messages will be stored in this library's properties service as 'pending messages'.
      *
    * #### Handling pending messages
      * Any messages that are unable to be written to the log due to the lock timing out will be stored in this library as 'pending messages'.
      *
      * ***You are expected to implement a function in the global scope of your script that will handle clearing out these pending messages and writing them to your log**. (See the usage section above for an example of how to do this.)
      *
      * The name of your global function should be passed as an argument to this script's ```commitToLog``` and ```commitPendingMessagesToLog``` methods. 
      *
      * This script will handle creating and removing a clock trigger that will schedule your global function to run whenever there are any pending messages.
      *
      * ***Please note:** the log you pass as an argument to ```commitPendingMessagesToLog``` should match the log passed into the ```commitToLog``` method.
  * 
 */
function documentation(){
  console.log('This method is unimplemented.')
}

/** 
 * You can write any number of messages to the log before calling commit.
 * 
 * #### Write to the log
 * ```
 * const logger = SpreadsheetLogger
 * // collect some messages to be appended to the log later
 * logger.write('Hello world')
 * logger.write('It is a good day!')
 * logger.write('Bye bye!')
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
 * @param {SpreadsheetApp.Sheet} logSheet The first column of the log sheet should be for timestamps, the second column is for a message. The written timestamps and messages will be appended to the end of the sheet. 
 * @param {LockService.Lock} userProvidedLock
 * @param {string} processPendingMessages The name of the function that will be responsible for appending pending messages to the log. See the documentation method for more details.
 */
function commitToLog(logSheet, userProvidedLock, processPendingMessages){
  SpreadsheetLog_.makeLog(logSheet, userProvidedLock, processPendingMessages)
    .append(stagingArea.getMessagesOut())
}

/**
 * Appends messages from the pending message queue onto the spreadsheet log. To get pending messages, pass in the same sheet you used in the ```commitToLog``` function.
 * 
 * This method will write as many pending messages as possible to the log and set up a trigger to write additional messages if need be.
 * 
 * *See the documentation method for an example of how to implement this method.*
 * 
 * @param {object} e Clock trigger event object
 * @param {string} e.triggerUid The unique id for the trigger
 * @param {SpreadsheetApp.Sheet} logSheet Should match the sheet you used in ```commitToLog```. Pending messages will be appended to the end of the sheet. 
 * @param {LockService.Lock} userProvidedLock A lock that will be used to prevent concurrent writes to the sheet.
 * @param {string} processPendingMessages The name of the function that will be responsible for appending pending messages to the log. The function should call this method inside it's body.
 */
function commitPendingMessagesToLog(e, logSheet, userProvidedLock, processPendingMessages){
  SpreadsheetLog_.appendPendingMessages(e, logSheet, userProvidedLock, processPendingMessages)
}
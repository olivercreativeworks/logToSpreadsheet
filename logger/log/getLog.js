function getLog(){
  const log = getLogSheet()
  const pendingMessageQueue = getPendingMessagesQueue()
  const scheduler = getJobScheduler()
  const lockManager = getLockManager()
  return {
    append: append
  }

  function append(messages){
    if(!messagesAreValid(messages)) {
      return console.warn(`Messages are invalid. Messages must be an array of string tuples: [string, string][].\n Please correct your messages:\n${JSON.stringify(messages)}`)
    }
    lockManager.handleScriptLock( 
      () => appendToLog(messages), 
      () => addToPendingMessageQueue(messages),
    )
  }

  /** @param {LogMessage[]} messages */
  function addToPendingMessageQueue(messages){
    console.log('Saving messages to pending message queue')
    pendingMessageQueue.addMessages(messages)
    scheduler.scheduleJob({job:appendPendingMessages.name, minutesFromNow:1})
  }

  /** @param {LogMessage[]} messages */
  function appendToLog(messages){
    console.log('Attempting to append to log')
    log.append(messages)
  }

  /**
   * @param {unknown} [messages]
   * @return {messages is LogMessage}
   */
  function messagesAreValid(messages){
    return messages && 
      Array.isArray(messages) && 
      messages.length > 0 && 
      messages.every(entry => Array.isArray(entry) && entry.length === 2)
  }
}

function appendPendingMessages({triggerUid}){
  getLog().append(getPendingMessagesQueue().getMessagesOut())
  getJobScheduler().deleteScheduledJob(triggerUid)
}
function logToSpreadsheet(){
  // add to staging
  // add to pending
  // add to log
  const stagingArea = getStagingArea()
  const pendingMessageQueue = getPendingMessagesQueue()
  const lockManager = getLockManager()
  const log = getLog()
  
  return {
    /** 
     * The first method you should call.
     * @param {string} message 
     */
    writeMessagesToStagingArea:(message) => stagingArea.stageMessage(message),
    /** Call this after writing some messages to the staging area */
    commitStagedMessages:() => commitMessages(stagingArea.getMessagesOut()),
    /** This is here to be called by a global trigger function. Pending messages are staged messages that could not be written to the log and were stored elsewhere to be written to the log later.*/
    commitPendingMessages:() => commitMessages(pendingMessageQueue.getMessagesOut())
  }

  /** @param {LogMessage[]} messages */
  function commitMessages(messages){
    console.log('Attempting to commit messages')
    if(!messagesAreValid(messages)) {
      return console.warn(`Messages are invalid:\n${messages}`)
    }
    lockManager.handleScriptLock( 
      () => log.append(messages), 
      () => pendingMessageQueue.addMessages(messages)
        .scheduleJob({job:commitPendingMessages.name, minutesFromNow:1}),
    )
  }
  /**
   * @param {unknown} [messages]
   * @return {messages is []}
   */
  function messagesAreValid(messages){
    return messages && Array.isArray(messages) && messages.length > 0
  }
}

function commitPendingMessages(){
  logToSpreadsheet().commitPendingMessages()
}
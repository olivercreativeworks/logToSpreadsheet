function getStagingArea_(){
  let stagedMessages = []
  return {
    stageMessage: stageMessage,
    getMessagesOut: getMessagesOutOfStaging
  }

  /**
   * Adds a timestamp to the message and saves it to the staged messages
   * @param {string | Error} message 
   */
  function stageMessage(message){
    stagedMessages.push(addTimestamp(message))
  }

  /**
   * Returns currently staged messages and clears the staging area (i.e. removes the messages from staging)
   */
  function getMessagesOutOfStaging(){
    try{
      return stagedMessages
    }finally{
      stagedMessages = []
    }
  }

  /**
   * Returns a date string and the input message.
   * @param {string | Error} message
   * @return {LogMessage}
   */
  function addTimestamp(message){
    return [new Date().toString(), message instanceof Error ? formatErrorLogMessage(message) : message]
  }

  /** 
   * @param {Error & Partial<{details:object}>} err - The errors thrown by the Google services sometimes have a details property with additional information.
   */
  function formatErrorLogMessage(err){
    return `Name: ${err.name}\nMessage: ${err.message}\n${err.stack}${err.details ? '\nDetails: ' + JSON.stringify(err.details) : ''}`
  }
}
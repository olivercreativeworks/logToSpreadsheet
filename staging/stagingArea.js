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
    const stagedMessage = formatMessage(message)
    stagedMessages.push(addTimestamp(stagedMessage))
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

  function formatMessage(message){
    if(typeof message === "string") return message
    if(isError(message)) return `There was an error.\n${formatErrorLogMessage(message)}\n`
    return JSON.stringify(message)
  }

  /** 
   * Tests to see if a message is an error by checking some common properties (name, message, and stack).
   * 
   * Using ```message instanceof Error``` does not work for errors passed in from other script environments. This is because each script has its own global object with its own Error constructor. Since errors created in other scripts were not created with this script's Error constructor, the ```message instance of Error``` check fails.
   * 
   * See reference: https://vercel.com/docs/workflow-collaboration/conformance/rules/NO_INSTANCEOF_ERROR
   * @param {unknown} message
   * @return {message is Error}
   */
  function isError(message){
    return message && isString(message.name) && isString(message.message) && isString(message.stack)

    function isString(x){
      return typeof x === "string"
    }
  }

  /** 
   * @param {Error & Partial<{details:object, cause:object}>} err The errors thrown by the Google services sometimes have a ```details``` property with additional information. Errors may also have a ```cause``` property if you defined one (see reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause).
   */
  function formatErrorLogMessage(err){
    const errorLogs = [
      '\nERROR',
      err.stack,
      err.details ? `Details: ${JSON.stringify(err.details)}` : '',
      err.cause ? `Cause: ${isError(err.cause) ? `ERROR\n${formatErrorLogMessage(err.cause)}` : JSON.stringify(err.cause)}` : ''
    ]
    return errorLogs.filter(x => x).join('\n')
  }

  /**
   * Returns a date string and the input message.
   * @param {string | Error} message
   * @return {LogMessage}
   */
  function addTimestamp(message){
    return [new Date().toString(), message]
  }
}
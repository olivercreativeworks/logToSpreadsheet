/**
 * Returns a queue that can add messages to or return stored messages from the properties service. The queue makes use of **user lock to manage concurrent reads and writes**.
 */
function getPendingMessagesQueue(){
  const props = PropertiesService.getScriptProperties()
  const pendingMessageSymbol = 'messageKey'
  const lockManager = getLockManager()
  return {
    getMessagesOut: getMessagesOutOfQueue,
    addMessages: addToQueue,
  }
  
  /**
   * Returns currently queued messages and clears the queue. Returns null if no messages are found. 
   * 
   * **Uses a user lock to prevent concurrent reads and writes** 
   */
  function getMessagesOutOfQueue(){
    return lockManager.handleUserLock(() => {
      try{
        return getMessages()
      }finally{
        clearQueue()
      }
    })
  }

  /** 
   * Returns null if no messages are pending. 
   * @return {LogMessage[] | null} 
   */
  function getMessages(){
    console.log('Retrieving pending messsages.')
    return JSON.parse(props.getProperty(pendingMessageSymbol))
  }
  
  function clearQueue(){
    props.deleteProperty(pendingMessageSymbol)
    console.log('Deleted pending messages')
  }

  /**  
   * Adds a message to the queue. 
   * 
   * **Uses a user lock to prevent concurrent reads and writes**
   * @param {LogMessage[]} messages
   */
  function addToQueue(messages){
    console.warn('Adding message to pending message queue...')
    lockManager.handleUserLock(() => {
      console.log(messages)
      const savedMessages = getMessages() || []
      props.setProperty(pendingMessageSymbol, JSON.stringify([...savedMessages, ...messages]))
      console.log('Added message to queue')
    })
  }
}
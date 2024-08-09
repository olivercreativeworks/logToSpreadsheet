/**
 * Returns a queue that can add messages to or return stored messages from the properties service. The queue makes use of **user lock to manage concurrent reads and writes**.
 */
function getPendingMessagesQueue_(){
  const props = PropertiesService.getScriptProperties()
  const pendingMessageSymbol = 'messageKey'
  return {
    getMessagesOut: getMessagesOutOfQueue,
    addMessages: addToQueue,
  }
  
  /**
   * Returns currently queued messages and clears the queue. Returns null if no messages are found. 
   * 
   * **Uses a user lock to prevent concurrent reads and writes** 
   * @param {string} id
   */
  function getMessagesOutOfQueue(id){
    try{
      return getMessages(id)
    }finally{
      clearQueue(id)
    }
  }

  /** 
   * Returns null if no messages are pending.
   * @param {string} id
   * @return {LogMessage[] | null} 
   */
  function getMessages(id){
    console.log('Retrieving pending messsages.')
    return JSON.parse(props.getProperty(makePendingMessageSymbol(id)))
  }
  
  /**
   * @param {string} id
   */
  function makePendingMessageSymbol(id){
    return pendingMessageSymbol + id
  }

  /** @param {string} id */
  function clearQueue(id){
    props.deleteProperty(makePendingMessageSymbol(id))
    console.log('Deleted pending messages')
  }

  /**  
   * Adds a message to the queue. 
   * 
   * **Uses a user lock to prevent concurrent reads and writes**
   * @param {LogMessage[]} messages
   * @param {string} id The id messages should be stored under.
   */
  function addToQueue(messages, id){
    console.warn(`Adding message to pending message queue...:\n${messages}`)
    const savedMessages = getMessages() || []
    props.setProperty(makePendingMessageSymbol(id), JSON.stringify([...savedMessages, ...messages]))
    console.log('Added message to queue')
  }
}
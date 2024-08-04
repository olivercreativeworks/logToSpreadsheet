function getPendingMessagesQueue(){
  const props = PropertiesService.getScriptProperties()
  const pendingMessageSymbol = 'messageKey'
  const lockManager = getLockManager()
  return {
    getMessagesOut: getMessagesOutOfQueue,
    addMessages: addToQueue,
  }

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
   * @param {LogMessage[]} messages
   */
  function addToQueue(messages){
    console.warn('Saving pending messages...')
    lockManager.handleUserLock(() => {
      addMessages(messages)
    })
  }

  /** @param {LogMessage[]} messages */
  function addMessages(messages){
    console.log(messages)
    const savedMessages = getMessages() || []
    props.setProperty(pendingMessageSymbol, JSON.stringify([...savedMessages, ...messages]))
    console.log('Saved messages')
  }
}
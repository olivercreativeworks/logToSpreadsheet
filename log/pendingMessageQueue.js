function getPendingMessagesQueue(){
  const props = PropertiesService.getScriptProperties()
  const pendingMessageSymbol = 'messageKey'
  const scheduler = getScheduler()
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
        scheduler.deleteScheduledJob()
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
    return {
      /**
       * Schedules a job that runs after the specified number of minutes. Note that only one job can be scheduled at a time for the entire script. After that job runs, a new job can be scheduled.
       * @param {object} details
       * @param {string} details.job - The name of the function you want to run. The function should be in the global scope.
       * @param {number} details.minutesFromNow - How many minutes from the time this function is called you want the function to run.
       */
      scheduleJob: ({job, minutesFromNow}) => {
        console.warn('Saving pending messages...')
        lockManager.handleUserLock(() => {
          addMessages(messages)
          if(scheduler.hasSchedule()) return
          scheduler.scheduleJob({job:job, minutesFromNow:minutesFromNow}) 
        })
      }
    }
  }

  /** @param {LogMessage[]} messages */
  function addMessages(messages){
    const savedMessages = getMessages() || []
    props.setProperty(pendingMessageSymbol, JSON.stringify([...savedMessages, ...messages]))
    console.log('Saved messages')
  }

}
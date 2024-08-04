function logToSpreadsheet(){
  const stagingArea = getStagingArea()
  const log = getLog()  
  return {
    write: write,
    commit: commit,
  }
  /** 
   * The first method you should call.
   * @param {string} message 
   */
  function write(message){
    stagingArea.stageMessage(message)
  }
  /** Call this after writing some messages to the staging area */
  function commit(){
    log.append(stagingArea.getMessagesOut())
  }
}
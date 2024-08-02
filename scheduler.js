function getScheduler(){
  const props = PropertiesService.getScriptProperties()
  const scheduleSymbol = 'messageKeyTrigger'
  return {
    hasSchedule: hasSchedule,
    getScheduleId: getScheduleId,
    scheduleJob: scheduleJob,
    deleteScheduledJob: deleteSchedule
  }
  function hasSchedule(){
    return !!(getSchedule())
  }
  function getScheduleId(){
    return props.getProperty(scheduleSymbol)
  }
  /** 
   * @param {object} details
   * @param {string} details.job - The name of the function you want to schedule to be run. The function should be in the global scope.
   * @param {number} details.minutesFromNow - How many minutes from the time this function is called you want the function to run.
   */   
  function scheduleJob({job, minutesFromNow}){
    const schedule = ScriptApp.newTrigger(job)
      .timeBased()
      .after(1000 * 60 * minutesFromNow)
      .create()
    saveScheduleId(schedule.getUniqueId())
    console.log(`Created scheduled job with id: ${schedule.getUniqueId()}`)
    return schedule
  }
  function saveScheduleId(id){
    props.setProperty(scheduleSymbol, id)
  }
  function deleteSchedule(){
    const schedule = getSchedule()
    if(schedule) ScriptApp.deleteTrigger(schedule)
    props.deleteProperty(scheduleSymbol)
    console.log('Deleted schedule')
  }
  function getSchedule(){
    const scheduleId = getScheduleId()
    return ScriptApp.getProjectTriggers().find(trigger => trigger.getUniqueId() === scheduleId)
  }
}
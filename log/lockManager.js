/**
 * Manages creating and releasing locks to manage concurrent requests.
 */
function getLockManager_(){
  return {
    handleScriptLock: handleScriptLock,
    handleUserLock: handleUserLock,
  }

  /**
   * @template A, B
   * @param {() => A} onSuccess
   * @param {() => B} onFailure
   */
  function handleScriptLock(onSuccess, onFailure){
    return handleLock(LockService.getScriptLock(), onSuccess, onFailure)
  }

  /** 
   * @template A
   * @param {() => A} onSuccess
   * @return {A | void}
   */
  function handleUserLock(onSuccess){
    return handleLock(LockService.getUserLock(), onSuccess)
  }

  /**
   * @template A, B
   * @param {LockService.Lock} lock
   * @param {() => A} onSuccess
   * @param {() => B} onFailure
   * @param {number} waitTimeInMilliseconds
   * @return {A | B}
   */
  function handleLock(lock, onSuccess, onFailure = () => console.log('Took too long to acquire lock'), waitTimeInMilliseconds = 1000 * 60 * 1) {

    console.log(`Attempting to acquire lock`)
    const success = lock.tryLock(waitTimeInMilliseconds);
    if(!success) return onFailure()
    
    console.log(`Acquired lock`)
    try {
      return onSuccess();
    } finally {
      lock.releaseLock();
      console.log(`Released lock`)
    }
  }
}
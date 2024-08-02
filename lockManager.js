function getLockManager(){
  return {
    handleScriptLock: handleScriptLock,
    handleUserLock: handleUserLock
  }
  /**
   * @template A, B
   * @param {() => A} onSuccess
   * @param {() => B} onFailure
   */
  function handleScriptLock(onSuccess, onFailure){
    return handleLock("script", onSuccess, onFailure)
  }

  /** @param {() => void} onSuccess */
  function handleUserLock(onSuccess){
    return handleLock("user", onSuccess)
  }

  /**
   * @template A, B
   * @param {"user" | "script"} lockType
   * @param {() => A} onSuccess
   * @param {() => B} onFailure
   * @param {number} timeInMilliseconds
   * @param {number} retries
   * @return {A | B}
   */
  function handleLock(lockType, onSuccess, onFailure = () => console.log('Took too long to acquire lock'), timeInMilliseconds = 1000 * 60 * 3) {
    /** @type {Record<lockType, () => LockService.Lock>} */
    const locks = {
      user: LockService.getUserLock,
      script:LockService.getScriptLock
    }
    const lock = locks[lockType]()
    console.log(`Attempting to acquire lock: ${lockType}`)
    const success = lock.tryLock(timeInMilliseconds);
    if(!success) return onFailure()
    
    console.log(`Acquired lock: ${lockType}`)
    try {
      return onSuccess();
    } finally {
      lock.releaseLock();
      console.log(`Released lock: ${lockType}`)
    }
  }
}